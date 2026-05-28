-- ====================================================================
-- SUPABASE AUTOMATIC USER SYNC MIGRATION SQL
-- ====================================================================
--
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard (https://supabase.com).
-- 2. Go to your project and click on the "SQL Editor" menu on the left.
-- 3. Click "New Query", paste the entire contents of this file, and click "Run".
--
-- WHAT THIS DOES:
-- 1. Creates a public `users` table linked to Supabase's internal auth users.
-- 2. Sets up standard Row Level Security (RLS) policies for user profiles.
-- 3. Creates a trigger function `handle_new_user()` that runs automatically
--    whenever a user signs up/in via Google OAuth.
-- 4. Installs the database trigger `on_auth_user_created` to sync auth users.
-- ====================================================================

-- 1. Create a public users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone to view public profiles
CREATE POLICY "Allow public read access to profiles" ON public.users
  FOR SELECT USING (true);

-- Allow users to update their own profiles
CREATE POLICY "Allow individual users to update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Create trigger function to handle automatic user creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '구글 사용자'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create database trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- ORDERS TABLE MIGRATION SQL
-- ====================================================================

-- 1. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'completed' NOT NULL,
  total_price INTEGER NOT NULL,
  total_credits INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  professor TEXT NOT NULL,
  schedule TEXT NOT NULL,
  credits INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  grading TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create RLS Policies for order_items
-- Since order_items don't have user_id, we join with orders to check ownership
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id 
      AND public.orders.user_id = auth.uid()
    )
  );

-- For insert, users can only insert items for their own orders
CREATE POLICY "Users can insert their own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id 
      AND public.orders.user_id = auth.uid()
    )
  );
