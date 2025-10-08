// src/hooks/useTransactions.ts
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
  uid?: string | null;               // passe o uid do usuário logado
  enabled?: boolean;                 // para evitar rodar sem uid
  orderField?: string;               // default: 'updatedAt'
  includeClosed?: boolean;           // se quiser filtrar status depois
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

    // UMA consulta: todas as transações onde o usuário participa
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

    return () => unsub(); // evita vazamento de listeners
  }, [db, uid, enabled, orderField]);

  return { data, loading, error };
}
