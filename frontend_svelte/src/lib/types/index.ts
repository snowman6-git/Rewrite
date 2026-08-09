export interface Msg {
	// 임시로 프백 통일
	page_id: string;
	role: string;
	content: string;
	sender?: string;
	live_token?: number;
}
export interface ModelInfo {
	id: string;
	name: string;
	desc: string;
	status: string;
	context_size: number;
}
export interface Book {
	id: number;
	title: string;
	author: string;
	category: string;
	usageCount: number;
	createdAt: string;
	content?: string;
}
