/**
 * Type-safe Firestore collection helpers
 * Provides typed collection references and document converters
 */

import {
  collection,
  CollectionReference,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  WithFieldValue,
} from "firebase/firestore";
import type {
  Item,
  ItemDocument,
  Reservation,
  ReservationDocument,
  Transaction,
  TransactionDocument,
  UserProfile,
  UserProfileDocument,
  Review,
  ReviewDocument,
} from "@/types";

/**
 * Type-safe collection reference creator
 */
export function typedCollection<T extends DocumentData>(
  firestore: Firestore,
  collectionPath: string,
  converter?: FirestoreDataConverter<T>
): CollectionReference<T> {
  return collection(
    firestore,
    collectionPath
  ) as CollectionReference<T>;
}

/**
 * Items collection converter
 */
export const itemConverter: FirestoreDataConverter<Item> = {
  toFirestore(item: WithFieldValue<Item>): ItemDocument {
    const { id, createdAt, updatedAt, ...data } = item as Item;
    return {
      ...data,
    } as ItemDocument;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<ItemDocument>, options?: any): Item {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    } as Item;
  },
};

/**
 * Reservations collection converter
 */
export const reservationConverter: FirestoreDataConverter<Reservation> = {
  toFirestore(reservation: WithFieldValue<Reservation>): ReservationDocument {
    const { id, createdAt, updatedAt, ...data } = reservation as Reservation;
    return {
      ...data,
    } as ReservationDocument;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<ReservationDocument>, options?: any): Reservation {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      paidAt: data.paidAt ?? null,
      pickedUpAt: data.pickedUpAt ?? null,
      returnedAt: data.returnedAt ?? null,
    } as Reservation;
  },
};

/**
 * Transactions collection converter
 */
export const transactionConverter: FirestoreDataConverter<Transaction> = {
  toFirestore(transaction: WithFieldValue<Transaction>): TransactionDocument {
    const { id, createdAt, updatedAt, ...data } = transaction as Transaction;
    return {
      ...data,
    } as TransactionDocument;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<TransactionDocument>, options?: any): Transaction {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    } as Transaction;
  },
};

/**
 * User profiles collection converter
 */
export const userProfileConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore(profile: WithFieldValue<UserProfile>): UserProfileDocument {
    const { uid, createdAt, updatedAt, ...data } = profile as UserProfile;
    return {
      ...data,
    } as UserProfileDocument;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<UserProfileDocument>, options?: any): UserProfile {
    const data = snapshot.data(options);
    return {
      uid: snapshot.id,
      ...data,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    } as UserProfile;
  },
};

/**
 * Reviews collection converter
 */
export const reviewConverter: FirestoreDataConverter<Review> = {
  toFirestore(review: WithFieldValue<Review>): ReviewDocument {
    const { id, createdAt, ...data } = review as Review;
    return {
      ...data,
    } as ReviewDocument;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<ReviewDocument>, options?: any): Review {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt ?? null,
    } as Review;
  },
};

/**
 * Type-safe collection references with converters
 */
export function itemsCollection(firestore: Firestore): CollectionReference<Item> {
  return collection(firestore, "items").withConverter(itemConverter);
}

export function reservationsCollection(firestore: Firestore): CollectionReference<Reservation> {
  return collection(firestore, "reservations").withConverter(reservationConverter);
}

export function transactionsCollection(firestore: Firestore): CollectionReference<Transaction> {
  return collection(firestore, "transactions").withConverter(transactionConverter);
}

export function usersCollection(firestore: Firestore): CollectionReference<UserProfile> {
  return collection(firestore, "users").withConverter(userProfileConverter);
}

export function reviewsCollection(firestore: Firestore, itemId: string): CollectionReference<Review> {
  return collection(firestore, "items", itemId, "reviews").withConverter(reviewConverter);
}

