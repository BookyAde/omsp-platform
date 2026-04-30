"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Sponsor, SponsorTier } from "@/types";
import { SPONSOR_TIERS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function SponsorsPage() {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Sponsor | null>(null);

  const [form, setForm] = useState({
    name: "", website_url: "", logo_url: "",
    tier: "partner" as SponsorTier, is_active: true, description: "",
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/sponsors");
    const data = await res.json();
    setSponsors(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", website_url: "", logo_url: "", tier: "partner", is_active: true, description: "" });
    setShowForm(true);
  }

  function openEdit(s: Sponsor) {
    setEditing(s);
    setForm({ name: s.name, website_url: s.website_url ?? "", logo_url: s.logo_url ?? "",
              tier: s.tier, is_active: s.is_active, description: s.description ?? "" });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, website_url: form.website_url || null, logo_url: form.logo_url || null, description: form.description || null };
    await fetch(editing ? `/api/sponsors/${editing.id}` : "/api/sponsors", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowForm(false);
    load();
  }

  async function toggleActive(s: Sponsor) {
    await fetch(`/api/sponsors/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !s.is_active }),
    });
    load();
  }

  return (
    <div>
      <div className="admin-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Sponsors & Partners</h1>
          <p className="admin-page-subtitle">{sponsors.filter((s) => s.is_active).length} active partners</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm px-5 py-2.5">Add Sponsor</button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="glass-card p-6 mb-8 border-teal-500/20">
          <h2 className="font-display font-bold text-white mb-5">
            {editing ? "Edit Sponsor" : "Add Sponsor"}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Organisation Name *</label>
              <input type="text" required className="form-input" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Tier</label>
              <select className="form-input" value={form.tier}
                onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value as SponsorTier }))}>
                {SPONSOR_TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Website URL</label>
              <input type="url" className="form-input" placeholder="https://" value={form.website_url}
                onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Logo URL</label>
              <input type="url" className="form-input" placeholder="https://" value={form.logo_url}
                onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea rows={2} className="form-input resize-none" value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="is_active" checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                className="w-4 h-4 rounded border-ocean-600 bg-ocean-800 text-teal-500" />
              <label htmlFor="is_active" className="text-slate-300 text-sm">Active (show on public site)</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-sm px-5 py-2.5">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm px-5 py-2.5">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Sponsors table */}
      {loading ? (
        <div className="glass-card p-12 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
        </div>
      ) : sponsors.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-slate-500 mb-4">No sponsors added yet.</p>
          <button onClick={openCreate} className="btn-primary text-sm">Add First Sponsor</button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ocean-700/50">
                <th className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider hidden sm:table-cell">Tier</th>
                <th className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider hidden md:table-cell">Added</th>
                <th className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-700/30">
              {sponsors.map((s) => (
                <tr key={s.id} className="hover:bg-ocean-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      {s.website_url && (
                        <a href={s.website_url} target="_blank" rel="noopener noreferrer"
                          className="text-teal-400/60 hover:text-teal-400 text-xs transition-colors truncate block max-w-xs">
                          {s.website_url}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="badge-draft capitalize">{s.tier}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-slate-500 text-xs">{formatDate(s.created_at)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive(s)}
                      className={`text-xs font-medium transition-colors ${s.is_active ? "badge-published cursor-pointer hover:opacity-70" : "badge-closed cursor-pointer hover:opacity-70"}`}>
                      {s.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(s)}
                      className="text-teal-400 hover:text-teal-300 text-sm transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
