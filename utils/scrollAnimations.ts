declare global {
  interface Window {
    __schScrollObserver?: IntersectionObserver;
    __schMutationObserver?: MutationObserver;
    __schReduceMotionApplied?: boolean;
  }
}

const attachElementsToObserver = (observer: IntersectionObserver) => {
  const elements = document.querySelectorAll<HTMLElement>('.animate-on-scroll:not(.scroll-observed)');
  elements.forEach((el) => {
    el.classList.add('scroll-observed');
    observer.observe(el);
  });
};

export const initScrollAnimations = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll<HTMLElement>('.animate-on-scroll').forEach((el) => {
      el.classList.add('has-animated', 'fade-in-up');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    if (!window.__schReduceMotionApplied) {
      document.querySelectorAll<HTMLElement>('.animate-on-scroll').forEach((el) => {
        el.classList.add('has-animated');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      window.__schReduceMotionApplied = true;
    }
    return;
  }

  if (!window.__schScrollObserver) {
    window.__schScrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('has-animated', 'fade-in-up');
            window.__schScrollObserver?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );
  }

  attachElementsToObserver(window.__schScrollObserver);

  if (!window.__schMutationObserver) {
    window.__schMutationObserver = new MutationObserver(() => {
      attachElementsToObserver(window.__schScrollObserver!);
    });

    const target = document.getElementById('main-content') ?? document.body;
    window.__schMutationObserver.observe(target, { childList: true, subtree: true });
  }
};

export const destroyScrollAnimations = () => {
  window.__schMutationObserver?.disconnect();
  window.__schScrollObserver?.disconnect();
  delete window.__schMutationObserver;
  delete window.__schScrollObserver;
  delete window.__schReduceMotionApplied;
};
