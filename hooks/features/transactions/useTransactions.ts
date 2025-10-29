/**
 * useTransactions - Hook for fetching transaction/reservation data
 * 
 * Fetches all transactions where the current user is a participant.
 */

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Firestore,
  DocumentData,
} from 'firebase/firestore';

type Tx = DocumentData & { id: string };

interface Options {
  db: Firestore;
  uid?: string | null;
  enabled?: boolean;
  orderField?: string;
  includeClosed?: boolean;
}

export function useTransactions({
  db,
  uid,
  enabled = true,
  orderField = 'updatedAt',
}: Options) {
  const [data, setData] = useState<Tx[]>([]);
  const [loading, setLoading] = useState<boolean>(!!enabled);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!enabled || !uid) {
      setData([]);
      setLoading(false);
      return;
    }

    // Query: all transactions where the user participates
    const q = query(
      collection(db, 'transactions'),
      where('participants', 'array-contains', uid),
      orderBy(orderField, 'desc')
    );

    setLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Tx[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setData(list);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [db, uid, enabled, orderField]);

  return { data, loading, error };
}
