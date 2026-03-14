
-- Skill badges: predefined badges that graduates can earn
CREATE TABLE public.skill_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'award',
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'Beginner',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skill badges viewable by everyone" ON public.skill_badges
  FOR SELECT USING (true);

CREATE POLICY "Only mentors/employers can create badges" ON public.skill_badges
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'employer')
  );

-- Project completions: verified work with mentor attestation
CREATE TABLE public.project_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  graduate_id uuid NOT NULL,
  mentor_id uuid,
  status text NOT NULL DEFAULT 'submitted',
  submission_url text,
  demo_url text,
  summary text,
  mentor_rating integer CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
  mentor_comment text,
  code_quality_score integer CHECK (code_quality_score >= 1 AND code_quality_score <= 5),
  communication_score integer CHECK (communication_score >= 1 AND communication_score <= 5),
  problem_solving_score integer CHECK (problem_solving_score >= 1 AND problem_solving_score <= 5),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Completions viewable by everyone" ON public.project_completions
  FOR SELECT USING (true);

CREATE POLICY "Graduates can submit completions" ON public.project_completions
  FOR INSERT WITH CHECK (auth.uid() = graduate_id);

CREATE POLICY "Mentors can verify completions" ON public.project_completions
  FOR UPDATE USING (auth.uid() = mentor_id);

CREATE POLICY "Graduates can update own submissions" ON public.project_completions
  FOR UPDATE USING (auth.uid() = graduate_id AND status = 'submitted');

-- Earned badges: badges awarded to graduates
CREATE TABLE public.earned_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  graduate_id uuid NOT NULL,
  badge_id uuid REFERENCES public.skill_badges(id) ON DELETE CASCADE NOT NULL,
  awarded_by uuid,
  project_completion_id uuid REFERENCES public.project_completions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(graduate_id, badge_id)
);

ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Earned badges viewable by everyone" ON public.earned_badges
  FOR SELECT USING (true);

CREATE POLICY "Mentors can award badges" ON public.earned_badges
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'employer')
  );

-- Add trigger for updated_at on project_completions
CREATE TRIGGER update_project_completions_updated_at
  BEFORE UPDATE ON public.project_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
