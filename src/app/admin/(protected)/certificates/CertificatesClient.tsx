"use client";

import { useEffect, useMemo, useState } from "react";
import { CERTIFICATE_TEMPLATES } from "@/lib/certificates/templates";
import CertificatePreview from "@/components/certificates/CertificatePreview";

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
  certificate_title: string | null;
  recipient_name: string;
  recipient_email: string | null;
  programme_title: string | null;
  certificate_type: string;
  issue_date: string;
  status: string;
  template_id: string | null;
  design_overrides: Record<string, any> | null;
  verification_url: string;
  qr_code_data_url: string;
  pdf_url?: string | null;
  email_sent?: boolean | null;
  email_sent_at?: string | null;
  expiry_date?: string | null;
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

type FieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

const DEFAULT_TEMPLATE_ID = "classic-maritime";
const DEFAULT_DESCRIPTION =
  "This certificate preview demonstrates the selected certificate design.";

const DEFAULT_SIGNATURE_TEXT = "OMSP Administration";
const DEFAULT_SIGNATURE_TITLE = "Authorized Signatory";
const DEFAULT_SIGNATURE_STYLE = "executive";

function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-slate-200">{label}</span>
      {children}
      {hint && <span className="block text-xs leading-relaxed text-slate-500">{hint}</span>}
    </label>
  );
}

