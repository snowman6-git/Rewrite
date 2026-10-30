import axios from 'axios';
import { apiBase } from '$api/client';

export interface CharacterImage {
	name: string;
	/** base64 dataUrl (data:image/png;base64,...) */
	data: string;
}

export interface AddCharacterPayload {
	name: string;
	lore: string;
	images: CharacterImage[];
}

// POST /character — 계약: doc/character-doc.md
export async function addCharacter(p: AddCharacterPayload): Promise<Record<string, unknown>> {
	const r = await axios.post(`${apiBase()}/character`, p, { withCredentials: true });
	return r.data;
}

// PATCH /character — 생성(POST)과 같은 경로, 메서드로만 구분. 미구현(404)까지 로컬 저장 폴백 — doc/character-doc.md
export async function updateCharacter(
	c_id: string,
	p: AddCharacterPayload
): Promise<Record<string, unknown>> {
	const r = await axios.patch(`${apiBase()}/character`, { c_id, ...p }, { withCredentials: true });
	return r.data;
}

// DELETE /character?c_id= — 미구현(404)까지 토스트로 실패 노출 — doc/character-doc.md
export async function deleteCharacter(c_id: string): Promise<void> {
	await axios.delete(`${apiBase()}/character`, { params: { c_id }, withCredentials: true });
}

export async function listCharacters(): Promise<Record<string, unknown>[]> {
	const r = await axios.get(`${apiBase()}/character`, { withCredentials: true });
	return r.data;
}
