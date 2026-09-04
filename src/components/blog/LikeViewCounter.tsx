'use client';

import { useState, useEffect } from 'react';
import { Eye, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface LikeViewCounterProps {
  slug: string;
  initialViews: number;
  initialLikes: number;
}

export default function LikeViewCounter({ slug, initialViews, initialLikes }: LikeViewCounterProps) {
  const [views, setViews] = useState(initialViews || 0);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check if user has already liked this post using localStorage
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '{}');
    if (likedPosts[slug]) {
      setHasLiked(true);
    }

    // Increment view counter on mount
    const incrementView = async () => {
      // Prevent double counting in dev mode (React Strict Mode)
      const viewedKey = `viewed_${slug}`;
      if (sessionStorage.getItem(viewedKey)) return;
      sessionStorage.setItem(viewedKey, 'true');

      // Optimistic update
      setViews((prev) => prev + 1);

      try {
        await supabase.rpc('increment_blog_view', { blog_slug: slug });
      } catch (error) {
        console.error('Failed to increment view', error);
      }
    };

    incrementView();
  }, [slug, supabase]);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '{}');

    if (hasLiked) {
      // Unlike logic
      setHasLiked(false);
      setLikes((prev) => Math.max(0, prev - 1));
      
      delete likedPosts[slug];
      localStorage.setItem('liked_posts', JSON.stringify(likedPosts));

      try {
        await supabase.rpc('decrement_blog_like', { blog_slug: slug });
      } catch (error) {
        console.error('Failed to decrement like', error);
        // Revert if failed
        setHasLiked(true);
        setLikes((prev) => prev + 1);
        likedPosts[slug] = true;
        localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
      } finally {
        setIsLiking(false);
      }
    } else {
      // Like logic
      setHasLiked(true);
      setLikes((prev) => prev + 1);

      // Trigger confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ef4444', '#f87171', '#fca5a5']
      });

      likedPosts[slug] = true;
      localStorage.setItem('liked_posts', JSON.stringify(likedPosts));

      try {
        await supabase.rpc('increment_blog_like', { blog_slug: slug });
      } catch (error) {
        console.error('Failed to increment like', error);
        // Revert if failed
        setHasLiked(false);
        setLikes((prev) => Math.max(0, prev - 1));
        delete likedPosts[slug];
        localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
      } finally {
        setIsLiking(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-4 text-sm font-medium">
      <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
        <Eye className="w-4 h-4" />
        <span>{views} {views === 1 ? 'view' : 'views'}</span>
      </div>

      <button
        onClick={handleLike}
        disabled={isLiking}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300",
          hasLiked
            ? "bg-red-50 text-red-500 border-red-200 dark:bg-red-950/30 dark:border-red-900/50 hover:bg-red-100 cursor-pointer"
            : "bg-muted/50 text-muted-foreground border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer"
        )}
        aria-label={hasLiked ? "Unlike this post" : "Like this post"}
      >
        <Heart className={cn("w-4 h-4 transition-transform", hasLiked && "fill-current scale-110")} />
        <span>{likes}</span>
      </button>
    </div>
  );
}
