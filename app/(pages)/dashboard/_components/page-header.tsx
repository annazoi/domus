import type { ReactNode } from 'react';

type PageHeaderProps = {
	eyebrow?: string;
	title: string;
	description?: ReactNode;
	actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
	return (
		<header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-dashboard-border pb-6">
			<div className="min-w-0 max-w-2xl">
				{eyebrow ? <p className="text-xs uppercase tracking-[0.2em] text-camel">{eyebrow}</p> : null}
				<h1 className="mt-2 font-serif tracking-tight text-espresso">{title}</h1>
				{description ? <p className="mt-2 text-sm leading-relaxed text-dashboard-muted">{description}</p> : null}
			</div>
			{actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
		</header>
	);
}
