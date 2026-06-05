import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PropertyBrandingTheme } from '../../../app/(pages)/templates/_constants/property-branding-theme';
import type { UpsertPropertyInput } from '../interfaces/property.interface';
import type { PaginatedResult } from '@/lib/pagination';
import type { Property } from '../interfaces/property.interface';
import {
	createProperty,
	deleteProperty,
	getPropertyById,
	listProperties,
	listPropertiesPaginated,
	patchPropertyBranding,
	updateProperty,
} from '../services/property.services';

export const propertyQueryKey = {
	all: ['properties'] as const,
	page: (page: number, pageSize: number) => ['properties', page, pageSize] as const,
	detail: (id: string) => ['properties', id] as const,
};

export const useProperties = () => {
	return useQuery({
		queryKey: propertyQueryKey.all,
		queryFn: listProperties,
	});
};

export const usePropertiesPage = (page: number, pageSize: number) => {
	return useQuery<PaginatedResult<Property>>({
		queryKey: propertyQueryKey.page(page, pageSize),
		queryFn: () => listPropertiesPaginated(page, pageSize),
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
		mutationFn: (branding_theme: PropertyBrandingTheme) => patchPropertyBranding(id, branding_theme),
		onSuccess: () => {
			void Promise.all([
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.all }),
				queryClient.invalidateQueries({ queryKey: propertyQueryKey.detail(id) }),
			]);
		},
	});
};

