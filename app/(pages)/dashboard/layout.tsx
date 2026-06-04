import type { ReactNode } from 'react';
import './dashboard-theme.css';
import { DashboardShell } from '@/app/(pages)/dashboard/_components/dashboard-shell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return <DashboardShell>{children}</DashboardShell>;
}
