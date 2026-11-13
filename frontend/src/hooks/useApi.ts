import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';

export function useApi<T>(endpoint: string, options?: { immediate?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(options?.immediate !== false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(endpoint);
      setData(result);
      return result;
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error al cargar los datos';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options?.immediate !== false) {
      fetchData();
    }
  }, [fetchData, options?.immediate]);

  return { data, loading, error, refetch: fetchData, setData };
}
