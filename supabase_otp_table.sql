-- Table for WhatsApp OTP Verification
CREATE TABLE IF NOT EXISTS public.otp_requests (
    phone text primary key,
    code text not null,
    created_at timestamp with time zone default now(),
    expires_at timestamp with time zone default (now() + interval '5 minutes')
);

-- Enable RLS
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;

-- No policies needed because only the Edge Function (using Service Role) will access this table.
-- This ensures the client cannot read the verification code.
