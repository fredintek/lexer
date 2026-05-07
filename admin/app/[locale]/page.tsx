import { redirect } from "next/navigation";

export default function Home() {
  // This happens on the server, so the user never sees the "Home" content
  redirect("/dashboard");
}
