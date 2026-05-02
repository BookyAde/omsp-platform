"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify, generateId } from "@/lib/utils";
import { FIELD_TYPE_LABELS } from "@/lib/constants";
import type { FieldType, FormStatus, FormFieldDraft } from "@/types";
import FormField from "./FormField";
import FormPreview from "./FormPreview";

interface FormBuilderProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    status: FormStatus;
    visibility: "public" | "private";
    requires_review: boolean;
    form_mode?: "single_page" | "multi_step";
    deadline: string | null;
    fields: FormFieldDraft[];
  };
}

type Tab = "build" | "preview" | "settings";

export default function FormBuilder({ initialData }: FormBuilderProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FormStatus>("draft");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [requiresReview, setRequiresReview] = useState(false);
  const [formMode, setFormMode] = useState<"single_page" | "multi_step">("single_page");
  const [deadline, setDeadline] = useState("");
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [fields, setFields] = useState<FormFieldDraft[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("build");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copyText, setCopyText] = useState("Copy link");

  useEffect(() => {
    if (!initialData) return;

    setTitle(initialData.title ?? "");
    setSlug(initialData.slug ?? "");
    setDescription(initialData.description ?? "");
    setStatus(initialData.status ?? "draft");
    setVisibility(initialData.visibility ?? "public");
    setRequiresReview(initialData.requires_review ?? false);
    setFormMode(initialData.form_mode ?? "single_page");
    setDeadline(initialData.deadline ? initialData.deadline.slice(0, 16) : "");

    setFields(
      (initialData.fields ?? []).map((field, index) => ({
        ...field,
        step: field.step ?? "General",
        accepted_types: field.accepted_types ?? [],
        max_size_mb: field.max_size_mb ?? 5,
        field_order: index,
      }))
    );
  }, [initialData]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlug(slugify(value));
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
      step: "General",
      accepted_types: type === "file" ? [] : null,
      max_size_mb: type === "file" ? 5 : null,
    };

    setFields((prev) => [...prev, newField]);
  }

  function updateField(id: string, updates: Partial<FormFieldDraft>) {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id !== id) return field;

        return {
          ...field,
          ...updates,
          step: updates.step ?? field.step ?? "General",
          accepted_types: updates.accepted_types ?? field.accepted_types ?? [],
          max_size_mb: updates.max_size_mb ?? field.max_size_mb ?? 5,
        };
      })
    );
  }

  function removeField(id: string) {
    setFields((prev) =>
      prev
        .filter((field) => field.id !== id)
        .map((field, index) => ({ ...field, field_order: index }))
    );
  }

  function moveField(id: string, direction: "up" | "down") {
    setFields((prev) => {
      const index = prev.findIndex((field) => field.id === id);

      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const next = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;

      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];

      return next.map((field, order) => ({ ...field, field_order: order }));
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

    try {
      const payload = {
        title,
        slug,
        description: description || null,
        status: saveStatus ?? status,
        visibility,
        requires_review: requiresReview,
        form_mode: formMode,
        deadline: deadline || null,
        fields: fields.map((field, index) => ({
          ...field,
          step: field.step ?? "General",
          accepted_types: field.accepted_types ?? [],
          max_size_mb: field.max_size_mb ?? 5,
          field_order: index,
        })),
      };

      const res = await fetch(
        isEdit ? `/api/forms/${initialData!.id}` : "/api/forms",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to save form.");
        return;
      }

      router.push("/admin/forms");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialData?.id) return;
    if (!confirm("Permanently delete this form and all its submissions?")) return;

    setSaving(true);

    try {
      await fetch(`/api/forms/${initialData.id}`, {
        method: "DELETE",
      });

      router.push("/admin/forms");
      router.refresh();
    } finally {
      setSaving(false);
    }
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
          className="flex-1 bg-transparent text-white font-display text-xl font-bold placeholder-ocean-600 focus:outline-none border-b border-transparent hover:border-ocean-600 focus:border-teal-500 pb-0.5 transition-colors w-full"
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
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>

          {isEdit && status !== "published" && (
            <button
              type="button"
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
            type="button"
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
                    type="button"
                    onClick={() => addField(type)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left bg-ocean-800/60 hover:bg-ocean-700/60 border border-ocean-700/40 hover:border-teal-500/30 text-slate-300 hover:text-white transition-all duration-150 text-xs font-medium"
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
              fields.map((field, index) => (
                <FormField
                  key={field.id}
                  field={field}
                  isFirst={index === 0}
                  isLast={index === fields.length - 1}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onRemove={() => removeField(field.id)}
                  onMove={(direction) => moveField(field.id, direction)}
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
              <label className="form-label">Form Layout</label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormMode("single_page")}
                  className={`px-4 py-2 rounded-xl border text-sm ${
                    formMode === "single_page"
                      ? "border-teal-400 bg-teal-500/10 text-teal-300"
                      : "border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  Single Page
                </button>

                <button
                  type="button"
                  onClick={() => setFormMode("multi_step")}
                  className={`px-4 py-2 rounded-xl border text-sm ${
                    formMode === "multi_step"
                      ? "border-teal-400 bg-teal-500/10 text-teal-300"
                      : "border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  Multi Step
                </button>
              </div>

              <p className="text-slate-600 text-xs mt-1.5">
                Choose how the form is presented to users. Multi-step improves
                completion for long forms.
              </p>
            </div>

            <div>
              <label className="form-label">URL Slug</label>

              <div className="flex items-center gap-0">
                <span className="px-3 py-3 bg-ocean-900 border border-r-0 border-ocean-600 rounded-l-lg text-slate-500 text-sm font-mono">
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
                    type="button"
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
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/15 border border-red-500/30 text-sm font-medium transition-all"
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