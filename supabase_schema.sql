-- Supabase Database Tables Creation Script
-- Copy and run this script in the SQL Editor of your Supabase Dashboard to create all required tables.

-- 1. Table: canteen_menu
CREATE TABLE IF NOT EXISTS public.canteen_menu (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    estimated_prep_time INTEGER DEFAULT 10,
    rating NUMERIC DEFAULT 5.0,
    tags TEXT[] DEFAULT '{}',
    is_today_special BOOLEAN DEFAULT FALSE
);

-- 2. Table: canteen_wallets
CREATE TABLE IF NOT EXISTS public.canteen_wallets (
    user_id TEXT PRIMARY KEY,
    balance NUMERIC DEFAULT 0.0,
    pin TEXT DEFAULT '1234',
    is_auto_topup_enabled BOOLEAN DEFAULT FALSE
);

-- 3. Table: canteen_wallet_transactions
CREATE TABLE IF NOT EXISTS public.canteen_wallet_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: canteen_meal_bookings
CREATE TABLE IF NOT EXISTS public.canteen_meal_bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT,
    meal_type TEXT,
    food_items TEXT[] DEFAULT '{}',
    meal_timing TEXT,
    mess_location TEXT,
    qr_code_url TEXT,
    is_collected BOOLEAN DEFAULT FALSE,
    roll_no TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: canteen_payment_settings
CREATE TABLE IF NOT EXISTS public.canteen_payment_settings (
    id TEXT PRIMARY KEY DEFAULT 'current_config',
    upi_id TEXT,
    merchant_name TEXT,
    bank_name TEXT,
    account_no TEXT,
    ifsc_code TEXT
);

-- 6. Table: canteen_student_profiles
CREATE TABLE IF NOT EXISTS public.canteen_student_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    roll_number TEXT UNIQUE NOT NULL,
    branch TEXT,
    academic_year TEXT,
    phone_number TEXT,
    college_name TEXT DEFAULT 'Spoorthy Engineering College',
    profile_locked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table: canteen_orders
CREATE TABLE IF NOT EXISTS public.canteen_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    payment_method TEXT,
    payment_status TEXT,
    payment_id TEXT,
    token_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) to secure postgres tables,
-- but create broad permissive policies for easy testing so that
-- no operations fail due to missing policies or connection key modes.
ALTER TABLE public.canteen_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_meal_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_orders ENABLE ROW LEVEL SECURITY;

-- Create default public read/write policies for ALL tables:

-- 1. canteen_menu
CREATE POLICY "Permissive select for canteen_menu" ON public.canteen_menu FOR SELECT TO public USING (true);
CREATE POLICY "Permissive insert for canteen_menu" ON public.canteen_menu FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permissive update for canteen_menu" ON public.canteen_menu FOR UPDATE TO public USING (true);
CREATE POLICY "Permissive delete for canteen_menu" ON public.canteen_menu FOR DELETE TO public USING (true);

-- 2. canteen_wallets
CREATE POLICY "Permissive select for canteen_wallets" ON public.canteen_wallets FOR SELECT TO public USING (true);
CREATE POLICY "Permissive insert for canteen_wallets" ON public.canteen_wallets FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permissive update for canteen_wallets" ON public.canteen_wallets FOR UPDATE TO public USING (true);
CREATE POLICY "Permissive delete for canteen_wallets" ON public.canteen_wallets FOR DELETE TO public USING (true);

-- 3. canteen_wallet_transactions
CREATE POLICY "Permissive select for canteen_wallet_transactions" ON public.canteen_wallet_transactions FOR SELECT TO public USING (true);
CREATE POLICY "Permissive insert for canteen_wallet_transactions" ON public.canteen_wallet_transactions FOR INSERT TO public WITH CHECK (true);

-- 4. canteen_meal_bookings
CREATE POLICY "Permissive select for canteen_meal_bookings" ON public.canteen_meal_bookings FOR SELECT TO public USING (true);
CREATE POLICY "Permissive insert for canteen_meal_bookings" ON public.canteen_meal_bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permissive update for canteen_meal_bookings" ON public.canteen_meal_bookings FOR UPDATE TO public USING (true);
CREATE POLICY "Permissive delete for canteen_meal_bookings" ON public.canteen_meal_bookings FOR DELETE TO public USING (true);

-- 5. canteen_payment_settings
CREATE POLICY "Permissive select for canteen_payment_settings" ON public.canteen_payment_settings FOR SELECT TO public USING (true);
CREATE POLICY "Permissive insert for canteen_payment_settings" ON public.canteen_payment_settings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permissive update for canteen_payment_settings" ON public.canteen_payment_settings FOR UPDATE TO public USING (true);

-- 6. canteen_student_profiles
CREATE POLICY "Permissive select for canteen_student_profiles" ON public.canteen_student_profiles FOR SELECT TO public USING (true);
CREATE POLICY "Permissive insert for canteen_student_profiles" ON public.canteen_student_profiles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permissive update for canteen_student_profiles" ON public.canteen_student_profiles FOR UPDATE TO public USING (true);
CREATE POLICY "Permissive delete for canteen_student_profiles" ON public.canteen_student_profiles FOR DELETE TO public USING (true);

-- 7. canteen_orders
CREATE POLICY "Permissive select for canteen_orders" ON public.canteen_orders FOR SELECT TO public USING (true);
CREATE POLICY "Permissive insert for canteen_orders" ON public.canteen_orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permissive update for canteen_orders" ON public.canteen_orders FOR UPDATE TO public USING (true);

-- 8. Table: canteen_print_orders
CREATE TABLE IF NOT EXISTS public.canteen_print_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    department TEXT,
    contact_number TEXT NOT NULL,
    pickup_time_slot TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL,
    tax NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'PENDING',
    upi_utr TEXT,
    upi_screenshot TEXT,
    upi_app TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.canteen_print_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permissive select for canteen_print_orders" ON public.canteen_print_orders FOR SELECT TO public USING (true);
CREATE POLICY "Permissive insert for canteen_print_orders" ON public.canteen_print_orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permissive update for canteen_print_orders" ON public.canteen_print_orders FOR UPDATE TO public USING (true);
CREATE POLICY "Permissive delete for canteen_print_orders" ON public.canteen_print_orders FOR DELETE TO public USING (true);

-- alternative fallback option to fully disable RLS:
-- ALTER TABLE public.canteen_menu DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.canteen_wallets DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.canteen_wallet_transactions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.canteen_meal_bookings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.canteen_payment_settings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.canteen_student_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.canteen_orders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.canteen_print_orders DISABLE ROW LEVEL SECURITY;
