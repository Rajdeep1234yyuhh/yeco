"use client";

import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to YECO</h1>
        <p className="text-lg">Your supportive AI mental health assistant</p>

        {/* Google Sign-In Button */}
        <InteractiveHoverButton
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/bot" })}
          className="w-full max-w-xs bg-white hover:bg-red-600 text-black py-2.5 rounded-lg font-medium transition-colors"
        >
          Sign in with Google
        </InteractiveHoverButton>
      </div>
    </main>
  );
}
