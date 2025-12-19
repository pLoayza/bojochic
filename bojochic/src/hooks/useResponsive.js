// src/hooks/useResponsive.js
import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    // Booleanos útiles
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
    isSmallMobile: windowSize.width < 480,
    
    // Tamaño exacto
    width: windowSize.width,
    height: windowSize.height,
    
    // Valores responsive comunes
    padding: windowSize.width < 768 ? '20px' : '50px',
    fontSize: {
      small: windowSize.width < 768 ? '12px' : '14px',
      normal: windowSize.width < 768 ? '14px' : '16px',
      large: windowSize.width < 768 ? '18px' : '22px',
      xlarge: windowSize.width < 768 ? '24px' : '32px',
    },
    gap: windowSize.width < 768 ? '10px' : '20px',
    maxWidth: windowSize.width < 768 ? '100%' : '1200px',
  };
};

// Hook más específico para media queries
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};