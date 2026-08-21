import { FormEvent, useRef, useState } from 'react'
import { Animated } from '~/components/elements/Animated'
import Breadcrumbs from '~/components/elements/Breadcrumbs'
import SectionCard from '~/components/elements/SectionCard'
import useLocationFinder from '~/hooks/useLocationFinder'
import { useLocale } from '~/i18n/useLocale'
import { LINKEDIN_URL, sendContactMessage } from '~/services/contact'
import { cn, isValidEmail } from '~/services/utils'

const contactLinkClass = 'group flex w-fit items-center gap-2 transition-colors hover:text-site-gold'

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" aria-hidden>
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    </svg>
  )
}

function ContactLinkedInLink() {
  const { t } = useLocale()

  return (
    <a href={LINKEDIN_URL} target="_blank" rel="noreferrer noopener" className={contactLinkClass}>
      <LinkedInIcon />
      <span className="link-underline">LinkedIn</span>
      <span className="sr-only">{t.footer.linkedInNewTab}</span>
    </a>
  )
}

export function FormContactLinks({ variant = 'stacked' }: { variant?: 'stacked' | 'split' }) {
  const { t } = useLocale()
  const listClass = cn('mt-4 flex flex-col text-base font-medium leading-7', variant === 'split' ? 'sm:gap-2 gap-6' : 'gap-2')

  return (
    <div>
      <h2 className="text-lg font-bold leading-7">{t.contact.heading}</h2>
      <ul className={listClass}>
        <li>
          <ContactLinkedInLink />
        </li>
      </ul>
    </div>
  )
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

function applyRequiredValidity(input: HTMLInputElement | HTMLTextAreaElement, value: string, hint: string) {
  input.setCustomValidity(value.trim() === '' ? hint : '')
}

function ContactForm() {
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [nameTouched, setNameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [messageTouched, setMessageTouched] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const nameIsValid = name.trim() !== ''
  const emailIsValid = isValidEmail(email)
  const messageIsValid = message.trim() !== ''
  const showNameError = nameTouched && !nameIsValid
  const showEmailError = emailTouched && !emailIsValid
  const showMessageError = messageTouched && !messageIsValid

  function currentEmailHint(value: string) {
    if (value.trim() === '') return t.contact.emailHint
    return isValidEmail(value) ? '' : t.contact.emailInvalidHint
  }

  function applyEmailValidity(input: HTMLInputElement, value: string) {
    input.setCustomValidity(currentEmailHint(value))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (honeypot) {
      setStatus('success')
      return
    }

    if (!nameIsValid || !emailIsValid || !messageIsValid) {
      setNameTouched(true)
      setEmailTouched(true)
      setMessageTouched(true)

      if (!nameIsValid) {
        nameRef.current?.focus()
      } else if (!emailIsValid) {
        emailRef.current?.focus()
      } else {
        messageRef.current?.focus()
      }

      return
    }

    setStatus('submitting')

    try {
      await sendContactMessage({ name, email: email.trim(), message, subject: t.contact.subject(name) })
      setName('')
      setEmail('')
      setMessage('')
      setNameTouched(false)
      setEmailTouched(false)
      setMessageTouched(false)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-site-cream-fg">
      <div className="hidden" aria-hidden>
        <label htmlFor="contact-company">{t.contact.company}</label>
        <input
          id="contact-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="text-sm font-medium leading-7">
          {t.contact.name} <span aria-hidden>*</span>
        </label>
        <input
          id="contact-name"
          ref={nameRef}
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-invalid={showNameError}
          aria-describedby={showNameError ? 'contact-name-error' : undefined}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            applyRequiredValidity(event.target, event.target.value, t.contact.nameHint)
          }}
          onBlur={(event) => {
            setNameTouched(true)
            applyRequiredValidity(event.target, event.target.value, t.contact.nameHint)
          }}
          className="field"
        />
        {showNameError && (
          <p id="contact-name-error" className="content-s text-site-cream-fg/70">
            {t.contact.nameHint}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-sm font-medium leading-7">
          {t.contact.email} <span aria-hidden>*</span>
        </label>
        <input
          id="contact-email"
          ref={emailRef}
          name="email"
          type="email"
          inputMode="email"
          required
          maxLength={254}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={showEmailError}
          aria-describedby={showEmailError ? 'contact-email-error' : undefined}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            applyEmailValidity(event.target, event.target.value)
          }}
          onBlur={(event) => {
            setEmailTouched(true)
            applyEmailValidity(event.target, event.target.value)
          }}
          className="field"
        />
        {showEmailError && (
          <p id="contact-email-error" className="content-s text-site-cream-fg/70">
            {currentEmailHint(email)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-sm font-medium leading-7">
          {t.contact.message} <span aria-hidden>*</span>
        </label>
        <textarea
          id="contact-message"
          ref={messageRef}
          name="message"
          required
          rows={6}
          aria-invalid={showMessageError}
          aria-describedby={showMessageError ? 'contact-message-error' : undefined}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            applyRequiredValidity(event.target, event.target.value, t.contact.messageHint)
          }}
          onBlur={(event) => {
            setMessageTouched(true)
            applyRequiredValidity(event.target, event.target.value, t.contact.messageHint)
          }}
          className="field min-h-40"
        />
        {showMessageError && (
          <p id="contact-message-error" className="content-s text-site-cream-fg/70">
            {t.contact.messageHint}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="button-gold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? t.contact.sending : t.contact.send}
      </button>

      <div aria-live="polite">
        {status === 'success' && <p className="content-s text-site-cyan">{t.contact.success}</p>}
        {status === 'error' && <p className="content-s text-site-cream-fg/70">{t.contact.error}</p>}
      </div>
    </form>
  )
}

export default function FormContact({ title, description }: { title?: string; description?: string }) {
  const { t } = useLocale()
  const { ref } = useLocationFinder()
  const heading = title ?? t.contact.title
  const lead = description ?? t.contact.description

  return (
    <SectionCard
      tone="cream"
      first
      id="form-contact"
      innerClassName="px-6 pt-28 pb-16 sm:px-10 lg:px-16 lg:pt-32 lg:pb-20"
      sectionRef={ref}
    >
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
        <div className="flex flex-col gap-12">
          <div className="flex max-w-xl flex-col gap-8">
            <Breadcrumbs className="text-site-cream-fg/70" />
            <div className="flex flex-col gap-2 lg:gap-4">
              <Animated delay={100}>
                <h1 className="title-section">{heading}</h1>
              </Animated>
              <Animated delay={200}>
                <p className="content-l text-site-cream-fg/80">{lead}</p>
              </Animated>
            </div>
          </div>

          <Animated delay={300}>
            <div>
              <FormContactLinks />
            </div>
          </Animated>
        </div>

        <Animated delay={400}>
          <div>
            <ContactForm />
          </div>
        </Animated>
      </div>
    </SectionCard>
  )
}
