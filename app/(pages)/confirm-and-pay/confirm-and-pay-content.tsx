'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { useCreateBooking } from '@/features/bookings/hooks/use-bookings';

function formatDate(value: string) {
	if (!value) return '-';
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

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
	const { mutateAsync: createBooking, isPending } = useCreateBooking();

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
					<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B705C]">Confirm and pay</p>
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

					{error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

					<Button
						type="button"
						variant="primarySm"
						className="mt-8 w-full"
						disabled={isPending}
						onClick={() => void handlePay()}
					>
						{isPending ? 'Processing...' : `Pay $${booking.total_price}`}
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
							<span className="font-medium text-[#1A1A1A]">{formatDate(booking.check_in)}</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>Check out</span>
							<span className="font-medium text-[#1A1A1A]">{formatDate(booking.check_out)}</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>Guests</span>
							<span className="font-medium text-[#1A1A1A]">{booking.guests}</span>
						</div>
						<div className="mt-3 border-t border-black/10 pt-3">
							<div className="flex justify-between gap-2">
								<span>Total</span>
								<span className="font-semibold text-[#1A1A1A]">${booking.total_price}</span>
							</div>
						</div>
					</div>

					<Button
						type="button"
						variant="cardRow"
						className="mt-6 w-full justify-center"
						disabled={isPending}
						onClick={() => router.back()}
					>
						Back
					</Button>
				</aside>
			</div>
		</div>
	);
}
