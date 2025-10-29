# iOS 26 Liquid Glass Design System

## Overview

This project uses the **iOS 26 Liquid Glass** design language, a modern design system that emphasizes depth, fluidity, and clarity through glassmorphism effects, smooth animations, and adaptive theming.

## ✅ Implementation Status

The complete design system has been implemented with full dark mode support and is production-ready.

## Design Philosophy

### Core Principles (2025 P2P Best Practices)

1. **Neutral Base** - Clean, professional backgrounds that don't distract
2. **Strategic Brand Colors** - Green used intentionally for trust, actions, and success
3. **Depth & Layering** - Glassmorphism and backdrop blur create visual hierarchy
4. **Fluidity** - Smooth animations (under 400ms) for natural interactions  
5. **Clarity** - High contrast for accessibility (WCAG AA+) and readable typography
6. **Adaptability** - Seamless light and dark mode transitions
7. **Minimalism** - Purposeful whitespace and clean interfaces

## Color System

**Brand Color**: `#96ff9a` (Light Green/Mint) - **Strategic Use Only**

### Color Philosophy (2025 P2P Best Practices)

The brand green (`#96ff9a`) is used **strategically** for:
- ✅ Primary buttons and CTAs
- ✅ Success states and trust indicators
- ✅ Selected/active states
- ✅ Focus rings and highlights
- ✅ Tab icons when selected

**NOT** used for:
- ❌ Primary background colors
- ❌ Main text color (except dark mode accents)
- ❌ General UI surfaces

This creates a professional, clean aesthetic while maintaining brand identity.

### Background Colors

#### Light Mode
```css
bg-light-bg-primary     /* #ffffff - Pure white (clean, professional) */
bg-light-bg-secondary   /* #f9fafb - Off-white (gray-50) */
bg-light-bg-tertiary     /* #f3f4f6 - Light gray (gray-100) */
```

#### Dark Mode
```css
bg-dark-bg-primary      /* #0f1419 - Warm dark (not pure black) */
bg-dark-bg-secondary    /* #1a1f2e - Lighter with subtle blue tint */
bg-dark-bg-tertiary     /* #0d1117 - Almost black for depth */
```

### Text Colors

#### Light Mode
```css
text-light-text-primary     /* #0a0a0a - Near black (maximum contrast) */
text-light-text-secondary   /* #1f2937 - Dark gray (gray-800) */
text-light-text-tertiary    /* #4b5563 - Medium gray (gray-600) */
text-light-text-quaternary  /* #6b7280 - Light gray (gray-500) */
```

#### Dark Mode
```css
text-dark-text-primary      /* #f9fafb - Off-white (high contrast, not green) */
text-dark-text-secondary    /* #e5e7eb - Light gray (gray-200) */
text-dark-text-tertiary     /* #cbd5e1 - Lighter gray (gray-300) */
text-dark-text-quaternary   /* #94a3b8 - Medium gray (gray-400) */
```

### Primary Brand Colors - Strategic Use Only

```css
/* Light Green/Mint (#96ff9a) - Main brand color */
/* ⚠️ Use strategically for CTAs, success, trust, selected states */
brand-primary:    #96ff9a  /* Main brand color ⭐ PRIMARY */
brand-secondary:  #80e685  /* Lighter variant for hover states */
brand-tertiary:   #6acc6f  /* Medium for pressed states */
brand-dark:       #08af0e  /* Darker green for contrast on light backgrounds */
brand-light:      #b3ffb5  /* Light variant for subtle accents */
brand-glow:       #ccffe0  /* Ultra-light for glow effects */
```

**Usage Guidelines:**
- **Buttons/CTAs**: Use `brand-primary` or `brand-dark` for primary actions
- **Success States**: Use brand green to reinforce trust
- **Selected States**: Use brand color to indicate active selection
- **Hover States**: Use `brand-secondary` for interactive feedback
- **Avoid**: Using brand color as background for main surfaces

### Interactive & UI Colors

```css
/* Borders - Refined and subtle */
border-light:     #e5e7eb  /* Gray-200 for light mode */
border-light-alt: #d1d5db  /* Gray-300 alternate */
border-dark:      #334155  /* Slate-700 for dark mode (refined) */
border-dark-alt:  #1e293b  /* Slate-800 alternate */

/* Input Backgrounds */
input-light-bg:   #ffffff  /* Clean white */
input-dark-bg:    #1a1f2e  /* Slightly lighter than dark-bg-secondary */

/* Card/Container Backgrounds - Elevated surfaces */
card-light-bg:    #ffffff  /* White with shadow for elevation */
card-dark-bg:     #1e293b  /* Slate-800 for elevation in dark mode */
```

### Semantic Colors

