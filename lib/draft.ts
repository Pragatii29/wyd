// Step 1 of sign-up is filled in before the email link, so it's kept on this device until the
// profile is created. Client-only; never holds anything beyond what the user typed into step 1.
export type SignupDraft = { email: string; name: string; phone: string; social_url: string };

const KEY = "wyd-signup-draft";

export function saveDraft(d: SignupDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

export function readDraftRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function parseDraft(raw: string | null): SignupDraft | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Partial<SignupDraft>;
    return { email: d.email ?? "", name: d.name ?? "", phone: d.phone ?? "", social_url: d.social_url ?? "" };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
