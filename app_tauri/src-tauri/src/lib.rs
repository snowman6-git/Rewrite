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
fn normalize_path(raw: &str) -> String {
	let p = raw.trim_start_matches('/');
	p.strip_prefix("local/").unwrap_or(p).to_string()
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.plugin(tauri_plugin_opener::init())
		.plugin(
			tauri::plugin::Builder::<tauri::Wry, ()>::new("hotpatch")
				.register_asynchronous_uri_scheme_protocol("rewrite", |ctx, request, responder| {
					let raw = request.uri().path().to_string();
					let path = if normalize_path(&raw).is_empty() {
						// rewrite://local/ (빈 path) = index.html
						"index.html".to_string()
					} else {
						normalize_path(&raw)
					};
					let handle = ctx.app_handle().clone();
					tauri::async_runtime::spawn_blocking(move || {
						// 1) 핫패치 active/  2) 임베드 에셋  3) 미스 = 디버그 404
						let found: Option<Vec<u8>> =
							hotpatch::resolve_asset(&path).or_else(|| {
								handle.asset_resolver().get(path).map(|a| a.bytes)
							});
						let (status, bytes) = match found {
							Some(b) => (http::StatusCode::OK, b),
							None => (
								http::StatusCode::NOT_FOUND,
								not_found_html(&raw),
							),
						};
						let mut resp = http::Response::new(bytes);
						*resp.status_mut() = status;
						resp.headers_mut().insert(
							http::header::CONTENT_TYPE,
							http::HeaderValue::from_static(mime_for(&raw)),
						);
						responder.respond(resp);
					});
				})
				.build(),
		)
		.invoke_handler(tauri::generate_handler![
			hotpatch::hotpatch_save,
			hotpatch::hotpatch_extract
		])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
