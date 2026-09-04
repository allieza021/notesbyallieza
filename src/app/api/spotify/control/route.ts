import { NextResponse } from 'next/server';
import { playSong, pauseSong, nextSong, prevSong } from '@/lib/spotify';

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    let response;
    switch (action) {
      case 'play':
        response = await playSong();
        break;
      case 'pause':
        response = await pauseSong();
        break;
      case 'next':
        response = await nextSong();
        break;
      case 'previous':
        response = await prevSong();
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (response.status === 204 || response.status === 200 || response.status === 202) {
      return NextResponse.json({ success: true });
    }

    // Spotify returns 403 if the user is not Premium or if the app doesn't have permissions
    return NextResponse.json({ error: 'Failed to control playback' }, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
