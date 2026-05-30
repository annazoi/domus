'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Checkbox, cn } from '@/components/ui';
import type { Service } from '@/features/services/interfaces/service.interface';

type BookingServicesCardProps = {
	services: Service[];
	isLoading: boolean;
	isError: boolean;
	quantities: Record<string, number>;
	onQuantityChange: (serviceId: string, quantity: number) => void;
};

const easeOut = [0.23, 1, 0.32, 1] as const;

const listVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.06, delayChildren: 0.04 },
	},
};

const rowVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.22, ease: easeOut },
	},
};

function formatPrice(value: number) {
	return `$${value.toFixed(2)}`;
}

function QuantityStepper({
	quantity,
	onDecrement,
	onIncrement,
	onChange,
}: {
	quantity: number;
	onDecrement: () => void;
	onIncrement: () => void;
	onChange: (next: number) => void;
}) {
	const atMin = quantity <= 1;

	return (
		<div
			className="inline-flex items-center rounded-full border border-black/10 bg-gradient-to-b from-white to-[#f7f5f2]"
			role="group"
			aria-label="Quantity"
		>
			<motion.button
				type="button"
				whileTap={atMin ? undefined : { scale: 0.92 }}
				onClick={onDecrement}
				disabled={atMin}
				aria-label="Decrease quantity"
				className={cn(
					'flex h-10 w-9 shrink-0 items-center justify-center rounded-l-full text-[#1A1A1A]/70 transition',
					atMin
						? 'cursor-not-allowed opacity-30'
						: 'cursor-pointer hover:bg-camel/12 hover:text-camel active:bg-camel/18',
				)}
			>
				<Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
			</motion.button>

			<div className="flex min-w-[3.25rem] flex-col items-center border-x border-black/8 px-3 py-1">
				<span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-camel/80">Qty</span>
				<input
					type="number"
					min={1}
					value={quantity}
					onChange={(e) => {
						const next = Number(e.target.value);
						if (!Number.isInteger(next) || next < 1) return;
						onChange(next);
					}}
					className="w-full border-0 bg-transparent text-center text-sm font-semibold leading-none tabular-nums text-[#1A1A1A] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					aria-label="Quantity value"
				/>
			</div>

			<motion.button
				type="button"
				whileTap={{ scale: 0.92 }}
				onClick={onIncrement}
				aria-label="Increase quantity"
				className="flex h-10 w-9 shrink-0 cursor-pointer items-center justify-center rounded-r-full bg-camel/10 text-camel transition hover:bg-camel/20 hover:text-camel active:bg-camel/90 active:text-white"
			>
				<Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
			</motion.button>
		</div>
	);
}

