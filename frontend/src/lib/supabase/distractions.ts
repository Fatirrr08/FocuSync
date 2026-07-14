import { supabase } from "./client";
import type { DistractionNote } from "@/types";

export async function syncDistractionNotes(sessionId: string): Promise<boolean> {
  try {
    const key = `distraction_inbox_${sessionId}`;
    const localSaved = localStorage.getItem(key);
    if (!localSaved) {
      return true;
    }

    const notes: DistractionNote[] = JSON.parse(localSaved);
    if (notes.length === 0) {
      localStorage.removeItem(key);
      return true;
    }

    const payload = notes.map((note) => ({
      session_id: sessionId,
      content: note.content,
      created_at: note.created_at || new Date().toISOString(),
      unlocked_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("distraction_notes")
      .insert(payload);

    if (error) {
      console.error("Error syncing distraction notes:", error);
      return false;
    }

    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error("Error in syncDistractionNotes:", err);
    return false;
  }
}

export async function fetchDistractionNotes(sessionId: string): Promise<{ id: string; session_id: string; content: string; created_at: string; unlocked_at: string | null }[]> {
  try {
    const { data, error } = await supabase
      .from("distraction_notes")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching distraction notes:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in fetchDistractionNotes:", err);
    return [];
  }
}
