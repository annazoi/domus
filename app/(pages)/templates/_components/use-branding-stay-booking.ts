'use client';

import axios from 'axios';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import { ApiRoutes } from '@/config/api/routes';
import { useCheckAvailability } from '@/features/bookings/hooks/use-check-availability';
import { getAuthStoreState } from '@/store/auth';

export function startOfToday() {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
}

export function formatStay(d: Date) {
	return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function toDateParam(d: Date) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function dayStart(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function nightsPriced(checkIn: Date, checkOutExclusive: Date, allowed: Set<string>) {
	for (let c = dayStart(checkIn), end = dayStart(checkOutExclusive); c < end; c.setDate(c.getDate() + 1)) {
		if (!allowed.has(toDateParam(c))) return false;
	}
	return true;
}

export function useBrandingStayBooking({
	listingPreview,
	propertyRef,
	guestCap,
}: {
	listingPreview?: boolean;
	propertyRef: string;
	guestCap: number;
}) {
	const guestFieldId = useId();
	const stayPickerRef = useRef<HTMLDivElement>(null);
	const [stayRange, setStayRange] = useState<DateRange | undefined>();
	const [stayPickerOpen, setStayPickerOpen] = useState(false);
	const [guestCount, setGuestCount] = useState(1);
	const [checkingAvailability, setCheckingAvailability] = useState(false);
	const [availabilityMsg, setAvailabilityMsg] = useState<string | null>(null);
	const [availableForCheckout, setAvailableForCheckout] = useState(false);
	const [totalPrice, setTotalPrice] = useState<number | null>(null);
	const [allowedDateKeys, setAllowedDateKeys] = useState<Set<string>>(new Set());
	const todayStart = useMemo(() => startOfToday(), []);
	const checkAvailabilityMutation = useCheckAvailability();
	const router = useRouter();

	useEffect(() => {
		setGuestCount((c) => Math.min(guestCap, Math.max(1, c)));
	}, [guestCap]);

	useEffect(() => {
		if (!propertyRef) return;
		let cancelled = false;
		void (async () => {
			try {
				const qs = new URLSearchParams({ start: toDateParam(todayStart) });
				const headers: HeadersInit = {};
				const userId = getAuthStoreState().user_uuid;
				if (userId) headers['x-user-id'] = userId;
				const res = await fetch(`/api${ApiRoutes.properties.unavailableDays(propertyRef)}?${qs}`, { headers });
				if (!res.ok || cancelled) return;
				const json = (await res.json()) as { available_dates?: string[]; unavailable_dates?: string[] };
				if (cancelled) return;
				const allowed = new Set(json.available_dates ?? []);
				for (const date of json.unavailable_dates ?? []) {
					allowed.delete(date);
				}
				setAllowedDateKeys(allowed);
			} catch {
				if (!cancelled) setAllowedDateKeys(new Set());
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [propertyRef, todayStart]);

	const dayDisabled = useMemo(() => {
		return (day: Date) => {
			const d = dayStart(day);
			if (d.getTime() < todayStart.getTime()) return true;
			if (!propertyRef) return false;
			const from = stayRange?.from ? dayStart(stayRange.from) : null;
			const to = stayRange?.to ? dayStart(stayRange.to) : null;
			const key = toDateParam(day);
			if (!from) return !allowedDateKeys.has(key);
			if (!to) {
				if (d.getTime() < from.getTime()) return true;
				if (d.getTime() === from.getTime()) return !allowedDateKeys.has(key);
				return !nightsPriced(from, d, allowedDateKeys);
			}
			if (d.getTime() < from.getTime()) return true;
			if (d.getTime() === from.getTime()) return !allowedDateKeys.has(key);
			if (d.getTime() <= to.getTime()) {
				if (d.getTime() === to.getTime()) return !nightsPriced(from, d, allowedDateKeys);
				return !allowedDateKeys.has(key);
			}
			return !nightsPriced(from, d, allowedDateKeys);
		};
	}, [allowedDateKeys, propertyRef, todayStart, stayRange?.from, stayRange?.to]);

	useEffect(() => {
		if (!stayPickerOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			const el = stayPickerRef.current;
			if (el && !el.contains(e.target as Node)) setStayPickerOpen(false);
		};
		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	}, [stayPickerOpen]);

	const checkAvailabilityForDates = useCallback(
		async (from: Date, to: Date) => {
			if (!propertyRef) return;
			if (dayStart(to).getTime() <= dayStart(from).getTime()) return;
			setCheckingAvailability(true);
			setAvailabilityMsg(null);
			try {
				const result = await checkAvailabilityMutation.mutateAsync({
					property_id: propertyRef,
					check_in: toDateParam(from),
					check_out: toDateParam(to),
					guests: guestCount,
				});
				const available = Boolean(result.isAvailable);
				const total = typeof result.totalPrice === 'number' ? result.totalPrice : null;
				setAvailableForCheckout(available);
				setTotalPrice(total);
				setAvailabilityMsg(
					available
						? `Available${total !== null ? ` · $${total}` : ''}`
						: 'Not available for these dates.',
				);
				return { available, total };
			} catch (error) {
				setAvailableForCheckout(false);
				setTotalPrice(null);
				const message =
					axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
						? error.response.data.message
						: 'Could not check availability.';
				setAvailabilityMsg(message);
			} finally {
				setCheckingAvailability(false);
			}
		},
		[propertyRef, guestCount, checkAvailabilityMutation],
	);

	const handleReserveClick = async () => {
		if (!stayRange?.from || !stayRange?.to) return;
		const result = await checkAvailabilityForDates(stayRange.from, stayRange.to);
		if (!result?.available) return;
		const qs = new URLSearchParams({
			property_id: propertyRef,
			check_in: toDateParam(stayRange.from),
			check_out: toDateParam(stayRange.to),
			guests: String(guestCount),
			total_price: String(result.total ?? 0),
		});
		router.push(`/guest-details?${qs.toString()}`);
	};

	const clearStayRange = useCallback(() => {
		setStayRange(undefined);
		setAvailabilityMsg(null);
		setAvailableForCheckout(false);
		setTotalPrice(null);
		setCheckingAvailability(false);
	}, []);

	return {
		guestFieldId,
		stayPickerRef,
		stayRange,
		setStayRange,
		stayPickerOpen,
		setStayPickerOpen,
		guestCount,
		setGuestCount,
		checkingAvailability,
		availabilityMsg,
		availableForCheckout,
		totalPrice,
		dayDisabled,
		checkAvailabilityForDates,
		handleReserveClick,
		clearStayRange,
	};
}
