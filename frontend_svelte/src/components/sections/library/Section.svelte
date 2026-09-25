<script lang="ts">
	import { library_listup, deleteBook } from '$lib/api/book';
	import { toast } from '$lib/stores/toast.svelte';
	import LibrarySection from './LibrarySection.svelte';

	interface DeskBook {
		id: string;
		title: string;
		lastLine: string;
		label: string;
	}

	interface RawLibraryItem {
		session_id: string;
		title?: string;
		lastLine?: string;
		label?: string;
	}

	function errMsg(error: unknown, fallback: string): string {
		return error instanceof Error && error.message ? error.message : fallback;
	}

	let books = $state<DeskBook[]>([]);
	let isLoading = $state(false);
	let isError = $state(false);
	let errorMessage = $state('');

	async function loadBooksData() {
		isLoading = true;
		isError = false;
		errorMessage = '';

		try {
			const data = (await library_listup()) as RawLibraryItem[];
			books = data.map((book) => ({
				id: book.session_id,
				title: book.title || '제목 없음',
				lastLine: book.lastLine || '',
				label: book.label || '분류 없음'
			}));
		} catch (error) {
			isError = true;
			errorMessage = errMsg(error, '서재를 불러오는데 실패했습니다.');
			toast.error(errorMessage);
		} finally {
			isLoading = false;
		}
	}

	// 초기 로드
	if (typeof window !== 'undefined') {
		loadBooksData();
	}

	async function handleDelete(book: DeskBook) {
		try {
			await deleteBook(book.id);
			toast.success('책이 삭제되었습니다.');
			books = books.filter((b) => b.id !== book.id);
		} catch (error) {
			toast.error(errMsg(error, '삭제에 실패했습니다.'));
		}
	}

</script>

<LibrarySection
	{books}
	{isLoading}
	{isError}
	{errorMessage}
	onDelete={handleDelete}
	onRefresh={loadBooksData}
/>
