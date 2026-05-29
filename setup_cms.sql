-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS marketing_contents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  section VARCHAR(255) NOT NULL,
  locale VARCHAR(10) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page, section, locale)
);

-- Enable RLS
ALTER TABLE marketing_contents ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on marketing_contents" 
ON marketing_contents FOR SELECT 
TO public 
USING (true);

-- Allow authenticated (admin) write access
CREATE POLICY "Allow authenticated full access on marketing_contents" 
ON marketing_contents FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Insert some default rows so it's not completely empty (optional, they will be upserted by the CMS anyway)
