import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Smile, 
  Link, 
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
  Undo,
  Redo
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Move emojiList outside component to prevent recreation on every render
const emojiList = [
  '😀', '😊', '😎', '🤔', '👍', '👎', '❤️', '🎉', '💡', '🔥',
  '✨', '🚀', '💯', '🎯', '⭐', '🌟', '💪', '🙌', '👏', '🤝',
  '📝', '💻', '🖥️', '📱', '⚡', '🌈', '🎨', '🔧', '⚙️', '🛠️'
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Write your content here...",
  minHeight = "200px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle click outside for emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(target) &&
        !target.closest('[data-emoji-button]') &&
        !target.closest('[data-emoji-item]')
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      
      try {
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          // Check if the range is within the editor
          if (editorRef.current.contains(range.commonAncestorContainer)) {
            range.deleteContents();
            const emojiNode = document.createTextNode(emoji);
            range.insertNode(emojiNode);
            range.setStartAfter(emojiNode);
            range.setEndAfter(emojiNode);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            // If selection is outside editor, insert at the end
            insertEmojiAtEnd(emoji);
          }
        } else {
          // If no selection, insert at the end
          insertEmojiAtEnd(emoji);
        }
        updateContent();
      } catch (error) {
        console.error('Error inserting emoji:', error);
        // Fallback: insert at the end
        insertEmojiAtEnd(emoji);
        updateContent();
      }
    }
    setShowEmojiPicker(false);
  };

  const insertEmojiAtEnd = (emoji: string) => {
    if (editorRef.current) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Collapse to end
      
      const emojiNode = document.createTextNode(emoji);
      range.insertNode(emojiNode);
      range.setStartAfter(emojiNode);
      range.setEndAfter(emojiNode);
      
      const newSelection = window.getSelection();
      if (newSelection) {
        newSelection.removeAllRanges();
        newSelection.addRange(range);
      }
    }
  };

  const insertLink = () => {
    if (linkUrl.trim()) {
      const displayText = linkText.trim() || linkUrl;
      execCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`);
      setShowLinkInput(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertHTML', `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`);
    }
  };

  const insertCodeBlock = () => {
    execCommand('insertHTML', '<pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-primary); margin: 8px 0; overflow-x: auto;"><code>// Your code here</code></pre>');
  };

  const insertQuote = () => {
    execCommand('insertHTML', '<blockquote style="border-left: 4px solid var(--accent-primary); margin: 16px 0; padding: 12px 16px; background: var(--bg-secondary); border-radius: 0 8px 8px 0; font-style: italic;">Quote text here</blockquote>');
  };

  const ToolbarButton: React.FC<{ 
    onClick: () => void; 
    title: string; 
    children: React.ReactNode; 
    active?: boolean;
    className?: string;
  }> = ({ onClick, title, children, active = false, className = '' }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-lg transform scale-105' 
          : 'hover:bg-[color:var(--bg-tertiary)] hover:scale-105'
      } ${className}`}
      style={{ color: active ? 'white' : 'var(--text-secondary)' }}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border rounded-2xl overflow-hidden glass-effect shadow-lg" style={{ borderColor: 'var(--border-color)' }}>
      {/* Toolbar */}
      <div className="backdrop-blur-sm border-b p-3" style={{ 
        background: 'linear-gradient(to right, var(--bg-secondary)/90, var(--bg-tertiary)/90)',
        borderColor: 'var(--border-color)'
      }}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Text formatting */}
          <div className="flex items-center space-x-1 glass-effect rounded-xl p-1 shadow-sm">
            <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 glass-effect rounded-xl p-1 shadow-sm">
            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="hidden sm:flex items-center space-x-1 glass-effect rounded-xl p-1 shadow-sm">
            <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Special content */}
          <div className="flex items-center space-x-1 glass-effect rounded-xl p-1 shadow-sm">
            <ToolbarButton onClick={insertCodeBlock} title="Code Block">
              <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={insertQuote} title="Quote">
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Media & Links */}
          <div className="flex items-center space-x-1 glass-effect rounded-xl p-1 shadow-sm">
            {/* Link */}
            <div className="relative">
              <ToolbarButton 
                onClick={() => setShowLinkInput(!showLinkInput)} 
                title="Insert Link"
                active={showLinkInput}
              >
                <Link className="h-4 w-4" />
              </ToolbarButton>
              {showLinkInput && (
                <div className="absolute top-full left-0 mt-2 glass-effect border rounded-2xl shadow-2xl p-4 z-20 min-w-80" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Enter URL"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/20 glass-effect"
                      style={{ 
                        borderColor: 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        background: 'var(--bg-secondary)'
                      }}
                    />
                    <input
                      type="text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Link text (optional)"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/20 glass-effect"
                      style={{ 
                        borderColor: 'var(--border-color)', 
                        color: 'var(--text-primary)',
                        background: 'var(--bg-secondary)'
                      }}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={insertLink}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl text-sm hover:from-[var(--accent-primary)]/90 hover:to-[var(--accent-secondary)]/90 transition-all duration-300 font-medium"
                      >
                        Add Link
                      </button>
                      <button
                        onClick={() => setShowLinkInput(false)}
                        className="px-4 py-2 border rounded-xl text-sm hover:bg-[color:var(--bg-tertiary)] transition-all duration-300"
                        style={{ 
                          borderColor: 'var(--border-color)', 
                          color: 'var(--text-secondary)' 
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ToolbarButton onClick={insertImage} title="Insert Image">
              <Image className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Emoji */}
          <div className="relative">
            <div className="glass-effect rounded-xl p-1 shadow-sm">
              <ToolbarButton 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                title="Insert Emoji"
                active={showEmojiPicker}
                data-emoji-button
              >
                <Smile className="h-4 w-4" />
              </ToolbarButton>
            </div>
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute top-full left-0 mt-2 glass-effect border rounded-2xl shadow-2xl p-4 z-20 max-h-64 overflow-y-auto"
                style={{
                  maxWidth: 'calc(100vw - 2rem)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  minWidth: '280px',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-w-xs">
                  {emojiList.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="p-2 hover:bg-[color:var(--bg-tertiary)] rounded-xl text-lg transition-all duration-300 hover:scale-110"
                      data-emoji-item
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="w-full mt-3 px-3 py-2 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Undo/Redo */}
          <div className="hidden md:flex items-center space-x-1 glass-effect rounded-xl p-1 shadow-sm">
            <ToolbarButton onClick={() => execCommand('undo')} title="Undo">
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('redo')} title="Redo">
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={updateContent}
        className="p-6 focus:outline-none prose prose-sm max-w-none min-h-[200px] leading-relaxed"
        style={{ 
          minHeight,
          color: 'var(--text-primary)'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: var(--text-tertiary);
            font-style: italic;
            pointer-events: none;
          }
          [contenteditable]:focus {
            outline: none;
          }
          [contenteditable] img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 8px 0;
          }
          [contenteditable] pre {
            background: var(--bg-secondary);
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid var(--accent-primary);
            margin: 8px 0;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            color: var(--text-primary);
          }
          [contenteditable] blockquote {
            border-left: 4px solid var(--accent-primary);
            margin: 16px 0;
            padding: 12px 16px;
            background: var(--bg-secondary);
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: var(--text-primary);
          }
        `
      }} />
    </div>
  );
};

export default RichTextEditor;