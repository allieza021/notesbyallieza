import { NextResponse } from 'next/server';
import { getNowPlaying } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await getNowPlaying();

    if (response.status === 204 || response.status > 400) {
      const errorText = response.status > 400 ? await response.text() : 'No content';
      return NextResponse.json({ 
        isPlaying: false, 
        debug: {
          status: response.status,
          errorText,
          idStart: process.env.SPOTIFY_CLIENT_ID?.substring(0, 5),
          secretStart: process.env.SPOTIFY_CLIENT_SECRET?.substring(0, 5),
          tokenStart: process.env.SPOTIFY_REFRESH_TOKEN?.substring(0, 5),
        }
      });
    }

    const song = await response.json();

    if (song.item === null) {
      return NextResponse.json({ isPlaying: false });
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((_artist: { name: string }) => _artist.name).join(', ');
    const album = song.item.album.name;
    const albumImageUrl = song.item.album.images[0].url;
    const songUrl = song.item.external_urls.spotify;
    const progress_ms = song.progress_ms || 0;
    const duration_ms = song.item.duration_ms || 0;
    let previewUrl = song.item.preview_url || null;

    // iTunes API Fallback to bypass Spotify's regional copyright blocks
    if (!previewUrl) {
      try {
        // Only use the first artist for better search matching
        const firstArtist = song.item.artists[0]?.name || '';
        const searchQuery = encodeURIComponent(`${title} ${firstArtist}`);
        const itunesRes = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&media=music&limit=1`);
        if (itunesRes.ok) {
          const itunesData = await itunesRes.json();
          if (itunesData.results && itunesData.results.length > 0) {
            previewUrl = itunesData.results[0].previewUrl || null;
          }
        }
      } catch (e) {
        console.error("iTunes fallback failed", e);
      }
    }

    return NextResponse.json({
      album,
      albumImageUrl,
      artist,
      isPlaying,
      songUrl,
      title,
      progress_ms,
      duration_ms,
      previewUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ isPlaying: false, error: error.message || 'Unknown error' }, { status: 200 });
  }
}
