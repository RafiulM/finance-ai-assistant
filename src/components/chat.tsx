"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, Bot, User } from "lucide-react";

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    isLoading: chatLoading,
  } = useChat({
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  
  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto mt-4">

      {/* Error Message */}
      {error && (
        <Card className="p-3 border-red-200 bg-red-50 dark:bg-red-900/20 m-4 mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 dark:text-red-300 text-sm">
              {error.message ||
                "An error occurred while processing your request."}
            </span>
          </div>
        </Card>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center border-dashed max-w-md">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-2">
                💰 Finance AI Assistant
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Track your income and expenses through natural conversation
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Try: &quot;I spent $15 on lunch&quot; or &quot;Got paid $2500 salary&quot;
              </p>
            </Card>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {m.role === "user" ? (
                    <User className="w-3 h-3 text-blue-200" />
                  ) : (
                    <Bot className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className={`text-xs font-medium ${
                    m.role === "user" ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {m.role === "user" ? "You" : "AI Assistant"}
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {m.content}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  AI Assistant
                </span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            placeholder="Describe your income or expense..."
            onChange={handleInputChange}
            className="flex-1"
            disabled={chatLoading}
          />
          <Button type="submit" disabled={chatLoading || !input.trim()}>
            {chatLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}