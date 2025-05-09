import { useState } from "react";
import {
  Menu,
  X,
  User,
  BarChart2,
  Brain,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold">
              <a href="/">YECO</a>
            </span>
          </div>

          {/* Desktop navigation */}
          {isLoggedIn && (
            <div className="hidden sm:block">
              <div className="ml-10 flex items-center space-x-6">
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span>AI Support</span>
                </a>
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center"
                >
                  <BarChart2 className="w-5 h-5 mr-2" />
                  <span>Mood Trends</span>
                </a>
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  <span>Mental Health</span>
                </a>
              </div>
            </div>
          )}

          {/* User profile section */}
          <div className="hidden sm:flex items-center">
            {status === "loading" ? (
              <p className="text-sm">Loading...</p>
            ) : isLoggedIn ? (
              <div className="flex items-center ml-6">
                <div className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-md">
                  <User className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">
                    {session.user?.name}
                  </span>
                </div>
                <InteractiveHoverButton
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ml-3 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  Sign Out
                </InteractiveHoverButton>
              </div>
            ) : (
              <InteractiveHoverButton
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="bg-white hover:bg-red-600 text-black hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign in with Google
              </InteractiveHoverButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          {isLoggedIn && (
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 flex items-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                <span>AI Support</span>
              </a>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 flex items-center"
              >
                <BarChart2 className="w-5 h-5 mr-2" />
                <span>Mood Trends</span>
              </a>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 flex items-center"
              >
                <Brain className="w-5 h-5 mr-2" />
                <span>Mental Health</span>
              </a>
            </div>
          )}

          {status === "loading" ? (
            <div className="px-5 py-4">
              <p>Loading...</p>
            </div>
          ) : isLoggedIn ? (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10 rounded-full bg-gray-800 p-2" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">
                    {session.user?.name}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <InteractiveHoverButton
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Sign Out
                </InteractiveHoverButton>
              </div>
            </div>
          ) : (
            <div className="px-2 py-4">
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium bg-white text-black hover:bg-red-600 hover:text-white"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
