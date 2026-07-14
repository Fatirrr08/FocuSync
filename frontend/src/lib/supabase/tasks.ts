import { supabase } from "./client";

export interface TaskRow {
  id: string;
  session_id: string;
  title: string;
  planned_duration_minutes: number;
  actual_duration_minutes: number | null;
  is_done: boolean;
  points_awarded: number | null;
  created_at: string;
}

export async function fetchSessionTasks(sessionId: string): Promise<TaskRow[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching session tasks:", error);
      return [];
    }

    return (data || []) as TaskRow[];
  } catch (err) {
    console.error("Error in fetchSessionTasks:", err);
    return [];
  }
}

export async function createSessionTask(
  sessionId: string,
  title: string,
  plannedDuration: number
): Promise<TaskRow | null> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        session_id: sessionId,
        title,
        planned_duration_minutes: plannedDuration,
        is_done: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session task:", error);
      return null;
    }

    return data as TaskRow;
  } catch (err) {
    console.error("Error in createSessionTask:", err);
    return null;
  }
}

export async function completeSessionTask(
  taskId: string,
  actualDuration: number,
  points: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({
        is_done: true,
        actual_duration_minutes: actualDuration,
        points_awarded: points,
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error completing session task:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in completeSessionTask:", err);
    return false;
  }
}

export async function deleteSessionTask(taskId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting session task:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteSessionTask:", err);
    return false;
  }
}
