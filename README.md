# 나만의 작은 정원 🌿

매일 미션을 완료하며 나만의 식물을 키우는 앱입니다.

---

## 기술 스택

- 프론트엔드: HTML / CSS / Vanilla JS
- 인증 & DB: [Supabase](https://supabase.com) (PostgreSQL + Auth)
- 배포: [Vercel](https://vercel.com) (정적 사이트)

---

## 시작하기

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에서 무료 계정 생성 및 새 프로젝트 생성
2. 프로젝트 대시보드 → **Settings > API** 에서 아래 두 값 복사
   - `Project URL`
   - `anon public` 키

### 2. 테이블 및 RLS 설정

1. Supabase 대시보드 → **SQL Editor**
2. `supabase_setup.sql` 파일 전체 내용을 붙여넣고 실행

### 3. app.js에 키 입력

`app.js` 파일 상단의 두 줄을 실제 값으로 교체합니다:

```js
const SUPABASE_URL      = 'YOUR_SUPABASE_URL';      // ← 실제 URL로 교체
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ← 실제 anon key로 교체
```

### 4. 로컬 실행

별도 서버 없이 `index.html`을 브라우저에서 열거나, VS Code Live Server 확장을 사용합니다.

### 5. Vercel 배포 (선택)

```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 프로젝트 루트에서 실행
vercel

# 이후 배포
vercel --prod
```

---

## 폴더 구조

```
garden/
├── index.html          # 메인 HTML (인증 + 앱 화면)
├── style.css           # 스타일
├── app.js              # 앱 로직 + Supabase 연동
├── supabase_setup.sql  # DB 테이블 생성 + RLS 정책 SQL
├── vercel.json         # Vercel 배포 설정
└── README.md
```

---

## Supabase 테이블 구조

### `profiles`
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | auth.users와 연결 |
| username | text | 표시용 아이디 |
| name | text | 이름 |
| birthdate | date | 생년월일 |
| agreed_at | timestamptz | 개인정보 동의 시각 |

### `garden_states`
| 컬럼 | 타입 | 설명 |
|---|---|---|
| user_id | uuid | 유저 식별자 |
| selected_plant | text | 현재 식물 |
| month_year | text | 현재 월 (YYYY-MM) |
| completed_dates | jsonb | 완료 날짜 배열 |
| daily_missions | jsonb | 날짜별 미션 |
| plant_history | jsonb | 완료된 달 기록 |
