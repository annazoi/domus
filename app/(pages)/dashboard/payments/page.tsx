import { Suspense } from 'react';
import PaymentsContent from './_components/payments-content';

export default function PaymentsPage() {
	return (
		<Suspense fallback={<p className="text-sm text-[#1A1A1A]/55">Loading payout status…</p>}>
			<PaymentsContent />
		</Suspense>
	);
}
