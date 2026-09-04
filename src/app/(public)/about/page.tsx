import Image from 'next/image';
import Link from 'next/link';
import { Shield, Code2, BookOpen, GraduationCap, Github, Facebook, Instagram, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProfile } from '@/lib/queries/profiles';
import { getCategories } from '@/lib/queries/categories';
import { getBlogs } from '@/lib/queries/blogs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Allieza — a BS Information Technology student passionate about cybersecurity and software development.',
};

export const revalidate = 300;

const topicIcons: Record<string, React.ReactNode> = {
  cybersecurity: <Shield className="w-5 h-5" />,
  'software-development': <Code2 className="w-5 h-5" />,
  programming: <Code2 className="w-5 h-5" />,
  default: <BookOpen className="w-5 h-5" />,
};

const socialLinks = [
  { icon: Github, label: 'GitHub', key: 'github_url' },
  { icon: Facebook, label: 'Facebook', key: 'facebook_url' },
  { icon: Instagram, label: 'Instagram', key: 'instagram_url' },
  { icon: Globe, label: 'Website', key: 'website' },
] as const;

export default async function AboutPage() {
  const [profile, categories, { total }] = await Promise.all([
    getProfile(),
    getCategories(),
    getBlogs({ page: 1 }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-muted/40 to-background border-b border-border">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shadow-2xl shadow-primary/20">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name || 'Allieza'}
                      width={192}
                      height={192}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-6xl font-black text-primary">A</span>
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full ring-2 ring-background" />
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                <GraduationCap className="w-3.5 h-3.5" />
                {profile?.headline || 'BS Information Technology Student'}
              </div>
              <h1 className="font-black text-foreground mb-2">
                {profile?.display_name || profile?.full_name || 'Allieza'}
              </h1>
              {profile?.full_name && profile.display_name && (
                <p className="text-muted-foreground font-medium mb-4">{profile.full_name}</p>
              )}
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mb-6">
                {profile?.bio ||
                  'A passionate IT student documenting the journey through cybersecurity, software development, and everything in between. This blog is my digital notebook.'}
              </p>

              {/* Stats */}
              <div className="flex gap-8 mb-6">
                <div>
                  <div className="text-2xl font-black text-primary">{total}+</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-primary">{categories.length}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Topics</div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ icon: Icon, label, key }) => {
                  const url = profile?.[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What I Write About */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-bold text-3xl text-foreground mb-4">What I Write About</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                This blog is where I share what I learn and experience as a BSIT student. From Information Assurance & Security topics to programming, software development, and other IT-related lessons, I document my academic journey and the knowledge I gain along the way.
              </p>
              <div className="space-y-3">
                {categories.length > 0 ? categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-200 group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: cat.color || '#4f46e5' }}
                    >
                      {topicIcons[cat.slug] ?? topicIcons.default}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{cat.name}</div>
                      {cat.description && (
                        <div className="text-sm text-muted-foreground">{cat.description}</div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                )) : (
                  <p className="text-muted-foreground">Categories coming soon.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-bold text-3xl text-foreground mb-4">About This Blog</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Notes by Allieza</strong> is a personal academic blog created to document the lessons, projects, and experiences I encounter throughout my Bachelor of Science in Information Technology journey.
                </p>
                <p>
                  Each post reflects what I learn in class, including Information Assurance & Security, programming, software development, and other IT-related topics. I also share project updates, reflections, and notes that help me better understand the concepts I study.
                </p>
                <p>
                  The goal of this blog is to serve as my personal learning journal and a helpful reference for anyone interested in exploring similar topics.
                </p>
              </div>

              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/blog">
                    Browse All Posts <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
