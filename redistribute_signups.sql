-- ============================================================================
--  가입일 재분배 + 신규 회원 추가 스크립트
--  실행 위치: Supabase 대시보드 > SQL Editor
--
--  목적
--   1) 5/22 등 특정 날짜에 몰린 가입을 2026-05-11 ~ 2026-06-03(24일) 사이에
--      고르게 재분배
--   2) 신규 회원 14명 추가 → 총 35명
--
--  대상 테이블
--   - auth.users   (가입 통계 기준이 되는 created_at)
--   - public.profiles (agreed_at)
--   handle_new_user 트리거가 auth.users INSERT 시 profiles 를 자동 생성합니다.
--
--  주의
--   - 비밀번호 해시에 pgcrypto 의 crypt()/gen_salt() 를 사용합니다.
--     함수를 못 찾는다는 오류가 나면 먼저 아래를 실행하세요:
--       create extension if not exists pgcrypto with schema extensions;
--   - 한 번 실행하면 신규 14명이 INSERT 됩니다. 재실행 시 username 중복으로
--     막히므로(아래 on conflict 처리) 신규 추가는 1회만 일어납니다.
-- ============================================================================

begin;

-- ──────────────────────────────────────────────────────────────────────────
-- 1. 신규 회원 14명 추가 (auth.users → 트리거가 profiles 자동 생성)
--    이메일 인증 완료 상태, 공통 비밀번호: garden1234
-- ──────────────────────────────────────────────────────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  lower(v.username) || '@garden.local',
  crypt('garden1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('username', v.username, 'name', v.name, 'birthdate', v.birthdate),
  '', '', '', ''
from (values
  ('minseo_k',  '김민서', '2005-03-14'),
  ('jiwoo88',   '이지우', '2006-08-22'),
  ('hayoon_2',  '박하윤', '2004-11-09'),
  ('seojun07',  '최서준', '2007-01-30'),
  ('yerin_lee', '이예린', '2005-06-17'),
  ('doyeon_99', '정도연', '2003-09-25'),
  ('taemin21',  '강태민', '2006-12-03'),
  ('sora_park', '박소라', '2004-02-19'),
  ('junho_77',  '윤준호', '2005-07-11'),
  ('nayeon_k',  '김나연', '2007-04-28'),
  ('hyunwoo3',  '조현우', '2003-10-05'),
  ('dasom_99',  '한다솜', '2006-05-23'),
  ('woojin_05', '임우진', '2004-08-14'),
  ('chaewon_2', '신채원', '2005-12-09')
) as v(username, name, birthdate)
-- 이미 같은 username 이 profiles 에 있으면 추가하지 않음(재실행 안전장치)
where not exists (
  select 1 from public.profiles p where p.username = v.username
);

-- ──────────────────────────────────────────────────────────────────────────
-- 2. 전체 회원(기존 21 + 신규 14 = 35명)의 가입 시각을
--    2026-05-11 ~ 2026-06-03 사이에 재분배
--    - 24일 중 "가입이 일어난 날"을 랜덤 10일만 고르고, 회원을 그 날들에만 배치
--      → 나머지 14일 정도는 가입자 0명 (평균적으로)
--    - 시각: 02:00 ~ 22:00 사이 랜덤(자연스럽게)
-- ──────────────────────────────────────────────────────────────────────────
with active_days as (
  -- 24일(0~23) 중 랜덤하게 10일만 "가입 발생일"로 선택
  select day_off, row_number() over () as k
  from (
    select gs.day_off
    from generate_series(0, 23) as gs(day_off)
    order by random()
    limit 10
  ) s
),
picks as (
  -- 각 회원을 10개의 가입일 중 하나에 랜덤 배정
  select id, 1 + floor(random() * 10)::int as k
  from public.profiles
),
assigned as (
  select
    pk.id,
    '2026-05-11 00:00:00+00'::timestamptz
      + (ad.day_off * interval '1 day')
      + (interval '1 hour' * (2 + random() * 20))
      as ts
  from picks pk
  join active_days ad on ad.k = pk.k
)
update public.profiles p
set agreed_at = a.ts
from assigned a
where p.id = a.id;

-- profiles.agreed_at 에 맞춰 auth.users 의 가입 시각도 동기화
update auth.users u
set created_at         = p.agreed_at,
    updated_at         = p.agreed_at,
    email_confirmed_at = p.agreed_at
from public.profiles p
where u.id = p.id;

commit;

-- ──────────────────────────────────────────────────────────────────────────
-- 3. 결과 확인 — 날짜별 가입자 수 분포 (0명인 날도 모두 표시)
-- ──────────────────────────────────────────────────────────────────────────
select
  d::date                  as signup_date,
  count(p.id)              as signups
from generate_series(date '2026-05-11', date '2026-06-03', interval '1 day') as d
left join public.profiles p
  on (p.agreed_at at time zone 'UTC')::date = d::date
group by d
order by d;

-- 가입자 0명인 날이 며칠인지 요약
select
  count(*)                                  as 전체일수,
  count(*) filter (where signups = 0)       as 가입자0명_일수,
  count(*) filter (where signups > 0)       as 가입발생_일수
from (
  select d::date as day, count(p.id) as signups
  from generate_series(date '2026-05-11', date '2026-06-03', interval '1 day') as d
  left join public.profiles p
    on (p.agreed_at at time zone 'UTC')::date = d::date
  group by d
) t;
