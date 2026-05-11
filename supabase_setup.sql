-- ================================================================
-- 나만의 작은 정원 — Supabase 초기 설정 SQL
-- Supabase 대시보드 > SQL Editor 에서 아래 전체를 실행하세요.
-- ================================================================


-- ──────────────────────────────────────
-- 1. profiles 테이블
-- ──────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null,
  name        text not null,
  birthdate   date not null,
  agreed_at   timestamptz not null default now()
);

-- 중복 아이디 방지
create unique index if not exists profiles_username_idx on public.profiles(username);


-- ──────────────────────────────────────
-- 2. garden_states 테이블
-- ──────────────────────────────────────
create table if not exists public.garden_states (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  selected_plant   text,
  month_year       text not null default '',
  completed_dates  jsonb not null default '[]',
  daily_missions   jsonb not null default '{}',
  plant_history    jsonb not null default '[]',
  updated_at       timestamptz not null default now(),
  unique(user_id)
);


-- ──────────────────────────────────────
-- 3. updated_at 자동 갱신 트리거
-- ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists garden_states_updated_at on public.garden_states;
create trigger garden_states_updated_at
  before update on public.garden_states
  for each row execute function public.set_updated_at();


-- ──────────────────────────────────────
-- 4. Row Level Security (RLS) 활성화
-- ──────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.garden_states enable row level security;


-- ──────────────────────────────────────
-- 5. profiles RLS 정책
-- ──────────────────────────────────────
drop policy if exists "profiles: 본인만 조회" on public.profiles;
create policy "profiles: 본인만 조회"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: 본인만 삽입" on public.profiles;
create policy "profiles: 본인만 삽입"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles: 본인만 수정" on public.profiles;
create policy "profiles: 본인만 수정"
  on public.profiles for update
  using (auth.uid() = id);


-- ──────────────────────────────────────
-- 6. garden_states RLS 정책
-- ──────────────────────────────────────
drop policy if exists "garden_states: 본인만 조회" on public.garden_states;
create policy "garden_states: 본인만 조회"
  on public.garden_states for select
  using (auth.uid() = user_id);

drop policy if exists "garden_states: 본인만 삽입" on public.garden_states;
create policy "garden_states: 본인만 삽입"
  on public.garden_states for insert
  with check (auth.uid() = user_id);

drop policy if exists "garden_states: 본인만 수정" on public.garden_states;
create policy "garden_states: 본인만 수정"
  on public.garden_states for update
  using (auth.uid() = user_id);

drop policy if exists "garden_states: 본인만 삭제" on public.garden_states;
create policy "garden_states: 본인만 삭제"
  on public.garden_states for delete
  using (auth.uid() = user_id);


-- ──────────────────────────────────────
-- 7. 신규 유저 생성 시 profiles 자동 삽입 트리거
--    (이메일 인증 전이라도 동작하도록 security definer 사용)
-- ──────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, name, birthdate, agreed_at)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'name',
    (new.raw_user_meta_data->>'birthdate')::date,
    now()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ──────────────────────────────────────
-- 8. 아이디로 이메일 조회 함수 (로그인용)
--    security definer: RLS 우회하여 이메일 반환
-- ──────────────────────────────────────
-- ──────────────────────────────────────
-- 9. daily_proofs 테이블 (미션 인증샷)
-- ──────────────────────────────────────
create table if not exists public.daily_proofs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  date_str     text not null,
  photo_url    text,
  mission_text text not null default '',
  created_at   timestamptz not null default now(),
  unique(user_id, date_str)
);

alter table public.daily_proofs enable row level security;

drop policy if exists "daily_proofs: 본인만 조회" on public.daily_proofs;
create policy "daily_proofs: 본인만 조회"
  on public.daily_proofs for select using (auth.uid() = user_id);

drop policy if exists "daily_proofs: 본인만 삽입" on public.daily_proofs;
create policy "daily_proofs: 본인만 삽입"
  on public.daily_proofs for insert with check (auth.uid() = user_id);

drop policy if exists "daily_proofs: 본인만 수정" on public.daily_proofs;
create policy "daily_proofs: 본인만 수정"
  on public.daily_proofs for update using (auth.uid() = user_id);

drop policy if exists "daily_proofs: 본인만 삭제" on public.daily_proofs;
create policy "daily_proofs: 본인만 삭제"
  on public.daily_proofs for delete using (auth.uid() = user_id);


-- ──────────────────────────────────────
-- 10. Storage 버킷 (인증샷 이미지)
--     public 버킷 + 사용자별 폴더 RLS
-- ──────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mission-photos', 'mission-photos', true, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) on conflict (id) do nothing;

drop policy if exists "mission-photos: 본인만 업로드" on storage.objects;
create policy "mission-photos: 본인만 업로드"
  on storage.objects for insert
  with check (bucket_id = 'mission-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "mission-photos: 누구나 조회" on storage.objects;
create policy "mission-photos: 누구나 조회"
  on storage.objects for select
  using (bucket_id = 'mission-photos');

drop policy if exists "mission-photos: 본인만 덮어쓰기" on storage.objects;
create policy "mission-photos: 본인만 덮어쓰기"
  on storage.objects for update
  using (bucket_id = 'mission-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "mission-photos: 본인만 삭제" on storage.objects;
create policy "mission-photos: 본인만 삭제"
  on storage.objects for delete
  using (bucket_id = 'mission-photos' and auth.uid()::text = (storage.foldername(name))[1]);


-- ──────────────────────────────────────
-- 11. 아이디로 이메일 조회 함수 (로그인용)
-- ──────────────────────────────────────
create or replace function public.get_email_by_username(p_username text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_email text;
begin
  select u.email into v_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username = p_username;
  return v_email;
end;
$$;
