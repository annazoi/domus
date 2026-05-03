'use client';

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
				Choose how this listing appears on your public property page. Theme colors and typography are applied site-wide
				for this home.
			</p>

			<div className="grid gap-4 sm:grid-cols-2">
				{PROPERTY_BRANDING_THEME_OPTIONS.map((option) => {
					const active = selected === option.id;
					return (
						<div
							key={option.id}
							className={cn(
								'flex flex-col overflow-hidden rounded-2xl border bg-white/90 transition',
								active ? 'border-[#6B705C] ring-2 ring-[#6B705C]/25' : 'border-black/[0.06] hover:border-black/15',
							)}
						>
							<div className="flex flex-1 flex-col p-5 text-left">
								<div
									className="mb-4 flex h-24 items-end justify-between overflow-hidden rounded-xl px-4 pb-3 shadow-inner"
									style={{
										background: `linear-gradient(135deg, ${option.preview.bg} 0%, ${option.preview.accent}22 100%)`,
									}}
								>
									<span
										className={cn(
											'text-lg leading-tight tracking-tight text-[#1A1A1A]',
											option.preview.headlineFont === 'serif' ? 'font-serif' : 'font-sans',
										)}
									>
										Aa
									</span>
									<span
										className="h-9 w-9 rounded-full border border-black/10 shadow-sm"
										style={{ backgroundColor: option.preview.accent }}
									/>
								</div>
								<p className="font-medium text-[#1A1A1A]">{option.label}</p>
								<p className="mt-2 text-sm text-[#1A1A1A]/55">{option.description}</p>
							</div>
							<div className="flex gap-2 border-t border-black/5 px-4 pb-4 pt-1">
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
									Preview theme
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
