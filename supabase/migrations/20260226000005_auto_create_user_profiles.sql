-- =====================================================
-- Fix: criação automática de user_profiles
-- Sem trigger, usuários novos ficam sem perfil
-- e aparecem como "Usuário" no chat.
-- =====================================================

-- Função chamada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)   -- fallback: parte antes do @
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'agent'
  )
  ON CONFLICT (id) DO NOTHING;   -- não sobrescreve se já existe
  RETURN NEW;
END;
$$;

-- Trigger na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Backfill: cria perfis para usuários que já existem
-- sem linha em user_profiles
-- =====================================================
INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  u.raw_user_meta_data->>'avatar_url',
  'agent'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
);
