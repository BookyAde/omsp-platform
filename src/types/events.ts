export type AttendanceType =
  | "physical"
  | "virtual"
  | "hybrid";

export type EventStatus =
  | "draft"
  | "published"
  | "completed"
  | "cancelled";

export type EventVisibility =
  | "public"
  | "private";

export type Event = {
  id: string;

  title: string;

  description: string | null;

  slug: string | null;

  event_date: string;

  start_time: string | null;

  end_time: string | null;

  location: string | null;

  attendance_type: AttendanceType;

  status: EventStatus;

  visibility: EventVisibility;

  cover_image_url: string | null;

  generate_qr: boolean;

  is_featured: boolean;

  capacity: number | null;

  registration_form_id: string | null;

  created_at: string;

  updated_at: string;
  

  registration_form?: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
};

export type EventDraft = Omit<
  Event,
  "id" | "created_at" | "updated_at"
>;