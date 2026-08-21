import { Link, useLocation } from 'react-router'
import { stripLocale } from '~/i18n/locale'
import { useLocale } from '~/i18n/useLocale'
import { cn } from '~/services/utils'

export type BreadcrumbItem = {
  title: string
  url?: string
}

function crumbsFromPath(
  pathname: string,
  homeTitle: string,
  pageTitles: Record<string, string>,
  localize: (path: string) => string
): BreadcrumbItem[] {
  const page = stripLocale(pathname)
  if (page === '/') return []

  const crumbs: BreadcrumbItem[] = [{ title: homeTitle, url: localize('/') }]
  const segments = page.split('/').filter(Boolean)

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1
    const url = localize(`/${segments.slice(0, index + 1).join('/')}/`)
    const title = pageTitles[segment] ?? segment
    crumbs.push(isLast ? { title } : { title, url })
  })

  return crumbs
}

export default function Breadcrumbs({ items, className }: { items?: BreadcrumbItem[]; className?: string }) {
  const { pathname } = useLocation()
  const { t, localize } = useLocale()
  const crumbs =
    items ??
    crumbsFromPath(
      pathname,
      t.nav.home,
      {
        experience: t.nav.experience,
        education: t.nav.education,
        contact: t.nav.contact
      },
      localize
    )

  if (crumbs.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', className)}>
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <li key={`${item.title}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden className="opacity-50">
                  /
                </span>
              )}
              {isLast || !item.url ? (
                <span aria-current={isLast ? 'page' : undefined} className={cn(isLast && 'font-medium')}>
                  {item.title}
                </span>
              ) : (
                <Link to={item.url} className="link-underline">
                  {item.title}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
