import type { Metadata } from "next";
import { Fraunces, Instrument_Serif, Inter, Playfair_Display } from "next/font/google";
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

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Domus - Your rental house, beautifully online",
  description:
    "Domus is the rental platform for short-stay hosts. Custom templates, booking system, guest CRM and your own domain - in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${fraunces.variable} ${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="font-sans text-stone-900 bg-stone-50 selection:bg-stone-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
