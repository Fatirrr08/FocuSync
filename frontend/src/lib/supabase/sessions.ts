import { supabase } from "./client";

export interface SessionData {
  id: string;
  session_token: string;
  status: string;
  user_id: string;
  created_at?: string;
  started_at?: string;
  ended_at?: string;
  strike_count?: number;
}

export async function createSession(userId: string): Promise<SessionData | null> {
  try {
    const sessionToken = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
      ? crypto.randomUUID() 
      : "token-" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    const newSession = {
      user_id: userId,
      session_token: sessionToken,
      status: "PAIRING",
    };

    const { data, error } = await supabase
      .from("sessions")
      .insert(newSession)
      .select()
      .single();

    if (error) {
      console.error("Error creating session in Supabase:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in createSession:", err);
    return null;
  }
}

export async function updateSessionStatus(sessionId: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session status:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in updateSessionStatus:", err);
    return false;
  }
}

export async function updateSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in updateSession:", err);
    return false;
  }
}

export async function startSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sessions")
      .update({
        status: "FOCUSING",
        started_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Error starting session:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in startSession:", err);
    return false;
  }
}
