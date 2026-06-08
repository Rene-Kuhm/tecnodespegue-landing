import type { APIRoute } from 'astro';

export const prerender = false;

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await request.json();
  } catch {
    // The pixel uses sendBeacon. If the browser sends an empty or malformed body,
    // keep the endpoint non-blocking so analytics never affects the landing.
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
};
