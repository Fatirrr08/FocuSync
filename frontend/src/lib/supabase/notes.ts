import { supabase } from "./client";

export async function saveSessionNotes(sessionId: string, content: string): Promise<boolean> {
  try {
    // Check if a note already exists for this session
    const { data, error } = await supabase
      .from("notes")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("Error checking existing notes:", error);
      return false;
    }

    if (data?.id) {
      // Update existing notes content
      const { error: updateError } = await supabase
        .from("notes")
        .update({
          content_markdown: content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (updateError) {
        console.error("Error updating session notes:", updateError);
        return false;
      }
    } else {
      // Insert new notes record
      const { error: insertError } = await supabase
        .from("notes")
        .insert({
          session_id: sessionId,
          content_markdown: content,
        });

      if (insertError) {
        console.error("Error inserting session notes:", insertError);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Error in saveSessionNotes:", err);
    return false;
  }
}

export async function fetchSessionNotes(sessionId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("content_markdown")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching session notes:", error);
      return "";
    }

    return data?.content_markdown || "";
  } catch (err) {
    console.error("Error in fetchSessionNotes:", err);
    return "";
  }
}
