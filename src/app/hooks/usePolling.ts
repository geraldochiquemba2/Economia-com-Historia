import { useEffect, useRef, useCallback, useState } from "react";

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchFnRef = useRef(fetchFn);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  fetchFnRef.current = fetchFn;

  const execute = useCallback(async () => {
    try {
      const result = await fetchFnRef.current();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    execute();
    intervalRef.current = setInterval(execute, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, enabled, execute]);

  return { data, loading, error, refetch: execute };
}
