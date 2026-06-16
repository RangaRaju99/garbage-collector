import { useState, useEffect } from 'react';

export function useOS() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const modKey = isMac ? '⌘' : 'Ctrl';
  
  return { isMac, modKey };
}
