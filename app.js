'use strict';

// ══════════════════════════════════════════════════════════
// Supabase 초기화
// supabase.com 에서 프로젝트 생성 후 아래 두 값을 교체하세요.
// ══════════════════════════════════════════════════════════
const SUPABASE_URL      = 'https://pmuuorqlwjbclxpgffmc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtdXVvcnFsd2piY2x4cGdmZm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTQ2OTcsImV4cCI6MjA5NDA3MDY5N30.TXCvfvo6sVkZAzb8SOPYKYCkiZ2TpcOyFPUwVqH-ct4';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── 격려 메시지 ──
const ENCOURAGE_MESSAGES = [
  { emoji: '🌧️', title: '비가 내린 날이에요',     msg: '비가 오는 날엔 식물도 쉬어가요. 내일 다시 시작해봐요.' },
  { emoji: '☁️', title: '흐린 날도 있어요',       msg: '맑은 날만 있을 수는 없어요. 흐린 날도 지나가요.' },
  { emoji: '🌙', title: '오늘은 쉬어가요',         msg: '매일 완벽할 필요는 없어요. 있었다는 것만으로도 충분해요.' },
  { emoji: '🤗', title: '당신은 잘하고 있어요',    msg: '작은 것들이 쌓여서 큰 변화가 돼요. 포기하지 않은 것만으로도 대단해요.' },
  { emoji: '🌸', title: '천천히 가도 괜찮아요',    msg: '빠르게 가는 것보다 꾸준히 가는 게 더 중요해요.' },
  { emoji: '✨', title: '내일이 또 있어요',         msg: '오늘 못 했어도 내일이 기다리고 있어요. 기운 내요!' },
  { emoji: '🍃', title: '식물도 이해해요',          msg: '우리 식물은 당신의 노력을 알고 있어요. 다음에 만나요.' },
  { emoji: '💪', title: '다시 시작하면 돼요',       msg: '중요한 건 넘어졌을 때 다시 일어나는 거예요. 할 수 있어요!' },
  { emoji: '🌿', title: '잠시 쉬어가는 중',        msg: '충분한 휴식이 더 잘 자라게 해요. 오늘은 쉬어도 돼요.' },
  { emoji: '💙', title: '그래도 괜찮아요',          msg: '완벽하지 않아도 괜찮아요. 당신의 속도로 가면 돼요.' },
  { emoji: '🌱', title: '씨앗은 기다려요',          msg: '씨앗은 땅 속에서도 조금씩 자라고 있어요. 당신도 그렇게요.' },
  { emoji: '🫶', title: '스스로를 다독여요',        msg: '오늘 하루 버텨낸 것만으로도 충분히 잘한 거예요.' },
];

// ── 인증 상태 ──
let currentUser = null;   // supabase User 객체
let userProfile = null;   // profiles 테이블 row

// ── 인증샷 캐시 (날짜 → proof row) ──
let proofCache = {};

// ── 버튼 로딩 상태 ──
function setAuthLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading
    ? (btnId === 'login-btn' ? '로그인 중...' : '가입 중...')
    : (btnId === 'login-btn' ? '로그인' : '회원가입');
}

// ── 인증 패널 전환 ──
function showAuthPanel(panel) {
  const isLogin = panel === 'login';
  document.getElementById('login-panel').classList.toggle('hidden', !isLogin);
  document.getElementById('signup-panel').classList.toggle('hidden', isLogin);
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-signup').classList.toggle('active', !isLogin);
  clearAuthErrors();
}

function clearAuthErrors() {
  ['login-error', 'signup-error', 'err-username', 'err-password', 'err-password-confirm',
   'err-name', 'err-birthdate', 'err-privacy'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.add('hidden'); }
  });
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

// ── 로그인 ──
async function handleLoginSubmit() {
  clearAuthErrors();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    document.getElementById('login-error').textContent = '아이디와 비밀번호를 입력해주세요.';
    document.getElementById('login-error').classList.remove('hidden');
    return;
  }

  setAuthLoading('login-btn', true);

  // 아이디로 이메일 조회 (RPC)
  const { data: email, error: rpcError } = await sb.rpc('get_email_by_username', { p_username: username });

  if (rpcError || !email) {
    setAuthLoading('login-btn', false);
    document.getElementById('login-error').textContent = '존재하지 않는 아이디입니다.';
    document.getElementById('login-error').classList.remove('hidden');
    return;
  }

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  setAuthLoading('login-btn', false);

  if (error) {
    const m = error.message;
    const msg = m.includes('Invalid login') || m.includes('invalid_credentials')
      ? '비밀번호가 올바르지 않습니다.'
      : m.includes('Email not confirmed')
      ? '이메일 인증이 필요합니다. Supabase 대시보드에서 이메일 인증을 비활성화해주세요.'
      : m.includes('rate limit') || m.includes('rate_limit')
      ? '잠시 후 다시 시도해주세요. (요청 횟수 초과)'
      : '로그인에 실패했습니다. 다시 시도해주세요.';
    document.getElementById('login-error').textContent = msg;
    document.getElementById('login-error').classList.remove('hidden');
    return;
  }

  await onAuthSuccess(data.user);
}

