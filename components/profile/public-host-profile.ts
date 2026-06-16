import type { HostProfileData } from '@/components/profile/host-profile-types';
import type { PublicHostProfile } from '@/features/user/interfaces/public-host.interface';

export function publicHostToProfileData(host: PublicHostProfile): HostProfileData {
	return {
		first_name: host.first_name,
		last_name: host.last_name,
		host_name: host.host_name,
		email: host.email,
		phone: host.phone,
		vat_number: host.vat_number,
		bio: host.bio,
		avatar_url: host.avatar_url,
		banner_url: host.banner_url,
		created_at: host.created_at,
	};
}
