import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, MinimalRichText, Select } from '@/components/ui';
import { ApartmentOptions } from '@/config/constants/dropdowns/apartment.options';
import type { PropertyStatus, UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type BasicInfoSectionProps = {
	form: UpsertPropertyInput;
	onChange: <K extends keyof UpsertPropertyInput>(field: K, value: UpsertPropertyInput[K]) => void;
};

export function BasicInfoSection({ form, onChange }: BasicInfoSectionProps) {
	const isPublished = form.status === 'published';

	const toggleStatus = () => {
		const next: PropertyStatus = isPublished ? 'draft' : 'published';
		onChange('status', next);
	};

	return (
		<PropertyFormSection id="basic-info" title="Basic info">
			<div className="flex flex-col gap-3 rounded-xl border border-black/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
				<div className="min-w-0">
					<p className="text-sm font-medium text-[#1A1A1A]">Listing status</p>
					<div className="overflow-hidden">
						<AnimatePresence mode="wait" initial={false}>
							<motion.p
								key={isPublished ? 'published' : 'draft'}
								initial={{ opacity: 0, x: 12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -12 }}
								transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
								className="text-xs text-[#1A1A1A]/55"
							>
								{isPublished ? 'Published: visible to guests.' : 'Draft: hidden from search and listings.'}
							</motion.p>
						</AnimatePresence>
					</div>
				</div>
				<Button
					type="button"
					variant="custom"
					role="switch"
					aria-checked={isPublished}
					aria-label={isPublished ? 'Published: click to unpublish' : 'Draft: click to publish'}
					onClick={toggleStatus}
					className={[
						'relative inline-flex h-9 w-14 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]',
						isPublished ? 'bg-emerald-600' : 'bg-black/15',
					].join(' ')}
				>
					<span
						className={[
							'ml-1 inline-block h-7 w-7 rounded-full bg-white shadow transition-transform',
							isPublished ? 'translate-x-5' : 'translate-x-0',
						].join(' ')}
					/>
				</Button>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-title" className="text-sm font-medium text-[#1A1A1A]">
						Title *
					</label>
					<Input
						id="property-title"
						value={form.title}
						onChange={(event) => onChange('title', event.target.value)}
						placeholder="Enter title"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-slug" className="text-sm font-medium text-[#1A1A1A]">
						Slug *
					</label>
					<Input
						id="property-slug"
						value={form.slug}
						onChange={(event) => onChange('slug', event.target.value)}
						placeholder="Enter slug"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-type" className="text-sm font-medium text-[#1A1A1A]">
						Property type
					</label>
					<Select
						id="property-type"
						variant="default"
						value={form.property_type}
						onChange={(event) => onChange('property_type', event.target.value)}
					>
						{ApartmentOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-room-type" className="text-sm font-medium text-[#1A1A1A]">
						Room type
					</label>
					<Input
						id="property-room-type"
						value={form.room_type}
						onChange={(event) => onChange('room_type', event.target.value)}
						placeholder="Enter room type"
					/>
				</div>
			</div>
			<MinimalRichText
				id="property-description"
				label="Description"
				value={form.description}
				onChange={(html) => onChange('description', html)}
				placeholder="Describe your space…"
				editorMinHeight="min-h-[160px]"
			/>
			<MinimalRichText
				id="property-short-description"
				label="Short description"
				value={form.short_description ?? ''}
				onChange={(html) => onChange('short_description', html)}
				placeholder="A line or two for cards and search…"
				editorMinHeight="min-h-[100px]"
			/>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-check-in-time" className="text-sm font-medium text-[#1A1A1A]">
						Check-in time
					</label>
					<Input
						id="property-check-in-time"
						type="time"
						step={300}
						value={form.check_in_time}
						onChange={(event) => onChange('check_in_time', event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-check-out-time" className="text-sm font-medium text-[#1A1A1A]">
						Check-out time
					</label>
					<Input
						id="property-check-out-time"
						type="time"
						step={300}
						value={form.check_out_time}
						onChange={(event) => onChange('check_out_time', event.target.value)}
					/>
				</div>
			</div>
		</PropertyFormSection>
	);
}
