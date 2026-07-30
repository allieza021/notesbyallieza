import { notFound } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Category | Admin Dashboard',
};

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!category) {
    notFound();
  }

  return <CategoryForm mode="edit" category={category} />;
}
