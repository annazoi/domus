import { motion, AnimatePresence } from 'framer-motion';
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
				<button
					type="button"
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
				</button>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<label htmlFor="property-title" className="text-sm font-medium text-[#1A1A1A]">
						Title *
					</label>
					<input
						id="property-title"
						value={form.title}
						onChange={(event) => onChange('title', event.target.value)}
						placeholder="Enter title"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-type" className="text-sm font-medium text-[#1A1A1A]">
						Property type
					</label>
					<select
						id="property-type"
						value={form.propertyType}
						onChange={(event) => onChange('propertyType', event.target.value)}
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					>
						{ApartmentOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="property-room-type" className="text-sm font-medium text-[#1A1A1A]">
						Room type
					</label>
					<input
						id="property-room-type"
						value={form.roomType}
						onChange={(event) => onChange('roomType', event.target.value)}
						placeholder="Enter room type"
						className="w-full rounded-xl border border-black/10 px-4 py-3"
					/>
				</div>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="property-description" className="text-sm font-medium text-[#1A1A1A]">
					Description
				</label>
				<textarea
					id="property-description"
					value={form.description}
					onChange={(event) => onChange('description', event.target.value)}
					placeholder="Write a short description"
					className="min-h-28 w-full rounded-xl border border-black/10 px-4 py-3"
				/>
			</div>
		</PropertyFormSection>
	);
}
