import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import "./auth-shell.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="login-page">
      <aside className="login-aside">
        <Image
          src="/images/hero.jpg"
          alt="Luxury apartment with mountain view"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <Link href="/" className="login-brand">
          Domus<span className="clay">.</span>
        </Link>
        <h2 className="login-quote">
          Own your brand.
          <br />
          <span>Control</span> your business.
        </h2>
      </aside>

      <section className="login-form">
        <div className="login-card">{children}</div>
      </section>
    </main>
  );
}
