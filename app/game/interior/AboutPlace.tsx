import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import Image from '~/components/elements/Image'
import { contactPath } from '~/components/layout/nav'
import GameDialog from '~/game/interior/GameDialog'
import InteriorLayout, { ROOM_HINT_ID, useHashItem, useLeave } from '~/game/interior/InteriorLayout'
import { useCompanion, useProgress } from '~/game/progress'
import PixelSprite from '~/game/PixelSprite'
import Room, { type Furniture, type WallDecor } from '~/game/Room'
import { PIP_PALETTE, PIP_SIT } from '~/game/sprites'
import { useLocale } from '~/i18n/useLocale'

export const BRAND_LOGOS = [
  { src: '/images/logo/ubo.png', title: 'UBO Agency', width: 310, height: 163 },
  { src: '/images/logo/casio.svg', title: 'Casio', width: 177, height: 32 },
  { src: '/images/logo/fairbanks.svg', title: 'Fairbanks', width: 158, height: 31 },
  { src: '/images/logo/movimento.svg', title: 'Movimento', width: 178, height: 34 },
  { src: '/images/logo/brouwer-metaal.svg', title: 'Brouwer Metaal', width: 294, height: 35 },
  { src: '/images/logo/im-duurzaam.svg', title: 'IM Duurzaam', width: 473, height: 380 },
  { src: '/images/logo/profield.svg', title: 'Profield', width: 845, height: 178 },
  { src: '/images/logo/capgemini.svg', title: 'Capgemini', width: 1024, height: 239 },
  { src: '/images/logo/wfp.webp', title: 'World Food Programme', width: 360, height: 167 },
  { src: '/images/logo/tweede-kamer.png', title: 'Tweede Kamer der Staten-Generaal', width: 1200, height: 339 },
  { src: '/images/logo/accent-interactive.png', title: 'Accent Interactive', width: 4500, height: 1458 },
  { src: '/images/logo/smart-hotel.png', title: 'SmartHOTEL', width: 1000, height: 215 }
]

const DECOR: WallDecor[] = [
  { kind: 'frame', x: 3, color: '#e4b84a' },
  { kind: 'window', x: 4 },
  { kind: 'clock', x: 8 }
]

type Panel = 'story' | 'brands'

