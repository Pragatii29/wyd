import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/profile";
import { Welcome } from "@/components/Welcome";

// Front door: signed-out visitors start sign-up at step 1 (or sign in); signed-in users go to their place.
export default async function Landing() {
  const { user, profile } = await getSession();
  if (user) redirect(homeFor(profile));
  return <Welcome />;
}