function inputClass(extra = "") {
  return `w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10 ${extra}`;
}

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
  const [selectedCertificateIds, setSelectedCertificateIds] = useState<string[]>(
    []
  );
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false);
  const [sendingCertificateIds, setSendingCertificateIds] = useState<string[]>(
    []
  );
  const [emailFilter, setEmailFilter] = useState("all");

  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [certificateFilter, setCertificateFilter] = useState("not_generated");
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>(
    []
  );

  const [submissionCertificateSettings, setSubmissionCertificateSettings] =
    useState({
      certificate_title: "Certificate of Participation",
      certificate_type: "Participation",
      template_id: DEFAULT_TEMPLATE_ID,
      certificate_description: DEFAULT_DESCRIPTION,
      expiry_date: "",
      logoPosition: "top-center",
      qrPosition: "bottom-right",
      showWatermark: true,
      watermarkOpacity: 0.05,
      signatureText: DEFAULT_SIGNATURE_TEXT,
      signatureTitle: DEFAULT_SIGNATURE_TITLE,
      signatureStyle: DEFAULT_SIGNATURE_STYLE,
    });

  const [manualForm, setManualForm] = useState({
    certificate_title: "Certificate of Recognition",
    recipient_name: "",
    recipient_email: "",
    programme_title: "",
    certificate_type: "Recognition",
    expiry_date: "",
    template_id: DEFAULT_TEMPLATE_ID,
    certificate_description: DEFAULT_DESCRIPTION,
    logoPosition: "top-center",
    qrPosition: "bottom-right",
    showWatermark: true,
    watermarkOpacity: 0.05,
    signatureText: DEFAULT_SIGNATURE_TEXT,
    signatureTitle: DEFAULT_SIGNATURE_TITLE,
    signatureStyle: DEFAULT_SIGNATURE_STYLE,
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

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [message]);

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

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      if (emailFilter === "emailed") return cert.email_sent;
      if (emailFilter === "not_emailed") return !cert.email_sent;
      return true;
    });
  }, [certificates, emailFilter]);

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

  function toggleCertificate(id: string) {
    setSelectedCertificateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function sendCertificateEmails(certs: Certificate[]) {
    const sendable = certs.filter(
      (cert) => cert.recipient_email && cert.pdf_url && !cert.email_sent
    );

    if (sendable.length === 0) {
      showMessage("No unsent certificate emails found.");
      return;
    }

    setBulkEmailLoading(true);

    try {
      const updated: Certificate[] = [];

      for (const cert of sendable) {
        const res = await fetch(`/api/certificates/${cert.id}/send-email`, {
          method: "POST",
        });

        const data = await res.json();

        if (res.ok) {
          updated.push(data);
        }
      }

      setCertificates((prev) =>
        prev.map((cert) => {
          const fresh = updated.find((item) => item.id === cert.id);
          return fresh || cert;
        })
      );

      setSelectedCertificateIds([]);
      showMessage(`${updated.length} certificate email(s) sent.`);
    } catch (error: any) {
      showMessage(error.message || "Failed to send certificate emails.");
    }

    setBulkEmailLoading(false);
  }

  function buildSubmissionDesignOverrides() {
    return {
      description: submissionCertificateSettings.certificate_description,
      logoPosition: submissionCertificateSettings.logoPosition,
      qrPosition: submissionCertificateSettings.qrPosition,
      showWatermark: submissionCertificateSettings.showWatermark,
      watermarkOpacity: submissionCertificateSettings.watermarkOpacity,
      signatureText: submissionCertificateSettings.signatureText,
      signatureTitle: submissionCertificateSettings.signatureTitle,
      signatureStyle: submissionCertificateSettings.signatureStyle,
    };
  }

  function buildManualDesignOverrides() {
    return {
      description: manualForm.certificate_description,
      logoPosition: manualForm.logoPosition,
      qrPosition: manualForm.qrPosition,
      showWatermark: manualForm.showWatermark,
      watermarkOpacity: manualForm.watermarkOpacity,
      signatureText: manualForm.signatureText,
      signatureTitle: manualForm.signatureTitle,
      signatureStyle: manualForm.signatureStyle,
    };
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
        certificate_title:
          submissionCertificateSettings.certificate_title ||
          "Certificate of Participation",
        recipient_name: submission.recipient_name,
        recipient_email: submission.recipient_email,
        programme_title: selectedFormTitle,
        certificate_type:
          submissionCertificateSettings.certificate_type || "Participation",
        template_id:
          submissionCertificateSettings.template_id || DEFAULT_TEMPLATE_ID,
        design_overrides: buildSubmissionDesignOverrides(),
        expiry_date: submissionCertificateSettings.expiry_date || null,
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
        certificate_title: manualForm.certificate_title,
        recipient_name: manualForm.recipient_name,
        recipient_email: manualForm.recipient_email,
        programme_title: manualForm.programme_title,
        certificate_type: manualForm.certificate_type,
        expiry_date: manualForm.expiry_date || null,
        template_id: manualForm.template_id,
        source: "manual",
        design_overrides: buildManualDesignOverrides(),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setCertificates((prev) => [data, ...prev]);
      setManualForm({
        certificate_title: "Certificate of Recognition",
        recipient_name: "",
        recipient_email: "",
        programme_title: "",
        certificate_type: "Recognition",
        expiry_date: "",
        template_id: DEFAULT_TEMPLATE_ID,
        certificate_description: DEFAULT_DESCRIPTION,
        logoPosition: "top-center",
        qrPosition: "bottom-right",
        showWatermark: true,
        watermarkOpacity: 0.05,
        signatureText: DEFAULT_SIGNATURE_TEXT,
        signatureTitle: DEFAULT_SIGNATURE_TITLE,
        signatureStyle: DEFAULT_SIGNATURE_STYLE,
      });
      showMessage("Manual certificate generated successfully.");
    } else {
      showMessage(data.error || "Failed to generate manual certificate.");
    }

    setManualLoading(false);
  }

  async function resendCertificateEmail(cert: Certificate) {
    if (!cert.recipient_email) {
      showMessage("This certificate has no recipient email.");
      return;
    }

    if (!cert.pdf_url) {
      showMessage("This certificate has no PDF attached yet.");
      return;
    }

    setSendingCertificateIds((prev) => [...prev, cert.id]);

    const res = await fetch(`/api/certificates/${cert.id}/send-email`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
      setCertificates((prev) =>
        prev.map((item) => (item.id === cert.id ? data : item))
      );

      showMessage("Certificate email sent successfully.");
    } else {
      showMessage(data.error || "Failed to send certificate email.");
    }

    setSendingCertificateIds((prev) => prev.filter((id) => id !== cert.id));
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
          Generate certificate IDs, QR codes, flexible certificate titles,
          styled signatures, and design-ready certificate records from approved
          form submissions or manual entries.
        </p>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-5">
          <h2 className="text-xl font-bold text-white">
            Generate from Form Submissions
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            Use this section when certificates should be issued to people who
            submitted approved forms. Set the certificate details first, then
            select the form and generate certificates for one or many approved
            submissions.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Certificate title" hint="Example: Certificate of Participation">
            <input
              className={inputClass()}
              placeholder="Certificate of Participation"
              value={submissionCertificateSettings.certificate_title}
              onChange={(e) =>
                setSubmissionCertificateSettings({
                  ...submissionCertificateSettings,
                  certificate_title: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Certificate type" hint="Example: Participation, Membership, Training">
            <input
              className={inputClass()}
              placeholder="Participation"
              value={submissionCertificateSettings.certificate_type}
              onChange={(e) =>
                setSubmissionCertificateSettings({
                  ...submissionCertificateSettings,
                  certificate_type: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Template design" hint="Choose the visual certificate style.">
            <select
              value={submissionCertificateSettings.template_id}
              onChange={(e) =>
                setSubmissionCertificateSettings({
                  ...submissionCertificateSettings,
                  template_id: e.target.value,
                })
              }
              className={inputClass()}
            >
              {CERTIFICATE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Expiry date" hint="Optional. Leave empty if this certificate does not expire.">
            <input
              type="date"
              className={inputClass()}
              value={submissionCertificateSettings.expiry_date}
              onChange={(e) =>
                setSubmissionCertificateSettings({
                  ...submissionCertificateSettings,
                  expiry_date: e.target.value,
                })
              }
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Certificate description" hint="This text appears on the certificate body.">
            <textarea
              className={inputClass("min-h-28 resize-y")}
              value={submissionCertificateSettings.certificate_description}
              onChange={(e) =>
                setSubmissionCertificateSettings({
                  ...submissionCertificateSettings,
                  certificate_description: e.target.value,
                })
              }
            />
          </Field>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h3 className="text-lg font-semibold text-white">Layout Settings</h3>
          <p className="mt-1 text-sm text-slate-400">
            Control logo placement, QR placement, and watermark visibility for
            certificates generated from submissions.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Logo position">
              <select
                value={submissionCertificateSettings.logoPosition}
                onChange={(e) =>
                  setSubmissionCertificateSettings({
                    ...submissionCertificateSettings,
                    logoPosition: e.target.value,
                  })
                }
                className={inputClass()}
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
              </select>
            </Field>

            <Field label="QR code position">
              <select
                value={submissionCertificateSettings.qrPosition}
                onChange={(e) =>
                  setSubmissionCertificateSettings({
                    ...submissionCertificateSettings,
                    qrPosition: e.target.value,
                  })
                }
                className={inputClass()}
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="hidden">Hidden</option>
              </select>
            </Field>

            <Field label="Watermark opacity" hint="Use 0.03 to 0.08 for a soft watermark.">
              <input
                type="number"
                min="0"
                max="0.2"
                step="0.01"
                value={submissionCertificateSettings.watermarkOpacity}
                onChange={(e) =>
                  setSubmissionCertificateSettings({
                    ...submissionCertificateSettings,
                    watermarkOpacity: Number(e.target.value),
                  })
                }
                className={inputClass()}
              />
            </Field>

            <label className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={submissionCertificateSettings.showWatermark}
                onChange={(e) =>
                  setSubmissionCertificateSettings({
                    ...submissionCertificateSettings,
                    showWatermark: e.target.checked,
                  })
                }
              />
              <span>
                <span className="block font-semibold text-slate-200">
                  Show watermark
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Display the subtle OMSP background mark.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-cyan-400/10 bg-cyan-400/5 p-5">
          <h3 className="text-lg font-semibold text-white">Signature Settings</h3>
          <p className="mt-1 text-sm text-slate-400">
            Use typed issuer names styled like signatures instead of uploading
            scanned handwritten images.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Signature name" hint="The name that appears as the signature.">
              <input
                className={inputClass()}
                placeholder="OMSP Administration"
                value={submissionCertificateSettings.signatureText}
                onChange={(e) =>
                  setSubmissionCertificateSettings({
                    ...submissionCertificateSettings,
                    signatureText: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Signature title" hint="Example: President, Secretary, Authorized Signatory">
              <input
                className={inputClass()}
                placeholder="Authorized Signatory"
                value={submissionCertificateSettings.signatureTitle}
                onChange={(e) =>
                  setSubmissionCertificateSettings({
                    ...submissionCertificateSettings,
                    signatureTitle: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Signature style" hint="Choose the font style used for the typed signature.">
              <select
                value={submissionCertificateSettings.signatureStyle}
                onChange={(e) =>
                  setSubmissionCertificateSettings({
                    ...submissionCertificateSettings,
                    signatureStyle: e.target.value,
                  })
                }
                className={inputClass()}
              >
                <option value="signatie">Signatie</option>
                <option value="amsterdam">Amsterdam Handwriting</option>
                <option value="bastliga">Bastliga One</option>
                <option value="cintarini">Cintarini</option>
                <option value="oceantrace">Ocean Trace</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 p-4">
          <CertificatePreview
            templateId={submissionCertificateSettings.template_id}
            recipientName="John Doe"
            certificateTitle={
              submissionCertificateSettings.certificate_title ||
              "Certificate of Participation"
            }
            issueDate={new Date().toLocaleDateString()}
            certificateId="OMSP-PREVIEW-001"
            organizationName="Organization of Marine Science Professionals"
            description={
              submissionCertificateSettings.certificate_description ||
              DEFAULT_DESCRIPTION
            }
            signatoryName={submissionCertificateSettings.signatureText}
            signatoryTitle={submissionCertificateSettings.signatureTitle}
            verificationUrl="https://omspglobal.org/verify/OMSP-PREVIEW-001"
            designOverrides={buildSubmissionDesignOverrides() as any}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h3 className="text-lg font-semibold text-white">Select Approved Form Submissions</h3>
          <p className="mt-1 text-sm text-slate-400">
            Choose a form, then generate certificates for approved submissions.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Form">
              <select
                value={selectedFormId}
                onChange={(e) => loadEligibleSubmissions(e.target.value)}
                className={inputClass()}
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
            </Field>

            <Field label="Search submissions">
              <input
                className={inputClass()}
                placeholder="Search name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Field>

            <Field label="Certificate filter">
              <select
                value={certificateFilter}
                onChange={(e) => setCertificateFilter(e.target.value)}
                className={inputClass()}
              >
                <option value="not_generated">Not generated</option>
                <option value="generated">Generated</option>
                <option value="all">All</option>
              </select>
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateSelected}
              disabled={bulkGenerating || selectedSubmissionIds.length === 0}
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              {bulkGenerating ? "Generating..." : "Generate Selected"}
            </button>

            <button
              type="button"
              onClick={generateAllFiltered}
              disabled={
                bulkGenerating || selectableFilteredSubmissions.length === 0
              }
              className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {bulkGenerating ? "Generating..." : "Generate All Filtered"}
            </button>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            Showing {filteredSubmissions.length} submission(s). Selected {" "}
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
              <p className="p-5 text-slate-400">Loading approved submissions...</p>
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
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-5">
          <h2 className="text-xl font-bold text-white">Manual Certificate Entry</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            Use this for exceptions, corrections, support-reviewed certificates,
            or certificates not tied to a form submission.
          </p>
        </div>

        <form
          onSubmit={generateManualCertificate}
          className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <Field label="Certificate title" hint="Example: Certificate of Recognition">
            <input
              className={inputClass()}
              placeholder="Certificate title"
              value={manualForm.certificate_title}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  certificate_title: e.target.value,
                })
              }
              required
            />
          </Field>

          <Field label="Template design">
            <select
              value={manualForm.template_id}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  template_id: e.target.value,
                })
              }
              className={inputClass()}
            >
              {CERTIFICATE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Recipient name" hint="Name that will appear on the certificate.">
            <input
              className={inputClass()}
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
          </Field>

          <Field label="Recipient email" hint="Needed if the certificate will be emailed.">
            <input
              type="email"
              className={inputClass()}
              placeholder="Recipient email"
              value={manualForm.recipient_email}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  recipient_email: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Programme title" hint="Example: OMSP Membership Onboarding">
            <input
              className={inputClass()}
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
          </Field>

          <Field label="Certificate type" hint="Example: Recognition, Membership, Training">
            <input
              className={inputClass()}
              placeholder="Certificate type"
              value={manualForm.certificate_type}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  certificate_type: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Expiry date" hint="Optional. Leave empty if this certificate does not expire.">
            <input
              type="date"
              className={inputClass()}
              value={manualForm.expiry_date}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  expiry_date: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Signature name" hint="The name that appears as the signature.">
            <input
              className={inputClass()}
              placeholder="Signature name"
              value={manualForm.signatureText}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  signatureText: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Signature title" hint="Example: President, Secretary, Authorized Signatory">
            <input
              className={inputClass()}
              placeholder="Signature title"
              value={manualForm.signatureTitle}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  signatureTitle: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Signature style">
            <select
              value={manualForm.signatureStyle}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  signatureStyle: e.target.value,
                })
              }
              className={inputClass()}
            >
              <option value="signatie">Signatie</option>
              <option value="amsterdam">Amsterdam Handwriting</option>
              <option value="bastliga">Bastliga One</option>
              <option value="cintarini">Cintarini</option>
              <option value="oceantrace">Ocean Trace</option>
            </select>
          </Field>

          <Field label="Logo position">
            <select
              value={manualForm.logoPosition}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  logoPosition: e.target.value,
                })
              }
              className={inputClass()}
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
            </select>
          </Field>

          <Field label="QR code position">
            <select
              value={manualForm.qrPosition}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  qrPosition: e.target.value,
                })
              }
              className={inputClass()}
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="hidden">Hidden</option>
            </select>
          </Field>

          <Field label="Watermark opacity" hint="Use 0.03 to 0.08 for a soft watermark.">
            <input
              type="number"
              min="0"
              max="0.2"
              step="0.01"
              value={manualForm.watermarkOpacity}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  watermarkOpacity: Number(e.target.value),
                })
              }
              className={inputClass()}
              placeholder="Watermark opacity"
            />
          </Field>

          <label className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={manualForm.showWatermark}
              onChange={(e) =>
                setManualForm({
                  ...manualForm,
                  showWatermark: e.target.checked,
                })
              }
            />
            <span>
              <span className="block font-semibold text-slate-200">
                Show watermark
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Display the subtle OMSP background mark.
              </span>
            </span>
          </label>

          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Certificate description" hint="This text appears on the certificate body.">
              <textarea
                className={inputClass("min-h-28 resize-y")}
                placeholder="Certificate description"
                value={manualForm.certificate_description}
                onChange={(e) =>
                  setManualForm({
                    ...manualForm,
                    certificate_description: e.target.value,
                  })
                }
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={manualLoading}
            className="rounded-xl bg-white/10 px-5 py-3 font-semibold text-white disabled:opacity-60 md:col-span-2 xl:col-span-3"
          >
            {manualLoading ? "Generating..." : "Generate Manual Certificate"}
          </button>
        </form>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 p-4">
          <CertificatePreview
            templateId={manualForm.template_id}
            recipientName={manualForm.recipient_name || "Recipient Name"}
            certificateTitle={
              manualForm.certificate_title || "Certificate of Recognition"
            }
            issueDate={new Date().toLocaleDateString()}
            certificateId="OMSP-MANUAL-PREVIEW"
            organizationName="Organization of Marine Science Professionals"
            description={manualForm.certificate_description || DEFAULT_DESCRIPTION}
            signatoryName={manualForm.signatureText}
            signatoryTitle={manualForm.signatureTitle}
            verificationUrl="https://omspglobal.org/verify/OMSP-MANUAL-PREVIEW"
            designOverrides={buildManualDesignOverrides() as any}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <div>
            <h2 className="text-lg font-bold text-white">Generated Certificates</h2>
            <p className="mt-1 text-sm text-slate-400">
              Selected {selectedCertificateIds.length} certificate(s)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                sendCertificateEmails(
                  certificates.filter((cert) =>
                    selectedCertificateIds.includes(cert.id)
                  )
                )
              }
              disabled={bulkEmailLoading || selectedCertificateIds.length === 0}
              className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-50"
            >
              {bulkEmailLoading ? "Sending..." : "Send Selected"}
            </button>

            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white"
            >
              <option value="all">All certificates</option>
              <option value="emailed">Emailed</option>
              <option value="not_emailed">Not emailed</option>
            </select>

            <button
              type="button"
              onClick={() => sendCertificateEmails(certificates)}
              disabled={bulkEmailLoading}
              className="rounded-xl bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50"
            >
              {bulkEmailLoading ? "Sending..." : "Send All Not Emailed"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4 border-b border-white/10 p-4 text-sm font-semibold text-slate-300">
          <span>Select</span>
          <span>Recipient</span>
          <span>Title</span>
          <span>Programme</span>
          <span>Certificate ID</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filteredCertificates.length === 0 ? (
          <p className="p-6 text-slate-400">No certificates generated yet.</p>
        ) : (
          filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="grid grid-cols-7 gap-4 border-b border-white/5 p-4 text-sm text-slate-300"
            >
              <span>
                <input
                  type="checkbox"
                  checked={selectedCertificateIds.includes(cert.id)}
                  onChange={() => toggleCertificate(cert.id)}
                  disabled={
                    bulkEmailLoading ||
                    cert.email_sent ||
                    !cert.recipient_email ||
                    !cert.pdf_url
                  }
                />
              </span>
              <span>{cert.recipient_name}</span>
              <span>{cert.certificate_title || cert.certificate_type}</span>
              <span>{cert.programme_title || "Not provided"}</span>
              <span>{cert.certificate_id}</span>
              <span className="space-y-1">
                <span className="block capitalize">{cert.status}</span>
                {cert.expiry_date && (
                  <span className="block text-[10px] text-amber-200">
                    Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                  </span>
                )}

                <span
                  className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                    cert.email_sent
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-slate-500/20 text-slate-300"
                  }`}
                >
                  {cert.email_sent
                    ? `Email sent${
                        cert.email_sent_at
                          ? ` • ${new Date(cert.email_sent_at).toLocaleString()}`
                          : ""
                      }`
                    : "Not emailed"}
                </span>
              </span>

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

                {cert.pdf_url && (
                  <a
                    href={cert.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-cyan-400/20 px-3 py-2 text-xs text-cyan-100"
                  >
                    PDF
                  </a>
                )}

                <button
                  onClick={() => resendCertificateEmail(cert)}
                  disabled={
                    sendingCertificateIds.includes(cert.id) ||
                    !cert.recipient_email ||
                    !cert.pdf_url
                  }
                  className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs text-emerald-100 disabled:opacity-50"
                >
                  {sendingCertificateIds.includes(cert.id)
                    ? "Sending..."
                    : "Send Email"}
                </button>

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
