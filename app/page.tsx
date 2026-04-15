"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div className="bg-stone-50 text-stone-900 font-sans min-h-screen selection:bg-stone-200">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 px-8 py-6 flex justify-between items-center text-stone-100 mix-blend-difference">
        <div className="font-serif text-2xl tracking-wide">Domus</div>
        <div className="hidden md:flex gap-8 text-sm font-light tracking-wide">
          <a href="#" className="hover:opacity-70 transition-opacity">Platform</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Showcase</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Pricing</a>
        </div>
        <button className="text-sm font-medium border border-stone-100/30 px-5 py-2 rounded-full hover:bg-stone-100 hover:text-stone-900 transition-colors">
          Log In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero_luxury_apartment_1776225273450.png"
          alt="Luxury minimalist apartment"
          fill
          className="object-cover object-center"
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
            className="bg-stone-50 text-stone-900 px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-stone-200 transition-colors flex items-center gap-2 group"
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
            { title: "Own your brand", desc: "Your domain, your aesthetics. Craft an unforgettable identity that guests remember and return to." },
            { title: "Direct bookings", desc: "Keep 100% of your revenue. Bypass marketplace fees and build direct relationships with your guests." },
            { title: "Full control", desc: "Manage pricing, availability, and guest communications on your terms, with elegant tools." }
          ].map((prop, i) => (
            <motion.div 
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="flex flex-col"
            >
              <h3 className="font-serif text-2xl mb-4 text-stone-800">{prop.title}</h3>
              <p className="text-stone-500 font-light leading-relaxed">{prop.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visual Showcase */}
      <section className="py-24 px-8 md:px-16 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-32">
          {/* Showcase 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="order-2 lg:order-1 relative aspect-[4/3] w-full"
            >
              <Image
                src="/images/tablet_mockup_listing_1776225336809.png"
                alt="Property listing on tablet"
                fill
                className="object-cover rounded-sm"
              />
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="order-1 lg:order-2 lg:pl-16 flex flex-col"
            >
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-800 leading-tight">Elevated property pages.</h2>
              <p className="text-stone-500 font-light text-lg mb-8 leading-relaxed max-w-md">
                Present your spaces with the architectural reverence they deserve. Large imagery, elegant typography, and a calm interface.
              </p>
              <a href="#" className="flex items-center gap-2 text-stone-900 border-b border-stone-300 pb-1 w-fit hover:border-stone-900 transition-colors text-sm uppercase tracking-widest">
                Explore Design <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Showcase 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:pr-16 flex flex-col"
            >
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-800 leading-tight">A seamless booking experience.</h2>
              <p className="text-stone-500 font-light text-lg mb-8 leading-relaxed max-w-md">
                No clutter, no distractions. A frictionless checkout flow that feels premium and builds trust instantly with your guests.
              </p>
              <a href="#" className="flex items-center gap-2 text-stone-900 border-b border-stone-300 pb-1 w-fit hover:border-stone-900 transition-colors text-sm uppercase tracking-widest">
                View Flow <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="relative aspect-[3/4] w-full max-w-md mx-auto"
            >
              <Image
                src="/images/phone_mockup_booking_1776225359748.png"
                alt="Booking flow on mobile"
                fill
                className="object-cover rounded-sm"
              />
            </motion.div>
          </div>
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
              { num: "01", title: "Create your page", desc: "Upload your photos and descriptions. We automatically format them into a magazine-quality layout." },
              { num: "02", title: "Customize your site", desc: "Select from curated typography pairs and subtle color palettes to match your property's essence." },
              { num: "03", title: "Start receiving bookings", desc: "Connect your bank account and begin accepting direct reservations with zero marketplace commission." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
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
            "Domus didn't just give us a website, they gave us our brand back. Our direct bookings doubled in three months."
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
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              className="border border-stone-200 p-12 bg-white flex flex-col items-center text-center rounded-sm"
            >
              <h3 className="font-serif text-2xl text-stone-800 mb-2">Essential</h3>
              <p className="text-stone-500 font-light mb-8">For single properties.</p>
              <div className="font-serif text-5xl text-stone-800 mb-8">$29<span className="text-lg text-stone-400 font-sans font-light">/mo</span></div>
              <ul className="text-stone-500 font-light space-y-4 mb-12 flex-1 w-full text-left max-w-xs">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-stone-800" /> Custom domain</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-stone-800" /> Secure checkout</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-stone-800" /> 0% booking fees</li>
              </ul>
              <button className="w-full border border-stone-800 text-stone-900 py-3 rounded-full text-sm hover:bg-stone-50 transition-colors">Select Essential</button>
            </motion.div>

            {/* Plan 2 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              className="border border-stone-800 p-12 bg-stone-900 text-stone-50 flex flex-col items-center text-center shadow-2xl rounded-sm"
            >
              <h3 className="font-serif text-2xl mb-2">Portfolio</h3>
              <p className="text-stone-400 font-light mb-8">For multiple listings.</p>
              <div className="font-serif text-5xl mb-8">$79<span className="text-lg text-stone-400 font-sans font-light">/mo</span></div>
              <ul className="text-stone-300 font-light space-y-4 mb-12 flex-1 w-full text-left max-w-xs">
                <li className="flex items-center gap-3"><Check className="w-4 h-4" /> Up to 10 properties</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4" /> Advanced analytics</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4" /> Priority support</li>
              </ul>
              <button className="w-full bg-stone-50 text-stone-900 py-3 rounded-full text-sm hover:bg-stone-200 transition-colors">Select Portfolio</button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-8 bg-stone-100 flex flex-col items-center justify-center text-center">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={fadeIn}
        >
          <h2 className="font-serif text-5xl md:text-7xl mb-12 text-stone-800 max-w-3xl leading-[1.1]">
            Start building your rental brand today.
          </h2>
          <button className="bg-stone-900 text-stone-50 px-10 py-5 rounded-full text-sm font-medium tracking-wide hover:bg-stone-800 transition-colors flex items-center gap-2 group mx-auto">
            Get started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 md:px-16 lg:px-24 border-t border-stone-200 bg-stone-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-serif text-xl tracking-wide text-stone-800">Domus</div>
        <div className="flex gap-6 text-sm text-stone-500 font-light">
          <a href="#" className="hover:text-stone-900 transition-colors">Twitter</a>
          <a href="#" className="hover:text-stone-900 transition-colors">Instagram</a>
          <a href="#" className="hover:text-stone-900 transition-colors">Email</a>
        </div>
        <div className="text-sm text-stone-400 font-light">
          © 2026 Domus. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
