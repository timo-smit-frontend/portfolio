import { useMemo, useState } from 'react'
import InteriorLayout, { ROOM_HINT_ID, useHashItem, useLeave } from '~/game/interior/InteriorLayout'
import LetterDialog from '~/game/interior/LetterDialog'
import { useCompanion, useProgress } from '~/game/progress'
import Room, { type Furniture, type WallDecor } from '~/game/Room'
import { useLocale } from '~/i18n/useLocale'

const DECOR: WallDecor[] = [
  { kind: 'mailslots', x: 2 },
  { kind: 'clock', x: 6 },
  { kind: 'window', x: 8 }
]

export default function ContactPlace() {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const leave = useLeave()
  const companion = useCompanion()
  const { discover } = useProgress()
  // Writing at the post desk counts for the quest (the post box outside does too); reading again does not.
  const writeLetter = () => {
    setOpen(true)
    discover('contact:letter')
  }
  useHashItem((hash) => {
    if (hash !== 'letter') return false
    setOpen(true)
    return true
  })

  const furniture = useMemo<Furniture[]>(
    () => [
      // Behind the counter: the back room, stacked with parcels and crates waiting to go out.
      { id: 'parcels-1', kind: 'parcels', x: 1, y: 2, interactive: false },
      { id: 'parcels-2', kind: 'parcels', x: 2, y: 2, interactive: false },
      { id: 'parcels-3', kind: 'parcels', x: 3, y: 2, interactive: false },
      { id: 'crate-1', kind: 'crate', x: 4, y: 2, interactive: false },
      { id: 'crate-2', kind: 'crate', x: 8, y: 2, interactive: false },
      { id: 'parcels-4', kind: 'parcels', x: 9, y: 2, interactive: false },
      { id: 'parcels-5', kind: 'parcels', x: 10, y: 2, interactive: false },
      { id: 'crate-3', kind: 'crate', x: 1, y: 3, interactive: false },
      { id: 'parcels-6', kind: 'parcels', x: 3, y: 3, interactive: false },
      { id: 'parcels-7', kind: 'parcels', x: 9, y: 3, interactive: false },
      { id: 'crate-4', kind: 'crate', x: 10, y: 3, interactive: false },
      // The post desk in the middle of the room, with the clerk behind it. Talk to them to write your letter;
      // the post box itself hangs outside, by the front door.
      { id: 'clerk', kind: 'clerk', x: 6, y: 3, label: t.game.write },
      { id: 'counter', kind: 'counter', x: 4, y: 4, w: 5, label: t.game.write },
      // Customer side: a bench to wait on, a mat by the door.
      { id: 'bench', kind: 'bench', x: 9, y: 6, w: 2, interactive: false },
      { id: 'mat', kind: 'rug', x: 5, y: 6, w: 3, h: 1, color: '#a84552', interactive: false },
      { id: 'plant', kind: 'plant', x: 11, y: 2, interactive: false },
      { id: 'lamp', kind: 'lamp', x: 11, y: 4, interactive: false },
      { id: 'plant-2', kind: 'plant', x: 1, y: 7, interactive: false }
    ],
    [t]
  )

  return (
    <InteriorLayout
      place="contact"
      intro={t.game.roomHint.contact}
      quests={[{ id: 'letter', items: [{ id: 'contact:letter', label: t.game.write, onOpen: () => setOpen(true) }] }]}
      room={
        <Room
          cols={13}
          rows={9}
          wall="#6e4a44"
          floor="#b98c5d"
          furniture={furniture}
          decor={DECOR}
          spawnX={6}
          label={t.game.places.contact}
          describedBy={ROOM_HINT_ID}
          exitLabel={t.game.backToTown}
          companion={companion}
          onSelect={writeLetter}
          onExit={leave}
        />
      }
    >
      <LetterDialog open={open} onClose={() => setOpen(false)} />
    </InteriorLayout>
  )
}
