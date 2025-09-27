"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <SignedOut>
              <SignInButton>
                <Button size="sm" className="text-xs sm:text-sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <Image
            src="/codeguide-logo.png"
            alt="Finance AI Assistant Logo"
            width={50}
            height={50}
            className="rounded-xl sm:w-[60px] sm:h-[60px]"
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent font-parkinsans">
            Finance AI Assistant
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Track your finances with AI-powered conversation
        </p>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-8 max-w-5xl">
        {/* Chat Section */}
        <SignedIn>
          <div className="mt-6 sm:mt-8">
            <Chat />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="text-center py-12">
            <div className="text-4xl sm:text-5xl mb-4">💰</div>
            <h2 className="text-2xl font-bold mb-4">Welcome to Finance AI Assistant</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track your income and expenses through natural conversation. Get AI-powered insights and manage your finances effortlessly.
            </p>
            <SignInButton>
              <Button size="lg">
                Get Started
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}