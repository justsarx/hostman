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
          canvas: '#000000',
          surface: '#0B0B0C',
          elevated: '#141416',
          hover: '#1B1B1E',
          border: '#222225',
          borderStrong: '#34343A',
          accent: '#FF5722',
          accentHover: '#FF6E40',
          text: '#F4F4F5',
          muted: '#94949C',
          dim: '#5C5C64',
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
