import { supabase } from "./client";
import type { AllowlistItem } from "@/types";

export async function seedDefaultAllowlist(userId: string) {
  const defaults = [
    { user_id: userId, type: "website", name: "github.com", allowed: true, is_default: true },
    { user_id: userId, type: "website", name: "docs.google.com", allowed: true, is_default: true },
    { user_id: userId, type: "website", name: "scholar.google.com", allowed: true, is_default: true },
    { user_id: userId, type: "website", name: "developer.mozilla.org", allowed: true, is_default: true },
    { user_id: userId, type: "website", name: "notion.so", allowed: true, is_default: true },
    { user_id: userId, type: "website", name: "youtube.com", allowed: false, is_default: true },
    { user_id: userId, type: "website", name: "instagram.com", allowed: false, is_default: true },
    { user_id: userId, type: "website", name: "tiktok.com", allowed: false, is_default: true },
    { user_id: userId, type: "website", name: "twitter.com / x.com", allowed: false, is_default: true },
    { user_id: userId, type: "app", name: "Visual Studio Code", allowed: true, is_default: true },
    { user_id: userId, type: "app", name: "Notion Desktop", allowed: true, is_default: true },
    { user_id: userId, type: "app", name: "Zotero / Mendeley", allowed: true, is_default: true },
    { user_id: userId, type: "app", name: "Game launcher (Steam)", allowed: false, is_default: true },
    { user_id: userId, type: "app", name: "App chat non-esensial", allowed: false, is_default: true },
  ];

  const { error } = await supabase.from("focus_allowlist").insert(defaults);
  if (error) {
    console.error("Error seeding default allowlist:", error);
  }
}

export async function checkAndSeedUserAllowlist(userId: string) {
  try {
    const { error, count } = await supabase
      .from("focus_allowlist")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error checking user allowlist:", error);
      return;
    }

    if (count === 0) {
      await seedDefaultAllowlist(userId);
    }
  } catch (err) {
    console.error("Error in checkAndSeedUserAllowlist:", err);
  }
}

export async function fetchAllowlist(userId: string): Promise<AllowlistItem[]> {
  try {
    const { data, error } = await supabase
      .from("focus_allowlist")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching allowlist:", error);
      return [];
    }

    return (data || []).map((item: { id: string | number; type: string; name: string; allowed: boolean; is_default: boolean }) => ({
      id: item.id,
      type: item.type as "website" | "app",
      name: item.name,
      allowed: item.allowed,
      isDefault: item.is_default,
    }));
  } catch (err) {
    console.error("Error in fetchAllowlist:", err);
    return [];
  }
}

export async function addAllowlistItem(
  userId: string,
  name: string,
  type: "website" | "app",
  allowed: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("focus_allowlist")
      .insert({
        user_id: userId,
        name,
        type,
        allowed,
        is_default: false,
      });

    if (error) {
      console.error("Error adding allowlist item:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in addAllowlistItem:", err);
    return false;
  }
}

export async function deleteAllowlistItem(id: string | number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("focus_allowlist")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting allowlist item:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in deleteAllowlistItem:", err);
    return false;
  }
}

export async function toggleAllowlistItem(id: string | number, allowed: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("focus_allowlist")
      .update({ allowed })
      .eq("id", id);

    if (error) {
      console.error("Error toggling allowlist item:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in toggleAllowlistItem:", err);
    return false;
  }
}

export async function resetAllowlistToDefault(userId: string): Promise<boolean> {
  try {
    // Delete custom user allowlist
    const { error: deleteError } = await supabase
      .from("focus_allowlist")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error clearing allowlist for reset:", deleteError);
      return false;
    }

    // Seed default items
    await seedDefaultAllowlist(userId);
    return true;
  } catch (err) {
    console.error("Error in resetAllowlistToDefault:", err);
    return false;
  }
}

export async function logAllowlistViolation(
  sessionId: string,
  name: string,
  type: "website" | "app",
  isSelfReported: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("allowlist_violations")
      .insert({
        session_id: sessionId,
        detected_name: name,
        type,
        is_self_reported: isSelfReported,
      });

    if (error) {
      console.error("Error logging allowlist violation:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in logAllowlistViolation:", err);
    return false;
  }
}
