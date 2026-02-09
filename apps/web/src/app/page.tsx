"use client";

import { useSession } from "@/lib/auth-client";
import AuthForm from "@/components/auth-form";
import TodoList from "@/components/todo-list";

export default function Home() {
  const session = useSession();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Full-Stack Todo App
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium flex-wrap">
            <span className="px-3 py-1 bg-white rounded-full border border-gray-200">Next.js</span>
            <span className="text-gray-400">•</span>
            <span className="px-3 py-1 bg-white rounded-full border border-gray-200">Fastify</span>
            <span className="text-gray-400">•</span>
            <span className="px-3 py-1 bg-white rounded-full border border-gray-200">tRPC</span>
            <span className="text-gray-400">•</span>
            <span className="px-3 py-1 bg-white rounded-full border border-gray-200">Better Auth</span>
            <span className="text-gray-400">•</span>
            <span className="px-3 py-1 bg-white rounded-full border border-gray-200">Drizzle</span>
            <span className="text-gray-400">•</span>
            <span className="px-3 py-1 bg-white rounded-full border border-gray-200">PostgreSQL</span>
          </div>
        </div>

        {session.data ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <TodoList />
          </div>
        ) : (
          <AuthForm />
        )}
      </div>
    </main>
  );
}
