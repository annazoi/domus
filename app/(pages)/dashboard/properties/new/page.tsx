'use client';

import { PropertyForm } from '../_components/property-form';
import { createProperty } from '@/features/property/services/property.services';

export default function NewPropertyPage() {
	return <PropertyForm mode="create" onSubmit={createProperty} />;
}
