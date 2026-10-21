import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { BadgeCheck, CircleAlert, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ageFrom, isAdminEmail } from "@/lib/profile";
import { btn, card, chip, meta, tagLabel } from "@/lib/ui";
import { decideProfile } from "./actions";

type PhotoCheck = { one_real_face?: boolean; reason?: string; skipped?: boolean; path?: string } | null;

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  if (!isAdminEmail(user.email)) notFound();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="mx-auto max-w-[480px] px-4 pt-10">
        <h1 className="font-display text-title">Admin</h1>
        <p className="mt-2 text-body text-danger">
          Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the server to review profiles.
        </p>
      </main>
    );
  }

  const { data: pending } = await createAdminClient()
    .from("profiles")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-[480px] px-4 pb-16 pt-10">
      <h1 className="font-display text-title">Admin</h1>
      <h2 className="mt-8 text-h2">Profiles to verify ({pending?.length ?? 0})</h2>

      {!pending?.length && <p className="mt-3 text-body text-ink-2">All caught up.</p>}

      <ul className="mt-4 flex flex-col gap-3">
        {pending?.map((p) => {
          const check = p.photo_check as PhotoCheck;
          return (
            <li key={p.id} className={`${card} flex flex-col gap-4`}>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-sunk">
                <Image src={p.photo_url} alt={`Photo of ${p.name}`} fill sizes="448px" className="object-cover" />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-h2">
                  {p.name}, {ageFrom(p.dob)}
                  {p.gender === "female" ? "F" : "M"}
                </p>
                <p className={meta}>
                  {p.area}, {p.city} · DOB {p.dob} · joined {new Date(p.created_at).toLocaleString("en-IN")}
                </p>
                <a href={p.social_url} target="_blank" rel="noreferrer" className={`${btn.ghost} self-start px-0`}>
                  <ExternalLink size={16} /> {p.social_url.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>

              <PhotoCheckRow check={check} />

              {p.bio && <p className="text-body text-ink-2">{p.bio}</p>}
              <div className="flex flex-wrap gap-2">
                {p.interests.map((t) => (
                  <span key={t} className={chip(false)}>
                    {tagLabel(t)}
                  </span>
                ))}
              </div>

              <form action={decideProfile} className="flex gap-3">
                <input type="hidden" name="id" value={p.id} />
                <button name="status" value="rejected" className={btn.secondary}>
                  Reject
                </button>
                <button name="status" value="approved" className={btn.primary}>
                  Approve
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function PhotoCheckRow({ check }: { check: PhotoCheck }) {
  if (!check || check.skipped) {
    return (
      <p className={`${meta} rounded-sm bg-sunk px-3 py-2`}>
        AI photo check skipped ({check?.path ?? "not run"}). Check the photo yourself.
      </p>
    );
  }
  return (
    <p className={`flex items-start gap-2 rounded-sm bg-sunk px-3 py-2 text-label ${check.one_real_face ? "text-success" : "text-danger"}`}>
      {check.one_real_face ? <BadgeCheck size={18} /> : <CircleAlert size={18} />}
      <span>
        {check.one_real_face ? "One real face" : "Photo needs a look"}: {check.reason}{" "}
        <span className={meta}>({check.path})</span>
      </span>
    </p>
  );
}
