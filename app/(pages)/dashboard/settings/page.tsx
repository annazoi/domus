import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/app/(pages)/dashboard/_components/page-header';

const fields = [
	{ label: 'Profile name', placeholder: 'Zoian A.' },
	{ label: 'Business email', placeholder: 'host@hozya.com' },
	{ label: 'Brand color', placeholder: '#9a8570' },
	{ label: 'Domain', placeholder: 'stays.yourbrand.com' },
	{ label: 'Payout account', placeholder: '•••• 8743' },
];

export default function SettingsPage() {
	return (
		<div className="space-y-8">
			<PageHeader eyebrow="Settings" title="Account and brand controls" />

			<form className="space-y-5 dashboard-panel rounded-2xl p-6">
				{fields.map((field) => (
					<label key={field.label} className="block space-y-2">
						<span className="text-sm text-espresso/65">{field.label}</span>
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
