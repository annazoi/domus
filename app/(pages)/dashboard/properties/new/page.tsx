'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { clearLaunchDraft, loadLaunchDraft, slugify, type LaunchDraft } from '@/app/_lib/launch-draft';
import { buttonClassName } from '@/components/ui';
import type { UpsertPropertyInput } from '@/features/property/interfaces/property.interface';
import { BasicInfoSection } from '../_components/property-form/basic-info-section';

function draftToPrefill(draft: LaunchDraft): Partial<UpsertPropertyInput> {
	const locationParts = draft.location
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	return {
		title: draft.propertyName.trim(),
		slug: slugify(draft.propertyName),
		city: locationParts[0] ?? '',
		country: locationParts.length > 1 ? locationParts[locationParts.length - 1] : '',
	};
}

export default function NewPropertyPage() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [draft, setDraft] = useState<LaunchDraft | null>(null);

	useEffect(() => {
		setDraft(loadLaunchDraft());
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const hasPrefill = Boolean(draft?.propertyName.trim());

	return createPortal(
		<motion.div
			className="dashboard-root fixed inset-0 z-[70] flex items-center justify-center p-4"
			role="presentation"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.18 }}
		>
			<div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-hidden />
			<motion.div
				role="dialog"
				aria-modal
				aria-labelledby="create-property-modal-title"
				className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-dashboard-panel shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]"
				initial={{ opacity: 0, scale: 0.96, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
			>
				<header className="flex shrink-0 flex-wrap items-start justify-between gap-4 px-6 pb-4 pt-6 sm:px-8">
					<div className="min-w-0">
						<p className="text-[10px] uppercase tracking-[0.18em] text-dashboard-accent">
							{hasPrefill ? 'Your first listing' : 'New listing'}
						</p>
						<h1 id="create-property-modal-title" className="mt-2 font-serif text-2xl tracking-tight text-espresso sm:text-3xl">
							{hasPrefill ? 'Let’s set up your property' : 'Basic info'}
						</h1>
						<p className="mt-2 text-sm text-dashboard-muted">Submit to create the listing, then fill in the rest.</p>
					</div>
					<Link
						href="/dashboard/properties"
						onClick={clearLaunchDraft}
						className={buttonClassName('ghostPill')}
					>
						{hasPrefill ? 'Skip for now' : 'Cancel'}
					</Link>
				</header>
				<div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
					{hasPrefill && draft ? (
						<div className="mb-4 rounded-lg bg-dashboard-bg px-4 py-3 text-sm text-dashboard-muted">
							We filled this in from your homepage details.
							{draft.nightlyRate.trim() ? (
								<>
									{' '}
									Don&apos;t forget to set your nightly rate (<span className="font-medium text-espresso">{draft.nightlyRate.trim()}</span>) in Pricing after saving.
								</>
							) : null}
						</div>
					) : null}
					<BasicInfoSection
						mode="create"
						hideSectionHeading
						submitLabel="Create listing"
						prefill={draft ? draftToPrefill(draft) : undefined}
						onPropertyCreated={(id) => {
							clearLaunchDraft();
							router.replace(`/dashboard/properties/${id}`);
						}}
					/>
				</div>
			</motion.div>
		</motion.div>,
		document.body,
	);
}