// ── 회원가입 ──
async function handleSignupSubmit() {
  clearAuthErrors();

  const username      = document.getElementById('signup-username').value.trim();
  const password      = document.getElementById('signup-password').value;
  const pwConfirm     = document.getElementById('signup-password-confirm').value;
  const name          = document.getElementById('signup-name').value.trim();
  const birthdate     = document.getElementById('signup-birthdate').value;
  const privacyAgreed = document.getElementById('signup-privacy').checked;
  // 이메일은 아이디 기반으로 내부 생성 (사용자 입력 불필요)
  const email         = `${username}@garden.app`;

  let hasError = false;

  if (!username) {
    showFieldError('err-username', '아이디를 입력해주세요.'); hasError = true;
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
    showFieldError('err-username', '4~20자, 영문·숫자·밑줄(_)만 사용 가능합니다.'); hasError = true;
  }

  if (!password) {
    showFieldError('err-password', '비밀번호를 입력해주세요.'); hasError = true;
  } else if (password.length < 8) {
    showFieldError('err-password', '비밀번호는 8자 이상이어야 합니다.'); hasError = true;
  }

  if (!pwConfirm) {
    showFieldError('err-password-confirm', '비밀번호를 다시 입력해주세요.'); hasError = true;
  } else if (password !== pwConfirm) {
    showFieldError('err-password-confirm', '비밀번호가 일치하지 않습니다.'); hasError = true;
  }

  if (!name) {
    showFieldError('err-name', '이름을 입력해주세요.'); hasError = true;
  }

  if (!birthdate) {
    showFieldError('err-birthdate', '생년월일을 입력해주세요.'); hasError = true;
  } else if (new Date(birthdate) > new Date()) {
    showFieldError('err-birthdate', '올바른 생년월일을 입력해주세요.'); hasError = true;
  }

  if (!privacyAgreed) {
    showFieldError('err-privacy', '개인정보 처리방침에 동의해주세요.'); hasError = true;
  }

  if (hasError) return;

  setAuthLoading('signup-btn', true);

  // 1) 아이디 중복 확인
  const { data: existing } = await sb
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) {
    setAuthLoading('signup-btn', false);
    showFieldError('err-username', '이미 사용 중인 아이디입니다.');
    return;
  }

  // 2) Supabase Auth 회원가입 (메타데이터에 프로필 정보 포함 → 트리거가 profiles에 자동 저장)
  const { data: authData, error: authError } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { username, name, birthdate },
    },
  });

  setAuthLoading('signup-btn', false);

  if (authError) {
    const m = authError.message;
    const msg = m.includes('already registered') || m.includes('already been registered')
      ? '이미 가입된 이메일입니다.'
      : m.includes('rate limit') || m.includes('rate_limit')
      ? '잠시 후 다시 시도해주세요. (이메일 요청 횟수 초과)'
      : m.includes('invalid email')
      ? '올바른 이메일 형식이 아닙니다.'
      : m.includes('Password should')
      ? '비밀번호는 8자 이상이어야 합니다.'
      : '회원가입에 실패했습니다. 다시 시도해주세요.';
    document.getElementById('signup-error').textContent = msg;
    document.getElementById('signup-error').classList.remove('hidden');
    return;
  }

  await onAuthSuccess(authData.user);
}

// ── 로그아웃 ──
async function logout() {
  await sb.auth.signOut();
  currentUser = null;
  userProfile = null;
  state = { selectedPlant: null, cycleStart: '', completedDates: [], dailyMissions: {}, plantHistory: [] };
  showAuthPanel('login');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  showView('auth-view');
}

// ── 로그인/회원가입 성공 후 공통 처리 ──
async function onAuthSuccess(user) {
  currentUser = user;

  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  userProfile = profile;

  state = { selectedPlant: null, cycleStart: '', completedDates: [], dailyMissions: {}, plantHistory: [] };
  await loadState();
  checkMonthReset();
  renderHomeView();
  showView('home-view');
}

// ── 인증샷 ──

// 이번 달 인증샷 전체 로드 (캘린더 클릭용 캐시)
async function loadMonthProofs(year, month) {
  if (!currentUser) return;
  const my = `${year}-${String(month + 1).padStart(2, '0')}`;
  const { data } = await sb
    .from('daily_proofs')
    .select('*')
    .eq('user_id', currentUser.id)
    .like('date_str', `${my}%`);
  (data || []).forEach(p => { proofCache[p.date_str] = p; });
}

// 현재 사이클 전체 인증샷 로드 (사이클이 두 달에 걸칠 수 있음)
async function loadCycleProofs() {
  if (!currentUser || !state.cycleStart) return;
  const cycleEnd = getCycleEnd();
  const { data } = await sb
    .from('daily_proofs')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('date_str', state.cycleStart)
    .lt('date_str', cycleEnd);
  proofCache = {};
  (data || []).forEach(p => { proofCache[p.date_str] = p; });
}

