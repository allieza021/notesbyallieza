import Link from 'next/link';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategories } from '@/lib/queries/categories';
import DeleteCategoryButton from './DeleteCategoryButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Categories | Admin Dashboard',
};

// Disable cache for admin area
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-foreground">
            Manage Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, update, or remove blog categories.
          </p>
        </div>
        <Button asChild className="shrink-0 rounded-xl" size="lg">
          <Link href="/admin/categories/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Category
          </Link>
        </Button>
      </div>

      {/* Categories List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {categories.length > 0 ? (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 border border-black/5 dark:border-white/5"
                    style={{ backgroundColor: cat.color || '#4f46e5' }}
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">/{cat.slug}</p>
                    {cat.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1 max-w-md">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" asChild className="w-8 h-8">
                    <Link href={`/admin/categories/${cat.id}/edit`}>
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <DeleteCategoryButton id={cat.id} name={cat.name} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <p className="font-medium text-foreground">No categories found</p>
            <p className="text-sm mt-1 mb-4">Create your first category to organize your posts.</p>
            <Button asChild variant="outline">
              <Link href="/admin/categories/new">Add Category</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
