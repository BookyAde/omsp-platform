import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import type { ContactMessage } from "@/types";

interface RecentContactsProps {
  contacts: ContactMessage[];
}

export default function RecentContacts({ contacts }: RecentContactsProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-white">Recent Messages</h3>
        <Link href="/admin/contacts" className="text-teal-400 hover:text-teal-300 text-xs transition-colors">
          View all
        </Link>
      </div>

      {contacts.length === 0 ? (
        <p className="text-slate-500 text-sm py-6 text-center">No messages yet.</p>
      ) : (
        <div className="divide-y divide-ocean-700/40">
          {contacts.map((msg) => (
            <div key={msg.id} className="py-3.5 flex items-start gap-3">
              {/* Unread dot */}
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                msg.status === "unread" ? "bg-teal-400" : "bg-transparent"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white text-sm font-medium truncate">{msg.name}</p>
                  <span className="text-slate-500 text-xs flex-shrink-0">
                    {formatDateTime(msg.submitted_at)}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{msg.subject}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
