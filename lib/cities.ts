// Cities a user can pick as their active city. WYDs are only discovered within the active city.
export const CITIES = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata"] as const;

export type City = (typeof CITIES)[number];

export function isCity(value: string): value is City {
  return (CITIES as readonly string[]).includes(value);
}
