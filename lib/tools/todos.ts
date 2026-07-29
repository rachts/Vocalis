import type { ToolResult } from '@/types/tools';

// Use Supabase if available, else fall back to in-memory
let inMemoryTodos: Array<{ id: string; text: string; completed: boolean }> = [];

async function getClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function addTodoTool(args: { text: string }): Promise<ToolResult> {
  const supabase = await getClient();
  if (supabase) {
    await supabase.from('todos').insert({ text: args.text });
  } else {
    inMemoryTodos.push({ id: Date.now().toString(), text: args.text, completed: false });
  }
  return { success: true, data: null, spokenSummary: `Added "${args.text}" to your todos.` };
}

export async function listTodosTool(): Promise<ToolResult> {
  const supabase = await getClient();
  let todos = inMemoryTodos;
  if (supabase) {
    const { data } = await supabase.from('todos').select('*').eq('completed', false).order('created_at');
    todos = data || [];
  }
  if (todos.length === 0) return { success: true, data: [], spokenSummary: "You have no pending todos." };
  const list = todos.map((t, i) => `${i + 1}. ${t.text}`).join(', ');
  return { success: true, data: todos, spokenSummary: `You have ${todos.length} todos: ${list}.` };
}

export async function completeTodoTool(args: { text: string }): Promise<ToolResult> {
  const supabase = await getClient();
  if (supabase) {
    await supabase.from('todos').update({ completed: true }).ilike('text', `%${args.text}%`);
  } else {
    const todo = inMemoryTodos.find(t => t.text.toLowerCase().includes(args.text.toLowerCase()));
    if (todo) todo.completed = true;
  }
  return { success: true, data: null, spokenSummary: `Marked "${args.text}" as complete.` };
}

export async function clearTodosTool(): Promise<ToolResult> {
  const supabase = await getClient();
  if (supabase) {
    await supabase.from('todos').delete().eq('completed', false);
  } else {
    inMemoryTodos = [];
  }
  return { success: true, data: null, spokenSummary: "All todos cleared." };
}
