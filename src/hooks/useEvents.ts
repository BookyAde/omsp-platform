"use client";

import { useState, useEffect, useCallback } from "react";
import type { Event } from "@/types";

/**
 * useEvents — fetch events from the public API.
 *
 * Usage:
 *   const { events, upcoming, past, loading } = useEvents();
 */
export function useEvents() {
  const [events,  setEvents]  = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to load events.");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const now      = new Date();
  const upcoming = events.filter((e) => new Date(e.event_date) >= now);
  const past     = events.filter((e) => new Date(e.event_date) <  now);

  return { events, upcoming, past, loading, error, refetch };
}
