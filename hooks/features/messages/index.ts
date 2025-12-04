/**
 * Messages Feature Hooks - Barrel Export
 */

// Export principal: use collectionGroup query (mais eficiente)
export { useUnreadMessagesDot } from './useUnreadMessagesDot';

// Export legado (deprecated): mantido para compatibilidade
// @deprecated Use useUnreadMessagesDot from './useUnreadMessagesDot' instead
export { useUnreadMessagesDot as useUnreadMessagesDotLegacy } from './useUnreadMessages';
