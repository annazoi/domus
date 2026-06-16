import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingStatus } from '@prisma/client';
import { Check, ChevronRight, MapPin } from 'lucide-react';
import { HomeGuideShareCard } from '@/components/bookings/home-guide-share-card';
import { tryConfirmBookingFromStripeSession } from '@/lib/integrations/stripe/booking-payment';
import { prisma } from '@/lib/prisma';

const PRIMARY_LINK_CLASS =
	'inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover';
const SECONDARY_LINK_CLASS =
	'inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-espresso transition hover:bg-dashboard-row-hover';

const bookingSelect = {
	id: true,
	check_in: true,
	check_out: true,
	guests: true,
	nights: true,
	total_price: true,
	currency: true,
	status: true,
	subtotal_accommodation: true,
	subtotal_extras: true,
	fees: true,
	discount_amount: true,
	created_at: true,
	host: {
		select: {
			host_name: true,
			first_name: true,
			last_name: true,
		},
	},
	property: {
		select: {
			id: true,
			title: true,
			slug: true,
			address: true,
			city: true,
			country: true,
			images: {
				where: { is_cover: true },
				take: 1,
				orderBy: { order: 'asc' },
				select: { document: { select: { url: true } } },
			},
		},
	},
	customer: {
		select: { first_name: true, last_name: true, email: true },
	},
	guest: {
		select: { first_name: true, last_name: true, email: true },
	},
	service_orders: {
		select: {
			id: true,
			quantity: true,
			unit_price: true,
			service: { select: { name: true } },
		},
		orderBy: { service: { name: 'asc' } },
	},
} as const;

function formatMoney(amount: number, currency: string) {
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency.toUpperCase(),
		}).format(amount);
	} catch {
		return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
	}
}

