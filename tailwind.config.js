/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        // Cloud-based color system
        cloud: {
          // Sky colors
          sky: {
            light: '#F0F8FF',     // Alice Blue
            main: '#E6F3FF',      // Light Sky Blue
            deep: '#CCE7FF',      // Deeper Sky
          },
          
          // Cloud colors
          white: '#FFFFFF',       // Pure white clouds
          silver: '#F8F9FA',      // Silver clouds
          gray: '#E9ECEF',        // Light gray clouds
          shadow: '#DEE2E6',      // Cloud shadows
          
          // Clean accent colors
          blue: '#4A90E2',        // Clean blue
          mint: '#6C9BD2',        // Sky mint
          lavender: '#A8C8EC',    // Lavender cloud
          rose: '#F2A6B8',        // Rose cloud
          sunshine: '#FFD93D',    // Sunshine yellow
          
          // Fresh pastel variations
          soft: {
            blue: '#E8F4FD',      // Soft blue
            mint: '#E8F6F3',      // Soft mint
            lavender: '#F0F4FF',  // Soft lavender
            rose: '#FFE8EC',      // Soft rose
            cream: '#FFF8E7',     // Cream cloud
          },
          
          // UI colors
          background: '#F0F8FF',  // Sky background
          surface: '#FFFFFF',     // White surface
          text: '#2D3748',        // Darker text for contrast
          textMuted: '#718096',   // Muted text
          border: '#E2E8F0',     // Light border
        },
        
        // Updated headspace for backward compatibility
        headspace: {
          // Primary colors - updated to cloud theme
          blue: '#4A90E2',
          beige: '#F0F8FF',
          yellow: '#FFD93D',
          pink: '#F2A6B8',
          purple: '#A8C8EC',
          green: '#6C9BD2',
          darkGray: '#2D3748',
          
          // Pastel variations - updated
          pastel: {
            blue: '#E8F4FD',
            yellow: '#FFF8E7',
            pink: '#FFE8EC',
            purple: '#F0F4FF',
            green: '#E8F6F3',
            orange: '#FFEDE5',
            mint: '#E8F6F3',
          },
          
          // UI colors - updated
          background: '#F0F8FF',
          surface: '#FFFFFF',
          text: '#2D3748',
          textMuted: '#718096',
          border: '#E2E8F0',
        },
        
        
        // Emotion colors - Cloud style (clean and bright)
        emotion: {
          // Primary emotions - cleaner, brighter
          happy: '#FFD93D',       // Sunshine yellow
          calm: '#4A90E2',        // Sky blue
          focus: '#A8C8EC',       // Lavender cloud
          energy: '#6C9BD2',      // Sky mint
          love: '#F2A6B8',        // Rose cloud
          
          // Positive emotions - clean and bright
          joy: '#FFEB3B',         // Bright sunshine
          energized: '#42A5F5',   // Vibrant sky blue
          playful: '#EC407A',     // Fresh pink
          pleased: '#66BB6A',     // Fresh green
          delighted: '#FFA726',   // Warm orange
          cheerful: '#FFEE58',    // Cheerful yellow
          curious: '#29B6F6',     // Curious blue
          grateful: '#AB47BC',    // Grateful purple
          
          // Negative emotions - softer, cloud-like
          sadness: '#90CAF9',     // Gentle blue cloud
          anxious: '#FFCDD2',     // Soft pink cloud
          stressed: '#FFAB91',    // Warm coral cloud
          overwhelmed: '#D1C4E9', // Lavender mist
          worried: '#F8BBD9',     // Rose mist
          tired: '#E1BEE7',       // Purple mist
          
          // Calm emotions - sky tones
          peaceful: '#81C784',    // Peaceful green
          atEase: '#80CBC4',      // Teal sky
          understood: '#81D4FA',  // Understanding blue
          
          // Helping emotions - supportive clouds
          helping: '#64B5F6',     // Helper blue
          supportive: '#4FC3F7',  // Support sky
          caring: '#4DD0E1',      // Caring cyan
          connected: '#4DB6AC',   // Connection teal
        },
        
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}