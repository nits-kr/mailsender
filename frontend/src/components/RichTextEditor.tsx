import React, { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Image,
  Minus,
  Undo,
  Redo,
  X,
  Check,
  Trash2,
  Code,
  Type,
  Droplet,
  ListOrdered,
  Strikethrough,
  Outdent,
  Indent,
} from "lucide-react";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  value?: string;
  onChange: (content: string) => void;
  onClose: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewSource, setViewSource] = useState(false);
  const [sourceCode, setSourceCode] = useState(value || "");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const triggerChange = (content: string) => {
    // Update local state immediately for fast UI
    setSourceCode(content);

    // Debounce the heavy parent onChange update
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChange(content);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Initialize iframe content
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && !viewSource) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.designMode = "on";
      doc.open();
      doc.write(value || "");
      doc.close();

      // Ensure decent default styling for the editable area so it doesn't look broken
      if (!doc.querySelector("style")) {
        const style = doc.createElement("style");
        style.textContent = `
          body { font-family: -apple-system, system-ui, sans-serif; padding: 1rem; color: #333; line-height: 1.5; }
          a { color: #2563eb; text-decoration: underline; }
          ul, ol { margin-left: 20px; }
          img { max-width: 100%; height: auto; }
          blockquote { border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0; color: #666; }
`;
        doc.head.appendChild(style);
      }

      const handleInput = () => {
        const content = doc.documentElement.outerHTML;
        triggerChange(content);
      };

      doc.body.addEventListener("input", handleInput);
      doc.body.addEventListener("keyup", handleInput);
      doc.body.addEventListener("click", handleInput);

      return () => {
        if (doc.body) {
          doc.body.removeEventListener("input", handleInput);
          doc.body.removeEventListener("keyup", handleInput);
          doc.body.removeEventListener("click", handleInput);
        }
      };
    }
  }, [viewSource]); // Re-init when switching back from source view

  const execCmd = (command: string, cmdValue: string | null = null) => {
    const iframe = iframeRef.current;
    if (iframe && !viewSource) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.execCommand(command, false, cmdValue || "");

      const event = new Event("input", { bubbles: true });
      doc.body.dispatchEvent(event);
      triggerChange(doc.documentElement.outerHTML);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    triggerChange(e.target.value);
  };

  const insertLink = () => {
    const url = prompt("Enter link URL:", "https://");
    if (url) execCmd("createLink", url);
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:", "https://");
    if (url) {
      // Browsers often silently fail on `insertImage` in cross-origin situations or modern versions
      // So we force a raw HTML image node insertion instead which always works
      execCmd(
        "insertHTML",
        `<img src="${url}" style="max-width: 100%; height: auto;" alt="Inserted image"/>`,
      );
    }
  };

  return (
    <div className="rte-overlay">
      <div className="rte-backdrop" onClick={onClose} />

      <div className="rte-modal">
        {/* Header */}
        <div className="rte-header">
          <div className="rte-header-info">
            <div className="rte-icon-wrapper">
              <Type size={20} />
            </div>
            <div>
              <h3 className="rte-title">Professional Email Editor</h3>
              <p className="rte-subtitle">
                Design beautiful, responsive HTML emails
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rte-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar - Only visible in Design Mode */}
        {!viewSource && (
          <div className="rte-toolbar">
            <div className="rte-toolbar-group">
              <select
                onChange={(e) => execCmd("formatBlock", e.target.value)}
                className="rte-format-select"
                defaultValue=""
              >
                <option value="" disabled>
                  Format
                </option>
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="pre">Code Block</option>
                <option value="blockquote">Quote</option>
              </select>
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<Bold size={18} />}
                onClick={() => execCmd("bold")}
                label="Bold (Ctrl+B)"
              />
              <ToolbarButton
                icon={<Italic size={18} />}
                onClick={() => execCmd("italic")}
                label="Italic (Ctrl+I)"
              />
              <ToolbarButton
                icon={<Underline size={18} />}
                onClick={() => execCmd("underline")}
                label="Underline (Ctrl+U)"
              />
              <ToolbarButton
                icon={<Strikethrough size={18} />}
                onClick={() => execCmd("strikeThrough")}
                label="Strikethrough"
              />
            </div>

            <div className="rte-toolbar-group">
              <div className="rte-color-picker-wrapper">
                <button
                  type="button"
                  className="rte-toolbar-btn"
                  title="Text Color"
                >
                  <Droplet size={18} />
                  <input
                    type="color"
                    className="rte-color-input"
                    onChange={(e) => execCmd("foreColor", e.target.value)}
                    title="Text Color"
                  />
                </button>
              </div>
              <div className="rte-color-picker-wrapper">
                <button
                  type="button"
                  className="rte-toolbar-btn"
                  title="Background Color"
                >
                  <div className="rte-color-indicator"></div>
                  <input
                    type="color"
                    className="rte-color-input"
                    onChange={(e) => execCmd("hiliteColor", e.target.value)}
                    title="Highlight Color"
                  />
                </button>
              </div>
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<AlignLeft size={18} />}
                onClick={() => execCmd("justifyLeft")}
                label="Align Left"
              />
              <ToolbarButton
                icon={<AlignCenter size={18} />}
                onClick={() => execCmd("justifyCenter")}
                label="Align Center"
              />
              <ToolbarButton
                icon={<AlignRight size={18} />}
                onClick={() => execCmd("justifyRight")}
                label="Align Right"
              />
              <ToolbarButton
                icon={<AlignJustify size={18} />}
                onClick={() => execCmd("justifyFull")}
                label="Justify"
              />
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<List size={18} />}
                onClick={() => execCmd("insertUnorderedList")}
                label="Bullet List"
              />
              <ToolbarButton
                icon={<ListOrdered size={18} />}
                onClick={() => execCmd("insertOrderedList")}
                label="Numbered List"
              />
              <ToolbarButton
                icon={<Outdent size={18} />}
                onClick={() => execCmd("outdent")}
                label="Decrease Indent"
              />
              <ToolbarButton
                icon={<Indent size={18} />}
                onClick={() => execCmd("indent")}
                label="Increase Indent"
              />
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<Link size={18} />}
                onClick={insertLink}
                label="Insert Link"
              />
              <ToolbarButton
                icon={<Image size={18} />}
                onClick={insertImage}
                label="Insert Image"
              />
              <ToolbarButton
                icon={<Minus size={18} />}
                onClick={() => execCmd("insertHorizontalRule")}
                label="Horizontal Line"
              />
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<Undo size={18} />}
                onClick={() => execCmd("undo")}
                label="Undo (Ctrl+Z)"
              />
              <ToolbarButton
                icon={<Redo size={18} />}
                onClick={() => execCmd("redo")}
                label="Redo (Ctrl+Y)"
              />
              <ToolbarButton
                icon={<Trash2 size={18} />}
                onClick={() => execCmd("removeFormat")}
                label="Clear Formatting"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="rte-content-area">
          {viewSource ? (
            <textarea
              className="rte-source-textarea"
              value={sourceCode}
              onChange={handleSourceChange}
              spellCheck={false}
            />
          ) : (
            <div className="rte-iframe-container">
              <iframe
                ref={iframeRef}
                title="wysiwyg-editor"
                className="rte-iframe"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="rte-footer">
          <div className="rte-footer-left">
            <button
              type="button"
              onClick={() => setViewSource(!viewSource)}
              className={`rte-switch-btn ${viewSource ? "active" : "inactive"}`}
            >
              <Code size={16} />
              {viewSource ? "Switch to Visual Editor" : "View Source Code"}
            </button>

            <div className="rte-status-text">
              {viewSource
                ? "Editing HTML source directly."
                : "WYSIWYG Mode enabled."}
            </div>
          </div>

          <div className="rte-footer-right">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm("Clear all content? This cannot be undone.")
                ) {
                  if (viewSource) {
                    setSourceCode("");
                    onChange("");
                  } else {
                    const iframe = iframeRef.current;
                    if (iframe && iframe.contentDocument) {
                      iframe.contentDocument.body.innerHTML = "";
                      onChange("");
                    }
                  }
                }
              }}
              className="rte-clear-btn"
            >
              Clear
            </button>
            <button type="button" onClick={onClose} className="rte-save-btn">
              <Check size={16} />
              Save & Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  onClick,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className="rte-toolbar-btn"
  >
    {icon}
  </button>
);

export default RichTextEditor;
