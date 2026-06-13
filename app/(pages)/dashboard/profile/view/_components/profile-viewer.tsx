'use client';

import { type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Skeleton } from '@/components/ui';
import { useGetMe } from '@/features/user/hooks/use-user';
import {
	cloudinaryDisplayUrl,
	formatProfileMemberSince,
	profileInitials,
} from '../../_utils/profile-display';

const reveal = {
	initial: { opacity: 0, y: 14 },
	animate: { opacity: 1, y: 0 },
};

function DetailCard({
	label,
	value,
	icon,
	delay,
}: {
	label: string;
	value: string;
	icon: ReactNode;
	delay: number;
}) {
	return (
		<motion.div
			{...reveal}
			transition={{ duration: 0.34, delay, ease: [0.22, 1, 0.36, 1] }}
			className="profile-viewer-detail rounded-2xl border border-dashboard-border bg-dashboard-surface/80 p-5 backdrop-blur-sm"
		>
			<div className="flex items-start gap-3">
				<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-camel/12 text-camel">
					{icon}
				</span>
				<div className="min-w-0">
					<p className="text-[10px] font-medium uppercase tracking-[0.2em] text-espresso/40">{label}</p>
					<p className="mt-1 break-words text-sm text-espresso">{value}</p>
				</div>
			</div>
		</motion.div>
	);
}