export default function AboutPlace() {
  const { locale, t } = useLocale()
  const [open, setOpen] = useState<Panel | null>(null)
  const leave = useLeave()
  const companion = useCompanion()
  const { discover } = useProgress()
  // Using the desk or bookcase in the room counts for the quest; reading again does not.
  const interactPanel = (panel: Panel) => {
    setOpen(panel)
    discover(`about:${panel}`)
  }
  useHashItem((hash) => {
    if (hash !== 'story' && hash !== 'brands') return false
    setOpen(hash)
    return true
  })

  const furniture = useMemo<Furniture[]>(
    () => [
      // Living corner: sofa facing a coffee table on a rug.
      { id: 'rug', kind: 'rug', x: 7, y: 4, w: 4, h: 3, color: '#2f7f8a', interactive: false },
      { id: 'sofa', kind: 'sofa', x: 8, y: 4, w: 2, color: '#a84552', interactive: false },
      { id: 'coffee-table', kind: 'table', x: 8, y: 6, w: 2, interactive: false },
      // Sleeping corner.
      { id: 'bed', kind: 'bed', x: 1, y: 2, w: 2, h: 2, color: '#35589c', interactive: false },
      { id: 'nightstand', kind: 'nightstand', x: 3, y: 2, interactive: false },
      // Work corner: the desk holds the story, the cabinet the brands.
      { id: 'story', kind: 'desk', x: 6, y: 2, w: 2, label: t.game.story },
      { id: 'desk-chair', kind: 'officeChair', x: 6, y: 3, w: 2, interactive: false },
      { id: 'plant', kind: 'plant', x: 8, y: 2, interactive: false },
      // The fireplace under the chimney you see from the street.
      { id: 'fireplace', kind: 'fireplace', x: 9, y: 2, w: 2, interactive: false },
      { id: 'brands', kind: 'trophies', x: 11, y: 2, label: t.game.collabs },
      { id: 'plant-2', kind: 'plant', x: 1, y: 7, interactive: false },
      { id: 'plant-3', kind: 'plant', x: 11, y: 7, interactive: false }
    ],
    [t]
  )

  const closeIf = (panel: Panel) => () => setOpen((current) => (current === panel ? null : current))

  return (
    <InteriorLayout
      place="about"
      intro={t.game.roomHint.about}
      quests={[
        { id: 'story', items: [{ id: 'about:story', label: t.game.story, onOpen: () => setOpen('story') }] },
        { id: 'brands', items: [{ id: 'about:brands', label: t.game.collabs, onOpen: () => setOpen('brands') }] }
      ]}
      room={
        <Room
          cols={13}
          rows={9}
          wall="#74503a"
          floor="#a5774a"
          furniture={furniture}
          decor={DECOR}
          spawnX={6}
          label={t.game.places.about}
          describedBy={ROOM_HINT_ID}
          exitLabel={t.game.backToTown}
          companion={companion}
          onSelect={(id) => (id === 'story' || id === 'brands') && interactPanel(id)}
          onExit={leave}
        />
      }
    >
      <GameDialog open={open === 'story'} onClose={closeIf('story')} eyebrow={t.game.places.about} title={t.game.story}>
        <div className="flex flex-col gap-8">
          {/* Player card */}
          <div className="grid gap-6 border-[3px] border-px-ink/15 bg-white/60 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center">
            {/* Portrait in a game frame: ink, gold, ink, with a hard drop shadow. The photo (1186 x 1500) loses
                15% at the top and 20% at the bottom: 975 px tall, positioned at 15 / 35 of the overflow. */}
            <div className="border-[3px] border-px-ink bg-site-gold p-[3px] shadow-[0_6px_0_0_rgb(31_36_51/0.22)]">
              <Image
                src="/images/timosmit-geslaagd.webp"
                alt={t.game.cardPhotoAlt}
                width={1186}
                height={1500}
                maxwidth={1200}
                sizes="(min-width: 768px) 20rem, 90vw"
                className="block aspect-[1186/975] h-auto w-full border-[3px] border-px-ink object-cover object-[50%_42.857%]"
              />
            </div>
            <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2">
              <dt className="arcade text-[0.55rem] text-px-red">{t.game.player}</dt>
              <dd className="font-site-pixel text-xl font-semibold">Timo Smit</dd>
              <dt className="arcade text-[0.55rem] text-px-red">{t.game.role}</dt>
              <dd className="text-base">{t.seo.jobTitle}</dd>
              <dt className="arcade text-[0.55rem] text-px-red">{t.game.location}</dt>
              <dd className="text-base">{t.game.locationValue}</dd>
              <dt className="arcade text-[0.55rem] text-px-red">{t.game.companion}</dt>
              <dd className="flex items-center gap-2 text-base">
                <PixelSprite rows={PIP_SIT} palette={PIP_PALETTE} scale={2} className="shrink-0" />
                {t.game.companionValue}
              </dd>
            </dl>
          </div>
          <div className="prose-paper">
            {t.story.paragraphs.map((html) => (
              <p key={html.slice(0, 24)} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t-[3px] border-px-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-site-pixel text-lg font-semibold">{t.cta.title}</p>
            <Link to={`${contactPath(locale)}#letter`} className="button-gold">
              {t.nav.getInTouch}
            </Link>
          </div>
        </div>
      </GameDialog>

      <GameDialog open={open === 'brands'} onClose={closeIf('brands')} eyebrow={t.game.places.about} title={t.game.collabs}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BRAND_LOGOS.map((logo) => (
            <li key={logo.src} className="item-slot h-24 [--surface-bg:#fff] [--surface-ring:inset_0_0_0_2px_rgb(31_36_51/0.14)]">
              <Image
                src={logo.src}
                alt={logo.title}
                width={logo.width}
                height={logo.height}
                sizes="10rem"
                className="max-h-14 w-auto object-contain"
              />
            </li>
          ))}
        </ul>
      </GameDialog>
    </InteriorLayout>
  )
}
