// types/notification.ts
export type NotificationType =
  | "message"
  | "reservation_request"
  | "reservation_status"
  | "payment_update"
  | "review"
  | "system";

export interface AppNotification {
  id?: string;
  recipientId: string;
  type: NotificationType;
  entityType?: "thread" | "reservation" | "payment" | "item" | "user" | "system";
  entityId?: string;
  title?: string;
  body?: string;
  metadata?: Record<string, unknown>;
  createdAt: any; // Firestore Timestamp
  read?: boolean;
  readAt?: any; // Firestore Timestamp
}

export interface UserCounters {
  total: number;
  messages: number;
  reservations: number;
  payments: number;
  interactions: number;
  updatedAt?: any; // Firestore Timestamp
}

export interface UserNotificationPreferences {
  email?: {
    message?: boolean;
    reservation?: boolean;
    payment?: boolean;
    review?: boolean;
    system?: boolean;
  };
  webPush?: {
    enabled?: boolean;
    message?: boolean;
    reservation?: boolean;
    payment?: boolean;
    review?: boolean;
    system?: boolean;
  };
}

export interface LastSeenAt {
  messages?: any; // Firestore Timestamp
  reservations?: any;
  payments?: any;
  interactions?: any;
}

export type CounterKey = keyof Pick<UserCounters, "messages" | "reservations" | "payments" | "interactions">;



