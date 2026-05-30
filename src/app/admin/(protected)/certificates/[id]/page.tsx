"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";

type Certificate = {
  id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string | null;
  certificate_title: string | null;
  programme_title: string | null;
  certificate_type: string;
  issue_date: string;
  expiry_date?: string | null;
  status: string;
  verification_url: string;
  qr_code_data_url: string;
  pdf_url?: string | null;
};

// Child component that receives a guaranteed non‑null certificate
function CertificateDetail({ cert }: { cert: Certificate }) {
  const router = useRouter();

  async function handleRevoke() {
    if (!confirm("Revoke this certificate?")) return;
    const res = await fetch(`/api/certificates/${cert.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "revoked" }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to revoke certificate.");
    }
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this certificate?")) return;
    const res = await fetch(`/api/certificates/${cert.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/certificates");
    } else {
      alert("Failed to delete certificate.");
    }
  }

  async function resendEmail() {
    if (!cert.recipient_email || !cert.pdf_url) {
      alert("Cannot send email: missing email or PDF URL.");
      return;
    }
    const res = await fetch(`/api/certificates/${cert.id}/send-email`, { method: "POST" });
    if (res.ok) {
      alert("Email sent successfully.");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to send email.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="admin-page-header mb-6">
        <h1 className="admin-page-title">Certificate Details</h1>
        <p className="admin-page-subtitle">{cert.certificate_id}</p>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">Recipient</label>
          <p className="text-white text-lg mt-1">{cert.recipient_name}</p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">Email</label>
          <p className="mt-1">{cert.recipient_email || "—"}</p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">Title</label>
          <p className="mt-1">{cert.certificate_title || cert.certificate_type}</p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">Programme</label>
          <p className="mt-1">{cert.programme_title || "—"}</p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">Issue Date</label>
          <p className="mt-1">{new Date(cert.issue_date).toLocaleDateString()}</p>
        </div>
        {cert.expiry_date && (
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500">Expiry Date</label>
            <p className="mt-1">{new Date(cert.expiry_date).toLocaleDateString()}</p>
          </div>
        )}
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">Status</label>
          <p className="mt-1 capitalize">{cert.status}</p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500">Verification URL</label>
          <a href={cert.verification_url} target="_blank" rel="noreferrer" className="text-cyan-400 break-all mt-1 inline-block">
            {cert.verification_url}
          </a>
        </div>
        {cert.qr_code_data_url && (
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500">QR Code</label>
            <img src={cert.qr_code_data_url} alt="QR Code" className="w-32 h-32 mt-2" />
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-4">
          {cert.pdf_url && (
            <a href={cert.pdf_url} target="_blank" rel="noreferrer" className="btn-primary">
              Download PDF
            </a>
          )}
          <button onClick={resendEmail} disabled={!cert.recipient_email || !cert.pdf_url} className="btn-secondary disabled:opacity-50">
            Send Email
          </button>
          <button onClick={handleRevoke} disabled={cert.status === "revoked"} className="border border-amber-500 text-amber-400 px-4 py-2 rounded disabled:opacity-50">
            Revoke
          </button>
          <button onClick={handleDelete} className="border border-red-500 text-red-400 px-4 py-2 rounded">
            Delete
          </button>
          <Link href="/admin/certificates" className="border border-white/20 px-4 py-2 rounded">
            Back to Certificates
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CertificateViewPage({ params }: { params: { id: string } }) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/certificates/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setCert(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setCert(null);
      });
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading certificate...</div>;
  }

  if (!cert) {
    notFound();
    return null;
  }

  return <CertificateDetail cert={cert} />;
}