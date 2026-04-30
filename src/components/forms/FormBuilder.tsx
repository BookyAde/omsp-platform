"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify, generateId } from "@/lib/utils";
import { FIELD_TYPE_LABELS } from "@/lib/constants";
import type { FieldType, FormStatus, FormFieldDraft } from "@/types";
import FormField from "./FormField";
import FormPreview from "./FormPreview";

interface FormBuilderProps {
  /** Existing form data when editing */
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    status: FormStatus;
    visibility: "public" | "private";
    requires_review: boolean;
    deadline: string | null;
    fields: FormFieldDraft[];
  };
}

type Tab = "build" | "preview" | "settings";

export default function FormBuilder({ initialData }: FormBuilderProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState<FormStatus>(initialData?.status ?? "draft");

  const [visibility, setVisibility] = useState<"public" | "private">(
    initialData?.visibility ?? "public"
  );

  const [requiresReview, setRequiresReview] = useState<boolean>(
    initialData?.requires_review ?? false
  );

  const [deadline, setDeadline] = useState(
    initialData?.deadline ? initialData.deadline.slice(0, 16) : ""
  );

  const [slugEdited, setSlugEdited] = useState(isEdit);

  const [fields, setFields] = useState<FormFieldDraft[]>(
    initialData?.fields ?? []
  );

  const [activeTab, setActiveTab] = useState<Tab>("build");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copyText, setCopyText] = useState("Copy link");

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugEdited) setSlug(slugify(val));
  }

  function handleSlugChange(val: string) {
    setSlug(slugify(val));
    setSlugEdited(true);
  }

  function addField(type: FieldType) {
    const newField: FormFieldDraft = {
      id: generateId(),
      label: FIELD_TYPE_LABELS[type] ?? type,
      field_type: type,
      placeholder: null,
      required: false,
      options: ["select", "radio", "checkbox"].includes(type)
        ? ["Option 1", "Option 2"]
        : null,
      field_order: fields.length,
      is_active: true,
      accepted_types: type === "file" ? [] : null,
      max_size_mb: type === "file" ? 5 : null,
    };

    setFields((prev) => [...prev, newField]);
  }

  function updateField(id: string, updates: Partial<FormFieldDraft>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }

  function removeField(id: string) {
    setFields((prev) =>
      prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, field_order: i }))
    );
  }

  function moveField(id: string, direction: "up" | "down") {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);

      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const next = [...prev];
      const swap = direction === "up" ? idx - 1 : idx + 1;

      [next[idx], next[swap]] = [next[swap], next[idx]];

      return next.map((f, i) => ({ ...f, field_order: i }));
    });
  }

  async function handleSave(saveStatus?: FormStatus) {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title,
      slug,
      description: description || null,
      status: saveStatus ?? status,
      visibility,
      requires_review: requiresReview,
      deadline: deadline || null,
      fields: fields.map((f, i) => ({ ...f, field_order: i })),
    };

    const res = await fetch(
      isEdit ? `/api/forms/${initialData!.id}` : "/api/forms",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save form.");
      setSaving(false);
      return;
    }

    router.push("/admin/forms");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this form and all its submissions?")) return;

    setSaving(true);

    await fetch(`/api/forms/${initialData!.id}`, {
      method: "DELETE",
    });

    router.push("/admin/forms");
    router.refresh();
  }

  async function copyPublicLink() {
    const url = `${window.location.origin}/f/${slug}`;

    await navigator.clipboard.writeText(url);

    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy link"), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Form title..."
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="flex-1 bg-transparent text-white font-display text-xl font-bold
                     placeholder-ocean-600 focus:outline-none border-b border-transparent
                     hover:border-ocean-600 focus:border-teal-500 pb-0.5 transition-colors w-full"
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FormStatus)}
            className="form-input py-2 text-sm w-auto"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>

          {isEdit && status !== "published" && (
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="btn-ghost text-sm px-4 py-2.5 border-teal-500/50 text-teal-400"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-1 border-b border-ocean-700/50 pb-0">
        {(["build", "preview", "settings"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium capitalize rounded-t-lg transition-colors -mb-px border-b-2 ${
              activeTab === tab
                ? "text-teal-400 border-teal-500 bg-teal-500/5"
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "build" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-card p-5 sticky top-24">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
                Add Field
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left
                               bg-ocean-800/60 hover:bg-ocean-700/60 border border-ocean-700/40
                               hover:border-teal-500/30 text-slate-300 hover:text-white
                               transition-all duration-150 text-xs font-medium"
                  >
                    <span className="text-teal-500 flex-shrink-0">
                      <FieldIcon type={type} />
                    </span>
                    {FIELD_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {fields.length === 0 ? (
              <div className="glass-card p-16 text-center border-dashed border-ocean-600/40">
                <p className="text-slate-500 text-sm">
                  No fields yet. Add fields from the palette on the left.
                </p>
              </div>
            ) : (
              fields.map((field, idx) => (
                <FormField
                  key={field.id}
                  field={field}
                  isFirst={idx === 0}
                  isLast={idx === fields.length - 1}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onRemove={() => removeField(field.id)}
                  onMove={(dir) => moveField(field.id, dir)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div className="max-w-2xl mx-auto w-full">
          <FormPreview
            title={title || "Untitled Form"}
            description={description}
            fields={fields}
          />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="max-w-2xl space-y-5">
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-display font-bold text-white">Form Settings</h3>

            <div>
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="What is this form for? This appears on the public form page."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Visibility</label>
              <select
                className="form-input"
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as "public" | "private")
                }
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <p className="text-slate-600 text-xs mt-1.5">
                Public forms appear on the opportunities page. Private forms are
                hidden but can still be used internally.
              </p>
            </div>

            <div>
              <label className="form-label">Requires Review</label>
              <select
                className="form-input"
                value={requiresReview ? "yes" : "no"}
                onChange={(e) => setRequiresReview(e.target.value === "yes")}
              >
                <option value="no">No, just collect submissions</option>
                <option value="yes">Yes, admin must approve</option>
              </select>

              <p className="text-slate-600 text-xs mt-1.5">
                Enable this if submissions should be reviewed and approved before
                being accepted, for example membership forms.
              </p>
            </div>

            <div>
              <label className="form-label">URL Slug</label>

              <div className="flex items-center gap-0">
                <span
                  className="px-3 py-3 bg-ocean-900 border border-r-0 border-ocean-600 rounded-l-lg
                                 text-slate-500 text-sm font-mono"
                >
                  /f/
                </span>

                <input
                  type="text"
                  className="form-input rounded-l-none flex-1"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="your-form-slug"
                />
              </div>

              <p className="text-slate-600 text-xs mt-1.5">
                Public URL:{" "}
                {typeof window !== "undefined"
                  ? window.location.origin
                  : "https://omsp.org"}
                /f/{slug || "your-slug"}
              </p>
            </div>

            <div>
              <label className="form-label">Deadline</label>
              <input
                type="datetime-local"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />

              <p className="text-slate-600 text-xs mt-1.5">
                Form automatically stops accepting responses after this date.
              </p>
            </div>

            {isEdit && (
              <div>
                <label className="form-label">Public Link</label>

                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "https://omsp.org"
                    }/f/${slug}`}
                    className="form-input flex-1 text-slate-400 font-mono text-xs"
                  />

                  <button
                    onClick={copyPublicLink}
                    className="btn-ghost text-sm px-4 py-2.5 flex-shrink-0"
                  >
                    {copyText}
                  </button>

                  <a
                    href={`/f/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-sm px-4 py-2.5 flex-shrink-0"
                  >
                    Open
                  </a>
                </div>
              </div>
            )}
          </div>

          {isEdit && (
            <div className="glass-card p-6 border-red-500/20">
              <h3 className="font-display font-bold text-red-400 mb-3">
                Danger Zone
              </h3>

              <p className="text-slate-400 text-sm mb-5">
                Deleting this form will permanently remove all submissions. This
                cannot be undone.
              </p>

              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/15
                           border border-red-500/30 text-sm font-medium transition-all"
              >
                Delete Form
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FieldIcon({ type }: { type: FieldType }) {
  const icons: Record<FieldType, string> = {
    text: "T",
    textarea: "¶",
    email: "@",
    phone: "#",
    select: "▾",
    radio: "◉",
    checkbox: "☑",
    date: "▦",
    file: "↥",
  };

  return (
    <span className="font-mono text-xs w-4 text-center">
      {icons[type] ?? "?"}
    </span>
  );
}