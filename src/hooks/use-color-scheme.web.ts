import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // This is a necessary pattern for web hydration to work correctly
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  // Return color scheme only after hydration
  if (hasHydrated) {
    return colorScheme;
  }

  // During SSR, always return 'light' to avoid hydration mismatch
  return 'light';
}
