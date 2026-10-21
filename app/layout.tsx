import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// Airbnb typography: one friendly geometric sans for everything. Airbnb Cereal isn't licensed for use,
// so DM Sans is the free stand-in (headlines bold and tight, body regular).
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "WYD?",
  description: "Find company for everyday plans in your city.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" className={dmSans.variable} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint. Light is the default. */}
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