```css
/* Success - Uses brand green for trust */
success-primary:  #08af0e  /* Brand green for trust/success */
success-light:    #40ef47  /* Lighter variant */
success-dark:     #00ce08  /* Darker variant */
success-soft:     #16a34a  /* Softer green (green-600) */

/* Error - Clear and distinct */
error-primary:    #ef4444  /* Clear red (red-500) */
error-dark:       #dc2626  /* Darker red (red-600) */
error-light:      #f87171  /* Lighter for dark mode (red-400) */

/* Warning - Amber for caution */
warning-primary:  #f59e0b  /* Amber (amber-500) */
warning-dark:     #d97706  /* Darker (amber-600) */
warning-light:    #fbbf24  /* Lighter for dark mode (amber-400) */

/* Info - Modern blue */
info-primary:     #3b82f6  /* Modern blue (blue-500) */
info-dark:        #2563eb  /* Darker (blue-600) */
info-light:       #60a5fa  /* Lighter for dark mode (blue-400) */

/* Neutral/Gray */
neutral-50:        #f9fafb  /* Very light gray */
neutral-100:       #f3f4f6  /* Light gray */
neutral-200:       #e5e7eb  /* Border gray */
neutral-300:       #d1d5db  /* Light border gray */
neutral-400:       #9ca3af  /* Medium gray */
neutral-500:       #6b7280  /* Default gray */
neutral-600:       #4b5563  /* Dark gray */
neutral-700:       #374151  /* Darker gray */
neutral-800:       #1f2937  /* Very dark gray */
neutral-900:       #111827  /* Almost black */
```

### Overlay & Effects

```css
overlay:          rgba(0,0,0,0.6)  /* Semi-transparent overlay */
```

## Typography

### Font Family: SF Pro

**SF Pro** is Apple's proprietary sans-serif typeface family developed in-house. The project uses SF Pro throughout for a native iOS experience.

**Font Variants:**
- **SF Pro Display**: Optimized for sizes 19pt and larger (headings, titles, large text)
- **SF Pro Text**: Optimized for sizes 18pt and below (body text, UI elements)
- **SF Pro Rounded**: Rounded variant available for playful UI elements (optional)
- **SF Mono**: Monospaced variant for code and technical content

**Platform Implementation:**
- **iOS**: Uses system fonts (SF Pro Display/Text is the iOS system default)
- **Android**: Uses SF Pro if available, gracefully falls back to Roboto
- **Web**: Uses SF Pro with comprehensive fallback stack (`-apple-system`, `BlinkMacSystemFont`, etc.)

### Font Hierarchy

```css
/* Display Text (Hero sections) */
text-display-large    /* 56px (3.5rem) - Bold */
text-display          /* 48px (3rem) - Bold */
text-display-small    /* 40px (2.5rem) - Bold */

/* Headings */
text-headline         /* 32px (2rem) - Semibold */
text-title-large      /* 24px (1.5rem) - Semibold */
text-title            /* 20px (1.25rem) - Semibold */
text-title-small      /* 18px (1.125rem) - Semibold */

/* Body Text */
text-body-large       /* 18px (1.125rem) - Regular */
text-body             /* 16px (1rem) - Regular - Default */
text-body-small       /* 14px (0.875rem) - Regular */
text-caption          /* 12px (0.75rem) - Regular - Labels */
```

## Spacing System

```css
/* Spacing Scale */
4xs: 2px    (0.125rem)
3xs: 4px    (0.25rem)
2xs: 8px    (0.5rem)
xs:  12px   (0.75rem)
sm:  16px   (1rem) - Default
md:  24px   (1.5rem)
lg:  32px   (2rem)
xl:  48px   (3rem)
2xl: 64px   (4rem)
3xl: 96px   (6rem)
```

### Usage Guidelines

- **Tight spacing**: `gap-2xs` or `p-xs` for compact layouts
- **Default spacing**: `p-sm` for cards, `gap-md` for sections
- **Large spacing**: `mt-2xl` or `pt-3xl` for major sections

## Border Radius

```css
rounded-2xs: 4px
rounded-xs:  8px
rounded-sm:  12px   - Buttons (small)
rounded-md:  16px
rounded-lg:  20px   - Buttons (default)
rounded-xl:  24px   - Cards (default)
rounded-2xl: 32px   - Large cards
rounded-3xl: 48px   - Hero sections
```

## Glass Effects

