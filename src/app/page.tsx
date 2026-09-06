import Link from 'next/link';
import { ArrowRight, BookOpen, Shield, Code2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/blog/BlogCard';
import { getBlogs } from '@/lib/queries/blogs';
import { getCategories } from '@/lib/queries/categories';
import { getProfile } from '@/lib/queries/profiles';
import Image from 'next/image';
import type { Metadata } from 'next';
import { FadeUp } from '@/components/shared/FadeUp';
import { TerminalHero } from '@/components/home/TerminalHero';
import CategoryCard from '@/components/home/CategoryCard';

export const metadata: Metadata = {
  title: 'Notes by Allieza — Personal Academic Blog',
  description:
    'A personal academic blog covering cybersecurity, information assurance, software development, and programming.',
};

// Force dynamic to always fetch the latest post
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const topicIcons: Record<string, React.ReactNode> = {
  cybersecurity: <Shield className="w-5 h-5" />,
  'software-development': <Code2 className="w-5 h-5" />,
  programming: <Code2 className="w-5 h-5" />,
  default: <BookOpen className="w-5 h-5" />,
};

export default async function HomePage() {
  const [{ blogs }, categories, profile] = await Promise.all([
    getBlogs({ page: 1 }),
    getCategories(),
    getProfile(),
  ]);

  const featuredBlog = blogs.find((b) => b.is_featured) ?? blogs[0] ?? null;
  const latestBlogs = blogs.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative min-h-[60vh] md:min-h-[85vh] flex items-center overflow-hidden py-12 md:py-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-50/30 dark:from-primary/10 dark:via-background dark:to-purple-950/20" />
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10 py-12">
          <div className="w-full flex flex-col md:flex-row items-center gap-10">
            <FadeUp className="flex-1 w-full order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                <GraduationCap className="w-4 h-4" />
                Personal Academic Blog
              </div>
              <h1 className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
                <span className="block pb-2">
                  Notes,{' '}
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Insights
                  </span>{' '}
                  &amp;
                </span>
                <span className="block pt-2">
                  Learning Journeys
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                Welcome to my personal space where I document my learnings in{' '}
                <strong className="text-foreground">Information Assurance & Security</strong>,{' '}
                <strong className="text-foreground">class activities</strong>,{' '}
                <strong className="text-foreground">projects</strong>, and academic reflections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button asChild size="lg" className="shadow-lg shadow-primary/25 w-full sm:w-auto">
                  <Link href="/blog" className="flex items-center justify-center">
                    Explore Posts <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/about" className="flex items-center justify-center">About Me</Link>
                </Button>
              </div>
            </FadeUp>
            <FadeUp delay={0.2} className="flex-1 w-full order-1 md:order-2">
              <TerminalHero />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Featured Post ───────────────────────────────────────── */}
      {featuredBlog && (
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex items-baseline justify-between mb-8 md:mb-10">
              <div>
                <h2 className="font-bold text-2xl md:text-3xl text-foreground">Featured Post</h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-2" />
              </div>
              <Link
                href="/blog"
                className="text-sm font-semibold text-primary hover:gap-2 flex items-center gap-1.5 transition-all"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <FadeUp delay={0.2}>
              <BlogCard blog={featuredBlog} featured />
            </FadeUp>
          </div>
        </section>
      )}

      {/* ── Latest Posts ────────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-baseline justify-between mb-8 md:mb-10">
            <div>
              <h2 className="font-bold text-2xl md:text-3xl text-foreground">Latest Posts</h2>
              <div className="h-1 w-12 bg-primary rounded-full mt-2" />
            </div>
            <Link
              href="/blog"
              className="text-sm font-semibold text-primary flex items-center gap-1.5 hover:gap-2 transition-all"
            >
              All posts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBlogs.map((blog, i) => (
                <FadeUp
                  key={blog.id}
                  delay={i * 0.1}
                >
                  <BlogCard blog={blog} />
                </FadeUp>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No posts yet
              </h3>
              <p className="text-muted-foreground">Check back soon — new content is coming!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Categories Section ──────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <FadeUp className="text-center mb-10 md:mb-12">
              <h2 className="font-bold text-2xl md:text-3xl text-foreground mb-3">
                Browse by Topic
              </h2>
              <p className="text-muted-foreground">
                Explore posts organized by subject area
              </p>
            </FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <FadeUp key={cat.id} delay={i * 0.05}>
                  <CategoryCard
                    slug={cat.slug}
                    name={cat.name}
                    description={cat.description}
                    color={cat.color}
                    icon={topicIcons[cat.slug] ?? topicIcons.default}
                  />
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About Preview ───────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <FadeUp className="rounded-3xl bg-gradient-to-br from-primary/5 to-purple-50/50 dark:from-primary/10 dark:to-purple-950/20 border border-primary/10 p-8 md:p-14 flex flex-col md:flex-row items-center gap-8 md:gap-10">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 overflow-hidden bg-primary/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Allieza'}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-primary">A</span>
                )}
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                About the Author
              </div>
              <h2 className="font-bold text-2xl md:text-3xl text-foreground mb-1">
                {profile?.display_name || profile?.full_name || 'Allieza'}
              </h2>
              <p className="text-primary font-medium text-sm mb-4">
                {profile?.headline || 'BS Information Technology · BSIT Student'}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg">
                {profile?.bio ||
                  'Welcome to my learning journal! This is where I document cybersecurity studies, software development projects, and academic experiences. Every post reflects something learned.'}
              </p>
              <Button asChild variant="outline">
                <Link href="/about">Read More About Me</Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}