// 사진 업로드 → Storage → public URL 반환
async function uploadMissionPhoto(file, dateStr) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${currentUser.id}/${dateStr}.${ext}`;
  const { error } = await sb.storage
    .from('mission-photos')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;
  const { data } = sb.storage.from('mission-photos').getPublicUrl(path);
  return data.publicUrl;
}

// daily_proofs 저장 (upsert)
async function saveProof(dateStr, photoUrl, missionText) {
  await sb.from('daily_proofs').upsert(
    { user_id: currentUser.id, date_str: dateStr, photo_url: photoUrl, mission_text: missionText },
    { onConflict: 'user_id,date_str' }
  );
  proofCache[dateStr] = { date_str: dateStr, photo_url: photoUrl, mission_text: missionText };
}

// 인증샷 미리보기
function previewProofPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  document.getElementById('proof-preview-img').src = url;
  document.getElementById('proof-preview-wrap').classList.remove('hidden');
  document.getElementById('proof-upload-area').classList.add('hidden');
}

// 인증샷 제거
function removeProofPhoto() {
  const input = document.getElementById('proof-photo-input');
  input.value = '';
  document.getElementById('proof-preview-wrap').classList.add('hidden');
  document.getElementById('proof-upload-area').classList.remove('hidden');
}

// 캘린더 날짜 클릭 → 인증샷 확인 모달
async function openProofModal(dateStr) {
  let proof = proofCache[dateStr];
  if (!proof) {
    const { data } = await sb
      .from('daily_proofs')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('date_str', dateStr)
      .maybeSingle();
    proof = data;
    if (proof) proofCache[dateStr] = proof;
  }

  const [y, m, d] = dateStr.split('-');
  document.getElementById('proof-modal-date').textContent = `${parseInt(m)}월 ${parseInt(d)}일`;

  // 미션 텍스트: proof 기록 → state 캐시 → 빈 문자열 순으로 폴백
  const missionText = proof?.mission_text
    || state.dailyMissions[dateStr]?.text
    || '';
  const missionEl = document.getElementById('proof-modal-mission');
  if (missionText) {
    missionEl.textContent = missionText;
    missionEl.classList.remove('hidden');
  } else {
    missionEl.classList.add('hidden');
  }

  const photoWrap = document.getElementById('proof-modal-photo-wrap');
  const noPhoto   = document.getElementById('proof-modal-no-photo');

  if (proof?.photo_url) {
    document.getElementById('proof-modal-photo').src = proof.photo_url;
    photoWrap.classList.remove('hidden');
    noPhoto.classList.add('hidden');
  } else {
    photoWrap.classList.add('hidden');
    noPhoto.classList.remove('hidden');
  }

  document.getElementById('proof-modal').classList.remove('hidden');
}

function closeProofModal() {
  document.getElementById('proof-modal').classList.add('hidden');
}

// ── 격려 메시지 모달 ──
let _encourageDateStr = null;

function showEncourageModal(dateStr) {
  _encourageDateStr = dateStr;

  const item = ENCOURAGE_MESSAGES[Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)];
  document.getElementById('encourage-emoji').textContent = item.emoji;
  document.getElementById('encourage-title').textContent = item.title;
  document.getElementById('encourage-msg').textContent   = item.msg;

  const [y, m, d] = dateStr.split('-');
  document.getElementById('encourage-date').textContent = `${parseInt(m)}월 ${parseInt(d)}일`;

  const waterBtn = document.getElementById('water-modal-btn');
  const alreadyDone = state.completedDates.includes(dateStr);
  if (waterBtn) {
    waterBtn.disabled = alreadyDone;
    waterBtn.textContent = alreadyDone ? '💧 이미 물 줬어요' : '💧 물주기';
  }

  document.getElementById('encourage-modal').classList.remove('hidden');
}

function closeEncourageModal() {
  document.getElementById('encourage-modal').classList.add('hidden');
  _encourageDateStr = null;
}

async function waterPlantOnDate() {
  const dateStr = _encourageDateStr;
  if (!dateStr || state.completedDates.includes(dateStr)) return;

  const btn = document.getElementById('water-modal-btn');
  if (btn) { btn.disabled = true; btn.textContent = '물 주는 중...'; }

  const prevStage = getPlantStage();
  state.completedDates.push(dateStr);
  await saveState();
  const newStage = getPlantStage();

  closeEncourageModal();
  await renderGardenView();
  renderCurrentPlantCard();

  const grew = newStage > prevStage;
  document.getElementById('celebrate-emoji').textContent = '💧';
  document.getElementById('celebrate-title').textContent = grew ? '식물이 자랐어요!' : '물을 주었어요!';
  document.getElementById('celebrate-msg').textContent   = grew
    ? '그날 물을 주었더니 쑥쑥 자랐어요! 🌿'
    : '그날의 물이 식물에게 닿았어요. 조금씩 자라고 있어요 💚';
  spawnConfetti();
  document.getElementById('celebrate-overlay').classList.remove('hidden');
}

// ── 물주기 ──
async function waterPlant() {
  const today = todayStr();
  if (state.completedDates.includes(today)) return;

  const btn = document.getElementById('water-btn');
  btn.disabled = true;
  btn.textContent = '물 주는 중...';

  const prevStage = getPlantStage();
  state.completedDates.push(today);
  await saveState();
  const newStage = getPlantStage();

  btn.disabled  = false;
  btn.textContent = '💧 오늘은 물만 줄게요';

  await renderGardenView();
  renderCurrentPlantCard();

  const grew = newStage > prevStage;
  document.getElementById('celebrate-emoji').textContent = '💧';
  document.getElementById('celebrate-title').textContent = grew ? '식물이 자랐어요!' : '물을 주었어요!';
  document.getElementById('celebrate-msg').textContent   = grew
    ? '물을 먹고 쑥쑥 자랐어요! 내일도 잊지 말아요 🌿'
    : '오늘도 식물에게 물을 주었어요. 조금씩 자라고 있어요 💚';
  spawnConfetti();
  document.getElementById('celebrate-overlay').classList.remove('hidden');
}

// ── 개인정보 모달 ──
function showPrivacyModal() {
  document.getElementById('privacy-modal').classList.remove('hidden');
}

function closePrivacyModal() {
  document.getElementById('privacy-modal').classList.add('hidden');
}

// ── 헤더 유저 정보 렌더 ──
function renderHeaderUser() {
  const el = document.getElementById('header-user-area');
  if (!el || !currentUser) return;
  const displayName = userProfile?.name
    || currentUser.user_metadata?.name
    || currentUser.email
    || '';
  el.innerHTML = `
    <div class="header-user">
      <span class="header-user-name">🌱 ${displayName}님</span>
      <button class="header-logout-btn" onclick="logout()">로그아웃</button>
    </div>
  `;
}

// ── 식물 데이터 ──
const PLANTS = {
  apple: {
    name: '사과나무', emoji: '🍎', sub: '빨간 열매가 맺혀요',
    leafColor: '#4CAF50', flowerEmoji: '🌸', fruitEmoji: '🍎',
    stageNames: ['씨앗', '새싹', '성장 중', '꽃망울', '꽃', '열매'],
    skyColors: [
      ['#C8E6FA','#D4EFC4'], ['#B8E4F9','#CDEDC1'], ['#A8DCF8','#C0E9BC'],
      ['#98D4F7','#B8E7B4'], ['#88CCF6','#ADDDB0'], ['#78C4F5','#A5D5A8'],
    ]
  },
  cherry: {
    name: '벚꽃나무', emoji: '🌸', sub: '봄을 물들이는 꽃',
    leafColor: '#81C784', flowerEmoji: '🌸', fruitEmoji: '🍒',
    stageNames: ['씨앗', '새싹', '성장 중', '꽃망울', '벚꽃', '버찌'],
    skyColors: [
      ['#E8D5F0','#F0E4F8'], ['#DCC8EA','#EDD9F4'], ['#D0BCE4','#E8CEEE'],
      ['#C4B0DE','#E3C3E8'], ['#B8A4D8','#DEB8E2'], ['#AC98D2','#D9ADDC'],
    ]
  },
  sunflower: {
    name: '해바라기', emoji: '🌻', sub: '햇빛을 따라 피어나요',
    leafColor: '#66BB6A', flowerEmoji: '🌻', fruitEmoji: '🌻',
    stageNames: ['씨앗', '새싹', '성장 중', '꽃망울', '해바라기', '씨앗 맺음'],
    skyColors: [
      ['#FFF9C4','#FFFDE7'], ['#FFF59D','#FFF9C4'], ['#FFF176','#FFF59D'],
      ['#FFEE58','#FFF176'], ['#FFEB3B','#FFEE58'], ['#FFD740','#FFEB3B'],
    ]
  },
  rose: {
    name: '장미', emoji: '🌹', sub: '붉게 피어나는 아름다움',
    leafColor: '#388E3C', flowerEmoji: '🌹', fruitEmoji: '🌹',
    stageNames: ['씨앗', '새싹', '줄기', '꽃망울', '장미꽃', '만개'],
    skyColors: [
      ['#FFCDD2','#FFE0E0'], ['#EF9A9A','#FFCDD2'], ['#E57373','#EF9A9A'],
      ['#EF5350','#E57373'], ['#F44336','#EF5350'], ['#E53935','#F44336'],
    ]
  },
  lavender: {
    name: '라벤더', emoji: '🪻', sub: '은은한 향기를 퍼뜨려요',
    leafColor: '#7CB342', flowerEmoji: '🪻', fruitEmoji: '🪻',
    stageNames: ['씨앗', '새싹', '성장 중', '꽃망울', '라벤더', '만개'],
    skyColors: [
      ['#E1D5F0','#EDE0F8'], ['#D4C2EA','#E4D5F4'], ['#C7AFE4','#DBCAF0'],
      ['#BA9CDE','#D2BFEC'], ['#AD89D8','#C9B4E8'], ['#A076D2','#C0A9E4'],
    ]
  }
};

// ── 미션 데이터 ──
const MISSIONS = [
  { text: '창문 열고 5분 환기하기', desc: '신선한 공기가 기분을 환기시켜 줘요. 창문을 열고 깊게 숨을 쉬어보세요.' },
  { text: '10분 동네 산책하기', desc: '가볍게 집 주변을 한 바퀴 돌아보세요. 운동화만 신으면 돼요.' },
  { text: '물 두 컵 마시기', desc: '우리 몸은 물이 필요해요. 시원한 물 두 컵을 천천히 마셔보세요.' },
  { text: '좋아하는 노래 한 곡 듣기', desc: '기분 좋은 노래를 틀어놓고 잠시 음악에 집중해 보세요.' },
  { text: '스트레칭 5분하기', desc: '앉아있던 몸을 풀어줘요. 목, 어깨, 허리를 천천히 스트레칭하세요.' },
  { text: '햇빛 쬐기 5분', desc: '창가나 문 앞에 서서 햇볕을 쬐어보세요. 비타민D가 기분을 올려줘요.' },
  { text: '오늘 기분 한 줄 일기 쓰기', desc: '"오늘은 ___한 기분이었다." 딱 한 문장이면 충분해요.' },
  { text: '좋아하는 영상 하나 보기', desc: '유튜브, 드라마, 뭐든 좋아요. 30분이라도 즐거운 시간을 가져보세요.' },
  { text: '방 청소 5분하기', desc: '타이머를 5분 맞추고 빠르게 정리해보세요. 공간이 깨끗해지면 마음도 가벼워져요.' },
  { text: '오늘 잘한 일 하나 떠올리기', desc: '아무리 작아도 괜찮아요. 오늘 내가 한 일 중 잘한 것 하나를 찾아보세요.' },
  { text: '깊게 숨쉬기 10회', desc: '코로 4초 들이쉬고, 4초 멈추고, 입으로 4초 내쉬어요. 10번 반복해보세요.' },
  { text: '좋아하는 책 한 페이지 읽기', desc: '만화책, 소설, 뭐든 좋아요. 딱 한 페이지만 읽어보세요.' },
  { text: '가족이나 친구에게 안부 문자 보내기', desc: '"잘 지내?" 한 마디도 충분해요. 연결되어 있다는 느낌이 따뜻해요.' },
  { text: '따뜻한 음료 한 잔 마시기', desc: '따뜻한 차나 코코아를 천천히 마시며 잠깐 쉬어가요.' },
  { text: '좋아하는 음식 하나 해먹기', desc: '간단한 거 괜찮아요. 라면이라도 직접 끓여서 먹으면 성취감이 달라요.' },
  { text: '오늘 먹은 것 기록하기', desc: '무엇을 먹었는지 간단히 적어보세요. 나를 돌보는 첫 번째 단계예요.' },
  { text: '핸드폰 30분 내려놓기', desc: '타이머를 맞추고 핸드폰 없이 지내봐요. 책, 낙서, 멍 때리기 모두 좋아요.' },
  { text: '좋아하는 냄새 맡기', desc: '향초, 향수, 책 냄새... 좋아하는 향을 찾아 잠시 즐겨보세요.' },
  { text: '밖을 내다보며 하늘 구경하기', desc: '창밖을 바라보며 구름이나 하늘을 3분만 바라봐요. 세상은 계속 움직이고 있어요.' },
  { text: '좋아하는 사진 찾아보기', desc: '행복했던 순간의 사진, 예쁜 사진들을 찾아보고 잠시 그 기억에 머물러봐요.' },
  { text: '간단한 낙서 또는 그림 그리기', desc: '잘 그려야 할 필요 없어요. 그냥 손 가는 대로 그려보세요.' },
  { text: '오늘 하루를 숫자로 점수 주기', desc: '10점 만점에 몇 점? 낮아도 괜찮아요. 그냥 생각해보는 것만으로도 충분해요.' },
  { text: '내가 좋아하는 것 5가지 쓰기', desc: '음식이든 취미든 사람이든, 나를 행복하게 하는 것 5가지를 적어보세요.' },
  { text: '발코니나 마당에 잠깐 나가기', desc: '딱 1분이라도 실내 밖 공기를 마셔보세요. 작은 변화가 큰 차이를 만들어요.' },
  { text: '오늘 가장 힘든 것 한 줄 적기', desc: '혼자 속으로 담아두지 말고, 종이에 한 줄로 적어보세요. 꺼내면 조금 가벼워져요.' },
  { text: '유튜브에서 자연 소리 틀어놓기', desc: '빗소리, 파도소리, 숲소리... 10분만 들어봐요. 자연이 곁에 있는 것 같아요.' },
  { text: '셀카 한 장 찍기', desc: '보정 없어도 괜찮아요. 오늘의 나를 기록해봐요.' },
  { text: '내가 잘하는 것 하나 생각하기', desc: '요리, 게임, 잠 자는 것 뭐든 좋아요. 나만의 특기를 하나 떠올려봐요.' },
  { text: '감사한 것 3가지 쓰기', desc: '"오늘 따뜻했다", "밥이 맛있었다"처럼 아주 사소한 것도 감사할 수 있어요.' },
  { text: '잠들기 전 핸드폰 없이 10분 보내기', desc: '자기 전 핸드폰을 잠시 내려놓고, 오늘 하루를 조용히 정리해봐요.' },
];

// ── 상태 ──
let state = {
  selectedPlant: null,
  cycleStart: '',     // YYYY-MM-DD: 현재 사이클(식물) 시작일
  completedDates: [],
  dailyMissions: {},
  plantHistory: [],   // [{ plantId, cycleStart, completedCount, stageReached }]
};

// ── 유틸 ──
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function currentMonthYear() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

// 날짜 문자열에 1개월 더한 날짜 반환 (YYYY-MM-DD)
function addOneMonth(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  let ny = y, nm = m + 1;
  if (nm > 12) { nm = 1; ny++; }
  const maxDay = new Date(ny, nm, 0).getDate();
  const nd = Math.min(d, maxDay);
  return `${ny}-${String(nm).padStart(2,'0')}-${String(nd).padStart(2,'0')}`;
}

// 현재 사이클 종료일 (시작일 + 1개월, exclusive)
function getCycleEnd() {
  if (!state.cycleStart) return null;
  return addOneMonth(state.cycleStart);
}

// 사이클 내 완료 수
function getCompletionCountForCycle() {
  if (!state.cycleStart) return 0;
  const end = getCycleEnd();
  return state.completedDates.filter(d => d >= state.cycleStart && d < end).length;
}

function formatCycleLabel(cycleStart) {
  // plantHistory 표시용: "2026년 4월 15일 ~"
  if (!cycleStart) return '';
  const d = new Date(cycleStart);
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일~`;
}

