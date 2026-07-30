import { z } from 'zod';

/** Blog form validation schema */
export const blogSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be under 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be under 500 characters')
    .optional()
    .or(z.literal('')),
  content: z.string().min(1, 'Content is required'),
  cover_image_url: z.string().optional().or(z.literal('')),
  category_id: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

export type BlogFormValues = z.infer<typeof blogSchema>;

/** Profile settings validation schema */
export const profileSchema = z.object({
  full_name: z.string().max(100, 'Name must be under 100 characters').optional().or(z.literal('')),
  display_name: z.string().max(60, 'Display name must be under 60 characters').optional().or(z.literal('')),
  headline: z.string().max(100, 'Headline must be under 100 characters').optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio must be under 1000 characters').optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  github_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/** Login form validation schema */
export const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/** Category validation schema */
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(300).optional().or(z.literal('')),
  color: z.string().default('#4f46e5'),
});
