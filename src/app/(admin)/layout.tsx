import AdminSidebar from '@/components/layout/AdminSidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Double-check auth server-side (middleware also protects, but defence in depth)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Admin Top Bar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between pl-6 pr-14 md:px-6 sticky top-0 z-40">
          <div className="text-sm text-muted-foreground truncate w-full">
            Logged in as <span className="font-semibold text-foreground">{user.email}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
