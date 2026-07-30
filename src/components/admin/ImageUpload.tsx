'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  bucket: 'blog-covers' | 'avatars';
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ImageUpload({
  bucket,
  currentUrl,
  onUpload,
  onRemove,
  label = 'Upload Image',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentUrl || '');

  const handleFile = useCallback(async (file: File) => {
    setError('');

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, WebP, and GIF images are allowed.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File must be smaller than 5MB.');
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setPreview(data.publicUrl);
      onUpload(data.publicUrl);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [bucket, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview('');
    onRemove?.();
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
          <div className="relative w-full h-52">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-md"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-border bg-muted/40 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleChange}
            className="sr-only"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">
                Drag &amp; drop or click • JPG, PNG, WebP, GIF • Max 5MB
              </span>
            </div>
          )}
        </label>
      )}

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <X className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
