import { ProfileViewer } from './_components/profile-viewer';

export default function ProfileViewPage() {
	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-camel">Profile</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">How guests see you.</h1>
				<p className="mt-3 max-w-2xl text-sm text-espresso/55">
					A read-only preview of your public host profile — the same view guests see, including contact details and
					listings.
				</p>
			</div>

			<ProfileViewer />
		</div>
	);
}
