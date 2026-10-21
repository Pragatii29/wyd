import { Mars, Users, Venus, type LucideIcon } from "lucide-react";
import type { Enums } from "@/lib/database.types";

export type Audience = Enums<"audience_t">;

// Neutral labels with an icon; never colour-coded by gender (DESIGN.md).
export const AUDIENCES: { value: Audience; label: string; icon: LucideIcon; helper: string }[] = [
  { value: "all", label: "Everyone", icon: Users, helper: "Every verified person nearby can see this." },
  { value: "women", label: "Women only", icon: Venus, helper: "Only verified women will see this." },
  { value: "men", label: "Men only", icon: Mars, helper: "Only verified men will see this." },
];
