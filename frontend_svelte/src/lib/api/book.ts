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
	const response = await axios.get<BookListResponse>(`${PUBLIC_API_URL}/book_listup`, {
		withCredentials: true
	});
	return response.data?.books || [];
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