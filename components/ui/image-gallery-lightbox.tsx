'use client';

import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export type ImageGalleryOriginRect = {
	top: number;
	left: number;
	width: number;
	height: number;
};

export type ImageGalleryLightboxProps = {
	images: string[];
	open: boolean;
	initialIndex?: number;
	onClose: () => void;
	originRect?: ImageGalleryOriginRect | null;
};

function getViewportCenter() {
	if (typeof window === 'undefined') return { x: 0, y: 0 };
	return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

function motionFromOrigin(origin: ImageGalleryOriginRect, reducedMotion: boolean) {
	if (reducedMotion) {
		return {
			initial: { opacity: 0, scale: 0.98 },
			animate: { opacity: 1, scale: 1 },
			exit: { opacity: 0, scale: 0.98 },
		};
	}

	const center = getViewportCenter();
	const originCenterX = origin.left + origin.width / 2;
	const originCenterY = origin.top + origin.height / 2;
	const targetWidth = Math.min(window.innerWidth - 32, 1152);
	const targetHeight = window.innerHeight * 0.7;
	const scale = Math.max(origin.width / targetWidth, origin.height / targetHeight, 0.08);

	return {
		initial: {
			opacity: 0.85,
			scale,
			x: originCenterX - center.x,
			y: originCenterY - center.y,
			borderRadius: 12,
		},
		animate: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			borderRadius: 12,
		},
		exit: {
			opacity: 0,
			scale: scale * 0.96,
			x: originCenterX - center.x,
			y: originCenterY - center.y,
			borderRadius: 12,
		},
	};
}

const defaultMotion = {
	initial: { opacity: 0, scale: 0.94, y: 16 },
	animate: { opacity: 1, scale: 1, y: 0 },
	exit: { opacity: 0, scale: 0.96, y: 12 },
};

export function ImageGalleryLightbox({
	images,
	open,
	initialIndex = 0,
	onClose,
	originRect = null,
}: ImageGalleryLightboxProps) {
	const reducedMotion = useReducedMotion() ?? false;
	const frozenOrigin = useRef<ImageGalleryOriginRect | null>(null);
	const slides = useMemo(() => images.filter(Boolean), [images]);
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1, startIndex: initialIndex });
	const [selected, setSelected] = useState(0);
	const [canPrev, setCanPrev] = useState(false);
	const [canNext, setCanNext] = useState(slides.length > 1);

	useEffect(() => {
		if (open && originRect) frozenOrigin.current = originRect;
	}, [open, originRect]);

	const activeOrigin = open ? (originRect ?? frozenOrigin.current) : frozenOrigin.current;
	const panelMotion = activeOrigin ? motionFromOrigin(activeOrigin, reducedMotion) : defaultMotion;
	const transition = reducedMotion
		? { duration: 0.15 }
		: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

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
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const onEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onEsc);
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('keydown', onEsc);
		};
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open && slides.length > 0 ? (
				<motion.div
					key="image-gallery-lightbox"
					className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: reducedMotion ? 0.15 : 0.32, ease: 'easeOut' }}
					role="dialog"
					aria-modal="true"
					aria-label="Image gallery"
					onClick={onClose}
				>
					<motion.button
						type="button"
						onClick={onClose}
						className="absolute right-4 top-4 z-20 cursor-pointer rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
						aria-label="Close gallery"
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ delay: reducedMotion ? 0 : 0.12, duration: 0.22 }}
					>
						<X className="h-5 w-5" />
					</motion.button>

					<div className="flex h-full items-center justify-center p-4 sm:p-8">
						<motion.div
							className="relative w-full max-w-6xl"
							initial={panelMotion.initial}
							animate={panelMotion.animate}
							exit={panelMotion.exit}
							transition={transition}
							onClick={(event) => event.stopPropagation()}
						>
							<div className="overflow-hidden rounded-xl bg-black/20 shadow-2xl shadow-black/40" ref={emblaRef}>
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
									<motion.button
										type="button"
										onClick={() => emblaApi?.scrollPrev()}
										disabled={!canPrev}
										className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35"
										aria-label="Previous photo"
										initial={{ opacity: 0, x: -8 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -8 }}
										transition={{ delay: reducedMotion ? 0 : 0.18, duration: 0.22 }}
									>
										<ChevronLeft className="h-5 w-5" />
									</motion.button>
									<motion.button
										type="button"
										onClick={() => emblaApi?.scrollNext()}
										disabled={!canNext}
										className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35"
										aria-label="Next photo"
										initial={{ opacity: 0, x: 8 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 8 }}
										transition={{ delay: reducedMotion ? 0 : 0.18, duration: 0.22 }}
									>
										<ChevronRight className="h-5 w-5" />
									</motion.button>
									<motion.p
										className="mt-4 text-center text-sm tabular-nums text-white/70"
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 6 }}
										transition={{ delay: reducedMotion ? 0 : 0.2, duration: 0.22 }}
									>
										{selected + 1} / {slides.length}
									</motion.p>
								</>
							) : null}
						</motion.div>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
