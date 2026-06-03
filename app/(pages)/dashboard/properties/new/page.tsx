'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { buttonClassName } from '@/components/ui';
import { BasicInfoSection } from '../_components/property-form/basic-info-section';

export default function NewPropertyPage() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

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
						<p className="text-[10px] uppercase tracking-[0.18em] text-dashboard-accent">New listing</p>
						<h1 id="create-property-modal-title" className="mt-2 font-serif text-2xl tracking-tight text-espresso sm:text-3xl">
							Basic info
						</h1>
						<p className="mt-2 text-sm text-dashboard-muted">Submit to create the listing, then fill in the rest.</p>
					</div>
					<Link href="/dashboard/properties" className={buttonClassName('ghostPill')}>
						Cancel
					</Link>
				</header>
				<div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
					<BasicInfoSection
						mode="create"
						hideSectionHeading
						submitLabel="Create listing"
						onPropertyCreated={(id) => {
							router.replace(`/dashboard/properties/${id}`);
						}}
					/>
				</div>
			</motion.div>
		</motion.div>,
		document.body,
	);
}
