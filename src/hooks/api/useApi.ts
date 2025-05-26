import { useState, useEffect, useCallback } from 'react';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: ApiMethod;
  body?: any;
  headers?: HeadersInit;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

/**
 * Hook personnalisé pour faciliter les appels API
 * @param url URL de l'API
 * @param options Options de l'appel API
 * @returns État de l'appel API (données, chargement, erreur) et fonctions utilitaires
 */
export function useApi<T>(url: string, options: ApiOptions = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...(options.body && { body: JSON.stringify(options.body) }),
      };

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      setData(responseData);
      
      if (options.onSuccess) {
        options.onSuccess(responseData);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    // Ne pas effectuer l'appel API si la méthode n'est pas GET et qu'il n'y a pas de body
    if (options.method && options.method !== 'GET' && !options.body) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [fetchData]);

  // Fonction pour mettre à jour manuellement les données (par exemple après une mutation)
  const mutate = (newData: T) => {
    setData(newData);
  };

  return { data, loading, error, refetch: fetchData, mutate };
}

/**
 * Hook pour récupérer tous les hangars
 */
export function useHangars() {
  return useApi('/api/hangars');
}

/**
 * Hook pour récupérer tous les lots
 * @param hangarId Filtrer par ID de hangar (optionnel)
 */
export function useBatches(hangarId?: number) {
  const url = hangarId ? `/api/batches?hangarId=${hangarId}` : '/api/batches';
  return useApi(url);
}

/**
 * Hook pour récupérer toutes les équipes
 */
export function useTeams() {
  return useApi('/api/teams');
}

/**
 * Hook pour récupérer tous les utilisateurs
 */
export function useUsers() {
  return useApi('/api/users');
}
