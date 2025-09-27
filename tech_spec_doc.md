## **Technical Specification: AI Personal Finance Chatbot**

### **1\. Project Overview**

This document outlines the technical specifications for a web-based personal finance chatbot. The application will allow users to track their income and expenses through a conversational interface, view their financial data on a dashboard, and receive AI-driven suggestions for asset management.

---

### **2\. Technology Stack**

* **Framework:** Next.js  
* **UI Components:** shadcn/ui  
* **Database & Backend:** Supabase  
* **Authentication:** Clerk  
* **AI & Chat:** Vercel AI SDK

---

### **3\. Core Features**

#### **3.1. Conversational Financial Logging** 💬

Users can input their financial activities using natural language. The chatbot will parse the input to identify and record transactions.

* **Examples:** "I spent $15 on lunch," "got paid my $2500 salary today," "put 50 dollars into my savings."  
* **Functionality:** The AI will extract key details like amount, type (income/expense), category, and date.

#### **3.2. Financial Dashboard** 📊

A dedicated page that provides a clear, visual summary of the user's financial status.

* **Components:**  
  * Income vs. Expense breakdown (e.g., pie chart, bar graph).  
  * Spending by category.  
  * Net worth summary over time.  
  * A list or table of recent transactions.

#### **3.3. Secure User Authentication** 🔐

User registration and login will be handled by **Clerk**, ensuring a secure and seamless onboarding experience. Each user's data will be isolated and private.

#### **3.4. AI-Powered Insights & Suggestions**💡

The application will provide proactive advice to help users improve their financial health.

* **Functionality:** Based on spending habits and income, the AI can suggest budget adjustments, savings strategies, or potential investment opportunities for asset development.

---

### **4\. Application & Data Flow**

The user journey and data interaction are designed to be simple and intuitive.

1. **Authentication:**  
     
   * A new user signs up or an existing user logs in via the **Clerk** authentication modal.  
   * Upon successful authentication, Clerk provides a user session and a unique `userId`.

   

2. **Chat Interaction (Data Input):**  
     
   * The user types a financial activity into the chat interface on the Next.js frontend.  
   * The frontend sends this user prompt to a server-side API route, including the authentication token from Clerk.  
   * This API route uses the **Vercel AI SDK** to process the natural language. The AI model identifies the intent (e.g., logging an expense) and extracts entities (`amount`, `category`, `description`).  
   * The API route then structures this information into a JSON object.  
   * This structured data, along with the `userId` extracted from the JWT, is sent to **Supabase** to be inserted as a new record in the `transactions` table.  
   * The chatbot interface updates to confirm the transaction has been logged.

   

3. **Dashboard Visualization (Data Retrieval):**  
     
   * The user navigates to the `/dashboard` page.  
   * The Next.js page component makes a server-side request to Supabase. The user's JWT is passed along, allowing Supabase's RLS policies to automatically filter the data.  
   * The fetched data is used to render the charts and summaries built with `shadcn/ui` and a charting library (e.g., Recharts).

---

### **5\. Database Schema (Supabase/PostgreSQL) with Clerk Auth**

The database schema is designed to work with **Clerk** as the authentication provider. The `user_id` in each table will be a `TEXT` field, corresponding to the user ID supplied by Clerk in the JWT.

Row-Level Security (RLS) policies will be enforced to ensure users can only access their own data by checking the `sub` (subject) claim in the JWT against the `user_id` in the table.

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk User ID
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name) -- A user cannot have duplicate category names
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "User can view their own categories"
ON categories FOR SELECT TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can insert their own categories"
ON categories FOR INSERT TO authenticated
WITH CHECK (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can update their own categories"
ON categories FOR UPDATE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can delete their own categories"
ON categories FOR DELETE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk User ID
  name TEXT NOT NULL, -- e.g., 'Savings Account', 'Stock Portfolio'
  type TEXT NOT NULL, -- e.g., 'cash', 'investment', 'property'
  current_value NUMERIC(12, 2) NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assets
CREATE POLICY "User can view their own assets"
ON assets FOR SELECT TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can insert their own assets"
ON assets FOR INSERT TO authenticated
WITH CHECK (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can update their own assets"
ON assets FOR UPDATE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can delete their own assets"
ON assets FOR DELETE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk User ID
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  category_id INT REFERENCES categories(id),
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "User can view their own transactions"
ON transactions FOR SELECT TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can insert their own transactions"
ON transactions FOR INSERT TO authenticated
WITH CHECK (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can update their own transactions"
ON transactions FOR UPDATE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can delete their own transactions"
ON transactions FOR DELETE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));
```