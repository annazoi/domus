'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, buttonClassName, cn, ConfirmationDialog, Skeleton } from '@/components/ui';
import { PageHeader } from '@/app/(pages)/dashboard/_components/page-header';
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
			<PageHeader
				eyebrow="Properties"
				title="Your homes, curated."
				description={total > 0 ? `${total} ${total === 1 ? 'listing' : 'listings'} in your portfolio.` : undefined}
				actions={
					<Link href="/dashboard/properties/new" className={cn(buttonClassName('primarySm'), 'inline-flex items-center gap-2')}>
						<Plus className="h-4 w-4" />
						Add property
					</Link>
				}
			/>

			<PropertiesSearch value={searchQuery} onChange={setSearchQuery} />

			{loading ? (
				<div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className="dashboard-panel overflow-hidden rounded-2xl">
							<Skeleton className="h-44 w-full rounded-none bg-dashboard-inset" />
							<div className="space-y-2 p-5">
								<Skeleton className="h-5 w-48 rounded-md bg-dashboard-border/50" />
								<Skeleton className="h-4 w-28 rounded-md bg-dashboard-border/40" />
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
				<div className="space-y-6">
					<div
						className={cn(
							'grid gap-5 transition-opacity sm:grid-cols-2 2xl:grid-cols-3',
							(isFetching || searchPending) && 'pointer-events-none opacity-50',
						)}
					>
						{properties.map((property) => {
							const cover = property.images.find((image) => image.is_cover) ?? property.images[0];
							const coverUrl = cover?.document?.url;
							return (
								<article key={property.id} className="dashboard-panel group flex flex-col overflow-hidden rounded-2xl">
									<Link
										href={`/dashboard/properties/${property.id}`}
										className="relative block h-44 overflow-hidden bg-dashboard-inset"
										aria-label={`Edit ${property.title}`}
									>
										{coverUrl ? (
											<span
												className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
												style={{ backgroundImage: `url(${coverUrl})` }}
											/>
										) : (
											<span className="absolute inset-0 grid place-items-center text-xs uppercase tracking-[0.18em] text-dashboard-muted">
												No cover photo
											</span>
										)}
										<span
											className={cn(
												'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
												property.isVisible ? 'bg-white/95 text-emerald-700' : 'bg-white/95 text-amber-700',
											)}
										>
											<span className={cn('h-1.5 w-1.5 rounded-full', property.isVisible ? 'bg-emerald-600' : 'bg-amber-500')} />
											{property.isVisible ? 'Published' : 'Draft'}
										</span>
									</Link>
									<div className="flex flex-1 flex-col p-5">
										<h3 className="truncate font-serif text-xl leading-snug text-espresso">{property.title}</h3>
										<p className="mt-1 flex items-center gap-1.5 text-sm text-dashboard-muted">
											<MapPin className="h-3.5 w-3.5 shrink-0" />
											<span className="truncate">{property.city || 'City not set'}</span>
										</p>
										<div className="mt-5 flex items-center gap-2 border-t border-dashboard-border pt-4">
											<Link
												href={`/dashboard/properties/${property.id}`}
												className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
											>
												<Pencil className="h-3.5 w-3.5" />
												Edit
											</Link>
											<Link
												href={`/${encodeURIComponent(property.slug)}`}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 rounded-full border border-dashboard-border px-4 py-2 text-xs font-medium text-espresso transition hover:border-camel hover:text-camel-deep"
											>
												<ExternalLink className="h-3.5 w-3.5" />
												View
											</Link>
											<button
												type="button"
												onClick={() => setDeleteId(property.id)}
												aria-label={`Delete ${property.title}`}
												className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full text-dashboard-muted transition hover:bg-red-500/10 hover:text-red-600"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</div>
								</article>
							);
						})}
					</div>
					{pagination ? (
						<div className="dashboard-panel overflow-hidden rounded-2xl">
							<DashboardPagination
								page={pagination.page}
								pageSize={pagination.pageSize}
								total={pagination.total}
								onPageChange={setPage}
								itemLabel="properties"
							/>
						</div>
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
