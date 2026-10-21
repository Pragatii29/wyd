// Relative .ts import so `node --test lib/fallback.test.ts` can run this file directly.
import { TAGS, type Tag } from "./tags.ts";

// Rule-based fallback used whenever the Gemini path fails. Works with zero keys.

const TAG_KEYWORDS: Record<Tag, string[]> = {
  chai: ["chai", "tapri", "tea", "cutting chai", "filter coffee"],
  coffee_cafes: ["coffee", "cafe", "café", "brunch", "espresso", "latte", "third wave", "coffee spot"],
  food_exploring: ["food", "foodie", "restaurant", "dinner", "lunch", "eat out", "biryani", "dosa", "cuisine"],
  street_food: ["street food", "chaat", "pani puri", "golgappa", "vv puram", "food street", "momos"],
  walking: ["walk", "stroll", "cubbon", "lalbagh", "lal bagh", "evening walk"],
  running: ["run", "running", "jog", "jogging", "marathon", "5k", "10k"],
  cycling: ["cycle", "cycling", "bike ride", "biking"],
  trekking: ["trek", "trekking", "hike", "hiking", "nandi hills", "skandagiri", "savandurga"],
  tennis: ["tennis"],
  badminton: ["badminton", "shuttle"],
  football: ["football", "futsal", "soccer"],
  cricket: ["cricket", "box cricket", "ipl", "rcb"],
  gym: ["gym", "workout", "lifting", "crossfit", "fitness"],
  yoga: ["yoga", "pilates", "meditation"],
  movies: ["movie", "film", "cinema", "pvr", "inox", "netflix"],
  concerts: ["gig", "concert", "live music", "music festival", "show at"],
  standup_comedy: ["standup", "stand-up", "stand up", "comedy", "open mic"],
  house_parties: ["house party", "house parties", "party at"],
  nightlife: ["pub", "bar", "club", "clubbing", "nightlife", "brewery", "drinks"],
  board_games: ["board game", "boardgame", "catan", "chess", "cards", "uno"],
  gaming: ["gaming", "video game", "playstation", "ps5", "xbox", "valorant", "bgmi"],
  shopping: ["shopping", "thrift", "flea market", "commercial street", "mall"],
  art_museums: ["art", "museum", "gallery", "exhibition", "ngma"],
  books: ["book", "reading", "bookstore", "library", "blossom", "book club"],
  photography: ["photography", "photo walk", "photowalk", "camera", "photos"],
  day_trips: ["day trip", "road trip", "drive to", "mysore", "nandi"],
  travel_trips: ["travel", "trip", "backpacking", "goa", "coorg", "gokarna", "weekend getaway"],
  exploring_city: ["explore", "exploring", "new places", "heritage", "city walk", "around the city"],
  music_jamming: ["jam", "jamming", "guitar", "sing", "singing", "ukulele", "band"],
  dance: ["dance", "dancing", "salsa", "bachata", "zumba"],
  study_cowork: ["study", "cowork", "co-work", "work from cafe", "wfc", "library session"],
  volunteering: ["volunteer", "volunteering", "ngo", "animal shelter", "cleanup", "charity"],
};

const BENGALURU_AREAS = [
  "Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Jayanagar", "JP Nagar",
  "BTM Layout", "Marathahalli", "Malleshwaram", "Basavanagudi", "Bellandur",
  "Electronic City", "Hebbal", "Yelahanka", "MG Road", "Church Street", "Ulsoor",
  "Rajajinagar", "Banashankari", "Sarjapur", "Frazer Town", "Domlur", "Shivajinagar",
  "Sadashivanagar", "RT Nagar", "Kalyan Nagar", "Banaswadi", "Hennur", "Yeshwanthpur",
];

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function has(text: string, phrase: string) {
  return new RegExp(`\\b${escape(phrase)}(s|es)?\\b`, "i").test(text);
}

export function fallbackTags(text: string, max: number): Tag[] {
  return TAGS.filter((tag) => TAG_KEYWORDS[tag].some((kw) => has(text, kw))).slice(0, max);
}

export function fallbackArea(text: string): string | null {
  return BENGALURU_AREAS.find((area) => has(text, area)) ?? null;
}

// WYD safety: unsafe blocklist first, then ambiguous phrases for review, else safe.

export type Verdict = "safe" | "unsafe" | "review";

const UNSAFE: { reason: string; words: string[] }[] = [
  {
    reason: "Please keep plans free of sexual content.",
    words: [
      "sex", "sexy", "hookup", "hook up", "nudes", "nude", "naked", "nsfw", "fwb",
      "one night stand", "horny", "escort", "sugar daddy", "sugar baby", "onlyfans", "massage at",
    ],
  },
  {
    reason: "Please keep it kind. No abuse or slurs.",
    words: [
      "fuck", "fucking", "bitch", "bastard", "slut", "whore", "asshole", "chutiya",
      "madarchod", "behenchod", "bhenchod", "randi", "harami",
    ],
  },
  {
    reason: "Drugs aren't allowed on WYD?.",
    words: ["weed", "ganja", "cocaine", "mdma", "lsd", "molly", "drugs", "charas", "hash", "stoned", "joint"],
  },
  {
    reason: "Please don't ask for money or payments.",
    words: ["pay", "upi", "send money", "paytm", "gpay", "phonepe", "bank details", "transfer money", "investment"],
  },
  { reason: "That venue isn't OK for a WYD.", words: ["brothel", "strip club", "red light", "spa happy ending"] },
  { reason: "Please keep it peaceful.", words: ["beat up", "gun", "knife", "fight someone"] },
  { reason: "WYD? is for adults only.", words: ["minor", "underage", "school girl", "schoolgirl", "school boy"] },
];

// House number followed by a road, cross or main ("42, 5th cross", "#12 3rd main", "flat 304").
const ADDRESS_PATTERN =
  /(#\s*\d{1,4})|\b(no\.?|house no\.?|flat)\s*\d{1,4}\b|\b\d{1,4}[a-z]?\s*[,/]\s*\d{1,2}(st|nd|rd|th)?\s+(cross|main|road)\b/i;

const REVIEW_PHRASES = [
  "come alone", "my place", "my room", "just us two", "no questions", "late night only", "hotel room",
];

export function fallbackSafety(text: string): { verdict: Verdict; reason: string } {
  for (const group of UNSAFE) {
    if (group.words.some((w) => has(text, w))) return { verdict: "unsafe", reason: group.reason };
  }
  if (ADDRESS_PATTERN.test(text)) return { verdict: "unsafe", reason: "Please don't share a home address." };
  if (REVIEW_PHRASES.some((p) => has(text, p))) {
    return { verdict: "review", reason: "We'll take a quick look before this goes live." };
  }
  return { verdict: "safe", reason: "Looks like a fun plan." };
}

export function fallbackWyd(text: string) {
  return { ...fallbackSafety(text), tags: fallbackTags(text, 3) };
}

export function fallbackProfile(bio: string) {
  const interests = fallbackTags(bio, 10);
  const area = fallbackArea(bio);
  const missing_fields: ("interests" | "area")[] = [];
  if (interests.length === 0) missing_fields.push("interests");
  if (!area) missing_fields.push("area");
  return { interests, area, missing_fields };
}
