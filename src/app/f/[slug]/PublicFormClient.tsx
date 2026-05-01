"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import type { FormWithFields, FormField } from "@/types";

interface PublicFormClientProps {
  form: FormWithFields;
}

type FieldValue = string | string[] | File | null;
type FieldValues = Record<string, FieldValue>;
type Status = "idle" | "loading" | "success" | "error" | "duplicate";

export default function PublicFormClient({ form }: PublicFormClientProps) {
  const [values, setValues] = useState<FieldValues>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const requiredFields = useMemo(
    () => form.form_fields.filter((field) => field.required),
    [form.form_fields]
  );

  const completedRequired = useMemo(() => {
    return requiredFields.filter((field) => {
      const val = values[field.id];

      return !(
        !val ||
        (Array.isArray(val) && val.length === 0) ||
        (typeof val === "string" && val.trim() === "")
      );
    }).length;
  }, [requiredFields, values]);

  const progress =
    requiredFields.length === 0
      ? 100
      : Math.round((completedRequired / requiredFields.length) * 100);

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
      : current.filter((value) => value !== option);

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
      console.error("Supabase file upload error:", error);
      throw new Error(`Failed to upload "${field.label}": ${error.message}`);
    }

    return filePath;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        setStatus("error");
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
        body: JSON.stringify({ form_id: form.id, values: serializedValues }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data?.message ||
          data?.error ||
          "Something went wrong. Please try again.";

        if (
          res.status === 409 ||
          message.toLowerCase().includes("already submitted")
        ) {
          setStatus("duplicate");
          setErrorMsg(message);
          return;
        }

        setErrorMsg(message);
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
      <ResultCard
        type="success"
        title="Application Received"
        message="Your submission has been received. The OMSP team will review it and contact you with the next steps."
      />
    );
  }

  if (status === "duplicate") {
    return (
      <ResultCard
        type="warning"
        title="Already Submitted"
        message="You have already submitted this form. Only one response is allowed per applicant."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>Application progress</span>
          <span>{progress}%</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {form.form_fields.map((field, index) => (
        <Field
          key={field.id}
          field={field}
          index={index}
          value={values[field.id]}
          onChange={(value) => handleChange(field.id, value)}
          onCheckboxChange={(option, checked) =>
            handleCheckboxChange(field.id, option, checked)
          }
        />
      ))}

      {status === "error" && errorMsg && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm leading-relaxed text-red-300">{errorMsg}</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full justify-center py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Submitting application...
            </span>
          ) : (
            "Submit Application"
          )}
        </button>

        <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
          By submitting this form, you agree that OMSP may store and review your
          response for membership and opportunity-related purposes.
        </p>
      </div>
    </form>
  );
}

interface FieldProps {
  field: FormField;
  index: number;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  onCheckboxChange: (option: string, checked: boolean) => void;
}

function Field({
  field,
  index,
  value,
  onChange,
  onCheckboxChange,
}: FieldProps) {
  const label = (
    <label
      htmlFor={field.id}
      className="mb-3 block text-sm font-semibold leading-relaxed text-white"
    >
      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-300">
        {index + 1}
      </span>
      {field.label}
      {field.required && <span className="ml-1 text-red-400">*</span>}
    </label>
  );

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm transition duration-200 hover:border-teal-400/20 hover:bg-white/[0.035]">
      {renderField()}
    </div>
  );

  function renderField() {
    switch (field.field_type) {
      case "textarea":
        return (
          <div>
            {label}
            <textarea
              id={field.id}
              required={field.required}
              rows={5}
              className="form-input w-full resize-none"
              placeholder={field.placeholder ?? ""}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        );

      case "select":
        return (
          <div>
            {label}
            <select
              id={field.id}
              required={field.required}
              className="form-input w-full"
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Select an option</option>
              {(field.options ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "radio":
        return (
          <fieldset>
            <legend className="mb-3 block text-sm font-semibold leading-relaxed text-white">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-300">
                {index + 1}
              </span>
              {field.label}
              {field.required && <span className="ml-1 text-red-400">*</span>}
            </legend>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(field.options ?? []).map((option) => {
                const checked = (value as string) === option;

                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                      checked
                        ? "border-teal-400/50 bg-teal-500/10"
                        : "border-white/10 bg-ocean-950/40 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      required={field.required}
                      checked={checked}
                      onChange={() => onChange(option)}
                      className="h-4 w-4 border-ocean-600 bg-ocean-800 text-teal-500 focus:ring-teal-500/30 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-200">{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );

      case "checkbox":
        return (
          <fieldset>
            <legend className="mb-3 block text-sm font-semibold leading-relaxed text-white">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-300">
                {index + 1}
              </span>
              {field.label}
              {field.required && <span className="ml-1 text-red-400">*</span>}
            </legend>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(field.options ?? []).map((option) => {
                const checked = ((value as string[]) ?? []).includes(option);

                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                      checked
                        ? "border-teal-400/50 bg-teal-500/10"
                        : "border-white/10 bg-ocean-950/40 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option}
                      checked={checked}
                      onChange={(e) =>
                        onCheckboxChange(option, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-ocean-600 bg-ocean-800 text-teal-500 focus:ring-teal-500/30 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-200">{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );

      case "date":
        return (
          <div>
            {label}
            <input
              id={field.id}
              type="date"
              required={field.required}
              className="form-input w-full"
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        );

      case "file": {
        const acceptedTypes = field.accepted_types?.length
          ? field.accepted_types
          : ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

        const acceptValue = acceptedTypes.map((type) => `.${type}`).join(",");

        return (
          <div>
            {label}

            <div className="rounded-xl border border-dashed border-white/15 bg-ocean-950/40 p-4">
              <input
                id={field.id}
                type="file"
                required={field.required}
                accept={acceptValue}
                className="block w-full cursor-pointer rounded-lg text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-600"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
              />

              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Allowed: {acceptedTypes.join(", ").toUpperCase()} • Max:{" "}
                {field.max_size_mb ?? 5}MB
              </p>
            </div>
          </div>
        );
      }

      default:
        return (
          <div>
            {label}
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
              className="form-input w-full"
              placeholder={field.placeholder ?? ""}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        );
    }
  }
}

function ResultCard({
  type,
  title,
  message,
}: {
  type: "success" | "warning";
  title: string;
  message: string;
}) {
  const isSuccess = type === "success";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center sm:p-14">
      <div
        className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
          isSuccess ? "bg-teal-500/15" : "bg-amber-500/15"
        }`}
      >
        {isSuccess ? (
          <svg
            className="h-8 w-8 text-teal-400"
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
        ) : (
          <svg
            className="h-8 w-8 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            />
          </svg>
        )}
      </div>

      <h2 className="mb-3 font-display text-2xl font-bold text-white">
        {title}
      </h2>

      <p className="mx-auto max-w-md leading-relaxed text-slate-300">
        {message}
      </p>

      <a
        href="/opportunities"
        className="btn-ghost mt-8 inline-flex px-6 py-3 text-sm"
      >
        View Other Opportunities
      </a>
    </div>
  );
}