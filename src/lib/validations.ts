/**
 * lib/validations.ts — Zod schemas for all form inputs
 */

import { z } from "zod";

// ─── Contact form ─────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  subject: z.string().trim().min(2, "Subject must be at least 2 characters").max(200),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ─── Event create/edit ────────────────────────────────────────────────────────

export const eventSchema = z.object({
  title: z.string().min(3, "Title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  event_date: z.string().min(1, "Event date is required"),
  end_date: z.string().optional().nullable(),
  location_type: z.enum(["virtual", "physical", "hybrid"]),
  location_detail: z.string().max(500).optional().nullable(),
  registration_form_id: z.string().uuid().optional().nullable(),
  is_featured: z.boolean().default(false),
});

export type EventInput = z.infer<typeof eventSchema>;

// ─── Form fields ──────────────────────────────────────────────────────────────

const FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "phone",
  "select",
  "radio",
  "checkbox",
  "date",
  "file",
] as const;

const OPTION_TYPES = new Set(["select", "radio", "checkbox"]);

export const formFieldSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().min(1, "Field label is required").max(200),
    field_type: z.enum(FIELD_TYPES),
    placeholder: z.string().max(200).optional().nullable(),
    required: z.boolean().default(false),
    options: z.array(z.string().min(1).max(200)).max(50).optional().nullable(),
    field_order: z.number().int().min(0),
    is_active: z.boolean().default(true),

    accepted_types: z.array(z.string()).optional().nullable(),
    max_size_mb: z.number().positive().optional().nullable(),

    // Named step/group for multi-step forms
    step: z.string().trim().min(1).max(100).optional().default("General"),
  })
  .superRefine((field, ctx) => {
    if (OPTION_TYPES.has(field.field_type)) {
      if (!field.options || field.options.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Field "${field.label}" requires at least one option.`,
          path: ["options"],
        });
      }
    }
  });

export const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["draft", "published", "closed"]).default("draft"),
  deadline: z.string().optional().nullable(),
  fields: z.array(formFieldSchema).max(100).optional().default([]),
  visibility: z.enum(["public", "private"]).default("public"),
  requires_review: z.boolean().optional().default(false),

  // Public form display mode
  form_mode: z.enum(["single_page", "multi_step"]).optional().default("single_page"),
});

export type FormInput = z.infer<typeof formSchema>;
export type FormFieldInput = z.infer<typeof formFieldSchema>;

// ─── Sponsor create/edit ──────────────────────────────────────────────────────

export const sponsorSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  logo_url: z.string().url("Must be a valid URL").max(500).optional().nullable(),
  website_url: z.string().url("Must be a valid URL").max(500).optional().nullable(),
  tier: z.enum(["platinum", "gold", "silver", "bronze", "partner"]),
  is_active: z.boolean().default(true),
  description: z.string().max(1000).optional().nullable(),
});

export type SponsorInput = z.infer<typeof sponsorSchema>;