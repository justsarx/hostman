/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        rack: {
          canvas: 'rgb(var(--rack-canvas-rgb) / <alpha-value>)',
          surface: 'rgb(var(--rack-surface-rgb) / <alpha-value>)',
          elevated: 'rgb(var(--rack-elevated-rgb) / <alpha-value>)',
          hover: 'rgb(var(--rack-hover-rgb) / <alpha-value>)',
          border: 'rgb(var(--rack-border-rgb) / <alpha-value>)',
          borderStrong: 'rgb(var(--rack-border-strong-rgb) / <alpha-value>)',
          accent: 'rgb(var(--rack-accent-rgb) / <alpha-value>)',
          accentHover: 'rgb(var(--rack-accent-hover-rgb) / <alpha-value>)',
          onAccent: 'var(--rack-on-accent)',
          text: 'rgb(var(--rack-text-rgb) / <alpha-value>)',
          muted: 'rgb(var(--rack-muted-rgb) / <alpha-value>)',
          dim: 'rgb(var(--rack-dim-rgb) / <alpha-value>)',
          ok: 'rgb(var(--rack-ok-rgb) / <alpha-value>)',
          warn: 'rgb(var(--rack-warn-rgb) / <alpha-value>)',
          err: 'rgb(var(--rack-err-rgb) / <alpha-value>)',
          info: 'rgb(var(--rack-info-rgb) / <alpha-value>)',
          patch: 'rgb(var(--rack-patch-rgb) / <alpha-value>)',
          opt: 'rgb(var(--rack-opt-rgb) / <alpha-value>)',
          neutral: 'rgb(var(--rack-neutral-rgb) / <alpha-value>)',
        },
      },
      borderRadius: {
        none: '0px',
        rack: '2px',
      },
    },
  },
  plugins: [],
};
