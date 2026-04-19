import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Search, Wifi } from 'lucide-react';
import { Button, cn, Input } from '@/components/ui';
import {
	amenityOptionByValue,
	PROPERTY_FORM_AMENITY_CATEGORIES,
} from '@/config/constants/dropdowns/amenities.options';
import { useSavePropertyAmenities } from '@/features/property-amenities/hooks/use-property-amenities';
import type { Property } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';
import { amenitiesFormSchema } from './schemas';

type AmenitiesSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
};

export function AmenitiesSection({ mode, initialProperty }: AmenitiesSectionProps) {
	const [search, setSearch] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const { mutateAsync: saveAmenities, isPending: saving } = useSavePropertyAmenities(initialProperty?.id ?? '');
	const { handleSubmit, watch, setValue } = useForm<{ amenity_ids: string[] }>({
		resolver: zodResolver(amenitiesFormSchema),
		defaultValues: { amenity_ids: initialProperty?.amenity_ids ?? [] },
	});
	const selectedAmenities = watch('amenity_ids');

	const onToggleAmenity = (amenityId: string) => {
		const next = selectedAmenities.includes(amenityId)
			? selectedAmenities.filter((id) => id !== amenityId)
			: [...selectedAmenities, amenityId];
		setValue('amenity_ids', next, { shouldValidate: true, shouldDirty: true });
	};

	const handleSave = handleSubmit(async ({ amenity_ids }) => {
		setError('');
		setSuccess('');

		if (mode === 'create' || !initialProperty?.id) {
			setError('Save Basic info first to create the property.');
			return;
		}

		try {
			await saveAmenities(amenity_ids);
			setSuccess('Amenities saved.');
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : 'Could not save amenities.');
		}
	});

	const categories = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return PROPERTY_FORM_AMENITY_CATEGORIES;
		return PROPERTY_FORM_AMENITY_CATEGORIES.map((cat) => ({
			...cat,
			values: cat.values.filter((id) => amenityOptionByValue[id].label.toLowerCase().includes(q)),
		})).filter((cat) => cat.values.length > 0);
	}, [search]);

	return (
		<PropertyFormSection id="amenities" title="Amenities">
			{error ? <p className="rounded-xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</p> : null}
			{success ? <p className="rounded-xl bg-emerald-100/70 px-4 py-3 text-sm text-emerald-800">{success}</p> : null}
			<div className="mb-6">
				<label htmlFor="amenities-search" className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
					Search amenities
				</label>
				<div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2">
					<Search className="h-4 w-4 text-[#1A1A1A]/45" aria-hidden="true" />
					<Input
						id="amenities-search"
						variant="plain"
						type="text"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search amenities..."
					/>
				</div>
			</div>
			<div className="space-y-8">
				{categories.map((category) => (
					<div key={category.id}>
						<h3 className="font-serif text-lg text-[#1A1A1A]">{category.title}</h3>
						{category.description ? (
							<p className="mt-1 text-sm text-[#1A1A1A]/60">{category.description}</p>
						) : null}
						<div className="mt-4 flex flex-wrap gap-2">
							{category.values.map((value) => {
								const amenity = amenityOptionByValue[value];
								const active = selectedAmenities.includes(amenity.value);
								const Icon = amenity.icon ?? Wifi;
								return (
									<Button
										key={amenity.value}
										variant="chip"
										type="button"
										onClick={() => onToggleAmenity(amenity.value)}
										className={cn(
											active ? 'bg-[#6B705C] text-white' : 'bg-black/5 text-[#1A1A1A]/70 hover:bg-black/10',
										)}
									>
										<Icon className="h-4 w-4" aria-hidden="true" />
										{amenity.label}
									</Button>
								);
							})}
						</div>
					</div>
				))}
			</div>
			{search.trim() && !categories.length ? (
				<p className="mt-3 text-sm text-[#1A1A1A]/55">No amenities found for &quot;{search}&quot;.</p>
			) : null}
			<div className="mt-2 flex justify-end border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</PropertyFormSection>
	);
}
