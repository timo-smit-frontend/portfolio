import defaultTheme from 'tailwindcss/defaultTheme'

/**
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        panel: '1.25rem',
        button: '1.25rem'
      },
      boxShadow: {
        card: '0 10px 28px rgb(0 0 0 / 0.4)'
      },
      colors: {
        'site-chrome': '#0C2A30',
        'site-cyan': '#145A63',
        'site-cyan-fg': '#F4F7F6',
        'site-cream': '#F4F3EE',
        'site-cream-fg': '#061A1E',
        'site-gold': '#E4B84A',
        'site-gold-fg': '#061A1E',
        'site-gold-hover': '#C99A2E'
      },
      fontFamily: {
        'site-outfit': ['Outfit Variable', ...defaultTheme.fontFamily.sans]
      }
    }
  }
}
