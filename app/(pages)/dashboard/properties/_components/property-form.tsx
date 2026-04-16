'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
	Amenity,
	Property,
	PropertyImage,
	PropertyStatus,
	UpsertPropertyInput,
} from '@/features/property/interfaces/property.interface';
import {
	deleteImage,
	getAmenities,
	reorderPropertyImages,
	savePropertyAmenities,
	uploadPropertyImages,
} from '@/features/property/services/property.services';

type PropertyFormProps = {
	mode: 'create' | 'edit';
	initialProperty?: Property | null;
	onSubmit: (payload: UpsertPropertyInput) => Promise<Property>;
};

const defaultValues: UpsertPropertyInput = {
	title: '',
	description: '',
	propertyType: 'Apartment',
	roomType: 'Entire place',
	guests: 1,
	bedrooms: 1,
	beds: 1,
	bathrooms: 1,
	country: '',
	city: '',
	address: '',
	lat: null,
	lng: null,
	pricePerNight: 120,
	cleaningFee: 0,
	status: 'draft',
};

const numberOrNull = (value: string) => {
	if (!value.trim()) return null;
	const numeric = Number(value);
	return Number.isNaN(numeric) ? null : numeric;
};

export function PropertyForm({ mode, initialProperty, onSubmit }: PropertyFormProps) {
	const router = useRouter();
	const [form, setForm] = useState<UpsertPropertyInput>(initialProperty ? { ...initialProperty } : defaultValues);
	const [images, setImages] = useState<PropertyImage[]>(initialProperty?.images ?? []);
	const [amenities, setAmenities] = useState<Amenity[]>([]);
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialProperty?.amenityIds ?? []);
	const [imageUrls, setImageUrls] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [draggingId, setDraggingId] = useState<string | null>(null);

	useEffect(() => {
		void (async () => {
			const amenityList = await getAmenities();
			setAmenities(amenityList);
		})();
	}, []);

	const validationMessage = useMemo(() => {
		if (!form.title.trim()) return 'Title is required.';
		if (form.pricePerNight <= 0) return 'Price must be greater than 0.';
		if (form.guests <= 0) return 'Guests must be greater than 0.';
		return '';
	}, [form]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validationMessage) {
			setError(validationMessage);
			return;
		}

		setSaving(true);
		setError('');
		try {
			const saved = await onSubmit(form);
			await savePropertyAmenities(saved.id, selectedAmenities);
			router.push('/dashboard/properties');
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : 'Could not save property.');
		} finally {
			setSaving(false);
		}
	};

	const handleImageUpload = async () => {
		if (!initialProperty) return;
		const urls = imageUrls
			.split('\n')
			.map((item) => item.trim())
			.filter(Boolean);
		if (!urls.length) return;

		const created = await uploadPropertyImages(initialProperty.id, urls);
		setImages((previous) => [...previous, ...created].sort((a, b) => a.order - b.order));
		setImageUrls('');
	};

	const handleImageDelete = async (imageId: string) => {
		await deleteImage(imageId);
		setImages((previous) => previous.filter((image) => image.id !== imageId));
	};

	const handleCoverSelect = async (imageId: string) => {
		if (!initialProperty) return;
		const order = images.map((image) => image.id);
		const reordered = await reorderPropertyImages(initialProperty.id, order, imageId);
		setImages(reordered);
	};

	const persistOrder = async (nextImages: PropertyImage[]) => {
		if (!initialProperty) return;
		const coverId = nextImages.find((image) => image.isCover)?.id;
		const reordered = await reorderPropertyImages(
			initialProperty.id,
			nextImages.map((image) => image.id),
			coverId,
		);
		setImages(reordered);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			<div className="space-y-2">
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">
					{mode === 'create' ? 'Create property' : 'Edit property'}
				</p>
				<h1 className="font-serif text-4xl">{mode === 'create' ? 'New listing' : 'Property details'}</h1>
			</div>

			{error ? <p className="rounded-xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</p> : null}

			<section className="space-y-4 rounded-2xl bg-white/80 p-5">
				<h2 className="font-serif text-2xl">Basic info</h2>
				<div className="grid gap-4 md:grid-cols-2">
					<input
						value={form.title}
						onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
						placeholder="Title *"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
					<input
						value={form.propertyType}
						onChange={(event) => setForm((previous) => ({ ...previous, propertyType: event.target.value }))}
						placeholder="Property type"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
					<input
						value={form.roomType}
						onChange={(event) => setForm((previous) => ({ ...previous, roomType: event.target.value }))}
						placeholder="Room type"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
				<textarea
					value={form.description}
					onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
					placeholder="Description"
					className="min-h-28 w-full rounded-xl border border-black/10 px-4 py-3"
				/>
			</section>

			<section className="space-y-4 rounded-2xl bg-white/80 p-5">
				<h2 className="font-serif text-2xl">Capacity</h2>
				<div className="grid gap-4 md:grid-cols-4">
					{[
						['guests', 'Guests *'],
						['bedrooms', 'Bedrooms'],
						['beds', 'Beds'],
						['bathrooms', 'Bathrooms'],
					].map(([key, label]) => (
						<input
							key={key}
							type="number"
							min={0}
							value={form[key as keyof UpsertPropertyInput] as number}
							onChange={(event) => setForm((previous) => ({ ...previous, [key]: Number(event.target.value) }))}
							placeholder={label}
							className="rounded-xl border border-black/10 px-4 py-3"
						/>
					))}
				</div>
			</section>

			<section className="space-y-4 rounded-2xl bg-white/80 p-5">
				<h2 className="font-serif text-2xl">Location</h2>
				<div className="grid gap-4 md:grid-cols-2">
					<input
						value={form.country}
						onChange={(event) => setForm((previous) => ({ ...previous, country: event.target.value }))}
						placeholder="Country"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
					<input
						value={form.city}
						onChange={(event) => setForm((previous) => ({ ...previous, city: event.target.value }))}
						placeholder="City"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
				<input
					value={form.address}
					onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))}
					placeholder="Address"
					className="w-full rounded-xl border border-black/10 px-4 py-3"
				/>
				<div className="grid gap-4 md:grid-cols-2">
					<input
						value={form.lat ?? ''}
						onChange={(event) => setForm((previous) => ({ ...previous, lat: numberOrNull(event.target.value) }))}
						placeholder="Latitude"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
					<input
						value={form.lng ?? ''}
						onChange={(event) => setForm((previous) => ({ ...previous, lng: numberOrNull(event.target.value) }))}
						placeholder="Longitude"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
			</section>

			<section className="space-y-4 rounded-2xl bg-white/80 p-5">
				<h2 className="font-serif text-2xl">Pricing and status</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<input
						type="number"
						min={0}
						value={form.pricePerNight}
						onChange={(event) =>
							setForm((previous) => ({ ...previous, pricePerNight: Number(event.target.value) }))
						}
						placeholder="Price per night *"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
					<input
						type="number"
						min={0}
						value={form.cleaningFee}
						onChange={(event) =>
							setForm((previous) => ({ ...previous, cleaningFee: Number(event.target.value) }))
						}
						placeholder="Cleaning fee"
						className="rounded-xl border border-black/10 px-4 py-3"
					/>
					<select
						value={form.status}
						onChange={(event) =>
							setForm((previous) => ({ ...previous, status: event.target.value as PropertyStatus }))
						}
						className="rounded-xl border border-black/10 px-4 py-3"
					>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</select>
				</div>
			</section>

			<section className="space-y-4 rounded-2xl bg-white/80 p-5">
				<h2 className="font-serif text-2xl">Amenities</h2>
				<div className="flex flex-wrap gap-2">
					{amenities.map((amenity) => {
						const active = selectedAmenities.includes(amenity.id);
						return (
							<button
								key={amenity.id}
								type="button"
								onClick={() =>
									setSelectedAmenities((previous) =>
										active ? previous.filter((id) => id !== amenity.id) : [...previous, amenity.id],
									)
								}
								className={[
									'rounded-full px-3 py-1.5 text-sm transition',
									active ? 'bg-[#6B705C] text-white' : 'bg-black/5 text-[#1A1A1A]/70 hover:bg-black/10',
								].join(' ')}
							>
								{amenity.label}
							</button>
						);
					})}
				</div>
			</section>

			{mode === 'edit' && initialProperty ? (
				<section className="space-y-4 rounded-2xl bg-white/80 p-5">
					<h2 className="font-serif text-2xl">Images manager</h2>
					<textarea
						value={imageUrls}
						onChange={(event) => setImageUrls(event.target.value)}
						placeholder="Paste image URLs, one per line"
						className="min-h-24 w-full rounded-xl border border-black/10 px-4 py-3"
					/>
					<button
						type="button"
						onClick={() => void handleImageUpload()}
						className="rounded-full border border-black/10 px-4 py-2 text-sm hover:border-[#6B705C]/45"
					>
						Upload images
					</button>

					<div className="grid gap-3 md:grid-cols-2">
						{images.map((image) => (
							<div
								key={image.id}
								draggable
								onDragStart={() => setDraggingId(image.id)}
								onDragOver={(event) => event.preventDefault()}
								onDrop={() => {
									if (!draggingId || draggingId === image.id) return;
									const from = images.findIndex((item) => item.id === draggingId);
									const to = images.findIndex((item) => item.id === image.id);
									const next = [...images];
									const [moved] = next.splice(from, 1);
									next.splice(to, 0, moved);
									const normalized = next.map((item, index) => ({ ...item, order: index }));
									void persistOrder(normalized);
								}}
								className="space-y-2 rounded-xl border border-black/10 p-3"
							>
								<div
									className="h-36 rounded-lg bg-black/5 bg-cover bg-center"
									style={{ backgroundImage: `url(${image.url})` }}
								/>
								<div className="flex items-center justify-between text-xs">
									<button
										type="button"
										onClick={() => void handleCoverSelect(image.id)}
										className={image.isCover ? 'text-[#6B705C]' : 'text-[#1A1A1A]/50'}
									>
										{image.isCover ? 'Cover image' : 'Set as cover'}
									</button>
									<button
										type="button"
										onClick={() => void handleImageDelete(image.id)}
										className="text-red-600"
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				</section>
			) : null}

			<div className="flex items-center gap-3">
				<button
					type="submit"
					disabled={saving}
					className="rounded-full bg-[#1A1A1A] px-6 py-2.5 text-sm text-white transition hover:-translate-y-0.5 disabled:opacity-60"
				>
					{saving ? 'Saving...' : mode === 'create' ? 'Create property' : 'Save changes'}
				</button>
				{mode === 'edit' && initialProperty ? (
					<button
						type="button"
						className="rounded-full border border-black/10 px-5 py-2.5 text-sm"
						onClick={() => router.push(`/dashboard/properties/${initialProperty.id}/calendar`)}
					>
						Edit availability
					</button>
				) : null}
			</div>
		</form>
	);
}
