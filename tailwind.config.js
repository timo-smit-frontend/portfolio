import defaultTheme from 'tailwindcss/defaultTheme'

/**
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'site-chrome': '#0C2A30',
        'site-gold': '#E4B84A',
        // Night UI
        'ui-bg': '#0A2329',
        'ui-bg-2': '#103139',
        'ui-line': '#8A7A44',
        'ui-text': '#F4F3EE',
        'ui-muted': '#B9C9C6',
        // Pixel game palette
        'px-ink': '#1F2433',
        'px-paper': '#F8F8F0',
        // 5.9:1 against paper, and paper text on it: usable for small text both ways
        'px-red': '#B0302A'
      },
      fontFamily: {
        'site-outfit': ['Outfit Variable', ...defaultTheme.fontFamily.sans],
        'site-pixel': ['Pixelify Sans Variable', ...defaultTheme.fontFamily.sans],
        'site-arcade': ['"Press Start 2P"', 'Pixelify Sans Variable', ...defaultTheme.fontFamily.mono]
      }
    }
  }
}
