// src/app/admin/(protected)/certificates/components/CertificateList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Certificate = {
  id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string | null;
  certificate_title: string | null;
  programme_title: string | null;
  certificate_type: string;
  status: string;
  issue_date: string;
  expiry_date?: string | null;
  email_sent?: boolean;
  email_sent_at?: string | null;
  pdf_url?: string | null;
  qr_code_data_url: string;
  verification_url: string;
};

export default function CertificateList({ initialCertificates }: { initialCertificates: Certificate[] }) {
  const router = useRouter();
  const [certificates, setCertificates] = useState(initialCertificates);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: "revoke" | "delete"; cert: Certificate | null }>({ type: "revoke", cert: null });
  const [actionLoading, setActionLoading] = useState(false);

  async function resendEmail(cert: Certificate) {
    if (!cert.recipient_email || !cert.pdf_url) return;
    setSendingId(cert.id);
    const res = await fetch(`/api/certificates/${cert.id}/send-email`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setCertificates(prev => prev.map(c => c.id === cert.id ? { ...c, email_sent: true, email_sent_at: data.email_sent_at } : c));
      alert("Email sent.");
    } else {
      alert(data.error || "Failed to send email.");
    }
    setSendingId(null);
  }

  async function confirmAction() {
    if (!actionModal.cert) return;
    setActionLoading(true);
    const { id } = actionModal.cert;
    const res = await fetch(`/api/certificates/${id}`, {
      method: actionModal.type === "revoke" ? "PATCH" : "DELETE",
      headers: actionModal.type === "revoke" ? { "Content-Type": "application/json" } : undefined,
      body: actionModal.type === "revoke" ? JSON.stringify({ status: "revoked" }) : undefined,
    });
    if (res.ok) {
      if (actionModal.type === "revoke") {
        const updated = await res.json();
        setCertificates(prev => prev.map(c => c.id === id ? updated : c));
      } else {
        setCertificates(prev => prev.filter(c => c.id !== id));
      }
    } else {
      alert("Action failed.");
    }
    setActionModal({ type: "revoke", cert: null });
    setActionLoading(false);
    router.refresh();
  }

  function downloadQr(cert: Certificate) {
    const link = document.createElement("a");
    link.href = cert.qr_code_data_url;
    link.download = `${cert.certificate_id}-qr.png`;
    link.click();
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    alert("Verification link copied.");
  }

  if (certificates.length === 0) {
    return <div className="glass-card p-10 text-center text-slate-500">No certificates generated yet.</div>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block glass-card overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-ocean-700/50">
            <tr className="text-left text-xs font-mono uppercase text-slate-500">
              <th className="px-4 py-3">Recipient</th><th>Title</th><th>Programme</th><th>Certificate ID</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map(cert => (
              <tr key={cert.id} className="border-b border-ocean-700/30 hover:bg-ocean-800/30">
                <td className="px-4 py-3 text-sm font-medium text-white">{cert.recipient_name}</td>
                <td className="px-4 py-3 text-sm">{cert.certificate_title || cert.certificate_type}</td>
                <td className="px-4 py-3 text-sm">{cert.programme_title || "—"}</td>
                <td className="px-4 py-3 text-sm font-mono">{cert.certificate_id}</td>
                <td className="px-4 py-3 text-sm capitalize">{cert.status}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Link href={`/admin/certificates/${cert.id}`} className="text-ocean-400 text-xs border border-ocean-400/30 px-2 py-1 rounded">View</Link>
                    <button onClick={() => downloadQr(cert)} className="text-white text-xs border border-white/20 px-2 py-1 rounded">QR</button>
                    <button onClick={() => copyLink(cert.verification_url)} className="text-white text-xs border border-white/20 px-2 py-1 rounded">Copy</button>
                    {cert.pdf_url && <a href={cert.pdf_url} target="_blank" className="text-cyan-400 text-xs border border-cyan-400/30 px-2 py-1 rounded">PDF</a>}
                    <button onClick={() => resendEmail(cert)} disabled={sendingId === cert.id || !cert.recipient_email || !cert.pdf_url} className="text-emerald-400 text-xs border border-emerald-400/30 px-2 py-1 rounded disabled:opacity-50">Send</button>
                    <button onClick={() => setActionModal({ type: "revoke", cert })} disabled={cert.status === "revoked"} className="text-amber-400 text-xs border border-amber-400/30 px-2 py-1 rounded">Revoke</button>
                    <button onClick={() => setActionModal({ type: "delete", cert })} className="text-red-400 text-xs border border-red-400/30 px-2 py-1 rounded">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {certificates.map(cert => (
          <div key={cert.id} className="glass-card p-4 space-y-2">
            <p className="font-bold text-white">{cert.recipient_name}</p>
            <p className="text-sm text-slate-300">{cert.certificate_title}</p>
            <p className="text-xs text-slate-400">{cert.certificate_id}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link href={`/admin/certificates/${cert.id}`} className="text-ocean-400 text-xs border border-ocean-400/30 px-2 py-1 rounded">View</Link>
              <button onClick={() => downloadQr(cert)} className="text-white text-xs border border-white/20 px-2 py-1 rounded">QR</button>
              <button onClick={() => copyLink(cert.verification_url)} className="text-white text-xs border border-white/20 px-2 py-1 rounded">Copy</button>
              {cert.pdf_url && <a href={cert.pdf_url} target="_blank" className="text-cyan-400 text-xs border border-cyan-400/30 px-2 py-1 rounded">PDF</a>}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {actionModal.cert && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white">{actionModal.type === "revoke" ? "Revoke Certificate" : "Delete Certificate"}</h3>
            <p className="mt-2 text-slate-300">{actionModal.type === "revoke" ? "This will invalidate the public verification page." : "Permanently remove this certificate record."}</p>
            <div className="mt-4 bg-white/5 p-3 rounded">
              <p>{actionModal.cert.recipient_name}</p>
              <p className="text-xs text-slate-400">{actionModal.cert.certificate_id}</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setActionModal({ type: "revoke", cert: null })} className="px-4 py-2 bg-white/10 rounded">Cancel</button>
              <button onClick={confirmAction} disabled={actionLoading} className={`px-4 py-2 rounded ${actionModal.type === "revoke" ? "bg-amber-500 text-black" : "bg-red-600 text-white"}`}>
                {actionLoading ? "Processing..." : actionModal.type === "revoke" ? "Revoke" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}