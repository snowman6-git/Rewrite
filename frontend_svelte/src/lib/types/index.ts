export interface Msg {
	id: string;
	sender: string;
	content: string;
	live_token?: number;
}
export interface ModelInfo {
	id: string;
	name: string;
	desc: string;
	status: string;
	context_size: number;
}
