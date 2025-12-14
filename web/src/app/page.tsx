import { redirect } from "next/navigation";

// Startseite leitet nun klar auf das Dashboard weiter.
export default function RootPage() {
  redirect("/dashboard");
}
