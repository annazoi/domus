import { Euro } from 'lucide-react';
import { cn } from '@/components/ui';

function formatCustomerSpentAmount(amount: number) {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

export { formatCustomerSpentAmount };

type CustomerTotalSpentProps = {
	amount: number;
	className?: string;
	iconClassName?: string;
};

export function CustomerTotalSpent({ amount, className, iconClassName }: CustomerTotalSpentProps) {
	if (!Number.isFinite(amount)) {
		return <span className={className}>— spent</span>;
	}

	return (
		<span className={cn('inline-flex items-center gap-1.5', className)}>
			<Euro className={cn('h-3.5 w-3.5 shrink-0', iconClassName)} aria-hidden />
			<span>{formatCustomerSpentAmount(amount)} spent</span>
		</span>
	);
}
