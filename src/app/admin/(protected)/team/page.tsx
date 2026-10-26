"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

type TeamMember = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

type AdminRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  is_revoked: boolean;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminTeamPage() {
  const supabase = createBrowserClient();
  const [activeTab, setActiveTab] = useState<"team" | "admins" | "revoked">("team");

  // ─── PUBLIC TEAM STATE ─────────────────────────────────────────────────────
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", role: "", display_order: 0 });

  // ─── SYSTEM ADMINS STATE ───────────────────────────────────────────────────
  const [allAdmins, setAllAdmins] = useState<AdminRow[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "" });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Derived lists for the UI
  const activeAdmins = allAdmins.filter((a) => !a.is_revoked);
  const revokedAdmins = allAdmins.filter((a) => a.is_revoked);

  // ─── EFFECTS ───────────────────────────────────────────────────────────────

  useEffect(() => {
    loadMembers();
    loadAdmins();

    // Get current user ID to prevent self-revocation
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // ─── PUBLIC TEAM LOGIC ─────────────────────────────────────────────────────

  async function loadMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name, role, image_url, display_order, is_active")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMembers(data);
    }
    setLoading(false);
  }

  async function uploadImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `team/${fileName}`;

    const { error } = await supabase.storage.from("team-images").upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from("team-images").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleCreateMember(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      let imageUrl: string | null = null;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase.from("team_members").insert({
        name: form.name,
        role: form.role,
        image_url: imageUrl,
        display_order: Number(form.display_order) || 0,
        is_active: true,
      });

      if (error) throw error;

      setForm({ name: "", role: "", display_order: 0 });
      setImageFile(null);
      
      const fileInput = document.getElementById("team-image") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      
      await loadMembers();
    } catch (error: any) {
      alert(error.message || "Something went wrong while saving team member.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: TeamMember) {
    const { error } = await supabase
      .from("team_members")
      .update({ is_active: !member.is_active })
      .eq("id", member.id);

    if (!error) await loadMembers();
    else alert(error.message);
  }

  async function deleteMember(member: TeamMember) {
    if (!confirm("Delete this team member?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", member.id);
    if (!error) await loadMembers();
    else alert(error.message);
  }

  // ─── SYSTEM ADMINS LOGIC ───────────────────────────────────────────────────

  async function loadAdmins() {
    setAdminsLoading(true);
    const res = await fetch("/api/admin/users");
    setAllAdmins(res.ok ? await res.json() : []);
    setAdminsLoading(false);
  }

  async function handleInviteAdmin(e: React.FormEvent) {
    e.preventDefault();
    setInviteSubmitting(true);
    setInviteError(null);
    setInviteSuccess(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });

    if (!res.ok) {
      const data = await res.json();
      setInviteError(data.error ?? "Invite failed.");
      setInviteSubmitting(false);
      return;
    }

    setInviteSuccess(`Invitation sent to ${inviteForm.email}.`);
    setInviteForm({ email: "", full_name: "" });
    setInviteSubmitting(false);
    loadAdmins();
    
    setTimeout(() => setInviteOpen(false), 2500);
  }

  async function handleRevokeAdmin(id: string, name: string) {
    if (!confirm(`Are you sure you want to revoke admin access for ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to revoke admin.");
        return;
      }
      
      loadAdmins();
    } catch (err) {
      alert("An unexpected error occurred.");
    }
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Team Management</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage public profiles and system administrator access.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "team" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Public Team
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "admins" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Active Admins
          </button>
          <button
            onClick={() => setActiveTab("revoked")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "revoked" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Revoked
          </button>
        </div>
      </div>

      {/* ─── PUBLIC TEAM TAB ─── */}
      {activeTab === "team" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <form onSubmit={handleCreateMember} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                placeholder="Position held"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              />
              <input
                id="team-image"
                type="file"
                accept="image/*"
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <input
                type="number"
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
                placeholder="Display order"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-teal-500 px-5 py-3 font-medium text-slate-950 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Team Member"}
            </button>
          </form>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {loading ? (
              <p className="p-6 text-slate-400">Loading team members...</p>
            ) : members.length === 0 ? (
              <p className="p-6 text-slate-400">No team members added yet.</p>
            ) : (
              <div className="divide-y divide-white/10">
                {members.map((member) => (
                  <div key={member.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-slate-900">
                        {member.image_url ? (
                          <Image src={member.image_url} alt={member.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No image</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{member.name}</h3>
                        <p className="text-sm text-teal-300">{member.role}</p>
                        <p className="text-xs text-slate-500">
                          Order: {member.display_order} • {member.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(member)}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
                      >
                        {member.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMember(member)}
                        className="rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ─── ACTIVE ADMINS TAB ─── */}
      {activeTab === "admins" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-end">
            <button
              onClick={() => { setInviteOpen(true); setInviteError(null); setInviteSuccess(null); }}
              className="rounded-xl bg-teal-500 px-5 py-3 font-medium text-slate-950 hover:bg-teal-400 transition-colors"
            >
              + Invite Administrator
            </button>
          </div>
          <AdminTable 
            admins={activeAdmins} 
            currentUserId={currentUserId} 
            handleRevoke={handleRevokeAdmin} 
            isRevokedTab={false} 
            loading={adminsLoading} 
          />
        </div>
      )}

      {/* ─── REVOKED ADMINS TAB ─── */}
      {activeTab === "revoked" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-sm text-slate-400">
              These accounts were previously admins but have had their access revoked. To restore access, go to the "Active Admins" tab and invite them again using the same email.
            </p>
          </div>
          <AdminTable 
            admins={revokedAdmins} 
            currentUserId={currentUserId} 
            handleRevoke={handleRevokeAdmin} 
            isRevokedTab={true} 
            loading={adminsLoading} 
          />
        </div>
      )}

      {/* ─── INVITE ADMIN MODAL ─── */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Invite a new admin</h2>
            
            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Full name</label>
                <input
                  required
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Email address</label>
                <input
                  required
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="jane@omspglobal.org"
                />
              </div>

              {inviteError && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{inviteError}</p>}
              {inviteSuccess && <p className="text-sm text-teal-400 bg-teal-500/10 p-3 rounded-lg border border-teal-500/20">{inviteSuccess}</p>}
              
              <p className="text-xs text-slate-500 pt-2">
                An invitation email will be sent. The new admin will set their own password.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400 disabled:opacity-50 transition-colors"
                >
                  {inviteSubmitting ? "Sending…" : "Send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── REUSABLE ADMIN TABLE COMPONENT ───

function AdminTable({ admins, currentUserId, handleRevoke, isRevokedTab, loading }: {
  admins: AdminRow[];
  currentUserId: string | null;
  handleRevoke: (id: string, name: string) => void;
  isRevokedTab: boolean;
  loading: boolean;
}) {
  if (loading) {
    return <p className="p-6 text-slate-400">Loading administrators...</p>;
  }
  
  if (admins.length === 0) {
    return <p className="p-6 text-slate-400">No {isRevokedTab ? "revoked" : "active"} administrators found.</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-white/10 text-slate-400 bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Date Added</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-white font-medium">
                  {admin.full_name || "—"}
                  {admin.id === currentUserId && (
                    <span className="ml-2 text-xs text-teal-400 font-normal">(You)</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-300">{admin.email}</td>
                <td className="px-6 py-4 text-slate-400">
                  {new Date(admin.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {!isRevokedTab && admin.id !== currentUserId && (
                    <button
                      onClick={() => handleRevoke(admin.id, admin.full_name || admin.email)}
                      className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      Revoke Access
                    </button>
                  )}
                  {isRevokedTab && (
                    <span className="text-xs text-slate-500 italic bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                      Revoked
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}