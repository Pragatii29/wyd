import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BadgeCheck, CircleAlert, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { ageFrom, isAdminEmail } from "@/lib/profile";
import { approveProfile, approveWyd, blockWyd, rejectProfile, resolveReport, suspendProfile } from "@/app/actions/admin";
import { AudienceChip } from "@/components/AudienceChip";
import { btn, card, chip, input, meta, page, tagLabel, timeAgo } from "@/lib/ui";

type PhotoCheck = { one_real_face?: boolean; reason?: string; skipped?: boolean; path?: string } | null;

export default async function AdminPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect("/");
  if (!isAdminEmail(user.email)) notFound();

  const { data: setting } = await (await createClient()).from("app_settings").select("value").eq("key", "auto_approve").maybeSingle();
  const demoMode = setting?.value === true;
  const demoNote = (
    <p className={`mt-3 rounded-card px-4 py-3 text-label ${demoMode ? "bg-candle text-ink" : "bg-sunk text-ink"}`}>
      {demoMode
        ? "Demo mode is on: new sign-ups are approved instantly. You can still reject or suspend anyone here."
        : "Manual review is on: new sign-ups wait here until you approve them."}
    </p>
  );

  if (!hasServiceRole()) {
    return (
      <main className={`${page} pt-10`}>
        <h1 className="font-display text-title">Admin</h1>
        {demoNote}
        <p className="mt-4 rounded-card border border-danger bg-surface p-4 text-body text-ink">
          Add <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to <code className="font-mono">.env.local</code> and restart the
          server to review profiles, WYDs and reports.
        </p>
      </main>
    );
  }

  const admin = createAdminClient();
  const [{ data: pending }, { data: review }, { data: reports }, { count: approvedCount }] = await Promise.all([
    admin.from("profiles").select("*, private:profile_private(phone)").eq("status", "pending").order("created_at"),
    admin
      .from("threads")
      .select("*, author:profiles!threads_author_id_fkey(name)")
      .eq("status", "review")
      .order("created_at"),
    admin.from("reports").select("*").order("created_at", { ascending: false }).limit(50),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
  ]);

  return (
    <main className={`${page} pb-16 pt-10`}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-title">Admin</h1>
        <Link href="/feed" className={btn.ghost}>
          Back to app
        </Link>
      </div>
      <p className={`${meta} mt-1`}>{approvedCount ?? 0} approved members</p>
      {demoNote}

      <h2 className="mt-8 text-h2">Profiles to verify ({pending?.length ?? 0})</h2>
      {!pending?.length && <p className="mt-2 text-body text-ink-2">All caught up.</p>}
      <ul className="mt-4 flex flex-col gap-3">
        {pending?.map((p) => (
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
                {[p.area, p.city].filter(Boolean).join(", ")} · DOB {p.dob} · submitted {timeAgo(p.created_at)}
              </p>
              <p className="text-label">
                Phone: <span className="font-mono">{p.private?.phone ?? "not given"}</span>
              </p>
              <a href={p.social_url} target="_blank" rel="noreferrer noopener" className={`${btn.ghost} self-start px-0`}>
                <ExternalLink size={16} /> {p.social_url.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </div>
            <PhotoCheckRow check={p.photo_check as PhotoCheck} />
            {p.bio && <p className="whitespace-pre-line text-body text-ink-2">{p.bio}</p>}
            <div className="flex flex-wrap gap-2">
              {p.interests.map((t) => (
                <span key={t} className={chip(false)}>
                  {tagLabel(t)}
                </span>
              ))}
            </div>
            <form action={approveProfile}>
              <input type="hidden" name="id" value={p.id} />
              <button className={btn.primary}>Approve</button>
            </form>
            <form action={rejectProfile} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={p.id} />
              <label htmlFor={`reason-${p.id}`} className="sr-only">
                Reason for rejecting
              </label>
              <input
                id={`reason-${p.id}`}
                name="reason"
                required
                placeholder="Reason, shown to them (e.g. photo is a group shot)"
                className={input}
              />
              <button className={btn.secondary}>Reject with reason</button>
            </form>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-h2">WYDs in review ({review?.length ?? 0})</h2>
      {!review?.length && <p className="mt-2 text-body text-ink-2">Nothing waiting.</p>}
      <ul className="mt-4 flex flex-col gap-3">
        {review?.map((t) => (
          <li key={t.id} className={`${card} flex flex-col gap-3`}>
            <p className={meta}>
              {t.author?.name} · {t.city} · {timeAgo(t.created_at)}
            </p>
            <p className="text-wyd">{t.body}</p>
            <div className="flex flex-wrap items-center gap-2">
              <AudienceChip audience={t.audience} />
              <span className={meta}>Flag: {t.moderation_reason}</span>
            </div>
            <div className="flex gap-3">
              <form action={blockWyd} className="flex-1">
                <input type="hidden" name="id" value={t.id} />
                <button className={btn.secondary}>Block</button>
              </form>
              <form action={approveWyd} className="flex-1">
                <input type="hidden" name="id" value={t.id} />
                <button className={btn.primary}>Publish</button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-h2">Reports ({reports?.length ?? 0})</h2>
      {!reports?.length && <p className="mt-2 text-body text-ink-2">No reports.</p>}
      <ul className="mt-4 flex flex-col gap-3">
        {reports?.map((r) => (
          <li key={r.id} className={`${card} flex flex-col gap-3`}>
            <p className={meta}>
              {r.target_type} · {timeAgo(r.created_at)} · reporter {r.reporter_id.slice(0, 8)}
            </p>
            <p className="text-body">{r.reason || "No reason given."}</p>
            <ReportTarget type={r.target_type} id={r.target_id} />
            <div className="flex gap-3">
              <form action={resolveReport} className="flex-1">
                <input type="hidden" name="id" value={r.id} />
                <button className={btn.secondary}>Resolve</button>
              </form>
              {r.target_type === "thread" && (
                <form action={blockWyd} className="flex-1">
                  <input type="hidden" name="id" value={r.target_id} />
                  <button className={btn.danger}>Block WYD</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

async function ReportTarget({ type, id }: { type: string; id: string }) {
  const admin = createAdminClient();
  if (type === "profile") {
    const { data } = await admin.from("profiles").select("id, name, status").eq("id", id).maybeSingle();
    if (!data) return <p className={meta}>Profile no longer exists.</p>;
    return (
      <div className="flex items-center justify-between gap-3 rounded-sm bg-sunk px-3 py-2">
        <span className="text-label">
          {data.name} <span className={meta}>({data.status})</span>
        </span>
        <form action={suspendProfile}>
          <input type="hidden" name="id" value={data.id} />
          <button className={btn.ghost}>Suspend</button>
        </form>
      </div>
    );
  }
  if (type === "thread") {
    const { data } = await admin.from("threads").select("body, status").eq("id", id).maybeSingle();
    return <p className="rounded-sm bg-sunk px-3 py-2 text-body">{data ? `“${data.body}” (${data.status})` : "WYD deleted."}</p>;
  }
  const { data } = await admin
    .from("messages")
    .select("body, sender:profiles!messages_sender_id_fkey(id, name, status)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return <p className={meta}>Message deleted.</p>;
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm bg-sunk px-3 py-2">
      <span className="text-body">
        {data.sender?.name}: “{data.body}”
      </span>
      {data.sender && (
        <form action={suspendProfile}>
          <input type="hidden" name="id" value={data.sender.id} />
          <button className={btn.ghost}>Suspend sender</button>
        </form>
      )}
    </div>
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
        {check.one_real_face ? "One real face" : "Photo needs a look"}: {check.reason} <span className={meta}>({check.path})</span>
      </span>
    </p>
  );
}
