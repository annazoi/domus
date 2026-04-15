import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row antialiased text-stone-900 font-sans selection:bg-stone-200">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 relative bg-stone-900 overflow-hidden">
        <Image
          src="/images/hero_luxury_apartment_1776225273450.png"
          alt="Luxury apartment interior"
          fill
          className="object-cover object-center opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 to-transparent" />
        <div className="absolute bottom-16 left-16 max-w-md text-stone-50 z-10">
          <Link href="/" className="font-serif text-3xl mb-8 block hover:opacity-80 transition-opacity">
            Domus
          </Link>
          <h2 className="font-serif text-4xl leading-tight text-white/90">
            Own your brand. <br /> Control your business.
          </h2>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-32 py-12 relative overflow-y-auto">
        <div className="md:hidden absolute top-8 left-8">
          <Link href="/" className="font-serif text-2xl text-stone-900">
            Domus
          </Link>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
