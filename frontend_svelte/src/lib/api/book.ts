import axios from 'axios';
import type { Book } from '$lib/types';
import { apiBase } from '$api/client';

export interface BookListResponse {
	books: Book[];
	total: number;
}

export interface BookCreateRequest {
	title: string;
	author?: string;
	category?: string;
}

export interface BookUpdateRequest extends BookCreateRequest {
	id: number;
}

export async function loadBooks(): Promise<Book[]> {
	const response = await axios.get(`${apiBase()}/book_listup`, {
		withCredentials: true
	});
	return response.data;
}

export async function loadBook_detail(book_id: string): Promise<Book[]> {
	const response = await axios.get(`${apiBase()}/book_detail?id=${book_id}`, {
		withCredentials: true
	});
	return response.data;
}

interface LibraryItem {
	session_id: string;
	title?: string;
	lastLine?: string;
	label?: string;
}

export async function library_listup(): Promise<LibraryItem[]> {
	const response = await axios.get(`${apiBase()}/library_listup`, {
		withCredentials: true
	});
	return response.data;
}

export async function createBook(data: BookCreateRequest): Promise<Book> {
	const response = await axios.post<Book>(`${apiBase()}/book_create`, data, {
		withCredentials: true
	});
	return response.data;
}

export async function updateBook(data: BookUpdateRequest): Promise<Book> {
	const response = await axios.put<Book>(`${apiBase()}/book_update`, data, {
		withCredentials: true
	});
	return response.data;
}

export async function deleteBook(id: string): Promise<void> {
	await axios.delete(`${apiBase()}/book_delete`, {
		params: { id },
		withCredentials: true
	});
}

export interface UploadBookResult {
	message: string;
	books: Array<{
		id: string;
		title: string;
		author: string;
		category: string;
		content: string;
	}>;
}

export interface UploadResult {
	message: string;
	count: number;
	books: Book[];
}

export async function uploadFiles(files: File[], type: 'zip' | 'toml'): Promise<UploadResult> {
	if (files.length === 0) {
		throw new Error('업로드할 파일이 선택되지 않았습니다.');
	}

	const formData = new FormData();
	formData.append('type', type);
	for (const file of files) {
		formData.append('files', file);
	}

	try {
		const response = await axios.post(`${apiBase()}/book_upload`, formData, {
			withCredentials: true
		});

		return response.data;
	} catch (error) {
		const e = error as { response?: { data?: { error?: string } }; message?: string };
		console.error('[uploadFiles] axios error:', e);
		console.error('[uploadFiles] error response:', e.response?.data);

		// 서버에서 반환한 에러 메시지 추출
		const errorMessage = e.response?.data?.error || e.message || '업로드 실패';
		throw new Error(errorMessage, { cause: error });
	}
}
