import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useHeader } from '@/context/HeaderContext';

/**
 * Hook to update the header title and back button visibility when the screen is focused.
 *
 * @param title - The title to display in the header
 * @param showBack - Whether to show the back button
 */
export function useHeaderConfig(title: string, showBack: boolean = true) {
  const { setTitle, setShowBack } = useHeader();

  useFocusEffect(
    useCallback(() => {
      setTitle(title);
      setShowBack(showBack);
    }, [title, showBack])
  );
}
