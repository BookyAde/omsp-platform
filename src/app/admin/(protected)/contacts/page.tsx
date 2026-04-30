import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";
import ContactActions from "./ContactActions";
import type { ContactMessage } from "@/types";

export const dynamic = "force-dynamic";

async function getContacts(): Promise<ContactMessage[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("submitted_at", { ascending: false });
  return (data as ContactMessage[]) ?? [];
}

const statusStyles: Record<string, string> = {
  unread:   "badge-unread",
  read:     "badge-draft",
  archived: "badge-closed",
};

export default async function ContactsPage() {
  const contacts = await getContacts();
  const unread = contacts.filter((c) => c.status === "unread").length;

  return (
    <div>
      <div className="admin-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Contact Messages</h1>
          <p className="admin-page-subtitle">
            {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "All messages read"}
          </p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-slate-500">No contact messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((msg) => (
            <div
              key={msg.id}
              className={`glass-card p-6 transition-colors ${
                msg.status === "unread" ? "border-teal-500/20" : "border-ocean-700/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={statusStyles[msg.status] ?? "badge-draft"}>
                      {msg.status}
                    </span>
                    <span className="font-medium text-white">{msg.name}</span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-teal-400 hover:text-teal-300 text-sm transition-colors"
                    >
                      {msg.email}
                    </a>
                    <span className="text-slate-500 text-xs ml-auto sm:ml-0">
                      {formatDateTime(msg.submitted_at)}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200 text-sm mb-2">{msg.subject}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{msg.message}</p>
                </div>
                <ContactActions id={msg.id} currentStatus={msg.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
