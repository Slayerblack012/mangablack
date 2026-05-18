'use client';

import { useEffect } from 'react';

/**
 * ClientSecurityShield
 * Premium security safeguard component that blocks standard browser page source inspection,
 * prevents right-clicks, intercept developer shortcuts, and deploys active DevTools debugger traps.
 */
export default function ClientSecurityShield() {
  useEffect(() => {
    // 1. Block right-click context menu entirely
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Block sensitive keyboard shortcuts (F12, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+U (View Page Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+S (Save Webpage)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect consoles)
      if (
        e.ctrlKey && 
        e.shiftKey && 
        (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. DevTools Intruder Freeze Trap (Debugger loop)
    // Automatically triggers debugger pause when Developer Tools panel is forced open, freezing browser inspector
    const debuggerInterval = setInterval(() => {
      (function() {
        try {
          (function a(i) {
            if (("" + i / i).length !== 1 || i % 20 === 0) {
              (function() {}).constructor("debugger")();
            } else {
              debugger;
            }
            a(++i);
          })(0);
        } catch (e) {}
      })();
    }, 1000);

    // Apply active event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(debuggerInterval);
    };
  }, []);

  return null;
}
