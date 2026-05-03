'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { ApiRoutes } from '@/config/api/routes';
import { buttonClassName, Button } from '@/components/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import elevatedPropertyPages from '@/public/images/elevated_property_pages.png';
import seamlessBookingExperience from '@/public/images/seamless_booking_experience.png';
import { PiInstagramLogoThin, PiTwitterLogoThin, PiWhatsappLogoThin } from "react-icons/pi";
import logo from '@/public/images/logo_white.png'
import stoneLogo from '@/public/images/stone_logo.png'

const fadeIn: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
	visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
	const [isNavScrolled, setIsNavScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			setIsNavScrolled(window.scrollY > 12);
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<div className="bg-stone-50 text-stone-900 font-sans min-h-screen selection:bg-stone-200">
			{/* Navigation */}
			<nav
				className={[
					'fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center text-stone-100 transition-[backdrop-filter] duration-300',
					isNavScrolled ? 'backdrop-blur-md border-b border-stone-200/5' : 'backdrop-blur-none',
				].join(' ')}
			>
				<Link href="/">
					<Image src={logo} alt="Domus" className="w-20 h-20" />
				</Link>
				<div className="hidden md:flex gap-8 text-sm font-light tracking-wide">
					<a href="#" className="hover:opacity-70 transition-opacity">
						Platform
					</a>
					<a href="#" className="hover:opacity-70 transition-opacity">
						Showcase
					</a>
					<a href="#" className="hover:opacity-70 transition-opacity">
						Pricing
					</a>
				</div>
				<Link className={buttonClassName('navLogin')} href={ApiRoutes.auth.login}>
					Log In
				</Link>
			</nav>

			{/* Hero Section */}
			<section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
				<Image
					src="/images/hero_luxury_apartment_1776225273450.png"
					alt="Luxury minimalist apartment"
					fill
					className="object-cover object-center brightness-50"
					priority
				/>
				<div className="absolute inset-0 bg-stone-900/20" /> {/* Subtle darkening for text readability */}
				<motion.div
					className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20"
					initial="hidden"
					animate="visible"
					variants={stagger}
				>
					<motion.h1
						variants={fadeIn}
						className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-50 mb-6 leading-[1.1] tracking-tight"
					>
						Create your own <br /> rental website.
					</motion.h1>
					<motion.p
						variants={fadeIn}
						className="text-stone-200 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto"
					>
						A refined white-label platform for those who want to build a brand, not just list a property.
					</motion.p>
					<motion.button
						variants={fadeIn}
						className={buttonClassName('hero', 'flex items-center gap-2 group')}
					>
						Start building
						<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</motion.button>
				</motion.div>
			</section>

			{/* Value Proposition */}
			<section className="py-32 px-8 md:px-16 lg:px-24 bg-stone-50">
				<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
					{[
						{
							title: 'Own your brand',
							desc: 'Your domain, your aesthetics. Craft an unforgettable identity that guests remember and return to.',
						},
						{
							title: 'Direct bookings',
							desc: 'Keep 100% of your revenue. Bypass marketplace fees and build direct relationships with your guests.',
						},
						{
							title: 'Full control',
							desc: 'Manage pricing, availability, and guest communications on your terms, with elegant tools.',
						},
					].map((prop, i) => (
						<motion.div
							key={i}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-100px' }}
							variants={fadeIn}
							className="flex flex-col"
						>
							<h3 className="font-serif text-2xl mb-4 text-stone-800">{prop.title}</h3>
							<p className="text-stone-500 font-light leading-relaxed">{prop.desc}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* Visual Showcase - staggered editorial pairs */}
			<section className="bg-[#f7f5f0] py-24 md:py-32 px-5 md:px-10">
				<div className="max-w-7xl mx-auto flex flex-col gap-24 md:gap-40">
					<motion.article
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={fadeIn}
						className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-start"
					>
						<div className="lg:col-span-7 relative aspect-[3/4] w-full max-h-[min(34rem,78vh)] mx-auto lg:mx-0">
							<Image
								src={elevatedPropertyPages}
								alt="Elevated property pages preview"
								fill
								sizes="(max-width: 1024px) 100vw, 58vw"
								className="object-cover"
								priority
							/>
						</div>
						<div className="lg:col-span-4 lg:col-start-9 bg-white px-8 py-10 md:px-11 md:py-12 shadow-[0_2px_28px_-6px_rgba(28,25,23,0.1)] ring-1 ring-stone-200/50 lg:translate-y-14 lg:-translate-x-2">
							<h2 className="font-serif italic text-[1.7rem] sm:text-3xl md:text-[2.1rem] mb-5 text-stone-900 leading-[1.2]">
								Elevated property pages.
							</h2>
							<p className="text-stone-600 font-light text-sm md:text-[15px] mb-8 leading-[1.75]">
								Present your spaces with the architectural reverence they deserve. Large imagery, elegant
								typography, and a calm interface.
							</p>
							<a
								href="#"
								className="inline-flex items-center gap-1.5 text-stone-900 text-[11px] font-semibold uppercase tracking-[0.18em] hover:opacity-55 transition-opacity"
							>
								Explore Design <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
							</a>
						</div>
					</motion.article>

					<motion.article
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={fadeIn}
						className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-start"
					>
						<div className="lg:col-span-4 order-2 lg:order-1 bg-white px-8 py-10 md:px-11 md:py-12 shadow-[0_2px_28px_-6px_rgba(28,25,23,0.1)] ring-1 ring-stone-200/50 m-auto">
							<h2 className="font-serif italic text-[1.7rem] sm:text-3xl md:text-[2.1rem] mb-5 text-stone-900 leading-[1.2]">
								A seamless booking experience.
							</h2>
							<p className="text-stone-600 font-light text-sm md:text-[15px] mb-8 leading-[1.75]">
								No clutter, no distractions. A frictionless checkout flow that feels premium and builds trust
								instantly with your guests.
							</p>
							<a
								href="#"
								className="inline-flex items-center gap-1.5 text-stone-900 text-[11px] font-semibold uppercase tracking-[0.18em] hover:opacity-55 transition-opacity"
							>
								View Flow <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
							</a>
						</div>
						<div className="lg:col-span-7 lg:col-start-6 order-1 lg:order-2 relative aspect-[3/4] w-full max-h-[min(34rem,78vh)] mx-auto lg:mx-0 lg:-translate-y-4">
							<Image
								src={seamlessBookingExperience}
								alt="Seamless booking experience preview"
								fill
								sizes="(max-width: 1024px) 100vw, 58vw"
								className="object-cover object-bottom"
							/>
						</div>
					</motion.article>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-32 px-8 md:px-16 lg:px-24 bg-stone-100">
				<div className="max-w-4xl mx-auto">
					<motion.h2
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={fadeIn}
						className="font-serif text-4xl md:text-5xl text-center mb-24 text-stone-800"
					>
						Three steps to independence.
					</motion.h2>

					<div className="space-y-16">
						{[
							{
								num: '01',
								title: 'Create your page',
								desc: 'Upload your photos and descriptions. We automatically format them into a magazine-quality layout.',
							},
							{
								num: '02',
								title: 'Customize your site',
								desc: "Select from curated typography pairs and subtle color palettes to match your property's essence.",
							},
							{
								num: '03',
								title: 'Start receiving bookings',
								desc: 'Connect your bank account and begin accepting direct reservations with zero marketplace commission.',
							},
						].map((step, i) => (
							<motion.div
								key={i}
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true, margin: '-50px' }}
								variants={fadeIn}
								className="flex flex-col md:flex-row gap-6 md:gap-16 border-t border-stone-300 pt-8"
							>
								<div className="text-stone-400 font-serif text-xl">{step.num}</div>
								<div className="flex-1">
									<h3 className="font-serif text-2xl mb-3 text-stone-800">{step.title}</h3>
									<p className="text-stone-500 font-light text-lg">{step.desc}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Trust / Social Proof */}
			<section className="py-32 px-8 bg-stone-900 text-stone-50 text-center">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeIn}
					className="max-w-3xl mx-auto"
				>
					<p className="font-serif text-3xl md:text-4xl leading-relaxed mb-8">
						"Domus didn't just give us a website, they gave us our brand back. Our direct bookings doubled in
						three months."
					</p>
					<p className="text-stone-400 text-sm uppercase tracking-widest">— Villa Azure, Amalfi Coast</p>
				</motion.div>
			</section>

			{/* Pricing Preview */}
			<section className="py-32 px-8 md:px-16 lg:px-24 bg-stone-50">
				<div className="max-w-5xl mx-auto">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={fadeIn}
						className="text-center mb-20"
					>
						<h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-800">Clear, elegant pricing.</h2>
						<p className="text-stone-500 font-light text-lg">No hidden fees, no complicated tiers.</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Plan 1 */}
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-50px' }}
							variants={fadeIn}
							className="border border-stone-200 p-12 bg-white flex flex-col items-center text-center rounded-sm"
						>
							<h3 className="font-serif text-2xl text-stone-800 mb-2">Essential</h3>
							<p className="text-stone-500 font-light mb-8">For single properties.</p>
							<div className="font-serif text-5xl text-stone-800 mb-8">
								$29<span className="text-lg text-stone-400 font-sans font-light">/mo</span>
							</div>
							<ul className="text-stone-500 font-light space-y-4 mb-12 flex-1 w-full text-left max-w-xs">
								<li className="flex items-center gap-3">
									<Check className="w-4 h-4 text-stone-800" /> Custom domain
								</li>
								<li className="flex items-center gap-3">
									<Check className="w-4 h-4 text-stone-800" /> Secure checkout
								</li>
								<li className="flex items-center gap-3">
									<Check className="w-4 h-4 text-stone-800" /> 0% booking fees
								</li>
							</ul>
							<Button type="button" variant="pricingOutline">
								Select Essential
							</Button>
						</motion.div>

						{/* Plan 2 */}
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-50px' }}
							variants={fadeIn}
							className="border border-stone-800 p-12 bg-stone-900 text-stone-50 flex flex-col items-center text-center shadow-2xl rounded-sm"
						>
							<h3 className="font-serif text-2xl mb-2">Portfolio</h3>
							<p className="text-stone-400 font-light mb-8">For multiple listings.</p>
							<div className="font-serif text-5xl mb-8">
								$79<span className="text-lg text-stone-400 font-sans font-light">/mo</span>
							</div>
							<ul className="text-stone-300 font-light space-y-4 mb-12 flex-1 w-full text-left max-w-xs">
								<li className="flex items-center gap-3">
									<Check className="w-4 h-4" /> Up to 10 properties
								</li>
								<li className="flex items-center gap-3">
									<Check className="w-4 h-4" /> Advanced analytics
								</li>
								<li className="flex items-center gap-3">
									<Check className="w-4 h-4" /> Priority support
								</li>
							</ul>
							<Button type="button" variant="pricingInverse">
								Select Portfolio
							</Button>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="py-40 px-8 bg-stone-100 flex flex-col items-center justify-center text-center">
				<motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
					<h2 className="font-serif text-5xl md:text-7xl mb-12 text-stone-800 max-w-3xl leading-[1.1]">
						Start building your rental brand today.
					</h2>
					<Button type="button" variant="heroDark" className="mx-auto flex items-center gap-2 group">
						Get started
						<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</Button>
				</motion.div>
			</section>

			{/* Footer */}
			<footer className="py-12 px-8 md:px-16 lg:px-24 border-t border-stone-200 bg-stone-50 flex flex-col md:flex-row justify-between items-center gap-6">
				<Link href="/">
				<Image src={stoneLogo} alt="Domus" className="w-20 h-20" />
				</Link>
				<div className="flex gap-6 text-sm text-stone-500 font-light relative md:absolute md:left-1/2 md:-translate-x-1/2">
					<a href="#" className="hover:text-stone-900 transition-colors text-3xl">
					<PiTwitterLogoThin />
					</a>
					<a href="#" className="hover:text-stone-900 transition-colors text-3xl">
					<PiInstagramLogoThin />
					</a>
					<a href="#" className="hover:text-stone-900 transition-colors text-3xl">
					<PiWhatsappLogoThin />
					</a>
				</div>
				<div className="text-sm text-stone-400 font-light">© 2026 Domus. All rights reserved.</div>
			</footer>
		</div>
	);
}
