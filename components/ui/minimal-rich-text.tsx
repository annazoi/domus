'use client';

import { useEffect } from 'react';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Redo2, Undo2 } from 'lucide-react';
import { cn } from './cn';
import { Button } from './button';

type MinimalRichTextProps = {
	id?: string;
	label: string;
	value: string;
	onChange: (html: string) => void;
	placeholder?: string;
	/** Tailwind min-height class */
	editorMinHeight?: string;
};

const toolbarBtn =
	'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#1A1A1A]/65 transition hover:bg-black/[0.04] hover:text-[#1A1A1A] disabled:opacity-30';

export function MinimalRichText({
	id,
	label,
	value,
	onChange,
	placeholder = 'Write…',
	editorMinHeight = 'min-h-[140px]',
}: MinimalRichTextProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false,
				blockquote: false,
				codeBlock: false,
			}),
			Placeholder.configure({ placeholder }),
		],
		content: value || '',
		immediatelyRender: false,
		editorProps: {
			attributes: {
				...(id ? { id } : {}),
				class: cn(
					'max-w-none px-4 py-3 text-sm leading-relaxed text-[#1A1A1A] focus:outline-none minimal-rich-text-editor',
					editorMinHeight,
					'[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
					'[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
					'[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
				),
			},
		},
		onUpdate: ({ editor: ed }) => {
			onChange(ed.getHTML());
		},
	});

	useEffect(() => {
		if (!editor) return;
		const incoming = value || '';
		const cur = editor.getHTML();
		if (incoming === cur) return;
		editor.commands.setContent(incoming, { emitUpdate: false });
	}, [value, editor]);

	return (
		<div className="space-y-1.5">
			{label ? (
				<label htmlFor={id} className="text-sm font-medium text-[#1A1A1A]">
					{label}
				</label>
			) : null}
			<div
				data-rich-text-root
				className="overflow-hidden rounded-xl border border-black/10 bg-white transition hover:border-camel/25 focus-within:border-camel/40 focus-within:ring-2 focus-within:ring-camel/12"
			>
				{editor ? (
					<div className="flex flex-wrap items-center gap-0.5 border-b border-black/[0.06] bg-[#fafaf8] px-2 py-1.5">
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('bold') && 'bg-black/[0.06] text-[#1A1A1A]')}
							onClick={() => editor.chain().focus().toggleBold().run()}
							aria-label="Bold"
						>
							<Bold className="h-4 w-4" strokeWidth={2} />
						</Button>
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('italic') && 'bg-black/[0.06] text-[#1A1A1A]')}
							onClick={() => editor.chain().focus().toggleItalic().run()}
							aria-label="Italic"
						>
							<Italic className="h-4 w-4" strokeWidth={2} />
						</Button>
						<span className="mx-1 h-4 w-px bg-black/10" aria-hidden />
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('bulletList') && 'bg-black/[0.06] text-[#1A1A1A]')}
							onClick={() => editor.chain().focus().toggleBulletList().run()}
							aria-label="Bullet list"
						>
							<List className="h-4 w-4" strokeWidth={2} />
						</Button>
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('orderedList') && 'bg-black/[0.06] text-[#1A1A1A]')}
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
							aria-label="Numbered list"
						>
							<ListOrdered className="h-4 w-4" strokeWidth={2} />
						</Button>
						<span className="mx-1 h-4 w-px bg-black/10" aria-hidden />
						<Button
							type="button"
							variant="custom"
							className={toolbarBtn}
							onClick={() => editor.chain().focus().undo().run()}
							disabled={!editor.can().chain().focus().undo().run()}
							aria-label="Undo"
						>
							<Undo2 className="h-4 w-4" strokeWidth={2} />
						</Button>
						<Button
							type="button"
							variant="custom"
							className={toolbarBtn}
							onClick={() => editor.chain().focus().redo().run()}
							disabled={!editor.can().chain().focus().redo().run()}
							aria-label="Redo"
						>
							<Redo2 className="h-4 w-4" strokeWidth={2} />
						</Button>
					</div>
				) : null}
				<EditorContent editor={editor} className="[&_.ProseMirror]:min-h-[inherit]" />
			</div>
		</div>
	);
}
