"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export default function AdminTeamPage() {
  const supabase = createBrowserClient();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    display_order: 0,
  });

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

  useEffect(() => {
    loadMembers();
  }, []);

  async function uploadImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `team/${fileName}`;

    const { error } = await supabase.storage
      .from("team-images")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("team-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleCreate(e: React.FormEvent) {
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

      setForm({
        name: "",
        role: "",
        display_order: 0,
      });

      setImageFile(null);

      const fileInput = document.getElementById(
        "team-image"
      ) as HTMLInputElement | null;

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

    if (!error) {
      await loadMembers();
    } else {
      alert(error.message);
    }
  }

  async function deleteMember(member: TeamMember) {
    const confirmDelete = confirm("Delete this team member?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", member.id);

    if (!error) {
      await loadMembers();
    } else {
      alert(error.message);
    }
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Team Members</h1>
        <p className="mt-2 text-sm text-slate-400">
          Upload team photos and positions shown on the OMSP About section.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
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
            onChange={(e) =>
              setForm({ ...form, display_order: Number(e.target.value) })
            }
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
              <div
                key={member.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-slate-900">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                        No image
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-teal-300">{member.role}</p>
                    <p className="text-xs text-slate-500">
                      Order: {member.display_order} •{" "}
                      {member.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(member)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white"
                  >
                    {member.is_active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteMember(member)}
                    className="rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}