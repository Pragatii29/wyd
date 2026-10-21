import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { page } from "@/lib/ui";

export const metadata = { title: "Privacy · WYD?" };

const SECTIONS = [
  {
    title: "Manual verification",
    body: "A person on our team looks at your name, phone number, photo, LinkedIn (or other social) link and About to check you're real. Your phone number is private: only you and our team can see it, and it's never shown on your profile. We never ask for government IDs or social media passwords. Verification lowers the risk of fake profiles but is not an identity guarantee.",
  },
  {
    title: "AI suggestions",
    body: "If you tap “Suggest interests”, your About text is sent to Google Gemini (or a simple keyword matcher) to suggest interests. Nothing is saved until you confirm it, and you can edit or remove it at any time. We don't read your social accounts. Your photo is checked by AI only to help our team spot non-human or group photos. It never approves anyone on its own.",
  },
  {
    title: "What others see",
    body: "Other verified people see your first name, age, photo, About, interests, city and broad area. They never see your phone number, birthday, email or exact location. Your social link is only shown to our team and to people whose plans you ask to join.",
  },
  {
    title: "Location",
    body: "We use the city you pick, never your live GPS. Switch cities any time from the feed.",
  },
  {
    title: "Notifications",
    body: "If you turn on alerts, your browser gives us a push address so we can tell you about new plans in your city. Lock-screen alerts never include names. Turn them off from your profile at any time.",
  },
  {
    title: "Safety tools",
    body: "You can report any plan, profile or message and block anyone. Blocked people can't see your plans, ask to join or message you. Posts are screened automatically before they go live, which helps but can't guarantee anyone's safety. Meet in public and tell a friend where you're going.",
  },
];

export default function PrivacyPage() {
  return (
    <main className={`${page} pb-16 pt-6`}>
      <Link href="/" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="mt-2 font-display text-title">Privacy, simply</h1>
      <div className="mt-6 flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-h2">{s.title}</h2>
            <p className="mt-2 text-body text-ink-2">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
