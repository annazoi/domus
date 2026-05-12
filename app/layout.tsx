import type { Metadata } from "next";
import { Fraunces, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./page.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Domus | Create Your Branded Rental Platform",
  description: "A premium white-label solution for luxury vacation rental brands. Own your bookings, control your brand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="font-sans text-stone-900 bg-stone-50 selection:bg-stone-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
