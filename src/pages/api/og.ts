/**
 * /api/og — Endpoint serverless que genera OG images dinámicas
 *
 * Uso: /api/og?title=Mi%20Post&description=Texto%20del%20post
 *
 * Requiere:
 * - Vercel (sirve endpoints serverless automáticamente)
 * - @vercel/og (instalado)
 */
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const title = url.searchParams.get('title') || 'TecnoDespegue';
  const description = url.searchParams.get('description') || 'Ingeniería de software & automatización con IA';
  const category = url.searchParams.get('category') || '';
  const author = url.searchParams.get('author') || 'René Kuhm';

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'linear-gradient(135deg, #0a0508 0%, #1a0a14 50%, #0a0508 100%)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          padding: '60px',
          justifyContent: 'space-between',
          position: 'relative',
        },
        children: [
          // Top: brand + category
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 28,
                color: '#FFD75A',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              },
              children: [
                '✦ TECNODESPEGUE',
                category ? `· ${category.toUpperCase()}` : '',
              ],
            },
          },
          // Middle: title + description
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                flex: 1,
                justifyContent: 'center',
                paddingTop: '40px',
                paddingBottom: '40px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 72,
                      fontWeight: 900,
                      color: 'white',
                      lineHeight: 1.05,
                      letterSpacing: '-0.02em',
                      maxWidth: '900px',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 28,
                      color: 'rgba(255, 255, 255, 0.6)',
                      lineHeight: 1.4,
                      maxWidth: '900px',
                    },
                    children: description.length > 180 ? description.slice(0, 180) + '...' : description,
                  },
                },
              ],
            },
          },
          // Bottom: author + URL
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.5)',
              },
              children: [
                author,
                'tecnodespegue.com',
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
    }
  );
};
