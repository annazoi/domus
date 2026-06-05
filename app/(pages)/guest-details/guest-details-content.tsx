'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { formatDisplayDate } from '@/features/property-availability/utils/date';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function GuestDetailsContent() {
	const router = useRouter();
	const params = useSearchParams();

	const booking = useMemo(
		() => ({
			property_id: params.get('property_id') ?? '',
			check_in: params.get('check_in') ?? '',
			check_out: params.get('check_out') ?? '',
			guests: Number(params.get('guests') ?? 1),
			total_price: Number(params.get('total_price') ?? 0),
		}),
		[params],
	);

	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
	const authFirstName = useAuthStore((state) => state.first_name);
	const authLastName = useAuthStore((state) => state.last_name);
	const authEmail = useAuthStore((state) => state.email);

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [error, setError] = useState<string | null>(
		params.get('cancelled') === '1' ? 'Payment was cancelled. You can try again when ready.' : null,
	);

	useEffect(() => {
		if (!isLoggedIn) return;
		if (authFirstName) setFirstName(authFirstName);
		if (authLastName) setLastName(authLastName);
		if (authEmail) setEmail(authEmail);
	}, [isLoggedIn, authFirstName, authLastName, authEmail]);

	const handleContinue = () => {
		const fn = firstName.trim();
		const ln = lastName.trim();
		const em = email.trim();
		const ph = phone.trim();

		if (!fn || !ln) {
			setError('First and last name are required.');
			return;
		}
		if (!EMAIL_RE.test(em)) {
			setError('A valid email is required.');
			return;
		}
		if (!booking.property_id) {
			setError('Missing property reference.');
			return;
		}
		setError(null);

		const qs = new URLSearchParams({
			property_id: booking.property_id,
			check_in: booking.check_in,
			check_out: booking.check_out,
			guests: String(booking.guests),
			total_price: String(booking.total_price),
			first_name: fn,
			last_name: ln,
			email: em,
		});
		if (ph) qs.set('phone', ph);

		router.push(`/confirm-and-pay?${qs.toString()}`);
	};

	return (
		<div className="min-h-screen bg-[#f9f8f6] px-4 py-8 sm:px-8">
			<div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
				<section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
					<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-camel">Step 1 of 2</p>
					<h1 className="mt-3 font-serif text-3xl text-[#1A1A1A]">Your details</h1>
					<p className="mt-2 text-sm text-[#1A1A1A]/65">
						Tell us a bit about yourself before continuing to payment.
					</p>

					<div className="mt-8 space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label className="block text-sm text-[#1A1A1A]/70">
								First name
								<Input
									variant="compact"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder="Jane"
									autoComplete="given-name"
									className="mt-1.5"
								/>
							</label>
							<label className="block text-sm text-[#1A1A1A]/70">
								Last name
								<Input
									variant="compact"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									placeholder="Doe"
									autoComplete="family-name"
									className="mt-1.5"
								/>
							</label>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label className="block text-sm text-[#1A1A1A]/70">
								Email
								<Input
									variant="compact"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="jane@example.com"
									autoComplete="email"
									readOnly={!!isLoggedIn}
									className="mt-1.5"
								/>
							</label>
							<label className="block text-sm text-[#1A1A1A]/70">
								Phone <span className="text-[#1A1A1A]/40">(optional)</span>
								<Input
									variant="compact"
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="+1 555 000 0000"
									autoComplete="tel"
									className="mt-1.5"
								/>
							</label>
						</div>
						{error ? <p className="text-sm text-red-600">{error}</p> : null}
					</div>

					<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
						<Button type="button" variant="cardRow" onClick={() => router.back()} className="cursor-pointer max-w-fit flex items-center mr-auto">
							<ArrowLeft className="mr-2 h-4 w-4" />
							<span className="text-sm font-medium text-[#1A1A1A]">Back</span>
						</Button>
						<Button type="button" variant="primarySm" onClick={handleContinue}>
							Continue to payment
						</Button>
					</div>
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
						<div className="mt-3 border-t border-black/10 pt-3">
							<div className="flex justify-between gap-2">
								<span>Total</span>
								<span className="font-semibold text-[#1A1A1A]">${booking.total_price}</span>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
