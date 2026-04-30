"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/types";

interface EventFormProps {
  event?: Partial<Event>;
  /** Published forms for linking to registration */
  publishedForms: { id: string; title: string; slug: string }[];
}

export default function EventForm({ event, publishedForms }: EventFormProps) {
  const router  = useRouter();
  const isEdit  = !!event?.id;

  const [form, setForm] = useState({
    title:               event?.title ?? "",
    description:         event?.description ?? "",
    event_date:          event?.event_date ? event.event_date.slice(0, 16) : "",
    end_date:            event?.end_date ? event.end_date.slice(0, 16) : "",
    location_type:       event?.location_type ?? "virtual",
    location_detail:     event?.location_detail ?? "",
    registration_form_id: event?.registration_form_id ?? "",
    is_featured:         event?.is_featured ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      end_date:             form.end_date || null,
      location_detail:      form.location_detail || null,
      registration_form_id: form.registration_form_id || null,
      description:          form.description || null,
    };

    const res = await fetch(
      isEdit ? `/api/events/${event!.id}` : "/api/events",
      {
        method:  isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save event.");
      setLoading(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this event permanently?")) return;
    setLoading(true);
    await fetch(`/api/events/${event!.id}`, { method: "DELETE" });
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* Title */}
      <div>
        <label className="form-label" htmlFor="title">Event Title *</label>
        <input id="title" name="title" type="text" required className="form-input"
          placeholder="e.g. GIS for Marine Applications Workshop"
          value={form.title} onChange={handleChange} />
      </div>

      {/* Description */}
      <div>
        <label className="form-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} className="form-input resize-none"
          placeholder="What will attendees experience?"
          value={form.description} onChange={handleChange} />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="form-label" htmlFor="event_date">Start Date & Time *</label>
          <input id="event_date" name="event_date" type="datetime-local" required className="form-input"
            value={form.event_date} onChange={handleChange} />
        </div>
        <div>
          <label className="form-label" htmlFor="end_date">End Date & Time</label>
          <input id="end_date" name="end_date" type="datetime-local" className="form-input"
            value={form.end_date} onChange={handleChange} />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="form-label" htmlFor="location_type">Location Type *</label>
          <select id="location_type" name="location_type" className="form-input"
            value={form.location_type} onChange={handleChange}>
            <option value="virtual">Virtual</option>
            <option value="physical">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="location_detail">
            {form.location_type === "virtual" ? "Meeting URL" : "Address / Venue"}
          </label>
          <input id="location_detail" name="location_detail" type="text" className="form-input"
            placeholder={form.location_type === "virtual" ? "https://..." : "Venue address"}
            value={form.location_detail} onChange={handleChange} />
        </div>
      </div>

      {/* Registration form link */}
      <div>
        <label className="form-label" htmlFor="registration_form_id">Link Registration Form</label>
        <select id="registration_form_id" name="registration_form_id" className="form-input"
          value={form.registration_form_id} onChange={handleChange}>
          <option value="">— No registration form —</option>
          {publishedForms.map((f) => (
            <option key={f.id} value={f.id}>{f.title}</option>
          ))}
        </select>
        <p className="text-slate-600 text-xs mt-1.5">
          Only published forms appear here. Create and publish a form first.
        </p>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3">
        <input
          id="is_featured"
          name="is_featured"
          type="checkbox"
          className="w-4 h-4 rounded border-ocean-600 bg-ocean-800 text-teal-500
                     focus:ring-teal-500/30 focus:ring-offset-0"
          checked={form.is_featured}
          onChange={handleChange}
        />
        <label htmlFor="is_featured" className="text-slate-300 text-sm cursor-pointer">
          Feature this event on the homepage
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary px-7 py-3">
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost px-5 py-3"
        >
          Cancel
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto px-5 py-3 rounded-lg text-red-400 hover:text-white hover:bg-red-500/15
                       border border-transparent hover:border-red-500/30 text-sm font-medium transition-all"
          >
            Delete Event
          </button>
        )}
      </div>
    </form>
  );
}
