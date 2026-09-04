'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
  BrainCircuit,
  ChevronRight,
  BookOpen,
  Tags,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/blogs', label: 'Manage Blogs', icon: FileText },
  { href: '/admin/categories', label: 'Manage Categories', icon: Tags },
  { href: '/admin/blogs/new', label: 'New Post', icon: PlusCircle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-2.5 right-4 z-[55] p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[70] w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground leading-tight">Notes by Allieza</div>
              <div className="text-xs text-muted-foreground">Admin Panel</div>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive(href)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive(href) && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          ))}
        </nav>

        {/* View Site + Logout */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <BookOpen className="w-4 h-4" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            id="logout-button"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