function formatMonthYear(my) {
  // 이전 데이터(YYYY-MM) 또는 새 데이터(YYYY-MM-DD) 모두 처리
  if (!my) return '';
  if (my.length === 7) {
    const [y, m] = my.split('-');
    return `${y}년 ${parseInt(m)}월`;
  }
  return formatCycleLabel(my);
}

async function loadState() {
  if (!currentUser) return;
  const { data } = await sb
    .from('garden_states')
    .select('*')
    .eq('user_id', currentUser.id)
    .maybeSingle();
  if (data) {
    state.selectedPlant  = data.selected_plant  ?? null;
    let rawCycle         = data.month_year       ?? '';
    // 구형 "YYYY-MM" 형식이면 "YYYY-MM-01"로 보정
    if (rawCycle.length === 7) rawCycle = rawCycle + '-01';
    state.cycleStart     = rawCycle;
    state.completedDates = data.completed_dates  ?? [];
    state.dailyMissions  = data.daily_missions   ?? {};
    state.plantHistory   = data.plant_history    ?? [];
  }
}

async function saveState() {
  if (!currentUser) return;
  await sb
    .from('garden_states')
    .upsert({
      user_id:         currentUser.id,
      selected_plant:  state.selectedPlant,
      month_year:      state.cycleStart,
      completed_dates: state.completedDates,
      daily_missions:  state.dailyMissions,
      plant_history:   state.plantHistory,
    }, { onConflict: 'user_id' });
}

