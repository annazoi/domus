'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Property } from '@/features/property/interfaces/property.interface';
import { getPropertyById, updateProperty } from '@/features/property/services/property.services';
import { PropertyForm } from '../_components/property-form';

export default function EditPropertyPage() {
	const params = useParams<{ id: string }>();
	const [property, setProperty] = useState<Property | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		void (async () => {
			const found = await getPropertyById(params.id);
			setProperty(found);
			setLoading(false);
		})();
	}, [params.id]);

	if (loading) return <p className="text-sm text-[#1A1A1A]/60">Loading property...</p>;
	if (!property) return <p className="text-sm text-red-700">Property not found.</p>;

	return <PropertyForm mode="edit" initialProperty={property} onSubmit={(payload) => updateProperty(property.id, payload)} />;
}
