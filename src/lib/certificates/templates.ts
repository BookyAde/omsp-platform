import type { CertificateTemplateMeta } from "@/types/certificates";

export const CERTIFICATE_TEMPLATES: CertificateTemplateMeta[] = [
  {
    id: "classic-maritime",
    name: "Classic Maritime",
    description: "A formal navy and gold certificate with a traditional professional look.",
    bestFor: "Membership, recognition, honorary awards",
    orientation: "portrait",
  },
  {
    id: "pure-clean",
    name: "Pure & Clean",
    description: "A minimal certificate with clean spacing and modern typography.",
    bestFor: "Courses, workshops, quick completion certificates",
    orientation: "portrait",
  },
  {
    id: "ocean-depth",
    name: "Ocean Depth",
    description: "A calm marine-themed certificate with subtle ocean styling.",
    bestFor: "Marine events, fieldwork, ocean literacy programs",
    orientation: "portrait",
  },
  {
    id: "executive-distinction",
    name: "Executive Distinction",
    description: "A premium certificate layout for senior and prestigious recognition.",
    bestFor: "Executive awards, board appointments, partnerships",
    orientation: "portrait",
  },
  {
    id: "omsp-membership",
    name: "OMSP Membership",
    description: "A membership-focused certificate design with verification emphasis.",
    bestFor: "New members, renewals, membership confirmation",
    orientation: "portrait",
  },
];

export function getCertificateTemplate(id?: string) {
  return (
    CERTIFICATE_TEMPLATES.find((template) => template.id === id) ||
    CERTIFICATE_TEMPLATES[0]
  );
}