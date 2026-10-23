export const TAGS = [
  "chai", "coffee_cafes", "food_exploring", "street_food", "walking", "running",
  "cycling", "trekking", "tennis", "badminton", "football", "cricket", "gym", "yoga",
  "movies", "concerts", "standup_comedy", "house_parties", "nightlife", "board_games",
  "gaming", "shopping", "art_museums", "books", "photography", "day_trips",
  "travel_trips", "exploring_city", "music_jamming", "dance", "study_cowork",
  "volunteering",
] as const;

export type Tag = (typeof TAGS)[number];

// A small picture for each interest on the sign-up interests screen.
export const TAG_EMOJI: Record<Tag, string> = {
  chai: "☕", coffee_cafes: "🥐", food_exploring: "🍜", street_food: "🌮", walking: "🚶", running: "🏃",
  cycling: "🚴", trekking: "🥾", tennis: "🎾", badminton: "🏸", football: "⚽", cricket: "🏏", gym: "🏋️",
  yoga: "🧘", movies: "🎬", concerts: "🎤", standup_comedy: "😂", house_parties: "🏠", nightlife: "🪩",
  board_games: "🎲", gaming: "🎮", shopping: "🛍️", art_museums: "🖼️", books: "📚", photography: "📷",
  day_trips: "🚗", travel_trips: "✈️", exploring_city: "🗺️", music_jamming: "🎸", dance: "💃",
  study_cowork: "💻", volunteering: "🤝",
};
