import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Shiny Silver Palette
        silver: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E8E8E8',
          300: '#D4D4D4',
          400: '#C0C0C0',
          500: '#A8A8A8',
          600: '#808080',
          700: '#707070',
          800: '#505050',
          900: '#303030',
          950: '#1a1a1a',
        },
        platinum: {
          light: '#F8F8F8',
          DEFAULT: '#E5E4E2',
          dark: '#D4D4D4',
        },
        chrome: {
          light: '#F0F5F9',
          DEFAULT: '#DBE4EB',
          dark: '#B8C5D6',
        },
        steel: {
          light: '#A0A5A8',
          DEFAULT: '#71797E',
          dark: '#52585D',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'silver-sm': '0 0 10px rgba(192, 192, 192, 0.2), 0 0 20px rgba(192, 192, 192, 0.1)',
        'silver-md': '0 0 20px rgba(192, 192, 192, 0.3), 0 0 40px rgba(192, 192, 192, 0.15)',
        'silver-lg': '0 0 30px rgba(192, 192, 192, 0.4), 0 0 60px rgba(192, 192, 192, 0.2)',
        'silver-glow': '0 0 40px rgba(192, 192, 192, 0.5)',
        'inner-shine': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'silver-gradient': 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #E8E8E8 100%)',
        'silver-radial': 'radial-gradient(ellipse at center, rgba(192, 192, 192, 0.15) 0%, transparent 70%)',
        'chrome-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #E0E0E0 25%, #A0A0A0 50%, #E0E0E0 75%, #FFFFFF 100%)',
        'metal-dark': 'linear-gradient(180deg, #2a2a2e 0%, #1a1a1e 100%)',
      },
    },
  },
  plugins: [],
};

export default config;