async function getMissionForDate(dateStr) {
  if (state.dailyMissions[dateStr]) return state.dailyMissions[dateStr];
  const num = parseInt(dateStr.split('-').join(''));
  let idx = num % MISSIONS.length;
  const prev = getPrevDate(dateStr);
  if (state.dailyMissions[prev] && MISSIONS[idx].text === state.dailyMissions[prev].text) {
    idx = (idx + 1) % MISSIONS.length;
  }
  state.dailyMissions[dateStr] = MISSIONS[idx];
  await saveState();
  return MISSIONS[idx];
}

function getPrevDate(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getCompletionCountForMonth(my) {
  // 구형 호환용 (컬렉션 표시 등에서 사용)
  return state.completedDates.filter(d => d.startsWith(my)).length;
}

function stageFromCount(count) {
  if (count === 0) return 0;
  if (count <= 5) return 1;
  if (count <= 10) return 2;
  if (count <= 16) return 3;
  if (count <= 23) return 4;
  return 5;
}

function getPlantStage() {
  return stageFromCount(getCompletionCountForCycle());
}

function getStreak() {
  let streak = 0;
  const d = new Date();
  if (!state.completedDates.includes(todayStr())) d.setDate(d.getDate() - 1);
  while (true) {
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (!state.completedDates.includes(ds)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ── 뷰 전환 ──
function showView(id) {
  ['auth-view', 'home-view', 'garden-view'].forEach(v => {
    document.getElementById(v).classList.toggle('hidden', v !== id);
  });
}

function goHome() {
  renderHomeView();
  showView('home-view');
}

async function goToGarden() {
  await renderGardenView();
  showView('garden-view');
}

// ── 홈 뷰 렌더 ──
function renderHomeView() {
  renderHeaderUser();
  renderCurrentPlantCard();
  renderCollection();
}

function renderCurrentPlantCard() {
  const container = document.getElementById('home-current-card');
  const cycleEnd  = getCycleEnd();
  const isActive  = state.selectedPlant && state.cycleStart && todayStr() < cycleEnd;

  if (!isActive) {
    container.innerHTML = `
      <div class="no-plant-card">
        <div class="no-plant-emoji">🪴</div>
        <p>키울 식물을 아직 선택하지 않았어요.<br>씨앗 하나를 골라 시작해봐요!</p>
        <button class="start-btn" onclick="showPlantModal()">식물 선택하기 🌱</button>
      </div>
    `;
    return;
  }

  const plant = PLANTS[state.selectedPlant];
  const count = getCompletionCountForCycle();
  const stage = stageFromCount(count);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const pct = Math.round((count / daysInMonth) * 100);
  const isTodayDone = state.completedDates.includes(todayStr());

  container.innerHTML = `
    <div class="home-current-card">
      <div class="home-current-top">
        <div class="home-plant-big-emoji">${plant.emoji}</div>
        <div class="home-plant-meta">
          <div class="home-plant-name">${plant.name}</div>
          <div class="home-plant-month">${formatCycleLabel(state.cycleStart)}</div>
          <div class="home-stage-pill">🌱 ${plant.stageNames[stage]}</div>
        </div>
      </div>
      <div class="home-progress-bar-wrap">
        <div class="home-progress-bar">
          <div class="home-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="home-progress-text">${count}일 / ${daysInMonth}일 완료</div>
      </div>
      ${isTodayDone
        ? `<div class="done-today-banner">🌟 오늘 미션 완료! 내일 또 만나요</div>
           <button class="go-garden-btn" onclick="goToGarden()">🌿 내 식물 보러가기</button>`
        : `<button class="go-garden-btn" onclick="goToGarden()">✨ 오늘의 미션 하러가기 →</button>`
      }
    </div>
  `;
}

function renderCollection() {
  const grid  = document.getElementById('collection-grid');
  const empty = document.getElementById('collection-empty');
  const history = state.plantHistory;

  if (history.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  // 오래된 순으로 정렬 (화단 왼쪽부터 심어진 순서)
  const sorted = [...history].sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  // 꽃마다 자연스러운 위치 (left%, fontSize, animDelay)
  const POSITIONS = [
    { left:6,  size:2.6, delay:0   }, { left:19, size:3.2, delay:0.6 },
    { left:32, size:2.4, delay:1.3 }, { left:46, size:3.4, delay:0.2 },
    { left:59, size:2.8, delay:1.9 }, { left:72, size:2.5, delay:0.9 },
    { left:84, size:2.2, delay:1.6 }, { left:12, size:2.0, delay:2.1 },
    { left:38, size:2.1, delay:0.4 }, { left:65, size:2.3, delay:1.2 },
  ];

  const flowers = sorted.map((h, i) => {
    const plant = PLANTS[h.plantId];
    if (!plant) return '';
    const pos    = POSITIONS[i % POSITIONS.length];
    const period = formatCycleLabel(h.monthYear);
    return `
      <div class="flowerbed-plant" style="left:${pos.left}%;font-size:${pos.size}rem;animation-delay:-${pos.delay}s"
           onclick="this.classList.toggle('fb-active')">
        <div class="fb-tooltip">
          <strong>${plant.name}</strong>
          <span>${period}</span>
          <span>${h.completedCount}일 완료</span>
        </div>
        <div class="fb-flower">${plant.flowerEmoji}</div>
      </div>
    `;
  }).join('');

  const deco = '';

  grid.innerHTML = `
    <div class="flowerbed-scene">
      <div class="fb-sky">
        <span class="fb-cloud" style="left:7%;top:18%;font-size:2.2rem;animation-delay:0s">☁️</span>
        <span class="fb-cloud" style="left:48%;top:10%;font-size:1.6rem;animation-delay:-5s">☁️</span>
        <span class="fb-cloud" style="left:74%;top:22%;font-size:1.9rem;animation-delay:-10s">☁️</span>
      </div>
      <div class="fb-hills-far"></div>
      <div class="fb-hills-near"></div>
      <div class="fb-grass">
        ${deco}
        ${flowers}
      </div>
    </div>
  `;
}

// ── 가든 뷰 렌더 ──
async function renderGardenView() {
  const plant = PLANTS[state.selectedPlant];
  const stage = getPlantStage();
  const today = todayStr();
  const mission = await getMissionForDate(today);
  const isTodayDone = state.completedDates.includes(today);

  // 사이클 기간의 인증샷 캐시 로드 (시작월 ~ 종료월)
  await loadCycleProofs();
  const streak = getStreak();
  const count = getCompletionCountForCycle();

  const now = new Date();
  // 사이클 기간 배지: "5월 1일 ~ 5월 31일"
  if (state.cycleStart) {
    const s = new Date(state.cycleStart);
    const e = new Date(getCycleEnd());
    e.setDate(e.getDate() - 1); // inclusive 마지막 날
    document.getElementById('month-badge').textContent =
      `${s.getMonth()+1}월 ${s.getDate()}일 ~ ${e.getMonth()+1}월 ${e.getDate()}일`;
  } else {
    document.getElementById('month-badge').textContent = `${now.getFullYear()}년 ${now.getMonth()+1}월`;
  }
  document.getElementById('plant-emoji-badge').textContent = plant.emoji;
  document.getElementById('plant-name-display').textContent = plant.name;
  document.getElementById('completion-count').textContent = count;
  document.getElementById('streak-count').textContent = streak;

  renderPlantArt(state.selectedPlant, stage);
  renderStageDots(stage);

  document.getElementById('mission-date').textContent = `${now.getMonth()+1}월 ${now.getDate()}일`;
  document.getElementById('mission-text').textContent = mission.text;
  document.getElementById('mission-desc').textContent = mission.desc;

  const btn = document.getElementById('complete-btn');
  const waterBtn = document.getElementById('water-btn');
  const doneBanner = document.getElementById('already-done');
  const uploadArea = document.getElementById('proof-upload-area');
  const previewWrap = document.getElementById('proof-preview-wrap');

  if (isTodayDone) {
    btn.classList.add('hidden');
    waterBtn?.classList.add('hidden');
    uploadArea?.classList.add('hidden');
    previewWrap?.classList.add('hidden');
    doneBanner.classList.remove('hidden');
    // 오늘 인증샷 표시
    const todayProof = proofCache[today];
    const todayProofWrap = document.getElementById('today-proof-wrap');
    const todayProofImg  = document.getElementById('today-proof-img');
    if (todayProof?.photo_url && todayProofWrap && todayProofImg) {
      todayProofImg.src = todayProof.photo_url;
      todayProofWrap.classList.remove('hidden');
    } else if (todayProofWrap) {
      todayProofWrap.classList.add('hidden');
    }
  } else {
    btn.classList.remove('hidden');
    waterBtn?.classList.remove('hidden');
    uploadArea?.classList.remove('hidden');
    doneBanner.classList.add('hidden');
  }

  await renderCalendar();

  document.getElementById('tips-list').innerHTML =
    MISSIONS.map(m => `<span class="tip-chip">${m.text}</span>`).join('');
}

// ── 식물 아트 ──
function renderPlantArt(plantId, stage) {
  const plant = PLANTS[plantId];
  const artEl = document.getElementById('plant-art');
  const skyEl = document.getElementById('plant-sky');

  const [c1, c2] = plant.skyColors[stage];
  skyEl.style.background = `linear-gradient(180deg, ${c1} 0%, ${c2} 70%, #A8C8A0 100%)`;

  const leaf = plant.leafColor;
  let html = '';

  if (stage === 0) {
    html = `<div style="width:30px;height:20px;background:radial-gradient(ellipse,#C8A96E,#7A5C2E);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>`;
  } else if (stage === 1) {
    html = `
      <div style="display:flex;flex-direction:column;align-items:center;animation:sway 3s ease-in-out infinite;">
        <div style="display:flex;gap:2px;margin-bottom:-2px">
          <div style="width:18px;height:22px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-20deg);"></div>
          <div style="width:18px;height:22px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(20deg);"></div>
        </div>
        <div style="width:5px;height:26px;background:#6B8F3C;border-radius:4px;"></div>
      </div>`;
  } else if (stage === 2) {
    html = `
      <div style="display:flex;flex-direction:column;align-items:center;animation:sway 3s ease-in-out infinite;">
        <div style="display:flex;gap:6px;margin-bottom:2px">
          <div style="width:26px;height:32px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-25deg);"></div>
          <div style="width:26px;height:32px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(25deg);"></div>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:2px">
          <div style="width:20px;height:26px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-20deg);"></div>
          <div style="width:20px;height:26px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(20deg);"></div>
        </div>
        <div style="width:6px;height:50px;background:#6B8F3C;border-radius:4px;"></div>
      </div>`;
  } else if (stage === 3) {
    html = `
      <div style="display:flex;flex-direction:column;align-items:center;animation:sway 3s ease-in-out infinite;">
        <div style="display:flex;gap:10px;margin-bottom:4px">
          <div style="width:12px;height:16px;background:#FFB7C5;border-radius:50% 50% 0 50%;transform:rotate(-10deg);"></div>
          <div style="width:12px;height:16px;background:#FFB7C5;border-radius:50% 50% 50% 0;transform:rotate(10deg);"></div>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:2px">
          <div style="width:28px;height:36px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-25deg);"></div>
          <div style="width:28px;height:36px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(25deg);"></div>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:2px">
          <div style="width:22px;height:28px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-20deg);"></div>
          <div style="width:22px;height:28px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(20deg);"></div>
        </div>
        <div style="width:7px;height:66px;background:#6B8F3C;border-radius:4px;"></div>
      </div>`;
  } else if (stage === 4) {
    html = `
      <div style="display:flex;flex-direction:column;align-items:center;animation:sway 3s ease-in-out infinite;">
        <div style="display:flex;gap:8px;margin-bottom:4px">
          <span style="font-size:1.7rem;animation:sway 2.5s ease-in-out infinite;">${plant.flowerEmoji}</span>
          <span style="font-size:1.7rem;animation:sway 2.8s ease-in-out infinite;">${plant.flowerEmoji}</span>
          <span style="font-size:1.7rem;animation:sway 3.2s ease-in-out infinite;">${plant.flowerEmoji}</span>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:2px">
          <div style="width:32px;height:40px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-30deg);"></div>
          <div style="width:32px;height:40px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(30deg);"></div>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:2px">
          <div style="width:24px;height:30px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-20deg);"></div>
          <div style="width:24px;height:30px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(20deg);"></div>
        </div>
        <div style="width:8px;height:78px;background:#5D8A3C;border-radius:4px;"></div>
      </div>`;
  } else {
    html = `
      <div style="display:flex;flex-direction:column;align-items:center;animation:sway 4s ease-in-out infinite;">
        <div style="display:flex;gap:6px;margin-bottom:2px">
          <span style="font-size:1.5rem;">${plant.fruitEmoji}</span>
          <span style="font-size:1.8rem;">${plant.flowerEmoji}</span>
          <span style="font-size:1.5rem;">${plant.fruitEmoji}</span>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:2px">
          <span style="font-size:1.2rem;">${plant.fruitEmoji}</span>
          <div style="width:36px;height:44px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-30deg);"></div>
          <div style="width:36px;height:44px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(30deg);"></div>
          <span style="font-size:1.2rem;">${plant.fruitEmoji}</span>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:2px">
          <div style="width:28px;height:34px;background:${leaf};border-radius:50% 0 50% 0;transform:rotate(-20deg);"></div>
          <div style="width:28px;height:34px;background:${leaf};border-radius:0 50% 0 50%;transform:rotate(20deg);"></div>
        </div>
        <div style="width:10px;height:88px;background:#5D8A3C;border-radius:5px;"></div>
      </div>`;
  }

  artEl.innerHTML = html;
}

function renderStageDots(stage) {
  const plant = PLANTS[state.selectedPlant];
  document.getElementById('stage-dots').innerHTML = plant.stageNames.map((_, i) => {
    let cls = 'stage-dot';
    if (i < stage) cls += ' done';
    if (i === stage) cls += ' active';
    return `<div class="${cls}"></div>`;
  }).join('');
  document.getElementById('stage-label').textContent = plant.stageNames[stage];
}

// 캘린더 표시 중인 연/월 (null이면 현재 월)
let calViewYear  = null;
let calViewMonth = null;

async function moveCalMonth(delta) {
  const now = new Date();
  if (calViewYear === null) { calViewYear = now.getFullYear(); calViewMonth = now.getMonth(); }
  calViewMonth += delta;
  if (calViewMonth > 11) { calViewMonth = 0;  calViewYear++; }
  if (calViewMonth < 0)  { calViewMonth = 11; calViewYear--; }
  await renderCalendar();
}

async function renderCalendar() {
  const cal   = document.getElementById('calendar');
  const now   = new Date();
  const year  = calViewYear  ?? now.getFullYear();
  const month = calViewMonth ?? now.getMonth();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const today = isCurrentMonth ? now.getDate() : -1;

  // 해당 월 인증샷 캐시 로드
  await loadMonthProofs(year, month);

  // 제목 업데이트
  const titleEl = document.getElementById('cal-title');
  if (titleEl) titleEl.textContent = isCurrentMonth ? '이번 달 기록' : `${year}년 ${month + 1}월`;

  // 다음 달 버튼: 현재 월 이후는 막기
  const nextBtn = document.getElementById('cal-next-btn');
  if (nextBtn) {
    const isNextFuture = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth());
    nextBtn.disabled = isNextFuture;
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const monthStr    = `${year}-${String(month + 1).padStart(2, '0')}`;

  let html = ['일','월','화','수','목','금','토'].map(d => `<div class="cal-header">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${monthStr}-${String(d).padStart(2,'0')}`;
    const isDone    = state.completedDates.includes(ds);
    const isToday   = d === today;
    const isFuture  = isCurrentMonth ? d > now.getDate() : false;
    const isPastMonth = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth());
    let cls = 'cal-day';
    if (isDone)   cls += ' done';
    if (isToday)  cls += ' today';
    if (isFuture) cls += ' future';
    let clickAttr = '';
    if (isDone) {
      cls += ' clickable';
      clickAttr = `onclick="openProofModal('${ds}')" title="${ds} 인증 기록 보기"`;
    } else if (!isFuture && !isToday && (isPastMonth || isCurrentMonth)) {
      cls += ' missed-clickable';
      clickAttr = `onclick="showEncourageModal('${ds}')"`;
    }
    html += `<div class="${cls}" ${clickAttr}>${d}</div>`;
  }
  cal.innerHTML = html;
}

// ── 미션 완료 ──
async function completeMission() {
  const today = todayStr();
  if (state.completedDates.includes(today)) return;

  const btn = document.getElementById('complete-btn');
  btn.disabled = true;
  btn.textContent = '저장 중...';

  const mission = await getMissionForDate(today);
  const fileInput = document.getElementById('proof-photo-input');
  const file = fileInput?.files[0] || null;

  // 사진 업로드 (있는 경우)
  let photoUrl = null;
  if (file) photoUrl = await uploadMissionPhoto(file, today);

  // 인증 기록 저장
  await saveProof(today, photoUrl, mission.text);

  const prevStage = getPlantStage();
  state.completedDates.push(today);
  await saveState();
  const newStage = getPlantStage();

  btn.disabled = false;
  await renderGardenView();
  renderCurrentPlantCard();
  showCelebrate(prevStage, newStage);
}

function showCelebrate(prevStage, newStage) {
  const plant = PLANTS[state.selectedPlant];
  const stageUp = newStage > prevStage;

  document.getElementById('celebrate-emoji').textContent = stageUp ? plant.emoji : '🌟';
  document.getElementById('celebrate-title').textContent = stageUp
    ? `${plant.stageNames[newStage]}이 되었어요!`
    : '오늘도 해냈어요!';
  document.getElementById('celebrate-msg').textContent = stageUp
    ? `대단해요! ${plant.name}가 한 단계 성장했어요. 꾸준히 함께해줘서 고마워요 🌿`
    : `미션을 완료했어요. 작은 한 걸음이 큰 변화를 만들어요. 내일도 함께해요! 🌱`;

  spawnConfetti();
  document.getElementById('celebrate-overlay').classList.remove('hidden');
}

function closeCelebrate() {
  document.getElementById('celebrate-overlay').classList.add('hidden');
}

function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#4CAF50','#FF9800','#E91E63','#2196F3','#FFEB3B','#9C27B0'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left:${Math.random()*100}vw;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*8}px; height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'2px'};
      animation:fall ${1.5+Math.random()*2}s ${Math.random()*0.5}s linear forwards;
    `;
    container.appendChild(p);
  }
}

// ── 식물 선택 모달 ──
let pendingPlant = null;

function showPlantModal() {
  pendingPlant = state.selectedPlant;
  renderPlantGrid();
  document.getElementById('plant-modal').classList.remove('hidden');
}

function renderPlantGrid() {
  document.getElementById('plant-grid').innerHTML =
    Object.entries(PLANTS).map(([id, p]) => `
      <div class="plant-card ${pendingPlant === id ? 'selected' : ''}" onclick="selectPlantCard('${id}')">
        <div class="plant-card-emoji">${p.emoji}</div>
        <div class="plant-card-name">${p.name}</div>
        <div class="plant-card-sub">${p.sub}</div>
      </div>
    `).join('') +
    `<button class="modal-confirm-btn" style="grid-column:1/-1" onclick="confirmPlantSelection()">
       이 식물로 시작하기 🌱
     </button>`;
}

function selectPlantCard(id) {
  pendingPlant = id;
  renderPlantGrid();
}

async function confirmPlantSelection() {
  if (!pendingPlant) return;

  const cycleEnd    = getCycleEnd();
  const isChanging  = state.selectedPlant && state.selectedPlant !== pendingPlant;
  const isInCycle   = state.cycleStart && todayStr() < cycleEnd;

  if (isChanging && isInCycle) {
    if (!confirm('식물을 바꾸면 현재 기록이 초기화돼요. 정말 바꿀까요?')) return;
    // 사이클 범위 날짜만 삭제
    state.completedDates = state.completedDates.filter(d => d < state.cycleStart || d >= cycleEnd);
    const kept = {};
    Object.keys(state.dailyMissions).forEach(k => {
      if (k < state.cycleStart || k >= cycleEnd) kept[k] = state.dailyMissions[k];
    });
    state.dailyMissions = kept;
    // 인증샷 캐시 & DB & Storage 삭제
    const cycleProofs = Object.values(proofCache).filter(Boolean);
    proofCache = {};
    const storagePaths = cycleProofs
      .filter(p => p?.photo_url)
      .map(p => {
        const marker = '/mission-photos/';
        const idx = p.photo_url.indexOf(marker);
        return idx !== -1 ? p.photo_url.slice(idx + marker.length) : null;
      })
      .filter(Boolean);
    if (storagePaths.length > 0) {
      await sb.storage.from('mission-photos').remove(storagePaths);
    }
    await sb.from('daily_proofs')
      .delete()
      .eq('user_id', currentUser.id)
      .gte('date_str', state.cycleStart)
      .lt('date_str', cycleEnd);
  }

  state.selectedPlant = pendingPlant;
  state.cycleStart    = todayStr();   // 새 사이클 시작일 = 오늘
  await saveState();
  document.getElementById('plant-modal').classList.add('hidden');

  const gardenVisible = !document.getElementById('garden-view').classList.contains('hidden');
  if (gardenVisible) {
    await renderGardenView();
  } else {
    renderHomeView();
  }
}

// ── 사이클 종료 처리 ──
async function checkMonthReset() {
  if (!state.cycleStart || !state.selectedPlant) return;
  const cycleEnd = getCycleEnd();
  if (todayStr() >= cycleEnd) {
    const prevCount = getCompletionCountForCycle();
    const prevStage = stageFromCount(prevCount);
    const alreadySaved = state.plantHistory.some(h => h.monthYear === state.cycleStart);
    if (!alreadySaved) {
      state.plantHistory.push({
        plantId:       state.selectedPlant,
        monthYear:     state.cycleStart,   // 기존 필드명 유지 (컬렉션 표시용)
        completedCount: prevCount,
        stageReached:  prevStage,
      });
    }
    state.selectedPlant = null;
    state.cycleStart    = '';
    proofCache = {};
    await saveState();
  }
}

// ── 초기화 ──
async function init() {
  // Supabase 세션 복원
  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    showView('auth-view');
    return;
  }

  currentUser = session.user;
  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();
  userProfile = profile;

  await loadState();
  await checkMonthReset();
  renderHomeView();
  showView('home-view');
}

// 세션 변경 감지 (다른 탭 로그인/로그아웃 동기화)
sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' && currentUser) {
    currentUser = null;
    userProfile = null;
    state = { selectedPlant: null, cycleStart: '', completedDates: [], dailyMissions: {}, plantHistory: [] };
    showView('auth-view');
  }
});

document.addEventListener('DOMContentLoaded', init);

// 화단 꽃 툴팁: 다른 곳 클릭 시 닫기
document.addEventListener('click', e => {
  if (!e.target.closest('.flowerbed-plant')) {
    document.querySelectorAll('.flowerbed-plant.fb-active')
      .forEach(el => el.classList.remove('fb-active'));
  }
});
