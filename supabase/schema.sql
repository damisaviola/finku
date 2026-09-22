-- Schema Database DompetKu (PostgreSQL / Supabase)
-- Berdasarkan PRD Bagian 54 & 55

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel accounts
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Bank', 'Uang Tunai', 'Dompet Digital', 'Tabungan', 'Lainnya')),
    initial_balance NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'IDR',
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
    destination_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    month VARCHAR(7) NOT NULL, -- Format YYYY-MM
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_id, month)
);

-- 6. Tabel goals
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Performa (PRD Bagian 61)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- Row Level Security (PRD Bagian 54)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna dapat melihat profil sendiri" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat memperbarui profil sendiri" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat menambah profil sendiri" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Pengguna hanya dapat mengakses akun sendiri" ON public.accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat mengakses kategori sendiri" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat mengakses transaksi sendiri" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat mengakses anggaran sendiri" ON public.budgets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat mengakses target sendiri" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

-- =========================================================================
-- TRIGGER OTOMATIS PENDAFTARAN SUPABASE AUTH (GOOGLE OAUTH & EMAIL)
-- Otomatis mendaftarkan data profil dari auth.users ke public.users
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        updated_at = NOW();

    -- Tambahkan rekening default untuk pengguna baru
    INSERT INTO public.accounts (user_id, name, type, initial_balance, currency, color)
    VALUES 
        (NEW.id, 'Kas Tunai', 'Uang Tunai', 0, 'IDR', '#10b981'),
        (NEW.id, 'Rekening Bank', 'Bank', 0, 'IDR', '#3b82f6')
    ON CONFLICT DO NOTHING;

    -- Tambahkan kategori dasar default
    INSERT INTO public.categories (user_id, name, type, color)
    VALUES
        (NEW.id, 'Makanan & Minuman', 'expense', '#ef4444'),
        (NEW.id, 'Transportasi', 'expense', '#f59e0b'),
        (NEW.id, 'Gaji & Pendapatan', 'income', '#10b981'),
        (NEW.id, 'Investasi & Bonus', 'income', '#8b5cf6')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

