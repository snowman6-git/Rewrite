# 인앱 프론트 핫패치 요구사항 (hotpatch)

> 프론트 전용 문서. Tauri Rust 소스(`app_tauri/src-tauri`)는 읽기 전용이므로, §5의 Rust 2개소는 구현자에게 전달하여 추가한다. 프론트 로더(§4)는 `frontend_svelte`에서 구현.

## 1. 목적

- UI 변경 시 **풀 APK 빌드/재배포 없이** 폰에 새 프론트 적용.
- 타깃: 같은 빌더가 가끔 다른 사람에게 배포하는 사이클에서 UI 변경분만 push.
- 방식: 시작 시 원격 `version.json` 확인 → 새 버전 있으면 zip 다운로드 → sha256 검증 → app-data에 설치 → 커스텀 프로토콜이 패치目录를 우선 서빙 → 페이지 리로드.

## 2. 전체 플로우

```
앱 시작
  └─ 프론트 로더 (frontend_svelte/src/lib/hotpatch/loader.ts)
       ├─ GET {HUB}/version.json            (https, Forgejo release)
       ├─ installed = localStorage('rewrite_ui_ver')
       ├─ remote.ver > installed?
       │    ├─ NO  → 정상 부팅 (임베드 프론트)
       │    └─ YES → GET {HUB}/ui-v{ver}.zip → sha256 검사
       │         ├─ 실패 → 임베드로 폴백 + 토스트
       │         └─ 성공 → app-data/hotpatch/에 저장
       │              → invoke('hotpatch_extract', { ver })   [Rust §5-2]
       │              → localStorage 기록
       │              → location.reload()  →  프로토콜이 패치目录 서빙  [Rust §5-1]
```

- **패치 미설치/다운로드 실패 = 임베드 프론트로 조용히 폴백** — 앱은 절대 못 열리게 해선 안 됨.
- 오프라인(404/네트워크 에러)도 같은 폴백.

## 3. 배포 artefact 형식

**호스팅**: Forgejo(`forgejo.aa2.uk`) — 리포 `rewrite-ui`의 GitHub-release style 릴리스에 아셋 2종 업로드.
(왜 Forgejo: https 고정 URL, 무료, 토큰 이미 보유. SMB는 URL이 아니므로 불가)

### version.json

```json
{
	"ver": 3,
	"sha256": "<ui-v3.zip 전체 해시, 소문자 hex>",
	"url": "https://forgejo.aa2.uk/aa2/rewrite-ui/releases/v3/download/ui-v3.zip"
}
```

### ui-v{ver}.zip 레이아웃

- `bun run build`의 **`.svelte-kit/output/client`를 그대로** 압축 (루트 = `index.html` + `_app/` 등, zip 내 폴더 래핑 없음)
- 압축 스크립트: `frontend_svelte/scripts/hotpatch.mjs` — 빌드 → zip → sha256 → Forgejo 릴리스 업로드 (토큰 env)

## 4. 프론트 로더 (frontend_svelte — 바로 구현)

- `src/lib/hotpatch/loader.ts`: 위 플로우의 버전 비교/다운로드/저장/invoke/리로드. `+layout.svelte` 최상단 `await checkHotpatch()`(타임아웃 5s, 실패 조용히).
- 저장: Tauri 환경 = `invoke('hotpatch_save', { ver, dataBase64 })`로 `app_data_dir()/hotpatch/ui-v{ver}.zip` 기록. (zip은 1~3MB → base64로 IPC)
- 웹/개발 환경(`__TAURI_INTERNALS__` 없음) = 핫패치 스킵.
- HUB URL 상수: `https://forgejo.aa2.uk/aa2/rewrite-ui` (env `PUBLIC_HOTPATCH_HUB` 오버라이드).
- **리로드 루프 방지**: `?hotpatch=done` 쿼리 1회성 플래그 — 패치 설치 성공 후 리로드만 패치 로더 재진입.

## 5. Rust 측 요구 (2개소)

### 5-1. 에셋 프로토콜 리졸버 (핵심)

`tauri://localhost`(기본 에셋 프로토콜)가 서빙할 경로를 **패치目录 우선**으로:

```rust
// src/lib.rs — asset resolver 커스텀 (Tauri 2: tauri::Builder asset resolver /
// asset protocol의 resolve_asset 구현)
// 순서:
//   1) app_data_dir()/hotpatch/active/{path}  — 존재하면 이거 서빙
//   2) 없으면 임베드 에셋 (기존 동작 그대로)
// MIME: 임베드와 동일 로직 재사용
```

`active` = `hotpatch_extract`이 `ui-v{ver}/`을 무압축해 `active` 링크(디렉터리 교체)로 세운 위치.

### 5-2. 해제/저장 커맨드

```rust
#[tauri::command]
async fn hotpatch_save(state: tauri::State<...>, ver: String, data_base64: String) -> Result<(), String>
// app_data_dir()/hotpatch/ui-v{ver}.zip  기록

#[tauri::command]
async fn hotpatch_extract(ver: String) -> Result<(), String>
// ui-v{ver}.zip → hotpatch/staging/ 해제 → 'active' 원자 교체(이동)
// zip-slip 방어: entry 경로가 staging 밖이면 reject
```

- capability: `core:default` + 커맨드 2종 allow (`src-tauri/capabilities/`).
- **기존 .so 임베드 프론트 fallback은 삭제하지 않음** — 핫패치가 실패해도 앱은 임베드로 부팅.

## 6. 폴백/실패 매트릭스

| 상황                        | 동작                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------- |
| version.json 404/네트워크   | 임베드 부팅, 로그만                                                                    |
| zip sha256 불일치           | 임베드 부팅 + 토스트 1회                                                               |
| extract invoke 실패         | 임베드 부팅 + 토스트                                                                   |
| active目录 존재, ver 불일치 | 프로토콜이 active 자체 서빙 (version.json과 무관, 마지막 설치분)                       |
| 리로드 후 active가 빈 zip   | sha256이 압축 **전** 파일 전체를 검증하므로 이론상 불가, 재발 시 active 삭제 후 리로드 |

## 7. 보안

- https만 (Forgejo). version.json/zip 둘 다 릴리스 자산 → 미인증 릴리스 편집자가 악성 UI push 가능 = **토큰 관리가 곧 공급망**. 공개 릴리스 전환 시 sha256만으로는 부족 → 서명(minisign) 검토.
- zip-slip 방어 §5-2 명시.
- base64 IPC 3MB 제한: 프론트 zip이 3MB를 넘기면 Forgejo URL을 Rust에 직접 주워오도록 (§5-2에 `hotpatch_fetch` 옵션 추가 요청).
