'use client';

import Link from 'next/link';
import { useDeleteProperty, useProperties } from '@/features/property/hooks/use-property';

export default function PropertiesPage() {
	const { data: properties = [], isLoading: loading } = useProperties();
	const { mutateAsync: removeProperty } = useDeleteProperty();

	const handleDelete = async (id: string) => {
		await removeProperty(id);
	};

	return (
		<div className="space-y-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Properties</p>
					<h1 className="mt-2 font-serif text-4xl tracking-tight">Your homes, curated.</h1>
				</div>
				<Link
					href="/dashboard/properties/new"
					className="rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#1A1A1A]/90"
				>
					Add Property
				</Link>
			</div>

			{loading ? <p className="text-sm text-[#1A1A1A]/60">Loading properties...</p> : null}
			{!loading && properties.length === 0 ? (
				<div className="rounded-2xl bg-white/80 p-8 text-center">
					<p className="font-serif text-2xl">No properties yet</p>
					<p className="mt-2 text-sm text-[#1A1A1A]/60">Create your first listing to start receiving bookings.</p>
				</div>
			) : null}

			<div className="space-y-4">
				{properties.map((property) => {
					const cover = property.images.find((image) => image.is_cover) ?? property.images[0];
					return (
						<div key={property.id} className="grid grid-cols-1 gap-4 rounded-2xl bg-white/80 p-4 md:grid-cols-[140px_1fr_auto]">
							<div
								className="h-24 rounded-xl bg-[#6B705C]/10 bg-cover bg-center"
								style={cover ? { backgroundImage: `url(${cover.url})` } : undefined}
							/>
							<div className="py-1">
								<p className="font-medium">{property.title}</p>
								<p className="text-sm text-[#1A1A1A]/55">{property.city || 'City not set'}</p>
							</div>
							<div className="flex items-center gap-2 md:justify-end">
								<span className="rounded-full bg-black/5 px-3 py-1 text-xs capitalize">{property.status}</span>
								<Link href={`/dashboard/properties/${property.id}`} className="text-sm text-[#1A1A1A]/70 hover:text-[#6B705C]">
									Edit
								</Link>
								<Link href={`/dashboard/properties/${property.id}`} className="text-sm text-[#1A1A1A]/70 hover:text-[#6B705C]">
									View
								</Link>
								<button
									type="button"
									onClick={() => void handleDelete(property.id)}
									className="text-sm text-[#1A1A1A]/70 hover:text-red-700"
								>
									Delete
								</button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
