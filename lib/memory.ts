import type { Message } from '@/types/tools';

export async function getClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function getMemory(sessionId: string): Promise<Message[]> {
  const supabase = await getClient();
  if (supabase) {
    const { data } = await supabase.from('conversations')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    return data || [];
  }
  
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(`vocalis_mem_${sessionId}`);
    return local ? JSON.parse(local) : [];
  }
  return [];
}

export async function saveMemory(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
  const supabase = await getClient();
  if (supabase) {
    await supabase.from('conversations').insert({ session_id: sessionId, role, content });
  } else if (typeof window !== 'undefined') {
    const history = await getMemory(sessionId);
    history.push({ role, content });
    localStorage.setItem(`vocalis_mem_${sessionId}`, JSON.stringify(history.slice(-20)));
  }
}
