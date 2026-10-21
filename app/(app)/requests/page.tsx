import { redirect } from "next/navigation";

// Requests grouped by plan now live in My WYDs.
export default function RequestsPage() {
  redirect("/wyds");
}
