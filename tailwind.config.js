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
        'site-gold-ink': '#7A5C12',
        // Night UI
        'ui-bg': '#0A2329',
        'ui-bg-2': '#103139',
        'ui-line': '#8A7A44',
        'ui-text': '#F4F3EE',
        'ui-muted': '#B9C9C6',
        // Pixel game palette
        'px-ink': '#1F2433',
        'px-paper': '#F8F8F0',
        'px-frame': '#3A4466',
        'px-frame-light': '#C8D0E8',
        'px-grass': '#78C850',
        'px-grass-dark': '#3F8A34',
        'px-sky': '#A8E0F8',
        // 5.9:1 against paper, and paper text on it: usable for small text both ways
        'px-red': '#B0302A',
        'px-blue': '#2F5FB8',
        'px-link': '#1F55B0'
      },
      fontFamily: {
        'site-outfit': ['Outfit Variable', ...defaultTheme.fontFamily.sans],
        'site-pixel': ['Pixelify Sans Variable', ...defaultTheme.fontFamily.sans],
        'site-arcade': ['"Press Start 2P"', 'Pixelify Sans Variable', ...defaultTheme.fontFamily.mono]
      }
    }
  }
}
