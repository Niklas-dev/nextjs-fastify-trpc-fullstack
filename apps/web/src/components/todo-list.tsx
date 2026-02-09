"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSession, signOut } from "@/lib/auth-client";

export default function TodoList() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const session = useSession();
  const utils = trpc.useUtils();

  const { data: todos, isLoading } = trpc.todo.getAll.useQuery(undefined, {
    enabled: !!session.data,
  });

  const createTodo = trpc.todo.create.useMutation({
    onSuccess: () => {
      utils.todo.getAll.invalidate();
      setTitle("");
      setDescription("");
    },
  });

  const toggleTodo = trpc.todo.toggle.useMutation({
    onSuccess: () => {
      utils.todo.getAll.invalidate();
    },
  });

  const deleteTodo = trpc.todo.delete.useMutation({
    onSuccess: () => {
      utils.todo.getAll.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createTodo.mutate({ title, description: description || undefined });
    }
  };

  if (!session.data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to manage your todos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">My Todos</h2>
        <button
          onClick={() => signOut()}
          className="px-5 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Todo title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
          />
        </div>
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={createTodo.isPending}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {createTodo.isPending ? "Adding..." : "Add Todo"}
        </button>
      </form>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-700 mt-4 font-medium">Loading todos...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todos && todos.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600 mt-4 font-medium">No todos yet. Create one above!</p>
            </div>
          )}
          {todos?.map((todo: any) => (
            <div
              key={todo.id}
              className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all ${
                todo.completed
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-200 hover:border-blue-400"
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo.mutate({ id: todo.id })}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-lg ${
                    todo.completed ? "line-through text-gray-500" : "text-gray-900"
                  }`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={`text-sm mt-1 ${
                    todo.completed ? "text-gray-400" : "text-gray-600"
                  }`}>{todo.description}</p>
                )}
              </div>
              <button
                onClick={() => deleteTodo.mutate({ id: todo.id })}
                disabled={deleteTodo.isPending}
                className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
