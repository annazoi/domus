'use client';

import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui';
import { useProperty } from '@/features/property/hooks/use-property';
import { PropertyForm } from '../_components/property-form';

export default function EditPropertyPage() {
	const params = useParams<{ id: string }>();
	const { data: property, isLoading: loading } = useProperty(params.id);

	if (loading) {
		return (
			<div className="space-y-8">
				<div className="space-y-3">
					<Skeleton className="h-4 w-40 bg-black/10" />
					<Skeleton className="h-10 w-96 max-w-full bg-black/10" />
				</div>
				<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
					<div className="space-y-6">
						<Skeleton className="h-56 w-full rounded-2xl bg-black/10" />
						<Skeleton className="h-56 w-full rounded-2xl bg-black/10" />
						<Skeleton className="h-56 w-full rounded-2xl bg-black/10" />
					</div>
					<Skeleton className="h-80 w-full rounded-2xl bg-black/10" />
				</div>
			</div>
		);
	}
	if (!property) return <p className="text-sm text-red-700">Property not found.</p>;

	return <PropertyForm mode="edit" initialProperty={property} />;
}
