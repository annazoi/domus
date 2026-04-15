'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
	BarChart3,
	CalendarDays,
	ChevronLeft,
	CreditCard,
	Home,
	LayoutGrid,
	Menu,
	Settings,
	Wallet,
	Wrench,
	X,
} from 'lucide-react';

type NavItem = {
	label: string;
	href: string;
	icon: ReactNode;
};

const navItems: NavItem[] = [
	{ label: 'Overview', href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
	{ label: 'Properties', href: '/dashboard/properties', icon: <Home className="h-4 w-4" /> },
	{ label: 'Bookings', href: '/dashboard/bookings', icon: <BarChart3 className="h-4 w-4" /> },
	{ label: 'Calendar', href: '/dashboard/calendar', icon: <CalendarDays className="h-4 w-4" /> },
	{ label: 'Earnings', href: '/dashboard/earnings', icon: <Wallet className="h-4 w-4" /> },
	{ label: 'Website Builder', href: '/dashboard/website-builder', icon: <Wrench className="h-4 w-4" /> },
	{ label: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
	{ label: 'Subscription', href: '/dashboard/subscription', icon: <CreditCard className="h-4 w-4" /> },
];

const isItemActive = (pathname: string, href: string) =>
	href === '/dashboard' ? pathname === href : pathname.startsWith(href);

export function DashboardShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	return (
		<div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A]">
			<div className="mx-auto flex w-full max-w-[1600px]">
				<aside
					className={[
						'fixed inset-y-0 left-0 z-40 border-r border-black/5 bg-[#F7F5F2] px-3 py-6 transition-all duration-200',
						isCollapsed ? 'w-[84px]' : 'w-[250px]',
						isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
					].join(' ')}
				>
					<div className="flex items-center justify-between px-2">
						<div className={['font-serif text-2xl tracking-tight', isCollapsed ? 'hidden' : 'block'].join(' ')}>
							Domus
						</div>
						<button
							type="button"
							onClick={() => setIsCollapsed((value) => !value)}
							className="hidden rounded-md p-2 text-[#6B705C] transition hover:bg-black/5 md:inline-flex"
							aria-label="Collapse sidebar"
						>
							<ChevronLeft className={['h-4 w-4 transition', isCollapsed ? 'rotate-180' : 'rotate-0'].join(' ')} />
						</button>
						<button
							type="button"
							onClick={() => setIsMobileOpen(false)}
							className="rounded-md p-2 text-[#6B705C] transition hover:bg-black/5 md:hidden"
							aria-label="Close sidebar"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					<nav className="mt-8 space-y-1">
						{navItems.map((item) => {
							const active = isItemActive(pathname, item.href);

							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsMobileOpen(false)}
									className={[
										'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition duration-200',
										active ? 'bg-black/5 text-[#1A1A1A]' : 'text-[#1A1A1A]/65 hover:bg-black/3 hover:text-[#1A1A1A]',
										isCollapsed ? 'justify-center' : '',
									].join(' ')}
								>
									<span className={active ? 'text-[#6B705C]' : 'text-[#1A1A1A]/45'}>{item.icon}</span>
									<span className={isCollapsed ? 'hidden' : 'inline'}>{item.label}</span>
								</Link>
							);
						})}
					</nav>
				</aside>

				<div className={['w-full transition-all duration-200', isCollapsed ? 'md:ml-[84px]' : 'md:ml-[250px]'].join(' ')}>
					<header className="sticky top-0 z-30 flex h-16 items-center justify-between px-5 md:px-10">
						<button
							type="button"
							onClick={() => setIsMobileOpen(true)}
							className="inline-flex rounded-md p-2 text-[#6B705C] hover:bg-black/5 md:hidden"
							aria-label="Open sidebar"
						>
							<Menu className="h-4 w-4" />
						</button>

						<div className="ml-auto flex items-center gap-3">
							<span className="hidden rounded-full bg-[#6B705C]/10 px-3 py-1 text-xs font-medium text-[#6B705C] sm:inline-flex">
								Portfolio Plan
							</span>
							<button
								type="button"
								className="flex items-center gap-2 rounded-full bg-white/80 px-2 py-1.5 text-sm hover:bg-white"
							>
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#6B705C] text-xs font-semibold text-white">
									ZA
								</span>
								<span className="hidden pr-1 text-[#1A1A1A]/70 sm:inline">Account</span>
							</button>
						</div>
					</header>

					<main className="px-5 pb-14 pt-2 md:px-10">
						<div className="mx-auto w-full max-w-6xl">{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
}
