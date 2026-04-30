export type EventLocationType = "virtual" | "physical" | "hybrid";

export type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location_type: EventLocationType;
  location_detail: string | null;
  registration_form_id: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;

  registration_form?: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
};

export type EventDraft = Omit<Event, "id" | "created_at" | "updated_at">;