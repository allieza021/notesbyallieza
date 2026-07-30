import CategoryForm from '@/components/admin/CategoryForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Category | Admin Dashboard',
};

export default function NewCategoryPage() {
  return <CategoryForm mode="create" />;
}
