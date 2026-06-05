'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { useBookingQuote } from '@/features/bookings/hooks/use-booking-quote';
import { startBookingStripeCheckout } from '@/features/bookings/utils/start-booking-stripe-checkout';
import { useServices } from '@/features/services/hooks/use-services';
import { formatDisplayDate } from '@/features/property-availability/utils/date';
import BookingServicesCard, {
	buildSelectedServices,
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

	const [error, setError] = useState<string | null>(
		params.get('cancelled') === '1' ? 'Payment was cancelled. You can try again when ready.' : null,
	);
	const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>({});
	const [isPending, setIsPending] = useState(false);
	const { data: services, isLoading: servicesLoading, isError: servicesError } = useServices(
		booking.property_id,
	);

	const availableServices = useMemo(
		() => (services ?? []).filter((service) => service.active),
		[services],
	);

	const showExtrasSection =
		!servicesLoading && !servicesError && availableServices.length > 0;

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

	const selectedServices = useMemo(
		() => buildSelectedServices(serviceQuantities),
		[serviceQuantities],
	);

	const quoteEnabled = Boolean(
		booking.property_id && booking.check_in && booking.check_out && booking.guests > 0,
	);

	const {
		data: quote,
		isFetching: quoteLoading,
		isError: quoteError,
		error: quoteErrorObject,
	} = useBookingQuote(
		{
			property_id: booking.property_id,
			check_in: booking.check_in,
			check_out: booking.check_out,
			guests: booking.guests,
			services: showExtrasSection ? selectedServices : [],
		},
		quoteEnabled,
	);

	const snapshot = quote?.snapshot ?? null;
	const grandTotal = snapshot?.total ?? booking.total_price;
	const canPay = showExtrasSection
		? Boolean(snapshot) && !quoteLoading && !quoteError
		: !quoteLoading && !quoteError && (Boolean(snapshot) || booking.total_price > 0);

	const handlePay = useCallback(async () => {
		if (!booking.property_id || !booking.check_in || !booking.check_out) {
			setError('Booking details are incomplete.');
			return;
		}
		if (!booking.first_name || !booking.last_name || !booking.email) {
			setError('Guest details are missing. Please go back and fill them in.');
			return;
		}
		setError(null);
		setIsPending(true);
		try {
			await startBookingStripeCheckout({
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
		} catch (err) {
			setIsPending(false);
			setError(err instanceof Error ? err.message : 'Could not start checkout.');
		}
	}, [booking, selectedServices]);

	return (
		<div className="min-h-screen bg-[#f9f8f6] px-4 py-8 sm:px-8">
			<div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
				<section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
					<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-camel">Confirm and pay</p>
					<h1 className="mt-3 font-serif text-3xl text-[#1A1A1A]">Secure checkout</h1>
					<p className="mt-4 text-sm text-[#1A1A1A]/65">
						You will be redirected to Stripe to complete payment. Your card details are handled securely by
						Stripe.
					</p>

					{showExtrasSection ? (
						<BookingServicesCard
							services={availableServices}
							isLoading={servicesLoading}
							isError={servicesError}
							quantities={serviceQuantities}
							onQuantityChange={handleServiceQuantityChange}
						/>
					) : null}

					{error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
					{quoteError && !error ? (
						<p className="mt-4 text-sm text-red-600">
							{quoteErrorObject instanceof Error
								? quoteErrorObject.message
								: 'Could not load the latest price.'}
						</p>
					) : null}

					<Button
						type="button"
						variant="primarySm"
						className="mt-8 w-full"
						disabled={isPending || !canPay || servicesLoading}
						onClick={() => void handlePay()}
					>
						{isPending
							? 'Redirecting to Stripe…'
							: quoteLoading || servicesLoading
								? 'Updating price…'
								: `Pay €${grandTotal.toFixed(2)}`}
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
						{snapshot ? (
							<div className="space-y-2 border-t border-black/10 pt-3">
								<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-camel">
									Price breakdown
								</p>
								{snapshot.lines
									.filter((line) => line.amount !== 0)
									.map((line, index) => (
										<div
											key={`${line.reference_uuid ?? line.type}-${index}`}
											className="flex justify-between gap-2 text-sm"
										>
											<span className="text-[#1A1A1A]/75">
												{line.label}
												{line.quantity > 1 ? ` × ${line.quantity}` : ''}
											</span>
											<span className="font-medium text-[#1A1A1A]">€{line.amount.toFixed(2)}</span>
										</div>
									))}
							</div>
						) : quoteLoading ? (
							<p className="text-sm text-[#1A1A1A]/55">Calculating price…</p>
						) : null}
						<div className="mt-3 space-y-2 border-t border-black/10 pt-3">
							<div className="flex justify-between gap-2">
								<span>Total</span>
								<span className="font-semibold text-[#1A1A1A]">€{grandTotal.toFixed(2)}</span>
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
