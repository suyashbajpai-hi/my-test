import React, { useState, useRef, useEffect } from "react";
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
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Move emojiList outside component to prevent recreation on every render
const emojiList = [
  "😀",
  "😊",
  "😎",
  "🤔",
  "👍",
  "👎",
  "❤",
  "🎉",
  "💡",
  "🔥",
  "✨",
  "🚀",
  "💯",
  "🎯",
  "⭐",
  "🌟",
  "💪",
  "🙌",
  "👏",
  "🤝",
  "📝",
  "💻",
  "🖥",
  "📱",
  "⚡",
  "🌈",
  "🎨",
  "🔧",
  "⚙",
  "🛠",
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  minHeight = "200px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

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
        !target.closest("[data-emoji-button]") &&
        !target.closest("[data-emoji-item]")
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        console.error("Error inserting emoji:", error);
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
      execCommand(
        "insertHTML",
        `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`
      );
      setShowLinkInput(false);
      setLinkUrl("");
      setLinkText("");
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      execCommand(
        "insertHTML",
        `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`
      );
    }
  };

  const insertCodeBlock = () => {
    execCommand(
      "insertHTML",
      '<pre style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff; margin: 8px 0; overflow-x: auto;"><code>// Your code here</code></pre>'
    );
  };

  const insertQuote = () => {
    execCommand(
      "insertHTML",
      '<blockquote style="border-left: 4px solid #007bff; margin: 16px 0; padding: 12px 16px; background: #f8f9fa; border-radius: 0 8px 8px 0; font-style: italic;">Quote text here</blockquote>'
    );
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
    className?: string;
  }> = ({ onClick, title, children, active = false, className = "" }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
          : "hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105"
      } ${className}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-gray-50/90 to-gray-100/90 backdrop-blur-sm border-b border-gray-200/50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text formatting */}
          <div className="flex items-center space-x-1 bg-white/80 rounded-xl p-1 shadow-sm">
            <ToolbarButton onClick={() => execCommand("bold")} title="Bold">
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("italic")} title="Italic">
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("strikeThrough")}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 bg-white/80 rounded-xl p-1 shadow-sm">
            <ToolbarButton
              onClick={() => execCommand("insertUnorderedList")}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("insertOrderedList")}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="hidden sm:flex items-center space-x-1 bg-white/80 rounded-xl p-1 shadow-sm">
            <ToolbarButton
              onClick={() => execCommand("justifyLeft")}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("justifyCenter")}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("justifyRight")}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Special content */}
          <div className="flex items-center space-x-1 bg-white/80 rounded-xl p-1 shadow-sm">
            <ToolbarButton onClick={insertCodeBlock} title="Code Block">
              <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={insertQuote} title="Quote">
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Media & Links */}
          <div className="flex items-center space-x-1 bg-white/80 rounded-xl p-1 shadow-sm">
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
                <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-4 z-20 min-w-80">
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Enter URL"
                      className="w-full px-3 py-2 border border-gray-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50"
                    />
                    <input
                      type="text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Link text (optional)"
                      className="w-full px-3 py-2 border border-gray-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={insertLink}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
                      >
                        Add Link
                      </button>
                      <button
                        onClick={() => setShowLinkInput(false)}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-all duration-300"
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
            <div className="bg-white/80 rounded-xl p-1 shadow-sm">
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
                className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-4 z-20 max-h-64 overflow-y-auto"
                style={{
                  maxWidth: "calc(100vw - 2rem)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  minWidth: "280px",
                }}
              >
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-w-xs">
                  {emojiList.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="p-2 hover:bg-gray-100/80 rounded-xl text-lg transition-all duration-300 hover:scale-110"
                      data-emoji-item
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="w-full mt-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Undo/Redo */}
          <div className="hidden md:flex items-center space-x-1 bg-white/80 rounded-xl p-1 shadow-sm">
            <ToolbarButton onClick={() => execCommand("undo")} title="Undo">
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("redo")} title="Redo">
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
        className="p-6 focus:outline-none prose prose-sm max-w-none min-h-[200px] text-gray-700 leading-relaxed"
        style={{ minHeight }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
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
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
            margin: 8px 0;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }
          [contenteditable] blockquote {
            border-left: 4px solid #007bff;
            margin: 16px 0;
            padding: 12px 16px;
            background: #f8f9fa;
            border-radius: 0 8px 8px 0;
            font-style: italic;
          }
        `,
        }}
      />
    </div>
  );
};

export default RichTextEditor;
