import { createHash, randomUUID } from 'node:crypto';

declare const process: {
  env: Record<string, string | undefined>;
};

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: {
    remoteAddress?: string;
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type EventBody = {
  event?: string;
  properties?: Record<string, unknown>;
  customer?: {
    email?: string;
    phone?: string;
    external_id?: string;
  };
};

const TIKTOK_ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const PIXEL_ID = process.env.TIKTOK_PIXEL_ID || 'D8AARK3C77U6KT5BPNHG';

function getHeader(req: VercelRequest, name: string): string {
  const value = req.headers[name] || req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function firstForwarded(value: string): string {
  return value.split(',')[0]?.trim() || '';
}

function sha256(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash('sha256').update(normalized).digest('hex');
}

function getCookie(cookieHeader: string, name: string): string | undefined {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function allowedEvent(event: string | undefined): event is string {
  return ['ViewContent', 'Search', 'Contact', 'ClickButton', 'Lead'].includes(event || '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.tecnodespegue.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).json(null);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(202).json({ ok: false, missing: 'TIKTOK_ACCESS_TOKEN' });
  }

  const body = typeof req.body === 'string'
    ? JSON.parse(req.body) as EventBody
    : req.body as EventBody;

  if (!allowedEvent(body.event)) {
    return res.status(400).json({ ok: false });
  }

  const properties = body.properties || {};
  const cookieHeader = getHeader(req, 'cookie');
  const eventId = String(properties.event_id || randomUUID());
  const url = String(properties.url || getHeader(req, 'referer') || 'https://www.tecnodespegue.com');
  const ttclid = new URL(url).searchParams.get('ttclid') || undefined;
  const ip = firstForwarded(getHeader(req, 'x-forwarded-for')) || req.socket?.remoteAddress;

  const payload = {
    event_source: 'web',
    event_source_id: PIXEL_ID,
    data: [
      {
        event: body.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        user: {
          email: sha256(body.customer?.email),
          phone: sha256(body.customer?.phone),
          external_id: sha256(body.customer?.external_id),
          ip,
          user_agent: getHeader(req, 'user-agent'),
          ttclid,
          ttp: getCookie(cookieHeader, '_ttp')
        },
        properties: {
          ...properties,
          event_id: eventId,
          url
        },
        page: {
          url,
          referrer: getHeader(req, 'referer')
        }
      }
    ]
  };

  const response = await fetch(TIKTOK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return res.status(202).json({ ok: false, status: response.status });
  }

  return res.status(200).json({ ok: true });
}
