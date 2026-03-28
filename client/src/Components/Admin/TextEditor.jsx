import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function TextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-xl bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b p-3 bg-gray-50">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("bold") ? "bg-blue-500 text-white" : ""
          }`}
        >
          Bold
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("italic") ? "bg-blue-500 text-white" : ""
          }`}
        >
          Italic
        </button>

        {/* H1 */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-1 rounded border ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-500 text-white"
              : ""
          }`}
        >
          H1
        </button>

        {/* H2 */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1 rounded border ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-500 text-white"
              : ""
          }`}
        >
          H2
        </button>

        {/* H3 */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-3 py-1 rounded border ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-500 text-white"
              : ""
          }`}
        >
          H3
        </button>

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("bulletList") ? "bg-blue-500 text-white" : ""
          }`}
        >
          Bullet List
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded border ${
            editor.isActive("orderedList") ? "bg-blue-500 text-white" : ""
          }`}
        >
          Ordered List
        </button>
      </div>

      {/* Editor Area */}
      <EditorContent
        editor={editor}
        className="p-4 min-h-[250px] outline-none prose max-w-none"
      />
    </div>
  );
}
