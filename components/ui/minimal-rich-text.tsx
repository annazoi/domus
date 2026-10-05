'use client';

import { useEffect, useState } from 'react';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Link2, List, ListOrdered, Redo2, Undo2 } from 'lucide-react';
import { cn } from './cn';
import { Button } from './button';
import { normalizeRichTextLinkUrl, RichTextLinkDialog } from './rich-text-link-dialog';

type MinimalRichTextProps = {
	id?: string;
	label: string;
	value: string;
	onChange: (html: string) => void;
	placeholder?: string;
	editorMinHeight?: string;
};

const toolbarBtn =
	'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-espresso/65 transition hover:bg-dashboard-surface hover:text-espresso disabled:pointer-events-none disabled:opacity-30';

const toolbarActive = 'bg-dashboard-surface text-espresso shadow-[0_0_0_1px_var(--color-dashboard-border)]';

function getSelectionPreview(editor: Editor) {
	const { from, to } = editor.state.selection;
	if (from === to) return '';
	return editor.state.doc.textBetween(from, to, ' ').trim();
}

export function MinimalRichText({
	id,
	label,
	value,
	onChange,
	placeholder = 'Write…',
	editorMinHeight = 'min-h-[140px]',
}: MinimalRichTextProps) {
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [linkDialogUrl, setLinkDialogUrl] = useState('');
	const [linkDialogHasExisting, setLinkDialogHasExisting] = useState(false);
	const [linkSelectionPreview, setLinkSelectionPreview] = useState('');

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false,
				blockquote: false,
				codeBlock: false,
			}),
			Link.configure({
				openOnClick: false,
				autolink: true,
				defaultProtocol: 'https',
				HTMLAttributes: {
					rel: 'noopener noreferrer',
					target: '_blank',
				},
			}),
			Placeholder.configure({ placeholder }),
		],
		content: value || '',
		immediatelyRender: false,
		editorProps: {
			attributes: {
				...(id ? { id } : {}),
				class: cn(
					'minimal-rich-text-editor max-w-none bg-dashboard-surface px-4 py-3 text-sm leading-relaxed text-espresso caret-camel focus:outline-none',
					editorMinHeight,
					'[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
					'[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
					'[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
					'[&_strong]:font-semibold [&_em]:italic',
					'[&_a]:text-camel [&_a]:underline [&_a]:underline-offset-2',
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

	const openLinkDialog = () => {
		if (!editor) return;
		const previousUrl = (editor.getAttributes('link').href as string | undefined) ?? '';
		setLinkDialogUrl(previousUrl);
		setLinkDialogHasExisting(editor.isActive('link'));
		setLinkSelectionPreview(getSelectionPreview(editor));
		setLinkDialogOpen(true);
	};

	const closeLinkDialog = () => {
		setLinkDialogOpen(false);
		editor?.commands.focus();
	};

	const applyLink = (rawUrl: string) => {
		if (!editor) return;
		const normalized = normalizeRichTextLinkUrl(rawUrl);
		if (!normalized) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
		} else {
			editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run();
		}
		closeLinkDialog();
	};

	const removeLink = () => {
		if (!editor) return;
		editor.chain().focus().extendMarkRange('link').unsetLink().run();
		closeLinkDialog();
	};

	return (
		<div className="space-y-2.5">
			{label ? (
				<label htmlFor={id} className="block text-sm font-medium text-espresso">
					{label}
				</label>
			) : null}
			<div
				data-rich-text-root
				className="overflow-hidden rounded-xl border border-dashboard-border bg-dashboard-surface transition focus-within:border-camel/40 focus-within:ring-2 focus-within:ring-camel/12"
			>
				{editor ? (
					<div className="flex flex-wrap items-center gap-0.5 border-b border-dashboard-border bg-[color-mix(in_srgb,var(--color-dashboard-inset)_62%,var(--color-dashboard-surface))] px-2.5 py-2">
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('bold') && toolbarActive)}
							onClick={() => editor.chain().focus().toggleBold().run()}
							aria-label="Bold"
						>
							<Bold className="h-4 w-4" strokeWidth={2} />
						</Button>
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('italic') && toolbarActive)}
							onClick={() => editor.chain().focus().toggleItalic().run()}
							aria-label="Italic"
						>
							<Italic className="h-4 w-4" strokeWidth={2} />
						</Button>
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('link') && toolbarActive)}
							onClick={openLinkDialog}
							aria-label="Link"
						>
							<Link2 className="h-4 w-4" strokeWidth={2} />
						</Button>
						<span className="mx-1.5 h-5 w-px bg-espresso/15" aria-hidden />
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('bulletList') && toolbarActive)}
							onClick={() => editor.chain().focus().toggleBulletList().run()}
							aria-label="Bullet list"
						>
							<List className="h-4 w-4" strokeWidth={2} />
						</Button>
						<Button
							type="button"
							variant="custom"
							className={cn(toolbarBtn, editor.isActive('orderedList') && toolbarActive)}
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
							aria-label="Numbered list"
						>
							<ListOrdered className="h-4 w-4" strokeWidth={2} />
						</Button>
						<span className="mx-1.5 h-5 w-px bg-espresso/15" aria-hidden />
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
				<EditorContent
					editor={editor}
					className="bg-dashboard-surface [&_.ProseMirror]:min-h-[inherit]"
				/>
			</div>
			<RichTextLinkDialog
				open={linkDialogOpen}
				initialUrl={linkDialogUrl}
				selectionPreview={linkSelectionPreview}
				hasExistingLink={linkDialogHasExisting}
				onApply={applyLink}
				onRemove={removeLink}
				onCancel={closeLinkDialog}
			/>
		</div>
	);
}
