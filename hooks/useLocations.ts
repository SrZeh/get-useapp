/**
 * Hook to fetch unique cities and neighborhoods from Firebase items
 */

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LocationData {
  cities: string[];
  neighborhoods: string[];
}

interface UseLocationsResult {
  cities: string[];
  neighborhoods: string[];
  loading: boolean;
  error: Error | null;
}

/**
 * Fetches unique cities and neighborhoods from published items in Firebase
 * 
 * @returns Object containing cities array, neighborhoods array, loading state, and error
 */
export function useLocations(): UseLocationsResult {
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        setError(null);

        // Query all published items
        const itemsQuery = query(
          collection(db, 'items'),
          where('published', '==', true)
        );

        const snapshot = await getDocs(itemsQuery);
        
        const citySet = new Set<string>();
        const neighborhoodSet = new Set<string>();

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          
          // Add city if it exists and is not empty
          if (data.city && typeof data.city === 'string' && data.city.trim()) {
            citySet.add(data.city.trim());
          }
          
          // Add neighborhood if it exists and is not empty
          if (data.neighborhood && typeof data.neighborhood === 'string' && data.neighborhood.trim()) {
            neighborhoodSet.add(data.neighborhood.trim());
          }
        });

        // Convert sets to sorted arrays
        const sortedCities = Array.from(citySet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
        const sortedNeighborhoods = Array.from(neighborhoodSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        setCities(sortedCities);
        setNeighborhoods(sortedNeighborhoods);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch locations');
        setError(error);
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  return { cities, neighborhoods, loading, error };
}

