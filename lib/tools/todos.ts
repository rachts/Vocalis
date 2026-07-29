import { ToolResult } from "../../types/tools";
import { supabase } from "../memory"; // We'll create this in phase 5

export async function todosTool(args: Record<string, unknown>): Promise<ToolResult> {
  const task = args.task as string;
  
  try {
    if (supabase) {
      await supabase.from("todos").insert({ text: task });
    } else {
      // Fallback to local storage if supabase isn't wired yet
      const saved = localStorage.getItem("vocalis-todos");
      const todos = saved ? JSON.parse(saved) : [];
      todos.push({ id: Date.now(), title: task, completed: false });
      localStorage.setItem("vocalis-todos", JSON.stringify(todos));
      window.dispatchEvent(new Event("storage"));
    }
    
    return {
      success: true,
      data: { task },
      spokenSummary: \`I've added \${task} to your to-do list.\`
    };
  } catch (e) {
    console.error("Todos tool error", e);
    return {
      success: false,
      data: null,
      spokenSummary: \`I couldn't add that to your to-do list right now.\`
    };
  }
}
