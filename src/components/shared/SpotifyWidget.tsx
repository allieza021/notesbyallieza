'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Music2, Play, Pause, SkipForward, SkipBack, X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type SpotifyData = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  progress_ms?: number;
  duration_ms?: number;
  previewUrl?: string | null;
};

export function SpotifyWidget({ className }: { className?: string }) {
  const [data, setData] = useState<SpotifyData | null>(null);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify/now-playing');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLocalIsPlaying(json.isPlaying);
      }
    } catch (e) {
      console.error('Error fetching Spotify data', e);
    }
  }, []);

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);


  return (
    <AnimatePresence mode="wait">
      {(data?.isPlaying || localIsPlaying) && !isMinimized && (
        <motion.div
          key="expanded"
          initial={{ x: 50, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 50, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={cn(
            "fixed top-20 right-6 z-[100] h-14 rounded-full flex items-center pr-2 pl-1.5 gap-3",
            "bg-white/10 dark:bg-black/20 backdrop-blur-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
            "border border-white/20 dark:border-white/10 hover:border-[#1DB954]/50 transition-colors duration-500",
            "hover:shadow-[0_0_20px_rgba(29,185,84,0.15)]",
            className
          )}
        >
          {/* Album Art Circle */}
          <a href={data?.songUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 relative group">
            <div className="w-11 h-11 rounded-full overflow-hidden shadow-sm">
              {data?.albumImageUrl ? (
                <img
                  src={data.albumImageUrl}
                  alt={data.album || 'Album art'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
            {/* Play icon overlay on hover of album art */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
          </a>

          {/* Scrolling Text (Song & Artist) */}
          <div className="flex flex-col min-w-[120px] max-w-[160px] justify-center overflow-hidden h-full py-2">
            <a 
              href={data?.songUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-foreground truncate hover:underline decoration-[#1DB954] underline-offset-2 leading-tight"
            >
              {data?.title}
            </a>
            <span className="text-[10px] text-muted-foreground truncate leading-tight">
              {data?.artist}
            </span>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center gap-1.5 ml-1">
            {/* Now Playing Indicator (Animated Equalizer) */}
            <div className="flex items-center gap-2 mr-1 ml-1" title="Listening right now">
              <div className="flex items-end gap-[3px] h-3.5">
                <div className="w-[3px] bg-[#1DB954] rounded-full animate-[bounce_1s_ease-in-out_infinite] h-full" />
                <div className="w-[3px] bg-[#1DB954] rounded-full animate-[bounce_1.2s_ease-in-out_infinite_0.2s] h-2/3" />
                <div className="w-[3px] bg-[#1DB954] rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.4s] h-4/5" />
              </div>
            </div>

            {/* Visitor Audio Preview Control */}
            <div className="flex items-center relative">
              <button
                onClick={() => {
                  if (!data?.previewUrl) {
                    // Show a tiny tooltip
                    const tooltip = document.getElementById('spotify-tooltip');
                    if (tooltip) {
                      tooltip.style.opacity = '1';
                      setTimeout(() => { tooltip.style.opacity = '0'; }, 3000);
                    }
                    return;
                  }
                  
                  const audio = audioRef.current;
                  if (audio) {
                    if (audio.paused) {
                      audio.volume = 0.5;
                      audio.play().catch(e => console.error("Audio play failed:", e));
                      setLocalIsPlaying(true); 
                    } else {
                      audio.pause();
                      setLocalIsPlaying(false);
                    }
                  }
                }}
                className="w-7 h-7 rounded-full bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center transition-all ml-1"
                title="Play preview"
                id="spotify-play-btn"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
              
              {/* Tooltip for missing preview */}
              <div 
                id="spotify-tooltip" 
                className="absolute top-10 right-0 w-48 p-2 bg-black/90 text-white text-[10px] rounded-lg shadow-lg border border-white/10 opacity-0 transition-opacity pointer-events-none z-[110]"
              >
                Spotify disabled the audio preview for this specific song due to copyright. Try playing an international artist on your Spotify!
              </div>

              {data?.previewUrl && (
                <audio 
                  ref={audioRef}
                  src={data.previewUrl} 
                  className="hidden"
                  onPlay={() => {
                    const btn = document.getElementById('spotify-play-btn');
                    if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>';
                  }}
                  onPause={() => {
                    const btn = document.getElementById('spotify-play-btn');
                    if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play ml-0.5"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
                  }}
                  onEnded={() => {
                    const btn = document.getElementById('spotify-play-btn');
                    if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play ml-0.5"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
                  }}
                />
              )}
            </div>
            
            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Hide Toggle */}
            <button
              onClick={() => setIsMinimized(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
              title="Hide player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {(data?.isPlaying || localIsPlaying) && isMinimized && (
        <motion.button
          key="minimized"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setIsMinimized(false)}
          className={cn(
            "fixed top-20 right-0 z-[100] h-12 w-12 rounded-l-full flex items-center justify-center cursor-pointer",
            "bg-white/10 dark:bg-black/20 backdrop-blur-[32px] border border-r-0 border-white/20 dark:border-white/10 shadow-lg hover:border-[#1DB954]/50 transition-all",
            "group overflow-hidden"
          )}
          title="Show player"
        >
          {data?.albumImageUrl ? (
            <img 
              src={data.albumImageUrl} 
              alt="Album" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" 
            />
          ) : null}
          <ChevronLeft className="w-5 h-5 text-foreground relative z-10 group-hover:-translate-x-0.5 transition-transform" />
          {localIsPlaying && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
