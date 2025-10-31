import { useState, useEffect } from 'react';


const getIsMobile = (breakpoint: number): boolean => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < breakpoint;
  }
  return false;
};

export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState(getIsMobile(breakpoint));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(getIsMobile(breakpoint));
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};
