import { Suspense } from 'react';
import ConfirmAndPayContent from './confirm-and-pay-content';

export default function ConfirmAndPayPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#f9f8f6] px-4 py-8 sm:px-8">
					<div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-8 shadow-sm">
						<p className="text-sm text-[#1A1A1A]/60">Loading…</p>
					</div>
				</div>
			}
		>
			<ConfirmAndPayContent />
		</Suspense>
	);
}
