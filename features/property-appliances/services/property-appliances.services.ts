import axiosInstance from '@/config/api/axios';
import { ApiRoutes } from '@/config/api/routes';
import type { Property } from '@/features/property/interfaces/property.interface';

export type SaveApplianceItem = {
	key: string;
	id?: string | null;
	title: string;
	description: string | null;
};

type SaveAppliancesInput = {
	appliances: SaveApplianceItem[];
	removedIds?: string[];
	clearImageKeys?: string[];
	imageFilesByKey?: Record<string, File | null>;
};

export const savePropertyAppliances = async (id: string, input: SaveAppliancesInput) => {
	const hasFiles = Object.values(input.imageFilesByKey ?? {}).some((file) => file instanceof File);
	const hasClear = Boolean(input.clearImageKeys?.length);

	if (!hasFiles && !hasClear) {
		const response = await axiosInstance.post<Property>(ApiRoutes.property_appliances.byProperty(id), {
			appliances: input.appliances,
			removed_ids: input.removedIds ?? [],
		});
		return response.data;
	}

	const formData = new FormData();
	formData.append('appliances', JSON.stringify(input.appliances));
	formData.append('removed_ids', JSON.stringify(input.removedIds ?? []));
	if (hasClear) {
		formData.append('clear_image_keys', JSON.stringify(input.clearImageKeys));
	}
	const imageEntries = Object.entries(input.imageFilesByKey ?? {}).filter(([, file]) => file instanceof File) as [
		string,
		File,
	][];
	imageEntries.forEach(([, file]) => formData.append('files', file));
	formData.append('image_keys', JSON.stringify(imageEntries.map(([key]) => key)));

	const response = await axiosInstance.post<Property>(ApiRoutes.property_appliances.byProperty(id), formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};
