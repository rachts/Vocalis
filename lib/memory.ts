import { createClient } from "@supabase/supabase-js";
import { Message } from "../types/agents";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function getHistory(sessionId: string, limit = 20): Promise<Message[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from("conversations")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Failed to get history", error);
    return [];
  }

  return data.reverse() as Message[];
}

export async function appendMessage(sessionId: string, message: Message): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from("conversations")
    .insert({
      session_id: sessionId,
      role: message.role,
      content: message.content,
    });

  if (error) {
    console.error("Failed to append message", error);
  }
}

export async function summarizeAndCompress(sessionId: string): Promise<void> {
  // To be implemented: Fetch older messages, summarize, and compress in DB.
}
