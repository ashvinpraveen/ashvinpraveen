import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

// This will be replaced with the actual component import when bundled
async function initProfileEditor() {
  const profileEditorEl = document.getElementById('profile-editor');
  if (!profileEditorEl) return;

  try {
    // Dynamic import to avoid SSR issues
    const { default: ProfileEditor } = await import('../components/ProfileEditor.tsx');

    const initialData = JSON.parse(profileEditorEl.dataset.initialData || '{}');
    const isOwner = profileEditorEl.dataset.isOwner === 'true';
    const siteSlug = profileEditorEl.dataset.siteSlug;

    const handleSave = async (data) => {
      try {
        const response = await fetch('/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteSlug, ...data })
        });
        if (!response.ok) throw new Error('Failed to save');
      } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save changes');
      }
    };

    const root = createRoot(profileEditorEl);
    root.render(createElement(ProfileEditor, {
      initialData,
      isOwner,
      onSave: handleSave
    }));
  } catch (error) {
    console.error('Failed to initialize profile editor:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfileEditor);
} else {
  initProfileEditor();
}