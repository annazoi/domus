import { getStaticAmenities } from '@/config/constants/dropdowns/amenities.options';

/** Same list as `AmenitiesOptions` / `getStaticAmenities()` — single source of truth */
export async function GET() {
	return Response.json(getStaticAmenities());
}
