'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/** `/properties/new` uses a full-screen overlay; fading the whole page delayed dim vs shell (outside template). */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const instant = pathname === '/dashboard/properties/new';
	if (instant) {
		return (
			<div className="min-h-0" key={pathname}>
				{children}
			</div>
		);
	}
	return (
		<motion.div
			key={pathname}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.16, ease: 'easeOut' }}
			className="min-h-0"
		>
			{children}
		</motion.div>
	);
}
