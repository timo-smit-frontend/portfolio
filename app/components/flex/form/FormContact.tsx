import { FormEvent, useRef, useState } from 'react'
import { useLocale } from '~/i18n/useLocale'
import { LINKEDIN_URL, sendContactMessage } from '~/services/contact'
import { cn, isValidEmail } from '~/services/utils'

const contactLinkClass = 'group flex min-h-11 w-fit items-center gap-2 font-semibold text-px-ink hover:text-px-red'

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
      <h3 className="arcade text-[0.6rem] text-px-red">{t.contact.heading}</h3>
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

export function ContactForm() {
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

    if (status === 'submitting') return

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
    // noValidate: the inline, persistent error messages below (linked via aria-describedby) replace the
    // transient native validation bubbles; focus moves to the first invalid field (WCAG 3.3.1 / 3.3.3).
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <p className="text-sm leading-7 text-px-ink/75">{t.contact.requiredNote}</p>

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
        <label htmlFor="contact-name" className="text-lg font-semibold leading-7">
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
          <p id="contact-name-error" className="content-s font-semibold text-px-red">
            {t.contact.nameHint}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-lg font-semibold leading-7">
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
          <p id="contact-email-error" className="content-s font-semibold text-px-red">
            {currentEmailHint(email)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-lg font-semibold leading-7">
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
          <p id="contact-message-error" className="content-s font-semibold text-px-red">
            {t.contact.messageHint}
          </p>
        )}
      </div>

      {/* aria-disabled (not disabled) while sending, so a keyboard-focused button keeps focus. */}
      <button
        type="submit"
        className="button-gold cursor-pointer aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
        aria-disabled={status === 'submitting' || undefined}
      >
        {status === 'submitting' ? t.contact.sending : t.contact.send}
      </button>

      <div aria-live="polite">
        {status === 'success' && (
          <p className="content-s pixel-corners px-4 py-3 font-semibold text-px-ink [--surface-bg:var(--color-site-gold)]">
            {t.contact.success}
          </p>
        )}
        {status === 'error' && <p className="content-s font-semibold text-px-red">{t.contact.error}</p>}
      </div>
    </form>
  )
}
