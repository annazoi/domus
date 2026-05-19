import type { ReactNode } from 'react';
import { cn } from '@/components/ui';

type PropertyFormSectionProps = {
	id: string;
	title?: string;
	children: ReactNode;
};

const fieldSurface = cn(
	'[&_input.border]:bg-[#F7F5F2]',
	'[&_textarea]:bg-[#F7F5F2]',
	'[&_select]:bg-[#F7F5F2]',
	'[&_button[role=combobox]]:bg-[#F7F5F2]',
	'[&_[data-rich-text-root]]:bg-[#F7F5F2]',
);

export function PropertyFormSection({ id, title, children }: PropertyFormSectionProps) {
	return (
		<section id={id} className={cn('scroll-mt-24 space-y-4 rounded-2xl bg-white/80 p-5', fieldSurface)}>
			{title ? <h2 className="font-serif text-2xl">{title}</h2> : null}
			{children}
		</section>
	);
}
