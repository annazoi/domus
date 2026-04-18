import type { PropertyImage } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type ImagesSectionProps = {
	mode: 'create' | 'edit';
	initialPropertyId?: string;
	images: PropertyImage[];
	imageFiles: File[];
	draggingId: string | null;
	onImageFilesChange: (files: File[]) => void;
	onDragStart: (imageId: string) => void;
	onDrop: (targetImageId: string) => void;
	onSetCover: (imageId: string) => void;
	onDelete: (imageId: string) => void;
};

export function ImagesSection({
	mode,
	initialPropertyId,
	images,
	imageFiles,
	draggingId,
	onImageFilesChange,
	onDragStart,
	onDrop,
	onSetCover,
	onDelete,
}: ImagesSectionProps) {
	return (
		<PropertyFormSection id="images" title="Images manager">
			{mode === 'create' ? (
				<p className="text-sm text-[#1A1A1A]/60">
					Create the property from Basic info (or another section), then return here and use &quot;Upload images&quot;
					below.
				</p>
			) : null}
			<div className="space-y-1.5">
				<label htmlFor="property-images-upload" className="text-sm font-medium text-[#1A1A1A]">
					Upload images
				</label>
				<input
					id="property-images-upload"
					type="file"
					multiple
					accept="image/*"
					onChange={(event) => onImageFilesChange(Array.from(event.target.files ?? []))}
					className="w-full rounded-xl border border-black/10 px-4 py-3"
				/>
			</div>
			{mode === 'edit' && initialPropertyId ? (
				<div className="grid gap-3 md:grid-cols-2">
					{images.map((image) => (
						<div
							key={image.id}
							draggable
							onDragStart={() => onDragStart(image.id)}
							onDragOver={(event) => event.preventDefault()}
							onDrop={() => onDrop(image.id)}
							className={[
								'space-y-2 rounded-xl border border-black/10 p-3',
								draggingId === image.id ? 'opacity-60' : 'opacity-100',
							].join(' ')}
						>
							<div
								className="h-36 rounded-lg bg-black/5 bg-cover bg-center"
								style={{ backgroundImage: `url(${image.url})` }}
							/>
							<div className="flex items-center justify-between text-xs">
								<button
									type="button"
									onClick={() => onSetCover(image.id)}
									className={image.isCover ? 'text-[#6B705C]' : 'text-[#1A1A1A]/50'}
								>
									{image.isCover ? 'Cover image' : 'Set as cover'}
								</button>
								<button type="button" onClick={() => onDelete(image.id)} className="text-red-600">
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			) : null}
		</PropertyFormSection>
	);
}
