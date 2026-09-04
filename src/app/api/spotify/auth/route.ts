import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!client_id || !client_secret) {
    return NextResponse.json({ error: 'Missing client id or secret in .env.local' }, { status: 400 });
  }

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://127.0.0.1:3000/api/spotify/auth'
      })
    });

    const data = await response.json();

    if (data.refresh_token) {
      // Save it automatically to .env.local
      const envPath = path.resolve(process.cwd(), '.env.local');
      let envContent = '';
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch (e) {
        // file doesn't exist
      }

      if (envContent.includes('SPOTIFY_REFRESH_TOKEN=')) {
        envContent = envContent.replace(/SPOTIFY_REFRESH_TOKEN=.*/g, `SPOTIFY_REFRESH_TOKEN="${data.refresh_token}"`);
      } else {
        envContent += `\nSPOTIFY_REFRESH_TOKEN="${data.refresh_token}"\n`;
      }

      fs.writeFileSync(envPath, envContent);

      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; background: #121212; color: white; text-align: center;">
            <h1 style="color: #1DB954; font-size: 3rem; margin-bottom: 10px;">Success! 🎉</h1>
            <p style="font-size: 1.2rem;">Your Spotify Refresh Token was magically generated and saved to your <code>.env.local</code> file!</p>
            <div style="background: rgba(255, 255, 0, 0.1); border: 2px solid yellow; padding: 20px; border-radius: 10px; margin-top: 30px;">
              <h2 style="color: yellow; margin: 0 0 10px 0;">IMPORTANT NEXT STEP:</h2>
              <p style="margin: 0;">You MUST restart your Next.js development server for the keys to load.<br/>Go to your terminal, press <b>Ctrl + C</b> to stop it, and type <b>npm run dev</b> again!</p>
            </div>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    } else {
      return NextResponse.json({ error: 'Failed to get refresh token', details: data });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error', message: error.message });
  }
}
