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
        'site-gold-hover': '#C99A2E',
        // Gold for large display text (>= 24px) on cream: 3.13:1 on #F4F3EE (WCAG 1.4.3 large text)
        'site-gold-display': '#AD831A',
        // Gold for normal-size text on light backgrounds: 5.61:1 on cream, 4.64:1 on the translucent sticky header over the dark frame
        'site-gold-ink': '#7A5C12'
      },
      fontFamily: {
        'site-outfit': ['Outfit Variable', ...defaultTheme.fontFamily.sans]
      }
    }
  }
}
