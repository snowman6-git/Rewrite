export interface Msg {
	// 임시로 프백 통일
	pid: string;
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
	id: string;
	title: string;
	desc?: string;
	author?: string;
	category?: string;
	usageCount?: number;
	createdAt?: string;
	content?: string;
}
