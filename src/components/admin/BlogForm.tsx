'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Loader2, X, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/editor/RichTextEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { generateSlug, calculateReadingTime } from '@/lib/utils';
import { blogSchema } from '@/lib/validations';
import { clearCache } from '@/app/actions';
import type { BlogWithRelations, Category, Tag } from '@/types';

interface BlogFormProps {
  blog?: BlogWithRelations;
  categories: Category[];
  allTags: Tag[];
  mode: 'create' | 'edit';
}

export default function BlogForm({ blog, categories, allTags, mode }: BlogFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [existingTags] = useState<Tag[]>(allTags);

  const [form, setForm] = useState({
    title: blog?.title || '',
    slug: blog?.slug || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    cover_image_url: blog?.cover_image_url || '',
    category_id: blog?.category_id || '',
    tags: blog?.tags?.map((t) => t.name) || [] as string[],
    is_published: blog?.is_published ?? false,
    is_featured: blog?.is_featured ?? false,
  });

  // Auto-generate slug from title on create
  useEffect(() => {
    if (mode === 'create' && form.title) {
      setForm((f) => ({ ...f, slug: generateSlug(form.title) }));
    }
  }, [form.title, mode]);

  const set = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addTag = () => {
    const name = tagInput.trim();
    if (!name || form.tags.includes(name)) return;
    set('tags', [...form.tags, name]);
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    set('tags', form.tags.filter((t) => t !== tag));

  const handleSubmit = async (publish: boolean) => {
    setSaving(true);
    setErrors({});

    const payload = {
      ...form,
      is_published: publish,
      tags: form.tags,
    };

    const parsed = blogSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const readingTime = calculateReadingTime(form.content);
      const blogData = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image_url: form.cover_image_url || null,
        category_id: form.category_id || null,
        is_published: publish,
        is_featured: form.is_featured,
        reading_time_minutes: readingTime,
        author_id: user.id,
        published_at: publish ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let blogId = blog?.id;

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('blogs')
          .insert([blogData])
          .select('id')
          .single();
        if (error) throw error;
        blogId = data.id;
      } else {
        const { error } = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', blog!.id);
        if (error) throw error;
      }

      // Handle tags
      if (blogId) {
        // Remove existing blog_tags
        await supabase.from('blog_tags').delete().eq('blog_id', blogId);

        // Upsert tags and create blog_tag entries
        for (const tagName of form.tags) {
          const tagSlug = generateSlug(tagName);
          const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .upsert([{ name: tagName, slug: tagSlug }], { onConflict: 'slug' })
            .select('id')
            .single();

          if (!tagError && tagData) {
              await supabase
              .from('blog_tags')
              .upsert([{ blog_id: blogId, tag_id: tagData.id }], { onConflict: 'blog_id,tag_id' });

          }
        }
      }

      await clearCache('/');
      router.push('/admin/blogs');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save post';
      setErrors({ _global: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif font-black text-3xl text-foreground">
            {mode === 'create' ? 'New Post' : 'Edit Post'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === 'create' ? 'Write and publish your new blog post.' : 'Update your blog post.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            id="save-draft-button"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            id="publish-button"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {form.is_published ? 'Update & Publish' : 'Publish'}
          </Button>
        </div>
      </div>

      {errors._global && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {errors._global}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Enter your post title…"
                className={`text-lg font-semibold h-12 ${errors.title ? 'border-destructive' : ''}`}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="post-url-slug"
                className={errors.slug ? 'border-destructive' : ''}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="Brief description of your post (shown in cards and search results)…"
                rows={3}
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <RichTextEditor
              content={form.content}
              onChange={(html) => set('content', html)}
            />
            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cover Image */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <Label>Cover Image</Label>
            <ImageUpload
              bucket="blog-covers"
              currentUrl={form.cover_image_url}
              onUpload={(url) => set('cover_image_url', url)}
              onRemove={() => set('cover_image_url', '')}
              label="Upload Cover"
            />
          </div>

          {/* Category */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag…"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
                id="tag-input"
              />
              <Button type="button" size="icon" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Existing tag suggestions */}
            {existingTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Existing tags:</p>
                <div className="flex flex-wrap gap-1">
                  {existingTags.filter((t) => !form.tags.includes(t.name)).slice(0, 10).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => set('tags', [...form.tags, tag.name])}
                      className="text-xs px-2 py-0.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <Label>Options</Label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Featured Post</span>
              <div
                onClick={() => set('is_featured', !form.is_featured)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.is_featured ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
