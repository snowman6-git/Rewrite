import axios from 'axios';
import type { Book } from '$lib/types';
import { PUBLIC_API_URL } from '$env/static/public';

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
	const response = await axios.get(`${PUBLIC_API_URL}/book_listup`, {
		withCredentials: true
	});
	return response.data;
}

export async function loadBook_detail(book_id: string): Promise<Book[]> {
	const response = await axios.get(`${PUBLIC_API_URL}/book_detail?id=${book_id}`, {
		withCredentials: true
	});
	return response.data;
}

export async function library_listup(): Promise<any[]> {
	const response = await axios.get(`${PUBLIC_API_URL}/library_listup`, {
		withCredentials: true
	});
	return response.data;
}

export async function createBook(data: BookCreateRequest): Promise<Book> {
	const response = await axios.post<Book>(`${PUBLIC_API_URL}/book_create`, data, {
		withCredentials: true
	});
	return response.data;
}

export async function updateBook(data: BookUpdateRequest): Promise<Book> {
	const response = await axios.put<Book>(`${PUBLIC_API_URL}/book_update`, data, {
		withCredentials: true
	});
	return response.data;
}

export async function deleteBook(id: number): Promise<void> {
	await axios.delete(`${PUBLIC_API_URL}/book_delete`, {
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
		const response = await axios.post(`${PUBLIC_API_URL}/book_upload`, formData, {
			withCredentials: true
		});

		return response.data;
	} catch (error: any) {
		console.error('[uploadFiles] axios error:', error);
		console.error('[uploadFiles] error response:', error.response?.data);

		// 서버에서 반환한 에러 메시지 추출
		const errorMessage = error.response?.data?.error || error.message || '업로드 실패';
		throw new Error(errorMessage);
	}
}
