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
	useUploadServiceImages,
} from '@/features/services/hooks/use-host-services';
import type { HostService, ServiceInput } from '@/features/services/interfaces/service.interface';
import {
	PRICING_UNIT_LABELS,
	PRICING_UNIT_OPTIONS,
	PricingUnit,
} from '@/features/services/interfaces/pricing-unit';
import {
	ServicePhotosEditor,
	StagedPhotosPicker,
	useStagedPhotos,
} from './_components/service-photos-editor';

type ServiceDraft = {
	name: string;
	description: string;
	price: string;
	quantitable_item: boolean;
	pricing_unit: PricingUnit;
	max_quantity: string;
};

const emptyDraft = (): ServiceDraft => ({
	name: '',
	description: '',
	price: '',
	quantitable_item: false,
	pricing_unit: PricingUnit.PER_STAY,
	max_quantity: '',
});

const toDraft = (service: HostService): ServiceDraft => ({
	name: service.name,
	description: service.description ?? '',
	price: String(service.price),
	quantitable_item: service.quantitable_item,
	pricing_unit: service.pricing_unit,
	max_quantity: service.max_quantity != null ? String(service.max_quantity) : '',
});

const parseDraft = (draft: ServiceDraft): ServiceInput | null => {
	const name = draft.name.trim();
	const description = draft.description.trim();
	const price = Number(draft.price);
	if (!name) return null;
	if (!Number.isFinite(price) || price < 0) return null;

	let maxQuantity: number | null = null;
	if (draft.quantitable_item) {
		const parsed = Number(draft.max_quantity);
		if (!draft.max_quantity.trim() || !Number.isInteger(parsed) || parsed < 1) return null;
		maxQuantity = parsed;
	}

	return {
		name,
		description: description || null,
		price,
		quantitable_item: draft.quantitable_item,
		pricing_unit: draft.pricing_unit,
		max_quantity: maxQuantity,
	};
};

const selectClassName =
	'w-full rounded-lg border border-dashboard-border bg-white px-3 py-2 text-sm text-espresso outline-none focus:border-camel';

function formatPrice(value: number) {
	return `$${value.toFixed(2)}`;
}

