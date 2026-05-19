'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { useCreateBooking } from '@/features/bookings/hooks/use-bookings';
import { useServices } from '@/features/services/hooks/use-services';
import { formatDisplayDate } from '@/features/property-availability/utils/date';
import BookingServicesCard, {
	buildSelectedServices,
	computeExtrasTotal,
} from './_components/booking-services-card';
import { ArrowLeft } from 'lucide-react';

export default function ConfirmAndPayContent() {
	const router = useRouter();
	const params = useSearchParams();

	const booking = useMemo(
		() => ({
			property_id: params.get('property_id') ?? '',
			check_in: params.get('check_in') ?? '',
			check_out: params.get('check_out') ?? '',
			guests: Number(params.get('guests') ?? 1),
			total_price: Number(params.get('total_price') ?? 0),
			first_name: params.get('first_name') ?? '',
			last_name: params.get('last_name') ?? '',
			email: params.get('email') ?? '',
			phone: params.get('phone') ?? '',
		}),
		[params],
	);

	const [error, setError] = useState<string | null>(null);
	const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>({});
	const { mutateAsync: createBooking, isPending } = useCreateBooking();
	const { data: services, isLoading: servicesLoading, isError: servicesError } = useServices(
		booking.property_id,
	);

	const availableServices = services ?? [];

	const handleServiceQuantityChange = useCallback((serviceId: string, quantity: number) => {
		setServiceQuantities((prev) => {
			if (quantity <= 0) {
				const next = { ...prev };
				delete next[serviceId];
				return next;
			}
			return { ...prev, [serviceId]: quantity };
		});
	}, []);

	const selectedServiceLines = useMemo(
		() =>
			availableServices
				.filter((service) => (serviceQuantities[service.id] ?? 0) > 0)
				.map((service) => ({
					id: service.id,
					name: service.name,
					quantity: serviceQuantities[service.id] ?? 0,
					lineTotal: service.price * (serviceQuantities[service.id] ?? 0),
				})),
		[availableServices, serviceQuantities],
	);

	const extrasTotal = useMemo(
		() => computeExtrasTotal(availableServices, serviceQuantities),
		[availableServices, serviceQuantities],
	);
	const grandTotal = booking.total_price + extrasTotal;

	const handlePay = async () => {
		if (!booking.property_id || !booking.check_in || !booking.check_out) {
			setError('Booking details are incomplete.');
			return;
		}
		if (!booking.first_name || !booking.last_name || !booking.email) {
			setError('Guest details are missing. Please go back and fill them in.');
			return;
		}
		setError(null);
		try {
			const selectedServices = buildSelectedServices(serviceQuantities);
			const result = await createBooking({
				property_id: booking.property_id,
				check_in: booking.check_in,
				check_out: booking.check_out,
				guests: booking.guests,
				guest: {
					first_name: booking.first_name,
					last_name: booking.last_name,
					email: booking.email,
					phone: booking.phone || undefined,
				},
				...(selectedServices.length > 0 ? { services: selectedServices } : {}),
			});
			router.push(`/bookings/${result.booking_id}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not complete booking.');
		}
	};

	return (
		<div className="min-h-screen bg-[#f7f5f2] px-4 py-8 sm:px-8">
			<div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
				<section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
					<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-camel">Confirm and pay</p>
					<h1 className="mt-3 font-serif text-3xl text-[#1A1A1A]">Payment method</h1>

					<div className="mt-8 space-y-4">
						<Input variant="compact" placeholder="Cardholder name" />
						<Input variant="compact" placeholder="Card number" />
						<div className="grid grid-cols-2 gap-3">
							<Input variant="compact" placeholder="MM/YY" />
							<Input variant="compact" placeholder="CVC" />
						</div>
						<Input variant="compact" placeholder="Country" />
					</div>

					<BookingServicesCard
						services={availableServices}
						isLoading={servicesLoading}
						isError={servicesError}
						quantities={serviceQuantities}
						onQuantityChange={handleServiceQuantityChange}
					/>

					{error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

					<Button
						type="button"
						variant="primarySm"
						className="mt-8 w-full"
						disabled={isPending}
						onClick={() => void handlePay()}
					>
						{isPending ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
					</Button>
				</section>

				<aside className="h-fit rounded-2xl bg-white p-6 shadow-sm sm:p-7">
					<h2 className="font-serif text-2xl text-[#1A1A1A]">Booking preview</h2>
					<div className="mt-5 space-y-3 text-sm text-[#1A1A1A]/75">
						<div className="flex justify-between gap-2">
							<span>Property</span>
							<span className="font-medium text-[#1A1A1A]">{booking.property_id || '-'}</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>Check in</span>
							<span className="font-medium text-[#1A1A1A]">{formatDisplayDate(booking.check_in)}</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>Check out</span>
							<span className="font-medium text-[#1A1A1A]">{formatDisplayDate(booking.check_out)}</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>Guests</span>
							<span className="font-medium text-[#1A1A1A]">{booking.guests}</span>
						</div>
						{servicesLoading ? (
							<p className="text-sm text-[#1A1A1A]/55">Loading extras…</p>
						) : servicesError ? (
							<p className="text-sm text-red-600">Could not load extras.</p>
						) : availableServices.length > 0 ? (
							<div className="space-y-2 border-t border-black/10 pt-3">
								<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-camel">
									Available extras
								</p>
								{availableServices.map((service) => (
									<div key={service.id} className="flex justify-between gap-2 text-sm">
										<span className="text-[#1A1A1A]/75">{service.name}</span>
										<span className="font-medium text-[#1A1A1A]">${service.price.toFixed(2)}</span>
									</div>
								))}
							</div>
						) : null}
						{selectedServiceLines.length > 0 ? (
							<div className="space-y-2 border-t border-black/10 pt-3">
								<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-camel">
									Selected extras
								</p>
								{selectedServiceLines.map((line) => (
									<div key={line.id} className="flex justify-between gap-2 text-sm">
										<span className="text-[#1A1A1A]/75">
											{line.name} × {line.quantity}
										</span>
										<span className="font-medium text-[#1A1A1A]">${line.lineTotal.toFixed(2)}</span>
									</div>
								))}
							</div>
						) : null}
						<div className="mt-3 space-y-2 border-t border-black/10 pt-3">
							<div className="flex justify-between gap-2">
								<span>Stay</span>
								<span className="font-medium text-[#1A1A1A]">${booking.total_price.toFixed(2)}</span>
							</div>
							{extrasTotal > 0 ? (
								<div className="flex justify-between gap-2">
									<span>Extras</span>
									<span className="font-medium text-[#1A1A1A]">${extrasTotal.toFixed(2)}</span>
								</div>
							) : null}
							<div className="flex justify-between gap-2">
								<span>Total</span>
								<span className="font-semibold text-[#1A1A1A]">${grandTotal.toFixed(2)}</span>
							</div>
						</div>
					</div>

					<Button
						type="button"
						variant="cardRow"
						className="mt-6 max-w-fit cursor-pointer flex items-center"
						disabled={isPending}
						onClick={() => router.back()}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						<span className="text-sm font-medium text-[#1A1A1A]">Back</span>
					</Button>
				</aside>
			</div>
		</div>
	);
}
