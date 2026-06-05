'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, cn } from '@/components/ui';

type DashboardPaginationProps = {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
	itemLabel?: string;
	className?: string;
};

function pageRange(page: number, totalPages: number) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
	const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
	const result: (number | 'ellipsis')[] = [];

	for (let index = 0; index < sorted.length; index += 1) {
		const current = sorted[index];
		const previous = sorted[index - 1];
		if (index > 0 && previous !== undefined && current - previous > 1) {
			result.push('ellipsis');
		}
		result.push(current);
	}

	return result;
}

export function DashboardPagination({
	page,
	pageSize,
	total,
	onPageChange,
	itemLabel = 'reservations',
	className,
}: DashboardPaginationProps) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const rangeEnd = Math.min(page * pageSize, total);

	if (total <= pageSize) return null;

	const pages = pageRange(page, totalPages);

	return (
		<div
			className={cn(
				'flex flex-col gap-4 border-t border-dashboard-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-10',
				className,
			)}
		>
			<p className="text-xs tracking-[0.12em] text-espresso/55">
				<span className="tabular-nums text-espresso/75">
					{rangeStart}–{rangeEnd}
				</span>{' '}
				of <span className="tabular-nums text-espresso/75">{total}</span> {itemLabel}
			</p>

			<nav aria-label="Pagination" className="flex items-center gap-1 self-end sm:self-auto">
				<Button
					type="button"
					variant="ghostIcon"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
					aria-label="Previous page"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{pages.map((entry, index) =>
					entry === 'ellipsis' ? (
						<span
							key={`ellipsis-${index}`}
							className="inline-flex h-9 w-9 items-center justify-center text-sm text-espresso/35"
							aria-hidden
						>
							…
						</span>
					) : (
						<button
							key={entry}
							type="button"
							onClick={() => onPageChange(entry)}
							aria-label={`Page ${entry}`}
							aria-current={entry === page ? 'page' : undefined}
							className={cn(
								'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full px-2 text-sm tabular-nums transition',
								entry === page
									? 'bg-camel/12 font-medium text-camel-dark'
									: 'text-espresso/60 hover:bg-dashboard-row-hover hover:text-espresso',
							)}
						>
							{entry}
						</button>
					),
				)}

				<Button
					type="button"
					variant="ghostIcon"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
					aria-label="Next page"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</nav>
		</div>
	);
}
