-- Finance AI Assistant Database Schema
-- Creates tables for financial tracking with proper RLS policies for Clerk integration

-- Create categories table for transaction categorization
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk User ID
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name) -- A user cannot have duplicate category names
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "User can view their own categories"
ON public.categories FOR SELECT TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can insert their own categories"
ON public.categories FOR INSERT TO authenticated
WITH CHECK (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can update their own categories"
ON public.categories FOR UPDATE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can delete their own categories"
ON public.categories FOR DELETE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

-- Create assets table for tracking user's assets
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk User ID
  name TEXT NOT NULL, -- e.g., 'Savings Account', 'Stock Portfolio'
  type TEXT NOT NULL, -- e.g., 'cash', 'investment', 'property'
  current_value NUMERIC(12, 2) NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assets
CREATE POLICY "User can view their own assets"
ON public.assets FOR SELECT TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can insert their own assets"
ON public.assets FOR INSERT TO authenticated
WITH CHECK (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can update their own assets"
ON public.assets FOR UPDATE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can delete their own assets"
ON public.assets FOR DELETE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

-- Create transactions table for financial transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk User ID
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  category_id INT REFERENCES public.categories(id),
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "User can view their own transactions"
ON public.transactions FOR SELECT TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can insert their own transactions"
ON public.transactions FOR INSERT TO authenticated
WITH CHECK (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can update their own transactions"
ON public.transactions FOR UPDATE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

CREATE POLICY "User can delete their own transactions"
ON public.transactions FOR DELETE TO authenticated
USING (((select auth.jwt()->>'sub') = user_id));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);

-- Create default categories for new users
-- This function will be called when a user signs up
CREATE OR REPLACE FUNCTION create_default_categories_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id TEXT;
BEGIN
  new_user_id = NEW.id;

  -- Insert default categories
  INSERT INTO public.categories (user_id, name) VALUES
    (new_user_id, 'Food & Dining'),
    (new_user_id, 'Transportation'),
    (new_user_id, 'Shopping'),
    (new_user_id, 'Entertainment'),
    (new_user_id, 'Bills & Utilities'),
    (new_user_id, 'Healthcare'),
    (new_user_id, 'Education'),
    (new_user_id, 'Travel'),
    (new_user_id, 'Income'),
    (new_user_id, 'Savings'),
    (new_user_id, 'Investment');

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to set up default categories when a user signs up
-- Note: This would need to be integrated with Clerk's webhook system
-- For now, we'll handle it in the application logic