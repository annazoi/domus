'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, buttonClassName, cn, ConfirmationDialog, Skeleton } from '@/components/ui';
import { DashboardPagination } from '@/app/(pages)/dashboard/_components/dashboard-pagination';
import { useDeleteProperty, usePropertiesPage } from '@/features/property/hooks/use-property';
import { PROPERTIES_SEARCH_MIN_LENGTH } from '@/features/property/services/property.services';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { hasActivePropertiesSearch, PropertiesSearch } from './_components/properties-search';

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

export default function PropertiesPage() {
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const deferredSearch = useDeferredValue(searchQuery.trim());
	const searchParam =
		deferredSearch.length >= PROPERTIES_SEARCH_MIN_LENGTH ? deferredSearch : undefined;
	const { data, isLoading, isFetching } = usePropertiesPage(page, PAGE_SIZE, searchParam);
	const { mutateAsync: removeProperty, isPending: deleting } = useDeleteProperty();

	const properties = data?.items ?? [];
	const pagination = data?.pagination;
	const total = pagination?.total ?? 0;
	const toDelete = properties.find((property) => property.id === deleteId);
	const loading = isLoading;
	const searchActive = hasActivePropertiesSearch(searchQuery);
	const searchPending = searchQuery.trim() !== deferredSearch;

	useEffect(() => {
		setPage(1);
	}, [searchParam]);

	useEffect(() => {
		if (!pagination || page <= pagination.totalPages) return;
		setPage(pagination.totalPages);
	}, [page, pagination]);

	return (
		<div className="space-y-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-camel">Properties</p>
					<h1 className="mt-2 font-serif text-4xl tracking-tight">Your homes, curated.</h1>
				</div>
				<Link href="/dashboard/properties/new" className={buttonClassName('primarySm')}>
					Add Property
				</Link>
			</div>

			<PropertiesSearch value={searchQuery} onChange={setSearchQuery} />

			{loading ? (
				<div className="space-y-4">
					{Array.from({ length: PAGE_SIZE }).map((_, index) => (
						<div key={index} className="grid grid-cols-1 gap-4 dashboard-panel rounded-2xl p-4 md:grid-cols-[140px_1fr_auto]">
							<Skeleton className="dashboard-inset h-24 w-full rounded-xl" />
							<div className="space-y-2 py-1">
								<Skeleton className="h-5 w-52 rounded-md bg-dashboard-border/50" />
								<Skeleton className="h-4 w-28 rounded-md bg-dashboard-border/40" />
							</div>
							<div className="flex items-center gap-2 md:justify-end">
								<Skeleton className="h-7 w-20 rounded-full bg-dashboard-inset" />
								<Skeleton className="h-4 w-10 rounded-md bg-dashboard-border/40" />
								<Skeleton className="h-4 w-10 rounded-md bg-dashboard-border/40" />
							</div>
						</div>
					))}
				</div>
			) : null}
			{!loading && total === 0 ? (
				<div className="dashboard-panel rounded-2xl p-8 text-center">
					<p className="font-serif text-2xl">
						{searchActive ? 'No matching properties' : 'No properties yet'}
					</p>
					<p className="mt-2 text-sm text-dashboard-muted">
						{searchActive
							? 'Try a different search term.'
							: 'Create your first listing to start receiving bookings.'}
					</p>
					{searchActive ? (
						<Button
							type="button"
							variant="ghostPill"
							onClick={() => setSearchQuery('')}
							className="mt-4 text-sm text-camel"
						>
							Clear search
						</Button>
					) : null}
				</div>
			) : null}

			{!loading && total > 0 ? (
				<div className="dashboard-panel overflow-hidden rounded-2xl">
					<div
						className={cn(
							'space-y-4 p-4 transition-opacity md:p-0',
							(isFetching || searchPending) && 'pointer-events-none opacity-50',
						)}
					>
						{properties.map((property) => {
							const cover = property.images.find((image) => image.is_cover) ?? property.images[0];
							const coverUrl = cover?.document?.url;
							return (
								<div key={property.id} className="grid grid-cols-1 gap-4 rounded-2xl p-4 md:grid-cols-[140px_1fr_auto] md:rounded-none md:border-b md:border-dashboard-border md:last:border-b-0">
									<div
										className="dashboard-inset h-24 rounded-xl bg-cover bg-center"
										style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
									/>
									<div className="py-1">
										<p className="font-medium text-espresso">{property.title}</p>
										<p className="text-sm text-dashboard-muted">{property.city || 'City not set'}</p>
									</div>
									<div className="flex items-center gap-2 md:justify-end">
										<span className="dashboard-inset rounded-full px-3 py-1 text-xs capitalize text-espresso/85">
											{property.isVisible ? 'published' : 'draft'}
										</span>
										<Link href={`/dashboard/properties/${property.id}`} className="text-sm text-dashboard-muted transition hover:text-camel">
											Edit
										</Link>
										<Link
											href={`/${encodeURIComponent(property.slug)}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-dashboard-muted transition hover:text-camel"
										>
											View
										</Link>
										<Button type="button" variant="dangerLink" onClick={() => setDeleteId(property.id)}>
											Delete
										</Button>
									</div>
								</div>
							);
						})}
					</div>
					{pagination ? (
						<DashboardPagination
							page={pagination.page}
							pageSize={pagination.pageSize}
							total={pagination.total}
							onPageChange={setPage}
							itemLabel="properties"
						/>
					) : null}
				</div>
			) : null}

			<ConfirmationDialog
				open={deleteId !== null}
				title="Delete this property?"
				description={
					toDelete
						? `“${toDelete.title}” and its listing data will be removed. This cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				confirmVariant="danger"
				onCancel={() => setDeleteId(null)}
				onConfirm={async () => {
					if (!deleteId) return;
					await removeProperty(deleteId);
					setDeleteId(null);
				}}
				loading={deleting}
			/>
		</div>
	);
}
