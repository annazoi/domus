import { Button, Input } from '@/components/ui';
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
					Create the property from Basic info (or another section), then return here, select images, and click Save
					below.
				</p>
			) : null}
			<div className="space-y-1.5">
				<label htmlFor="property-images-upload" className="text-sm font-medium text-[#1A1A1A]">
					Upload images
				</label>
				<Input
					id="property-images-upload"
					type="file"
					multiple
					accept="image/*"
					onChange={(event) => onImageFilesChange(Array.from(event.target.files ?? []))}
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
								<Button
									type="button"
									variant="custom"
									onClick={() => onSetCover(image.id)}
									className={image.is_cover ? 'text-[#6B705C]' : 'text-[#1A1A1A]/50'}
								>
									{image.is_cover ? 'Cover image' : 'Set as cover'}
								</Button>
								<Button
									type="button"
									variant="custom"
									onClick={() => onDelete(image.id)}
									className="text-red-600 hover:text-red-700"
								>
									Delete
								</Button>
							</div>
						</div>
					))}
				</div>
			) : null}
		</PropertyFormSection>
	);
}
