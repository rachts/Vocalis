"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "Review pull requests", completed: false },
    { id: "2", text: "Update documentation", completed: true },
    { id: "3", text: "Prepare for sync", completed: false },
  ]);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="w-full max-w-sm">
      <h3 className="text-[11px] font-body uppercase tracking-[1.5px] text-[var(--color-stone)] mb-4 pl-2">
        Up Next
      </h3>
      <div className="space-y-2">
        {todos.map(todo => (
          <div 
            key={todo.id} 
            className="flex items-center p-3 rounded-[12px] hover:bg-[var(--color-paper)] transition-colors cursor-pointer group"
            onClick={() => toggleTodo(todo.id)}
          >
            {todo.completed ? (
              <CheckCircle2 size={18} className="text-[var(--color-success)] mr-3 flex-shrink-0" />
            ) : (
              <Circle size={18} className="text-[var(--color-sand)] group-hover:text-[var(--color-stone)] mr-3 flex-shrink-0 transition-colors" />
            )}
            <span className={\`text-sm font-body \${todo.completed ? 'text-[var(--color-stone)] line-through' : 'text-[var(--color-ink)]'}\`}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
