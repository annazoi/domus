import { getAppUrl } from '@/lib/integrations/stripe/urls';
import { homeGuidePathFromHost } from '@/lib/bookings/home-guide-path';
import { getEmailFromAddress, getResendClient, isEmailConfigured } from '@/lib/email/resend-client';
import { prisma } from '@/lib/prisma';

const bookingEmailSelect = {
	id: true,
	check_in: true,
	check_out: true,
	guests: true,
	nights: true,
	total_price: true,
	currency: true,
	host: {
		select: {
			email: true,
			first_name: true,
			last_name: true,
			host_name: true,
		},
	},
	property: {
		select: {
			title: true,
			address: true,
			city: true,
			country: true,
		},
	},
	customer: {
		select: { first_name: true, last_name: true, email: true },
	},
	guest: {
		select: { email: true },
	},
} as const;

type BookingEmailData = NonNullable<Awaited<ReturnType<typeof loadBookingEmailData>>>;

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

function locationLabel(property: BookingEmailData['property']) {
	return [property.address, property.city, property.country].filter(Boolean).join(', ');
}

function guestName(booking: BookingEmailData) {
	return `${booking.customer.first_name} ${booking.customer.last_name}`.trim();
}

function guestEmail(booking: BookingEmailData) {
	return booking.customer.email || booking.guest.email;
}

function hostName(booking: BookingEmailData) {
	return `${booking.host.first_name} ${booking.host.last_name}`.trim();
}

function emailShell(title: string, body: string) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Georgia,'Times New Roman',serif;color:#3d3229;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5f2;padding:32px 16px;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(184,151,117,0.25);border-radius:16px;overflow:hidden;">
<tr>
<td style="padding:28px 28px 8px;">
<p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#b89775;">Domus</p>
<h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:400;color:#3d3229;">${title}</h1>
</td>
</tr>
<tr>
<td style="padding:8px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:rgba(61,50,41,0.82);">
${body}
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function detailRow(label: string, value: string) {
	return `<tr>
<td style="padding:10px 0;border-bottom:1px solid rgba(61,50,41,0.08);font-size:13px;color:rgba(61,50,41,0.55);width:38%;vertical-align:top;">${label}</td>
<td style="padding:10px 0;border-bottom:1px solid rgba(61,50,41,0.08);font-size:14px;color:#3d3229;vertical-align:top;">${value}</td>
</tr>`;
}

function buttonLink(href: string, label: string) {
	return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 20px;border-radius:999px;background:#b89775;color:#faf9f6;text-decoration:none;font-size:14px;font-weight:600;">${label}</a>`;
}

function buildGuestEmailHtml(booking: BookingEmailData, baseUrl: string) {
	const nights = booking.nights ?? diffNights(booking.check_in, booking.check_out);
	const total = formatMoney(Number(booking.total_price), booking.currency);
	const location = locationLabel(booking.property);
	const confirmationUrl = `${baseUrl}/bookings/${booking.id}`;
	const homeGuideUrl = `${baseUrl}${homeGuidePathFromHost(booking.host, booking.id)}`;

	const body = `
<p style="margin:0 0 18px;">Hi ${guestName(booking)},</p>
<p style="margin:0 0 18px;">Your reservation at <strong>${booking.property.title}</strong> is confirmed. Here are your stay details:</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 8px;">
${detailRow('Check-in', formatDate(booking.check_in))}
${detailRow('Check-out', formatDate(booking.check_out))}
${detailRow('Guests', String(booking.guests))}
${detailRow('Nights', String(nights))}
${detailRow('Total', total)}
${location ? detailRow('Location', location) : ''}
${detailRow('Host', hostName(booking))}
</table>
<p style="margin:18px 0 0;">Use your home guide for check-in details, amenities, and house rules.</p>
${buttonLink(homeGuideUrl, 'Open home guide')}
<p style="margin:18px 0 0;font-size:13px;color:rgba(61,50,41,0.55);">You can also view your full booking summary <a href="${confirmationUrl}" style="color:#8b6b4d;">here</a>.</p>`;

	return emailShell('Booking confirmed', body);
}

function buildHostEmailHtml(booking: BookingEmailData, baseUrl: string) {
	const nights = booking.nights ?? diffNights(booking.check_in, booking.check_out);
	const total = formatMoney(Number(booking.total_price), booking.currency);
	const location = locationLabel(booking.property);
	const dashboardUrl = `${baseUrl}/dashboard/bookings`;
	const homeGuideUrl = `${baseUrl}${homeGuidePathFromHost(booking.host, booking.id)}`;

	const body = `
<p style="margin:0 0 18px;">Hi ${hostName(booking)},</p>
<p style="margin:0 0 18px;">You have a new confirmed booking for <strong>${booking.property.title}</strong>.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 8px;">
${detailRow('Guest', guestName(booking))}
${detailRow('Guest email', guestEmail(booking))}
${detailRow('Check-in', formatDate(booking.check_in))}
${detailRow('Check-out', formatDate(booking.check_out))}
${detailRow('Guests', String(booking.guests))}
${detailRow('Nights', String(nights))}
${detailRow('Total', total)}
${location ? detailRow('Location', location) : ''}
</table>
<p style="margin:18px 0 0;">Share the home guide with your guest so they can access stay details and your contact info.</p>
${buttonLink(homeGuideUrl, 'Open home guide')}
<p style="margin:18px 0 0;font-size:13px;color:rgba(61,50,41,0.55);">Manage this booking in your <a href="${dashboardUrl}" style="color:#8b6b4d;">dashboard</a>.</p>`;

	return emailShell('New booking confirmed', body);
}

async function loadBookingEmailData(bookingId: string) {
	return prisma.booking.findUnique({
		where: { id: bookingId },
		select: bookingEmailSelect,
	});
}

export async function sendBookingConfirmationEmails(bookingId: string) {
	if (!isEmailConfigured()) {
		console.warn('RESEND_API_KEY is not configured; skipping booking confirmation emails.');
		return;
	}

	const booking = await loadBookingEmailData(bookingId);
	if (!booking) return;

	const guestTo = guestEmail(booking);
	const hostTo = booking.host.email;
	if (!guestTo && !hostTo) return;

	const baseUrl = getAppUrl();
	const resend = getResendClient();
	const from = getEmailFromAddress();
	const propertyTitle = booking.property.title;

	const sends: Promise<unknown>[] = [];

	if (guestTo) {
		sends.push(
			resend.emails.send({
				from,
				to: guestTo,
				subject: `Booking confirmed — ${propertyTitle}`,
				html: buildGuestEmailHtml(booking, baseUrl),
			}),
		);
	}

	if (hostTo) {
		sends.push(
			resend.emails.send({
				from,
				to: hostTo,
				subject: `New booking confirmed — ${propertyTitle}`,
				html: buildHostEmailHtml(booking, baseUrl),
			}),
		);
	}

	const results = await Promise.allSettled(sends);
	for (const result of results) {
		if (result.status === 'rejected') {
			console.error(`Failed to send booking confirmation email for ${bookingId}:`, result.reason);
		}
	}
}
