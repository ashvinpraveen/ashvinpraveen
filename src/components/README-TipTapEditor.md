# TipTap Editor Component

A comprehensive, reusable TipTap editor component with full-featured rich text editing, media embedding, and context menu support.

## Features

### ✨ **Enhanced Context Menu**
- **Text Formatting**: Bold, Italic, Underline, Highlight
- **Headings**: H1, H2, H3
- **Lists**: Bullet Lists, Numbered Lists, Task Lists
- **Media**: Images, YouTube videos, Spotify embeds
- **Advanced**: Tables, Blockquotes, Links
- **Perfect Positioning**: Appears exactly at cursor position
- **Smart Edge Detection**: Automatically adjusts to stay in viewport

### 📝 **Rich Text Features**
- All standard formatting options
- Tables with resizable columns
- Task lists with checkboxes
- Media embeds (Image, YouTube, Spotify)
- Text alignment
- Undo/Redo support
- Placeholder text
- Bubble menu for text selections

### 🎨 **Styled & Accessible**
- Beautiful glassmorphic design
- Dark theme optimized
- Fully responsive
- Keyboard navigation
- Screen reader friendly

## Usage

```astro
---
import TipTapEditor from '../components/TipTapEditor.astro';
---

<!-- Basic Usage -->
<TipTapEditor
  id="my-editor"
  placeholder="Start typing..."
  editable={true}
/>

<!-- Advanced Usage -->
<TipTapEditor
  id="advanced-editor"
  placeholder="Write your content here..."
  content="<p>Initial content</p>"
  editable={true}
  showBubbleMenu={true}
  showContextMenu={true}
  class="custom-editor"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | `'tiptap-editor'` | Unique ID for the editor instance |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text when editor is empty |
| `content` | `string` | `''` | Initial HTML content |
| `editable` | `boolean` | `false` | Whether the editor is editable |
| `showBubbleMenu` | `boolean` | `true` | Show bubble menu on text selection |
| `showContextMenu` | `boolean` | `true` | Show context menu on right-click |
| `class` | `string` | `''` | Additional CSS classes |

## JavaScript API

Each editor instance exposes a global API:

```javascript
// Access the editor instance
const editorAPI = window[`${id}Editor`];

// Get current content
const content = editorAPI.getContent();

// Set new content
editorAPI.setContent('<p>New content</p>');

// Toggle edit mode
editorAPI.setEditable(true);

// Focus the editor
editorAPI.focus();

// Access raw TipTap editor
const rawEditor = editorAPI.getEditor();
```

## Context Menu Actions

Right-click anywhere in the editor (when editable) to access:

### Text Formatting
- **Bold** (`Ctrl+B`)
- **Italic** (`Ctrl+I`)
- **Underline** (`Ctrl+U`)
- **Highlight** - Yellow highlight

### Structure
- **Heading 1** - Large heading
- **Heading 2** - Medium heading
- **Heading 3** - Small heading
- **Bullet List** - Unordered list
- **Numbered List** - Ordered list
- **Task List** - Checkable todo items

### Media & Content
- **Add Image** - Insert image from URL
- **Add Video** - Embed YouTube videos
- **Add Spotify** - Embed Spotify tracks/albums/playlists
- **Add Table** - Insert 3x3 table with headers
- **Quote** - Blockquote formatting
- **Add Link** - Create hyperlinks

## Keyboard Shortcuts

- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+U` - Underline
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+Shift+7` - Ordered list
- `Ctrl+Shift+8` - Bullet list

## Styling

The component includes comprehensive styling for:
- Dark theme optimized colors
- Responsive design
- Beautiful typography
- Hover and active states
- Glassmorphic menus
- Proper spacing and alignment

## Examples

### Read-Only Display
```astro
<TipTapEditor
  content={savedContent}
  editable={false}
  showContextMenu={false}
/>
```

### Full-Featured Editor
```astro
<TipTapEditor
  id="blog-editor"
  placeholder="Write your blog post..."
  editable={isEditMode}
  showBubbleMenu={true}
  showContextMenu={true}
/>
```

### Minimal Editor
```astro
<TipTapEditor
  id="comment-editor"
  placeholder="Add a comment..."
  editable={true}
  showBubbleMenu={false}
  showContextMenu={false}
/>
```

## Browser Support

- Modern browsers with ES6 support
- Chrome, Firefox, Safari, Edge
- Mobile browsers supported

## Dependencies

- TipTap v3.4.2
- All extensions loaded from ESM CDN
- No build step required
- Zero bundle size impact

---

**The context menu now has everything you need for rich text editing!** Right-click to access all formatting options, media embedding, and structural elements. The component is fully reusable and can be dropped into any Astro project.