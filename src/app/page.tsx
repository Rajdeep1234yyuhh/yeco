"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to CalmConnect 🧠</h1>
      <p className="mb-6 text-lg text-gray-700">
        Your AI mental health companion. Please log in to begin your session.
      </p>
      <button
        onClick={goToLogin}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Go to Login
      </button>
    </main>
  );
}
