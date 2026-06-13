import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui';
import { ProfileForm } from './_components/profile-form';

export default function ProfilePage() {
	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-camel">Profile</p>
					<h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">Your details, kept current.</h1>
					<p className="mt-3 max-w-2xl text-sm text-espresso/55">
						Update your name, contact information, and business details. Changes apply across your Domus account.
					</p>
				</div>
				<Link href="/dashboard/profile/view">
					<Button type="button" variant="secondary" className="inline-flex items-center gap-2">
						<Eye className="h-4 w-4" />
						View profile
					</Button>
				</Link>
			</div>

			<ProfileForm />
		</div>
	);
}
