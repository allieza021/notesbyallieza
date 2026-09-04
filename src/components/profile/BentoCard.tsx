'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function BentoCard({ children, className }: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse position for the glowing spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D rotation
  const rotateX = useSpring(0, { stiffness: 100, damping: 30, mass: 1 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 30, mass: 1 });

  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the card for the spotlight
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);

    // Calculate 3D tilt
    const width = rect.width;
    const height = rect.height;
    
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;

    // Max rotation is 5 degrees to keep it subtle and elegant
    const MAX_ROTATION = 5;
    
    rotateY.set((mouseXFromCenter / (width / 2)) * MAX_ROTATION);
    rotateX.set((mouseYFromCenter / (height / 2)) * -MAX_ROTATION); // Negative so it tilts *towards* the mouse
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      className={cn(
        "relative rounded-3xl overflow-hidden bg-background/50 dark:bg-background/20 border border-primary/10 shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl",
        "h-full w-full",
        className
      )}
    >
      {/* Glowing Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(120, 119, 198, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Content wrapper to stay above the spotlight */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
