import type { Enums } from "@/lib/database.types";

export type Gender = Enums<"gender_t">;

// Options shown at sign-up and in Edit profile. No "prefer not to say": Women only / Men only plans need it.
export const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Man" },
  { value: "female", label: "Woman" },
  { value: "non_binary", label: "Non-binary" },
];

// The letter after someone's age ("Ria, 22F"). Non-binary people show their age only.
export function genderLetter(g: Gender) {
  return g === "female" ? "F" : g === "male" ? "M" : "";
}
