import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Tag, User } from 'lucide-react';
import { getBlogBySlug, getRelatedBlogs } from '@/lib/queries/blogs';
import BlogContent from '@/components/blog/BlogContent';
import ReadingProgress from '@/components/shared/ReadingProgress';
import BlogCard from '@/components/blog/BlogCard';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

interface SingleBlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SingleBlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: 'Post Not Found' };
  return {
    title: blog.title,
    description: blog.excerpt || `Read "${blog.title}" on Notes by Allieza`,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || '',
      images: blog.cover_image_url ? [{ url: blog.cover_image_url }] : [],
    },
  };
}

export const revalidate = 60;

export default async function SingleBlogPage({ params }: SingleBlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) notFound();

  const relatedBlogs = await getRelatedBlogs(blog.category_id, blog.slug, 3);
  const dateStr = blog.published_at || blog.created_at;

  return (
    <>
      <ReadingProgress />

      <article className="min-h-screen">
        {/* Cover Image */}
        {blog.cover_image_url && (
          <div className="relative w-full h-56 md:h-96 lg:h-[480px] overflow-hidden">
            <Image
              src={blog.cover_image_url}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 md:px-6 max-w-4xl py-8 md:py-10">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group w-fit"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Blog
            </Link>
          </div>

          {/* Category */}
          {blog.category && (
            <div className="mb-4">
              <Link
                href={`/blog?category=${blog.category.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: blog.category.color || '#4f46e5' }}
              >
                {blog.category.name}
              </Link>
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif font-black text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-4 mb-10">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {blog.author?.avatar_url ? (
                  <Image
                    src={blog.author.avatar_url}
                    alt={blog.author.display_name || 'Author'}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="font-medium text-foreground">
                {blog.author?.display_name || blog.author?.full_name || 'Allieza'}
              </span>
            </div>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(dateStr)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {blog.reading_time_minutes} min read
            </span>
          </div>

          {/* Content */}
          <BlogContent content={blog.content} />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground mr-1">Tags:</span>
                {blog.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Card */}
          {blog.author && (
            <div className="mt-12 p-6 rounded-2xl bg-muted/40 border border-border flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {blog.author.avatar_url ? (
                  <Image
                    src={blog.author.avatar_url}
                    alt={blog.author.display_name || 'Author'}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl font-serif font-bold text-primary">A</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Written by
                </p>
                <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                  {blog.author.display_name || blog.author.full_name || 'Allieza'}
                </h3>
                {blog.author.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {blog.author.bio}
                  </p>
                )}
                <Link
                  href="/about"
                  className="text-sm text-primary font-semibold hover:underline underline-offset-4 mt-2 inline-block"
                >
                  Read more about me →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/30 border-t border-border">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-8">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((related) => (
                  <BlogCard key={related.id} blog={related} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
