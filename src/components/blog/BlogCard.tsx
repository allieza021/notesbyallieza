import Link from 'next/link';
import Image from 'next/image';
import { Clock, Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { BlogWithRelations } from '@/types';

interface BlogCardProps {
  blog: BlogWithRelations;
  featured?: boolean;
}

export default function BlogCard({ blog, featured = false }: BlogCardProps) {
  const dateStr = blog.published_at || blog.created_at;

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className={`group block bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${featured ? 'md:grid md:grid-cols-2' : ''}`}
    >
      {/* Cover Image */}
      <div className={`relative overflow-hidden bg-muted ${featured ? 'h-56 md:h-full' : 'h-48 md:h-52'}`}>
        {blog.cover_image_url ? (
          <Image
            src={blog.cover_image_url}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-4xl">📝</span>
          </div>
        )}
        {/* Category overlay */}
        {blog.category && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-md"
              style={{ backgroundColor: blog.category.color || '#4f46e5' }}
            >
              {blog.category.name}
            </span>
          </div>
        )}
        {blog.is_featured && (
          <div className="absolute top-3 right-3">
            <Badge className="text-xs bg-amber-500 hover:bg-amber-500 border-0 text-white">
              ★ Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col gap-3">
        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(dateStr)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {blog.reading_time_minutes} min read
          </span>
        </div>

        {/* Title */}
        <h2 className={`font-serif font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 ${featured ? 'text-xl md:text-3xl' : 'text-lg md:text-xl'}`}>
          {blog.title}
        </h2>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {blog.excerpt}
          </p>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {blog.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Author */}
        {blog.author && (
          <div className="flex items-center gap-2 pt-3 border-t border-border mt-1">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
              {blog.author.avatar_url ? (
                <Image
                  src={blog.author.avatar_url}
                  alt={blog.author.display_name || 'Author'}
                  width={28}
                  height={28}
                  className="object-cover"
                />
              ) : (
                (blog.author.display_name || blog.author.full_name || 'A')[0].toUpperCase()
              )}
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {blog.author.display_name || blog.author.full_name || 'Allieza'}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
