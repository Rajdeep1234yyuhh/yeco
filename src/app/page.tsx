"use client";

import { useRouter } from "next/navigation";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";

export default function Home() {
  const router = useRouter();

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center px-4 bg-black">
      <h1 className="text-4xl text-white font-bold mb-6">YECO 🧠</h1>
      <p className="mb-6 text-lg text-white">
        Your AI mental health companion. Please log in to begin your session.
      </p>
      <InteractiveHoverButton
        onClick={goToLogin}
        className=" px-6 py-2 rounded transition"
      >
        Go to Login
      </InteractiveHoverButton>
    </main>
  );
}
