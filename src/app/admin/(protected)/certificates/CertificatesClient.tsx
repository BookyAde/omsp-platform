"use client";

import { useEffect, useMemo, useState } from "react";

type FormItem = {
  id: string;
  title: string;
};

type Certificate = {
  id: string;
  certificate_id: string;
  source: string;
  form_id: string | null;
  submission_id: string | null;
  recipient_name: string;
  recipient_email: string | null;
  programme_title: string;
  certificate_type: string;
  issue_date: string;
  status: string;
  verification_url: string;
  qr_code_data_url: string;
};

type EligibleSubmission = {
  submission_id: string;
  form_id: string;
  recipient_name: string;
  recipient_email: string;
  status: string;
  has_certificate: boolean;
  certificate: Certificate | null;
};

type ActionModal = {
  type: "revoke" | "delete" | null;
  certificate: Certificate | null;
};

export default function CertificatesClient({
  initialCertificates,
}: {
  initialCertificates: Certificate[];
}) {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [selectedFormTitle, setSelectedFormTitle] = useState("");
  const [eligibleSubmissions, setEligibleSubmissions] = useState<
    EligibleSubmission[]
  >([]);

  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [certificateFilter, setCertificateFilter] = useState("not_generated");
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>(
    []
  );

  const [manualForm, setManualForm] = useState({
    recipient_name: "",
    recipient_email: "",
    programme_title: "",
    certificate_type: "Participation",
  });
  const [manualLoading, setManualLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModal>({
    type: null,
    certificate: null,
  });

  useEffect(() => {
    loadForms();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return eligibleSubmissions.filter((submission) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        submission.recipient_name.toLowerCase().includes(search) ||
        submission.recipient_email.toLowerCase().includes(search);

      const matchesCertificateFilter =
        certificateFilter === "all" ||
        (certificateFilter === "generated" && submission.has_certificate) ||
        (certificateFilter === "not_generated" && !submission.has_certificate);

      return matchesSearch && matchesCertificateFilter;
    });
  }, [eligibleSubmissions, searchTerm, certificateFilter]);

  const selectableFilteredSubmissions = filteredSubmissions.filter(
    (submission) => !submission.has_certificate
  );

  const allFilteredSelected =
    selectableFilteredSubmissions.length > 0 &&
    selectableFilteredSubmissions.every((submission) =>
      selectedSubmissionIds.includes(submission.submission_id)
    );

  function showMessage(text: string) {
    setMessage(text);
  }

  async function loadForms() {
    setLoadingForms(true);

    const res = await fetch("/api/forms");
    const data = await res.json();

    if (res.ok) {
      setForms(data);
    } else {
      showMessage(data.error || "Failed to load forms.");
    }

    setLoadingForms(false);
  }

  async function loadEligibleSubmissions(formId: string) {
    setSelectedFormId(formId);
    setSelectedSubmissionIds([]);

    const form = forms.find((item) => item.id === formId);
    setSelectedFormTitle(form?.title || "");

    if (!formId) {
      setEligibleSubmissions([]);
      return;
    }

    setLoadingSubmissions(true);

    const res = await fetch(
      `/api/certificates/eligible-submissions?form_id=${formId}`
    );
    const data = await res.json();

    if (res.ok) {
      setEligibleSubmissions(data);
    } else {
      showMessage(data.error || "Failed to load submissions.");
    }

    setLoadingSubmissions(false);
  }

  async function createCertificateFromSubmission(submission: EligibleSubmission) {
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "form_submission",
        form_id: submission.form_id,
        submission_id: submission.submission_id,
        recipient_name: submission.recipient_name,
        recipient_email: submission.recipient_email,
        programme_title: selectedFormTitle,
        certificate_type: "Participation",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to generate certificate");
    }

    return data as Certificate;
  }

  async function generateFromSubmission(submission: EligibleSubmission) {
    setGeneratingId(submission.submission_id);

    try {
      const data = await createCertificateFromSubmission(submission);

      setCertificates((prev) => {
        const exists = prev.some((cert) => cert.id === data.id);
        return exists ? prev : [data, ...prev];
      });

      setEligibleSubmissions((prev) =>
        prev.map((item) =>
          item.submission_id === submission.submission_id
            ? { ...item, has_certificate: true, certificate: data }
            : item
        )
      );

      setSelectedSubmissionIds((prev) =>
        prev.filter((id) => id !== submission.submission_id)
      );

      showMessage("Certificate generated successfully.");
    } catch (error: any) {
      showMessage(error.message || "Failed to generate certificate.");
    }

    setGeneratingId(null);
  }

  async function generateForMany(submissions: EligibleSubmission[]) {
    const pending = submissions.filter(
      (submission) => !submission.has_certificate
    );

    if (pending.length === 0) {
      showMessage("No pending certificate records to generate.");
      return;
    }

    setBulkGenerating(true);

    try {
      const createdCertificates: Certificate[] = [];

      for (const submission of pending) {
        const cert = await createCertificateFromSubmission(submission);
        createdCertificates.push(cert);
      }

      setCertificates((prev) => {
        const existingIds = new Set(prev.map((cert) => cert.id));
        const fresh = createdCertificates.filter(
          (cert) => !existingIds.has(cert.id)
        );
        return [...fresh, ...prev];
      });

      setEligibleSubmissions((prev) =>
        prev.map((item) => {
          const finalCert = createdCertificates.find(
            (cert) => cert.submission_id === item.submission_id
          );

          if (finalCert) {
            return {
              ...item,
              has_certificate: true,
              certificate: finalCert,
            };
          }

          return item;
        })
      );

      setSelectedSubmissionIds([]);
      showMessage(`${createdCertificates.length} certificate(s) generated.`);
    } catch (error: any) {
      showMessage(error.message || "Bulk certificate generation failed.");
    }

    setBulkGenerating(false);
  }

  function toggleSubmission(id: string) {
    setSelectedSubmissionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleAllFiltered() {
    const filteredIds = selectableFilteredSubmissions.map(
      (submission) => submission.submission_id
    );

    if (allFilteredSelected) {
      setSelectedSubmissionIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      setSelectedSubmissionIds((prev) =>
        Array.from(new Set([...prev, ...filteredIds]))
      );
    }
  }

  async function generateSelected() {
    const selected = eligibleSubmissions.filter((submission) =>
      selectedSubmissionIds.includes(submission.submission_id)
    );

    await generateForMany(selected);
  }

  async function generateAllFiltered() {
    await generateForMany(selectableFilteredSubmissions);
  }

  async function generateManualCertificate(e: React.FormEvent) {
    e.preventDefault();
    setManualLoading(true);

    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...manualForm,
        source: "manual",
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setCertificates((prev) => [data, ...prev]);
      setManualForm({
        recipient_name: "",
        recipient_email: "",
        programme_title: "",
        certificate_type: "Participation",
      });
      showMessage("Manual certificate generated successfully.");
    } else {
      showMessage(data.error || "Failed to generate manual certificate.");
    }

    setManualLoading(false);
  }

  function downloadQr(cert: Certificate) {
    const link = document.createElement("a");
    link.href = cert.qr_code_data_url;
    link.download = `${cert.certificate_id}-qr.png`;
    link.click();
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    showMessage("Verification link copied.");
  }

  function openRevokeModal(cert: Certificate) {
    setActionModal({ type: "revoke", certificate: cert });
  }

  function openDeleteModal(cert: Certificate) {
    setActionModal({ type: "delete", certificate: cert });
  }

  function closeActionModal() {
    if (actionLoading) return;
    setActionModal({ type: null, certificate: null });
  }

  async function confirmCertificateAction() {
    if (!actionModal.type || !actionModal.certificate) return;

    setActionLoading(true);

    const cert = actionModal.certificate;

    const res = await fetch(`/api/certificates/${cert.id}`, {
      method: actionModal.type === "revoke" ? "PATCH" : "DELETE",
      headers:
        actionModal.type === "revoke"
          ? { "Content-Type": "application/json" }
          : undefined,
      body:
        actionModal.type === "revoke"
          ? JSON.stringify({ status: "revoked" })
          : undefined,
    });

    const data = await res.json();

    if (res.ok) {
      if (actionModal.type === "revoke") {
        setCertificates((prev) =>
          prev.map((item) => (item.id === cert.id ? data : item))
        );

        setEligibleSubmissions((prev) =>
          prev.map((item) =>
            item.certificate?.id === cert.id
              ? { ...item, certificate: data }
              : item
          )
        );

        showMessage("Certificate revoked successfully.");
      } else {
        setCertificates((prev) => prev.filter((item) => item.id !== cert.id));

        setEligibleSubmissions((prev) =>
          prev.map((item) =>
            item.certificate?.id === cert.id
              ? { ...item, has_certificate: false, certificate: null }
              : item
          )
        );

        showMessage("Certificate deleted successfully.");
      }

      setActionModal({ type: null, certificate: null });
    } else {
      showMessage(data.error || "Action failed.");
    }

    setActionLoading(false);
  }

  return (
    <main className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          OMSP Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Certificate Verification
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Generate unique certificate IDs and QR codes from approved form
          submissions. The certificate ID is also embedded inside the QR
          verification link.
        </p>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">
          Generate from Form Submissions
        </h2>

        <select
          value={selectedFormId}
          onChange={(e) => loadEligibleSubmissions(e.target.value)}
          className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
        >
          <option value="">
            {loadingForms ? "Loading forms..." : "Select a form"}
          </option>

          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.title}
            </option>
          ))}
        </select>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            placeholder="Search name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={certificateFilter}
            onChange={(e) => setCertificateFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          >
            <option value="not_generated">Not generated</option>
            <option value="generated">Generated</option>
            <option value="all">All</option>
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={generateSelected}
              disabled={bulkGenerating || selectedSubmissionIds.length === 0}
              className="flex-1 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              Generate Selected
            </button>

            <button
              type="button"
              onClick={generateAllFiltered}
              disabled={
                bulkGenerating || selectableFilteredSubmissions.length === 0
              }
              className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Generate All Filtered
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Showing {filteredSubmissions.length} submission(s). Selected{" "}
          {selectedSubmissionIds.length}.
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-6 gap-4 border-b border-white/10 p-4 text-sm font-semibold text-slate-300">
            <span>
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleAllFiltered}
                disabled={selectableFilteredSubmissions.length === 0}
              />
            </span>
            <span>Name</span>
            <span>Email</span>
            <span>Status</span>
            <span>Certificate</span>
            <span>Action</span>
          </div>

          {loadingSubmissions ? (
            <p className="p-5 text-slate-400">
              Loading approved submissions...
            </p>
          ) : filteredSubmissions.length === 0 ? (
            <p className="p-5 text-slate-400">
              No matching approved submissions found for this form.
            </p>
          ) : (
            filteredSubmissions.map((submission) => (
              <div
                key={submission.submission_id}
                className="grid grid-cols-6 gap-4 border-b border-white/5 p-4 text-sm text-slate-300"
              >
                <span>
                  <input
                    type="checkbox"
                    checked={selectedSubmissionIds.includes(
                      submission.submission_id
                    )}
                    onChange={() => toggleSubmission(submission.submission_id)}
                    disabled={submission.has_certificate}
                  />
                </span>

                <span>{submission.recipient_name}</span>
                <span>{submission.recipient_email || "No email"}</span>
                <span>{submission.status}</span>
                <span>
                  {submission.has_certificate
                    ? submission.certificate?.certificate_id
                    : "Not generated"}
                </span>
                <span>
                  {submission.has_certificate && submission.certificate ? (
                    <button
                      onClick={() =>
                        downloadQr(submission.certificate as Certificate)
                      }
                      className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white"
                    >
                      Download QR
                    </button>
                  ) : (
                    <button
                      onClick={() => generateFromSubmission(submission)}
                      disabled={
                        generatingId === submission.submission_id ||
                        bulkGenerating
                      }
                      className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
                    >
                      {generatingId === submission.submission_id
                        ? "Generating..."
                        : "Generate"}
                    </button>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">
          Manual Certificate Entry
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Use this only for exceptions, corrections, or support-reviewed
          certificate requests.
        </p>

        <form
          onSubmit={generateManualCertificate}
          className="mt-5 grid gap-4 md:grid-cols-2"
        >
          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            placeholder="Recipient name"
            value={manualForm.recipient_name}
            onChange={(e) =>
              setManualForm({
                ...manualForm,
                recipient_name: e.target.value,
              })
            }
            required
          />

          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            placeholder="Recipient email"
            value={manualForm.recipient_email}
            onChange={(e) =>
              setManualForm({
                ...manualForm,
                recipient_email: e.target.value,
              })
            }
          />

          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            placeholder="Programme title"
            value={manualForm.programme_title}
            onChange={(e) =>
              setManualForm({
                ...manualForm,
                programme_title: e.target.value,
              })
            }
            required
          />

          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            placeholder="Certificate type"
            value={manualForm.certificate_type}
            onChange={(e) =>
              setManualForm({
                ...manualForm,
                certificate_type: e.target.value,
              })
            }
          />

          <button
            type="submit"
            disabled={manualLoading}
            className="rounded-xl bg-white/10 px-5 py-3 font-semibold text-white disabled:opacity-60 md:col-span-2"
          >
            {manualLoading ? "Generating..." : "Generate Manual Certificate QR"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-5 gap-4 border-b border-white/10 p-4 text-sm font-semibold text-slate-300">
          <span>Recipient</span>
          <span>Programme</span>
          <span>Certificate ID</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {certificates.length === 0 ? (
          <p className="p-6 text-slate-400">No certificates generated yet.</p>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="grid grid-cols-5 gap-4 border-b border-white/5 p-4 text-sm text-slate-300"
            >
              <span>{cert.recipient_name}</span>
              <span>{cert.programme_title}</span>
              <span>{cert.certificate_id}</span>
              <span>{cert.status}</span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadQr(cert)}
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white"
                >
                  QR
                </button>

                <button
                  onClick={() => copyLink(cert.verification_url)}
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white"
                >
                  Copy
                </button>

                <a
                  href={cert.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white"
                >
                  Verify
                </a>

                <button
                  onClick={() => openRevokeModal(cert)}
                  disabled={cert.status === "revoked"}
                  className="rounded-lg bg-amber-500/20 px-3 py-2 text-xs text-amber-200 disabled:opacity-50"
                >
                  Revoke
                </button>

                <button
                  onClick={() => openDeleteModal(cert)}
                  className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {message && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {actionModal.type && actionModal.certificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              {actionModal.type === "revoke"
                ? "Revoke Certificate"
                : "Delete Certificate"}
            </h2>

            <p className="mt-3 text-sm text-slate-300">
              {actionModal.type === "revoke"
                ? "This will make the certificate invalid on the public verification page, but it will remain in OMSP records."
                : "This will permanently remove the certificate record. Use this only for test records or mistakes."}
            </p>

            <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
              <p>{actionModal.certificate.recipient_name}</p>
              <p className="mt-1 text-slate-500">
                {actionModal.certificate.certificate_id}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={actionLoading}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmCertificateAction}
                disabled={actionLoading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
                  actionModal.type === "revoke"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-red-500 text-white"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : actionModal.type === "revoke"
                    ? "Revoke Certificate"
                    : "Delete Certificate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}