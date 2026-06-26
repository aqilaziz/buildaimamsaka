-- ============================================
-- MAMSAKA: Initial Database Schema & Security
-- Migration: 001_initial_schema
-- ============================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY,
  username      text UNIQUE NOT NULL,
  full_name     text DEFAULT '',
  avatar_url    text DEFAULT '',
  bio           text DEFAULT '' CHECK (char_length(bio) <= 500),
  website       text DEFAULT '',
  github_username text DEFAULT '',
  role          text DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE public.projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  slug          text UNIQUE NOT NULL,
  description   text DEFAULT '',
  thumbnail_url text DEFAULT '',
  demo_video_url text DEFAULT '' CHECK (demo_video_url = '' OR demo_video_url ~ '^https?://'),
  github_url    text DEFAULT '' CHECK (github_url = '' OR github_url ~ '^https?://'),
  live_url      text DEFAULT '' CHECK (live_url = '' OR live_url ~ '^https?://'),
  status        text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  stars_count   integer DEFAULT 0 CHECK (stars_count >= 0),
  likes_count   integer DEFAULT 0 CHECK (likes_count >= 0),
  views_count   integer DEFAULT 0 CHECK (views_count >= 0),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  published_at  timestamptz
);

CREATE INDEX idx_projects_owner ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_stars ON public.projects(stars_count DESC);
CREATE INDEX idx_projects_published ON public.projects(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_projects_slug ON public.projects(slug);

-- ============================================
-- 3. STARS TABLE
-- ============================================
CREATE TABLE public.stars (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_stars_project ON public.stars(project_id);
CREATE INDEX idx_stars_user ON public.stars(user_id);

-- ============================================
-- 4. LIKES TABLE
-- ============================================
CREATE TABLE public.likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_likes_project ON public.likes(project_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);

-- ============================================
-- 5. COMMENTS TABLE
-- ============================================
CREATE TABLE public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
  parent_id   uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_comments_project ON public.comments(project_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);

-- ============================================
-- 6. TAGS TABLE
-- ============================================
CREATE TABLE public.tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  slug        text UNIQUE NOT NULL,
  usage_count integer DEFAULT 0
);

-- ============================================
-- 7. PROJECT_TAGS (M:N junction)
-- ============================================
CREATE TABLE public.project_tags (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- ============================================
-- 8. PROJECT_MEDIA TABLE
-- ============================================
CREATE TABLE public.project_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  media_url   text NOT NULL,
  media_type  text DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'pdf')),
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_media_project ON public.project_media(project_id);

-- ============================================
-- 9. ACTIVITY LOGS (analytics ringan)
-- ============================================
CREATE TABLE public.activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id  uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  action      text NOT NULL CHECK (action IN ('view', 'like', 'star', 'comment', 'publish')),
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_activity_project ON public.activity_logs(project_id);
CREATE INDEX idx_activity_created ON public.activity_logs(created_at DESC);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, username, full_name, avatar_url, role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    'student'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Auto-update stars_count
-- ============================================
CREATE OR REPLACE FUNCTION public.update_project_stars_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET stars_count = stars_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET stars_count = stars_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_stars_counter ON public.stars;
CREATE TRIGGER trg_stars_counter
  AFTER INSERT OR DELETE ON public.stars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_stars_count();

-- ============================================
-- TRIGGER: Auto-update likes_count
-- ============================================
CREATE OR REPLACE FUNCTION public.update_project_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET likes_count = likes_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET likes_count = likes_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_likes_counter ON public.likes;
CREATE TRIGGER trg_likes_counter
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_likes_count();

-- ============================================
-- TRIGGER: Auto-update tag usage_count
-- ============================================
CREATE OR REPLACE FUNCTION public.update_tag_usage_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_tag_usage ON public.project_tags;
CREATE TRIGGER trg_tag_usage
  AFTER INSERT OR DELETE ON public.project_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tag_usage_count();

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated ON public.projects;
CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_comments_updated ON public.comments;
CREATE TRIGGER trg_comments_updated
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- AUTO-GENERATE SLUG from title
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  new_slug := base_slug;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM projects WHERE slug = new_slug) THEN
      RETURN new_slug;
    END IF;
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
END;
$$;

-- ============================================
-- TRIGGER: Set slug + published_at on publish
-- ============================================
CREATE OR REPLACE FUNCTION public.before_project_insert_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-generate slug if empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  -- Set published_at when status changes to published
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status <> 'published') THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_before ON public.projects;
CREATE TRIGGER trg_project_before
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.before_project_insert_update();

-- ============================================
-- === ROW LEVEL SECURITY POLICIES ===
-- ============================================

-- ============= PROFILES =============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============= PROJECTS =============
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published projects are viewable by everyone"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Owners can view all their projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ============= STARS =============
ALTER TABLE public.stars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stars are viewable by everyone"
  ON public.stars FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can star"
  ON public.stars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unstar their own stars"
  ON public.stars FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============= LIKES =============
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============= COMMENTS =============
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own recent comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND created_at > now() - interval '15 minutes'
  );

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============= TAGS =============
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can create tags
CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============= PROJECT_TAGS =============
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project tags viewable by everyone"
  ON public.project_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Project owners can manage tags"
  ON public.project_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_tags.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can remove tags"
  ON public.project_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_tags.project_id
      AND owner_id = auth.uid()
    )
  );

-- ============= PROJECT_MEDIA =============
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media viewable by everyone"
  ON public.project_media FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Project owners can add media"
  ON public.project_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_media.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete media"
  ON public.project_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_media.project_id
      AND owner_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKETS (run via Supabase Dashboard SQL editor)
-- ============================================
-- Note: Buckets must be created via dashboard or API first, then policies applied:

-- Bucket: 'project-assets'
-- INSERT policy:
-- CREATE POLICY "Auth users can upload to own folder"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (
--     bucket_id = 'project-assets'
--     AND (storage.foldername(name))[1] = auth.uid()::text
--     AND storage.extension(name) = ANY(ARRAY['jpg','jpeg','png','gif','webp','pdf'])
--   );

-- SELECT policy:
-- CREATE POLICY "Public can view assets"
--   ON storage.objects FOR SELECT
--   TO anon, authenticated
--   USING (bucket_id = 'project-assets');

-- DELETE policy:
-- CREATE POLICY "Owners can delete their assets"
--   ON storage.objects FOR DELETE TO authenticated
--   USING (
--     bucket_id = 'project-assets'
--     AND (storage.foldername(name))[1] = auth.uid()::text
--   );
