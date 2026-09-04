'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface CategoryCardProps {
  slug: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon: React.ReactNode;
}

export default function CategoryCard({ slug, name, description, color, icon }: CategoryCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 150, damping: 20, mass: 0.8 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20, mass: 0.8 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    rotateY.set((cx / (rect.width / 2)) * 6);
    rotateX.set((cy / (rect.height / 2)) * -6);
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="relative"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 z-20"
        style={{
          opacity: isHovered ? 1 : 0,
          background: useMotionTemplate`
            radial-gradient(200px circle at ${mouseX}px ${mouseY}px, rgba(120,119,198,0.15), transparent 80%)
          `,
        }}
      />
      <Link
        href={`/blog?category=${slug}`}
        className="group relative flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-200"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
          style={{ backgroundColor: color || '#4f46e5' }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{name}</div>
          {description && (
            <div className="text-xs text-muted-foreground truncate">{description}</div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
