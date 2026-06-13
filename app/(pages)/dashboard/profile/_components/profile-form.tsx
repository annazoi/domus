'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Skeleton, Textarea, useToast } from '@/components/ui';
import {
	useDeleteUserAvatar,
	useDeleteUserBanner,
	useGetMe,
	useUpdateUser,
	useUploadUserAvatar,
	useUploadUserBanner,
} from '@/features/user/hooks/use-user';
import type { UpdateUserDto, User } from '@/features/user/interfaces/user.interface';
import { useAuthStore } from '@/store/auth';
import { ProfileVisualIdentity } from './profile-visual-identity';

type ProfileFormState = {
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	vat_number: string;
	bio: string;
};

function toFormState(user: User): ProfileFormState {
	return {
		first_name: user.first_name,
		last_name: user.last_name,
		email: user.email,
		phone: user.phone ?? '',
		vat_number: user.vat_number ?? '',
		bio: user.bio ?? '',
	};
}

function toPayload(form: ProfileFormState): UpdateUserDto {
	const optional = (value: string) => {
		const trimmed = value.trim();
		return trimmed ? trimmed : null;
	};

	return {
		first_name: form.first_name.trim(),
		last_name: form.last_name.trim(),
		email: form.email.trim(),
		phone: optional(form.phone),
		vat_number: optional(form.vat_number),
		bio: optional(form.bio),
	};
}

function initials(first: string, last: string) {
	const a = first.trim().charAt(0);
	const b = last.trim().charAt(0);
	return (a + b).toUpperCase() || '?';
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="block">
			<span className="text-xs font-medium uppercase tracking-[0.14em] text-espresso/45">{label}</span>
			<div className="mt-1.5">{children}</div>
		</label>
	);
}

function SectionHeading({ title, description }: { title: string; description: string }) {
	return (
		<div className="border-b border-dashboard-border pb-4">
			<h3 className="font-serif text-xl tracking-tight text-espresso">{title}</h3>
			<p className="mt-1 text-sm text-espresso/55">{description}</p>
		</div>
	);
}

export function ProfileForm() {
	const { push } = useToast();
	const updateAuthUser = useAuthStore((state) => state.updateUser);
	const { data: user, isLoading, isError } = useGetMe();
	const { mutateAsync: saveProfile, isPending: saving } = useUpdateUser();
	const { mutateAsync: uploadAvatar, isPending: uploadingAvatar } = useUploadUserAvatar();
	const { mutateAsync: deleteAvatar, isPending: deletingAvatar } = useDeleteUserAvatar();
	const { mutateAsync: uploadBanner, isPending: uploadingBanner } = useUploadUserBanner();
	const { mutateAsync: deleteBanner, isPending: deletingBanner } = useDeleteUserBanner();
	const [form, setForm] = useState<ProfileFormState | null>(null);

	useEffect(() => {
		if (user) setForm(toFormState(user));
	}, [user]);

	const monogram = useMemo(() => {
		if (!form) return '?';
		return initials(form.first_name, form.last_name);
	}, [form]);

	const setField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
		setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!user || !form) return;

		const payload = toPayload(form);
		if (!payload.first_name || !payload.last_name || !payload.email) {
			push({ title: 'First name, last name, and email are required.', tone: 'error' });
			return;
		}

		try {
			const updated = await saveProfile({ uuid: user.uuid, input: payload });
			updateAuthUser({
				first_name: updated.first_name,
				last_name: updated.last_name,
				email: updated.email,
				vat_number: updated.vat_number,
			});
			setForm(toFormState(updated));
			push({ title: 'Profile updated', tone: 'success' });
		} catch {
			push({ title: 'Could not update profile', tone: 'error' });
		}
	};

	if (isLoading || !user || !form) {
		return (
			<div className="space-y-6">
				<div className="dashboard-panel overflow-hidden rounded-2xl">
					<Skeleton className="h-44 w-full rounded-none bg-black/8" />
					<div className="space-y-4 px-5 py-6 sm:px-8">
						<Skeleton className="h-8 w-48 bg-black/8" />
						<Skeleton className="h-4 w-64 bg-black/6" />
					</div>
				</div>
				<div className="dashboard-panel space-y-4 rounded-2xl px-5 py-6 sm:px-8">
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton key={index} className="h-12 w-full bg-black/6" />
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="dashboard-panel rounded-2xl px-5 py-10 text-center sm:px-8">
				<p className="font-serif text-2xl text-espresso">Could not load your profile</p>
				<p className="mt-2 text-sm text-espresso/55">Refresh the page or sign in again.</p>
			</div>
		);
	}

	return (
		<motion.div
			className="space-y-6"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
		>
			<ProfileVisualIdentity
				firstName={form.first_name}
				lastName={form.last_name}
				email={form.email}
				memberSince={user.created_at}
				monogram={monogram}
				avatarUrl={user.avatar_url ?? null}
				bannerUrl={user.banner_url ?? null}
				uploadingAvatar={uploadingAvatar}
				deletingAvatar={deletingAvatar}
				uploadingBanner={uploadingBanner}
				deletingBanner={deletingBanner}
				onUploadAvatar={uploadAvatar}
				onDeleteAvatar={deleteAvatar}
				onUploadBanner={uploadBanner}
				onDeleteBanner={deleteBanner}
			/>

			<form className="dashboard-panel rounded-2xl px-5 py-6 sm:px-8 md:py-8" onSubmit={handleSubmit}>
				<div className="space-y-10">
					<section className="space-y-5">
						<SectionHeading title="Identity" description="How your name appears across Domus." />
						<div className="grid gap-5 sm:grid-cols-2">
							<Field label="First name">
								<Input
									value={form.first_name}
									onChange={(event) => setField('first_name', event.target.value)}
									placeholder="First name"
									required
								/>
							</Field>
							<Field label="Last name">
								<Input
									value={form.last_name}
									onChange={(event) => setField('last_name', event.target.value)}
									placeholder="Last name"
									required
								/>
							</Field>
							<div className="sm:col-span-2">
								<Field label="Bio">
									<Textarea
										value={form.bio}
										onChange={(event) => setField('bio', event.target.value)}
										placeholder="A short note about you or your hosting style…"
										rows={4}
									/>
								</Field>
							</div>
						</div>
					</section>

					<section className="space-y-5">
						<SectionHeading title="Contact" description="Where guests and Domus can reach you." />
						<div className="grid gap-5 sm:grid-cols-2">
							<div className="sm:col-span-2">
								<Field label="Email">
									<Input
										type="email"
										value={form.email}
										onChange={(event) => setField('email', event.target.value)}
										placeholder="you@example.com"
										required
									/>
								</Field>
							</div>
							<Field label="Phone">
								<Input
									value={form.phone}
									onChange={(event) => setField('phone', event.target.value)}
									placeholder="+1 555 000 0000"
								/>
							</Field>
						</div>
					</section>

					<section className="space-y-5">
						<SectionHeading title="Business" description="Optional details for invoices and payouts." />
						<div className="grid gap-5 sm:grid-cols-2">
							<Field label="VAT number">
								<Input
									value={form.vat_number}
									onChange={(event) => setField('vat_number', event.target.value)}
									placeholder="Optional"
								/>
							</Field>
						</div>
					</section>
				</div>

				<div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-dashboard-border pt-6">
					<Button type="submit" variant="primary" disabled={saving}>
						{saving ? 'Saving…' : 'Save changes'}
					</Button>
				</div>
			</form>
		</motion.div>
	);
}
