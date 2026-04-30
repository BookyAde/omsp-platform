"use client";

import { useState } from "react";
import type { ContactInput } from "@/lib/validations";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [form, setForm]     = useState<ContactInput>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send message.");
      }
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="pt-24">
      <section className="py-20 bg-ocean-900">
        <div className="section-container">
          <span className="section-eyebrow">Get in Touch</span>
          <h1 className="font-display text-5xl font-bold text-white max-w-2xl leading-tight">
            Contact OMSP
          </h1>
        </div>
      </section>

      <section className="py-20 bg-ocean-950">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact info */}
            <div>
              <h2 className="font-display text-xl font-bold text-white mb-6">Contact Details</h2>
              <div className="space-y-5">
                {[
                  { label: "General Support", email: "support@omspglobal.org" },
                  { label: "Team",            email: "team@omspglobal.org" },
                  { label: "Partnerships",    email: "admin@omspglobal.org" },
                ].map(({ label, email }) => (
                  <div key={email} className="glass-card p-5">
                    <p className="text-slate-500 text-xs font-mono mb-1">{label}</p>
                    <a href={`mailto:${email}`} className="text-teal-400 hover:text-teal-300 text-sm transition-colors">
                      {email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {status === "success" ? (
                <div className="glass-card p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">Message Sent</h3>
                  <p className="text-slate-400 text-sm">Thank you for reaching out. We will be in touch soon.</p>
                  <button onClick={() => setStatus("idle")} className="btn-ghost mt-6 text-sm px-6 py-2.5">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label" htmlFor="name">Full Name</label>
                      <input id="name" name="name" type="text" required className="form-input"
                        placeholder="Your name" value={form.name} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="email">Email Address</label>
                      <input id="email" name="email" type="email" required className="form-input"
                        placeholder="your@email.com" value={form.email} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <input id="subject" name="subject" type="text" required className="form-input"
                      placeholder="What is this about?" value={form.subject} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="message">Message</label>
                    <textarea id="message" name="message" required rows={6} className="form-input resize-none"
                      placeholder="Tell us more..." value={form.message} onChange={handleChange} />
                  </div>
                  {status === "error" && (
                    <p className="text-red-400 text-sm">{errorMsg}</p>
                  )}
                  <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center py-3.5">
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
