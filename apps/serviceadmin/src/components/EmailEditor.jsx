import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

export default function EmailEditor({ value, onChange, editorStyle }) {
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
          min-height: 300px;
          padding: 16px;
          outline: none;
          font-size: 14px;
          line-height: 1.8;
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
    <div
      style={{
        border: "1px solid rgba(17,24,39,0.10)",
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div
        style={{
          minHeight: 300,
          ...editorStyle,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}