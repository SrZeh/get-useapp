/**
 * Component Barrel File
 * 
 * Centralized exports for all reusable components.
 * Organized by category for easier imports.
 */

// Base UI Components
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Badge } from './Badge';

// Themed Components
export { ThemedText } from './themed-text';
export { ThemedView } from './themed-view';

// Image Components
export { Image as EnhancedImage, default as Image } from './Image';

// Loading Components
export { LoadingSpinner } from './LoadingSpinner';
export { LoadingOverlay } from './LoadingOverlay';
export { ShimmerLoader } from './ShimmerLoader';

// State Components
export { EmptyState } from './states/EmptyState';
export { LoadingState } from './states/LoadingState';

// Liquid Glass Components
export { LiquidGlassView } from './liquid-glass';

// Item Components (moved to features)
// export * from './items'; // Removed - now in features/items

// Form Components
export * from './forms';

// Review Components
export * from './review';

// Reservation Components
export * from './reservation';

// Search Components
export * from './search';

// Feature Components (by domain)
export * from './features/auth';
export * from './features/transactions';
export * from './features/items';

// Layout Components
export { HeaderLogo } from './layouts/HeaderLogo';

// UI Components
export * from './ui/index';

// Other Components
export { AnimatedCard } from './AnimatedCard';
export { CategoryChip } from './CategoryChip';
export { DropdownFilter } from './DropdownFilter';
export { HeaderMenu } from './HeaderMenu';
export { HorizontalCarousel } from './HorizontalCarousel';
export { ImagePickerButton } from './ImagePickerButton';
export { LocationCheckboxFilter } from './LocationCheckboxFilter';
export { PriceInputFilter } from './PriceInputFilter';
export { PriceRangeDropdown } from './PriceRangeDropdown';
export { PriceRangeFilter } from './PriceRangeFilter';
export { ReservationCard } from './ReservationCard';
export { ResponsiveGrid } from './ResponsiveGrid';
export { ScrollableCategories } from './ScrollableCategories';
export { GlobalTabBar } from './GlobalTabBar';
export { Footer } from './Footer';

// Coachmarks
export * from './coachmarks/index';

// Onboarding
export * from './onboarding/index';

// Types
export type * from './types';

