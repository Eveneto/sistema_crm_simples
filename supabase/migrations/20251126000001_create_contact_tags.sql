-- Migration: Create contact_tags table
-- Created at: 2025-11-26
-- Sprint: 2

-- Create contact_tags table
CREATE TABLE IF NOT EXISTS public.contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.contacts_tags_junction (
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.contact_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (contact_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_tags_junction ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_tags

-- Users can view their own tags
CREATE POLICY "Users can view their own tags"
  ON public.contact_tags
  FOR SELECT
  USING (created_by = auth.uid());

-- Users can create tags
CREATE POLICY "Users can create tags"
  ON public.contact_tags
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users can update their own tags
CREATE POLICY "Users can update their own tags"
  ON public.contact_tags
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own tags
CREATE POLICY "Users can delete their own tags"
  ON public.contact_tags
  FOR DELETE
  USING (created_by = auth.uid());

-- RLS Policies for contacts_tags_junction

-- Users can view tags on their own contacts
CREATE POLICY "Users can view tags on their contacts"
  ON public.contacts_tags_junction
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contacts_tags_junction.contact_id
      AND contacts.created_by = auth.uid()
    )
  );

-- Users can add tags to their contacts
CREATE POLICY "Users can add tags to their contacts"
  ON public.contacts_tags_junction
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contacts_tags_junction.contact_id
      AND contacts.created_by = auth.uid()
    )
  );

-- Users can remove tags from their contacts
CREATE POLICY "Users can remove tags from their contacts"
  ON public.contacts_tags_junction
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contacts_tags_junction.contact_id
      AND contacts.created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_tags_created_by ON public.contact_tags(created_by);
CREATE INDEX IF NOT EXISTS idx_contact_tags_name ON public.contact_tags(name);
CREATE INDEX IF NOT EXISTS idx_contacts_tags_junction_contact_id ON public.contacts_tags_junction(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tags_junction_tag_id ON public.contacts_tags_junction(tag_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_contact_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_contact_tags_updated_at_trigger
  BEFORE UPDATE ON public.contact_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_tags_updated_at();

-- Insert default tags
INSERT INTO public.contact_tags (name, color, created_by)
SELECT 
  tag.name,
  tag.color,
  (SELECT id FROM auth.users LIMIT 1)
FROM (
  VALUES 
    ('Lead', '#10B981'),
    ('Cliente', '#3B82F6'),
    ('Prospect', '#F59E0B'),
    ('VIP', '#8B5CF6'),
    ('Inativo', '#6B7280'),
    ('Parceiro', '#EC4899'),
    ('Fornecedor', '#14B8A6')
) AS tag(name, color)
WHERE EXISTS (SELECT 1 FROM auth.users)
ON CONFLICT (name) DO NOTHING;

-- Add comment to tables
COMMENT ON TABLE public.contact_tags IS 'Tags para categorizar contatos';
COMMENT ON TABLE public.contacts_tags_junction IS 'Relacionamento muitos-para-muitos entre contatos e tags';
