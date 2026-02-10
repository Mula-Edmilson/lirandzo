// utils/lazy-animations.js
export class LazyAnimationObserver {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
      animationClass: 'fade-in',
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
    
    this.animatedElements = new WeakMap();
  }

  observe(element, animationClass = this.options.animationClass) {
    this.animatedElements.set(element, animationClass);
    this.observer.observe(element);
  }

  unobserve(element) {
    this.observer.unobserve(element);
    this.animatedElements.delete(element);
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animationClass = this.animatedElements.get(element);
        
        if (animationClass && !element.classList.contains(animationClass)) {
          element.classList.add(animationClass);
        }
        
        // Optionally unobserve after animation
        if (this.options.unobserveAfterAnimation) {
          this.unobserve(element);
        }
      }
    });
  }

  disconnect() {
    this.observer.disconnect();
    this.animatedElements.clear();
  }
}

// Animation CSS
export const animationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .fade-in {
    animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .fade-in-delayed {
    animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
    opacity: 0;
  }
  
  .staggered > *:nth-child(1) { animation-delay: 0s; }
  .staggered > *:nth-child(2) { animation-delay: 0.05s; }
  .staggered > *:nth-child(3) { animation-delay: 0.1s; }
  .staggered > *:nth-child(4) { animation-delay: 0.15s; }
  .staggered > *:nth-child(5) { animation-delay: 0.2s; }
  .staggered > *:nth-child(n+6) { animation-delay: 0.25s; }
`;