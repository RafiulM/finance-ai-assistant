import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { z } from "zod";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const supabase = await createSupabaseServerClient();

    // Get user's recent transactions and financial data
    const [transactions, categories, assets] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false })
        .limit(50),
      supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId),
      supabase
        .from("assets")
        .select("*")
        .eq("user_id", userId)
    ]);

    // Calculate financial summary
    const income = transactions.data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expenses = transactions.data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const netIncome = income - expenses;
    const totalAssets = assets.data?.reduce((sum, a) => sum + Number(a.current_value), 0) || 0;

    // Get spending by category
    const spendingByCategory = transactions.data?.reduce((acc, t) => {
      if (t.type === 'expense') {
        const categoryName = categories.data?.find(c => c.id === t.category_id)?.name || 'Other';
        acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = transactions.data?.filter(t =>
      new Date(t.transaction_date) >= thirtyDaysAgo
    ) || [];

    // Financial data is used in the AI prompt below

    // Generate AI insights
    const insightsSchema = z.object({
      insights: z.array(z.object({
        type: z.enum(["budget", "savings", "investment", "spending", "general"]),
        title: z.string(),
        description: z.string(),
        priority: z.enum(["high", "medium", "low"]),
        actionable: z.boolean()
      })),
      summary: z.string()
    });

    const insights = await generateObject({
      model: openai("gpt-4o"),
      prompt: `You are a personal finance AI assistant. Analyze the user's financial data and provide helpful insights and suggestions.

      Here's the user's financial data for the last 30 days:
      - Income: $${income.toFixed(2)}
      - Expenses: $${expenses.toFixed(2)}
      - Net Income: $${netIncome.toFixed(2)}
      - Total Assets: $${totalAssets.toFixed(2)}
      - Recent Transactions: ${recentTransactions.length}
      - Spending by Category: ${JSON.stringify(spendingByCategory)}

      Respond with JSON only, using this format:
      {
        "insights": [
          {
            "type": "budget" | "savings" | "investment" | "spending" | "general",
            "title": string,
            "description": string,
            "priority": "high" | "medium" | "low",
            "actionable": boolean
          }
        ],
        "summary": string
      }

      Focus on:
      1. Spending patterns and budget optimization
      2. Savings opportunities
      3. Investment suggestions based on current assets
      4. Areas where spending might be excessive
      5. Positive financial habits to encourage

      Keep suggestions practical, actionable, and encouraging.`,
      temperature: 0.7,
      schema: insightsSchema,
    });

    const insightsData = insights.object;

    return new Response(JSON.stringify(insightsData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Insights API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate insights. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}