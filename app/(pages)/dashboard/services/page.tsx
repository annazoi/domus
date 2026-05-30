'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Checkbox, Input, Skeleton, Textarea, useToast } from '@/components/ui';
import {
	useCreateHostService,
	useDeleteHostService,
	useHostServices,
	useUpdateHostService,
} from '@/features/services/hooks/use-host-services';
import type { HostService, ServiceInput } from '@/features/services/interfaces/service.interface';

type ServiceDraft = {
	name: string;
	description: string;
	price: string;
	quantitable_item: boolean;
};

const emptyDraft = (): ServiceDraft => ({
	name: '',
	description: '',
	price: '',
	quantitable_item: false,
});

const toDraft = (service: HostService): ServiceDraft => ({
	name: service.name,
	description: service.description ?? '',
	price: String(service.price),
	quantitable_item: service.quantitable_item,
});

const parseDraft = (draft: ServiceDraft): ServiceInput | null => {
	const name = draft.name.trim();
	const description = draft.description.trim();
	const price = Number(draft.price);
	if (!name) return null;
	if (!Number.isFinite(price) || price < 0) return null;
	return {
		name,
		description: description || null,
		price,
		quantitable_item: draft.quantitable_item,
	};
};

function formatPrice(value: number) {
	return `$${value.toFixed(2)}`;
}

