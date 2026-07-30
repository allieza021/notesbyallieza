import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merges Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a date string to a readable format */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown date';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Formats a date string to a short format */
export function formatShortDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Estimates reading time from HTML/text content */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  // Strip HTML tags to get plain text
  const plainText = content.replace(/<[^>]+>/g, '');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/** Generates a URL-safe slug from a string */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Truncates text to a given length with ellipsis */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

/** Returns a color for a category based on its name */
export function getCategoryColor(color: string | undefined): string {
  return color || '#4f46e5';
}

/** Extracts plain text excerpt from HTML content */
export function extractExcerpt(html: string, maxLength = 160): string {
  const plainText = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return truncate(plainText, maxLength);
}
