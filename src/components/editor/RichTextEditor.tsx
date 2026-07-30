'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Link as LinkIcon,
  Heading1, Heading2, Heading3, Minus, Undo, Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, title, disabled, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-md transition-all duration-150 text-sm',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing your post…' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'ProseMirror focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const toolbarGroups = [
    [
      { icon: <Undo className="w-4 h-4" />, action: () => editor.chain().focus().undo().run(), title: 'Undo', disabled: !editor.can().undo() },
      { icon: <Redo className="w-4 h-4" />, action: () => editor.chain().focus().redo().run(), title: 'Redo', disabled: !editor.can().redo() },
    ],
    [
      { icon: <Heading1 className="w-4 h-4" />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), title: 'Heading 1', active: editor.isActive('heading', { level: 1 }) },
      { icon: <Heading2 className="w-4 h-4" />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), title: 'Heading 2', active: editor.isActive('heading', { level: 2 }) },
      { icon: <Heading3 className="w-4 h-4" />, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), title: 'Heading 3', active: editor.isActive('heading', { level: 3 }) },
    ],
    [
      { icon: <Bold className="w-4 h-4" />, action: () => editor.chain().focus().toggleBold().run(), title: 'Bold', active: editor.isActive('bold') },
      { icon: <Italic className="w-4 h-4" />, action: () => editor.chain().focus().toggleItalic().run(), title: 'Italic', active: editor.isActive('italic') },
      { icon: <UnderlineIcon className="w-4 h-4" />, action: () => editor.chain().focus().toggleUnderline().run(), title: 'Underline', active: editor.isActive('underline') },
      { icon: <Strikethrough className="w-4 h-4" />, action: () => editor.chain().focus().toggleStrike().run(), title: 'Strikethrough', active: editor.isActive('strike') },
    ],
    [
      { icon: <List className="w-4 h-4" />, action: () => editor.chain().focus().toggleBulletList().run(), title: 'Bullet List', active: editor.isActive('bulletList') },
      { icon: <ListOrdered className="w-4 h-4" />, action: () => editor.chain().focus().toggleOrderedList().run(), title: 'Ordered List', active: editor.isActive('orderedList') },
      { icon: <Quote className="w-4 h-4" />, action: () => editor.chain().focus().toggleBlockquote().run(), title: 'Blockquote', active: editor.isActive('blockquote') },
      { icon: <Code className="w-4 h-4" />, action: () => editor.chain().focus().toggleCodeBlock().run(), title: 'Code Block', active: editor.isActive('codeBlock') },
    ],
    [
      { icon: <LinkIcon className="w-4 h-4" />, action: addLink, title: 'Add Link', active: editor.isActive('link') },
      { icon: <Minus className="w-4 h-4" />, action: () => editor.chain().focus().setHorizontalRule().run(), title: 'Horizontal Rule' },
    ],
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/40">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-5 bg-border mx-1.5" />}
            {group.map((btn, bi) => (
              <ToolbarButton
                key={bi}
                onClick={btn.action}
                active={'active' in btn ? btn.active : false}
                title={btn.title}
                disabled={'disabled' in btn ? btn.disabled : false}
              >
                {btn.icon}
              </ToolbarButton>
            ))}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} className="min-h-[400px]" />
    </div>
  );
}
