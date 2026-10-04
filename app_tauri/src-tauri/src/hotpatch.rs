// 인앱 핫패치 — doc/hotpatch-doc.md §5 구현
// 구조: {data_local}/com.snowman6.rewrite/hotpatch/
//   ui-v{ver}.zip — 저장된 패치
//   staging/      — 추출 임시
//   active/       — 적용된 패치 (rewrite:// 스킴 핸들러가 여기서 우선 서빙)
// active에 파일이 없으면 → None → lib.rs가 임베드 에셋으로 폴백
use base64::Engine;
use std::fs;
use std::path::PathBuf;

fn hotpatch_root() -> Result<PathBuf, String> {
	let data_local = dirs::data_local_dir().ok_or("data_local_dir 없음")?;
	Ok(data_local.join("com.snowman6.rewrite").join("hotpatch"))
}

fn active_dir() -> Result<PathBuf, String> {
	Ok(hotpatch_root()?.join("active"))
}

/// 패치 에셋 리졸브: active/{path} 존재 시 Some(byte) — 없으면 None (임베드 폴백)
pub fn resolve_asset(path: &str) -> Option<Vec<u8>> {
	if path.is_empty() {
		return None;
	}
	// "../" 탈출 방어
	if path.contains("..") {
		return None;
	}
	let clean = path.strip_prefix("./").unwrap_or(path);
	let p = active_dir().ok()?.join(clean);
	fs::read(&p).ok()
}

#[tauri::command]
pub fn hotpatch_save(ver: String, data_base64: String) -> Result<(), String> {
	let root = hotpatch_root()?;
	fs::create_dir_all(&root).map_err(|e| e.to_string())?;
	let zip_path = root.join(format!("ui-v{}.zip", ver));
	let bytes = base64::engine::general_purpose::STANDARD
		.decode(data_base64.as_bytes())
		.map_err(|e| format!("base64: {}", e))?;
	fs::write(&zip_path, bytes).map_err(|e| e.to_string())?;
	Ok(())
}

/// zip-slip 방어: enclosed_name()이 None인(절대경로/..) entry는 reject
#[tauri::command]
pub fn hotpatch_extract(ver: String) -> Result<(), String> {
	let root = hotpatch_root()?;
	let zip_path = root.join(format!("ui-v{}.zip", ver));
	fs::create_dir_all(&root).map_err(|e| e.to_string())?;

	let staging = root.join("staging");
	if staging.exists() {
		fs::remove_dir_all(&staging).map_err(|e| e.to_string())?;
	}
	fs::create_dir_all(&staging).map_err(|e| e.to_string())?;

	{
		let file = fs::File::open(&zip_path).map_err(|e| format!("zip 없음: {}", e))?;
		let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;
		for i in 0..archive.len() {
			let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
			let name = entry
				.enclosed_name()
				.ok_or_else(|| format!("zip-slip: {:?}", entry.name()))?;
			let target = staging.join(name);
			if entry.is_dir() {
				fs::create_dir_all(&target).map_err(|e| e.to_string())?;
			} else {
				if let Some(parent) = target.parent() {
					fs::create_dir_all(parent).map_err(|e| e.to_string())?;
				}
				let mut out = fs::File::create(&target).map_err(|e| e.to_string())?;
				std::io::copy(&mut entry, &mut out).map_err(|e| e.to_string())?;
			}
		}
	}

	// index.html 없으면 실패 (부정형 패치 차단)
	if !staging.join("index.html").exists() {
		let _ = fs::remove_dir_all(&staging);
		return Err("패치에 index.html 없음".into());
	}

	// 원자 교체: active 삭제 → staging 이동
	let active = root.join("active");
	if active.exists() {
		fs::remove_dir_all(&active).map_err(|e| e.to_string())?;
	}
	fs::rename(&staging, &active).map_err(|e| e.to_string())?;
	Ok(())
}
