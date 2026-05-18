'use client';

import { useEffect } from 'react';

/**
 * ClientSecurityShield
 * Premium security safeguard that allows F12 to open normally but completely silences
 * and clears the browser console periodically without printing any logs or banners.
 */
export default function ClientSecurityShield() {
  useEffect(() => {
    const noop = () => {};

    // Hijack and silence standard console methods to hide client-side logs completely
    window.console.log = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.info = noop;
    window.console.debug = noop;

    // Clear console immediately on mount to remove Next.js default startup messages
    try {
      window.console.clear();
    } catch (e) {}

    // Continuous clear loop to keep DevTools console perfectly pristine and clean of any logs
    const consoleClearInterval = setInterval(() => {
      try {
        window.console.clear();
      } catch (e) {}
    }, 2000);

    return () => {
      clearInterval(consoleClearInterval);
    };
  }, []);

  return null;
}
