import { useMemo, useState } from 'react';
import { AirVent, CookingPot, Search, SquareParking, Waves, Wifi, Pickaxe } from 'lucide-react';
import { Amenities, searchAmenitiesOptions } from '@/config/constants/dropdowns/amenities.options';
import type { Amenity } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type AmenitiesSectionProps = {
	amenities: Amenity[];
	selectedAmenities: string[];
	onToggleAmenity: (amenityId: string) => void;
};

export function AmenitiesSection({ amenities, selectedAmenities, onToggleAmenity }: AmenitiesSectionProps) {
	const [search, setSearch] = useState('');

	const filteredAmenities = useMemo(() => {
		const options = searchAmenitiesOptions(search);
		const optionIds = new Set<string>(options.map((option) => option.value));
		return amenities.filter((amenity) => optionIds.has(amenity.id));
	}, [amenities, search]);

	const iconByAmenity: Record<string, typeof Wifi> = {
		[Amenities.WIFI]: Wifi,
		[Amenities.POOL]: Waves,
		[Amenities.PARKING]: SquareParking,
		[Amenities.AC]: AirVent,
		[Amenities.KITCHEN]: CookingPot,
		[Amenities.WORKSPACE]: Pickaxe,
	};

	return (
		<PropertyFormSection id="amenities" title="Amenities">
			<div className="mb-4">
				<label htmlFor="amenities-search" className="mb-1.5 block text-sm font-medium text-[#1A1A1A]">
					Search amenities
				</label>
				<div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2">
					<Search className="h-4 w-4 text-[#1A1A1A]/45" aria-hidden="true" />
					<input
						id="amenities-search"
						type="text"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search amenities..."
						className="w-full bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#1A1A1A]/45"
					/>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{filteredAmenities.map((amenity) => {
					const active = selectedAmenities.includes(amenity.id);
					const Icon = iconByAmenity[amenity.id] ?? Wifi;
					return (
						<button
							key={amenity.id}
							type="button"
							onClick={() => onToggleAmenity(amenity.id)}
							className={[
								'cursor-pointer inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition',
								active ? 'bg-[#6B705C] text-white' : 'bg-black/5 text-[#1A1A1A]/70 hover:bg-black/10',
							].join(' ')}
						>
							<Icon className="h-4 w-4" aria-hidden="true" />
							{amenity.label}
						</button>
					);
				})}
			</div>
			{!filteredAmenities.length ? (
				<p className="mt-3 text-sm text-[#1A1A1A]/55">No amenities found for &quot;{search}&quot;.</p>
			) : null}
		</PropertyFormSection>
	);
}
