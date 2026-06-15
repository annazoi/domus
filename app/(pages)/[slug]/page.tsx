import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { homeGuidePath, resolveHostGuideSlug } from '@/lib/bookings/home-guide-path';
import { getHomeGuideDataByBookingId } from '@/lib/bookings/home-guide-data';
import { HomeGuideView } from './_components/home-guide-view';
import SlugPageClient from './slug-page-client';

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ booking?: string }>;
}): Promise<Metadata> {
	const { booking: bookingId } = await searchParams;
	if (!bookingId) return {};
	const data = await getHomeGuideDataByBookingId(bookingId);
	if (!data) return { title: 'Your Home Guide' };
	return {
		title: `Your Home Guide · ${data.property.title}`,
		description: `Everything you need for your stay at ${data.property.title}.`,
	};
}

export default async function SlugPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ booking?: string }>;
}) {
	const { slug } = await params;
	const { booking: bookingId } = await searchParams;

	if (bookingId) {
		const data = await getHomeGuideDataByBookingId(bookingId);
		if (!data) notFound();

		const canonicalSlug = resolveHostGuideSlug(data.host).toLowerCase();
		if (slug.trim().toLowerCase() !== canonicalSlug) {
			redirect(homeGuidePath(canonicalSlug, bookingId));
		}

		return <HomeGuideView data={data} />;
	}

	return <SlugPageClient />;
}
