export type PaginationMeta = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export type PaginatedResult<T> = {
	items: T[];
	pagination: PaginationMeta;
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export function parsePaginationParams(
	searchParams: URLSearchParams,
	defaultPageSize = DEFAULT_PAGE_SIZE,
): { page: number; pageSize: number } | null {
	if (!searchParams.has('page') && !searchParams.has('limit')) return null;

	const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
	const rawLimit = Number.parseInt(searchParams.get('limit') ?? String(defaultPageSize), 10) || defaultPageSize;
	const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawLimit));

	return { page, pageSize };
}

export function buildPaginationMeta(page: number, pageSize: number, total: number): PaginationMeta {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	return {
		page,
		pageSize,
		total,
		totalPages,
	};
}

export type PaginationQuery = {
	page: number;
	pageSize: number;
};