function formatDate(date: Date) {
	return date.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function diffNights(checkIn: Date, checkOut: Date) {
	const ms = checkOut.getTime() - checkIn.getTime();
	return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default async function BookingConfirmationPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ paid?: string }>;
}) {
	const { id } = await params;
	const { paid } = await searchParams;

	if (paid === '1') {
		await tryConfirmBookingFromStripeSession(id);
	}

	const booking = await prisma.booking.findUnique({
		where: { id },
		select: bookingSelect,
	});

	if (!booking) notFound();

	const justPaid = paid === '1';
	const isConfirmed = booking.status === BookingStatus.CONFIRMED;
	const isCancelled = booking.status === BookingStatus.CANCELLED;

	const nights = booking.nights ?? diffNights(booking.check_in, booking.check_out);
	const currency = booking.currency || 'eur';
	const total = Number(booking.total_price);
	const accommodation =
		booking.subtotal_accommodation !== null ? Number(booking.subtotal_accommodation) : null;
	const extras = booking.subtotal_extras !== null ? Number(booking.subtotal_extras) : null;
	const fees = booking.fees !== null ? Number(booking.fees) : null;
	const discount = booking.discount_amount !== null ? Number(booking.discount_amount) : null;

	const guestName = `${booking.customer.first_name} ${booking.customer.last_name}`.trim();
	const guestEmail = booking.customer.email || booking.guest.email;
	const coverImage = booking.property.images[0]?.document?.url ?? null;
	const locationParts = [booking.property.city, booking.property.country].filter(Boolean);

	const heading = isCancelled
		? 'This booking was cancelled'
		: isConfirmed
			? 'Booking confirmed'
			: justPaid
				? 'Payment received'
				: 'Booking summary';

	const subheading = isCancelled
		? 'This reservation is no longer active. If you believe this is a mistake, please contact your host.'
		: isConfirmed
			? 'Your reservation is all set. A confirmation has been sent to your email.'
			: justPaid
				? 'Thanks! We received your payment and are finalizing your reservation. This page will reflect the confirmation shortly.'
				: 'Here are the details of your reservation.';

	const serviceLines = booking.service_orders.map((order) => ({
		id: order.id,
		name: order.service.name,
		quantity: order.quantity,
		lineTotal: Number(order.unit_price) * order.quantity,
	}));

	return (
		<div className="min-h-screen bg-[#f7f5f2] px-4 py-8 sm:px-8">
			<div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
				<section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
					<div
						className={`flex h-14 w-14 items-center justify-center rounded-full ${
							isCancelled ? 'bg-red-50 text-red-600' : 'bg-camel/15 text-camel'
						}`}
					>
						<Check className="h-7 w-7" strokeWidth={2.5} />
					</div>

					<p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-camel">
						{isConfirmed ? 'Confirmed' : isCancelled ? 'Cancelled' : 'Reservation'}
					</p>
					<h1 className="mt-3 font-serif text-3xl text-[#1A1A1A]">{heading}</h1>
					<p className="mt-4 max-w-xl text-sm text-[#1A1A1A]/65">{subheading}</p>

					<dl className="mt-8 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">
						<div>
							<dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/45">
								Confirmation code
							</dt>
							<dd className="mt-1 font-mono text-sm uppercase text-[#1A1A1A]">
								{booking.id.slice(0, 8)}
							</dd>
						</div>
						<div>
							<dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/45">
								Guest
							</dt>
							<dd className="mt-1 text-sm text-[#1A1A1A]">{guestName || 'Guest'}</dd>
							{guestEmail ? (
								<dd className="text-sm text-[#1A1A1A]/55">{guestEmail}</dd>
							) : null}
						</div>
						<div>
							<dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/45">
								Check in
							</dt>
							<dd className="mt-1 text-sm text-[#1A1A1A]">{formatDate(booking.check_in)}</dd>
						</div>
						<div>
							<dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/45">
								Check out
							</dt>
							<dd className="mt-1 text-sm text-[#1A1A1A]">{formatDate(booking.check_out)}</dd>
						</div>
					</dl>

					{!isCancelled ? (
						<HomeGuideShareCard host={booking.host} bookingId={booking.id} className="mt-8" />
					) : null}

					<div className="mt-6 flex flex-col gap-3 sm:flex-row">
						<Link
							href={`/${encodeURIComponent(booking.property.slug)}`}
							className={isCancelled ? PRIMARY_LINK_CLASS : SECONDARY_LINK_CLASS}
						>
							View property
							<ChevronRight className="ml-1 h-4 w-4" />
						</Link>
						<Link href="/dashboard/trips" className={SECONDARY_LINK_CLASS}>
							My trips
						</Link>
					</div>
				</section>

				<aside className="h-fit rounded-2xl bg-white p-6 shadow-sm sm:p-7">
					{coverImage ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={coverImage}
							alt={booking.property.title}
							className="mb-5 h-40 w-full rounded-xl object-cover"
						/>
					) : null}

					<h2 className="font-serif text-2xl text-[#1A1A1A]">{booking.property.title}</h2>
					{locationParts.length > 0 ? (
						<p className="mt-2 flex items-center gap-1.5 text-sm text-[#1A1A1A]/60">
							<MapPin className="h-4 w-4" />
							{locationParts.join(', ')}
						</p>
					) : null}

					<div className="mt-5 space-y-3 border-t border-black/10 pt-5 text-sm text-[#1A1A1A]/75">
						<div className="flex justify-between gap-2">
							<span>
								{nights} {nights === 1 ? 'night' : 'nights'}
							</span>
							<span className="font-medium text-[#1A1A1A]">
								{accommodation !== null ? formatMoney(accommodation, currency) : '—'}
							</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>Guests</span>
							<span className="font-medium text-[#1A1A1A]">{booking.guests}</span>
						</div>

						{serviceLines.length > 0 ? (
							<div className="space-y-2 border-t border-black/10 pt-3">
								<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-camel">
									Extras
								</p>
								{serviceLines.map((line) => (
									<div key={line.id} className="flex justify-between gap-2">
										<span className="text-[#1A1A1A]/75">
											{line.name}
											{line.quantity > 1 ? ` × ${line.quantity}` : ''}
										</span>
										<span className="font-medium text-[#1A1A1A]">
											{formatMoney(line.lineTotal, currency)}
										</span>
									</div>
								))}
							</div>
						) : null}

						<div className="space-y-2 border-t border-black/10 pt-3">
							{extras !== null && extras > 0 ? (
								<div className="flex justify-between gap-2">
									<span>Extras</span>
									<span className="font-medium text-[#1A1A1A]">{formatMoney(extras, currency)}</span>
								</div>
							) : null}
							{fees !== null && fees > 0 ? (
								<div className="flex justify-between gap-2">
									<span>Fees</span>
									<span className="font-medium text-[#1A1A1A]">{formatMoney(fees, currency)}</span>
								</div>
							) : null}
							{discount !== null && discount > 0 ? (
								<div className="flex justify-between gap-2 text-[#1A1A1A]/75">
									<span>Discount</span>
									<span className="font-medium text-green-700">
										-{formatMoney(discount, currency)}
									</span>
								</div>
							) : null}
							<div className="flex justify-between gap-2 pt-1 text-base">
								<span className="font-medium text-[#1A1A1A]">Total paid</span>
								<span className="font-semibold text-[#1A1A1A]">{formatMoney(total, currency)}</span>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
