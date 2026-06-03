'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, buttonClassName, ConfirmationDialog, Skeleton } from '@/components/ui';
import { useDeleteProperty, useProperties } from '@/features/property/hooks/use-property';

export default function PropertiesPage() {
	const { data: properties = [], isLoading: loading } = useProperties();
	const { mutateAsync: removeProperty, isPending: deleting } = useDeleteProperty();
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const toDelete = properties.find((p) => p.id === deleteId);

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

			{loading ? (
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, index) => (
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
			{!loading && properties.length === 0 ? (
				<div className="dashboard-panel rounded-2xl p-8 text-center">
					<p className="font-serif text-2xl">No properties yet</p>
					<p className="mt-2 text-sm text-dashboard-muted">Create your first listing to start receiving bookings.</p>
				</div>
			) : null}

			<div className="space-y-4">
				{properties.map((property) => {
					const cover = property.images.find((image) => image.is_cover) ?? property.images[0];
					const coverUrl = cover?.document?.url;
					return (
						<div key={property.id} className="grid grid-cols-1 gap-4 dashboard-panel rounded-2xl p-4 md:grid-cols-[140px_1fr_auto]">
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
