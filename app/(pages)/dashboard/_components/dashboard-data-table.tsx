'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from '@tanstack/react-table';
import { Skeleton, cn } from '@/components/ui';
import { BookingStatus } from '@/features/bookings/interfaces/booking-status';

type ColumnAlignment = 'left' | 'center' | 'right';

type DashboardDataTableProps<T> = {
	data: T[];
	columns: ColumnDef<T, any>[];
	onRowClick?: (row: T) => void;
	minWidth?: string;
	getRowId?: (row: T) => string;
	headerClassName?: (columnId: string) => string;
	cellClassName?: (columnId: string) => string;
	embedded?: boolean;
};

type DashboardDataTableSkeletonProps = {
	headers: readonly string[];
	rows?: number;
	minWidth?: string;
	headerAlignment?: (header: string) => ColumnAlignment | undefined;
};

const baseHeaderClass =
	'px-5 py-4 text-xs font-normal uppercase tracking-[0.18em] text-camel md:px-8 lg:px-10';

const baseCellClass = 'px-5 py-5 align-middle md:px-8 lg:px-10';

function alignmentClass(alignment?: ColumnAlignment) {
	if (alignment === 'center') return 'text-center';
	if (alignment === 'right') return 'text-right';
	return undefined;
}

function defaultHeaderClassName(columnId: string) {
	return cn(
		baseHeaderClass,
		columnId === 'total_price' && 'text-right',
		columnId === 'amount' && 'text-right',
		columnId === 'guests' && 'text-center',
		columnId === 'status' && 'text-right',
		columnId === 'booking_count' && 'text-right',
		columnId === 'total_spent' && 'text-right',
	);
}

function defaultCellClassName(columnId: string) {
	return cn(
		baseCellClass,
		columnId === 'property_title' && 'max-w-[16rem]',
		columnId === 'stay' && 'whitespace-nowrap text-sm text-espresso/65 md:text-[0.95rem]',
		columnId === 'guests' && 'text-center text-sm tabular-nums text-espresso/75 md:text-[0.95rem]',
		columnId === 'total_price' &&
			'whitespace-nowrap text-right text-sm font-medium tabular-nums text-espresso md:text-[0.95rem]',
		columnId === 'amount' &&
			'whitespace-nowrap text-right text-sm font-medium tabular-nums text-camel md:text-[0.95rem]',
		columnId === 'status' && 'text-right',
		columnId === 'date' && 'whitespace-nowrap text-sm text-espresso/65 md:text-[0.95rem]',
		columnId === 'id' && 'text-sm tabular-nums text-espresso/55 md:text-[0.95rem]',
		columnId === 'location' && 'text-sm text-espresso/70 md:text-[0.95rem]',
		columnId === 'booking_count' && 'text-right text-sm tabular-nums text-espresso/75 md:text-[0.95rem]',
		columnId === 'total_spent' && 'text-right',
	);
}

function openRow<T>(
	event: KeyboardEvent<HTMLTableRowElement>,
	row: T,
	onRowClick: (row: T) => void,
) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		onRowClick(row);
	}
}

export function DashboardDataTableSkeleton({
	headers,
	rows = 5,
	minWidth = '760px',
	headerAlignment,
}: DashboardDataTableSkeletonProps) {
	return (
		<div className="dashboard-panel overflow-hidden rounded-2xl">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left" style={{ minWidth }}>
					<thead>
						<tr className="border-b border-dashboard-border bg-dashboard-inset/50">
							{headers.map((header) => (
								<th
									key={header}
									className={cn(baseHeaderClass, alignmentClass(headerAlignment?.(header)))}
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: rows }).map((_, index) => (
							<tr key={index} className="border-b border-dashboard-border last:border-b-0">
								{headers.map((header) => (
									<td key={header} className={baseCellClass}>
										<Skeleton
											className={cn(
												'h-4 bg-black/10',
												header === 'Guest' && 'h-5 w-32',
												header === 'Property' && 'w-44',
												header === 'Stay' && 'w-36',
												header === 'Guests' && 'mx-auto w-8',
												header === 'Total' && 'ml-auto w-16',
												header === 'Price' && 'ml-auto w-16',
												header === 'Amount' && 'ml-auto w-16',
												header === 'Status' && 'h-6 w-20 rounded-full',
												header === 'Reference' && 'w-24',
												header === 'Date' && 'w-20',
												header === 'Customer' && 'h-5 w-40',
												header === 'Location' && 'w-32',
												header === 'Bookings' && 'ml-auto w-20',
												header === 'Spent' && 'ml-auto w-24',
											)}
										/>
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export function DashboardDataTable<T>({
	data,
	columns,
	onRowClick,
	minWidth = '760px',
	getRowId,
	headerClassName = defaultHeaderClassName,
	cellClassName = defaultCellClassName,
	embedded = false,
}: DashboardDataTableProps<T>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId,
	});

	return (
		<div className={cn(!embedded && 'dashboard-panel overflow-hidden rounded-2xl')}>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left" style={{ minWidth }}>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="border-b border-dashboard-border bg-dashboard-inset/50">
								{headerGroup.headers.map((header) => (
									<th key={header.id} className={headerClassName(header.column.id)}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								tabIndex={onRowClick ? 0 : undefined}
								role={onRowClick ? 'button' : undefined}
								className={cn(
									'border-b border-dashboard-border transition last:border-b-0',
									onRowClick &&
										'group cursor-pointer hover:bg-dashboard-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel/30 focus-visible:ring-inset',
								)}
								onClick={onRowClick ? () => onRowClick(row.original) : undefined}
								onKeyDown={
									onRowClick
										? (event) => openRow(event, row.original, onRowClick)
										: undefined
								}
							>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className={cellClassName(cell.column.id)}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export function BookingStatusBadge({
	status,
	className,
}: {
	status: BookingStatus;
	className?: string;
}) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide',
				status === BookingStatus.CONFIRMED && 'bg-camel/12 text-camel-dark',
				status === BookingStatus.CANCELLED &&
					'bg-dashboard-bg text-dashboard-muted line-through decoration-dashboard-muted/40',
				status === BookingStatus.PENDING && 'bg-dashboard-surface text-dashboard-muted',
				className,
			)}
		>
			{status}
		</span>
	);
}

export function GuestNameCell({ children }: { children: ReactNode }) {
	return <span className="font-medium leading-snug text-espresso">{children}</span>;
}
