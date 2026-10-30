// 페르소나 타입 — 데이터는 API(/character)가 원천, 로컬 스토리지 없음 (2026-10-30)
export interface PersonaImage {
	id: string;
	name: string;
	dataUrl: string;
}

export interface Persona {
	id: string;
	name: string;
	lore: string;
	images: PersonaImage[];
}

// DB row(c_id·c_name·c_lore) → Persona — c_ 접두는 DB 내부 명명이라 표현 경계에서 번역 (2026-10-30)
export function mapCharacterRow(r: Record<string, unknown>): Persona {
	return {
		id: String(r.c_id ?? ''),
		name: String(r.c_name ?? ''),
		lore: String(r.c_lore ?? ''),
		images: [] // images 스키마 결정 전까지 빈 배열
	};
}
