-- ============================================================================
--  활동 데이터 채우기 (신규 회원 전용 · 현실적 버전)
--  실행 위치: Supabase 대시보드 > SQL Editor
--  ※ 반드시 redistribute_signups.sql 을 먼저 실행한 뒤 실행하세요.
--    (신규 회원은 email 이 '...@garden.local' 인 것으로 식별합니다)
--
--  설계(현실 반영)
--   - 기존 회원 데이터는 건드리지 않음
--   - 신규 14명 중 약 20%만 "활동 유저"
--   - 활동 유저도 매일이 아니라 가끔(주 1~2회 수준)만 미션 완료
--   - 비활동 유저: 절반은 식물만 골라두고 완료 0건, 절반은 가입만 하고 방치
--
--  앱 로직과 동일하게 맞춘 부분
--   - 날짜별 미션 = parseInt(YYYYMMDD) % 30  (MISSIONS 배열 순서)
-- ============================================================================

do $$
declare
  m_text text[] := array[
    '창문 열고 5분 환기하기',
    '10분 동네 산책하기',
    '물 두 컵 마시기',
    '좋아하는 노래 한 곡 듣기',
    '스트레칭 5분하기',
    '햇빛 쬐기 5분',
    '오늘 기분 한 줄 일기 쓰기',
    '좋아하는 영상 하나 보기',
    '방 청소 5분하기',
    '오늘 잘한 일 하나 떠올리기',
    '깊게 숨쉬기 10회',
    '좋아하는 책 한 페이지 읽기',
    '가족이나 친구에게 안부 문자 보내기',
    '따뜻한 음료 한 잔 마시기',
    '좋아하는 음식 하나 해먹기',
    '오늘 먹은 것 기록하기',
    '핸드폰 30분 내려놓기',
    '좋아하는 냄새 맡기',
    '밖을 내다보며 하늘 구경하기',
    '좋아하는 사진 찾아보기',
    '간단한 낙서 또는 그림 그리기',
    '오늘 하루를 숫자로 점수 주기',
    '내가 좋아하는 것 5가지 쓰기',
    '발코니나 마당에 잠깐 나가기',
    '오늘 가장 힘든 것 한 줄 적기',
    '유튜브에서 자연 소리 틀어놓기',
    '셀카 한 장 찍기',
    '내가 잘하는 것 하나 생각하기',
    '감사한 것 3가지 쓰기',
    '잠들기 전 핸드폰 없이 10분 보내기'
  ];
  m_desc text[] := array[
    '신선한 공기가 기분을 환기시켜 줘요. 창문을 열고 깊게 숨을 쉬어보세요.',
    '가볍게 집 주변을 한 바퀴 돌아보세요. 운동화만 신으면 돼요.',
    '우리 몸은 물이 필요해요. 시원한 물 두 컵을 천천히 마셔보세요.',
    '기분 좋은 노래를 틀어놓고 잠시 음악에 집중해 보세요.',
    '앉아있던 몸을 풀어줘요. 목, 어깨, 허리를 천천히 스트레칭하세요.',
    '창가나 문 앞에 서서 햇볕을 쬐어보세요. 비타민D가 기분을 올려줘요.',
    '"오늘은 ___한 기분이었다." 딱 한 문장이면 충분해요.',
    '유튜브, 드라마, 뭐든 좋아요. 30분이라도 즐거운 시간을 가져보세요.',
    '타이머를 5분 맞추고 빠르게 정리해보세요. 공간이 깨끗해지면 마음도 가벼워져요.',
    '아무리 작아도 괜찮아요. 오늘 내가 한 일 중 잘한 것 하나를 찾아보세요.',
    '코로 4초 들이쉬고, 4초 멈추고, 입으로 4초 내쉬어요. 10번 반복해보세요.',
    '만화책, 소설, 뭐든 좋아요. 딱 한 페이지만 읽어보세요.',
    '"잘 지내?" 한 마디도 충분해요. 연결되어 있다는 느낌이 따뜻해요.',
    '따뜻한 차나 코코아를 천천히 마시며 잠깐 쉬어가요.',
    '간단한 거 괜찮아요. 라면이라도 직접 끓여서 먹으면 성취감이 달라요.',
    '무엇을 먹었는지 간단히 적어보세요. 나를 돌보는 첫 번째 단계예요.',
    '타이머를 맞추고 핸드폰 없이 지내봐요. 책, 낙서, 멍 때리기 모두 좋아요.',
    '향초, 향수, 책 냄새... 좋아하는 향을 찾아 잠시 즐겨보세요.',
    '창밖을 바라보며 구름이나 하늘을 3분만 바라봐요. 세상은 계속 움직이고 있어요.',
    '행복했던 순간의 사진, 예쁜 사진들을 찾아보고 잠시 그 기억에 머물러봐요.',
    '잘 그려야 할 필요 없어요. 그냥 손 가는 대로 그려보세요.',
    '10점 만점에 몇 점? 낮아도 괜찮아요. 그냥 생각해보는 것만으로도 충분해요.',
    '음식이든 취미든 사람이든, 나를 행복하게 하는 것 5가지를 적어보세요.',
    '딱 1분이라도 실내 밖 공기를 마셔보세요. 작은 변화가 큰 차이를 만들어요.',
    '혼자 속으로 담아두지 말고, 종이에 한 줄로 적어보세요. 꺼내면 조금 가벼워져요.',
    '빗소리, 파도소리, 숲소리... 10분만 들어봐요. 자연이 곁에 있는 것 같아요.',
    '보정 없어도 괜찮아요. 오늘의 나를 기록해봐요.',
    '요리, 게임, 잠 자는 것 뭐든 좋아요. 나만의 특기를 하나 떠올려봐요.',
    '"오늘 따뜻했다", "밥이 맛있었다"처럼 아주 사소한 것도 감사할 수 있어요.',
    '자기 전 핸드폰을 잠시 내려놓고, 오늘 하루를 조용히 정리해봐요.'
  ];
  plants  text[] := array['apple','cherry','sunflower','rose','lavender'];
  end_d   date   := date '2026-06-03';

  rec     record;
  d       date;
  start_d date;
  last_d  date;
  comp    jsonb;
  miss    jsonb;
  ds      text;
  midx    int;
  plant   text;
  prob    numeric;
