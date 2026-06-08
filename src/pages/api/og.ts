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
  const variant = url.searchParams.get('variant') || 'social';

  if (variant === 'cover') {
    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            backgroundImage: 'linear-gradient(135deg, #09090b 0%, #18070b 46%, #050505 100%)',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
                  backgroundSize: '72px 72px',
                  opacity: 0.45,
                },
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  width: 520,
                  height: 520,
                  right: -110,
                  top: -90,
                  borderRadius: 999,
                  background: 'radial-gradient(circle, rgba(237,29,36,0.42), transparent 66%)',
                },
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  width: 420,
                  height: 420,
                  left: -80,
                  bottom: -120,
                  borderRadius: 999,
                  background: 'radial-gradient(circle, rgba(248,180,0,0.26), transparent 68%)',
                },
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  inset: 58,
                  border: '2px solid rgba(248,180,0,0.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 44,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        color: '#fff',
                        fontSize: 24,
                        fontWeight: 900,
                        letterSpacing: '0.22em',
                      },
                      children: 'TD TECNODESPEGUE',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 28,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: 250,
                              height: 250,
                              border: '18px solid #ED1D24',
                              borderRightColor: '#F8B400',
                            },
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: 420,
                              height: 18,
                              background: 'linear-gradient(90deg, #F8B400, #ED1D24, transparent)',
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      { width: 1200, height: 630 }
    );
  }

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
