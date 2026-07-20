-- 004: Harden RLS and block IDOR-style column changes at the database layer.
-- Run in Supabase SQL Editor or: npx tsx scripts/apply-migrations.ts

-- ── Immutable design ownership + payment status ─────────────────────────────
create or replace function public.guard_design_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.user_id is distinct from old.user_id then
      raise exception 'Cannot change design owner';
    end if;
    if new.is_paid is distinct from old.is_paid then
      raise exception 'Cannot change payment status';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if auth.uid() is null then
      raise exception 'Authentication required';
    end if;
    if new.user_id is distinct from auth.uid() then
      raise exception 'Design must belong to authenticated user';
    end if;
    new.is_paid := false;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_design_columns on public.designs;
create trigger guard_design_columns
  before insert or update on public.designs
  for each row execute function public.guard_design_columns();

-- ── Profile role cannot be self-escalated ───────────────────────────────────
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id then
      raise exception 'Cannot change profile id';
    end if;
    if new.role is distinct from old.role and not public.is_admin() then
      raise exception 'Cannot change role';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ── Designs: granular RLS (replace broad FOR ALL policy) ───────────────────
drop policy if exists "Users manage own designs" on public.designs;

drop policy if exists "Users select own designs" on public.designs;
create policy "Users select own designs"
  on public.designs for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own designs" on public.designs;
create policy "Users insert own designs"
  on public.designs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own designs" on public.designs;
create policy "Users update own designs"
  on public.designs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own designs" on public.designs;
create policy "Users delete own designs"
  on public.designs for delete
  using (auth.uid() = user_id);

-- ── Payments: users can only read their own records ─────────────────────────
drop policy if exists "Users read own payments" on public.payments;
create policy "Users read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- ── Storage: snapshots scoped to uploader folder ────────────────────────────
drop policy if exists "Authenticated users upload snapshots" on storage.objects;
drop policy if exists "Authenticated users delete snapshots" on storage.objects;
drop policy if exists "Users upload own snapshots" on storage.objects;
drop policy if exists "Users delete own snapshots" on storage.objects;
drop policy if exists "Admins manage all snapshots" on storage.objects;

create policy "Users upload own snapshots"
  on storage.objects for insert
  with check (
    bucket_id = 'snapshots'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own snapshots"
  on storage.objects for delete
  using (
    bucket_id = 'snapshots'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins manage all snapshots"
  on storage.objects for all
  using (bucket_id = 'snapshots' and public.is_admin())
  with check (bucket_id = 'snapshots' and public.is_admin());
