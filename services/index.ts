/**
 * Barrel file for service exports
 */

export * from "./cloudFunctions";
export * from "./items";
export * from "./uploadImage";
export * from "./reservations";
export * from "./reviews";

// Service interfaces for dependency injection (OCP)
export * from "./interfaces";

// Service implementations (can be swapped for testing/mocking)
export * from "./implementations";

