'use client';

import { cn } from '@/components/ui';

const variantStyles = {
	canvas: 'font-[family-name:var(--preview-hikari-body)] text-base leading-[1.85] text-[#0a0a0a]/70 sm:text-lg [&_strong]:font-semibold [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
	mizu: 'font-[family-name:var(--preview-mizu-body)] text-base leading-relaxed text-[#1a2e35]/72 sm:text-lg [&_strong]:font-semibold [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
	architectura:
		'font-[family-name:var(--preview-kaze-body)] text-base leading-relaxed text-[#1c2430]/70 sm:text-lg [&_strong]:font-semibold [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
} as const;

type BrandingRichTextBlockProps = {
	html: string;
	variant: keyof typeof variantStyles;
	className?: string;
};

export function BrandingRichTextBlock({ html, variant, className }: BrandingRichTextBlockProps) {
	const content = html.trim();
	if (!content) return null;

	return (
		<div
			className={cn(variantStyles[variant], className)}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
}
