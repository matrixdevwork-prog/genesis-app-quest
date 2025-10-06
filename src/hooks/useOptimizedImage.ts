import { useState, useEffect, useRef } from 'react';

interface UseOptimizedImageProps {
  src: string;
  placeholder?: string;
}

/**
 * Hook for lazy loading images with intersection observer
 */
export const useOptimizedImage = ({ src, placeholder }: UseOptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image is visible
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return { imageSrc, isLoaded, imgRef, handleLoad };
};
