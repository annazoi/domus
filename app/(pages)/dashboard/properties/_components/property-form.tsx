'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMapsPlacesScript } from '@/components/google-maps';
import type { Property } from '@/features/property/interfaces/property.interface';
import { AmenitiesSection } from './property-form/amenities-section';
import { BasicInfoSection } from './property-form/basic-info-section';
import { BrandingSection } from './property-form/branding-section';
import { CapacitySection } from './property-form/capacity-section';
import { ImagesSection } from './property-form/images-section';
import { LocationSection } from './property-form/location-section';
import { PricingSection } from './property-form/pricing-section';
import { PropertyFormSidebar, type PropertyFormTabId } from './property-form/sidebar';

type PropertyFormProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
};

export function PropertyForm({ mode, initialProperty }: PropertyFormProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<PropertyFormTabId>('basic-info');
	const [googleMapsReady, setGoogleMapsReady] = useState(false);
	const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
	const resolvedPropertyId = initialProperty?.id ?? createdPropertyId ?? '';

	const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const placesLibraryReady = Boolean(mapsApiKey && googleMapsReady);

	return (
		<>
			<GoogleMapsPlacesScript
				apiKey={mapsApiKey}
				loadWhen={activeTab === 'location'}
				onLoaded={() => setGoogleMapsReady(true)}
			/>
		<div className="min-w-0 flex flex-col gap-2 mb-10">
				<p className="text-[10px] uppercase tracking-[0.2em] text-[#6B705C] sm:text-xs">
					{mode === 'create' ? 'Create property' : 'Edit property'}
				</p>
				<h1 className="truncate font-serif text-xl leading-tight text-[#1A1A1A] sm:text-2xl md:text-3xl">
					{mode === 'create' ? 'New listing' : 'Property details'}
				</h1>
		</div>
		<div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
			<PropertyFormSidebar
				mode={mode}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onEditAvailability={
					mode === 'edit' && initialProperty
					? () => router.push(`/dashboard/properties/${initialProperty.id}/calendar`)
					: undefined
				}
			/>

			<div className="min-h-[320px] space-y-6">
				<motion.div
					key={activeTab}
					role="tabpanel"
					id={`property-form-panel-${activeTab}`}
					aria-labelledby={`property-form-tab-${activeTab}`}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.18, ease: 'easeOut' }}
				>
					{activeTab === 'basic-info' ? (
						<BasicInfoSection
							mode={mode}
							initialProperty={initialProperty}
							createdPropertyId={createdPropertyId}
							onPropertyCreated={setCreatedPropertyId}
						/>
					) : null}
					{activeTab === 'capacity' ? (
						<CapacitySection mode={mode} initialProperty={initialProperty} propertyId={resolvedPropertyId} />
					) : null}
					{activeTab === 'location' ? (
						<LocationSection
							mode={mode}
							initialProperty={initialProperty}
							propertyId={resolvedPropertyId}
							placesLibraryReady={placesLibraryReady}
						/>
					) : null}
					{activeTab === 'pricing-availability' ? (
						<PricingSection mode={mode} initialProperty={initialProperty} propertyId={resolvedPropertyId} />
					) : null}
					{activeTab === 'amenities' ? (
						<AmenitiesSection mode={mode} initialProperty={initialProperty} propertyId={resolvedPropertyId} />
					) : null}
					{activeTab === 'images' ? (
						<ImagesSection mode={mode} initialProperty={initialProperty} propertyId={resolvedPropertyId} />
					) : null}
					{activeTab === 'branding' ? (
						<BrandingSection initialProperty={initialProperty} propertyId={resolvedPropertyId} />
					) : null}
				</motion.div>
			</div>
		</div>
					</>
	);
}
