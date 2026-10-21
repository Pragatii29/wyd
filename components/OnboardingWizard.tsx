"use client";

import { useSyncExternalStore } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { parseDraft, readDraftRaw } from "@/lib/draft";
import type { Tables } from "@/lib/database.types";

// Picks up step 1 from the welcome page (saved on this device) so sign-up resumes at step 2.
export function OnboardingWizard(props: {
  userId: string;
  initial: Tables<"profiles"> | null;
  initialPhone: string;
  hasSelfie?: boolean;
  submitLabel: string;
  next: string;
}) {
  const raw = useSyncExternalStore(() => () => {}, readDraftRaw, () => null);
  const draft = props.initial ? null : parseDraft(raw);
  // Remount once the draft is read in the browser so the form starts from it.
  return <ProfileForm key={draft ? "draft" : "blank"} {...props} draft={draft} wizard />;
}
