// rewrite:// 커스텀 스킴 — 핫패치 active/ 우선, 임베드 에셋 폴백 (doc/hotpatch-doc.md §5)
// 윈도우 URL = rewrite://local/index.html (tauri.conf.json). dev 모드는 devUrl 우선.
// 플러그인 경로 = Builder 단계 등록 (App by-value API를 Builder에서 쓰기 위함).
// Android: WebView는 http://rewrite.localhost/<path>로 요청 → 경로에 `local/` 호스트 잔재 가능.
mod hotpatch;

fn mime_for(path: &str) -> &'static str {
    match path.rsplit('.').next().unwrap_or("") {
        "html" => "text/html; charset=utf-8",
        "js" | "mjs" => "application/javascript",
        "css" => "text/css",
        "json" => "application/json",
        "png" => "image/png",
        "svg" => "image/svg+xml",
        "ico" => "image/x-icon",
        "webp" => "image/webp",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "txt" => "text/plain",
        _ => "application/octet-stream",
    }
}

/// 요청 경로 정규화: "/local/index.html" → "index.html" (호스트 잔재 제거)
/// + "hp{N}/" 버전 접두 제거 — WebView가 커스텀 스킴에서 Cache-Control을 무시해
/// (opaque origin) index.html이 버전간 캐싱됨 → 버전별 새 경로로 캐시 미스 강제 (2026-10-29)
fn normalize_path(raw: &str) -> String {
    let p = raw.trim_start_matches('/');
    let p = p.strip_prefix("local/").unwrap_or(p);
    // hp123/index.html → index.html (hp + 숫자 + / 형태만)
    if let Some(rest) = p.strip_prefix("hp") {
        let digits = rest.bytes().take_while(|b| b.is_ascii_digit()).count();
        if digits > 0 && rest.as_bytes().get(digits) == Some(&b'/') {
            return rest[digits + 1..].to_string();
        }
    }
    p.to_string()
}

/// 에셋 미스 디버그 페이지 — "404"가 Tauri 기본인지 자식 핸들러인지 구별 + 요청 경로 확인
fn not_found_html(raw: &str) -> Vec<u8> {
    format!(
        "<!doctype html><meta charset=utf-8><title>rewrite 404</title>\
		<body style=\"background:#0a0a0a;color:#ededed;font-family:monospace;padding:24px\">\
		<h2 style=\"font-size:16px\">rewrite:// 핸들러 응답 — 파일 미스</h2>\
		<p>raw: {raw}</p><p>normalized: {}</p>\
		</body>",
        normalize_path(raw)
    )
    .into_bytes()
}

/// index.html 서빙 시 SvelteKit 시작 전에 pathname을 루트로 정규화 —
/// 패치 캐시 버스트용 버전 경로(hp{N}/index.html)는 어떤 라우트에도 안 맞아 SPA 404 (2026-11-01 AVD 재현).
/// 헤드 인라인 스크립트는 body의 모듈 스크립트(SvelteKit start)보다 먼저 실행 → race 없음.
fn normalize_index(bytes: Vec<u8>) -> Vec<u8> {
    const FIX: &str = "<script>try{history.replaceState(null,'','/')}catch(e){}</script>";
    match String::from_utf8(bytes) {
        Ok(mut s) => {
            if let Some(pos) = s.find("</head>") {
                s.insert_str(pos, FIX);
            }
            s.into_bytes()
        }
        Err(e) => e.as_bytes().to_vec(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri::plugin::Builder::<tauri::Wry, ()>::new("hotpatch")
                .register_uri_scheme_protocol(
                    "rewrite",
                    |ctx, request| -> http::Response<Vec<u8>> {
                        let raw = request.uri().path().to_string();
                        let path = if normalize_path(&raw).is_empty() {
                            // rewrite://local/ (빈 path) = index.html
                            "index.html".to_string()
                        } else {
                            normalize_path(&raw)
                        };
                        // 1) 핫패치 active/  2) 임베드 에셋  3) 미스 = 디버그 404
                        // 동기 핸들러: 안드로이드는 비동기 responder가 JNI 경계에서 죽는걸로 확인(검은화면) — wry 0.55+는 동기 안전
                        let is_index = path == "index.html";
                        let found: Option<Vec<u8>> =
                            hotpatch::resolve_asset(ctx.app_handle(), &path).or_else(|| {
                                ctx.app_handle().asset_resolver().get(path).map(|a| a.bytes)
                            });
                        let (status, bytes) = match found {
                            Some(b) => (
                                http::StatusCode::OK,
                                if is_index { normalize_index(b) } else { b },
                            ),
                            None => (http::StatusCode::NOT_FOUND, not_found_html(&raw)),
                        };
                        let mut resp = http::Response::new(bytes);
                        *resp.status_mut() = status;
                        resp.headers_mut().insert(
                            http::header::CONTENT_TYPE,
                            http::HeaderValue::from_static(mime_for(&raw)),
                        );
                        // opaque origin(커스텀 스킴)에서 WebView가 쿼리 무시로 index.html을 캐싱 —
                        // 패치 리로드(?hotpatch=1&t=)가 구 index를 다시 받아 갱신이 안 걸림 (2026-10-29)
                        resp.headers_mut().insert(
                            http::header::CACHE_CONTROL,
                            http::HeaderValue::from_static("no-store"),
                        );
                        resp
                    },
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            hotpatch::hotpatch_save,
            hotpatch::hotpatch_extract
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
