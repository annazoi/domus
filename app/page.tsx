'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import heroImage from '@/public/images/landing-journal-photos.png';
import featureVillaExteriorImage from '@/public/images/landing-feature-exterior.png';
import featureVillaPoolImage from '@/public/images/landing-feature-pool.png';
import featureVillaInteriorImage from '@/public/images/landing-feature-interior.png';
import {
	PROPERTY_BRANDING_THEME_OPTIONS,
	brandingThemeToTemplateSlug,
} from '@/app/(pages)/templates/_constants/property-branding-theme';
import journalBookingsImage from '@/public/images/landing-journal-bookings.png';
import journalPricingImage from '@/public/images/landing-journal-pricing.png';
import journalPhotosImage from '@/public/images/landing-journal-photos.png';
import logo from '@/public/images/logo.png';
import { useAuthStore } from '@/store/auth';
import { LandingCursor } from '@/app/_components/landing-cursor';
import { LandingNav } from '@/app/_components/landing-nav';

function PillArrow() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
			<path d="M7 17L17 7M9 7h8v8" />
		</svg>
	);
}

function MenuBarsIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
			<path d="M4 8h16M4 16h16" />
		</svg>
	);
}

function PillDot({ children }: { children: ReactNode }) {
	return <span className="dot">{children}</span>;
}

const SCROLL_REVEAL_COPY =
	'Hozya turns your rental into a polished, bookable brand. Direct reservations, Stripe payouts, and guest data built in. You bring the property - we bring the site that makes people want to stay.';

