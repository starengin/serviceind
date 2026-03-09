import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

export default function EmailEditor({ value, onChange, toolbarStyle, editorStyle, buttonStyle }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "email-editor-prose",
        style: `
          min-height: 220px;
          padding: 14px;
          outline: none;
          font-size: 14px;
          line-height: 1.7;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
          word-break: break-word;
          white-space: normal;
        `,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) {
      editor.commands.setContent(next || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid rgba(17,24,39,0.10)", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: 10,
          borderBottom: "1px solid rgba(17,24,39,0.08)",
          background:
            "radial-gradient(700px 180px at 15% 0%, rgba(0,123,255,0.04), transparent 55%), linear-gradient(180deg,#fff,#f8fbff)",
          ...toolbarStyle,
        }}
      >
        <button type="button" style={buttonStyle} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
        <button type="button" style={buttonStyle} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button type="button" style={buttonStyle} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></button>
        <button type="button" style={buttonStyle} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" style={buttonStyle} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" style={buttonStyle} onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button type="button" style={buttonStyle} onClick={() => editor.chain().focus().redo().run()}>Redo</button>
        <button type="button" style={buttonStyle} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</button>
      </div>

      <div style={{ minHeight: 220, ...editorStyle }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}