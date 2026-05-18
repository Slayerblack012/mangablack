'use client';

import { useEffect } from 'react';

/**
 * ClientSecurityShield
 * Premium security safeguard that allows F12 to open normally but hijacks console logs,
 * silences warning information, and maintains data obfuscation integrity.
 */
export default function ClientSecurityShield() {
  useEffect(() => {
    // Keep a reference to the real original console log to print our secure banner
    const originalConsoleLog = window.console.log.bind(window.console);
    const noop = () => {};

    // Print the premium system security banner
    const printSecurityBanner = () => {
      try {
        originalConsoleLog(
          "%cMANGA-BLACK SYSTEM SECURITY STATUS: SECURE %c\n\n🛡️ Hệ thống bảo mật tối thượng bảo vệ thông tin. Mọi luồng API và tài nguyên đã được mã hóa bằng Base64 bảo vệ tuyệt đối.",
          "color: #c5a880; font-family: sans-serif; font-size: 16px; font-weight: bold; background: #07090e; padding: 8px 12px; border-radius: 4px; border: 1px solid #c5a880;",
          "color: #a0aec0; font-family: sans-serif; font-size: 12px;"
        );
      } catch (e) {}
    };

    // Hijack and silence standard console methods to hide client-side logs
    window.console.log = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.info = noop;
    window.console.debug = noop;

    // Clear console immediately on mount and display banner
    try {
      window.console.clear();
      printSecurityBanner();
    } catch (e) {}

    // Continuous clear loop to keep DevTools console perfectly pristine and clean
    const consoleClearInterval = setInterval(() => {
      try {
        window.console.clear();
        printSecurityBanner();
      } catch (e) {}
    }, 2000);

    return () => {
      clearInterval(consoleClearInterval);
    };
  }, []);

  return null;
}
