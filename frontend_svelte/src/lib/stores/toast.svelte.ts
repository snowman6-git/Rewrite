export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
	duration?: number;
}

class ToastState {
	private nextId = $state(1);
	queue = $state<Toast[]>([]);

	add(toast: Omit<Toast, 'id'>) {
		const id = this.nextId++;
		const newToast: Toast = { ...toast, id };

		this.queue.push(newToast);

		const duration = toast.duration || 3000;
		setTimeout(() => this.remove(id), duration);

		return id;
	}

	remove(id: number) {
		this.queue = this.queue.filter((t) => t.id !== id);
	}

	success(message: string, duration?: number) {
		return this.add({ message, type: 'success', duration });
	}

	error(message: string, duration?: number) {
		return this.add({ message, type: 'error', duration });
	}

	warning(message: string, duration?: number) {
		return this.add({ message, type: 'warning', duration });
	}

	info(message: string, duration?: number) {
		return this.add({ message, type: 'info', duration });
	}

	clear() {
		this.queue = [];
	}
}

export const toast = new ToastState();