export function ProfileViewer() {
	const { data: user, isLoading, isError } = useGetMe();

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-10 w-36 bg-black/8" />
				<div className="overflow-hidden rounded-[1.5rem] border border-dashboard-border">
					<Skeleton className="h-52 w-full rounded-none bg-black/8" />
					<div className="space-y-4 px-6 py-8">
						<Skeleton className="h-16 w-16 rounded-full bg-black/8" />
						<Skeleton className="h-10 w-56 bg-black/8" />
						<Skeleton className="h-24 w-full bg-black/6" />
					</div>
				</div>
			</div>
		);
	}

	if (isError || !user) {
		return (
			<div className="dashboard-panel rounded-2xl px-6 py-12 text-center">
				<p className="font-serif text-2xl text-espresso">Profile unavailable</p>
				<p className="mt-2 text-sm text-espresso/55">Sign in again or return to edit your profile.</p>
				<Link href="/dashboard/profile" className="mt-6 inline-block">
					<Button type="button" variant="secondary">
						Edit profile
					</Button>
				</Link>
			</div>
		);
	}

	const fullName = `${user.first_name} ${user.last_name}`.trim();
	const monogram = profileInitials(user.first_name, user.last_name);
	const bannerUrl = user.banner_url ? cloudinaryDisplayUrl(user.banner_url) : '';
	const avatarUrl = user.avatar_url ? cloudinaryDisplayUrl(user.avatar_url) : '';
	const memberSince = formatProfileMemberSince(user.created_at);

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<Link href="/dashboard/profile">
					<Button
						type="button"
						variant="ghostPill"
						className="group -ml-2 flex items-center gap-2 px-3 py-2 text-sm text-espresso/60 transition hover:text-espresso"
					>
						<ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
						Edit profile
					</Button>
				</Link>
				<span className="inline-flex items-center gap-2 rounded-full border border-camel/25 bg-camel/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-camel">
					<span className="h-1.5 w-1.5 rounded-full bg-camel" />
					Public preview
				</span>
			</div>

			<motion.article
				className="profile-viewer-shell overflow-hidden rounded-[1.5rem] border border-dashboard-border shadow-[var(--shadow-dashboard-panel)]"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
			>
				<div className="relative isolate min-h-[13rem] overflow-hidden sm:min-h-[15rem]">
					{bannerUrl ? (
						<Image src={bannerUrl} alt="" fill className="object-cover" unoptimized priority />
					) : (
						<div
							className="absolute inset-0"
							style={{
								background:
									'radial-gradient(ellipse 85% 70% at 20% 15%, color-mix(in srgb, var(--color-camel) 24%, transparent), transparent 68%), radial-gradient(ellipse 60% 55% at 90% 85%, color-mix(in srgb, var(--color-espresso) 12%, transparent), transparent 62%), linear-gradient(135deg, var(--color-dashboard-inset), var(--color-dashboard-bg))',
							}}
						/>
					)}
					<div className="profile-canvas-grain pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden />
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dashboard-panel via-dashboard-panel/20 to-transparent" />
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-camel/35 to-transparent" />
				</div>

				<div className="relative px-6 pb-8 pt-0 sm:px-10 sm:pb-10">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div className="flex min-w-0 items-end gap-5">
							<motion.div
								{...reveal}
								transition={{ duration: 0.36, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
								className="-mt-14 shrink-0 sm:-mt-16"
							>
								{avatarUrl ? (
									<div className="relative h-[5.75rem] w-[5.75rem] overflow-hidden rounded-full border-[3px] border-dashboard-panel shadow-[0_18px_50px_-18px_rgba(154,133,112,0.7)] sm:h-28 sm:w-28">
										<Image src={avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
									</div>
								) : (
									<div className="flex h-[5.75rem] w-[5.75rem] items-center justify-center rounded-full border-[3px] border-dashboard-panel bg-dashboard-surface font-serif text-3xl tracking-tight text-camel shadow-[0_18px_50px_-18px_rgba(154,133,112,0.7)] sm:h-28 sm:w-28">
										{monogram}
									</div>
								)}
							</motion.div>

							<motion.div
								{...reveal}
								transition={{ duration: 0.36, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
								className="min-w-0 pb-1"
							>
								<p className="text-[10px] font-medium uppercase tracking-[0.24em] text-camel">Host on Domus</p>
								<h1 className="mt-1 break-words font-serif text-4xl tracking-tight text-espresso sm:text-5xl">{fullName}</h1>
								<p className="mt-2 text-sm text-espresso/55">Member since {memberSince}</p>
							</motion.div>
						</div>

						<motion.div
							{...reveal}
							transition={{ duration: 0.36, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
							className="flex flex-wrap gap-2 lg:justify-end"
						>
							<span className="rounded-full border border-dashboard-border bg-dashboard-inset px-3 py-1.5 text-xs text-espresso/65">
								{user.email}
							</span>
							{user.phone ? (
								<span className="rounded-full border border-dashboard-border bg-dashboard-inset px-3 py-1.5 text-xs text-espresso/65">
									{user.phone}
								</span>
							) : null}
						</motion.div>
					</div>

					<motion.section
						{...reveal}
						transition={{ duration: 0.36, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
						className="profile-viewer-about mt-10 rounded-2xl border border-dashboard-border bg-dashboard-inset/50 px-6 py-7 sm:px-8"
					>
						<p className="text-[10px] font-medium uppercase tracking-[0.22em] text-espresso/40">About</p>
						{user.bio?.trim() ? (
							<p className="profile-viewer-bio mt-4 max-w-3xl font-serif text-xl leading-relaxed tracking-tight text-espresso sm:text-2xl">
								{user.bio}
							</p>
						) : (
							<p className="mt-4 text-sm italic text-espresso/45">
								No bio yet — add a short introduction on your profile to help guests get to know you.
							</p>
						)}
					</motion.section>

					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<DetailCard
							label="Email"
							value={user.email}
							icon={<Mail className="h-4 w-4" />}
							delay={0.32}
						/>
						{user.phone ? (
							<DetailCard
								label="Phone"
								value={user.phone}
								icon={<Phone className="h-4 w-4" />}
								delay={0.36}
							/>
						) : null}
						{user.vat_number ? (
							<DetailCard
								label="VAT"
								value={user.vat_number}
								icon={<Receipt className="h-4 w-4" />}
								delay={0.4}
							/>
						) : null}
						<DetailCard
							label="Joined"
							value={memberSince}
							icon={
								<span className="font-serif text-sm leading-none text-camel" aria-hidden>
									D
								</span>
							}
							delay={0.44}
						/>
					</div>
				</div>
			</motion.article>
		</div>
	);
}
