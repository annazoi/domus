'use client';

import { useParams } from 'next/navigation';
import { useProperty, useUpdateProperty } from '@/features/property/hooks/use-property';
import { PropertyForm } from '../_components/property-form';

export default function EditPropertyPage() {
	const params = useParams<{ id: string }>();
	const { data: property, isLoading: loading } = useProperty(params.id);
	const { mutateAsync: update } = useUpdateProperty(params.id);

	if (loading) return <p className="text-sm text-[#1A1A1A]/60">Loading property...</p>;
	if (!property) return <p className="text-sm text-red-700">Property not found.</p>;

	return <PropertyForm mode="edit" initialProperty={property} onSubmit={(payload) => update(payload)} />;
}
