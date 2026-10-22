import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, Poppins } from "next/font/google";
import "./globals.css";

// Airbnb typography: one friendly geometric sans for everything. Airbnb Cereal isn't licensed for use,
// so DM Sans is the free stand-in (headlines bold and tight, body regular).
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Headlines: clean geometric Poppins, set light and large like the luxury app references.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
});

// One editorial accent: an italic serif for a single highlighted phrase.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "WYD?",
  description: "Find company for everyday plans in your city.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={`${dmSans.variable} ${poppins.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint. Midnight (dark) is the default. */}
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
