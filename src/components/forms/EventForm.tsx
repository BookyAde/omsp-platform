"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import QRCode from "qrcode";
import type { Event } from "@/types";

interface EventFormProps {
  event?: Partial<Event>;
  publishedForms: {
    id: string;
    title: string;
    slug: string;
  }[];
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function EventForm({
  event,
  publishedForms,
}: EventFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const isEdit = !!event?.id;

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [qrCode, setQrCode] = useState("");

  const [form, setForm] = useState({
    title: event?.title ?? "",

    description: event?.description ?? "",

    slug: event?.slug ?? "",

    event_date: event?.event_date ?? "",

    start_time: event?.start_time ?? "",

    end_time: event?.end_time ?? "",

    location: event?.location ?? "",

    attendance_type:
      event?.attendance_type ?? "physical",

    status:
      event?.status ?? "draft",

    visibility:
      event?.visibility ?? "public",

    cover_image_url:
      event?.cover_image_url ?? "",

    generate_qr:
      event?.generate_qr ?? false,

    is_featured:
      event?.is_featured ?? false,

    capacity:
      event?.capacity ?? "",

    registration_form_id:
      event?.registration_form_id ?? "",
  });

  useEffect(() => {
    if (!form.slug && form.title) {
      setForm((prev) => ({
        ...prev,
        slug: generateSlug(form.title),
      }));
    }
  }, [form.title]);

  const publicEventUrl = useMemo(() => {
    if (!form.slug) return "";

    return `${window.location.origin}/events/${form.slug}`;
  }, [form.slug]);

  useEffect(() => {
    async function generateQrCode() {
      if (!form.generate_qr || !publicEventUrl) {
        setQrCode("");
        return;
      }

      try {
        const qr = await QRCode.toDataURL(
          publicEventUrl
        );

        setQrCode(qr);
      } catch (err) {
        console.error(err);
      }
    }

    generateQrCode();
  }, [form.generate_qr, publicEventUrl]);

  function handleChange(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);

      const fileExt =
        file.name.split(".").pop();

      const fileName = `${Date.now()}.${fileExt}`;

      const filePath = `events/${fileName}`;

      const { error } = await supabase.storage
        .from("event-images")
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from("event-images")
        .getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        cover_image_url: data.publicUrl,
      }));
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Failed to upload image."
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...form,

        capacity:
          form.capacity === ""
            ? null
            : Number(form.capacity),

        registration_form_id:
          form.registration_form_id || null,
      };

      const res = await fetch(
        isEdit
          ? `/api/events/${event!.id}`
          : "/api/events",
        {
          method: isEdit ? "PATCH" : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();

        throw new Error(
          data.error ||
            "Failed to save event."
        );
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Delete this event permanently?"
      )
    ) {
      return;
    }

    setLoading(true);

    await fetch(`/api/events/${event!.id}`, {
      method: "DELETE",
    });

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-3xl"
    >
      <div>
        <label className="form-label">
          Event Title
        </label>

        <input
          name="title"
          type="text"
          required
          className="form-input"
          value={form.title}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="form-label">
          Event Slug
        </label>

        <input
          name="slug"
          type="text"
          className="form-input"
          value={form.slug}
          onChange={handleChange}
        />

        <p className="text-xs text-slate-500 mt-2">
          Public URL:{" "}
          {publicEventUrl || "No slug yet"}
        </p>
      </div>

      <div>
        <label className="form-label">
          Description
        </label>

        <textarea
          name="description"
          rows={5}
          className="form-input resize-none"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="form-label">
          Event Cover Image
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="form-input"
        />

        {uploadingImage && (
          <p className="text-sm text-slate-400 mt-2">
            Uploading image...
          </p>
        )}

        {form.cover_image_url && (
          <img
            src={form.cover_image_url}
            alt="Event Cover"
            className="mt-4 rounded-xl w-full h-64 object-cover border border-ocean-700"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="form-label">
            Event Date
          </label>

          <input
            type="date"
            name="event_date"
            className="form-input"
            value={form.event_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="form-label">
            Start Time
          </label>

          <input
            type="time"
            name="start_time"
            className="form-input"
            value={form.start_time}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="form-label">
            End Time
          </label>

          <input
            type="time"
            name="end_time"
            className="form-input"
            value={form.end_time}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="form-label">
          Location / Venue
        </label>

        <input
          type="text"
          name="location"
          className="form-input"
          value={form.location}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="form-label">
            Attendance Type
          </label>

          <select
            name="attendance_type"
            className="form-input"
            value={form.attendance_type}
            onChange={handleChange}
          >
            <option value="physical">
              Physical
            </option>

            <option value="virtual">
              Virtual
            </option>

            <option value="hybrid">
              Hybrid
            </option>
          </select>
        </div>

        <div>
          <label className="form-label">
            Status
          </label>

          <select
            name="status"
            className="form-input"
            value={form.status}
            onChange={handleChange}
          >
            <option value="draft">
              Draft
            </option>

            <option value="published">
              Published
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        <div>
          <label className="form-label">
            Visibility
          </label>

          <select
            name="visibility"
            className="form-input"
            value={form.visibility}
            onChange={handleChange}
          >
            <option value="public">
              Public
            </option>

            <option value="private">
              Private
            </option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">
          Event Capacity
        </label>

        <input
          type="number"
          name="capacity"
          className="form-input"
          value={form.capacity}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="form-label">
          Registration Form
        </label>

        <select
          name="registration_form_id"
          className="form-input"
          value={form.registration_form_id}
          onChange={handleChange}
        >
          <option value="">
            No linked form
          </option>

          {publishedForms.map((form) => (
            <option
              key={form.id}
              value={form.id}
            >
              {form.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="generate_qr"
            checked={form.generate_qr}
            onChange={handleChange}
          />

          <label className="text-sm text-slate-300">
            Generate QR Code
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={handleChange}
          />

          <label className="text-sm text-slate-300">
            Feature this event on the landing page
          </label>
        </div>
      </div>

      {qrCode && (
        <div className="rounded-2xl border border-ocean-700 p-5 bg-ocean-900/40">
          <img
            src={qrCode}
            alt="QR Code"
            className="w-52 h-52"
          />

          <a
            href={qrCode}
            download={`${form.slug}-qr.png`}
            className="btn-primary inline-block mt-4 px-5 py-2"
          >
            Download QR
          </a>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400 text-sm">
            {error}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-7 py-3"
        >
          {loading
            ? "Saving..."
            : isEdit
            ? "Save Changes"
            : "Create Event"}
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
            className="ml-auto text-red-400 hover:text-red-300"
          >
            Delete Event
          </button>
        )}
      </div>
    </form>
  );
}