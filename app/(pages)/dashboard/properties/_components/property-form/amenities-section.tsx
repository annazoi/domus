import { useMemo, useState } from 'react';
import { Search, Wifi } from 'lucide-react';
import { Button, cn, Input } from '@/components/ui';
import { searchAmenitiesOptions } from '@/config/constants/dropdowns/amenities.options';
import { PropertyFormSection } from './property-form-section';

type AmenitiesSectionProps = {
	selectedAmenities: string[];
	onToggleAmenity: (amenityId: string) => void;
};

export function AmenitiesSection({ selectedAmenities, onToggleAmenity }: AmenitiesSectionProps) {
	const [search, setSearch] = useState('');

	const filteredAmenities = useMemo(() => {
		return searchAmenitiesOptions(search);
	}, [search]);

	return (
		<PropertyFormSection id="amenities" title="Amenities">
			<div className="mb-4">
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
			<div className="flex flex-wrap gap-2">
				{filteredAmenities.map((amenity) => {
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
			{!filteredAmenities.length ? (
				<p className="mt-3 text-sm text-[#1A1A1A]/55">No amenities found for &quot;{search}&quot;.</p>
			) : null}
		</PropertyFormSection>
	);
}
