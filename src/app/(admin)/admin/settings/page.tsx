import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/queries/profiles';
import SettingsForm from './SettingsForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = await getProfile();

  // Create a default profile object if none exists
  const safeProfile = profile ?? {
    id: user?.id ?? '',
    full_name: null,
    display_name: null,
    headline: null,
    bio: null,
    avatar_url: null,
    website: null,
    github_url: null,
    facebook_url: null,
    instagram_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <SettingsForm profile={safeProfile} userEmail={user?.email ?? ''} />;
}
