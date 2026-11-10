import { ContactForm, FormContactLinks } from '~/components/flex/form/FormContact'
import GameDialog from '~/game/interior/GameDialog'
import { useLocale } from '~/i18n/useLocale'

/** Writing Timo a letter: the contact form, opened from the post box in town or the Post office counter. */
export default function LetterDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale()

  return (
    <GameDialog open={open} onClose={onClose} eyebrow={t.game.places.contact} title={t.contact.title}>
      <div className="flex flex-col gap-8">
        <p className="prose-paper">{t.contact.description}</p>
        <ContactForm />
        <div className="border-t-[3px] border-px-ink/15 pt-6">
          <FormContactLinks />
        </div>
      </div>
    </GameDialog>
  )
}
