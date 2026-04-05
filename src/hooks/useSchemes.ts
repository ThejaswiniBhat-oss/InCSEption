import { useEffect, useState, useCallback } from 'react';
import { fetchSchemes } from '../services/api';
import type { Scheme } from '../types/api';

export function useSchemes(query: string) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSchemes(query || undefined);
      setSchemes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load schemes');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  return { schemes, loading, error, refetch: load };
}
