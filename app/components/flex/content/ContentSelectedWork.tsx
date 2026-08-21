import { Link } from 'react-router'
import { Animated } from '~/components/elements/Animated'
import Image from '~/components/elements/Image'
import SectionCard from '~/components/elements/SectionCard'
import { EXPERIENCES, type Experience, type ExperienceProject } from '~/database/experiences'

type SelectedTile = {
  image: string
  title: string
  width: number
  height: number
  description: string
}

function toTile(item: Experience | ExperienceProject): SelectedTile {
  return {
    image: item.image,
    title: item.title,
    width: item.width,
    height: item.height,
    description: item.description
  }
}

const ubo = EXPERIENCES[0]
const tweedeKamer = EXPERIENCES[1]?.projects?.[0]
const enhance = EXPERIENCES[1]?.projects?.[1]

const SELECTED: SelectedTile[] = [ubo, tweedeKamer, enhance]
  .filter((item): item is Experience | ExperienceProject => Boolean(item))
  .map(toTile)

const TILE_DELAYS = [200, 300, 400] as const

export default function ContentSelectedWork() {
  return (
    <SectionCard tone="cyan" id="content-selected-work" innerClassName="px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
      <div className="flex flex-col gap-10">
        <Animated delay={100}>
          <h2 className="title-section">Selected work</h2>
        </Animated>
        <ul className="grid gap-4 lg:grid-cols-3">
          {SELECTED.map((item, index) => (
            <li key={item.title}>
              <Animated delay={TILE_DELAYS[index] ?? 400}>
                <Link
                  to="/experience/"
                  className="flex h-full flex-col gap-4 rounded-2xl bg-site-cream p-6 text-site-cream-fg smooth hover:ring-2 hover:ring-site-gold"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={item.width}
                    height={item.height}
                    className="h-16 w-auto max-w-40 object-contain object-left"
                  />
                  <h3 className="title-xs">{item.title}</h3>
                  <p className="content-s grow text-site-cream-fg/80">{item.description}</p>
                  <span className="text-sm font-semibold text-site-cyan">View experience →</span>
                </Link>
              </Animated>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}
