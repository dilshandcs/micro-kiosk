import { useEffect, useMemo, useState } from 'react';
import { useRootNavigationState } from 'expo-router';

/**
 * Custom hook to determine if the navigator is ready.
 * @returns {boolean} - True if the navigator is ready, false otherwise.
 */
export const useNavigationReadyStable = () => {
  const [ready, setReady] = useState(false);
  const navKey = useRootNavigationState()?.key;

  useEffect(() => {
    if (navKey != null && !ready) {
      setReady(true);
    }
  }, [navKey, ready]);
  
  return ready;
}