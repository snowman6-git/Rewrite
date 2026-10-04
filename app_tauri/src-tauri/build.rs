fn main() {
	tauri_build::try_build(
		tauri_build::Attributes::new().app_manifest(
			tauri_build::AppManifest::new().commands(&["hotpatch_save", "hotpatch_extract"]),
		),
	)
	.expect("error while running tauri build script");
}
