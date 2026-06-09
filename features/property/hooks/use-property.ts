import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PropertyBrandingTheme } from '../../../app/(pages)/templates/_constants/property-branding-theme';
import type { PatchPropertyBrandingInput } from '../services/property.services';
import type { UpsertPropertyInput } from '../interfaces/property.interface';
import type { PaginatedResult } from '@/lib/pagination';
import type { Property } from '../interfaces/property.interface';
import {
	createProperty,
	deleteProperty,
	getPropertyById,
	listProperties,
	listPropertiesPaginated,
	deletePropertyLogo,
	patchPropertyBranding,
	updateProperty,
	uploadPropertyLogo,
} from '../services/property.services';

export const propertyQueryKey = {
	all: ['properties'] as const,
	page: (page: number, pageSize: number, search?: string) =>
		['properties', page, pageSize, search ?? ''] as const,
	detail: (id: string) => ['properties', id] as const,
};

export const useProperties = () => {
	return useQuery({
		queryKey: propertyQueryKey.all,
		queryFn: listProperties,
	});
};

export const usePropertiesPage = (page: number, pageSize: number, search?: string) => {
	return useQuery<PaginatedResult<Property>>({
		queryKey: propertyQueryKey.page(page, pageSize, search),
		queryFn: () => listPropertiesPaginated(page, pageSize, search),
	});
};

export const useProperty = (id: string) => {
	return useQuery({
		queryKey: propertyQueryKey.detail(id),
		queryFn: () => getPropertyById(id),
		enabled: Boolean(id),
	});
};

export const useCreateProperty = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpsertPropertyInput) => createProperty(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: propertyQueryKey.all });
		},
	});
};

export const useUpdateProperty = (id: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpsertPropertyInput) => updateProperty(id, input),
		onSuccess: () => {
			void Promise.all([
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.all }),
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.detail(id) }),
			]);
		},
	});
};

export const useDeleteProperty = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteProperty(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: propertyQueryKey.all });
		},
	});
};

export const usePatchPropertyBranding = (id: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: PatchPropertyBrandingInput) => patchPropertyBranding(id, input),
		onSuccess: () => {
			void Promise.all([
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.all }),
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.detail(id) }),
			]);
		},
	});
};

export const useUploadPropertyLogo = (id: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { file: File; alt?: string }) => uploadPropertyLogo(id, input.file, input.alt),
		onSuccess: () => {
			void Promise.all([
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.all }),
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.detail(id) }),
			]);
		},
	});
};

export const useDeletePropertyLogo = (id: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => deletePropertyLogo(id),
		onSuccess: () => {
			void Promise.all([
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.all }),
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.detail(id) }),
			]);
		},
	});
};

