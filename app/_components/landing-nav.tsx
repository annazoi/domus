'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import logo from '@/public/images/logo.png';

const NAV_LINKS = [
	{ label: 'Home', href: '#home' },
	{ label: 'Features', href: '#features' },
	{ label: 'Templates', href: '#templates' },
	{ label: 'Pricing', href: '#pricing' },
	{ label: 'Reviews', href: '#reviews' },
	{ label: 'Contact', href: '#book' },
] as const;

function MenuIcon({ open }: { open: boolean }) {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
			{open ? (
				<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
			) : (
				<>
					<path d="M4 8h16" strokeLinecap="round" />
					<path d="M4 16h16" strokeLinecap="round" />
				</>
			)}
		</svg>
	);
}

function PillArrow() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
			<path d="M7 17L17 7M9 7h8v8" />
		</svg>
	);
}

function PillDot({ children }: { children: ReactNode }) {
	return <span className="dot">{children}</span>;
}

type LandingNavProps = {
	isLoggedIn: boolean;
};

export function LandingNav({ isLoggedIn }: LandingNavProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	const closeMenu = useCallback(() => setMenuOpen(false), []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 32);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [menuOpen]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeMenu();
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [closeMenu]);

	useEffect(() => {
		const media = window.matchMedia('(min-width: 768px)');
		const onChange = () => {
			if (media.matches) closeMenu();
		};
		media.addEventListener('change', onChange);
		return () => media.removeEventListener('change', onChange);
	}, [closeMenu]);

	const authHref = isLoggedIn ? '/dashboard' : '/auth/sign-in';
	const authLabel = isLoggedIn ? 'Dashboard' : 'Sign in';

	return (
		<>
			<header
				className={[
					'landing-nav-bar md:hidden',
					scrolled ? 'landing-nav-bar--solid' : 'landing-nav-bar--hero',
					menuOpen ? 'landing-nav-bar--menu-open' : '',
				].join(' ')}
			>
				<Link href="#home" className="landing-nav-logo" aria-label="Domus home" onClick={closeMenu}>
					<Image src={logo} alt="" width={120} height={40} priority className="landing-nav-logo-img" />
				</Link>

				<div className="landing-nav-bar__actions">
					<Link href={authHref} className="landing-nav-auth-chip">
						{authLabel}
					</Link>
					<button
						type="button"
						className="landing-nav-toggle"
						onClick={() => setMenuOpen((open) => !open)}
						aria-expanded={menuOpen}
						aria-controls="landing-mobile-menu"
						aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					>
						<MenuIcon open={menuOpen} />
					</button>
				</div>
			</header>

			<div className="landing-nav-desktop hidden md:flex">
				<Link href={authHref} className="pill">
					<span>{authLabel}</span>
					<PillDot>
						<PillArrow />
					</PillDot>
				</Link>
				<button type="button" className="pill" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>
					<span>{menuOpen ? 'Close' : 'Menu'}</span>
					<PillDot>
						<MenuIcon open={menuOpen} />
					</PillDot>
				</button>
				{menuOpen ? (
					<nav className="menu-panel" aria-label="Site">
						<ul>
							{NAV_LINKS.map((item) => (
								<li key={item.href}>
									<a href={item.href} onClick={closeMenu}>
										{item.label}
									</a>
								</li>
							))}
						</ul>
						<div className="menu-panel-divider" />
						<ul>
							<li>
								<Link href={authHref} onClick={closeMenu}>
									{authLabel}
								</Link>
							</li>
							{isLoggedIn ? null : (
								<li>
									<Link href="/auth/sign-up" onClick={closeMenu}>
										Create platform
									</Link>
								</li>
							)}
						</ul>
					</nav>
				) : null}
			</div>

			<div
				id="landing-mobile-menu"
				className={['landing-nav-drawer md:hidden', menuOpen ? 'landing-nav-drawer--open' : ''].join(' ')}
				aria-hidden={!menuOpen}
			>
				<div className="landing-nav-drawer__grain" aria-hidden />
				<nav className="landing-nav-drawer__inner" aria-label="Site">
					<p className="landing-nav-drawer__eyebrow">Explore</p>
					<ul className="landing-nav-drawer__links">
						{NAV_LINKS.map((item, index) => (
							<li key={item.href} style={{ '--nav-i': index } as CSSProperties}>
								<a href={item.href} onClick={closeMenu}>
									{item.label}
								</a>
							</li>
						))}
					</ul>
					<div className="landing-nav-drawer__footer">
						<Link href={authHref} className="landing-nav-drawer__cta" onClick={closeMenu}>
							<span>{authLabel}</span>
							<PillDot>
								<PillArrow />
							</PillDot>
						</Link>
						{isLoggedIn ? null : (
							<Link href="/auth/sign-up" className="landing-nav-drawer__secondary" onClick={closeMenu}>
								Create your platform
							</Link>
						)}
					</div>
				</nav>
			</div>
		</>
	);
}
