-- Fix infinite recursion in profiles RLS policies.
-- Admin checks must use a security definer function instead of querying profiles directly.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products for all
  using (public.is_admin());

drop policy if exists "Published templates are publicly readable" on public.templates;
create policy "Published templates are publicly readable"
  on public.templates for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins manage templates" on public.templates;
create policy "Admins manage templates"
  on public.templates for all
  using (public.is_admin());

drop policy if exists "Admins read all designs" on public.designs;
create policy "Admins read all designs"
  on public.designs for select
  using (public.is_admin());

drop policy if exists "Admins upload models" on storage.objects;
create policy "Admins upload models"
  on storage.objects for insert
  with check (bucket_id = 'models' and public.is_admin());

drop policy if exists "Admins upload products" on storage.objects;
create policy "Admins upload products"
  on storage.objects for insert
  with check (bucket_id = 'products' and public.is_admin());
