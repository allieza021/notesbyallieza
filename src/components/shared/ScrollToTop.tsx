'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        "fixed bottom-6 right-6 p-3 rounded-full transition-all duration-300 z-50",
        "bg-background text-foreground",
        "shadow-[6px_6px_14px_rgba(0,0,0,0.1),-6px_-6px_14px_rgba(255,255,255,0.7)]", // Light mode shadow
        "dark:shadow-[6px_6px_14px_rgba(0,0,0,0.5),-6px_-6px_14px_rgba(255,255,255,0.05)]", // Dark mode shadow
        "active:shadow-[inset_6px_6px_14px_rgba(0,0,0,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.7)]", // Light pressed
        "dark:active:shadow-[inset_6px_6px_14px_rgba(0,0,0,0.5),inset_-6px_-6px_14px_rgba(255,255,255,0.05)]", // Dark pressed
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
