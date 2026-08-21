export const CONTACT_URL = '/contact/'
export const GET_IN_TOUCH = 'Get in touch'

export const PRIMARY_NAV = [
  { title: 'Experience', to: '/experience/' },
  { title: 'Education', to: '/education/' }
] as const

export const FOOTER_NAV = [...PRIMARY_NAV, { title: 'Contact', to: CONTACT_URL }] as const
