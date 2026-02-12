import { clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function LogoutPage() {
  async function logout() {
    "use server";
    await clearSession();
    redirect("/login");
  }

  return (
    <form action={logout} className="p-10">
      <button type="submit">Kijelentkezés...</button>
    </form>
  );
}
