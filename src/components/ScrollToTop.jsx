import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // For HashRouter, the pathname includes everything after `#`
    // We still want to scroll to top on every route change
    window.scrollTo(0, 0);
  }, [pathname, hash, key]);

  return null;
}