-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Allow authenticated users to insert notifications (for triggers/functions)
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger: notify on new mentorship request
CREATE OR REPLACE FUNCTION public.notify_mentorship_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message)
  VALUES (
    NEW.mentor_id,
    'New Mentorship Request',
    'A graduate has requested your mentorship.'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_mentorship_request
  AFTER INSERT ON public.mentorship_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_mentorship_request();

-- Trigger: notify on project completion submission
CREATE OR REPLACE FUNCTION public.notify_project_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _creator_id uuid;
BEGIN
  SELECT created_by INTO _creator_id FROM public.projects WHERE id = NEW.project_id;
  IF _creator_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (_creator_id, 'New Project Submission', 'A graduate has submitted work for your project.');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_project_submission
  AFTER INSERT ON public.project_completions
  FOR EACH ROW EXECUTE FUNCTION public.notify_project_submission();

-- Trigger: notify graduate when completion is verified
CREATE OR REPLACE FUNCTION public.notify_completion_verified()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status = 'submitted' AND NEW.status = 'verified' THEN
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (NEW.graduate_id, 'Project Verified!', 'A mentor has verified your project completion. Check your portfolio!');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_completion_verified
  AFTER UPDATE ON public.project_completions
  FOR EACH ROW EXECUTE FUNCTION public.notify_completion_verified();

-- Trigger: notify on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message)
  VALUES (NEW.receiver_id, 'New Message', 'You have a new message.');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();