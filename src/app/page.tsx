"use client";

import Agent from "../components/Agent";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="text-center space-y-6 w-full max-w-4xl">
        {status === "loading" ? (
          <p>Loading...</p>
        ) : isLoggedIn ? (
          <>
            <h1 className="text-4xl font-bold">Welcome to YECO</h1>
            <p className="text-lg">Hello, {session.user?.name} 👋</p>

            <InteractiveHoverButton
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Sign Out
            </InteractiveHoverButton>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold">Welcome to YECO</h1>
            <p className="text-lg">
              Your supportive AI mental health assistant
            </p>

            <InteractiveHoverButton
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full max-w-xs bg-white hover:bg-red-600 text-black py-2.5 rounded-lg font-medium transition-colors"
            >
              Sign in with Google
            </InteractiveHoverButton>
          </>
        )}
      </div>

      {/* Now Agent is centered separately below */}
      <div className="mt-10 flex justify-center w-full max-w-4xl">
        <Agent />
      </div>
    </main>
  );
}
