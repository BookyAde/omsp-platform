import { createServerSupabaseClient } from "@/lib/supabase";
import EventForm from "@/components/forms/EventForm";

async function getPublishedForms() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("forms")
    .select("id, title, slug")
    .eq("status", "published")
    .order("title");
  return data ?? [];
}

export default async function NewEventPage() {
  const publishedForms = await getPublishedForms();
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Create Event</h1>
        <p className="admin-page-subtitle">Add a new OMSP event to the public calendar.</p>
      </div>
      <EventForm publishedForms={publishedForms as any} />
    </div>
  );
}
