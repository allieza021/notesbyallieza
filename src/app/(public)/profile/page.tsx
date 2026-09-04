import Image from 'next/image';
import Link from 'next/link';
import { Github, Facebook, Instagram, Globe, BookOpen, MapPin, Code2, Gamepad2, Music, Camera, Coffee, Mail } from 'lucide-react';
import { getProfile } from '@/lib/queries/profiles';
import { getBlogs } from '@/lib/queries/blogs';
import BlogCard from '@/components/blog/BlogCard';
import BentoCard from '@/components/profile/BentoCard';
import TopSongs from '@/components/profile/TopSongs';
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
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16 auto-rows-[minmax(180px,auto)]">
          
          {/* Main Bio Card (Spans 2 columns, 2 rows) */}
          <BentoCard className="md:col-span-2 md:row-span-2 p-8 md:p-10 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-6">
              <div className="w-24 h-24 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background overflow-hidden bg-primary/10 flex items-center justify-center shadow-xl shrink-0">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Allieza Segales'}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-4xl font-black text-primary">A</span>
                )}
              </div>
              <div>
                <h1 className="font-black text-3xl md:text-4xl text-foreground mb-1 tracking-tight">
                  {profile?.display_name || profile?.full_name || 'Allieza Segales'}
                </h1>
                <p className="text-primary font-medium text-sm md:text-base">
                  {profile?.headline || 'BS Information Technology Student'}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {profile?.bio ||
                'BS Information Technology student. Passionate about cybersecurity, software development, and continuous learning.'}
            </p>
          </BentoCard>

          {/* Location/Status Card */}
          <BentoCard className="p-6 flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-4">
              <MapPin className="w-6 h-6 text-primary opacity-80" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Online</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Based in</p>
              <h3 className="text-xl font-bold text-foreground">Philippines</h3>
              <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">GMT+8</p>
            </div>
          </BentoCard>

          {/* Socials Grid */}
          <BentoCard className="p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Connect</h3>
            <div className="grid grid-cols-2 gap-3 h-[calc(100%-2rem)]">
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-2xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors h-full">
                  <Github className="w-6 h-6" />
                </a>
              )}
              {profile?.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 transition-colors h-full">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {profile?.facebook_url && (
                <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors h-full">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors h-full">
                  <Globe className="w-6 h-6" />
                </a>
              )}
              {profile?.public_email && (
                <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.public_email}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors h-full">
                  <Mail className="w-6 h-6" />
                </a>
              )}
            </div>
          </BentoCard>

          {/* Hobbies Card (Spans 2 columns) */}
          <BentoCard className="md:col-span-2 lg:col-span-2 p-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-widest">My Hobbies & Things I Enjoy</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground text-center px-1">Gaming</span>
              </div>

              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground text-center px-1">Photography</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <Coffee className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground text-center px-1">Food Trips</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground text-center px-1">Exploring AI Tools</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground text-center px-1">Reading</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground text-center px-1">UI/UX Design & AI</span>
              </div>
            </div>
          </BentoCard>

          {/* Top 5 Songs Card */}
          <BentoCard className="md:col-span-3 lg:col-span-4 p-6 md:p-8">
            <TopSongs />
          </BentoCard>

        </div>        {/* Recent Posts */}
        {recentBlogs.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-bold text-2xl text-foreground">Recent Posts</h2>
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

