"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from 'lucide-react'
import { useState, useEffect } from "react"

interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [newDescription, setNewDescription] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("vocalis-todos")
    if (saved) {
      setTodos(JSON.parse(saved))
    } else {
      setTodos([
        {
          id: 1,
          title: "Title Line I",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
          completed: false,
        },
        {
          id: 2,
          title: "Title Line II",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
          completed: false,
        },
      ])
    }
  }, [])

  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem("vocalis-todos", JSON.stringify(todos))
    }
  }, [todos])

  const addTodo = () => {
    if (!newTodo.trim()) return
    
    const todo: Todo = {
      id: Date.now(),
      title: newTodo,
      description: newDescription || "No description provided",
      completed: false,
    }
    
    setTodos([...todos, todo])
    setNewTodo("")
    setNewDescription("")
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>To Do List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2 pb-4 border-b">
          <Input
            placeholder="New todo title..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTodo()}
            aria-label="New todo title"
          />
          <Input
            placeholder="Description (optional)..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTodo()}
            aria-label="New todo description"
          />
          <Button onClick={addTodo} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Todo
          </Button>
        </div>
        {todos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No todos yet. Add one above!
          </p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="flex space-x-4 items-start">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
                aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={`text-sm font-medium leading-none cursor-pointer ${
                    todo.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {todo.title}
                </label>
                <p className={`text-sm ${todo.completed ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
                  {todo.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete ${todo.title}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
