/**
 * User profile-related type definitions
 */

import type { FirestoreTimestamp, FirestoreDocument } from './firestore';
import type { User as FirebaseUser } from 'firebase/auth';

/**
 * User profile document stored in Firestore
 */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  address?: string;
  photoURL?: string | null;
  
  // Rating fields
  ratingAvg?: number;
  ratingCount?: number;
  
  // Transaction stats
  transactionsTotal?: number;
  
  // Verification flags
  emailVerified?: boolean;
  phoneVerified?: boolean;
  
  // Timestamps
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

/**
 * User document as stored in Firestore
 */
export type UserDocument = FirestoreDocument<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>;

/**
 * Input type for creating/updating a user profile
 */
export interface UserProfileInput {
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  address?: string;
  photoURL?: string | null;
}

/**
 * Combined type for authenticated user (Firebase Auth + Profile)
 */
export interface AuthenticatedUser {
  authUser: FirebaseUser;
  profile: UserProfile | null;
}

/**
 * Type guard to check if an object is a valid UserProfile
 */
export function isUserProfile(obj: unknown): obj is UserProfile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'uid' in obj &&
    'name' in obj &&
    'email' in obj &&
    typeof (obj as { uid: unknown }).uid === 'string' &&
    typeof (obj as { name: unknown }).name === 'string' &&
    typeof (obj as { email: unknown }).email === 'string'
  );
}

