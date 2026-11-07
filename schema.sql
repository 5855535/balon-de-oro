-- ==========================================================
-- GALA BALÓN DE ORO FUTSAL - SUPABASE DATABASE SCHEMA
-- ==========================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE USUARIOS / PERFILES (Amigos y Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'voter' CHECK (role IN ('admin', 'voter')),
    access_code TEXT NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE NOMINADOS (Flexible, con o sin posición definida y con soporte de foto)
CREATE TABLE IF NOT EXISTS public.nominees (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    nickname TEXT,
    team TEXT NOT NULL,
    position TEXT DEFAULT 'Jugador',
    photo_url TEXT,
    description TEXT,
    categories TEXT[] NOT NULL DEFAULT '{"ballon_dor", "quinteto_ideal"}',
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE VOTOS
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL CHECK (category_id IN ('ballon_dor', 'guante_oro', 'quinteto_ideal', 'goleador')),
    ballot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_category UNIQUE (user_id, category_id)
);

-- 5. CONFIGURACIÓN DE LA GALA
CREATE TABLE IF NOT EXISTS public.gala_settings (
    id TEXT PRIMARY KEY DEFAULT 'current_gala',
    voting_open BOOLEAN DEFAULT TRUE,
    revealed_category TEXT DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gala_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público/anónimo para la gala de amigos
DROP POLICY IF EXISTS "Permitir lectura de perfiles" ON public.profiles;
CREATE POLICY "Permitir lectura de perfiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion y actualizacion de perfiles" ON public.profiles;
CREATE POLICY "Permitir insercion y actualizacion de perfiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura de nominados" ON public.nominees;
CREATE POLICY "Permitir lectura de nominados" ON public.nominees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir gestion de nominados" ON public.nominees;
CREATE POLICY "Permitir gestion de nominados" ON public.nominees FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura de votos" ON public.votes;
CREATE POLICY "Permitir lectura de votos" ON public.votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insertar o actualizar votos" ON public.votes;
CREATE POLICY "Permitir insertar o actualizar votos" ON public.votes FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura de configuracion" ON public.gala_settings;
CREATE POLICY "Permitir lectura de configuracion" ON public.gala_settings FOR ALL USING (true);

-- 7. BUCKET DE SUPABASE STORAGE PARA SUBIR FOTOS DE LOS NOMINADOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('nominee-photos', 'nominee-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Permitir lectura publica de fotos" ON storage.objects;
CREATE POLICY "Permitir lectura publica de fotos" ON storage.objects
FOR SELECT USING (bucket_id = 'nominee-photos');

DROP POLICY IF EXISTS "Permitir subir fotos" ON storage.objects;
CREATE POLICY "Permitir subir fotos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'nominee-photos');

DROP POLICY IF EXISTS "Permitir actualizar fotos" ON storage.objects;
CREATE POLICY "Permitir actualizar fotos" ON storage.objects
FOR UPDATE USING (bucket_id = 'nominee-photos');

-- 8. REGISTRO INICIAL DE CONFIGURACIÓN
INSERT INTO public.gala_settings (id, voting_open)
VALUES ('current_gala', true)
ON CONFLICT (id) DO NOTHING;

-- 9. USUARIO ADMINISTRADOR Y AMIGOS INICIALES (Personaliza con los nombres y claves de tus amigos)
INSERT INTO public.profiles (id, username, display_name, role, access_code)
VALUES 
  ('admin-1', 'admin', 'Comité Organizador (Admin)', 'admin', 'GALA2025'),
  ('user-1', 'carlos', 'Carlos Mendoza', 'voter', 'VOTE101'),
  ('user-2', 'mateo', 'Mateo Gómez', 'voter', 'VOTE102'),
  ('user-3', 'santiago', 'Santiago Silva', 'voter', 'VOTE103'),
  ('user-4', 'lucas', 'Lucas Romero', 'voter', 'VOTE104'),
  ('user-5', 'david', 'David Torres', 'voter', 'VOTE105')
ON CONFLICT (username) DO NOTHING;

-- 10. PLANTILLA PARA SUBIR TUS NOMINADOS DIRECTAMENTE A SUPABASE:
-- Puedes duplicar esta línea para cada uno de tus amigos:
-- INSERT INTO public.nominees (name, nickname, team, position, photo_url, description, categories)
-- VALUES ('Nombre Amigo', 'Apodo', 'Nombre Equipo', 'Posición', 'https://...', 'Breve descripción', ARRAY['ballon_dor', 'quinteto_ideal']);
