import React, { useState, useEffect, useRef } from 'react';

/**
 * Hook ottimizzato per gestire cambiamenti di stato legati allo scroll
 * con protezione contro flickering e loop infiniti
 * 
 * @param threshold - Soglia in pixel per attivare il trigger (default: 50)
 * @param hysteresis - Differenza tra soglia up/down per stabilità (default: 20)
 * @param debounceMs - Ritardo minimo tra cambi di stato in ms (default: 50)
 * @returns boolean - true se scrollato oltre la soglia
 */
interface UseScrollTriggerOptions {
  threshold?: number;
  hysteresis?: number;
  debounceMs?: number;
}

export const useScrollTrigger = ({
  threshold = 50,
  hysteresis = 20,
  debounceMs = 50,
}: UseScrollTriggerOptions = {}): boolean => {
  const [isTriggered, setIsTriggered] = useState(false);
  
  // Refs per evitare dipendenze circolari negli useEffect
  const isTriggeredRef = useRef(isTriggered);
  const tickingRef = useRef(false);
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizza ref con state
  useEffect(() => {
    isTriggeredRef.current = isTriggered;
  }, [isTriggered]);

  useEffect(() => {
    // Calcola soglie con hysteresis
    const THRESHOLD_DOWN = threshold;
    const THRESHOLD_UP = Math.max(0, threshold - hysteresis);

    /**
     * Handler ottimizzato per eventi scroll
     * Usa requestAnimationFrame per sincronizzarsi con il browser
     * e debounce per evitare cambi troppo frequenti
     */
    const handleScroll = () => {
      // Throttle: evita multiple chiamate nello stesso frame
      if (tickingRef.current) return;
      
      tickingRef.current = true;
      
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const currentTriggered = isTriggeredRef.current;
        
        // Determina nuovo stato con hysteresis per stabilità
        let shouldBeTriggered = currentTriggered;
        
        if (scrollY > THRESHOLD_DOWN && !currentTriggered) {
          shouldBeTriggered = true;
        } else if (scrollY < THRESHOLD_UP && currentTriggered) {
          shouldBeTriggered = false;
        }
        
        // Applica cambio solo se necessario e dopo debounce
        if (shouldBeTriggered !== currentTriggered) {
          // Cancella timeout precedente se esiste
          if (changeTimeoutRef.current) {
            clearTimeout(changeTimeoutRef.current);
          }
          
          // Debounce per evitare flickering
          changeTimeoutRef.current = setTimeout(() => {
            setIsTriggered(shouldBeTriggered);
            changeTimeoutRef.current = null;
          }, debounceMs);
        }
        
        tickingRef.current = false;
      });
    };

    // Calcola stato iniziale senza animazione
    const initialScrollY = window.scrollY || window.pageYOffset;
    const initialState = initialScrollY > THRESHOLD_DOWN;
    
    if (initialState !== isTriggered) {
      setIsTriggered(initialState);
    }
    
    // Aggiungi listener con passive per performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, [threshold, hysteresis, debounceMs]); // ✅ Solo parametri esterni come dipendenze

  return isTriggered;
};

/**
 * Hook alternativo con IntersectionObserver per elementi specifici
 * Più efficiente per trigger legati a elementi DOM specifici
 * 
 * @param elementRef - Ref all'elemento da osservare
 * @param options - Opzioni IntersectionObserver
 * @returns boolean - true se l'elemento è visibile
 */
export const useIntersectionTrigger = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Fallback per browser senza IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Usa solo entry.isIntersecting per evitare calcoli complessi
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options.threshold, options.rootMargin]);

  return isIntersecting;
};
