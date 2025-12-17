import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // NeuraNote custom colors
        lavender: {
          50: "hsl(250 30% 98%)",
          100: "hsl(250 30% 96%)",
          200: "hsl(250 25% 92%)",
          300: "hsl(250 25% 85%)",
          400: "hsl(250 25% 75%)",
          500: "hsl(250 25% 60%)",
        },
        periwinkle: {
          DEFAULT: "hsl(240 45% 70%)",
          light: "hsl(240 45% 85%)",
          dark: "hsl(240 45% 55%)",
        },
        mist: {
          DEFAULT: "hsl(210 35% 92%)",
          light: "hsl(210 35% 96%)",
        },
        blush: {
          DEFAULT: "hsl(350 30% 94%)",
          light: "hsl(350 30% 97%)",
        },
        sage: {
          DEFAULT: "hsl(150 25% 90%)",
          light: "hsl(150 25% 95%)",
          dark: "hsl(150 25% 40%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      lineHeight: {
        relaxed: "1.75",
        loose: "2",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "bubble-drift": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
            opacity: "0.5",
          },
          "33%": {
            transform: "translate(15px, -25px) scale(1.1)",
            opacity: "0.7",
          },
          "66%": {
            transform: "translate(-10px, -50px) scale(0.9)",
            opacity: "0.6",
          },
        },
        "fade-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        breathe: {
          "0%, 100%": {
            opacity: "0.4",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bubble-drift": "bubble-drift 20s ease-in-out infinite",
        "fade-up": "fade-up 0.8s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        breathe: "breathe 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
        gentle: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
