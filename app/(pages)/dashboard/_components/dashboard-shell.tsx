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
	CreditCard,
	Home,
	LayoutGrid,
	LogOut,
	Luggage,
	Menu,
	MessageCircle,
	Settings,
	Users,
	Wallet,
	Wrench,
	X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import Image from 'next/image';
import logo from '@/public/images/logo.png';
import { useAuthStore } from '@/store/auth';
import { DashboardTheme, useDashboardThemeStore } from '@/store/dashboard-theme';
import { ThemeToggle } from './theme-toggle';

type NavItem = {
	label: string;
	href: string;
	icon: ReactNode;
};

const navItems: NavItem[] = [
	{ label: 'Overview', href: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
	{ label: 'Properties', href: '/dashboard/properties', icon: <Home className="h-4 w-4" /> },
	{ label: 'Bookings', href: '/dashboard/bookings', icon: <BarChart3 className="h-4 w-4" /> },
	{ label: 'Customers', href: '/dashboard/customers', icon: <Users className="h-4 w-4" /> },
	{ label: 'Services', href: '/dashboard/services', icon: <Wrench className="h-4 w-4" /> },
	{ label: 'My trips', href: '/dashboard/trips', icon: <Luggage className="h-4 w-4" /> },
	// { label: 'Messages', href: '/dashboard/messages', icon: <MessageCircle className="h-4 w-4" /> },
	{ label: 'Calendar', href: '/dashboard/calendar', icon: <CalendarDays className="h-4 w-4" /> },
	{ label: 'Earnings', href: '/dashboard/earnings', icon: <Wallet className="h-4 w-4" /> },
	// { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
	{ label: 'Payments', href: '/dashboard/payments', icon: <CreditCard className="h-4 w-4" /> },
	{ label: 'Subscription', href: '/dashboard/subscription', icon: <CreditCard className="h-4 w-4" /> },
];

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
						'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-dashboard-border bg-dashboard-bg px-3 py-6 transition-all duration-300',
						isCollapsed ? 'w-[84px]' : 'w-[250px]',
						isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
					].join(' ')}
				>
					<div className="flex items-center justify-between px-2">
						<Link href="/" className={['font-serif text-2xl tracking-tight', isCollapsed ? 'hidden' : 'block'].join(' ')}>
							<Image src={logo} alt="Domus" width={100} height={100} className='w-15 h-15' />
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

					<nav className="mt-8 flex-1 space-y-1 overflow-y-auto pb-24">
						{navItems.map((item) => {
							const active = isItemActive(pathname, item.href);

							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsMobileOpen(false)}
									className={[
										'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200',
										active ? 'text-espresso' : 'text-dashboard-muted hover:text-espresso',
										isCollapsed ? 'justify-center' : '',
									].join(' ')}
								>
									{active ? (
										<motion.span
											layoutId="dashboard-nav-active"
											className="absolute inset-0 rounded-xl bg-[color:var(--color-dashboard-nav-active)]"
											transition={navSpring}
										/>
									) : null}
									<span
										className={[
											'relative z-10 flex items-center gap-3',
											isCollapsed ? 'justify-center' : '',
										].join(' ')}
									>
										<span className={active ? 'text-camel' : 'text-dashboard-muted'}>{item.icon}</span>
										<span className={isCollapsed ? 'hidden' : 'inline'}>{item.label}</span>
									</span>
								</Link>
							);
						})}
					</nav>

					<div
						className={[
							'mt-auto flex items-center border-t border-dashboard-border pt-5',
							isCollapsed ? 'justify-center' : 'justify-between gap-3',
						].join(' ')}
					>
						{!isCollapsed ? (
							<div className="min-w-0">
								<p className="text-[10px] font-medium uppercase tracking-[0.18em] text-dashboard-muted">Appearance</p>
								<p className="mt-0.5 truncate text-xs text-espresso/70">
									{theme === DashboardTheme.DARK ? 'Nocturne' : 'Daylight'}
								</p>
							</div>
						) : null}
						<ThemeToggle compact={isCollapsed} />
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
									{pageIntro ? <div className="min-w-0 flex-1">{pageIntro}</div> : null}
								</div>

								<div className="flex shrink-0 items-center gap-3">
									<ThemeToggle />
									<span className="hidden rounded-full bg-camel/15 px-3 py-1 text-xs font-medium text-camel sm:inline-flex">
										Portfolio Plan
									</span>
									<Button
										type="button"
										variant="secondary"
										onClick={() => logout()}
										className="inline-flex items-center gap-2"
									>
										<LogOut className="h-4 w-4" />
										<span className="hidden sm:inline">Log out</span>
									</Button>
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
