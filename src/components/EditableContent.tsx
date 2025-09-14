import { useState, useEffect, useCallback } from 'react';

interface EditableContentProps {
  content: string;
  onSave: (newContent: string) => void;
  isEditing: boolean;
  placeholder?: string;
  className?: string;
  element?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export default function EditableContent({
  content,
  onSave,
  isEditing,
  placeholder = "Click to edit...",
  className = "",
  element = 'div',
  autoSave = true,
  autoSaveDelay = 1000
}: EditableContentProps) {
  const [localContent, setLocalContent] = useState(content);
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Auto-save debounced function
  const debouncedSave = useCallback(() => {
    const timeoutId = setTimeout(async () => {
      if (localContent !== content && autoSave) {
        setIsSaving(true);
        try {
          await onSave(localContent);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
        setIsSaving(false);
      }
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [localContent, content, onSave, autoSave, autoSaveDelay]);

  useEffect(() => {
    if (isLocalEditing && autoSave) {
      const cleanup = debouncedSave();
      return cleanup;
    }
  }, [localContent, isLocalEditing, debouncedSave, autoSave]);

  const handleClick = () => {
    if (isEditing && !isLocalEditing) {
      setIsLocalEditing(true);
    }
  };

  const handleSave = () => {
    onSave(localContent);
    setIsLocalEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setLocalContent(content); // Reset to original
      setIsLocalEditing(false);
    }
  };

  const commonProps = {
    className: `${className} ${isEditing ? 'editable-hover' : ''} ${isSaving ? 'saving' : ''}`,
    onClick: handleClick,
  };

  if (isLocalEditing) {
    return (
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${className} editing-textarea`}
        autoFocus
      />
    );
  }

  const content_to_display = localContent || placeholder;
  const displayProps = {
    ...commonProps,
    children: content_to_display,
    style: {
      ...(!localContent ? { opacity: 0.5, fontStyle: 'italic' } : {})
    }
  };

  // Return the appropriate element type
  switch (element) {
    case 'h1':
      return <h1 {...displayProps} />;
    case 'h2':
      return <h2 {...displayProps} />;
    case 'h3':
      return <h3 {...displayProps} />;
    case 'p':
      return <p {...displayProps} />;
    default:
      return <div {...displayProps} />;
  }
}