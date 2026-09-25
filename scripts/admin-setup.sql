ALTER TABLE public.startups
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tentorgames@gmail.com';
