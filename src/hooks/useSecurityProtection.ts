'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface SecurityState {
  isDevToolsOpen: boolean;
  isBlurred: boolean;
  screenshotWarning: boolean;
  clearBlur: () => void;
}

export function useSecurityProtection(): SecurityState {
  const pathname = usePathname();
  const [isDevToolsOpen, setIsDevToolsOpen] = useState<boolean>(false);
  const [isBlurred, setIsBlurred] = useState<boolean>(false);
  const [screenshotWarning, setScreenshotWarning] = useState<boolean>(false);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Identify protected routes (data tables, view detail pages, update form pages)
  const isProtectedPage = useMemo(() => {
    if (!pathname) return false;

    // Root dashboard page '/' is an overview page, NOT a data table/view/update page
    if (pathname === '/') return false;

    // Exclude creation, addition, edit, and update pages for copy-paste usability
    if (
      pathname.includes('/create') ||
      pathname.includes('/add') ||
      pathname.includes('/new') ||
      pathname.includes('/edit') ||
      pathname.includes('/update')
    ) {
      return false;
    }

    // All module routes containing sensitive data tables and detail views
    const protectedRoutes = [
      '/currencies',
      '/organizations',
      '/end-users',
      '/subscription-plans',
      '/users',
      '/roles-permission',
      '/settings',
      '/media',
      '/communications',
      '/sidebar-menu',
      '/feature-toggle',
      '/websites',
      '/pages',
      '/support-ticket',
      '/deployments',
      '/system-user',
    ];

    return protectedRoutes.some((route) => pathname.startsWith(route));
  }, [pathname]);

  const clearBlur = useCallback(() => {
    setIsBlurred(false);
  }, []);

  // Helper for clipboard operations (no-op to prevent overwriting user clipboard data)
  const clearClipboard = useCallback(() => {
    // Intentionally no-op to allow system copy-paste across inputs and forms
  }, []);

  // Trigger screenshot warning banner & obscure screen
  const triggerScreenshotWarning = useCallback(() => {
    setScreenshotWarning(true);
    setIsBlurred(true);

    toast.error('Screenshots and screen captures are strictly blocked for security.', {
      id: 'screenshot-blocked-toast',
      duration: 4000,
    });

    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    warningTimerRef.current = setTimeout(() => {
      setScreenshotWarning(false);
      setIsBlurred(false);
    }, 3500);
  }, []);

  // 2. Right-click context menu prevention (allows context menu on inputs/textareas/editors)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('.monaco-editor'))
      ) {
        return; // Allow native context menu on input controls for copy/paste
      }

      e.preventDefault();
      toast.error('Right-click context menu is disabled for security reasons.', {
        id: 'context-menu-disabled-toast',
        duration: 3000,
      });
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // 3. Keyboard shortcut prevention (PrintScreen, Snipping tool, Save, Print, DevTools)
  useEffect(() => {
    const isPrintScreenKey = (e: KeyboardEvent) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code ? e.code.toLowerCase() : '';
      const keyCode = e.keyCode || e.which;

      return (
        keyCode === 44 ||
        key === 'printscreen' ||
        key === 'prtsc' ||
        key === 'prtscn' ||
        key === 'snapshot' ||
        code === 'printscreen' ||
        key === 'sysrq'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code ? e.code.toLowerCase() : '';

      // Check PrintScreen keydown
      if (isPrintScreenKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotWarning();
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) or Cmd + Shift + S
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (key === 's' || code === 'keys')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotWarning();
        return;
      }

      // macOS screenshot shortcuts (Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5)
      if (
        e.metaKey &&
        e.shiftKey &&
        ['3', '4', '5', 'digit3', 'digit4', 'digit5'].includes(key || code)
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotWarning();
        return;
      }

      // Print shortcut (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        clearClipboard();
        toast.error('Printing dashboard pages is prohibited.', {
          id: 'print-prohibited-toast',
        });
        return;
      }

      // Save webpage (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        e.stopPropagation();
        clearClipboard();
        toast.error('Saving admin panel pages is disabled.', {
          id: 'save-prohibited-toast',
        });
        return;
      }

      // View Source (Ctrl+U / Cmd+U)
      if ((e.ctrlKey || e.metaKey) && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Source view is restricted.', {
          id: 'source-prohibited-toast',
        });
        return;
      }

      // DevTools shortcuts (F12, Ctrl+Shift+I/J/C, Cmd+Option+I/J/C)
      if (
        key === 'f12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Developer Tools shortcuts are disabled.', {
          id: 'devtools-shortcut-toast',
        });
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPrintScreenKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotWarning();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [triggerScreenshotWarning, clearClipboard]);

  // 4. Mouse cursor event tracking & focus detection (Active ONLY on data tables, view pages, update pages)
  useEffect(() => {
    if (!isProtectedPage) {
      setIsBlurred(false);
      return;
    }

    // Mouse leaves window boundary -> show content protection layer
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight ||
        !e.relatedTarget
      ) {
        setIsBlurred(true);
        clearClipboard();
      }
    };

    // Mouse enters or moves inside current window -> automatically hide content protection layer
    const handleMouseEnterOrMove = () => {
      setIsBlurred(false);
    };

    const handleBlur = () => {
      setIsBlurred(true);
      clearClipboard();
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        setIsBlurred(true);
        clearClipboard();
      } else {
        setIsBlurred(false);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnterOrMove);
    window.addEventListener('mousemove', handleMouseEnterOrMove);
    window.addEventListener('blur', handleBlur, true);
    window.addEventListener('focus', handleFocus, true);
    document.addEventListener('visibilitychange', handleVisibilityChange, true);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnterOrMove);
      window.removeEventListener('mousemove', handleMouseEnterOrMove);
      window.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange, true);
    };
  }, [isProtectedPage, clearClipboard]);

  // 5. DevTools detection logic
  useEffect(() => {
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      let detected = widthThreshold || heightThreshold;

      if (!detected) {
        const start = performance.now();
        const fn = new Function('debugger');
        fn();
        const end = performance.now();
        if (end - start > 100) {
          detected = true;
        }
      }

      setIsDevToolsOpen(detected);
    };

    const intervalId = setInterval(checkDevTools, 1000);
    window.addEventListener('resize', checkDevTools);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);

  // 6. Continuous Debugger Trap loop when DevTools is open
  useEffect(() => {
    if (!isDevToolsOpen) return;

    const trapInterval = setInterval(() => {
      try {
        const fn = new Function('debugger');
        fn();
      } catch (err) {
        // Silently ignore execution error
      }
    }, 300);

    return () => {
      clearInterval(trapInterval);
    };
  }, [isDevToolsOpen]);

  return {
    isDevToolsOpen,
    isBlurred,
    screenshotWarning,
    clearBlur,
  };
}
