'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Check, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/components/ui';
import { homeGuidePathFromHost } from '@/lib/bookings/home-guide-path';

type HomeGuideHost = {
	host_name?: string | null;
	first_name: string;
	last_name: string;
};

type HomeGuideShareCardProps = {
	host: HomeGuideHost;
	bookingId: string;
	variant?: 'guest' | 'host';
	className?: string;
};

export function HomeGuideShareCard({
	host,
	bookingId,
	variant = 'guest',
	className,
}: HomeGuideShareCardProps) {
	const path = homeGuidePathFromHost(host, bookingId);
	const [fullUrl, setFullUrl] = useState(path);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		setFullUrl(`${window.location.origin}${path}`);
	}, [path]);

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	const isHost = variant === 'host';

	return (
		<div
			className={cn(
				'overflow-hidden rounded-2xl border border-camel/20 bg-gradient-to-br from-camel/10 via-white to-[#f7f5f2]/80',
				className,
			)}
		>
			<div className="relative px-5 py-5 sm:px-6 sm:py-6">
				<div
					className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-camel/10 blur-2xl"
					aria-hidden
				/>
				<div className="relative">
					<div className="flex items-start gap-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-camel/15 text-camel-dark ring-1 ring-camel/20">
							<BookOpen className="h-4 w-4" aria-hidden />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-camel">
								{isHost ? 'Guest home guide' : 'Your home guide'}
							</p>
							<p className="mt-1 font-serif text-xl tracking-tight text-espresso">
								{isHost ? 'Share stay details with your guest' : 'Everything for your stay'}
							</p>
							<p className="mt-2 max-w-lg text-sm leading-relaxed text-espresso/60">
								{isHost
									? 'Send this link so your guest can access check-in info, amenities, rules, and your contact details.'
									: 'Access codes, check-in details, amenities, house rules, and your host’s contact info.'}
							</p>
						</div>
					</div>

					<div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
						<div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-black/8 bg-white/80 px-3 py-2.5 ring-1 ring-black/[0.03]">
							<p className="min-w-0 flex-1 truncate font-mono text-xs text-espresso/70 sm:text-[13px]">{fullUrl}</p>
							<button
								type="button"
								onClick={copyLink}
								className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-espresso/70 transition hover:bg-camel/10 hover:text-camel-dark"
								aria-label="Copy home guide link"
							>
								{copied ? <Check className="h-3.5 w-3.5 text-camel" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
								{copied ? 'Copied' : 'Copy'}
							</button>
						</div>
						<Link
							href={path}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-camel px-4 py-2.5 text-sm font-medium text-white transition hover:bg-camel-dark sm:shrink-0"
						>
							Open guide
							<ExternalLink className="h-3.5 w-3.5" aria-hidden />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