export default function Home() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuVisible, setMenuVisible] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

	useEffect(() => {
		let ctx: { revert: () => void } | undefined;
		void (async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger'),
			]);
			gsap.registerPlugin(ScrollTrigger);

			ctx = gsap.context(() => {
				gsap.from('.hero-tagline', {
					y: 24,
					opacity: 0,
					duration: 0.85,
					ease: 'power3.out',
				});
				gsap.from('.hero-title', {
					y: 48,
					opacity: 0,
					duration: 1.1,
					delay: 0.12,
					ease: 'power3.out',
				});
				gsap.from('.hero-ctas', {
					y: 20,
					opacity: 0,
					duration: 0.85,
					delay: 0.32,
					ease: 'power3.out',
				});
				gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
					gsap.to(el, {
						opacity: 1,
						y: 0,
						duration: 1,
						ease: 'power3.out',
						scrollTrigger: { trigger: el, start: 'top 85%' },
					});
				});

				gsap.to('#home .hero-img', {
					yPercent: 12,
					ease: 'none',
					scrollTrigger: {
						trigger: '.scroll-text-section',
						start: 'top bottom',
						end: 'top top',
						scrub: true,
					},
				});

				const scrollTextSection = rootRef.current?.querySelector('.scroll-text-section');
				const scrollWords = scrollTextSection
					? gsap.utils.toArray<HTMLElement>('.scroll-text-word', scrollTextSection)
					: [];

				if (scrollWords.length > 0) {
					const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

					if (reducedMotion) {
						gsap.set(scrollWords, { color: '#1d1916' });
					} else {
						gsap.set(scrollWords, { color: 'rgba(29, 25, 22, 0.14)' });
						gsap.to(scrollWords, {
							color: '#1d1916',
							stagger: 0.06,
							ease: 'none',
							scrollTrigger: {
								trigger: scrollTextSection,
								start: 'top 78%',
								end: 'center 42%',
								scrub: 0.6,
							},
						});
					}
				}
			}, rootRef);
		})();

		return () => {
			ctx?.revert();
		};
	}, []);

	const closeMenu = () => setMenuOpen(false);
	const toggleMenu = () => {
		setMenuOpen((open) => {
			if (!open) setMenuVisible(true);
			return !open;
		});
	};
	const authHref = isLoggedIn ? '/dashboard' : '/auth/sign-in';
	const authLabel = isLoggedIn ? 'Dashboard' : 'Sign in';

	return (
		<div ref={rootRef} className="hozya-landing">
			<LandingCursor />
			<LandingNav isLoggedIn={Boolean(isLoggedIn)} />

			<div className="fixed top-5 right-5 z-50 hidden flex-col items-end gap-3 md:flex">
				<Link href={authHref} className="pill">
					<span>{authLabel}</span>
					<PillDot>
						<PillArrow />
					</PillDot>
				</Link>
				<button type="button" className="pill" onClick={toggleMenu}>
					<span>Menu</span>
					<PillDot>
						<MenuBarsIcon />
					</PillDot>
				</button>
				{menuVisible ? (
					<nav
						className={['menu-panel', menuOpen ? 'menu-panel--open' : ''].join(' ')}
						onAnimationEnd={(event) => {
							if (event.target !== event.currentTarget || menuOpen) return;
							setMenuVisible(false);
						}}
					>
						<ul>
							<li>
								<a href="#home" onClick={closeMenu}>
									Home
								</a>
							</li>
							<li>
								<a href="#features" onClick={closeMenu}>
									Features
								</a>
							</li>
							<li>
								<a href="#templates" onClick={closeMenu}>
									Templates
								</a>
							</li>
							<li>
								<a href="#pricing" onClick={closeMenu}>
									Pricing
								</a>
							</li>
							<li>
								<a href="#reviews" onClick={closeMenu}>
									Reviews
								</a>
							</li>
							<li>
								<a href="#book" onClick={closeMenu}>
									Contact
								</a>
							</li>
						</ul>
					</nav>
				) : null}
			</div>

			<div className="hero-stage">
				<section id="home" className="hero-section">
					<Image
						src={heroImage}
						alt="Luxury terrace with infinity pool overlooking the ocean at sunset"
						fill
						priority
						sizes="100vw"
						className="hero-img"
					/>
					<div className="hero-scrim" aria-hidden />

					<div className="relative z-10 hidden px-6 pt-10 md:block md:px-12">
						<a href="#home" className="hero-logo font-display text-3xl text-hoz-cream">
							<Image src={logo} alt="Hozya" width={200} height={200} />
						</a>
					</div>

					<div className="hero-copy">
						<div className="hero-copy__text">
							<p className="hero-tagline">Create your own rental website</p>
							<h1 className="hero-title h-display">Estate of Mind.</h1>
						</div>
						<div className="hero-ctas">
							<a href="#templates" className="pill">
								Explore templates
							</a>
							<a href="#book" className="pill pill-dark">
								<span>Get started</span>
								<PillDot>
									<PillArrow />
								</PillDot>
							</a>
						</div>
					</div>
				</section>
			</div>

			<section className="scroll-text-section bg-hoz-cream px-6 py-28 md:px-12 md:py-40 min-h-[70vh] flex items-center justify-center">
				<p className="scroll-text-reveal max-w-5xl">
					{SCROLL_REVEAL_COPY.split(/\s+/).map((word, index) => (
						<span key={`${word}-${index}`} className="scroll-text-word">
							{word}{' '}
						</span>
					))}
				</p>
			</section>

			{/* <section className="bg-hoz-cream py-8 border-y border-hoz-ink/10 overflow-hidden">
				<div className="marquee whitespace-nowrap text-hoz-ink/70 text-xl font-display">
					<span className="flex gap-16 px-8">
						<span>Custom domain</span>
						<span>•</span>
						<span>Booking engine</span>
						<span>•</span>
						<span>Guest CRM</span>
						<span>•</span>
						<span>Stripe payments</span>
						<span>•</span>
						<span>iCal sync</span>
						<span>•</span>
						<span>Premium templates</span>
						<span>•</span>
					</span>
					<span className="flex gap-16 px-8" aria-hidden>
						<span>Custom domain</span>
						<span>•</span>
						<span>Booking engine</span>
						<span>•</span>
						<span>Guest CRM</span>
						<span>•</span>
						<span>Stripe payments</span>
						<span>•</span>
						<span>iCal sync</span>
						<span>•</span>
						<span>Premium templates</span>
						<span>•</span>
					</span>
				</div>
			</section> */}

			<section id="features" className="bg-hoz-cream py-24 px-6 md:px-12">
				<div className="max-w-7xl mx-auto">

					<div className="grid md:grid-cols-12 gap-6">
						<div className="md:col-span-7 relative reveal">
							<div className="card-img aspect-[4/3] relative">
								<Image
									src={featureVillaPoolImage}
									alt="Luxury villa exterior with pool"
									fill
									sizes="(max-width: 768px) 100vw, 58vw"
									className="object-cover"
								/>
							</div>
							<div className="absolute top-4 left-4 bg-hoz-cream rounded-2xl px-4 py-3">
								<div className="font-display text-3xl leading-none">5min</div>
								<div className="text-sm text-hoz-muted">to launch</div>
							</div>
						</div>
						<div className="md:col-span-5 reveal">
							<div className="card-img aspect-[3/4] relative">
								<Image
									src={featureVillaExteriorImage}
									alt="Modern cliffside luxury villa"
									fill
									sizes="(max-width: 768px) 100vw, 42vw"
									className="object-cover"
								/>
							</div>
						</div>
						<div className="md:col-span-5 md:col-start-2 mt-6 reveal">
							<div className="card-img aspect-[4/3] relative">
								<Image
									src={featureVillaInteriorImage}
									alt="Luxury villa living room with mountain views"
									fill
									sizes="(max-width: 768px) 100vw, 42vw"
									className="object-cover"
								/>
							</div>
						</div>
						<div className="md:col-span-6 mt-6 flex flex-col justify-center reveal">
							<p className="text-xl md:text-2xl text-hoz-ink/80 leading-relaxed">
								Hozya is a rental platform that turns your rental property into a polished, branded
								website - with bookings, payments and guest data built in. You bring the house. We bring the
								everything-else.
							</p>
							<div className="mt-8 flex gap-3">
								<a href="#templates" className="pill pill-dark">
									<span>See templates</span>
									<PillDot>
										<PillArrow />
									</PillDot>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="templates" className="bg-hoz-coffee text-hoz-cream py-24 px-6 md:px-12 relative overflow-hidden rounded-t-3xl">
				<div className="absolute -bottom-10 left-0 right-0 text-center ghost-text h-display text-[22vw] pointer-events-none select-none">
					HOZYA
				</div>
				<div className="max-w-7xl mx-auto relative z-10">
					<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
						<div>
							<p className="font-display text-2xl mb-3 text-hoz-cream/70">— Our templates</p>
							<h2 className="h-display text-5xl md:text-7xl">
								Pick a look.
								<br />
								Make it yours.
							</h2>
						</div>
						<p className="max-w-sm text-hoz-cream/70">
							Three handcrafted designs, fully customisable. Click any template to preview the live layout.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{PROPERTY_BRANDING_THEME_OPTIONS.map((option) => {
							const previewHref = `/templates/${brandingThemeToTemplateSlug(option.id)}`;
							return (
								<a
									key={option.id}
									href={previewHref}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Preview ${option.label} template`}
									className="reveal group template-card-link block"
								>
									<div className="card-img aspect-[4/5] mb-4 relative overflow-hidden">
										<Image
											src={option.image}
											alt={option.imageAlt}
											fill
											sizes="(max-width: 768px) 100vw, 33vw"
											className="object-cover template-card-img"
										/>
										<div className="template-card-preview absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-300 group-hover:bg-black/45 group-hover:opacity-100">
											<span className="pill">
												<span>Preview</span>
												<PillDot>
													<PillArrow />
												</PillDot>
											</span>
										</div>
									</div>
									<h3 className="font-display text-3xl">{option.label}</h3>
									<div className="mt-3 flex flex-wrap gap-2">
										{option.tags.map((tag) => (
											<span key={tag} className="rounded-full bg-hoz-mocha px-3 py-1 text-xs">
												{tag}
											</span>
										))}
									</div>
								</a>
							);
						})}
					</div>
				</div>
			</section>

			<section id="pricing" className="pricing-section bg-hoz-cream py-24 px-6 md:px-12 relative overflow-hidden">
				<div className="pricing-grain pointer-events-none" aria-hidden />
				<div className="max-w-7xl mx-auto relative z-10">
					<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 reveal">
						<div>
							<p className="font-display text-2xl mb-3 text-hoz-mocha">— Pricing</p>
							<h2 className="h-display text-5xl md:text-7xl text-hoz-ink">
								Start small.
								<br />
								Scale when ready.
							</h2>
						</div>
						<p className="max-w-sm text-hoz-muted text-lg leading-relaxed">
							No setup fees. Cancel anytime. Every plan includes your booking engine and Stripe payouts.
						</p>
					</div>

					<div className="pricing-grid">
						<article className="pricing-card reveal">
							<span className="pricing-tier-index" aria-hidden>
								01
							</span>
							<div className="pricing-card-head">
								<h3 className="font-display text-3xl text-hoz-ink">Essential</h3>
								<p className="pricing-tagline text-hoz-muted">One property, fully yours</p>
							</div>
							<div className="pricing-amount">
								<span className="pricing-currency">$</span>
								<span className="pricing-value">29</span>
								<span className="pricing-period">/ month</span>
							</div>
							<ul className="pricing-features">
								<li>Direct bookings</li>
								<li>Custom domain</li>
								<li>Basic analytics</li>
							</ul>
							<a href="#book" className="pill pill-dark pricing-cta">
								<span>Get started</span>
								<PillDot>
									<PillArrow />
								</PillDot>
							</a>
						</article>

						<article className="pricing-card pricing-card-featured reveal">
							<span className="pricing-badge">Most popular</span>
							<span className="pricing-tier-index" aria-hidden>
								02
							</span>
							<div className="pricing-card-head">
								<h3 className="font-display text-3xl text-hoz-cream">Portfolio</h3>
								<p className="pricing-tagline text-hoz-cream/65">For hosts with multiple stays</p>
							</div>
							<div className="pricing-amount pricing-amount-light">
								<span className="pricing-currency">$</span>
								<span className="pricing-value">79</span>
								<span className="pricing-period">/ month</span>
							</div>
							<ul className="pricing-features pricing-features-light">
								<li>Up to 10 properties</li>
								<li>Revenue reports</li>
								<li>Priority support</li>
							</ul>
							<a href="#book" className="pill pricing-cta">
								<span>Start free trial</span>
								<PillDot>
									<PillArrow />
								</PillDot>
							</a>
						</article>

						<article className="pricing-card pricing-card-estate reveal">
							<span className="pricing-tier-index" aria-hidden>
								03
							</span>
							<div className="pricing-card-head">
								<h3 className="font-display text-3xl text-hoz-ink">Estate</h3>
								<p className="pricing-tagline text-hoz-muted">For operators at scale</p>
							</div>
							<div className="pricing-amount">
								<span className="pricing-currency">$</span>
								<span className="pricing-value">149</span>
								<span className="pricing-period">/ month</span>
							</div>
							<ul className="pricing-features">
								<li>Unlimited properties</li>
								<li>Team accounts</li>
								<li>Dedicated onboarding</li>
							</ul>
							<a href="#book" className="pill pill-dark pricing-cta">
								<span>Talk to us</span>
								<PillDot>
									<PillArrow />
								</PillDot>
							</a>
						</article>
					</div>
				</div>
			</section>

			<section id="reviews" className="bg-hoz-coffee text-hoz-cream py-24 px-6 md:px-12 border-t border-hoz-cream/10 rounded-b-3xl">
				<div className="max-w-7xl mx-auto">
					<p className="font-display text-2xl mb-3 text-hoz-cream/70">— What hosts say</p>
					<h2 className="h-display text-5xl md:text-7xl mb-16">about our platform...</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<article className="bg-hoz-mocha rounded-3xl p-8 reveal">
							<div className="text-hoz-gold text-xl mb-6">★★★★★</div>
							<p className="text-hoz-cream/85 leading-relaxed">
								Hozya felt like hiring a designer and developer at once. My cabin site launched in an afternoon
								and bookings doubled in a month.
							</p>
							<p className="mt-6 font-display text-2xl">A Home Away From Home</p>
						</article>
						<article className="bg-hoz-mocha rounded-3xl p-8 reveal">
							<div className="text-hoz-gold text-xl mb-6">★★★★★</div>
							<p className="text-hoz-cream/85 leading-relaxed">
								The booking engine is a dream - direct reservations, Stripe payouts, and a calendar that finally
								syncs with everything.
							</p>
							<p className="mt-6 font-display text-2xl">Adventure Awaits</p>
						</article>
						<article className="bg-hoz-mocha rounded-3xl p-8 reveal">
							<div className="text-hoz-gold text-xl mb-6">★★★★★</div>
							<p className="text-hoz-cream/85 leading-relaxed">
								My guests now think I run a boutique brand. The templates are gorgeous and the guest CRM keeps
								everything organized.
							</p>
							<p className="mt-6 font-display text-2xl">Amazing Experience</p>
						</article>
					</div>
				</div>
			</section>

			<section className="bg-hoz-cream py-24 px-6 md:px-12">
				<div className="max-w-7xl mx-auto">
					<p className="font-display text-2xl mb-3 text-hoz-mocha">— From the journal</p>
					<h2 className="h-display text-5xl md:text-7xl text-hoz-ink mb-16">
						Host stories &<br />
						field notes
					</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<a href="#" className="relative card-img aspect-[3/4] block group journal-group reveal">
							<Image
								src={journalBookingsImage}
								alt="Luxury villa exterior"
								fill
								sizes="(max-width: 768px) 100vw, 33vw"
								className="object-cover journal-card-img"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
							<div className="absolute inset-0 p-6 flex flex-col justify-end text-hoz-cream">
								<div>
									<h3 className="font-display text-2xl mb-4 text-hoz-cream">How to make the most of your direct bookings</h3>
									<span className="pill">
										<span>Read</span>
										<PillDot>
											<PillArrow />
										</PillDot>
									</span>
								</div>
							</div>
						</a>
						<a href="#" className="relative card-img aspect-[3/4] block group journal-group reveal">
							<Image
								src={journalPricingImage}
								alt="Luxury villa interior detail"
								fill
								sizes="(max-width: 768px) 100vw, 33vw"
								className="object-cover journal-card-img"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
							<div className="absolute inset-0 p-6 flex flex-col justify-end text-hoz-cream">
								<div>
									<h3 className="font-display text-2xl mb-4 text-hoz-cream">A guide to pricing your rental like a hotel</h3>
									<span className="pill">
										<span>Read</span>
										<PillDot>
											<PillArrow />
										</PillDot>
									</span>
								</div>
							</div>
						</a>
						<a href="#" className="relative card-img aspect-[3/4] block group journal-group reveal">
							<Image
								src={journalPhotosImage}
								alt="Luxury villa open-plan living space"
								fill
								sizes="(max-width: 768px) 100vw, 33vw"
								className="object-cover journal-card-img"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
							<div className="absolute inset-0 p-6 flex flex-col justify-end text-hoz-cream">
								<div>
									<h3 className="font-display text-2xl mb-4 text-hoz-cream">Five photos every listing page needs</h3>
									<span className="pill">
										<span>Read</span>
										<PillDot>
											<PillArrow />
										</PillDot>
									</span>
								</div>
							</div>
						</a>
					</div>
				</div>
			</section>

			<section id="book" className="bg-hoz-ink text-hoz-cream py-24 px-6 md:px-12 rounded-t-3xl">
				<div className="max-w-7xl mx-auto">
					<div className="grid md:grid-cols-2 gap-10 mb-12">
						<h2 className="h-display text-5xl md:text-7xl">
							Launch your
							<br />
							stay today
						</h2>
						<p className="text-hoz-cream/70 text-lg">
							Plans start at $29/month with custom domain, booking engine and unlimited guests. Tell us about
							your property and we&apos;ll set up your free trial.
						</p>
					</div>

					<form
						className="bg-hoz-mocha rounded-3xl p-6 md:p-10"
						onSubmit={(e) => {
							e.preventDefault();
							window.alert('Thanks! We will be in touch.');
						}}
					>
						<div className="grid md:grid-cols-3 gap-6">
							<div>
								<label className="block text-sm mb-2 text-hoz-cream/70">Full name</label>
								<input className="input" placeholder="Justin Fee" required />
							</div>
							<div>
								<label className="block text-sm mb-2 text-hoz-cream/70">Email</label>
								<input type="email" className="input" placeholder="your@email.com" required />
							</div>
							<div>
								<label className="block text-sm mb-2 text-hoz-cream/70">Property name</label>
								<input className="input" placeholder="Canoply Chalet" />
							</div>
							<div>
								<label className="block text-sm mb-2 text-hoz-cream/70">Location</label>
								<input className="input" placeholder="Mountain hills, Canada" />
							</div>
							<div>
								<label className="block text-sm mb-2 text-hoz-cream/70">Nightly rate</label>
								<input className="input" placeholder="$290 / night" />
							</div>
							<div className="flex items-end">
								<button type="submit" className="pill pill-dark w-full justify-between">
									<span>Start free trial</span>
									<PillDot>
										<PillArrow />
									</PillDot>
								</button>
							</div>
						</div>
					</form>
					{isLoggedIn ? (
						<p className="book-form-auth">
							Welcome back.{' '}
							<Link href="/dashboard">Go to dashboard</Link>
						</p>
					) : (
						<p className="book-form-auth">
							Already have an account? <Link href="/auth/sign-in">Sign in</Link>
						</p>
					)}
				</div>
			</section>

			<footer className="bg-hoz-ink text-hoz-cream pt-16 pb-6 px-6 md:px-12 relative overflow-hidden">
				<div className="max-w-7xl mx-auto">
					<div className="max-w-xl mb-12">
						<h3 className="h-display text-4xl md:text-5xl">Beautiful sites for hosts who care.</h3>
						<div className="flex gap-3 mt-6 items-center">
							<a href="#book" className="pill">
								<span>Book a demo</span>
								<PillDot>
									<PillArrow />
								</PillDot>
							</a>
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-hoz-mocha grid place-items-center"
								aria-label="Instagram"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
									<rect x="3" y="3" width="18" height="18" rx="5" />
									<circle cx="12" cy="12" r="4" />
									<circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
								</svg>
							</a>
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-hoz-mocha grid place-items-center"
								aria-label="Facebook"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
									<path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.4-2 2-2h2V2h-3c-3 0-5 1.8-5 5v3H6v4h3v8h4z" />
								</svg>
							</a>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm border-t border-hoz-cream/10 pt-10">
						<div>
							<p className="font-semibold mb-3">Product</p>
							<ul className="space-y-2 text-hoz-cream/70">
								<li>
									<a href="#templates">Templates</a>
								</li>
								<li>
									<a href="#features">Features</a>
								</li>
								<li>
									<a href="#pricing">Pricing</a>
								</li>
							</ul>
						</div>
						<div>
							<p className="font-semibold mb-3">Hosts</p>
							<ul className="space-y-2 text-hoz-cream/70">
								<li>
									<a href="#">Booking system</a>
								</li>
								<li>
									<a href="#">Guest CRM</a>
								</li>
								<li>
									<a href="#">Custom domain</a>
								</li>
							</ul>
						</div>
						<div>
							<p className="font-semibold mb-3">Resources</p>
							<ul className="space-y-2 text-hoz-cream/70">
								<li>
									<a href="#">Journal</a>
								</li>
								<li>
									<a href="#">Help center</a>
								</li>
								<li>
									<a href="#">Changelog</a>
								</li>
							</ul>
						</div>
						<div>
							<p className="font-semibold mb-3">Company</p>
							<ul className="space-y-2 text-hoz-cream/70">
								<li>
									<a href="#">About</a>
								</li>
								<li>
									<a href="#">Contact</a>
								</li>
								<li>
									<a href="#">Privacy</a>
								</li>
							</ul>
						</div>
					</div>

					<p className="text-hoz-cream/40 text-xs mt-10">© 2025 Hozya. All rights reserved.</p>
				</div>

				<div className="ghost-text h-display text-[28vw] leading-none text-center pointer-events-none select-none -mb-10">
					Hozya
				</div>
			</footer>
		</div>
	);
}
