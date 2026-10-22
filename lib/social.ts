// The optional social profile link: people pick a platform and paste a handle or a link.
export const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/yourname", profile: (h: string) => `https://www.linkedin.com/in/${h}` },
  { id: "instagram", label: "Instagram", placeholder: "@yourhandle", profile: (h: string) => `https://www.instagram.com/${h}` },
  { id: "x", label: "X", placeholder: "@yourhandle", profile: (h: string) => `https://x.com/${h}` },
  { id: "threads", label: "Threads", placeholder: "@yourhandle", profile: (h: string) => `https://www.threads.net/@${h}` },
  { id: "other", label: "Other", placeholder: "https://…", profile: null },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

// Accepted hosts, mapped to the name we show next to the link.
const HOSTS: Record<string, string> = {
  "linkedin.com": "LinkedIn",
  "instagram.com": "Instagram",
  "x.com": "X",
  "twitter.com": "X",
  "threads.net": "Threads",
  "threads.com": "Threads",
  "facebook.com": "Facebook",
  "snapchat.com": "Snapchat",
  "youtube.com": "YouTube",
  "github.com": "GitHub",
  "behance.net": "Behance",
  "dribbble.com": "Dribbble",
  "medium.com": "Medium",
};

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").replace(/^m\./, "");
  } catch {
    return null;
  }
}

// "LinkedIn", "Instagram"…, or null for a link we don't accept.
export function platformName(url: string) {
  const host = hostOf(url);
  if (!host) return null;
  const match = Object.keys(HOSTS).find((h) => host === h || host.endsWith(`.${h}`));
  return match ? HOSTS[match] : null;
}

export function isValidSocialUrl(url: string) {
  return url.startsWith("https://") && !/\s/.test(url) && platformName(url) !== null;
}

// Turns what the person typed into a full link: a handle becomes that platform's profile link.
// Empty stays empty (the link is optional).
export function toSocialUrl(platform: PlatformId, value: string) {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v.replace(/^http:\/\//i, "https://");
  if (/^[\w.-]+\.[a-z]{2,}\//i.test(v)) return `https://${v}`;
  const p = PLATFORMS.find((x) => x.id === platform);
  const handle = v.replace(/^@/, "");
  return p?.profile && /^[\w.-]+$/.test(handle) ? p.profile(handle) : v;
}

// Which tab to preselect when editing a saved link.
export function platformOf(url: string | null | undefined): PlatformId {
  const name = url ? platformName(url) : null;
  return (PLATFORMS.find((p) => p.label === name)?.id ?? (url ? "other" : "linkedin")) as PlatformId;
}

export const SOCIAL_ERROR = "That link doesn't look right. Use a LinkedIn, Instagram, X or Threads profile (or leave it empty).";
