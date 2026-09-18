// =============================================================================
// GeoLogística — Edge Function: resolve-link
// -----------------------------------------------------------------------------
// Resuelve enlaces cortos de Google Maps (maps.app.goo.gl / goo.gl/maps) del
// lado del servidor, siguiendo la redirección HTTP que Google devuelve, y
// extrayendo coordenadas del encabezado `Location`. Se ejecuta como Supabase
// Edge Function (Deno) para no exponer ninguna clave privada al navegador y
// para evitar depender de scraping del contenido de la página (técnica
// frágil y no autorizada): solo se lee el encabezado de redirección HTTP,
// que es información pública de enrutamiento.
//
// Despliegue:
//   supabase functions deploy resolve-link
//
// Si en el futuro se requiere geocodificación adicional (por ejemplo, para
// obtener el nombre/dirección de un lugar cuando la redirección solo trae
// coordenadas), esta función es el lugar indicado para llamar a un servicio
// de geocodificación del lado del servidor (p. ej. Nominatim de OpenStreetMap).
// =============================================================================

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — este archivo corre en el runtime Deno de Supabase Edge Functions,
// no en el proyecto Vite/TypeScript del frontend (que usa lib DOM/ES2020).

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractCoordsFromRedirect(redirectUrl: string): { lat: number; lng: number } | null {
  const exact = redirectUrl.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (exact) return { lat: Number(exact[1]), lng: Number(exact[2]) };

  const at = redirectUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (at) return { lat: Number(at[1]), lng: Number(at[2]) };

  const search = redirectUrl.match(/\/maps\/search\/(-?\d+(?:\.\d+)?),\+?\s*(-?\d+(?:\.\d+)?)/);
  if (search) return { lat: Number(search[1]), lng: Number(search[2]) };

  const q = new URL(redirectUrl).searchParams.get('q');
  if (q) {
    const m = q.match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
    if (m) return { lat: Number(m[1]), lng: Number(m[2]) };
  }

  return null;
}

function extractPlaceName(redirectUrl: string): string | null {
  const match = redirectUrl.match(/\/maps\/place\/([^/]+)\//);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).replace(/\+/g, ' ');
  } catch {
    return match[1].replace(/\+/g, ' ');
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Falta el parámetro "url".' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const allowedHosts = ['maps.app.goo.gl', 'goo.gl'];
    const parsed = new URL(url);
    if (!allowedHosts.includes(parsed.hostname)) {
      return new Response(
        JSON.stringify({ error: 'Solo se aceptan enlaces cortos de maps.app.goo.gl o goo.gl/maps.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const response = await fetch(url, { method: 'GET', redirect: 'manual' });
    const location = response.headers.get('location');

    if (!location) {
      return new Response(
        JSON.stringify({
          error: `El enlace no devolvió una redirección (status ${response.status}). Puede haber expirado o ser inválido.`,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const coords = extractCoordsFromRedirect(location);
    const name = extractPlaceName(location);

    if (!coords) {
      return new Response(
        JSON.stringify({
          error: 'El enlace redirige a una página de Google Maps sin coordenadas identificables en la URL.',
          resolvedUrl: location,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        latitude: coords.lat,
        longitude: coords.lng,
        name,
        address: null,
        resolvedUrl: location,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Error interno al resolver el enlace.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
