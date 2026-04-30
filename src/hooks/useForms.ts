"use client";

import { useState, useEffect, useCallback } from "react";
import type { Form, FormWithFields } from "@/types";

/**
 * useForms — fetch and manage forms from the admin API.
 *
 * Usage:
 *   const { forms, loading, error, refetch } = useForms();
 */
export function useForms() {
  const [forms,   setForms]   = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/forms");
      if (!res.ok) throw new Error("Failed to load forms.");
      const data = await res.json();
      setForms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { forms, loading, error, refetch };
}

/**
 * useForm — fetch a single form with its fields.
 *
 * Usage:
 *   const { form, loading } = useForm(id);
 */
export function useForm(id: string | null) {
  const [form,    setForm]    = useState<FormWithFields | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/forms/${id}`)
      .then((r) => r.json())
      .then((d) => { setForm(d); setLoading(false); })
      .catch(() => { setError("Failed to load form."); setLoading(false); });
  }, [id]);

  return { form, loading, error };
}
