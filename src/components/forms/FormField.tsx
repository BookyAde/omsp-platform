"use client";

import { useState } from "react";
import { FIELD_TYPE_LABELS } from "@/lib/constants";
import type { FormFieldDraft, FieldType } from "@/types";

interface FormFieldProps {
  field: FormFieldDraft;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updates: Partial<FormFieldDraft>) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
}

export default function FormField({
  field,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
}: FormFieldProps) {
  const [expanded, setExpanded] = useState(true);
  const hasOptions = ["select", "radio", "checkbox"].includes(field.field_type);

  function handleOptionChange(index: number, value: string) {
    const options = [...(field.options ?? [])];
    options[index] = value;
    onUpdate({ options });
  }

  function addOption() {
    onUpdate({
      options: [
        ...(field.options ?? []),
        `Option ${(field.options?.length ?? 0) + 1}`,
      ],
    });
  }

  function removeOption(index: number) {
    const options = (field.options ?? []).filter((_, i) => i !== index);
    onUpdate({ options });
  }

  return (
    <div className="glass-card border-ocean-700/50 hover:border-ocean-600/70 transition-colors overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none"
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="text-slate-600 flex-shrink-0 cursor-grab">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </span>

        <span className="font-mono text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded flex-shrink-0">
          {FIELD_TYPE_LABELS[field.field_type] ?? field.field_type}
        </span>

        <span className="text-white text-sm font-medium flex-1 truncate">
          {field.label || "Untitled field"}
        </span>

        <span className="hidden sm:inline-flex text-slate-500 text-xs font-mono flex-shrink-0">
          {field.step || "General"}
        </span>

        {field.required && (
          <span className="text-red-400 text-xs font-mono flex-shrink-0">
            required
          </span>
        )}

        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onMove("up")}
            disabled={isFirst}
            className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
            title="Move up"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onMove("down")}
            disabled={isLast}
            className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
            title="Move down"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
          title="Remove field"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <span className="text-slate-600 flex-shrink-0">
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </div>

      {expanded && (
        <div className="border-t border-ocean-700/40 px-5 py-5 space-y-4 bg-ocean-900/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Field Label *</label>
              <input
                type="text"
                className="form-input text-sm py-2"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="e.g. Full Name"
              />
            </div>

            <div>
              <label className="form-label text-xs">Field Type</label>
              <select
                className="form-input text-sm py-2"
                value={field.field_type}
                onChange={(e) => {
                  const nextType = e.target.value as FieldType;

                  onUpdate({
                    field_type: nextType,
                    options: ["select", "radio", "checkbox"].includes(nextType)
                      ? field.options ?? ["Option 1", "Option 2"]
                      : null,
                    accepted_types: nextType === "file" ? field.accepted_types ?? [] : null,
                    max_size_mb: nextType === "file" ? field.max_size_mb ?? 5 : null,
                  });
                }}
              >
                {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Step / Section Name</label>
            <input
              type="text"
              className="form-input text-sm py-2"
              value={field.step ?? "General"}
              onChange={(e) =>
                onUpdate({ step: e.target.value.trim() || "General" })
              }
              placeholder="e.g. Personal Information, Education, Documents"
            />
            <p className="text-slate-600 text-xs mt-1.5">
              Fields with the same section name appear together when the form is set to Multi Step.
            </p>
          </div>

          {!["select", "radio", "checkbox", "date"].includes(field.field_type) && (
            <div>
              <label className="form-label text-xs">Placeholder Text</label>
              <input
                type="text"
                className="form-input text-sm py-2"
                value={field.placeholder ?? ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value || null })}
                placeholder="Hint text shown inside the field"
              />
            </div>
          )}

          {hasOptions && (
            <div>
              <label className="form-label text-xs">Options</label>
              <div className="space-y-2">
                {(field.options ?? []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="form-input text-sm py-2 flex-1"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={(field.options?.length ?? 0) <= 1}
                      className="p-2 text-slate-600 hover:text-red-400 disabled:opacity-20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOption}
                  className="text-teal-400 hover:text-teal-300 text-xs font-medium transition-colors mt-1"
                >
                  + Add option
                </button>
              </div>
            </div>
          )}

          {field.field_type === "file" && (
            <div className="space-y-4">
              <div>
                <label className="form-label text-xs">Allowed File Types</label>

                <div className="flex flex-wrap gap-2 mt-2">
                  {["pdf", "doc", "docx", "jpg", "jpeg", "png"].map((type) => {
                    const selected = (field.accepted_types ?? []).includes(type);

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          const current = field.accepted_types ?? [];
                          const updated = selected
                            ? current.filter((item) => item !== type)
                            : [...current, type];

                          onUpdate({ accepted_types: updated });
                        }}
                        className={`px-3 py-1 text-xs rounded border transition ${
                          selected
                            ? "bg-teal-500/20 text-teal-400 border-teal-500/40"
                            : "bg-ocean-800 text-slate-400 border-ocean-600"
                        }`}
                      >
                        {type.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Max File Size (MB)</label>

                <input
                  type="number"
                  min={1}
                  value={field.max_size_mb ?? 5}
                  onChange={(e) =>
                    onUpdate({ max_size_mb: Number(e.target.value) || 5 })
                  }
                  className="form-input text-sm py-2 w-32"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="w-4 h-4 rounded border-ocean-600 bg-ocean-800 text-teal-500 focus:ring-teal-500/30 focus:ring-offset-0"
            />

            <label
              htmlFor={`required-${field.id}`}
              className="text-slate-300 text-sm cursor-pointer"
            >
              Required field
            </label>
          </div>
        </div>
      )}
    </div>
  );
}