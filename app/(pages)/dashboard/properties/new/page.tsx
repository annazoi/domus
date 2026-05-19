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
			className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-12 pb-10 sm:pt-20"
			role="presentation"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.18 }}
		>
			<motion.div
				role="dialog"
				aria-modal
				aria-labelledby="create-property-modal-title"
				className="relative z-10 my-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-[#f7f6f2] shadow-xl"
				initial={{ opacity: 0, scale: 0.96, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
			>
				<header className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
					<div className="min-w-0">
						<p className="text-[10px] uppercase tracking-[0.2em] text-camel">New listing</p>
						<h1 id="create-property-modal-title" className="mt-1 font-serif text-2xl text-[#1A1A1A]">
							Basic info
						</h1>
						<p className="mt-1 text-sm text-[#1A1A1A]/60">Submit to create the listing, then fill in the rest.</p>
					</div>
					<Link href="/dashboard/properties" className={buttonClassName('ghostPill')}>
						Cancel
					</Link>
				</header>
				<div className="max-h-[min(75vh,calc(100vh-6rem))] overflow-y-auto px-5 py-4">
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
