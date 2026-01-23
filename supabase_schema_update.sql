-- Update alerts table with status
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'hidden')),
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS police_report text,
ADD COLUMN IF NOT EXISTS reference_point text;

-- Create community topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    author_pseudonym text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create community replies table
CREATE TABLE IF NOT EXISTS public.replies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    author_pseudonym text NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create reputation history table
CREATE TABLE IF NOT EXISTS public.reputation_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    points integer NOT NULL,
    reason text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_history ENABLE ROW LEVEL SECURITY;

-- Policies for Topics
CREATE POLICY "Anyone can view topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON public.topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for Replies
CREATE POLICY "Anyone can view replies" ON public.replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for Reputation
CREATE POLICY "Users can only view their own reputation history" ON public.reputation_history FOR SELECT USING (auth.uid() = user_id);

-- Add missing columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Ensure reputation defaults to 0 and fix any existing discrepancy
ALTER TABLE public.profiles ALTER COLUMN reputation SET DEFAULT 0;
UPDATE public.profiles SET reputation = 0 WHERE reputation = 850; -- Optional: Reset users accidentally created with 850

-- Function to handle new user registration from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, pseudonym, phone, neighborhood, city, state)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'pseudonym',
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'neighborhood',
        new.raw_user_meta_data->>'city',
        new.raw_user_meta_data->>'state'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
