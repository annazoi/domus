'use client';

import { useMemo } from 'react';
import { Button, Checkbox, Input } from '@/components/ui';
import type { Service } from '@/features/services/interfaces/service.interface';

type BookingServicesCardProps = {
	services: Service[];
	isLoading: boolean;
	isError: boolean;
	quantities: Record<string, number>;
	onQuantityChange: (serviceId: string, quantity: number) => void;
};

function formatPrice(value: number) {
	return `$${value.toFixed(2)}`;
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

	return (
		<div className="rounded-xl border border-black/8 p-4">
			<div className="flex items-start gap-3">
				<Checkbox
					checked={selected}
					onChange={(e) => onQuantityChange(service.id, e.target.checked ? 1 : 0)}
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
						<p className="shrink-0 text-sm font-medium text-[#1A1A1A]">{formatPrice(service.price)}</p>
					</div>
					{selected ? (
						<div className="mt-3 flex items-center gap-2">
							<span className="text-xs text-[#1A1A1A]/55">Qty</span>
							<Button
								type="button"
								variant="cardRow"
								className="h-8 w-8 px-0"
								onClick={() => onQuantityChange(service.id, Math.max(1, quantity - 1))}
								disabled={quantity <= 1}
							>
								−
							</Button>
							<Input
								variant="compact"
								type="number"
								min={1}
								value={quantity}
								onChange={(e) => {
									const next = Number(e.target.value);
									if (!Number.isInteger(next) || next < 1) return;
									onQuantityChange(service.id, next);
								}}
								className="h-8 w-14 text-center"
							/>
							<Button
								type="button"
								variant="cardRow"
								className="h-8 w-8 px-0"
								onClick={() => onQuantityChange(service.id, quantity + 1)}
							>
								+
							</Button>
						</div>
					) : null}
				</div>
			</div>
		</div>
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

	return (
		<div className="mt-8 rounded-2xl border border-black/8 bg-[#faf9f7] p-5 sm:p-6">
			<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-camel">Extras</p>
			<h2 className="mt-2 font-serif text-2xl text-[#1A1A1A]">Add to your stay</h2>
			<p className="mt-1 text-sm text-[#1A1A1A]/60">Optional food, wine, or other services.</p>

			{isLoading ? (
				<p className="mt-5 text-sm text-[#1A1A1A]/55">Loading extras…</p>
			) : isError ? (
				<p className="mt-5 text-sm text-red-600">Could not load extras.</p>
			) : services.length === 0 ? (
				<p className="mt-5 text-sm text-[#1A1A1A]/55">No extras available right now.</p>
			) : (
				<div className="mt-5 space-y-3">
					{services.map((service) => (
						<ServiceRow
							key={service.id}
							service={service}
							quantity={quantities[service.id] ?? 0}
							onQuantityChange={onQuantityChange}
						/>
					))}
				</div>
			)}

			{extrasTotal > 0 ? (
				<div className="mt-4 flex justify-between border-t border-black/10 pt-3 text-sm">
					<span className="text-[#1A1A1A]/70">Extras subtotal</span>
					<span className="font-semibold text-[#1A1A1A]">{formatPrice(extrasTotal)}</span>
				</div>
			) : null}
		</div>
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
