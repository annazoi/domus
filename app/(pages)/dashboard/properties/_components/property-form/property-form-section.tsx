import type { ReactNode } from 'react';
import { cn } from '@/components/ui';

type PropertyFormSectionProps = {
	id: string;
	title?: string;
	children: ReactNode;
	flat?: boolean;
};

const fieldSurface = cn(
	'[&_input.border]:w-full [&_input.border]:rounded-lg [&_input.border]:border-0 [&_input.border]:bg-dashboard-bg',
	'[&_input.border]:px-3 [&_input.border]:py-2 [&_input.border]:text-espresso [&_input.border]:shadow-none',
	'[&_input.border]:placeholder:text-dashboard-muted/55',
	'[&_input.border]:focus:outline-none [&_input.border]:focus:ring-0',
	'[&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border-0 [&_textarea]:bg-dashboard-bg',
	'[&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-espresso [&_textarea]:placeholder:text-dashboard-muted/55',
	'[&_textarea]:focus:outline-none [&_textarea]:focus:ring-0',
	'[&_button[role=combobox]]:w-full [&_button[role=combobox]]:rounded-lg [&_button[role=combobox]]:border-0',
	'[&_button[role=combobox]]:bg-dashboard-bg [&_button[role=combobox]]:px-3 [&_button[role=combobox]]:py-2',
	'[&_button[role=combobox]]:text-espresso [&_button[role=combobox]]:shadow-none',
);

export const dashboardFormFields = fieldSurface;

export function PropertyFormSection({ id, title, children, flat = false }: PropertyFormSectionProps) {
	return (
		<section
			id={id}
			className={cn(
				'scroll-mt-24 space-y-4',
				flat ? '' : 'dashboard-panel rounded-2xl p-5',
				fieldSurface,
			)}
		>
			{title ? <h2 className="font-serif text-2xl text-espresso">{title}</h2> : null}
			{children}
		</section>
	);
}