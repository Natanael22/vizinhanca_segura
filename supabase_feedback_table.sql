-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'suggestion',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create feedback"
    ON feedbacks FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Only admins can view feedback"
    ON feedbacks FOR SELECT
    USING (auth.jwt() ->> 'email' = 'natanaelcorreia1@gmail.com'); -- Optional: adjust as needed
