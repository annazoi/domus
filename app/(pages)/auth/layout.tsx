import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthMobileBrand } from "./_components/auth-mobile-brand";
import "./auth-shell.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="login-page">
      <aside className="login-aside">
        <Image
          src="/images/landing-hero.png"
          alt="Luxury apartment with mountain view"
          fill
          priority
          sizes="50vw"
          className="login-aside-hero object-cover"
        />
        <Link href="/" className="login-brand">
          <Image src="/images/logo.png" alt="Domus" width={200} height={200} />
        </Link>
        <h2 className="login-quote">
          Own your brand.
          <br />
          <span>Control</span> your business.
        </h2>
      </aside>

      <section className="login-form">
        <AuthMobileBrand />
        <div className="login-card">{children}</div>
      </section>    </main>
  );
}
