import { LINKEDIN_URL } from '~/seo/site'
import { isValidEmail } from './utils'

export { LINKEDIN_URL }

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export async function sendContactMessage({ name, email, message }: { name: string; email: string; message: string }) {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address')
  }

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
  if (!accessKey) {
    throw new Error('Missing form key')
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      access_key: accessKey,
      name,
      email,
      message,
      subject: `Portfolio message from ${name}`
    })
  })

  const data = (await response.json()) as { success?: boolean | string; message?: string }

  if (!response.ok || data.success === false || data.success === 'false') {
    throw new Error(data.message ?? 'Failed to send message')
  }
}
