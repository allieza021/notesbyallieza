import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';

/** Fetch the admin profile (first/only profile) */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();
  if (error || !data) return null;
  return data;
}

/** Fetch profile by user ID */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data;
}
