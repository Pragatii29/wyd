"use client";

import { useSyncExternalStore } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { SignupSlides } from "@/components/SignupSlides";
import { parseDraft, readDraftRaw } from "@/lib/draft";
import type { Tables } from "@/lib/database.types";

// New members get the one-question-per-screen sign-up, picking up the name typed on the welcome page
// (saved on this device). A rejected profile being fixed gets the full form instead.
export function OnboardingWizard(props: {
  userId: string;
  initial: Tables<"profiles"> | null;
  initialPhone: string;
  hasSelfie?: boolean;
  submitLabel: string;
  next: string;
}) {
  const raw = useSyncExternalStore(() => () => {}, readDraftRaw, () => null);
  if (props.initial) return <ProfileForm {...props} />;
  const draft = parseDraft(raw);
  // Remount once the draft is read in the browser so the slides start from it.
  return <SignupSlides key={draft ? "draft" : "blank"} userId={props.userId} draft={draft} hasSelfie={props.hasSelfie} />;
}
