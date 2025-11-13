-- Create function to auto-assign registered_reader role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically assign 'registered_reader' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'registered_reader');
  
  RETURN NEW;
END;
$$;

-- Create trigger to execute the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();