'use client';

import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type PhotoGalleryLightboxProps = {
	images: string[];
	open: boolean;
	initialIndex?: number;
	onClose: () => void;
};

export function PhotoGalleryLightbox({ images, open, initialIndex = 0, onClose }: PhotoGalleryLightboxProps) {
	const slides = useMemo(() => images.filter(Boolean), [images]);
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1, startIndex: initialIndex });
	const [selected, setSelected] = useState(0);
	const [canPrev, setCanPrev] = useState(false);
	const [canNext, setCanNext] = useState(slides.length > 1);

	const updateControls = useCallback(() => {
		if (!emblaApi) return;
		setSelected(emblaApi.selectedScrollSnap());
		setCanPrev(emblaApi.canScrollPrev());
		setCanNext(emblaApi.canScrollNext());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		updateControls();
		emblaApi.on('select', updateControls);
		emblaApi.on('reInit', updateControls);
		return () => {
			emblaApi.off('select', updateControls);
			emblaApi.off('reInit', updateControls);
		};
	}, [emblaApi, updateControls]);

	useEffect(() => {
		if (!emblaApi || !open) return;
		emblaApi.scrollTo(initialIndex);
		updateControls();
	}, [emblaApi, initialIndex, open, updateControls]);

	useEffect(() => {
		if (!open) return;
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onEsc);
		return () => document.removeEventListener('keydown', onEsc);
	}, [open, onClose]);

	if (!open || slides.length === 0) return null;

	return (
		<motion.div
			className="fixed inset-0 z-[70] bg-black/90"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2, ease: 'easeOut' }}
		>
			<button
				type="button"
				onClick={onClose}
				className="absolute right-4 top-4 z-20 cursor-pointer rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
				aria-label="Close gallery"
			>
				<X className="h-5 w-5" />
			</button>
			<div className="flex h-full items-center justify-center p-4 sm:p-8">
				<motion.div
					className="relative w-full max-w-6xl"
					initial={{ opacity: 0, scale: 0.97, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
				>
					<div className="overflow-hidden rounded-xl" ref={emblaRef}>
						<div className="flex">
							{slides.map((src, index) => (
								<div key={`${src}-${index}`} className="relative min-w-0 shrink-0 grow-0 basis-full">
									<div className="relative h-[70vh] w-full">
										<Image src={src} alt="" fill className="object-contain" sizes="100vw" unoptimized />
									</div>
								</div>
							))}
						</div>
					</div>
					{slides.length > 1 ? (
						<>
							<button
								type="button"
								onClick={() => emblaApi?.scrollPrev()}
								disabled={!canPrev}
								className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35"
								aria-label="Previous photo"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<button
								type="button"
								onClick={() => emblaApi?.scrollNext()}
								disabled={!canNext}
								className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35"
								aria-label="Next photo"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
							<div className="mt-4 flex justify-center gap-1.5">
								{slides.map((_, index) => (
									<span
										key={index}
										className={`h-1.5 w-1.5 rounded-full ${selected === index ? 'bg-white' : 'bg-white/45'}`}
									/>
								))}
							</div>
						</>
					) : null}
				</motion.div>
			</div>
		</motion.div>
	);
}
