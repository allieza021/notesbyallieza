'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Play, Pause, Music, AlertCircle } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  query: string;
  coverUrl?: string;
  previewUrl?: string;
}

const INITIAL_SONGS: Song[] = [
  { id: '1', title: 'Meaningful Silence', artist: 'The Ridleys', query: 'Meaningful Silence The Ridleys' },
  { id: '2', title: 'Things Will Be Okay', artist: 'A Kid Named Rufus', query: 'Things Will Be Okay A Kid Named Rufus' },
  { id: '3', title: 'My Favorite Clothes', artist: 'RINI', query: 'My Favorite Clothes RINI' },
  { id: '4', title: 'It all makes sense', artist: 'The Ridleys', query: 'It all makes sense The Ridleys' },
  { id: '5', title: 'Reside', artist: 'SUGARCANE', query: 'Reside SUGARCANE' },
];

export default function TopSongs() {
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Fetch preview URLs and artwork from iTunes API
    const fetchSongData = async () => {
      try {
        const updatedSongs = await Promise.all(
          INITIAL_SONGS.map(async (song) => {
            const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song.query)}&entity=song&limit=1`);
            if (res.ok) {
              const data = await res.json();
              if (data.results && data.results.length > 0) {
                const track = data.results[0];
                return {
                  ...song,
                  coverUrl: track.artworkUrl100?.replace('100x100bb', '300x300bb'),
                  previewUrl: track.previewUrl,
                };
              }
            }
            return song;
          })
        );
        setSongs(updatedSongs);
      } catch (err) {
        console.error("Failed to fetch song data", err);
        setError(true);
      }
    };

    fetchSongData();

    // Setup audio element
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;

    const handleEnded = () => {
      setPlayingId(null);
      setProgress(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const updateProgress = () => {
    if (audioRef.current && playingId) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 30; // Previews are typically 30s
      setProgress((current / duration) * 100);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = (song: Song) => {
    if (!audioRef.current || !song.previewUrl) return;

    if (playingId === song.id) {
      audioRef.current.pause();
      setPlayingId(null);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      audioRef.current.src = song.previewUrl;
      audioRef.current.play()
        .then(() => {
          setPlayingId(song.id);
          animationRef.current = requestAnimationFrame(updateProgress);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          setPlayingId(null);
        });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
        <Music className="w-4 h-4" /> My Top 5 Songs
      </h3>
      
      {error && (
        <div className="text-xs text-destructive flex items-center gap-1 mb-2">
          <AlertCircle className="w-3 h-3" /> Failed to load some song previews.
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {songs.map((song) => (
          <div 
            key={song.id}
            className={`flex-1 relative flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-4 p-3 md:p-5 rounded-xl border transition-all duration-300 ${
              playingId === song.id 
                ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(79,70,229,0.2)]' 
                : 'bg-background border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            {/* Artwork */}
            <div className="relative w-16 h-16 md:w-full md:aspect-square rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center shadow-md">
              {song.coverUrl ? (
                <img src={song.coverUrl} alt={song.title} className="object-cover w-full h-full" />
              ) : (
                <Music className="w-8 h-8 text-muted-foreground opacity-30" />
              )}
              
              {/* Play Button Overlay */}
              {song.previewUrl && (
                <button
                  onClick={() => togglePlay(song)}
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity ${playingId === song.id ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                  aria-label={playingId === song.id ? "Pause" : "Play"}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-transform shadow-xl">
                    {playingId === song.id ? (
                      <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-1" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full min-w-0 flex flex-col justify-center md:items-center">
              <h4 className={`font-bold text-sm md:text-base truncate w-full ${playingId === song.id ? 'text-primary' : 'text-foreground'}`}>
                {song.title}
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground truncate font-medium w-full">
                {song.artist}
              </p>
              
              {/* Progress Bar */}
              {playingId === song.id && (
                <div className="mt-3 h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Unavailable State */}
            {!song.previewUrl && (
              <div className="absolute top-2 right-2 md:static md:mt-2 text-[10px] uppercase font-bold text-muted-foreground bg-muted border border-border px-2 py-1 rounded-full whitespace-nowrap">
                No Preview
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
