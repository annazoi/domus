'use client';

import { cn } from '@/components/ui';

const linkStyles =
	'[&_a]:cursor-pointer [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-current/35 hover:[&_a]:decoration-current/70';

const variantStyles = {
	canvas: `font-[family-name:var(--preview-hikari-body)] text-base leading-[1.85] text-[#0a0a0a]/70 sm:text-lg [&_strong]:font-semibold [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 ${linkStyles}`,
	mizu: `font-[family-name:var(--preview-mizu-body)] text-base leading-relaxed text-[#1a2e35]/72 sm:text-lg [&_strong]:font-semibold [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 ${linkStyles}`,
	architectura:
		`font-[family-name:var(--preview-kaze-body)] text-[15px] leading-[1.8] text-[#5F665F] [&_strong]:font-semibold [&_strong]:text-[#1C211C] [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 ${linkStyles}`,
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
