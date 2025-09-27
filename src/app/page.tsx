"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Chat Section */}
      <SignedIn>
        <Chat />
      </SignedIn>

      <SignedOut>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto">
            <div className="text-4xl sm:text-5xl mb-4">💰</div>
            <h2 className="text-2xl font-bold mb-4">Welcome to Finance AI Assistant</h2>
            <p className="text-muted-foreground mb-8">
              Track your income and expenses through natural conversation. Get AI-powered insights and manage your finances effortlessly.
            </p>
            <Button size="lg">
              Get Started
            </Button>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}