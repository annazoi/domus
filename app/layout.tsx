import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";
import "./page.css";
import { Providers } from "./providers";

const domusFont = Source_Serif_4({
  variable: "--font-domus",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={`${domusFont.variable} h-full antialiased`}>
      <body className="font-sans bg-cream text-espresso selection:bg-camel/25 selection:text-espresso">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
