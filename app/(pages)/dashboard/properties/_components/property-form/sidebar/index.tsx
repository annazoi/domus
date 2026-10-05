'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/components/ui';
import { sidebarItems } from './constants';

export const PROPERTY_FORM_TAB_IDS = [
	'basic-info',
	'house-rules',
	'description',
	'capacity',
	'location',
	'pricing-availability',
	'amenities',
	'services',
	'images',
	'branding',
] as const;

export type PropertyFormTabId = (typeof PROPERTY_FORM_TAB_IDS)[number];

type PropertyFormSidebarProps = {
	mode: 'create' | 'edit';
	activeTab: PropertyFormTabId;
	onTabChange: (tabId: PropertyFormTabId) => void;
	onEditAvailability?: () => void;
};

const arrowButton =
	'grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-dashboard-border bg-dashboard-panel text-espresso transition hover:border-camel disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-dashboard-border';

/**
 * Section navigation. Screens 1600px and wider get a sticky row of numbered tabs; narrower screens get a
 * compact stepper (previous / current section picker / next) so nothing needs horizontal scrolling.
 */
export function PropertyFormSidebar({ activeTab, onTabChange }: PropertyFormSidebarProps) {
	const [open, setOpen] = useState(false);
	const activeIndex = Math.max(
		0,
		sidebarItems.findIndex((item) => item.id === activeTab),
	);
	const active = sidebarItems[activeIndex];
	const progress = ((activeIndex + 1) / sidebarItems.length) * 100;

	const select = (index: number) => {
		const item = sidebarItems[index];
		if (!item) return;
		onTabChange(item.id as PropertyFormTabId);
		setOpen(false);
	};

	useEffect(() => {
		if (!open) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open]);

	return (
		<div className="sticky top-16 z-20 -mx-5 border-b border-dashboard-border bg-dashboard-bg px-5 md:-mx-10 md:top-16 md:px-10">
			{/* Desktop: tab row */}
			<nav className="hidden gap-1 py-2.5 min-[1600px]:flex" role="tablist" aria-label="Property form sections">
				{sidebarItems.map((item, index) => {
					const selected = activeTab === item.id;
					return (
						<button
							key={item.id}
							id={`property-form-tab-${item.id}`}
							type="button"
							role="tab"
							aria-selected={selected}
							aria-controls={`property-form-panel-${item.id}`}
							onClick={() => onTabChange(item.id as PropertyFormTabId)}
							className={cn(
								'flex min-w-0 cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm transition xl:px-3.5',
								selected
									? 'bg-primary font-semibold text-primary-foreground'
									: 'text-dashboard-muted hover:bg-dashboard-row-hover hover:text-espresso',
							)}
						>
							<span
								className={cn(
									'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums',
									selected ? 'bg-white/20 text-primary-foreground' : 'bg-dashboard-inset text-dashboard-muted',
								)}
							>
								{index + 1}
							</span>
							<span className="truncate">{item.label}</span>
						</button>
					);
				})}
			</nav>

			{/* Mobile / tablet: stepper */}
			<div className="relative w-full py-3 min-[1600px]:hidden">
				<div className="flex items-center gap-2">
					<button
						type="button"
						className={arrowButton}
						onClick={() => select(activeIndex - 1)}
						disabled={activeIndex === 0}
						aria-label="Previous section"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={() => setOpen((value) => !value)}
						aria-haspopup="listbox"
						aria-expanded={open}
						className="flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-full border border-dashboard-border bg-dashboard-panel px-4 text-left transition hover:border-camel"
					>
						<span className="min-w-0">
							<span className="block text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-dashboard-muted">
								Step {activeIndex + 1} of {sidebarItems.length}
							</span>
							<span className="mt-0.5 block truncate text-sm font-semibold leading-tight text-espresso">
								{active?.label}
							</span>
						</span>
						<ChevronDown className={cn('h-4 w-4 shrink-0 text-dashboard-muted transition', open && 'rotate-180')} />
					</button>
					<button
						type="button"
						className={arrowButton}
						onClick={() => select(activeIndex + 1)}
						disabled={activeIndex === sidebarItems.length - 1}
						aria-label="Next section"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>

				<div className="mt-3 h-1 overflow-hidden rounded-full bg-dashboard-inset" aria-hidden>
					<div className="h-full rounded-full bg-camel transition-[width] duration-300" style={{ width: `${progress}%` }} />
				</div>

				{open ? (
					<>
						<button
							type="button"
							aria-label="Close section list"
							className="fixed inset-0 z-30 cursor-default bg-transparent"
							onClick={() => setOpen(false)}
						/>
						<div
							role="listbox"
							aria-label="Property form sections"
							className="absolute inset-x-0 top-full z-40 mt-2 max-h-[min(24rem,70vh)] overflow-y-auto rounded-2xl border border-dashboard-border bg-dashboard-panel p-2 shadow-[var(--shadow-dashboard-panel)]"
						>
							{sidebarItems.map((item, index) => {
								const selected = index === activeIndex;
								return (
									<button
										key={item.id}
										id={`property-form-tab-${item.id}`}
										type="button"
										role="option"
										aria-selected={selected}
										onClick={() => select(index)}
										className={cn(
											'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
											selected
												? 'bg-espresso/10 font-semibold text-espresso'
												: 'text-dashboard-muted hover:bg-dashboard-row-hover hover:text-espresso',
										)}
									>
										<span
											className={cn(
												'grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums',
												selected ? 'bg-camel text-white' : 'bg-dashboard-inset text-dashboard-muted',
											)}
										>
											{index + 1}
										</span>
										<span className="flex-1 truncate">{item.label}</span>
										{selected ? <Check className="h-4 w-4 text-camel" /> : null}
									</button>
								);
							})}
						</div>
					</>
				) : null}
			</div>
		</div>
	);
}
