"use client";
import { useState, useEffect, useMemo } from "react";
import { CERTIFICATE_TEMPLATES } from "@/lib/certificates/templates";
import CertificatePreview from "@/components/certificates/CertificatePreview";

const DEFAULT_TEMPLATE_ID = "classic-maritime";
const DEFAULT_DESCRIPTION =
  "This certificate preview demonstrates the selected certificate design.";
const DEFAULT_SIGNATURE_TEXT = "OMSP Administration";
const DEFAULT_SIGNATURE_TITLE = "Authorized Signatory";
const DEFAULT_SIGNATURE_STYLE = "executive";

export default function NewCertificateForm({ forms }: { forms: { id: string; title: string }[] }) {
  const [activeTab, setActiveTab] = useState<"submission" | "manual">("submission");
  const [selectedFormId, setSelectedFormId] = useState("");
  const [eligibleSubmissions, setEligibleSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // --- Search & Filter states (restored) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [certificateFilter, setCertificateFilter] = useState("not_generated");

  // Settings for submission‑based certificates (full as original)
  const [submissionSettings, setSubmissionSettings] = useState({
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

  // Manual certificate form (full)
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

  useEffect(() => {
    if (selectedFormId) loadEligibleSubmissions(selectedFormId);
  }, [selectedFormId]);

  async function loadEligibleSubmissions(formId: string) {
    setLoadingSubmissions(true);
    const res = await fetch(`/api/certificates/eligible-submissions?form_id=${formId}`);
    const data = await res.json();
    if (res.ok) setEligibleSubmissions(data);
    else setMessage(data.error || "Failed to load submissions");
    setLoadingSubmissions(false);
  }

  function buildDesignOverrides(settings: any) {
    return {
      description: settings.certificate_description,
      logoPosition: settings.logoPosition,
      qrPosition: settings.qrPosition,
      showWatermark: settings.showWatermark,
      watermarkOpacity: settings.watermarkOpacity,
      signatureText: settings.signatureText,
      signatureTitle: settings.signatureTitle,
      signatureStyle: settings.signatureStyle,
    };
  }

  async function createCertificateFromSubmission(submission: any) {
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "form_submission",
        form_id: submission.form_id,
        submission_id: submission.submission_id,
        certificate_title: submissionSettings.certificate_title,
        recipient_name: submission.recipient_name,
        recipient_email: submission.recipient_email,
        programme_title: forms.find(f => f.id === submission.form_id)?.title || "",
        certificate_type: submissionSettings.certificate_type,
        template_id: submissionSettings.template_id,
        design_overrides: buildDesignOverrides(submissionSettings),
        expiry_date: submissionSettings.expiry_date || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed");
    return data;
  }

  async function generateSingle(submission: any) {
    setGeneratingId(submission.submission_id);
    try {
      await createCertificateFromSubmission(submission);
      setMessage("Certificate generated.");
      setEligibleSubmissions(prev =>
        prev.map(s =>
          s.submission_id === submission.submission_id
            ? { ...s, has_certificate: true, certificate: { id: "temp" } }
            : s
        )
      );
      setSelectedSubmissionIds(prev => prev.filter(id => id !== submission.submission_id));
    } catch (err: any) {
      setMessage(err.message || "Generation failed");
    } finally {
      setGeneratingId(null);
    }
  }

  async function generateSelected() {
    const selected = eligibleSubmissions.filter(s => selectedSubmissionIds.includes(s.submission_id) && !s.has_certificate);
    if (selected.length === 0) return;
    setBulkGenerating(true);
    for (const sub of selected) {
      await generateSingle(sub);
    }
    setSelectedSubmissionIds([]);
    setBulkGenerating(false);
  }

  async function generateManual(e: React.FormEvent) {
    e.preventDefault();
    setManualLoading(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "manual",
          certificate_title: manualForm.certificate_title,
          recipient_name: manualForm.recipient_name,
          recipient_email: manualForm.recipient_email,
          programme_title: manualForm.programme_title,
          certificate_type: manualForm.certificate_type,
          expiry_date: manualForm.expiry_date || null,
          template_id: manualForm.template_id,
          design_overrides: buildDesignOverrides(manualForm),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Manual certificate created.");
        // Reset form
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
      } else {
        setMessage(data.error || "Manual generation failed");
      }
    } catch (err: any) {
      setMessage(err.message || "Manual generation failed");
    } finally {
      setManualLoading(false);
    }
  }

  // Filter submissions based on search and filter state
  const filteredSubmissions = useMemo(() => {
    return eligibleSubmissions.filter(sub => {
      const matchesSearch =
        sub.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        certificateFilter === "all" ||
        (certificateFilter === "generated" && sub.has_certificate) ||
        (certificateFilter === "not_generated" && !sub.has_certificate);
      return matchesSearch && matchesFilter;
    });
  }, [eligibleSubmissions, searchTerm, certificateFilter]);

  const selectableFilteredSubmissions = filteredSubmissions.filter(sub => !sub.has_certificate);
  const allFilteredSelected =
    selectableFilteredSubmissions.length > 0 &&
    selectableFilteredSubmissions.every(sub => selectedSubmissionIds.includes(sub.submission_id));

  function toggleAllFiltered() {
    const filteredIds = selectableFilteredSubmissions.map(s => s.submission_id);
    if (allFilteredSelected) {
      setSelectedSubmissionIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedSubmissionIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  }

  async function generateAllFiltered() {
    await generateSelected(); // current selected already includes filtered if toggle used
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("submission")}
          className={`px-4 py-2 text-sm font-semibold ${activeTab === "submission" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-400"}`}
        >
          From Form Submissions
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 text-sm font-semibold ${activeTab === "manual" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-400"}`}
        >
          Manual Entry
        </button>
      </div>

      {/* ==================== SUBMISSION TAB ==================== */}
      {activeTab === "submission" && (
        <div className="space-y-6">
          {/* Settings grid (same as original) */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold text-white">Certificate Settings</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200">Certificate title</label>
                <input
                  className="form-input w-full"
                  placeholder="Certificate of Participation"
                  value={submissionSettings.certificate_title}
                  onChange={e => setSubmissionSettings({ ...submissionSettings, certificate_title: e.target.value })}
                />
              </div>
              <div>
                <label>Certificate type</label>
                <input
                  className="form-input w-full"
                  placeholder="Participation"
                  value={submissionSettings.certificate_type}
                  onChange={e => setSubmissionSettings({ ...submissionSettings, certificate_type: e.target.value })}
                />
              </div>
              <div>
                <label>Template design</label>
                <select
                  className="form-input w-full"
                  value={submissionSettings.template_id}
                  onChange={e => setSubmissionSettings({ ...submissionSettings, template_id: e.target.value })}
                >
                  {CERTIFICATE_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Expiry date (optional)</label>
                <input
                  type="date"
                  className="form-input w-full"
                  value={submissionSettings.expiry_date}
                  onChange={e => setSubmissionSettings({ ...submissionSettings, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <label>Certificate description</label>
              <textarea
                className="form-input w-full min-h-28"
                value={submissionSettings.certificate_description}
                onChange={e => setSubmissionSettings({ ...submissionSettings, certificate_description: e.target.value })}
              />
            </div>

            {/* Layout settings */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <h3 className="text-lg font-semibold text-white">Layout Settings</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label>Logo position</label>
                  <select
                    className="form-input w-full"
                    value={submissionSettings.logoPosition}
                    onChange={e => setSubmissionSettings({ ...submissionSettings, logoPosition: e.target.value })}
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>
                <div>
                  <label>QR code position</label>
                  <select
                    className="form-input w-full"
                    value={submissionSettings.qrPosition}
                    onChange={e => setSubmissionSettings({ ...submissionSettings, qrPosition: e.target.value })}
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <div>
                  <label>Watermark opacity (0–0.2)</label>
                  <input
                    type="number"
                    min="0"
                    max="0.2"
                    step="0.01"
                    className="form-input w-full"
                    value={submissionSettings.watermarkOpacity}
                    onChange={e => setSubmissionSettings({ ...submissionSettings, watermarkOpacity: Number(e.target.value) })}
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={submissionSettings.showWatermark}
                    onChange={e => setSubmissionSettings({ ...submissionSettings, showWatermark: e.target.checked })}
                  />
                  <span>Show watermark</span>
                </label>
              </div>
            </div>

            {/* Signature settings */}
            <div className="mt-4 rounded-3xl border border-cyan-400/10 bg-cyan-400/5 p-5">
              <h3 className="text-lg font-semibold text-white">Signature Settings</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label>Signature name</label>
                  <input
                    className="form-input w-full"
                    placeholder="OMSP Administration"
                    value={submissionSettings.signatureText}
                    onChange={e => setSubmissionSettings({ ...submissionSettings, signatureText: e.target.value })}
                  />
                </div>
                <div>
                  <label>Signature title</label>
                  <input
                    className="form-input w-full"
                    placeholder="Authorized Signatory"
                    value={submissionSettings.signatureTitle}
                    onChange={e => setSubmissionSettings({ ...submissionSettings, signatureTitle: e.target.value })}
                  />
                </div>
                <div>
                  <label>Signature style</label>
                  <select
                    className="form-input w-full"
                    value={submissionSettings.signatureStyle}
                    onChange={e => setSubmissionSettings({ ...submissionSettings, signatureStyle: e.target.value })}
                  >
                    <option value="signatie">Signatie</option>
                    <option value="amsterdam">Amsterdam Handwriting</option>
                    <option value="bastliga">Bastliga One</option>
                    <option value="cintarini">Cintarini</option>
                    <option value="oceantrace">Ocean Trace</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              <CertificatePreview
                templateId={submissionSettings.template_id}
                recipientName="John Doe"
                certificateTitle={submissionSettings.certificate_title}
                issueDate={new Date().toLocaleDateString()}
                expiryDate={submissionSettings.expiry_date ? new Date(submissionSettings.expiry_date).toLocaleDateString() : undefined}
                certificateId="OMSP-PREVIEW-001"
                organizationName="Organization of Marine Science Professionals"
                description={submissionSettings.certificate_description}
                signatoryName={submissionSettings.signatureText}
                signatoryTitle={submissionSettings.signatureTitle}
                verificationUrl="https://omspglobal.org/verify/OMSP-PREVIEW-001"
                designOverrides={buildDesignOverrides(submissionSettings) as any}
              />
            </div>
          </div>

          {/* Form selection and submissions with search & filter */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white">Select Approved Form Submissions</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label>Form</label>
                <select
                  className="form-input w-full"
                  value={selectedFormId}
                  onChange={e => setSelectedFormId(e.target.value)}
                >
                  <option value="">Select a form</option>
                  {forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                </select>
              </div>
              <div>
                <label>Search submissions</label>
                <input
                  type="text"
                  className="form-input w-full"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label>Certificate filter</label>
                <select
                  className="form-input w-full"
                  value={certificateFilter}
                  onChange={e => setCertificateFilter(e.target.value)}
                >
                  <option value="not_generated">Not generated</option>
                  <option value="generated">Generated</option>
                  <option value="all">All</option>
                </select>
              </div>
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
                disabled={bulkGenerating || selectableFilteredSubmissions.length === 0}
                className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {bulkGenerating ? "Generating..." : "Generate All Filtered"}
              </button>
              <button
                type="button"
                onClick={toggleAllFiltered}
                disabled={selectableFilteredSubmissions.length === 0}
                className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                {allFilteredSelected ? "Deselect All" : "Select All Filtered"}
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-400">
              Showing {filteredSubmissions.length} submission(s). Selected {selectedSubmissionIds.length}.
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
                        checked={selectedSubmissionIds.includes(submission.submission_id)}
                        onChange={() => {
                          if (submission.has_certificate) return;
                          setSelectedSubmissionIds(prev =>
                            prev.includes(submission.submission_id)
                              ? prev.filter(id => id !== submission.submission_id)
                              : [...prev, submission.submission_id]
                          );
                        }}
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
                          onClick={() => downloadQr(submission.certificate)}
                          className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white"
                        >
                          Download QR
                        </button>
                      ) : (
                        <button
                          onClick={() => generateSingle(submission)}
                          disabled={generatingId === submission.submission_id || bulkGenerating}
                          className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
                        >
                          {generatingId === submission.submission_id ? "Generating..." : "Generate"}
                        </button>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MANUAL TAB ==================== */}
      {activeTab === "manual" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold text-white">Manual Certificate Entry</h2>
            <form onSubmit={generateManual} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label>Certificate title</label>
                <input className="form-input" value={manualForm.certificate_title} onChange={e => setManualForm({ ...manualForm, certificate_title: e.target.value })} required />
              </div>
              <div>
                <label>Template design</label>
                <select className="form-input" value={manualForm.template_id} onChange={e => setManualForm({ ...manualForm, template_id: e.target.value })}>
                  {CERTIFICATE_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label>Recipient name</label>
                <input className="form-input" value={manualForm.recipient_name} onChange={e => setManualForm({ ...manualForm, recipient_name: e.target.value })} required />
              </div>
              <div>
                <label>Recipient email</label>
                <input type="email" className="form-input" value={manualForm.recipient_email} onChange={e => setManualForm({ ...manualForm, recipient_email: e.target.value })} />
              </div>
              <div>
                <label>Programme title</label>
                <input className="form-input" value={manualForm.programme_title} onChange={e => setManualForm({ ...manualForm, programme_title: e.target.value })} required />
              </div>
              <div>
                <label>Certificate type</label>
                <input className="form-input" value={manualForm.certificate_type} onChange={e => setManualForm({ ...manualForm, certificate_type: e.target.value })} />
              </div>
              <div>
                <label>Expiry date</label>
                <input type="date" className="form-input" value={manualForm.expiry_date} onChange={e => setManualForm({ ...manualForm, expiry_date: e.target.value })} />
              </div>
              <div>
                <label>Signature name</label>
                <input className="form-input" value={manualForm.signatureText} onChange={e => setManualForm({ ...manualForm, signatureText: e.target.value })} />
              </div>
              <div>
                <label>Signature title</label>
                <input className="form-input" value={manualForm.signatureTitle} onChange={e => setManualForm({ ...manualForm, signatureTitle: e.target.value })} />
              </div>
              <div>
                <label>Signature style</label>
                <select className="form-input" value={manualForm.signatureStyle} onChange={e => setManualForm({ ...manualForm, signatureStyle: e.target.value })}>
                  <option value="signatie">Signatie</option>
                  <option value="amsterdam">Amsterdam Handwriting</option>
                  <option value="bastliga">Bastliga One</option>
                  <option value="cintarini">Cintarini</option>
                  <option value="oceantrace">Ocean Trace</option>
                </select>
              </div>
              <div>
                <label>Logo position</label>
                <select className="form-input" value={manualForm.logoPosition} onChange={e => setManualForm({ ...manualForm, logoPosition: e.target.value })}>
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>
              <div>
                <label>QR position</label>
                <select className="form-input" value={manualForm.qrPosition} onChange={e => setManualForm({ ...manualForm, qrPosition: e.target.value })}>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div>
                <label>Watermark opacity</label>
                <input type="number" min="0" max="0.2" step="0.01" className="form-input" value={manualForm.watermarkOpacity} onChange={e => setManualForm({ ...manualForm, watermarkOpacity: Number(e.target.value) })} />
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={manualForm.showWatermark} onChange={e => setManualForm({ ...manualForm, showWatermark: e.target.checked })} />
                Show watermark
              </label>
              <div className="md:col-span-2 xl:col-span-3">
                <label>Certificate description</label>
                <textarea className="form-input w-full min-h-28" value={manualForm.certificate_description} onChange={e => setManualForm({ ...manualForm, certificate_description: e.target.value })} />
              </div>
              <button type="submit" disabled={manualLoading} className="btn-primary md:col-span-2 xl:col-span-3">
                {manualLoading ? "Generating..." : "Generate Manual Certificate"}
              </button>
            </form>
          </div>

          {/* Live preview for manual */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
            <CertificatePreview
              templateId={manualForm.template_id}
              recipientName={manualForm.recipient_name || "Recipient Name"}
              certificateTitle={manualForm.certificate_title}
              issueDate={new Date().toLocaleDateString()}
              expiryDate={manualForm.expiry_date ? new Date(manualForm.expiry_date).toLocaleDateString() : undefined}
              certificateId="OMSP-MANUAL-PREVIEW"
              organizationName="Organization of Marine Science Professionals"
              description={manualForm.certificate_description}
              signatoryName={manualForm.signatureText}
              signatoryTitle={manualForm.signatureTitle}
              verificationUrl="https://omspglobal.org/verify/OMSP-MANUAL-PREVIEW"
              designOverrides={buildDesignOverrides(manualForm) as any}
            />
          </div>
        </div>
      )}

      {/* Toast message */}
      {message && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-slate-400 hover:text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to download QR (needs certificate object)
function downloadQr(cert: any) {
  if (!cert || !cert.qr_code_data_url) return;
  const link = document.createElement("a");
  link.href = cert.qr_code_data_url;
  link.download = `${cert.certificate_id}-qr.png`;
  link.click();
}