function ServiceRow({
	service,
	quantity,
	onQuantityChange,
}: {
	service: Service;
	quantity: number;
	onQuantityChange: (serviceId: string, quantity: number) => void;
}) {
	const selected = quantity > 0;
	const setQuantity = (next: number) => {
		if (!service.quantifiable_item) {
			onQuantityChange(service.id, next > 0 ? 1 : 0);
			return;
		}
		onQuantityChange(service.id, next);
	};

	return (
		<motion.div
			layout
			variants={rowVariants}
			animate={{
				borderColor: selected ? 'rgba(181, 154, 120, 0.45)' : 'rgba(0, 0, 0, 0.08)',
				backgroundColor: selected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.4)',
				boxShadow: selected ? '0 8px 24px rgba(26, 26, 26, 0.06)' : '0 0 0 rgba(0, 0, 0, 0)',
			}}
			transition={{ duration: 0.2, ease: easeOut }}
			className={cn(
				'cursor-pointer rounded-xl border p-4',
				selected && 'ring-1 ring-camel/25',
			)}
			onClick={() => setQuantity(selected ? 0 : 1)}
		>
			<div className="flex items-start gap-3">
				<Checkbox
					checked={selected}
					onChange={(e) => setQuantity(e.target.checked ? 1 : 0)}
					onClick={(e) => e.stopPropagation()}
					className="mt-1 accent-camel"
					aria-label={`Add ${service.name}`}
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="font-medium text-[#1A1A1A]">{service.name}</p>
							{service.description ? (
								<p className="mt-1 text-sm text-[#1A1A1A]/60">{service.description}</p>
							) : null}
						</div>
						<motion.p
							key={selected ? 'selected-price' : 'default-price'}
							initial={{ opacity: 0.6, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.18, ease: easeOut }}
							className="shrink-0 text-sm font-medium text-[#1A1A1A]"
						>
							{formatPrice(service.price)}
						</motion.p>
					</div>
					<AnimatePresence initial={false}>
						{selected && service.quantifiable_item ? (
							<motion.div
								key="qty-controls"
								initial={{ opacity: 0, height: 0, marginTop: 0 }}
								animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
								exit={{ opacity: 0, height: 0, marginTop: 0 }}
								transition={{ duration: 0.22, ease: easeOut }}
								className="overflow-hidden"
								onClick={(e) => e.stopPropagation()}
							>
								<QuantityStepper
									quantity={quantity}
									onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
									onIncrement={() => setQuantity(quantity + 1)}
									onChange={(next) => setQuantity(next)}
								/>
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
}

export default function BookingServicesCard({
	services,
	isLoading,
	isError,
	quantities,
	onQuantityChange,
}: BookingServicesCardProps) {
	if (!isLoading && !isError && services.length === 0) {
		return null;
	}

	const selectedLines = useMemo(
		() =>
			services
				.filter((service) => (quantities[service.id] ?? 0) > 0)
				.map((service) => ({
					service,
					quantity: quantities[service.id] ?? 0,
					lineTotal: service.price * (quantities[service.id] ?? 0),
				})),
		[services, quantities],
	);

	const extrasTotal = useMemo(
		() => selectedLines.reduce((sum, line) => sum + line.lineTotal, 0),
		[selectedLines],
	);

	const contentKey = isLoading ? 'loading' : isError ? 'error' : services.length === 0 ? 'empty' : 'list';

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, ease: easeOut }}
			className="mt-8 rounded-2xl border border-black/8 bg-[#faf9f7] p-5 sm:p-6"
		>
			<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-camel">Extras</p>
			<h2 className="mt-2 font-serif text-2xl text-[#1A1A1A]">Add to your stay</h2>
			<p className="mt-1 text-sm text-[#1A1A1A]/60">Optional food, wine, or other services.</p>

			<AnimatePresence mode="wait" initial={false}>
				{contentKey === 'loading' ? (
					<motion.p
						key="loading"
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.2, ease: easeOut }}
						className="mt-5 text-sm text-[#1A1A1A]/55"
					>
						Loading extras…
					</motion.p>
				) : contentKey === 'error' ? (
					<motion.p
						key="error"
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.2, ease: easeOut }}
						className="mt-5 text-sm text-red-600"
					>
						Could not load extras.
					</motion.p>
				) : contentKey === 'empty' ? (
					<motion.p
						key="empty"
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.2, ease: easeOut }}
						className="mt-5 text-sm text-[#1A1A1A]/55"
					>
						No extras available right now.
					</motion.p>
				) : (
					<motion.div
						key="list"
						variants={listVariants}
						initial="hidden"
						animate="visible"
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: easeOut }}
						className="mt-5 space-y-3"
					>
						{services.map((service) => (
							<ServiceRow
								key={service.id}
								service={service}
								quantity={quantities[service.id] ?? 0}
								onQuantityChange={onQuantityChange}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence initial={false}>
				{extrasTotal > 0 ? (
					<motion.div
						key="extras-subtotal"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.22, ease: easeOut }}
						className="overflow-hidden"
					>
						<div className="mt-4 flex justify-between border-t border-black/10 pt-3 text-sm">
							<span className="text-[#1A1A1A]/70">Extras subtotal</span>
							<motion.span
								key={extrasTotal}
								initial={{ opacity: 0, y: 4 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.18, ease: easeOut }}
								className="font-semibold text-[#1A1A1A]"
							>
								{formatPrice(extrasTotal)}
							</motion.span>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.div>
	);
}

export function buildSelectedServices(quantities: Record<string, number>) {
	return Object.entries(quantities)
		.filter(([, quantity]) => quantity > 0)
		.map(([service_id, quantity]) => ({ service_id, quantity }));
}

export function computeExtrasTotal(
	services: Service[],
	quantities: Record<string, number>,
) {
	return services.reduce((sum, service) => {
		const quantity = quantities[service.id] ?? 0;
		if (quantity <= 0) return sum;
		return sum + service.price * quantity;
	}, 0);
}
