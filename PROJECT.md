# Project: Rewrite

## Overview
AI 소설 작성 앱 프론트엔드 (Svelte 5 + Hono)

## Tech Stack
- **Frontend**: Svelte 5 (Runes 모드), TypeScript
- **Backend**: Hono
- **Build**: Bun
- **Styling**: CSS Variables (Design Tokens)

## Key Decisions

### Architecture
- Svelte 5 Runes 모드 사용 (`$state`, `in:`/`out:` 트랜지션)
- $lib/ → src/lib/, $components/ → src/components/
- 라우트: /chat/{book_id} (그룹 채팅)

### Design System
- **테마색**: 
  - accent-primary: #6366f1 (인디고)
  - accent-secondary: #8b5cf6 (보라)
  - accent-light: #a78bfa (연한 보라)
  - background: #0a0a0a (거의 검정)
- **폰트**: NxMaple
- **모바일**: Tauri 앱 지원, 반응형 UI

### Common Components
- `src/components/Common/Btn.svelte` — 공통 버튼 (4 종: primary, cancel, save, reset)
- `src/components/Common/BtnCase.svelte` — 공통 버튼 컨테이너
- `src/components/Common/InputField.svelte` — 공통 입력 필드 (text/textarea)
- `src/components/Common/Desc.svelte` — 공통 설명 텍스트
- `src/components/Common/Toast.svelte` — 토스트 알림 컴포넌트
- `src/components/Common/ToastContainer.svelte` — 토스트 알림 컨테이너
- `src/lib/stores/toast.svelte.ts` — 토스트 상태 관리

### Animation Rules
- 스벨트 내장 트랜지션 (`in:`, `out:`, `transition:`) 우선 사용
- 사용 가능한 트랜지션: `fade`, `slide`, `scale`, `fly`, `blur`
- 복잡한 효과는 키프레임 애니메이션 (`@keyframes`) 사용
- GPU 가속: `transform`, `opacity` 사용
- 모바일 환경에서 부드러운 렌더링 보장

## API Integration
- 로그인 API 엔드포인트 필요
- 토큰 저장: 로컬 스토리지/쿠키
- 리다이렉트: /chat 또는 /dashboard
- 에러 처리: 토스트 알림

## File Structure
```
Rewrite/frontend_svelte/
├── src/
│   ├── components/
│   │   ├── Common/          # 공통 컴포넌트
│   │   ├── ChatBlock.svelte
│   │   ├── ModelListMenu.svelte
│   │   └── ...
│   ├── lib/
│   │   ├── api/             # API 호출
│   │   ├── stores/          # 상태 관리
│   │   └── states/          # 글로벌 상태
│   └── routes/
│       ├── login/           # 로그인 페이지
│       ├── book/            # 책/채팅 페이지
│       └── ...
├── static/
│   └── logos/               # 공식 로고
└── AGENTS.md                # 에이전트 설정
```

## Important Notes
- 백엔드 소스 건드리지 않음
- 한국어만 사용
- 공식 로고: `/logos/rewrite.svg` (쉼표 모양)
- A_Runtime_Data 폴더: 런타임 테스트 스크린샷 저장
- A_Reference_data 폴더: 참고 자료 저장

## Recent Changes (2026-07-15)
- 로그인 폼 디자인 통일 (/book 라우터와 비교)
- 토스트 알림 통합 (성공/실패/경고/정보)
- 로고 호버 효과 제거
- CSS 변수 최적화 (공식 사이트와 일치)
- 부제목과 인풋 필드 간격 추가
- 로고 쉐도우 관련 코드 제거

## Commands
- `bun run check` — 코드 에러 확인
- `bun run format -w` — 코드 정렬
- `bun run dev` — 개발 서버
