import { supabase } from "./client";

export async function fetchHeatmapLogs(userId: string): Promise<{ id: string; user_id: string; log_date: string; sessions_success: number; sessions_failed: number; total_points: number }[]> {
  try {
    const { data, error } = await supabase
      .from("heatmap_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: true });

    if (error) {
      console.error("Error fetching heatmap logs:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in fetchHeatmapLogs:", err);
    return [];
  }
}

export async function updateHeatmapLog(
  userId: string,
  successDelta: number,
  failedDelta: number,
  pointsDelta: number
): Promise<boolean> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("heatmap_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", todayStr)
      .maybeSingle();

    if (error) {
      console.error("Error checking today's heatmap log:", error);
      return false;
    }

    if (data) {
      const { error: updateError } = await supabase
        .from("heatmap_logs")
        .update({
          sessions_success: Math.max(0, data.sessions_success + successDelta),
          sessions_failed: Math.max(0, data.sessions_failed + failedDelta),
          total_points: Math.max(0, data.total_points + pointsDelta),
        })
        .eq("id", data.id);

      if (updateError) {
        console.error("Error updating today's heatmap log:", updateError);
        return false;
      }
    } else {
      const { error: insertError } = await supabase
        .from("heatmap_logs")
        .insert({
          user_id: userId,
          log_date: todayStr,
          sessions_success: Math.max(0, successDelta),
          sessions_failed: Math.max(0, failedDelta),
          total_points: Math.max(0, pointsDelta),
        });

      if (insertError) {
        console.error("Error inserting today's heatmap log:", insertError);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("Error in updateHeatmapLog:", err);
    return false;
  }
}
