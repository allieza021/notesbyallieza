import Image from 'next/image';
import Link from 'next/link';
import { Github, Facebook, Instagram, Globe, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProfile } from '@/lib/queries/profiles';
import { getBlogs } from '@/lib/queries/blogs';
import BlogCard from '@/components/blog/BlogCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: "Allieza's public profile — IT student, blogger, and aspiring cybersecurity professional.",
};

export const revalidate = 300;

export default async function ProfilePage() {
  const [profile, { blogs }] = await Promise.all([
    getProfile(),
    getBlogs({ page: 1 }),
  ]);

  const recentBlogs = blogs.slice(0, 3);

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Profile Card */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-purple-50/50 dark:from-primary/10 dark:to-purple-950/20 border border-primary/10 p-8 md:p-12 text-center mb-12">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background overflow-hidden bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-xl">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || 'Allieza'}
                width={112}
                height={112}
                className="object-cover"
              />
            ) : (
              <span className="text-4xl font-serif font-black text-primary">A</span>
            )}
          </div>

          <h1 className="font-serif font-black text-3xl text-foreground mb-1">
            {profile?.display_name || profile?.full_name || 'Allieza'}
          </h1>
          {profile?.full_name && profile.display_name && (
            <p className="text-muted-foreground font-medium mb-1">{profile.full_name}</p>
          )}
          <p className="text-primary font-medium text-sm mb-4">
            {profile?.headline || 'BS Information Technology Student'}
          </p>

          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto mb-6">
            {profile?.bio ||
              'BS Information Technology student. Passionate about cybersecurity, software development, and continuous learning.'}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-3">
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium hover:border-primary hover:text-primary transition-all">
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}
            {profile?.facebook_url && (
              <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium hover:border-primary hover:text-primary transition-all">
                <Facebook className="w-4 h-4" /> Facebook
              </a>
            )}
            {profile?.instagram_url && (
              <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium hover:border-primary hover:text-primary transition-all">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium hover:border-primary hover:text-primary transition-all">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        </div>

        {/* Recent Posts */}
        {recentBlogs.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-serif font-bold text-2xl text-foreground">Recent Posts</h2>
              <Link href="/blog" className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
