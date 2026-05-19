'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Textarea, useToast } from '@/components/ui';
import {
	usePropertyServices,
	useSavePropertyServices,
} from '@/features/services/hooks/use-property-services';
import type { Property } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type ServicesSectionProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	propertyId?: string;
};

type ServiceDraft = {
	key: string;
	id?: string;
	name: string;
	description: string;
	price: string;
};

const newDraft = (): ServiceDraft => ({
	key: crypto.randomUUID(),
	name: '',
	description: '',
	price: '',
});

const toDrafts = (rows: { id: string; name: string; description: string | null; price: number }[]): ServiceDraft[] =>
	rows.map((row) => ({
		key: row.id,
		id: row.id,
		name: row.name,
		description: row.description ?? '',
		price: String(row.price),
	}));

export function ServicesSection({ initialProperty, propertyId: propertyIdProp }: ServicesSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { data: services, isLoading } = usePropertyServices(propertyId);
	const { mutateAsync: saveServices, isPending: saving } = useSavePropertyServices(propertyId);
	const [drafts, setDrafts] = useState<ServiceDraft[]>([]);

	useEffect(() => {
		if (isLoading || services === undefined) return;
		setDrafts(services.length ? toDrafts(services) : []);
	}, [services, isLoading, propertyId]);

	const handleAdd = () => {
		setDrafts((prev) => [...prev, newDraft()]);
	};

	const handleRemove = (key: string) => {
		setDrafts((prev) => prev.filter((row) => row.key !== key));
	};

	const handleChange = (key: string, patch: Partial<ServiceDraft>) => {
		setDrafts((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
	};

	const handleSave = async () => {
		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}

		const payload: { id?: string; name: string; description?: string | null; price: number }[] = [];
		for (const row of drafts) {
			const name = row.name.trim();
			const description = row.description.trim();
			const price = Number(row.price);
			if (!name && !description && !row.price.trim()) continue;
			if (!name) {
				push({ title: 'Each service needs a name.', tone: 'error' });
				return;
			}
			if (!Number.isFinite(price) || price < 0) {
				push({ title: 'Each service needs a valid price.', tone: 'error' });
				return;
			}
			payload.push({
				id: row.id,
				name,
				description: description || null,
				price,
			});
		}

		try {
			const saved = await saveServices(payload);
			setDrafts(saved.length ? toDrafts(saved) : []);
			push({ title: 'Services saved.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not save services.', tone: 'error' });
		}
	};

	return (
		<PropertyFormSection id="services" title="Guest extras">
			<p className="text-sm text-[#1A1A1A]/65">
				Optional add-ons guests can pick at checkout — wine, breakfast, late checkout, etc.
			</p>

			{!propertyId ? (
				<p className="text-sm text-[#1A1A1A]/55">Create the property in Basic info before adding services.</p>
			) : isLoading ? (
				<p className="text-sm text-[#1A1A1A]/55">Loading services…</p>
			) : (
				<div className="space-y-4">
					{drafts.length === 0 ? (
						<p className="rounded-xl border border-dashed border-black/12 px-4 py-6 text-sm text-[#1A1A1A]/55">
							No extras yet. Add wine, food, or other services for guests.
						</p>
					) : (
						drafts.map((row) => (
							<div key={row.key} className="rounded-xl border border-black/8 p-4">
								<div className="flex items-start justify-between gap-3">
									<p className="text-sm font-medium text-[#1A1A1A]">Service</p>
									<Button
										type="button"
										variant="ghostPill"
										className="h-8 px-2 text-[#1A1A1A]/55 hover:text-red-600"
										onClick={() => handleRemove(row.key)}
										aria-label="Remove service"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
								<div className="mt-3 grid gap-3 md:grid-cols-2">
									<div className="space-y-1.5 md:col-span-2">
										<label className="text-sm text-[#1A1A1A]/70">Name</label>
										<Input
											variant="compact"
											value={row.name}
											onChange={(e) => handleChange(row.key, { name: e.target.value })}
											placeholder="Welcome wine"
										/>
									</div>
									<div className="space-y-1.5 md:col-span-2">
										<label className="text-sm text-[#1A1A1A]/70">Description</label>
										<Textarea
											value={row.description}
											onChange={(e) => handleChange(row.key, { description: e.target.value })}
											placeholder="Bottle of local wine on arrival"
											rows={2}
										/>
									</div>
									<div className="space-y-1.5">
										<label className="text-sm text-[#1A1A1A]/70">Price (USD)</label>
										<Input
											variant="compact"
											type="number"
											min={0}
											step="0.01"
											value={row.price}
											onChange={(e) => handleChange(row.key, { price: e.target.value })}
											placeholder="35"
										/>
									</div>
								</div>
							</div>
						))
					)}

					<div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
						<Button type="button" variant="cardRow" onClick={handleAdd} className="cursor-pointer max-w-fit flex items-center ml-auto">
							<Plus className="mr-2 h-4 w-4" />
							<span className="text-sm font-medium text-[#1A1A1A]">Add service</span>
						</Button>
						<Button type="button" variant="primarySm" disabled={saving} onClick={() => void handleSave()}>
							{saving ? 'Saving…' : 'Save services'}
						</Button>
					</div>
				</div>
			)}
		</PropertyFormSection>
	);
}
