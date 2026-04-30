import type { FormFieldDraft } from "@/types";

interface FormPreviewProps {
  title:       string;
  description: string;
  fields:      FormFieldDraft[];
}

export default function FormPreview({ title, description, fields }: FormPreviewProps) {
  return (
    <div className="glass-card p-8">
      {/* Preview badge */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-ocean-700/40">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">Preview Mode</span>
      </div>

      {/* Form header */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
        {description && (
          <p className="text-slate-300 mt-3 leading-relaxed text-sm">{description}</p>
        )}
      </div>

      {fields.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-8">
          Add fields in the Build tab to preview the form.
        </p>
      ) : (
        <div className="space-y-5">
          {fields.map((field) => (
            <PreviewField key={field.id} field={field} />
          ))}

          <div className="pt-4">
            <div className="w-full py-3.5 rounded-lg bg-teal-500/20 border border-teal-500/30
                            text-teal-400 text-sm font-medium text-center cursor-not-allowed select-none">
              Submit (Preview Only)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewField({ field }: { field: FormFieldDraft }) {
  const labelEl = (
    <label className="form-label flex items-center gap-1">
      {field.label}
      {field.required && <span className="text-red-400 text-xs">*</span>}
    </label>
  );

  switch (field.field_type) {
    case "textarea":
      return (
        <div>
          {labelEl}
          <textarea
            disabled rows={4}
            className="form-input resize-none cursor-not-allowed opacity-70"
            placeholder={field.placeholder ?? ""}
          />
        </div>
      );

    case "select":
      return (
        <div>
          {labelEl}
          <select disabled className="form-input cursor-not-allowed opacity-70">
            <option value="">Select an option</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div>
          {labelEl}
          <div className="space-y-2 mt-1">
            {(field.options ?? []).map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-not-allowed">
                <input type="radio" disabled
                  className="w-4 h-4 border-ocean-600 bg-ocean-800 text-teal-500 opacity-60" />
                <span className="text-slate-300 text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "checkbox":
      return (
        <div>
          {labelEl}
          <div className="space-y-2 mt-1">
            {(field.options ?? []).map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-not-allowed">
                <input type="checkbox" disabled
                  className="w-4 h-4 rounded border-ocean-600 bg-ocean-800 text-teal-500 opacity-60" />
                <span className="text-slate-300 text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "date":
      return (
        <div>
          {labelEl}
          <input type="date" disabled className="form-input cursor-not-allowed opacity-70" />
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
              type="file"
              disabled
              accept={acceptValue}
              className="form-input cursor-not-allowed opacity-70"
            />

            <p className="text-slate-600 text-xs mt-1.5">
              Allowed: {acceptedTypes.join(", ").toUpperCase()} • Max:{" "}
              {field.max_size_mb ?? 5}MB
            </p>
          </div>
        );
      }
    default: // text, email, phone
      return (
        <div>
          {labelEl}
          <input
            type={field.field_type === "email" ? "email" : field.field_type === "phone" ? "tel" : "text"}
            disabled
            className="form-input cursor-not-allowed opacity-70"
            placeholder={field.placeholder ?? ""}
          />
        </div>
      );
  }
}
