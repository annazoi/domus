'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from 'react';
import {
	BarChart3,
	CalendarDays,
	ChevronLeft,
	CircleUser,
	CreditCard,
	Home,
	LayoutGrid,
	LogOut,
	Luggage,
	Menu,
	MessageCircle,
	Repeat,
	Settings,
	Users,
	Wallet,
	Wrench,
	X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { useDashboardThemeStore } from '@/store/dashboard-theme';
import { ThemeToggle } from './theme-toggle';

type NavItem = {
	label: string;
	href: string;
	icon: ReactNode;
};

const navGroups: { label: string; items: NavItem[] }[] = [
	{
		label: 'Workspace',
		items: [
			{ label: 'Overview', href: '/dashboard', icon: <LayoutGrid className="h-[18px] w-[18px]" /> },
			{ label: 'Properties', href: '/dashboard/properties', icon: <Home className="h-[18px] w-[18px]" /> },
			{ label: 'Bookings', href: '/dashboard/bookings', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
			{ label: 'Calendar', href: '/dashboard/calendar', icon: <CalendarDays className="h-[18px] w-[18px]" /> },
			{ label: 'Customers', href: '/dashboard/customers', icon: <Users className="h-[18px] w-[18px]" /> },
		],
	},
	{
		label: 'Business',
		items: [
			{ label: 'Services', href: '/dashboard/services', icon: <Wrench className="h-[18px] w-[18px]" /> },
			{ label: 'Earnings', href: '/dashboard/earnings', icon: <Wallet className="h-[18px] w-[18px]" /> },
			{ label: 'Payments', href: '/dashboard/payments', icon: <CreditCard className="h-[18px] w-[18px]" /> },
			{ label: 'Subscription', href: '/dashboard/subscription', icon: <Repeat className="h-[18px] w-[18px]" /> },
		],
	},
	{
		label: 'Account',
		items: [
			{ label: 'My trips', href: '/dashboard/trips', icon: <Luggage className="h-[18px] w-[18px]" /> },
			{ label: 'Profile', href: '/dashboard/profile', icon: <CircleUser className="h-[18px] w-[18px]" /> },
		],
	},
];

const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

const isItemActive = (pathname: string, href: string) =>
	href === '/dashboard' ? pathname === href : pathname.startsWith(href);

const navSpring = { type: 'spring' as const, stiffness: 420, damping: 34 };

const pageTransition = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -6 },
	transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

const overlayRoutes = ['/dashboard/properties/new'] as const;

const isOverlayRoute = (pathname: string) =>
	overlayRoutes.some((route) => pathname === route);

const DashboardPageIntroContext = createContext<Dispatch<SetStateAction<ReactNode | null>> | null>(null);

export function useSetDashboardPageIntro() {
	const setIntro = useContext(DashboardPageIntroContext);
	return setIntro ?? ((_value: ReactNode | null) => {});
}

export function DashboardShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const logout = useAuthStore((state) => state.logout);
	const firstName = useAuthStore((state) => state.first_name);
	const lastName = useAuthStore((state) => state.last_name);
	const email = useAuthStore((state) => state.email);
	const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Host';
	const initials = ((firstName?.[0] ?? '') + (lastName?.[0] ?? '') || 'H').toUpperCase();
	const theme = useDashboardThemeStore((state) => state.theme);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [pageIntro, setPageIntro] = useState<ReactNode | null>(null);
	const [scrolled, setScrolled] = useState(false);

	const activeNav = navItems.find((item) => isItemActive(pathname, item.href));
	const mobileTitle = activeNav?.label ?? 'Dashboard';

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 16);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = isMobileOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isMobileOpen]);

	useEffect(() => {
		document.documentElement.dataset.dashboardTheme = theme;
		return () => {
			delete document.documentElement.dataset.dashboardTheme;
		};
	}, [theme]);

	const openMobileNav = () => setIsMobileOpen(true);

	return (
		<div
			className="dashboard-root min-h-screen bg-dashboard-bg text-espresso transition-colors duration-300"
			data-theme={theme}
		>
			{isMobileOpen ? (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-[color:var(--color-dashboard-overlay)] backdrop-blur-[2px] md:hidden"
					onClick={() => setIsMobileOpen(false)}
					aria-label="Close sidebar"
				/>
			) : null}

			<div className="flex w-full">
				<aside
					className={[
						'dashboard-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-dashboard-border px-3 py-6 transition-all duration-300',
						isCollapsed ? 'w-[84px]' : 'w-[250px]',
						isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
					].join(' ')}
				>
					<div className="flex items-center justify-between px-2">
						<Link
							href="/"
							aria-label="Hozya"
							className={['font-serif text-3xl tracking-tight text-espresso', isCollapsed ? 'hidden' : 'block'].join(' ')}
						>
							Hozya<span className="text-camel">.</span>
						</Link>
						<Button
							type="button"
							variant="ghostIcon"
							onClick={() => setIsCollapsed((value) => !value)}
							className="hidden md:inline-flex"
							aria-label="Collapse sidebar"
						>
							<ChevronLeft className={['h-4 w-4 transition', isCollapsed ? 'rotate-180' : 'rotate-0'].join(' ')} />
						</Button>
						<Button
							type="button"
							variant="ghostIcon"
							onClick={() => setIsMobileOpen(false)}
							className="md:hidden"
							aria-label="Close sidebar"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					<nav className="mt-8 flex-1 space-y-6 overflow-y-auto pb-6">
						{navGroups.map((group) => (
							<div key={group.label}>
								{!isCollapsed ? (
									<p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-dashboard-muted/80">
										{group.label}
									</p>
								) : (
									<div className="mx-3 mb-2 h-px bg-dashboard-border" />
								)}
								<div className="space-y-0.5">
									{group.items.map((item) => {
										const active = isItemActive(pathname, item.href);
										return (
											<Link
												key={item.href}
												href={item.href}
												title={isCollapsed ? item.label : undefined}
												onClick={() => setIsMobileOpen(false)}
												className={[
													'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200',
													active ? 'font-semibold text-camel' : 'text-dashboard-muted hover:text-espresso',
													isCollapsed ? 'justify-center' : '',
												].join(' ')}
											>
												{active ? (
													<motion.span
														layoutId="dashboard-nav-active"
														className="absolute inset-0 rounded-lg bg-[color:var(--color-dashboard-nav-active)]"
														transition={navSpring}
													/>
												) : null}
												{active && !isCollapsed ? (
													<span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-camel" />
												) : null}
												<span className="relative z-10 flex items-center gap-3">
													<span className={active ? 'text-camel' : 'text-dashboard-muted transition group-hover:text-espresso'}>
														{item.icon}
													</span>
													<span className={isCollapsed ? 'hidden' : 'inline'}>{item.label}</span>
												</span>
											</Link>
										);
									})}
								</div>
							</div>
						))}
					</nav>

					<div
						className={[
							'mt-auto flex items-center gap-3 rounded-xl border border-dashboard-border bg-dashboard-bg/70 p-2.5',
							isCollapsed ? 'justify-center' : '',
						].join(' ')}
					>
						<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-camel text-xs font-semibold text-[#1d1916]">
							{initials}
						</span>
						{!isCollapsed ? (
							<>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-espresso">{fullName}</p>
									<p className="truncate text-xs text-dashboard-muted">{email ?? 'Host account'}</p>
								</div>
								<button
									type="button"
									onClick={() => logout()}
									aria-label="Log out"
									className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-dashboard-muted transition hover:bg-dashboard-row-hover hover:text-espresso"
								>
									<LogOut className="h-4 w-4" />
								</button>
							</>
						) : null}
					</div>
				</aside>

				<DashboardPageIntroContext.Provider value={setPageIntro}>
					<div
						className={[
							'min-w-0 w-full transition-[margin] duration-200',
							isCollapsed ? 'md:ml-[84px]' : 'md:ml-[250px]',
						].join(' ')}
					>
						<div className="mx-auto w-full max-w-[1600px]">
							<div
								className={[
									'flex items-center justify-between gap-3 px-5 py-3 transition-opacity duration-200 md:hidden',
									scrolled ? 'pointer-events-none invisible h-0 overflow-hidden py-0 opacity-0' : 'opacity-100',
								].join(' ')}
							>
								<Button
									type="button"
									variant="ghostIcon"
									onClick={openMobileNav}
									className="inline-flex shrink-0"
									aria-label="Open sidebar"
								>
									<Menu className="h-4 w-4" />
								</Button>
								<div className="flex items-center gap-2">
									<ThemeToggle compact />
									<Button
										type="button"
										variant="ghostIcon"
										onClick={() => logout()}
										className="inline-flex shrink-0"
										aria-label="Log out"
									>
										<LogOut className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{scrolled ? (
								<header className="fixed inset-x-0 top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-[color:var(--color-dashboard-header-border)] bg-[color:var(--color-dashboard-header)] px-5 py-2 shadow-[var(--color-dashboard-header-shadow)] backdrop-blur-md md:hidden">
									<div className="flex min-w-0 flex-1 items-center gap-3">
										<Button
											type="button"
											variant="ghostIcon"
											onClick={openMobileNav}
											className="inline-flex shrink-0"
											aria-label="Open sidebar"
										>
											<Menu className="h-4 w-4" />
										</Button>
										<p className="min-w-0 truncate font-serif text-lg tracking-tight">{mobileTitle}</p>
									</div>
									<div className="flex items-center gap-2">
										<ThemeToggle compact />
										<Button
											type="button"
											variant="ghostIcon"
											onClick={() => logout()}
											className="inline-flex shrink-0"
											aria-label="Log out"
										>
											<LogOut className="h-4 w-4" />
										</Button>
									</div>
								</header>
							) : null}

							<header className="sticky top-0 z-30 hidden min-h-16 items-center justify-between gap-6 border-b border-dashboard-border bg-[color:var(--color-dashboard-header)] px-10 py-2 backdrop-blur-md md:flex">
								<div className="flex min-w-0 flex-1 items-center gap-5">
									{pageIntro ? (
										<div className="min-w-0 flex-1">{pageIntro}</div>
									) : (
										<p className="truncate text-sm text-dashboard-muted">
											<span>Dashboard</span>
											<span className="mx-2 text-dashboard-border">/</span>
											<span className="font-semibold text-espresso">{mobileTitle}</span>
										</p>
									)}
								</div>

								<div className="flex shrink-0 items-center gap-3">
									<ThemeToggle />
									<Link
										href="/dashboard/subscription"
										className="hidden items-center gap-1.5 rounded-full border border-dashboard-border bg-dashboard-panel px-3 py-1.5 text-xs font-medium text-espresso transition hover:border-camel sm:inline-flex"
									>
										<span className="h-1.5 w-1.5 rounded-full bg-camel" />
										Portfolio plan
									</Link>
								</div>
							</header>

							<main className={isOverlayRoute(pathname) ? 'p-0' : 'px-5 pb-14 pt-2 md:px-10'}>
								{isOverlayRoute(pathname) ? (
									children
								) : (
									<AnimatePresence mode="wait" initial={false}>
										<motion.div key={pathname} {...pageTransition} className="mx-auto w-full">
											{children}
										</motion.div>
									</AnimatePresence>
								)}
							</main>
						</div>
					</div>
				</DashboardPageIntroContext.Provider>
			</div>
		</div>
	);
}
