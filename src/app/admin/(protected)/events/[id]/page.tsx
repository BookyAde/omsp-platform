import { notFound } from "next/navigation";
import EventForm from "@/components/forms/EventForm";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Event } from "@/types";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabaseClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) {
    notFound();
  }

  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, slug")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="admin-page-title">
          Manage Event
        </h1>

        <p className="admin-page-subtitle">
          Edit event details, image, QR code, visibility and registration link.
        </p>
      </div>

      <EventForm
        event={event as Event}
        publishedForms={forms ?? []}
      />
    </div>
  );
}