export interface ModelInfo {
	id: string;
	status?: {
		value: string;
	};
}
export interface BookStruct {
	id: string;
	cover?: string;
	title?: string;
	desc: string;
	starting_points?: string;
}

export interface ReadType {
	type: 'request' | 'edit' | 'chat';
}

export interface ChatInfo {
	sender: string;
	content: string;
}

export interface ResChunk {
	stream_n: number;
	content: string;
	input: number;
	output: number;
}
