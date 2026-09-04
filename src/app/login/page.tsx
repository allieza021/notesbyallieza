'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const trimmedInput = email.trim();
      const loginEmail = trimmedInput.includes('@') ? trimmedInput : `${trimmedInput}@notes.com`;
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) {
        setError('Invalid email or password. Please try again.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 px-4">
      {/* Background decoration */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mx-auto mb-4">
            <BrainCircuit className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-black text-3xl text-foreground">Notes by Allieza</h1>
          <p className="text-muted-foreground text-sm mt-1">Admin access only</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl shadow-black/5 p-8">
          <div className="mb-6">
            <h2 className="font-bold text-xl text-foreground mb-1">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="text"
                  placeholder="allieza"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
              id="login-submit-button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This area is restricted to the site administrator only.
        </p>
      </div>
    </div>
  );
}
