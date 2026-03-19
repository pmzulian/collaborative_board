import { useCallback } from 'react';

interface UseKeyboardNavigationOptions {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
}

/**
 * Returns a keydown handler that maps common keyboard interactions
 * to accessible actions (Enter, Space, Escape).
 */
export function useKeyboardNavigation({
  onEnter,
  onSpace,
  onEscape,
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          onEnter?.();
          break;
        case ' ':
          e.preventDefault();
          onSpace?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    },
    [onEnter, onSpace, onEscape]
  );

  return { handleKeyDown };
}
