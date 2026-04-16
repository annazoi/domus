'use client';

import { PropertyForm } from '../_components/property-form';
import { useCreateProperty } from '@/features/property/hooks/use-property';

export default function NewPropertyPage() {
	const { mutateAsync: create } = useCreateProperty();
	return <PropertyForm mode="create" onSubmit={create} />;
}
