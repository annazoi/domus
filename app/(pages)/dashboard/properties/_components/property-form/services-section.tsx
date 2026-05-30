'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button, Skeleton, cn, useToast } from '@/components/ui';
import { useHostServices } from '@/features/services/hooks/use-host-services';
import {
	usePropertyServices,
	useSyncPropertyServiceLinks,
} from '@/features/services/hooks/use-property-services';
import type { Property } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type ServicesSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

function formatPrice(value: number) {
	return `$${value.toFixed(2)}`;
}

export function ServicesSection({ initialProperty, propertyId: propertyIdProp }: ServicesSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { data: hostServices = [], isLoading: hostLoading } = useHostServices(Boolean(propertyId));
	const { data: linkedServices = [], isLoading: linkedLoading } = usePropertyServices(propertyId);
	const { mutateAsync: syncLinks, isPending: saving } = useSyncPropertyServiceLinks(propertyId);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const savedIds = useMemo(
		() => linkedServices.map((service) => service.id).sort(),
		[linkedServices],
	);

	const isLoading = hostLoading || linkedLoading;

	useEffect(() => {
		if (isLoading || linkedServices === undefined) return;
		setSelectedIds(linkedServices.map((service) => service.id));
	}, [linkedServices, isLoading, propertyId]);

	const isDirty = useMemo(() => {
		const draft = [...selectedIds].sort();
		if (draft.length !== savedIds.length) return true;
		return draft.some((id, index) => id !== savedIds[index]);
	}, [selectedIds, savedIds]);

	const handleToggle = (serviceId: string) => {
		setSelectedIds((prev) =>
			prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
		);
	};

	const handleSave = async () => {
		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}

		try {
			await syncLinks(selectedIds);
			push({ title: 'Guest extras saved.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not save guest extras.', tone: 'error' });
		}
	};

	return (
		<PropertyFormSection id="services" title="Guest extras">
			<p className="text-sm text-[#1A1A1A]/65">
				Choose which services guests can add at checkout for this property.
			</p>

			{!propertyId ? (
				<p className="text-sm text-[#1A1A1A]/55">Create the property in Basic info before linking services.</p>
			) : isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} className="h-16 w-full rounded-xl bg-black/10" />
					))}
				</div>
			) : hostServices.length === 0 ? (
				<div className="rounded-xl border border-dashed border-black/12 px-4 py-6 text-sm text-[#1A1A1A]/55">
					No services yet.{' '}
					<Link href="/dashboard/services" className="text-camel underline-offset-2 hover:underline">
						Create services
					</Link>{' '}
					first, then return here to connect them to this property.
				</div>
			) : (
				<div className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2">
						{hostServices.map((service) => {
							const selected = selectedIds.includes(service.id);

							return (
								<Button
									key={service.id}
									type="button"
									variant="custom"
									onClick={() => handleToggle(service.id)}
									className={cn(
										'flex h-auto w-full flex-col items-start rounded-xl border p-4 text-left transition cursor-pointer',
										selected
											? 'border-camel/40 bg-camel/5 hover:bg-camel/8'
											: 'border-black/8 bg-white hover:border-black/15 hover:bg-black/[0.02]',
									)}
								>
									<div className="flex w-full items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="text-sm font-medium text-[#1A1A1A]">{service.name}</p>
											{service.description ? (
												<p className="mt-1 text-sm text-[#1A1A1A]/60">{service.description}</p>
											) : null}
										</div>
										<span
											className={cn(
												'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition',
												selected ? 'border-camel bg-camel text-white' : 'border-black/15 bg-white',
											)}
										>
											{selected ? <Check className="h-3.5 w-3.5" /> : null}
										</span>
									</div>
									<p className="mt-3 text-sm font-medium text-camel">{formatPrice(service.price)}</p>
								</Button>
							);
						})}
					</div>

					<div className="flex justify-end">
						<Button type="button" variant="primarySm" disabled={saving || !isDirty} onClick={() => void handleSave()}>
							{saving ? 'Saving…' : 'Save guest extras'}
						</Button>
					</div>
				</div>
			)}
		</PropertyFormSection>
	);
}
