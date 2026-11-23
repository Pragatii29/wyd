import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Logo } from "@/components/Logo";
import { page } from "@/lib/ui";

export const metadata = { title: "Contact · WYD?" };

// Public "Questions? Contact us" page: open to everyone, signed in or not.
export default function ContactPage() {
  return (
    <main className={`${page} pb-16 pt-6`}>
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <Link href="/" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back">
          <ArrowLeft size={22} />
        </Link>
        <Logo className="mx-auto h-6 w-auto text-ink" spark />
        <span />
      </div>
      <h1 className="mt-10 text-center font-display text-title">Questions? Ask us.</h1>
      <p className="mx-auto mt-2 max-w-xs text-center text-body text-ink-2">
        Send us a message and we&apos;ll reply by email. You&apos;ll get a confirmation straight away.
      </p>
      <ContactForm />
    </main>
  );
}
