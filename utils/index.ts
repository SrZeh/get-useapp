/**
 * Barrel file for utility exports
 */

export { formatBRL, shuffle } from "./formatters";
export { calcAvg, renderStars } from "./ratings";
export { uploadImageAsync } from "./upload";

// Upload utilities
export { logger } from "./logger";
export { HapticFeedback } from "./haptics";
export { GradientTypes, type GradientType } from "./gradients";

// Theme utilities
export {
  useThemeColors,
  useThemeValue,
  useThemeColor,
  useGlassColors,
  useGlassBorders,
  useChipColors,
  useButtonColors,
  useThemeMode,
  type ThemeColors,
  type ThemeMode,
} from "./theme";

// Date utilities
export {
  todayLocalISO,
  nextDay,
  diffDaysExclusive,
  enumerateInclusive,
} from "./dates";

// Validation utilities
export {
  validateItemInput,
  phoneSchema,
  cepSchema,
  emailSchema,
  passwordSchema,
  cpfSchema,
  userNameSchema,
  customErrorMap,
  itemTitleSchema,
  itemDescriptionSchema,
  parseDailyRate,
  parseMinRentalDays,
} from "./validation";

// Phone formatter utilities
export {
  formatPhone,
  validatePhone,
  cleanPhone,
  displayPhone,
} from "./phoneFormatter";

// Address utilities
export {
  parseAddress,
  formatAddress,
} from "./address";

// Keyboard navigation utilities
export {
  useKeyboardShortcuts,
  useFormKeyboardNavigation,
} from "./keyboardNavigation";

// Filter utilities
export { filterItems, type ItemFilters } from "./filters";

// Payment utilities
export { getDepositMessage } from "./payments";

// Reservation utilities
export {
  calculateReservationTotal,
  calculateReservationSummary,
} from "./reservations";

// Error handling utilities
export { handleAsyncError } from "./errorHandler";

