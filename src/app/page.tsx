"use client";

import Agent from "../components/Agent";
import { signIn, useSession } from "next-auth/react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import Navbar from "../components/Nav";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center pt-20 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
        <div className="text-center space-y-4 w-full max-w-4xl">
          {status === "loading" ? (
            <p>Loading...</p>
          ) : isLoggedIn ? (
            <>
              <p className="text-lg">Hello, {session.user?.name} 👋</p>
              <p className="text-gray-300 max-w-xl mx-auto">
                I&apos;m your personal mental health assistant. Feel free to ask
                me anything.I will guide you through your mental health journey.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold">Welcome to YECO</h1>
              <p className="text-lg">
                Your supportive AI mental health assistant
              </p>
              <p className="text-gray-300 max-w-xl mx-auto">
                ⚠️ Please sign in to access your personal mental health
                companion.
              </p>
              {/* Mobile-only sign in button */}
              <div className="sm:hidden mt-4">
                <InteractiveHoverButton
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="w-full max-w-xs mx-auto bg-white hover:bg-red-600 text-black hover:text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Sign in with Google
                </InteractiveHoverButton>
              </div>
            </>
          )}
        </div>

        {/* Agent component with clear spacing from navbar */}
        <div className="mt-10 flex justify-center w-full max-w-4xl">
          <Agent />
        </div>
      </main>
    </>
  );
}
