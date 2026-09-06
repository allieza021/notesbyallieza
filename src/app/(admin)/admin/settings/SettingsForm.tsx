'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Save, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/admin/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { profileSchema } from '@/lib/validations';
import type { Profile } from '@/types';

interface SettingsFormProps {
  profile: Profile;
  userEmail: string;
}

export default function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    display_name: profile.display_name || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    website: profile.website || '',
    github_url: profile.github_url || '',
    facebook_url: profile.facebook_url || '',
    instagram_url: profile.instagram_url || '',
    public_email: profile.public_email || '',
    show_spotify: profile.show_spotify ?? true,
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess('');

    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { fe[e.path[0] as string] = e.message; });
      setErrors(fe);
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...form, updated_at: new Date().toISOString() });

      if (error) throw error;
      setSuccess('Profile saved successfully!');
    } catch (err: any) {
      setErrors({ _global: err.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.');
      return;
    }

    setChangingPwd(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwdSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-black text-3xl text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your public profile and account settings.</p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">
            Public Profile
          </h2>

          {/* Avatar */}
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-border">
                {form.avatar_url ? (
                  <Image src={form.avatar_url} alt="Avatar" width={80} height={80} className="object-cover" />
                ) : (
                  <span className="text-2xl font-black text-primary">A</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <Label className="mb-2 block">Profile Picture</Label>
              <ImageUpload
                bucket="avatars"
                currentUrl={form.avatar_url}
                onUpload={(url) => set('avatar_url', url)}
                onRemove={() => set('avatar_url', '')}
                label="Upload Photo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Your full name" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" value={form.display_name} onChange={(e) => set('display_name', e.target.value)} placeholder="How you appear publicly" />
              {errors.display_name && <p className="text-xs text-destructive">{errors.display_name}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline / Title</Label>
            <Input id="headline" value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. BS Information Technology Student" />
            {errors.headline && <p className="text-xs text-destructive">{errors.headline}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="A short description about yourself…" rows={4} />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email-display">Email (Account)</Label>
            <Input id="email-display" value={userEmail} disabled className="bg-muted opacity-70" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">
            Social Links
          </h2>
          {[
            { key: 'public_email', label: 'Public Email (Gmail)', placeholder: 'your@gmail.com', type: 'email' },
            { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com', type: 'url' },
            { key: 'github_url', label: 'GitHub', placeholder: 'https://github.com/username', type: 'url' },
            { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/username', type: 'url' },
            { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/username', type: 'url' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                type={type}
              />
              {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
            </div>
          ))}
        </div>

        {/* Widget Settings */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-bold text-lg text-foreground border-b border-border pb-3 flex items-center gap-2">
            Widget Settings
          </h2>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Show Live Spotify Widget</Label>
              <p className="text-xs text-muted-foreground">
                Display the currently playing Spotify track on your website footer/navbar to public viewers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('show_spotify', !form.show_spotify as any)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                form.show_spotify ? 'bg-primary' : 'bg-input'
              }`}
            >
              <span className="sr-only">Toggle Spotify Widget</span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  form.show_spotify ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
                    </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border mt-4">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Show Top 5 Songs</Label>
                <p className="text-xs text-muted-foreground">
                  Display your Top 5 Songs section on your public profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => set('show_top_songs', !form.show_top_songs as any)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background `}
              >
                <span className="sr-only">Toggle Top Songs</span>
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out `}
                />
              </button>
            </div>
          </div>

        {/* Global error / success */}
        {errors._global && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {errors._global}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        <Button type="submit" size="lg" disabled={saving} id="save-profile-button">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </Button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordChange} className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-bold text-lg text-foreground border-b border-border pb-3 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" />
          Change Password
        </h2>

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
        </div>

        {pwdError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {pwdError}
          </div>
        )}
        {pwdSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" /> {pwdSuccess}
          </div>
        )}

        <Button type="submit" variant="outline" disabled={changingPwd} id="change-password-button">
          {changingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          Change Password
        </Button>
      </form>
    </div>
  );
}

