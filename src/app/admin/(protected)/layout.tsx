import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import AdminShell from "@/components/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login?error=unauthorized");
  }

  return (
    <AdminShell
      user={{
        email: profile.email,
        full_name: profile.full_name,
      }}
    >
      {children}
    </AdminShell>
  );
}