export function HostServicesList() {
	const { push } = useToast();
	const { data: services = [], isLoading } = useHostServices(true);
	const { mutateAsync: createService, isPending: creating } = useCreateHostService();
	const { mutateAsync: updateService, isPending: updating } = useUpdateHostService();
	const { mutateAsync: deleteService, isPending: deleting } = useDeleteHostService();

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [createDraft, setCreateDraft] = useState<ServiceDraft>(emptyDraft);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState<ServiceDraft>(emptyDraft);

	const sortedServices = useMemo(
		() => [...services].sort((a, b) => a.name.localeCompare(b.name)),
		[services],
	);

	const handleCreate = async () => {
		const payload = parseDraft(createDraft);
		if (!payload) {
			push({ title: 'Enter a name and valid price.', tone: 'error' });
			return;
		}

		try {
			await createService(payload);
			setCreateDraft(emptyDraft());
			setShowCreateForm(false);
			push({ title: 'Service created.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not create service.', tone: 'error' });
		}
	};

	const startEdit = (service: HostService) => {
		setEditingId(service.id);
		setEditDraft(toDraft(service));
	};

	const handleUpdate = async (serviceId: string) => {
		const payload = parseDraft(editDraft);
		if (!payload) {
			push({ title: 'Enter a name and valid price.', tone: 'error' });
			return;
		}

		try {
			await updateService({ id: serviceId, input: payload });
			setEditingId(null);
			push({ title: 'Service updated.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not update service.', tone: 'error' });
		}
	};

	const handleDelete = async (service: HostService) => {
		try {
			await deleteService(service.id);
			if (editingId === service.id) setEditingId(null);
			push({ title: 'Service deleted.', tone: 'success' });
		} catch (e) {
			push({ title: e instanceof Error ? e.message : 'Could not delete service.', tone: 'error' });
		}
	};

	if (isLoading) {
		return (
			<div className="overflow-hidden rounded-2xl bg-white/80">
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} className="border-b border-black/5 px-5 py-5 md:px-8">
						<Skeleton className="h-5 w-40 bg-black/10" />
						<Skeleton className="mt-2 h-4 w-64 bg-black/10" />
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{showCreateForm ? (
				<div className="rounded-2xl border border-black/8 bg-white/80 p-5 md:p-6">
					<p className="text-sm font-medium text-[#1A1A1A]">New service</p>
					<div className="mt-4 grid gap-3 md:grid-cols-2">
						<div className="space-y-1.5 md:col-span-2">
							<label className="text-sm text-[#1A1A1A]/70">Name</label>
							<Input
								variant="compact"
								value={createDraft.name}
								onChange={(e) => setCreateDraft((prev) => ({ ...prev, name: e.target.value }))}
								placeholder="Welcome wine"
							/>
						</div>
						<div className="space-y-1.5 md:col-span-2">
							<label className="text-sm text-[#1A1A1A]/70">Description</label>
							<Textarea
								value={createDraft.description}
								onChange={(e) => setCreateDraft((prev) => ({ ...prev, description: e.target.value }))}
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
								value={createDraft.price}
								onChange={(e) => setCreateDraft((prev) => ({ ...prev, price: e.target.value }))}
								placeholder="35"
							/>
						</div>
						<label className="flex cursor-pointer items-start gap-3 md:col-span-2">
							<Checkbox
								checked={createDraft.quantitable_item}
								onChange={(e) =>
									setCreateDraft((prev) => ({ ...prev, quantitable_item: e.target.checked }))
								}
								className="mt-0.5 accent-camel"
							/>
							<span>
								<span className="text-sm font-medium text-[#1A1A1A]">Quantitable</span>
								<span className="mt-0.5 block text-sm text-[#1A1A1A]/60">
									Guests can choose a quantity (e.g. bottles of wine). Leave off for one-time extras like
									late checkout.
								</span>
							</span>
						</label>
					</div>
					<div className="mt-4 flex flex-wrap gap-2">
						<Button type="button" variant="primarySm" disabled={creating} onClick={() => void handleCreate()}>
							{creating ? 'Saving…' : 'Save service'}
						</Button>
						<Button
							type="button"
							variant="ghostPill"
							onClick={() => {
								setShowCreateForm(false);
								setCreateDraft(emptyDraft());
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<Button
					type="button"
					variant="cardRow"
					onClick={() => setShowCreateForm(true)}
					className="flex max-w-fit cursor-pointer items-center"
				>
					<Plus className="mr-2 h-4 w-4" />
					<span className="text-sm font-medium text-[#1A1A1A]">Add service</span>
				</Button>
			)}

			{sortedServices.length === 0 ? (
				<div className="rounded-2xl bg-white/80 p-8 text-center">
					<p className="font-serif text-2xl">No services yet</p>
					<p className="mt-2 text-sm text-[#1A1A1A]/60">
						Create extras like wine, breakfast, or late checkout, then attach them to properties under Guest extras.
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl bg-white/80">
					{sortedServices.map((service) => {
						const isEditing = editingId === service.id;

						return (
							<div key={service.id} className="border-b border-black/5 px-5 py-5 last:border-b-0 md:px-8 md:py-6">
								{isEditing ? (
									<div className="space-y-3">
										<div className="grid gap-3 md:grid-cols-2">
											<div className="space-y-1.5 md:col-span-2">
												<label className="text-sm text-[#1A1A1A]/70">Name</label>
												<Input
													variant="compact"
													value={editDraft.name}
													onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5 md:col-span-2">
												<label className="text-sm text-[#1A1A1A]/70">Description</label>
												<Textarea
													value={editDraft.description}
													onChange={(e) =>
														setEditDraft((prev) => ({ ...prev, description: e.target.value }))
													}
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
													value={editDraft.price}
													onChange={(e) => setEditDraft((prev) => ({ ...prev, price: e.target.value }))}
												/>
											</div>
											<label className="flex cursor-pointer items-start gap-3 md:col-span-2">
												<Checkbox
													checked={editDraft.quantitable_item}
													onChange={(e) =>
														setEditDraft((prev) => ({ ...prev, quantitable_item: e.target.checked }))
													}
													className="mt-0.5 accent-camel"
												/>
												<span>
													<span className="text-sm font-medium text-[#1A1A1A]">Quantitable</span>
													<span className="mt-0.5 block text-sm text-[#1A1A1A]/60">
														Guests can choose a quantity for this extra.
													</span>
												</span>
											</label>
										</div>
										<div className="flex flex-wrap gap-2">
											<Button
												type="button"
												variant="primarySm"
												disabled={updating}
												onClick={() => void handleUpdate(service.id)}
											>
												{updating ? 'Saving…' : 'Save changes'}
											</Button>
											<Button type="button" variant="ghostPill" onClick={() => setEditingId(null)}>
												Cancel
											</Button>
										</div>
									</div>
								) : (
									<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
										<div className="min-w-0">
											<p className="text-lg font-medium text-[#1A1A1A] md:text-xl">{service.name}</p>
											{service.description ? (
												<p className="mt-1 text-sm text-[#1A1A1A]/65">{service.description}</p>
											) : null}
											<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#1A1A1A]/60">
												<span className="font-medium text-camel">{formatPrice(service.price)}</span>
												<span className="text-[#1A1A1A]/25">·</span>
												<span>{service.quantitable_item ? 'Quantitable' : 'One per stay'}</span>
												<span className="text-[#1A1A1A]/25">·</span>
												<span>
													{service.property_count}{' '}
													{service.property_count === 1 ? 'property' : 'properties'}
												</span>
											</div>
										</div>
										<div className="flex shrink-0 gap-2">
											<Button type="button" variant="ghostPill" onClick={() => startEdit(service)}>
												Edit
											</Button>
											<Button
												type="button"
												variant="ghostPill"
												disabled={deleting}
												className="text-[#1A1A1A]/55 hover:text-red-600"
												onClick={() => void handleDelete(service)}
												aria-label={`Delete ${service.name}`}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function ServicesPage() {
	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Services</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Guest extras</h1>
				<p className="mt-3 max-w-2xl text-sm text-[#1A1A1A]/65">
					Manage add-ons once and connect them to any property from{' '}
					<Link href="/dashboard/properties" className="text-camel underline-offset-2 hover:underline">
						property settings
					</Link>
					.
				</p>
			</div>

			<HostServicesList />
		</div>
	);
}
