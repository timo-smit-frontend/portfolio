/**
 * Cloudflare Pages middleware: Dutch by default for visitors in the Netherlands.
 *
 * A first visit to an English page (no language chosen yet) from the Netherlands goes to the same page in
 * Dutch. Everyone else gets English, the default. Choosing a language in the switch sets the `ts-lang` cookie,
 * which always wins. Dutch URLs are never redirected (a Dutch link shared abroad stays Dutch), and crawlers are
 * never redirected, so the English pages stay indexable (hreflang links connect both languages).
 */

const LANG_COOKIE = 'ts-lang'
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|pagespeed|headless/i

type Context = {
  request: Request & { cf?: { country?: string } }
  next: () => Promise<Response>
}

export const onRequest = async ({ request, next }: Context): Promise<Response> => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next()
  const url = new URL(request.url)
  const path = url.pathname
  // Only page loads: not assets or files, not pages that are already Dutch.
  if (path === '/nl' || path.startsWith('/nl/')) return next()
  if (/\.[a-z0-9]+$/i.test(path)) return next()
  if (!(request.headers.get('accept') ?? '').includes('text/html')) return next()
  if (BOT.test(request.headers.get('user-agent') ?? '')) return next()
  if (new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=`).test(request.headers.get('cookie') ?? '')) return next()
  if (request.cf?.country !== 'NL') return next()

  const target = new URL(`/nl${path === '/' ? '/' : path}${url.search}${url.hash}`, url)
  return new Response(null, {
    status: 302,
    headers: { Location: target.toString(), 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
  })
}
