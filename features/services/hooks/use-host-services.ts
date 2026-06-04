import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createHostService,
	deleteHostService,
	deleteServiceImage,
	listHostServices,
	updateHostService,
	uploadServiceImages,
} from '../services/services.services';
import type { HostService, ServiceInput } from '../interfaces/service.interface';
import { servicesQueryKey } from './use-services';

export const hostServicesQueryKey = {
	all: ['host-services'] as const,
};

export const useHostServices = (enabled: boolean) => {
	return useQuery<HostService[]>({
		queryKey: hostServicesQueryKey.all,
		queryFn: listHostServices,
		enabled,
	});
};

export const useCreateHostService = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: ServiceInput) => createHostService(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: hostServicesQueryKey.all });
		},
	});
};

export const useUpdateHostService = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: ServiceInput }) => updateHostService(id, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: hostServicesQueryKey.all });
			void queryClient.invalidateQueries({ queryKey: servicesQueryKey.all });
		},
	});
};

export const useDeleteHostService = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteHostService(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: hostServicesQueryKey.all });
			void queryClient.invalidateQueries({ queryKey: servicesQueryKey.all });
		},
	});
};

export const useUploadServiceImages = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ serviceId, files, descriptions }: { serviceId: string; files: File[]; descriptions?: string[] }) =>
			uploadServiceImages(serviceId, files, descriptions),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: hostServicesQueryKey.all });
			void queryClient.invalidateQueries({ queryKey: servicesQueryKey.all });
		},
	});
};

export const useDeleteServiceImage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ serviceId, imageId }: { serviceId: string; imageId: string }) =>
			deleteServiceImage(serviceId, imageId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: hostServicesQueryKey.all });
			void queryClient.invalidateQueries({ queryKey: servicesQueryKey.all });
		},
	});
};
