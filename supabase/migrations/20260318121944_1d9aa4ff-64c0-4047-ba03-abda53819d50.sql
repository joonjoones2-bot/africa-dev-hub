-- Insert missing role for existing user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('eccc0c32-b409-4bc8-b620-6ed1546732ad', 'graduate')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create the trigger for new user signups (was missing!)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create notification triggers (were also missing)
CREATE OR REPLACE TRIGGER on_mentorship_request
  AFTER INSERT ON public.mentorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_mentorship_request();

CREATE OR REPLACE TRIGGER on_project_submission
  AFTER INSERT ON public.project_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_project_submission();

CREATE OR REPLACE TRIGGER on_completion_verified
  AFTER UPDATE ON public.project_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_completion_verified();

CREATE OR REPLACE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();