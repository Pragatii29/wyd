// Seeds approved demo users and live WYDs for the WYD? demo. Safe to re-run.
// Run: npm run seed:demo   (needs SUPABASE_SERVICE_ROLE_KEY in .env.local)
//
// Demo users have @example.com emails and no password, so nobody can sign in as them.
// Their photos are generated initials avatars in public/demo/, not photos of real people.
// Seeding sends no notifications. Without the service role key, run supabase/seed/demo.sql instead.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

type Audience = "all" | "women" | "men";
type Demo = {
  email: string;
  name: string;
  gender: "female" | "male";
  age: number;
  city: string;
  area: string;
  bio: string;
  interests: string[];
  wyd: { body: string; audience: Audience; tags: string[]; minutesAgo: number };
};

const DEMOS: Demo[] = [
  {
    email: "ria.demo@example.com", name: "Ria Sharma", gender: "female", age: 22, city: "Bengaluru", area: "Indiranagar",
    bio: "Moved to Bangalore three months ago for my first job. I love slow mornings in new cafés, evening walks and live gigs on weekends. Always up for discovering a new corner of the city.",
    interests: ["coffee_cafes", "walking", "concerts", "photography", "exploring_city"],
    wyd: { body: "New to Bangalore, 22F. Anyone up for exploring cafes in Indiranagar today?", audience: "all", tags: ["coffee_cafes", "exploring_city"], minutesAgo: 12 },
  },
  {
    email: "arjun.demo@example.com", name: "Arjun Rao", gender: "male", age: 25, city: "Bengaluru", area: "Koramangala",
    bio: "Software engineer, weekend cricketer and street food hunter. I play box cricket most evenings and I'm always looking for a few more players.",
    interests: ["cricket", "football", "gym", "street_food"],
    wyd: { body: "Looking for people to play cricket this evening in Koramangala. Have a bat and ball!", audience: "all", tags: ["cricket"], minutesAgo: 35 },
  },
  {
    email: "meera.demo@example.com", name: "Meera Iyer", gender: "female", age: 27, city: "Bengaluru", area: "Jayanagar",
    bio: "Bookworm and filter coffee loyalist. I run a tiny book swap with friends and do yoga before work. Museums and quiet chai spots are my happy place.",
    interests: ["books", "chai", "art_museums", "yoga"],
    wyd: { body: "Chai and a book swap in Jayanagar at 5pm? Bring one you loved.", audience: "women", tags: ["chai", "books"], minutesAgo: 58 },
  },
  {
    email: "kabir.demo@example.com", name: "Kabir Singh", gender: "male", age: 24, city: "Bengaluru", area: "HSR Layout",
    bio: "Product designer by day, board game collector by night. I have way too many games and not enough people to play them with. Also into stand-up and movies.",
    interests: ["board_games", "gaming", "movies", "standup_comedy"],
    wyd: { body: "Board games night at a café in HSR, need 2 or 3 more for Catan.", audience: "all", tags: ["board_games"], minutesAgo: 90 },
  },
  {
    email: "ananya.demo@example.com", name: "Ananya Das", gender: "female", age: 23, city: "Bengaluru", area: "Whitefield",
    bio: "Weekend trekker and sunrise chaser. I run on weekdays and head out of the city whenever I can. Usually carrying a camera.",
    interests: ["trekking", "day_trips", "running", "photography"],
    wyd: { body: "Sunrise trek to Nandi Hills on Saturday, have 2 seats in the car.", audience: "women", tags: ["trekking", "day_trips"], minutesAgo: 140 },
  },
  {
    email: "rohan.demo@example.com", name: "Rohan Mehta", gender: "male", age: 28, city: "Mumbai", area: "Bandra",
    bio: "Film nerd who'll watch anything on a big screen. Love trying new restaurants in Bandra and catching live music when I can.",
    interests: ["movies", "food_exploring", "concerts", "nightlife"],
    wyd: { body: "Anyone up for watching a movie tonight in Bandra?", audience: "all", tags: ["movies"], minutesAgo: 25 },
  },
  {
    email: "zoya.demo@example.com", name: "Zoya Khan", gender: "female", age: 26, city: "Mumbai", area: "Andheri",
    bio: "Dancer, café hopper and occasional guitarist. I just moved to Andheri and want to find people to dance and jam with.",
    interests: ["dance", "music_jamming", "coffee_cafes", "shopping"],
    wyd: { body: "Salsa class in Andheri tonight, looking for a dance buddy!", audience: "all", tags: ["dance"], minutesAgo: 70 },
  },
  {
    email: "dev.demo@example.com", name: "Dev Malhotra", gender: "male", age: 29, city: "Delhi", area: "Hauz Khas",
    bio: "I cycle early, eat late and explore old Delhi lanes in between. Chai is non-negotiable.",
    interests: ["cycling", "food_exploring", "exploring_city", "chai"],
    wyd: { body: "Cycling around Lodhi Garden tomorrow morning, who's in?", audience: "all", tags: ["cycling"], minutesAgo: 45 },
  },
];

function dobFor(age: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age, 0, 15);
  return d.toISOString().slice(0, 10);
}

async function findUserId(email: string) {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  for (const d of DEMOS) {
    let id = await findUserId(d.email);
    if (!id) {
      const { data, error } = await supabase.auth.admin.createUser({ email: d.email, email_confirm: true });
      if (error) throw error;
      id = data.user.id;
    }

    const photo_url = `/demo/${d.email.split(".")[0]}.png`;

    const { error: pErr } = await supabase.from("profiles").upsert({
      id,
      name: d.name,
      dob: dobFor(d.age),
      gender: d.gender,
      photo_url,
      social_url: `https://instagram.com/${d.name.split(" ")[0].toLowerCase()}.wyd.demo`,
      bio: d.bio,
      interests: d.interests,
      city: d.city,
      area: d.area,
      status: "approved",
      rejection_reason: null,
      photo_check: { skipped: true, path: "demo seed" },
    });
    if (pErr) throw pErr;

    // Replace this demo user's WYDs so re-running keeps one fresh live WYD each.
    await supabase.from("threads").delete().eq("author_id", id);
    const { error: tErr } = await supabase.from("threads").insert({
      author_id: id,
      body: d.wyd.body,
      audience: d.wyd.audience,
      tags: d.wyd.tags,
      city: d.city,
      area: d.area,
      status: "live",
      moderation_reason: "Demo seed",
      created_at: new Date(Date.now() - d.wyd.minutesAgo * 60 * 1000).toISOString(),
    });
    if (tErr) throw tErr;
    console.log(`✓ ${d.name} (${d.gender}, ${d.city}) + WYD`);
  }
  console.log(`Seeded ${DEMOS.length} approved demo users with live WYDs. No notifications were sent.`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