export function HostServicesList() {
	const { push } = useToast();
	const { data: services = [], isLoading } = useHostServices(true);
	const { mutateAsync: createService, isPending: creating } = useCreateHostService();
	const { mutateAsync: updateService, isPending: updating } = useUpdateHostService();
	const { mutateAsync: deleteService, isPending: deleting } = useDeleteHostService();
	const { mutateAsync: uploadImages, isPending: uploadingImages } = useUploadServiceImages();
	const createPhotos = useStagedPhotos();

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
			push({ title: 'Enter a name, a valid price, and a max quantity (1+) for quantitable extras.', tone: 'error' });
			return;
		}

		try {
			const created = await createService(payload);
			if (createPhotos.staged.length) {
				try {
					await uploadImages({ serviceId: created.id, files: createPhotos.staged.map((s) => s.file) });
				} catch {
					push({ title: 'Service created, but photos failed to upload. Add them from Edit.', tone: 'error' });
				}
			}
			createPhotos.clear();
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
			push({ title: 'Enter a name, a valid price, and a max quantity (1+) for quantitable extras.', tone: 'error' });
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
			<div className="dashboard-panel overflow-hidden rounded-2xl">
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} className="border-b border-dashboard-border px-5 py-5 md:px-8">
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
				<div className="dashboard-panel rounded-2xl p-5 md:p-6">
					<p className="text-sm font-medium text-espresso">New service</p>
					<div className="mt-4 grid gap-3 md:grid-cols-2">
						<div className="space-y-1.5 md:col-span-2">
							<label className="text-sm text-espresso/70">Name</label>
							<Input
								variant="compact"
								value={createDraft.name}
								onChange={(e) => setCreateDraft((prev) => ({ ...prev, name: e.target.value }))}
								placeholder="Welcome wine"
							/>
						</div>
						<div className="space-y-1.5 md:col-span-2">
							<label className="text-sm text-espresso/70">Description</label>
							<Textarea
								value={createDraft.description}
								onChange={(e) => setCreateDraft((prev) => ({ ...prev, description: e.target.value }))}
								placeholder="Bottle of local wine on arrival"
								rows={2}
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-sm text-espresso/70">Price (USD)</label>
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
						<div className="space-y-1.5">
							<label className="text-sm text-espresso/70">Pricing unit</label>
							<select
								className={selectClassName}
								value={createDraft.pricing_unit}
								onChange={(e) =>
									setCreateDraft((prev) => ({ ...prev, pricing_unit: e.target.value as PricingUnit }))
								}
							>
								{PRICING_UNIT_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
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
								<span className="text-sm font-medium text-espresso">Quantitable</span>
								<span className="mt-0.5 block text-sm text-espresso/60">
									Guests can choose a quantity (e.g. bottles of wine). Leave off for one-time extras like
									late checkout.
								</span>
							</span>
						</label>
						{createDraft.quantitable_item ? (
							<div className="space-y-1.5">
								<label className="text-sm text-espresso/70">Max quantity</label>
								<Input
									variant="compact"
									type="number"
									min={1}
									step="1"
									value={createDraft.max_quantity}
									onChange={(e) => setCreateDraft((prev) => ({ ...prev, max_quantity: e.target.value }))}
									placeholder="e.g. 5"
								/>
								<p className="text-xs text-espresso/55">Required - most a guest can add per booking.</p>
							</div>
						) : null}
					</div>
					<div className="mt-5 space-y-3 border-t border-dashboard-border pt-4">
						<p className="text-sm font-medium text-espresso">Photos</p>
						<StagedPhotosPicker
							staged={createPhotos.staged}
							onAddFiles={createPhotos.addFiles}
							onRemove={createPhotos.removeStaged}
						/>
					</div>
					<div className="mt-4 flex flex-wrap gap-2">
						<Button
							type="button"
							variant="primarySm"
							disabled={creating || uploadingImages}
							onClick={() => void handleCreate()}
						>
							{creating || uploadingImages ? 'Saving…' : 'Save service'}
						</Button>
						<Button
							type="button"
							variant="ghostPill"
							onClick={() => {
								setShowCreateForm(false);
								setCreateDraft(emptyDraft());
								createPhotos.clear();
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
					<span className="text-sm font-medium text-espresso">Add service</span>
				</Button>
			)}

			{sortedServices.length === 0 ? (
				<div className="dashboard-panel rounded-2xl p-8 text-center">
					<p className="font-serif text-2xl">No services yet</p>
					<p className="mt-2 text-sm text-espresso/60">
						Create extras like wine, breakfast, or late checkout, then attach them to properties under Guest extras.
					</p>
				</div>
			) : (
				<div className="dashboard-panel overflow-hidden rounded-2xl">
					{sortedServices.map((service) => {
						const isEditing = editingId === service.id;

						return (
							<div key={service.id} className="border-b border-dashboard-border px-5 py-5 last:border-b-0 md:px-8 md:py-6">
								{isEditing ? (
									<div className="space-y-3">
										<div className="grid gap-3 md:grid-cols-2">
											<div className="space-y-1.5 md:col-span-2">
												<label className="text-sm text-espresso/70">Name</label>
												<Input
													variant="compact"
													value={editDraft.name}
													onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5 md:col-span-2">
												<label className="text-sm text-espresso/70">Description</label>
												<Textarea
													value={editDraft.description}
													onChange={(e) =>
														setEditDraft((prev) => ({ ...prev, description: e.target.value }))
													}
													rows={2}
												/>
											</div>
											<div className="space-y-1.5">
												<label className="text-sm text-espresso/70">Price (USD)</label>
												<Input
													variant="compact"
													type="number"
													min={0}
													step="0.01"
													value={editDraft.price}
													onChange={(e) => setEditDraft((prev) => ({ ...prev, price: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5">
												<label className="text-sm text-espresso/70">Pricing unit</label>
												<select
													className={selectClassName}
													value={editDraft.pricing_unit}
													onChange={(e) =>
														setEditDraft((prev) => ({
															...prev,
															pricing_unit: e.target.value as PricingUnit,
														}))
													}
												>
													{PRICING_UNIT_OPTIONS.map((option) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													))}
												</select>
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
													<span className="text-sm font-medium text-espresso">Quantitable</span>
													<span className="mt-0.5 block text-sm text-espresso/60">
														Guests can choose a quantity for this extra.
													</span>
												</span>
											</label>
											{editDraft.quantitable_item ? (
												<div className="space-y-1.5">
													<label className="text-sm text-espresso/70">Max quantity</label>
													<Input
														variant="compact"
														type="number"
														min={1}
														step="1"
														value={editDraft.max_quantity}
														onChange={(e) =>
															setEditDraft((prev) => ({ ...prev, max_quantity: e.target.value }))
														}
														placeholder="e.g. 5"
													/>
													<p className="text-xs text-espresso/55">Required — most a guest can add per booking.</p>
												</div>
											) : null}
										</div>
										<div className="border-t border-dashboard-border pt-4">
											<ServicePhotosEditor service={service} />
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
										<div className="flex min-w-0 gap-4">
											{service.images.length > 0 ? (
												<div
													className="hidden h-16 w-16 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-black/10 sm:block"
													style={{ backgroundImage: `url(${service.images[0].url ?? ''})` }}
												/>
											) : null}
											<div className="min-w-0">
											<p className="text-lg font-medium text-espresso md:text-xl">{service.name}</p>
											{service.description ? (
												<p className="mt-1 text-sm text-espresso/65">{service.description}</p>
											) : null}
											<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-espresso/60">
												<span className="font-medium text-camel">{formatPrice(service.price)}</span>
												<span className="text-espresso/25">·</span>
												<span>{PRICING_UNIT_LABELS[service.pricing_unit]}</span>
												<span className="text-espresso/25">·</span>
												<span>{service.quantitable_item ? 'Quantitable' : 'One per stay'}</span>
												<span className="text-espresso/25">·</span>
												<span>
													{service.property_count}{' '}
													{service.property_count === 1 ? 'property' : 'properties'}
												</span>
												{service.images.length > 0 ? (
													<>
														<span className="text-espresso/25">·</span>
														<span>
															{service.images.length}{' '}
															{service.images.length === 1 ? 'photo' : 'photos'}
														</span>
													</>
												) : null}
											</div>
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
												className="text-espresso/55 hover:text-red-600"
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
				<p className="mt-3 max-w-2xl text-sm text-espresso/65">
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
