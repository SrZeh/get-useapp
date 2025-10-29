/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Strategic use only (CTAs, success, trust)
        brand: {
          primary: '#96ff9a', // Main brand green
          secondary: '#80e685', // Lighter variant for hover states
          tertiary: '#6acc6f', // Medium for pressed states
          dark: '#08af0e', // Darker green for contrast on light backgrounds
          light: '#b3ffb5', // Light variant for subtle accents
          glow: '#ccffe0', // Ultra-light for glow effects
          success: '#08af0e', // Success uses brand green
        },
        // Light Mode Backgrounds - Clean, neutral, professional
        'light-bg': {
          primary: '#ffffff', // Pure white (not green!)
          secondary: '#f9fafb', // Off-white (gray-50)
          tertiary: '#f3f4f6', // Light gray (gray-100)
        },
        // Dark Mode Backgrounds - Modern dark with subtle warmth
        'dark-bg': {
          primary: '#0f1419', // Warm dark (not pure black)
          secondary: '#1a1f2e', // Slightly lighter with blue tint
          tertiary: '#0d1117', // Almost black for depth
        },
        // Light Mode Text - High contrast for readability
        'light-text': {
          primary: '#0a0a0a', // Near black (maximum contrast)
          secondary: '#1f2937', // Dark gray (gray-800)
          tertiary: '#4b5563', // Medium gray (gray-600)
          quaternary: '#6b7280', // Light gray (gray-500)
        },
        // Dark Mode Text - High contrast, green only for accents
        'dark-text': {
          primary: '#f9fafb', // Off-white (not green - better readability)
          secondary: '#e5e7eb', // Light gray (gray-200)
          tertiary: '#cbd5e1', // Lighter gray (gray-300)
          quaternary: '#94a3b8', // Medium gray (gray-400)
        },
        // Borders - Refined, subtle
        border: {
          light: '#e5e7eb', // Gray-200 for light mode
          'light-alt': '#d1d5db', // Gray-300 alternate
          dark: '#334155', // Slate-700 for dark mode (more refined)
          'dark-alt': '#1e293b', // Slate-800 alternate
        },
        // Input Backgrounds
        input: {
          'light-bg': '#ffffff', // Clean white
          'dark-bg': '#1a1f2e', // Slightly lighter than dark-bg-secondary
        },
        // Card Backgrounds - Elevated surfaces
        card: {
          'light-bg': '#ffffff', // White cards on white background with shadow
          'dark-bg': '#1e293b', // Slate-800 for elevation in dark mode
        },
        // Semantic Colors - Clear and distinct
        success: {
          primary: '#08af0e', // Brand green for trust/success
          light: '#40ef47', // Lighter variant
          dark: '#00ce08', // Darker variant
          soft: '#16a34a', // Softer green (green-600)
        },
        error: {
          primary: '#ef4444', // Clear red (red-500)
          dark: '#dc2626', // Darker red (red-600)
          light: '#f87171', // Lighter for dark mode (red-400)
        },
        warning: {
          primary: '#f59e0b', // Amber (amber-500)
          dark: '#d97706', // Darker (amber-600)
          light: '#fbbf24', // Lighter for dark mode (amber-400)
        },
        info: {
          primary: '#3b82f6', // Modern blue (blue-500)
          dark: '#2563eb', // Darker (blue-600)
          light: '#60a5fa', // Lighter for dark mode (blue-400)
        },
        // Neutral/Gray Scale
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Overlay
        overlay: 'rgba(0,0,0,0.6)',
      },
      spacing: {
        '4xs': '2px',
        '3xs': '4px',
        '2xs': '8px',
        'xs': '12px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
        '2xl': '64px',
        '3xl': '96px',
      },
      fontSize: {
        // iOS 26 Typography Scale (official Apple HIG)
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700', letterSpacing: '0.37px' }],
        'title-1': ['28px', { lineHeight: '34px', fontWeight: '400', letterSpacing: '0.36px' }],
        'title-2': ['22px', { lineHeight: '28px', fontWeight: '400', letterSpacing: '0.35px' }],
        'title-3': ['20px', { lineHeight: '25px', fontWeight: '400', letterSpacing: '0.38px' }],
        'headline': ['17px', { lineHeight: '22px', fontWeight: '600', letterSpacing: '-0.41px' }],
        'body': ['17px', { lineHeight: '22px', fontWeight: '400', letterSpacing: '-0.41px' }],
        'callout': ['16px', { lineHeight: '21px', fontWeight: '400', letterSpacing: '-0.32px' }],
        'subhead': ['15px', { lineHeight: '20px', fontWeight: '400', letterSpacing: '-0.24px' }],
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400', letterSpacing: '-0.08px' }],
        'caption-1': ['12px', { lineHeight: '16px', fontWeight: '400', letterSpacing: '0px' }],
        'caption-2': ['11px', { lineHeight: '13px', fontWeight: '400', letterSpacing: '0.07px' }],
        // Legacy support (backwards compatibility)
        'display-large': ['56px', { lineHeight: '64px', fontWeight: '700' }],
        'display': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'display-small': ['40px', { lineHeight: '48px', fontWeight: '700' }],
        'title-large': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-small': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-large': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      fontFamily: {
        'system': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'bounce-subtle': 'bounceSubtle 400ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-left': 'slideInLeft 300ms ease-out',
        'fade-scale': 'fadeScale 250ms ease-out',
        'bounce-in': 'bounceIn 400ms ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeScale: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(150, 255, 154, 0.4)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(150, 255, 154, 0.2)' },
        },
      },
      transitionDuration: {
        'fluid': '200ms',
      },
      transitionTimingFunction: {
        'fluid': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      screens: {
        'xs': '375px',   // Small phones
        'sm': '640px',   // Small tablets
        'md': '768px',   // Tablets
        'lg': '1024px',  // Small laptops
        'xl': '1280px',  // Desktops
        '2xl': '1536px', // Large screens
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #96ff9a 0%, #80e685 50%, #6acc6f 100%)',
        'gradient-premium': 'linear-gradient(90deg, #96ff9a 0%, #7fe884 50%, #66cc6b 100%)',
        'gradient-success': 'linear-gradient(90deg, #08af0e 0%, #00ce08 100%)',
        'gradient-overlay': 'linear-gradient(180deg, rgba(150, 255, 154, 0.1) 0%, transparent 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #0d1117 100%)',
        'gradient-light': 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
      },
    },
  },
  plugins: [],
};
