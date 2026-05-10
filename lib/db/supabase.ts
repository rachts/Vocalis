import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user preferences:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Supabase Error:", err);
    return null;
  }
}

export async function saveUserPreference(userId: string, key: string, value: string) {
  try {
    const { error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: userId, [key]: value }, { onConflict: "user_id" });

    if (error) {
      console.error("Error saving user preference:", error);
    }
  } catch (err) {
    console.error("Supabase Error:", err);
  }
}
