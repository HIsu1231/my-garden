'use strict';

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
    name: '라벤더', emoji: '💜', sub: '은은한 향기를 퍼뜨려요',
    leafColor: '#7CB342', flowerEmoji: '💜', fruitEmoji: '💜',
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
  monthYear: '',
  completedDates: [],
  dailyMissions: {},
  plantHistory: [],   // [{ plantId, monthYear, completedCount, stageReached }]
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

function formatMonthYear(my) {
  const [y, m] = my.split('-');
  return `${y}년 ${parseInt(m)}월`;
}

function loadState() {
  const raw = localStorage.getItem('garden_state_v2');
  if (raw) {
    try { Object.assign(state, JSON.parse(raw)); } catch(e) {}
  }
}

function saveState() {
  localStorage.setItem('garden_state_v2', JSON.stringify(state));
}

function getMissionForDate(dateStr) {
  if (state.dailyMissions[dateStr]) return state.dailyMissions[dateStr];
  const num = parseInt(dateStr.split('-').join(''));
  let idx = num % MISSIONS.length;
  const prev = getPrevDate(dateStr);
  if (state.dailyMissions[prev] && MISSIONS[idx].text === state.dailyMissions[prev].text) {
    idx = (idx + 1) % MISSIONS.length;
  }
  state.dailyMissions[dateStr] = MISSIONS[idx];
  saveState();
  return MISSIONS[idx];
}

function getPrevDate(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getCompletionCountForMonth(my) {
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
  return stageFromCount(getCompletionCountForMonth(currentMonthYear()));
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
  ['home-view', 'garden-view'].forEach(v => {
    document.getElementById(v).classList.toggle('hidden', v !== id);
  });
}

function goHome() {
  renderHomeView();
  showView('home-view');
}

function goToGarden() {
  renderGardenView();
  showView('garden-view');
}

// ── 홈 뷰 렌더 ──
function renderHomeView() {
  renderCurrentPlantCard();
  renderCollection();
}

function renderCurrentPlantCard() {
  const container = document.getElementById('home-current-card');
  const my = currentMonthYear();

  if (!state.selectedPlant || state.monthYear !== my) {
    container.innerHTML = `
      <div class="no-plant-card">
        <div class="no-plant-emoji">🪴</div>
        <p>이번 달 키울 식물을 아직 선택하지 않았어요.<br>씨앗 하나를 골라 시작해봐요!</p>
        <button class="start-btn" onclick="showPlantModal()">식물 선택하기 🌱</button>
      </div>
    `;
    return;
  }

  const plant = PLANTS[state.selectedPlant];
  const count = getCompletionCountForMonth(my);
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
          <div class="home-plant-month">${formatMonthYear(my)}</div>
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
  const grid = document.getElementById('collection-grid');
  const empty = document.getElementById('collection-empty');
  const history = state.plantHistory;

  if (history.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  // 최신순으로 정렬
  const sorted = [...history].sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  grid.innerHTML = sorted.map(h => {
    const plant = PLANTS[h.plantId];
    if (!plant) return '';
    return `
      <div class="collection-card">
        <div class="coll-emoji">${plant.emoji}</div>
        <div class="coll-name">${plant.name}</div>
        <div class="coll-month">${formatMonthYear(h.monthYear)}</div>
        <div class="coll-stage">${plant.stageNames[h.stageReached]}</div>
        <div class="coll-count">${h.completedCount}일 완료</div>
      </div>
    `;
  }).join('');
}

// ── 가든 뷰 렌더 ──
function renderGardenView() {
  const plant = PLANTS[state.selectedPlant];
  const stage = getPlantStage();
  const today = todayStr();
  const mission = getMissionForDate(today);
  const isTodayDone = state.completedDates.includes(today);
  const streak = getStreak();
  const count = getCompletionCountForMonth(currentMonthYear());

  const now = new Date();
  document.getElementById('month-badge').textContent = `${now.getFullYear()}년 ${now.getMonth()+1}월`;
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
  const doneBanner = document.getElementById('already-done');
  if (isTodayDone) {
    btn.classList.add('hidden');
    doneBanner.classList.remove('hidden');
  } else {
    btn.classList.remove('hidden');
    doneBanner.classList.add('hidden');
  }

  renderCalendar();

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

function renderCalendar() {
  const cal = document.getElementById('calendar');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  let html = ['일','월','화','수','목','금','토'].map(d => `<div class="cal-header">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isDone = state.completedDates.includes(ds);
    const isToday = d === today;
    const isFuture = d > today;
    let cls = 'cal-day';
    if (isDone) cls += ' done';
    if (isToday) cls += ' today';
    if (isFuture) cls += ' future';
    html += `<div class="${cls}">${d}</div>`;
  }
  cal.innerHTML = html;
}

// ── 미션 완료 ──
function completeMission() {
  const today = todayStr();
  if (state.completedDates.includes(today)) return;

  const prevStage = getPlantStage();
  state.completedDates.push(today);
  saveState();
  const newStage = getPlantStage();

  renderGardenView();
  // 홈 카드도 갱신 (백그라운드)
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

function confirmPlantSelection() {
  if (!pendingPlant) return;

  const my = currentMonthYear();
  const isChanging = state.selectedPlant && state.selectedPlant !== pendingPlant;
  const isSameMonth = state.monthYear === my;

  if (isChanging && isSameMonth) {
    if (!confirm('식물을 바꾸면 이번 달 기록이 초기화돼요. 정말 바꿀까요?')) return;
    // 이번 달 기록 초기화
    state.completedDates = state.completedDates.filter(d => !d.startsWith(my));
    const kept = {};
    Object.keys(state.dailyMissions).forEach(k => {
      if (!k.startsWith(my)) kept[k] = state.dailyMissions[k];
    });
    state.dailyMissions = kept;
  }

  state.selectedPlant = pendingPlant;
  state.monthYear = my;
  saveState();
  document.getElementById('plant-modal').classList.add('hidden');

  // 가든 뷰에서 변경했으면 가든 다시 렌더, 홈에서 변경했으면 홈 렌더
  const gardenVisible = !document.getElementById('garden-view').classList.contains('hidden');
  if (gardenVisible) {
    renderGardenView();
  } else {
    renderHomeView();
  }
}

// ── 월 전환 처리 ──
function checkMonthReset() {
  const my = currentMonthYear();
  if (state.monthYear && state.monthYear !== my) {
    // 지난 달 기록을 히스토리에 저장
    if (state.selectedPlant) {
      const prevCount = getCompletionCountForMonth(state.monthYear);
      const prevStage = stageFromCount(prevCount);
      // 중복 방지
      const alreadySaved = state.plantHistory.some(h => h.monthYear === state.monthYear);
      if (!alreadySaved) {
        state.plantHistory.push({
          plantId: state.selectedPlant,
          monthYear: state.monthYear,
          completedCount: prevCount,
          stageReached: prevStage,
        });
      }
    }
    state.monthYear = my;
    state.selectedPlant = null;
    saveState();
  }
}

// ── 초기화 ──
function init() {
  loadState();
  checkMonthReset();

  if (!state.selectedPlant) {
    // 식물 없으면 홈 보여주고 거기서 선택 유도
    renderHomeView();
    showView('home-view');
  } else {
    renderHomeView();
    showView('home-view');
  }
}

document.addEventListener('DOMContentLoaded', init);
