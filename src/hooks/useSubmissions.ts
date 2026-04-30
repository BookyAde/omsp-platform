"use client";

import { useState, useEffect, useCallback } from "react";

interface SubmissionSummary {
  id:           string;
  submitted_at: string;
  form_id:      string;
  form:         { title: string; slug: string } | null;
}

/**
 * useSubmissions — fetch submission list, optionally filtered by form.
 *
 * Usage:
 *   const { submissions, loading, refetch } = useSubmissions(formId);
 */
export function useSubmissions(formId?: string) {
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = formId
        ? `/api/submissions?form_id=${formId}`
        : "/api/submissions";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load submissions.");
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { submissions, loading, error, refetch };
}
