'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ApiRoutes } from '@/config/api/routes';

const marqueePhrases = [
	'Own your brand',
	'Direct bookings',
	'Zero commission',
	'Full control',
	'Magazine-quality pages',
] as const;

function MarqueeItems({ id }: { id: string }) {
	return (
		<>
			{marqueePhrases.map((text) => (
				<span key={`${id}-${text}`}>
					{text} <span className="clay">✺</span>
				</span>
			))}
		</>
	);
}

function ArrowIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
			<line x1="5" y1="12" x2="19" y2="12" />
			<polyline points="12 5 19 12 12 19" />
		</svg>
	);
}

export default function Home() {
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const els = root.querySelectorAll<HTMLElement>('.reveal');
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add('in');
						io.unobserve(e.target);
					}
				});
			},
			{ rootMargin: '-80px' },
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, []);

	return (
		<div ref={rootRef} className="landing-root">
			<header className="nav">
				<div className="nav-inner">
					<Link href="#top" className="brand">
						Domus<span className="clay">.</span>
					</Link>
					<nav className="nav-links">
						<a href="#platform">Platform</a>
						<a href="#showcase">Showcase</a>
						<a href="#pricing">Pricing</a>
					</nav>
					<Link href={ApiRoutes.auth.login} className="btn-outline">
						Log In
					</Link>
				</div>
			</header>

			<main id="top">
				<section className="hero">
					<div className="hero-bg" />
					<div className="hero-content">
						<span className="eyebrow">White-label rental platform</span>
						<h1>
							Create your own
							<br />
							<span className="italic">rental</span> website.
						</h1>
						<p>A refined white-label platform for those who want to build a brand, not just list a property.</p>
						<a href="#start" className="btn-primary">
							Start building
							<ArrowIcon />
						</a>
					</div>
				</section>

				<div className="marquee-wrap">
					<div className="marquee">
						<MarqueeItems id="a" />
						<MarqueeItems id="b" />
					</div>
				</div>

				<section id="platform">
					<div className="container">
						<h2 className="section-title reveal">
							Built for those who refuse to be{' '}
							<span className="italic clay">another listing.</span>
						</h2>
						<div className="pillars">
							<div className="pillar reveal">
								<span className="num">01</span>
								<h3>Own your brand</h3>
								<p>
									Your domain, your aesthetics. Craft an unforgettable identity that guests remember and return
									to.
								</p>
							</div>
							<div className="pillar reveal">
								<span className="num">02</span>
								<h3>Direct bookings</h3>
								<p>
									Keep 100% of your revenue. Bypass marketplace fees and build direct relationships with your
									guests.
								</p>
							</div>
							<div className="pillar reveal">
								<span className="num">03</span>
								<h3>Full control</h3>
								<p>Manage pricing, availability, and guest communications on your terms, with elegant tools.</p>
							</div>
						</div>
					</div>
				</section>

				<section id="showcase" style={{ paddingTop: 0 }}>
					<div className="container">
						<div className="feature reveal">
							<div>
								<Image
									src="/images/property-pages.jpg"
									alt="Property pages mockup"
									width={1200}
									height={960}
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
							</div>
							<div>
								<span className="eyebrow">Design</span>
								<h3>
									Elevated <span className="italic">property</span> pages.
								</h3>
								<p>
									Present your spaces with the architectural reverence they deserve. Large imagery, elegant
									typography, and a calm interface.
								</p>
								<a href="#showcase" className="link-underline">
									Explore design →
								</a>
							</div>
						</div>
						<div className="feature reverse reveal">
							<div>
								<Image
									src="/images/booking.jpg"
									alt="Booking checkout flow"
									width={1200}
									height={960}
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
							</div>
							<div>
								<span className="eyebrow">Checkout</span>
								<h3>
									A <span className="italic">seamless</span> booking experience.
								</h3>
								<p>
									No clutter, no distractions. A frictionless checkout flow that feels premium and builds trust
									instantly with your guests.
								</p>
								<a href="#showcase" className="link-underline">
									View flow →
								</a>
							</div>
						</div>
					</div>
				</section>

				<section className="steps-section">
					<div className="container">
						<h2 className="section-title reveal">
							Three steps to <span className="italic clay">independence.</span>
						</h2>
						<div className="steps">
							<div className="step reveal">
								<span className="num">01</span>
								<h3>Create your page</h3>
								<p>
									Upload your photos and descriptions. We automatically format them into a magazine-quality layout.
								</p>
							</div>
							<div className="step reveal">
								<span className="num">02</span>
								<h3>Customize your site</h3>
								<p>
									Select from curated typography pairs and subtle color palettes to match your property&apos;s
									essence.
								</p>
							</div>
							<div className="step reveal">
								<span className="num">03</span>
								<h3>Start receiving bookings</h3>
								<p>
									Connect your bank account and begin accepting direct reservations with zero marketplace
									commission.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section>
					<div className="container testimonial reveal">
						<blockquote>
							<span className="clay">&ldquo;</span>
							Domus didn&apos;t just give us a website, they gave us our <span style={{ fontStyle: 'normal' }}>brand</span>{' '}
							back. Our direct bookings doubled in three months.
							<span className="clay">&rdquo;</span>
						</blockquote>
						<cite>— Villa Azure, Amalfi Coast</cite>
					</div>
				</section>

				<section id="pricing">
					<div className="container">
						<div className="pricing-head reveal">
							<span className="eyebrow">Pricing</span>
							<h2>
								Clear, <span className="italic">elegant</span> pricing.
							</h2>
							<p className="muted" style={{ marginTop: '1.5rem' }}>
								No hidden fees, no complicated tiers.
							</p>
						</div>
						<div className="pricing">
							<div className="plan reveal">
								<h3>Essential</h3>
								<p className="plan-tag">For single properties.</p>
								<div className="price">
									<span className="amount">$29</span>
									<span className="per">/month</span>
								</div>
								<ul>
									<li>Custom domain</li>
									<li>Secure checkout</li>
									<li>0% booking fees</li>
								</ul>
								<button type="button" className="plan-btn">
									Select Essential →
								</button>
							</div>
							<div className="plan featured reveal">
								<span className="plan-badge">Most loved</span>
								<h3>Portfolio</h3>
								<p className="plan-tag">For multiple listings.</p>
								<div className="price">
									<span className="amount">$79</span>
									<span className="per">/month</span>
								</div>
								<ul>
									<li>Up to 10 properties</li>
									<li>Advanced analytics</li>
									<li>Priority support</li>
								</ul>
								<button type="button" className="plan-btn">
									Select Portfolio →
								</button>
							</div>
						</div>
					</div>
				</section>

				<section id="start" className="cta">
					<div className="container">
						<h2 className="reveal">
							Start building your <span className="italic clay">rental brand</span> today.
						</h2>
						<Link href={ApiRoutes.auth.login} className="btn-primary" style={{ marginTop: '3rem' }}>
							Begin your domain
							<ArrowIcon />
						</Link>
					</div>
					<div className="cta-glow" />
				</section>
			</main>

			<footer>
				<div className="container footer-inner">
					<span className="brand">
						Domus<span className="clay">.</span>
					</span>
					<p>© 2026 — A home for your brand</p>
				</div>
			</footer>
		</div>
	);
}
