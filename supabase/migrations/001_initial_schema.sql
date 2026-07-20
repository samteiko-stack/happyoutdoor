-- Happy Outdoor — Supabase schema
-- Run this in the Supabase SQL Editor or via `supabase db push`

-- ── Profiles (extends auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role text not null default 'USER' check (role in ('USER', 'ADMIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

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

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', null),
    'USER'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Categories ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select using (true);

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin());

-- ── Products ───────────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  price double precision not null default 0,
  affiliate_link text,
  image_url text,
  top_view_image_url text,
  model_url text,
  width_cm int not null default 50,
  height_cm int not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select using (true);

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin());

-- ── Templates ──────────────────────────────────────────────────────────────
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  thumbnail_url text,
  balcony_width_cm int not null default 300,
  balcony_height_cm int not null default 200,
  layout_data text not null default '[]',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.templates enable row level security;

create policy "Published templates are publicly readable"
  on public.templates for select
  using (is_published = true or public.is_admin());

create policy "Admins manage templates"
  on public.templates for all
  using (public.is_admin());

-- ── Designs ────────────────────────────────────────────────────────────────
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My Balcony Design',
  template_id uuid references public.templates(id) on delete set null,
  balcony_width_cm int not null default 300,
  balcony_height_cm int not null default 200,
  layout_data text not null default '[]',
  thumbnail_url text,
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.designs enable row level security;

create policy "Users manage own designs"
  on public.designs for all
  using (auth.uid() = user_id);

create policy "Admins read all designs"
  on public.designs for select
  using (public.is_admin());

-- ── Payments ───────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  design_id uuid not null references public.designs(id) on delete cascade,
  amount int not null,
  currency text not null default 'usd',
  stripe_session_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- ── Storage buckets ────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('models', 'models', true),
  ('snapshots', 'snapshots', true),
  ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public read models"
  on storage.objects for select
  using (bucket_id = 'models');

create policy "Admins upload models"
  on storage.objects for insert
  with check (bucket_id = 'models' and public.is_admin());

create policy "Public read snapshots"
  on storage.objects for select
  using (bucket_id = 'snapshots');

create policy "Authenticated users upload snapshots"
  on storage.objects for insert
  with check (bucket_id = 'snapshots' and auth.uid() is not null);

create policy "Public read products"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Admins upload products"
  on storage.objects for insert
  with check (bucket_id = 'products' and public.is_admin());

-- ── Updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger templates_updated_at before update on public.templates
  for each row execute function public.set_updated_at();
create trigger designs_updated_at before update on public.designs
  for each row execute function public.set_updated_at();
