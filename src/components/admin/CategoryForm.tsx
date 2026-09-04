'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils';
import { clearCache } from '@/app/actions';
import type { Category } from '@/types';

interface CategoryFormProps {
  category?: Category;
  mode: 'create' | 'edit';
}

export default function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    color: category?.color || '#4f46e5',
  });

  // Auto-generate slug from name on create
  useEffect(() => {
    if (mode === 'create' && form.name) {
      setForm((f) => ({ ...f, slug: generateSlug(form.name) }));
    }
  }, [form.name, mode]);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!form.name || !form.slug) {
      setError('Name and slug are required.');
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      
      if (mode === 'create') {
        const { error } = await supabase
          .from('categories')
          .insert([form]);
        
        if (error) {
          if (error.code === '23505') throw new Error('A category with this slug already exists.');
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('categories')
          .update(form)
          .eq('id', category!.id);
          
        if (error) throw error;
      }

      await clearCache('/');
      router.push('/admin/categories');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-black text-3xl text-foreground">
          {mode === 'create' ? 'New Category' : 'Edit Category'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {mode === 'create' ? 'Create a new blog category.' : 'Update category details.'}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g. Web Development"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            placeholder="e.g. web-development"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">Used in the URL path (e.g. /blog?category=slug)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the category..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Theme Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="color"
              value={form.color}
              onChange={(e) => set('color', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <Input
              type="text"
              value={form.color}
              onChange={(e) => set('color', e.target.value)}
              className="w-32 uppercase font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            {mode === 'create' ? 'Create Category' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
