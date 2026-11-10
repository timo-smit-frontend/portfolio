import { PATHS } from '~/components/layout/nav'
import { stripLocale } from '~/i18n/locale'
import { ICON_ACADEMY, ICON_HOUSE, ICON_POST, ICON_TOWER, ICON_TOWN, type SpriteRows } from '~/game/sprites'
import type { PlaceId } from '~/game/world'

export type { PlaceId }

/** Hotbar order: also the 1 to 5 shortcut keys. */
export const PLACES: PlaceId[] = ['town', 'about', 'experience', 'education', 'contact']

export const PLACE_PATH: Record<PlaceId, string> = {
  town: PATHS.home,
  about: PATHS.about,
  experience: PATHS.experience,
  education: PATHS.education,
  contact: PATHS.contact
}

export const PLACE_ICON: Record<PlaceId, SpriteRows> = {
  town: ICON_TOWN,
  about: ICON_HOUSE,
  experience: ICON_TOWER,
  education: ICON_ACADEMY,
  contact: ICON_POST
}

/** The place a URL opens, or null for an unknown URL (404). */
export function placeFromPath(pathname: string): PlaceId | null {
  const page = stripLocale(pathname).replace(/\/$/, '') || '/'
  if (page === '/') return 'town'
  const match = PLACES.find((place) => place !== 'town' && PLACE_PATH[place].replace(/\/$/, '') === page)
  return match ?? null
}
