import { useSyncExternalStore, useCallback } from 'react';

export function useMediaQuery(query) {
  const subscribe = useCallback((callback) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
  }, [query]);

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
