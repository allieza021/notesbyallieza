import Link from 'next/link';
import { BrainCircuit, Github, Facebook, Instagram, Globe, Heart } from 'lucide-react';
import { SpotifyWidget } from '@/components/shared/SpotifyWidget';

const footerLinks = {
  pages: [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/profile', label: 'Profile' },
  ],
  categories: [
    { href: '/blog?category=cybersecurity', label: 'Cybersecurity' },
    { href: '/blog?category=information-assurance', label: 'Information Assurance' },
    { href: '/blog?category=software-development', label: 'Software Development' },
    { href: '/blog?category=programming', label: 'Programming' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/40 border-t border-border mt-auto">
      <div className="container mx-auto px-6 max-w-6xl py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <BrainCircuit className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Notes <span className="text-primary">by Allieza</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              A personal academic blog covering Information Assurance & Security. Every post is a window into
              learning and discovery.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Pages
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.pages.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Topics
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 md:mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
            © {currentYear} Notes by Allieza. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js & Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
