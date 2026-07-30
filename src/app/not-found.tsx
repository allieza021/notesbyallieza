import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center px-6 max-w-lg">
        {/* 404 Display */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-serif font-black text-primary/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">📄</div>
          </div>
        </div>

        <h1 className="font-serif font-black text-4xl text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">
              <BrainCircuit className="w-4 h-4" />
              Browse Blog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
