import { openai } from "@ai-sdk/openai";
import { streamText, generateObject } from "ai";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { z } from "zod";

export async function POST(req: Request) {
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
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    // First, use AI to determine if this is a financial transaction
    const transactionSchema = z.object({
      isTransaction: z.boolean(),
      type: z.enum(["income", "expense"]).nullable(),
      amount: z.number().nullable(),
      category: z.string().nullable(),
      description: z.string().nullable(),
      date: z.string().nullable()
    });

    const transactionAnalysis = await generateObject({
      model: openai("gpt-4o"),
      prompt: `You are a financial transaction parser. Analyze the user's message and determine if it contains a financial transaction (income or expense).

      User message: "${userMessage}"

      Respond with JSON only, no other text. Use this format:
      {
        "isTransaction": boolean,
        "type": "income" | "expense" | null,
        "amount": number | null,
        "category": string | null,
        "description": string | null,
        "date": string | null (ISO format, or null if not specified)
      }

      Examples:
      "I spent $15 on lunch" → {"isTransaction": true, "type": "expense", "amount": 15, "category": "Food & Dining", "description": "lunch", "date": null}
      "Got paid my $2500 salary today" → {"isTransaction": true, "type": "income", "amount": 2500, "category": "Income", "description": "salary", "date": null}
      "Put 50 dollars into savings" → {"isTransaction": true, "type": "expense", "amount": 50, "category": "Savings", "description": "savings deposit", "date": null}
      "How are you doing?" → {"isTransaction": false, "type": null, "amount": null, "category": null, "description": null, "date": null}

      Common categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Income, Savings, Investment.
      If no specific category is mentioned, use "Other".`,
      temperature: 0.1,
      schema: transactionSchema,
    });

    const transactionData = transactionAnalysis.object;

    // If it's a transaction, store it in the database
    if (transactionData?.isTransaction && transactionData.amount && transactionData.type) {
      const supabase = await createSupabaseServerClient();

      // Get or create the category
      let categoryId = null;
      if (transactionData.category) {
        const { data: existingCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("user_id", userId)
          .eq("name", transactionData.category)
          .single();

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
          const { data: newCategory } = await supabase
            .from("categories")
            .insert({ user_id: userId, name: transactionData.category })
            .select("id")
            .single();

          if (newCategory) {
            categoryId = newCategory.id;
          }
        }
      }

      // Create the transaction
      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          amount: transactionData.amount,
          type: transactionData.type,
          category_id: categoryId,
          description: transactionData.description || transactionData.category || "Transaction",
          transaction_date: transactionData.date ? new Date(transactionData.date) : new Date()
        })
        .select()
        .single();

      if (error) {
        console.error("Transaction creation error:", error);
      } else {
        console.log("Transaction created:", transaction);
      }
    }

    // Generate the AI response
    const result = streamText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `You are a friendly and helpful personal finance AI assistant. You help users track their income and expenses through natural conversation.

          When users describe financial activities:
          1. Acknowledge that you've recorded their transaction
          2. Be friendly and confirm the details
          3. Offer helpful financial insights when appropriate
          4. Keep responses concise but warm

          When users ask general questions about their finances:
          1. Provide helpful, actionable advice
          2. Be encouraging about financial habits
          3. Suggest they check their dashboard for detailed views

          You can also help with:
          - Budget planning suggestions
          - Savings advice
          - General financial education
          - Spending pattern analysis

          Always maintain a positive, supportive tone and focus on helping users improve their financial health.`
        },
        ...messages
      ],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error:
          "Failed to process chat request. Please check your API configuration.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
