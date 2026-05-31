'use client';

import Image from 'next/image';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, cn, useToast } from '@/components/ui';
import {
	PROPERTY_BRANDING_THEME_OPTIONS,
	PropertyBrandingTheme,
	brandingThemeToTemplateSlug,
} from '@/app/(pages)/templates/_constants/property-branding-theme';
import { usePatchPropertyBranding } from '@/features/property/hooks/use-property';
import type { Property } from '@/features/property/interfaces/property.interface';
import { PropertyFormSection } from './property-form-section';

type BrandingSectionProps = {
	initialProperty?: Property | null;
	propertyId?: string;
};

export function BrandingSection({ initialProperty, propertyId: propertyIdProp }: BrandingSectionProps) {
	const propertyId = propertyIdProp ?? initialProperty?.id ?? '';
	const { push } = useToast();
	const { mutateAsync: patchBranding, isPending: saving } = usePatchPropertyBranding(propertyId);

	const [selected, setSelected] = useState<PropertyBrandingTheme>(
		initialProperty?.branding_theme ?? PropertyBrandingTheme.CANVAS,
	);
	useEffect(() => {
		if (initialProperty?.branding_theme) {
			setSelected(initialProperty.branding_theme);
		}
	}, [initialProperty?.id, initialProperty?.updated_at, initialProperty?.branding_theme]);

	const previewSlug = initialProperty?.slug?.trim();

	const handleSave = async () => {
		if (!propertyId) {
			push({ title: 'Save Basic info first to create the property.', tone: 'error' });
			return;
		}
		try {
			await patchBranding(selected);
			push({ title: 'Branding saved.', tone: 'success' });
		} catch (err) {
			push({ title: err instanceof Error ? err.message : 'Could not save.', tone: 'error' });
		}
	};

	return (
		<PropertyFormSection id="branding" title="Branding">
			<p className="max-w-2xl text-sm leading-relaxed text-[#1A1A1A]/65">
				Choose a site template for this listing. Each design is fully customisable — swap photos, colors, and copy
				without touching code.
			</p>

			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{PROPERTY_BRANDING_THEME_OPTIONS.map((option) => {
					const active = selected === option.id;
					return (
						<div
							key={option.id}
							className={cn(
								'flex flex-col overflow-hidden rounded-2xl border border-dashboard-border/60 bg-dashboard-inset transition',
								active ? 'border-camel ring-2 ring-camel/25' : 'border-black/[0.06] hover:border-black/15',
							)}
						>
							<div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1A1A1A]/5">
								<Image
									src={option.image}
									alt={option.imageAlt}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									className="object-cover"
								/>
								{active ? (
									<span className="absolute left-3 top-3 rounded-full bg-camel px-3 py-1 text-xs font-medium text-white">
										Selected
									</span>
								) : null}
							</div>
							<div className="flex flex-1 flex-col p-5 text-left">
								<p className="font-serif text-2xl tracking-tight text-[#1A1A1A]">{option.label}</p>
								<div className="mt-2 flex flex-wrap gap-2">
									{option.tags.map((tag) => (
										<span
											key={tag}
											className="rounded-full bg-[#1A1A1A]/[0.06] px-2.5 py-0.5 text-xs text-[#1A1A1A]/65"
										>
											{tag}
										</span>
									))}
								</div>
								<p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/55">{option.description}</p>
							</div>
							<div className="flex gap-2 px-4 pb-4 pt-1">
								<Button
									type="button"
									variant="cardRow"
									disabled={active}
									aria-pressed={active}
									onClick={() => setSelected(option.id)}
									className={cn(
										'flex min-w-0 flex-1 justify-center text-center text-xs hover:!translate-y-0 active:!translate-y-0',
										active &&
											'pointer-events-none border-primary bg-primary text-white hover:border-primary hover:bg-primary disabled:opacity-100',
									)}
								>
									{active ? 'Selected' : 'Select'}
								</Button>
								<Button
									type="button"
									variant="cardRow"
									className="flex min-w-0 flex-1 justify-center gap-2 text-xs hover:!translate-y-0 active:!translate-y-0"
									onClick={() => {
										const slug = brandingThemeToTemplateSlug(option.id);
										window.open(`/templates/${slug}`, '_blank', 'noopener,noreferrer');
									}}
								>
									<Eye className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
									Preview
								</Button>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-2 flex flex-wrap justify-end gap-3 border-t border-black/5 pt-5">
				<Button type="button" onClick={() => void handleSave()} disabled={saving} variant="primary">
					{saving ? 'Saving...' : 'Save'}
				</Button>
				<Button
					type="button"
					variant="cardRow"
					disabled={!propertyId || !previewSlug}
					className="max-w-fit"
					onClick={() => {
						if (!previewSlug) return;
						window.open(`/${encodeURIComponent(previewSlug)}`, '_blank', 'noopener,noreferrer');
					}}
				>
					Preview listing
				</Button>
			</div>
		</PropertyFormSection>
	);
}