begin
  for rec in
    select p.id, p.agreed_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where u.email like '%@garden.local'
  loop
    -- ── 20% 만 활동 유저 ──
    if random() < 0.20 then
      plant   := plants[1 + floor(random() * 5)::int];
      start_d := greatest((rec.agreed_at at time zone 'UTC')::date, date '2026-05-11');
      prob    := (1.0 + random()) / 7.0;     -- 주 1~2회 수준 (≈0.14~0.29/일)
      comp := '[]'::jsonb;
      miss := '{}'::jsonb;
      last_d := start_d;

      d := start_d;
      while d <= end_d loop
        if random() < prob then
          ds   := to_char(d, 'YYYY-MM-DD');
          midx := (replace(ds, '-', '')::bigint % 30)::int;
          comp := comp || to_jsonb(ds);
          miss := miss || jsonb_build_object(
                    ds, jsonb_build_object('text', m_text[midx + 1], 'desc', m_desc[midx + 1]));
          last_d := d;
        end if;
        d := d + 1;
      end loop;

      -- 활동 유저인데 우연히 0건이면 최소 1건 보장
      if jsonb_array_length(comp) = 0 then
        ds   := to_char(start_d, 'YYYY-MM-DD');
        midx := (replace(ds, '-', '')::bigint % 30)::int;
        comp := jsonb_build_array(ds);
        miss := jsonb_build_object(
                  ds, jsonb_build_object('text', m_text[midx + 1], 'desc', m_desc[midx + 1]));
        last_d := start_d;
      end if;

      insert into public.garden_states
        (user_id, selected_plant, month_year, completed_dates, daily_missions, plant_history, updated_at)
      values
        (rec.id, plant, to_char(start_d, 'YYYY-MM-DD'), comp, miss, '[]'::jsonb,
         (last_d)::timestamptz + interval '1 hour' * (9 + random() * 12))
      on conflict (user_id) do update set
        selected_plant  = excluded.selected_plant,
        month_year      = excluded.month_year,
        completed_dates = excluded.completed_dates,
        daily_missions  = excluded.daily_missions;

      -- 완료일 중 일부(약 40%)에만 인증샷(사진 없이 텍스트만)
      insert into public.daily_proofs (user_id, date_str, photo_url, mission_text, created_at)
      select rec.id,
             e.ds,
             null,
             m_text[(replace(e.ds, '-', '')::bigint % 30)::int + 1],
             (e.ds::date)::timestamptz + interval '1 hour' * (8 + random() * 13)
      from (select jsonb_array_elements_text(comp) as ds) e
      where random() < 0.40
      on conflict (user_id, date_str) do nothing;

    -- ── 비활동 유저(80%) ──
    else
      -- 절반은 식물만 골라두고 완료 0건, 나머지 절반은 가입만 하고 방치(상태 없음)
      if random() < 0.5 then
        plant := plants[1 + floor(random() * 5)::int];
        insert into public.garden_states
          (user_id, selected_plant, month_year, completed_dates, daily_missions, plant_history, updated_at)
        values
          (rec.id, plant,
           to_char(greatest((rec.agreed_at at time zone 'UTC')::date, date '2026-05-11'), 'YYYY-MM-DD'),
           '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, rec.agreed_at)
        on conflict (user_id) do update set
          selected_plant  = excluded.selected_plant,
          completed_dates = '[]'::jsonb,
          daily_missions  = '{}'::jsonb;
      end if;
    end if;
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────────────────
-- 결과 확인: 신규 회원 활동 요약
-- ──────────────────────────────────────────────────────────────────────────
select
  count(*)                                                          as 신규회원수,
  count(*) filter (where coalesce(c.cnt, 0) > 0)                    as 활동유저수,
  round(100.0 * count(*) filter (where coalesce(c.cnt, 0) > 0)
        / nullif(count(*), 0), 1)                                   as 활동비율_pct,
  round(avg(c.cnt) filter (where coalesce(c.cnt, 0) > 0), 1)        as 활동유저_평균완료일
from public.profiles p
join auth.users u on u.id = p.id
left join lateral (
  select jsonb_array_length(gs.completed_dates) as cnt
  from public.garden_states gs where gs.user_id = p.id
) c on true
where u.email like '%@garden.local';
