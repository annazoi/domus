import { Button, Input } from '@/components/ui';

const fields = [
	{ label: 'Profile name', placeholder: 'Zoian A.' },
	{ label: 'Business email', placeholder: 'host@domus.com' },
	{ label: 'Brand color', placeholder: '#6B705C' },
	{ label: 'Domain', placeholder: 'stays.yourbrand.com' },
	{ label: 'Payout account', placeholder: '•••• 8743' },
];

export default function SettingsPage() {
	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs uppercase tracking-[0.2em] text-[#6B705C]">Settings</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight">Account and brand controls</h1>
			</div>

			<form className="space-y-5 rounded-2xl bg-white/80 p-6">
				{fields.map((field) => (
					<label key={field.label} className="block space-y-2">
						<span className="text-sm text-[#1A1A1A]/65">{field.label}</span>
						<Input variant="settings" type="text" placeholder={field.placeholder} />
					</label>
				))}

				<Button type="button" variant="primarySm">
					Save changes
				</Button>
			</form>
		</div>
	);
}
