-- Storage policies for snapshot uploads (idempotent)

insert into storage.buckets (id, name, public)
values
  ('models', 'models', true),
  ('snapshots', 'snapshots', true),
  ('products', 'products', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read snapshots'
  ) then
    create policy "Public read snapshots"
      on storage.objects for select
      using (bucket_id = 'snapshots');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users upload snapshots'
  ) then
    create policy "Authenticated users upload snapshots"
      on storage.objects for insert
      with check (bucket_id = 'snapshots' and auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users delete snapshots'
  ) then
    create policy "Authenticated users delete snapshots"
      on storage.objects for delete
      using (bucket_id = 'snapshots' and auth.uid() is not null);
  end if;
end $$;
