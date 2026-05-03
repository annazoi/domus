import type { ReactNode } from 'react';

type PropertyFormSectionProps = {
	id: string;
	title?: string;
	children: ReactNode;
};

export function PropertyFormSection({ id, title, children }: PropertyFormSectionProps) {
	return (
		<section id={id} className="scroll-mt-24 space-y-4 rounded-2xl bg-white/80 p-5">
			{title ? <h2 className="font-serif text-2xl">{title}</h2> : null}
			{children}
		</section>
	);
}
