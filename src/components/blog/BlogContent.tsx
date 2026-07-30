interface BlogContentProps {
  content: string;
}

/**
 * Renders the blog HTML content safely.
 * TipTap outputs trusted HTML stored in Supabase — no XSS risk from user-supplied content
 * since only the admin can create posts.
 */
export default function BlogContent({ content }: BlogContentProps) {
  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
