const client_id = process.env.SPOTIFY_CLIENT_ID?.replace(/"/g, '')?.trim();
const client_secret = process.env.SPOTIFY_CLIENT_SECRET?.replace(/"/g, '')?.trim();
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN?.replace(/"/g, '')?.trim();

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token || '',
    }),
    cache: 'no-store',
  });

  return response.json();
};

export const getNowPlaying = async () => {
  const { access_token } = await getAccessToken();

  if (!access_token) {
    return new Response(null, { status: 401 });
  }

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-store',
  });
};

const PLAY_ENDPOINT = `https://api.spotify.com/v1/me/player/play`;
const PAUSE_ENDPOINT = `https://api.spotify.com/v1/me/player/pause`;
const NEXT_ENDPOINT = `https://api.spotify.com/v1/me/player/next`;
const PREV_ENDPOINT = `https://api.spotify.com/v1/me/player/previous`;

export const playSong = async () => {
  const { access_token } = await getAccessToken();
  return fetch(PLAY_ENDPOINT, { method: 'PUT', headers: { Authorization: `Bearer ${access_token}` } });
};

export const pauseSong = async () => {
  const { access_token } = await getAccessToken();
  return fetch(PAUSE_ENDPOINT, { method: 'PUT', headers: { Authorization: `Bearer ${access_token}` } });
};

export const nextSong = async () => {
  const { access_token } = await getAccessToken();
  return fetch(NEXT_ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${access_token}` } });
};

export const prevSong = async () => {
  const { access_token } = await getAccessToken();
  return fetch(PREV_ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${access_token}` } });
};
