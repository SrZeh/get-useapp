/**
 * useHelpRequests - Hook for fetching active help requests
 * 
 * Subscribes to active help requests and filters by neighborhood if provided
 */

import { useEffect, useState } from 'react';
import { subscribeToActiveHelpRequests } from '@/services/helpRequest';
import type { HelpRequest } from '@/types/helpRequest';
import { isExpired } from '@/utils/helpRequest';

export function useHelpRequests(neighborhoods?: string[]) {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToActiveHelpRequests(
      (helpRequests) => {
        // Filter out expired requests (double check)
        const activeRequests = helpRequests.filter((req) => {
          if (req.status !== 'active') return false;
          return !isExpired(req.expiresAt);
        });

        setRequests(activeRequests);
        setLoading(false);
      },
      neighborhoods
    );

    return () => {
      unsubscribe();
    };
  }, [neighborhoods]);

  return { requests, loading, error };
}