### `.glass` - Standard
```css
.glass {
  background: rgba(255, 255, 255, 0.7); /* Light mode */
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

**Use for:** Cards, modals, navigation bars

### `.glass-strong` - Strong
```css
.glass-strong {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

**Use for:** Modal overlays, important panels

### `.glass-subtle` - Subtle
```css
.glass-subtle {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Use for:** Subtle overlays, tooltips

## Components

### Buttons

```jsx
// Primary action (uses primary-500 purple)
<Button variant="primary">Sign Up</Button>

// Secondary action  
<Button variant="secondary">Cancel</Button>

// Ghost/minimal
<Button variant="ghost">Learn More</Button>

// Outline
<Button variant="outline">Details</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Sizes
<Button variant="primary" size="sm">Small</Button>
<Button variant="primary" size="md">Default</Button>
<Button variant="primary" size="lg">Large</Button>

// With icons
<Button variant="primary" iconLeft={<Icon />}>With Icon</Button>

// Loading state
<Button variant="primary" isLoading>Loading...</Button>

// States
<Button variant="primary" disabled>Disabled</Button>
```

### Cards

```jsx
// Standard glass card
<Card variant="standard" padding="md">
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Interactive card with hover effect
<Card variant="hover" padding="md">
  <h3>Clickable Card</h3>
</Card>

// Flat card without glass effect
<Card variant="flat" padding="md">
  <h3>Flat Card</h3>
</Card>

// Card with header and footer
<Card
  header={<h3 className="text-title">Card Header</h3>}
  footer={<button>Action</button>}
>
  <p>Card content goes here</p>
</Card>
```

### Inputs

```jsx
// Standard input
<input type="text" placeholder="Enter text" className="input" />

// Error state
<input type="text" className="input-error" />

// With label
<div>
  <label className="text-body-small text-light-text-secondary dark:text-dark-text-secondary">
    Email
  </label>
  <input type="email" className="input mt-2xs" />
</div>
```

### Badges

```jsx
<span className="badge-primary">New</span>
<span className="badge-success">Active</span>
<span className="badge-warning">Pending</span>
<span className="badge-error">Failed</span>
```

### Containers

```jsx
// Full width with padding
<div className="container-fluid">
  {/* Content */}
</div>

// Constrained width (max-w-7xl)
<div className="container-constrained">
  {/* Content */}
</div>
```

## Animations

### Available Animations

```css
animate-fade-in         /* 200ms fade in */
animate-slide-up        /* 300ms slide from bottom */
animate-slide-down      /* 300ms slide from top */
animate-scale-in        /* 200ms scale from 95% */
animate-bounce-subtle   /* 400ms subtle bounce */
animate-pulse-subtle    /* 2s infinite pulse */
```

### Usage

```jsx
<div className="animate-fade-in">
  <h1>Appears with fade</h1>
</div>

<div className="animate-slide-up">
  <p>Slides up from bottom</p>
</div>
```

### Custom Transitions

```jsx
<button className="transition-all duration-200 ease-fluid hover:scale-105">
  Smooth hover
</button>
```

## Dark Mode

### Implementation

The app uses `next-themes` for dark mode support:

```jsx
import { ThemeProvider } from '@/components/ThemeProvider';

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### Theme Toggle

```jsx
import ThemeToggle from '@/components/ThemeToggle';

<ThemeToggle />
```

### Writing Dark Mode Styles

Always provide both light and dark variants:

```jsx
<div className="bg-light-bg-primary dark:bg-dark-bg-primary
                text-light-text-primary dark:text-dark-text-primary
                border-light-border-primary dark:border-dark-border-primary">
  Content adapts to theme
</div>
```

## Best Practices

### ✅ Do

- Use the predefined component classes (`.btn-primary`, `.card`, `.glass`)
- Stick to the spacing scale (`sm`, `md`, `lg`)
- Implement both light and dark modes from the start
- Use semantic color names (`success`, `error`, `warning`)
- Keep animations under 400ms
- Test contrast ratios (WCAG AA minimum)

### ❌ Don't

- Mix flat backgrounds with glass effects inconsistently
- Use colors outside the defined palette
- Create custom shadows (use `shadow-glass` variants)
- Ignore dark mode implementation
- Use arbitrary values like `p-[13px]`
- Over-animate (keep it subtle and purposeful)
- Use multiple accent colors in the same component
- Skip hover/focus/active states

## Accessibility

### Contrast Requirements

- **Text**: WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)
- **Interactive elements**: 3:1 minimum
- Test in both light and dark modes

### Focus States

All interactive elements must have visible focus states:

```css
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-accent-blue-500
```

### Touch Targets

Minimum 44x44px for mobile:

```css
/* Buttons */
.btn {
  @apply py-xs px-md; /* Ensures minimum touch target */
}
```

## Responsive Design

### Breakpoints

```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Usage

```jsx
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-sm 
  md:gap-md
">
  {/* Responsive grid */}
</div>
```

## Loading States

### Shimmer Effect

```jsx
<div className="shimmer card">
  <div className="h-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded" />
</div>
```

### Pulse

```jsx
<div className="animate-pulse-subtle">
  Loading...
</div>
```

## Example Layouts

### Hero Section

```jsx
<section className="min-h-screen flex items-center justify-center p-md">
  <div className="container-constrained text-center space-y-lg">
    <h1 className="text-display-large animate-fade-in">
      Welcome to{" "}
      <span className="bg-gradient-to-r from-primary-500 to-primary-400 
                     bg-clip-text text-transparent">
        Airflip
      </span>
    </h1>
    <p className="text-body-large text-light-text-secondary dark:text-dark-text-secondary 
                  animate-slide-up">
      Tagline goes here
    </p>
    <div className="flex gap-sm justify-center animate-scale-in">
      <Button variant="primary" size="lg">Get Started</Button>
      <Button variant="secondary" size="lg">Learn More</Button>
    </div>
  </div>
</section>
```

### Card Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div className="card-hover">
    <h3 className="text-title mb-xs">Card Title</h3>
    <p className="text-body-small text-light-text-secondary dark:text-dark-text-secondary">
      Card description goes here
    </p>
    <div className="mt-sm flex gap-2xs">
      <span className="badge-primary">Tag</span>
    </div>
  </div>
</div>
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated:** October 22, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

