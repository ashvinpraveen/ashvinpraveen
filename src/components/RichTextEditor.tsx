import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { useState, useEffect, useCallback } from 'react'

interface RichTextEditorProps {
  content: string;
  onSave: (newContent: string) => void;
  isEditing: boolean;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export default function RichTextEditor({
  content,
  onSave,
  isEditing,
  placeholder = "Start writing...",
  className = "",
  autoSave = true,
  autoSaveDelay = 1000
}: RichTextEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 hover:text-blue-300 underline'
        }
      })
    ],
    content,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      if (autoSave && isEditing) {
        debouncedSave(editor.getHTML());
      }
    }
  });

  // Auto-save debounced function
  const debouncedSave = useCallback((newContent: string) => {
    const timeoutId = setTimeout(async () => {
      if (newContent !== content) {
        setIsSaving(true);
        try {
          await onSave(newContent);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
        setIsSaving(false);
      }
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [content, onSave, autoSaveDelay]);

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  if (!editor) {
    return <div className={`${className} loading`}>Loading editor...</div>;
  }

  return (
    <div className={`rich-text-editor ${className} ${isEditing ? 'editing' : 'viewing'} ${isSaving ? 'saving' : ''}`}>
      {isEditing && (
        <div className="editor-toolbar">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
            type="button"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            type="button"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
            type="button"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
            type="button"
          >
            H3
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''}
            type="button"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''}
            type="button"
          >
            1. List
          </button>
          <button
            onClick={() => {
              const url = window.prompt('URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={editor.isActive('link') ? 'active' : ''}
            type="button"
          >
            Link
          </button>
          {isSaving && <span className="save-indicator">💾 Saving...</span>}
        </div>
      )}
      <EditorContent
        editor={editor}
        className={`editor-content ${isEditing ? 'editable' : ''}`}
      />
    </div>
  );
}