
-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Replace handle_new_user to also create role and role-specific profiles from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, country, linkedin_url, github_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'linkedin_url',
    NEW.raw_user_meta_data->>'github_url'
  );

  -- Create user role
  _role := NEW.raw_user_meta_data->>'role';
  IF _role IS NOT NULL AND _role IN ('graduate', 'mentor', 'employer') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role::app_role);

    -- Create role-specific profile
    IF _role = 'graduate' THEN
      INSERT INTO public.graduate_profiles (user_id, area_of_interest, programming_languages, skill_level)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'area_of_interest',
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(
            CASE WHEN NEW.raw_user_meta_data->'programming_languages' IS NOT NULL 
                 AND jsonb_typeof(NEW.raw_user_meta_data->'programming_languages') = 'array'
            THEN NEW.raw_user_meta_data->'programming_languages' 
            ELSE '[]'::jsonb END
          )),
          '{}'::text[]
        ),
        COALESCE(NEW.raw_user_meta_data->>'skill_level', 'Beginner')
      );
    ELSIF _role = 'mentor' THEN
      INSERT INTO public.mentor_profiles (user_id, years_of_experience, specializations)
      VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'years_of_experience')::int, 0),
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(
            CASE WHEN NEW.raw_user_meta_data->'specializations' IS NOT NULL
                 AND jsonb_typeof(NEW.raw_user_meta_data->'specializations') = 'array'
            THEN NEW.raw_user_meta_data->'specializations'
            ELSE '[]'::jsonb END
          )),
          '{}'::text[]
        )
      );
    ELSIF _role = 'employer' THEN
      INSERT INTO public.employer_profiles (user_id, company_name, industry, company_website)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
        NEW.raw_user_meta_data->>'industry',
        NEW.raw_user_meta_data->>'company_website'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
