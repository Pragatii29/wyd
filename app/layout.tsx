import type { Metadata } from "next";
import { DM_Mono, Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

// oddtables type system: an editorial serif for headlines (Instrument Serif, the closest free match
// to their Swear Display), Geist for everything you read, DM Mono for small metadata.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "WYD?",
  description: "Find company for everyday plans in your city.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={`${instrument.variable} ${geist.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint. Night (dark) is the default. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("wyd-theme");if(t==="light"||t==="dark"||t==="system")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans text-body antialiased">{children}</body>
    </html>
  );
}
