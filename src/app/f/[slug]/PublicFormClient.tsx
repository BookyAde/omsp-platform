"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import type { FormWithFields, FormField } from "@/types";

interface PublicFormClientProps {
  form: FormWithFields;
}

type FieldValue = string | string[] | File | null;
type FieldValues = Record<string, FieldValue>;

export default function PublicFormClient({ form }: PublicFormClientProps) {
  const [values, setValues] = useState<FieldValues>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(fieldId: string, value: FieldValue) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleCheckboxChange(
    fieldId: string,
    option: string,
    checked: boolean
  ) {
    const current = (values[fieldId] as string[]) ?? [];

    const updated = checked
      ? [...current, option]
      : current.filter((v) => v !== option);

    setValues((prev) => ({ ...prev, [fieldId]: updated }));
  }

  async function uploadFile(field: FormField, file: File) {
    const supabase = createBrowserClient();

    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "file";
    const safeFileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `forms/${form.id}/${field.id}/${safeFileName}`;

    const { error } = await supabase.storage
      .from("form-uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file for "${field.label}".`);
    }

    return filePath;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    for (const field of form.form_fields) {
      if (!field.required) continue;

      const val = values[field.id];

      const isEmpty =
        !val ||
        (Array.isArray(val) && val.length === 0) ||
        (typeof val === "string" && val.trim() === "");

      if (isEmpty) {
        setErrorMsg(`"${field.label}" is required.`);
        return;
      }
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const serializedValues: Record<string, string> = {};

      for (const field of form.form_fields) {
        const val = values[field.id];

        if (!val) {
          serializedValues[field.id] = "";
          continue;
        }

        if (field.field_type === "file" && val instanceof File) {
          const ext = val.name.split(".").pop()?.toLowerCase();
          const allowed = field.accepted_types ?? [];

          if (allowed.length && (!ext || !allowed.includes(ext))) {
            throw new Error(
              `"${field.label}" must be one of: ${allowed
                .join(", ")
                .toUpperCase()}`
            );
          }

          const maxSizeMB = field.max_size_mb ?? 5;
          const maxSize = maxSizeMB * 1024 * 1024;

          if (val.size > maxSize) {
            throw new Error(`"${field.label}" must not exceed ${maxSizeMB}MB`);
          }

          const filePath = await uploadFile(field, val);
          serializedValues[field.id] = filePath;
          continue;
        }

        serializedValues[field.id] = Array.isArray(val)
          ? val.join(", ")
          : String(val);
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: form.id,
          values: serializedValues,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="glass-card p-14 text-center">
        <div className="w-16 h-16 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-teal-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>

        <h2 className="font-display text-2xl font-bold text-white mb-3">
          Thank you for applying
        </h2>

        <p className="text-slate-300 leading-relaxed max-w-md mx-auto">
          Your submission has been received. The OMSP team will review it and be
          in touch if you are selected.
        </p>

        <a
          href="/opportunities"
          className="btn-ghost inline-flex mt-8 px-6 py-3 text-sm"
        >
          View Other Opportunities
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
      {form.form_fields.map((field) => (
        <PublicField
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={(val) => handleChange(field.id, val)}
          onCheckboxChange={(opt, checked) =>
            handleCheckboxChange(field.id, opt, checked)
          }
        />
      ))}

      {(status === "error" || errorMsg) && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full justify-center py-3.5 text-base"
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Application"
          )}
        </button>

        <p className="text-center text-slate-600 text-xs mt-3">
          By submitting you agree to OMSP storing your response.
        </p>
      </div>
    </form>
  );
}

interface PublicFieldProps {
  field: FormField;
  value: FieldValue | undefined;
  onChange: (val: FieldValue) => void;
  onCheckboxChange: (option: string, checked: boolean) => void;
}

function PublicField({
  field,
  value,
  onChange,
  onCheckboxChange,
}: PublicFieldProps) {
  const labelEl = (
    <label className="form-label" htmlFor={field.id}>
      {field.label}
      {field.required && <span className="text-red-400 ml-1 text-xs">*</span>}
    </label>
  );

  switch (field.field_type) {
    case "textarea":
      return (
        <div>
          {labelEl}
          <textarea
            id={field.id}
            required={field.required}
            rows={5}
            className="form-input resize-none"
            placeholder={field.placeholder ?? ""}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "select":
      return (
        <div>
          {labelEl}
          <select
            id={field.id}
            required={field.required}
            className="form-input"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select an option</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <fieldset>
          <legend className="form-label">
            {field.label}
            {field.required && (
              <span className="text-red-400 ml-1 text-xs">*</span>
            )}
          </legend>

          <div className="mt-2 space-y-2.5">
            {(field.options ?? []).map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  required={field.required}
                  checked={(value as string) === opt}
                  onChange={() => onChange(opt)}
                  className="w-4 h-4 border-ocean-600 bg-ocean-800 text-teal-500 focus:ring-teal-500/30 focus:ring-offset-0"
                />

                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      );

    case "checkbox":
      return (
        <fieldset>
          <legend className="form-label">
            {field.label}
            {field.required && (
              <span className="text-red-400 ml-1 text-xs">*</span>
            )}
          </legend>

          <div className="mt-2 space-y-2.5">
            {(field.options ?? []).map((opt) => {
              const checked = ((value as string[]) ?? []).includes(opt);

              return (
                <label
                  key={opt}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    value={opt}
                    checked={checked}
                    onChange={(e) => onCheckboxChange(opt, e.target.checked)}
                    className="w-4 h-4 rounded border-ocean-600 bg-ocean-800 text-teal-500 focus:ring-teal-500/30 focus:ring-offset-0"
                  />

                  <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      );

    case "date":
      return (
        <div>
          {labelEl}
          <input
            id={field.id}
            type="date"
            required={field.required}
            className="form-input"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "file": {
      const acceptedTypes = field.accepted_types?.length
        ? field.accepted_types
        : ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

      const acceptValue = acceptedTypes.map((t) => `.${t}`).join(",");

      return (
        <div>
          {labelEl}

          <input
            id={field.id}
            type="file"
            required={field.required}
            accept={acceptValue}
            className="form-input"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />

          <p className="text-slate-600 text-xs mt-1.5">
            Allowed: {acceptedTypes.join(", ").toUpperCase()} • Max:{" "}
            {field.max_size_mb ?? 5}MB
          </p>
        </div>
      );
    }

    default:
      return (
        <div>
          {labelEl}
          <input
            id={field.id}
            type={
              field.field_type === "email"
                ? "email"
                : field.field_type === "phone"
                ? "tel"
                : "text"
            }
            required={field.required}
            className="form-input"
            placeholder={field.placeholder ?? ""}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}