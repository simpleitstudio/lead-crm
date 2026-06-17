export class PaginationVo {
  public readonly page: number;
  public readonly limit: number;
  public readonly offset: number;

  constructor(page = 1, limit = 20) {
    this.page = Math.max(1, page);
    this.limit = Math.min(Math.max(1, limit), 100);
    this.offset = (this.page - 1) * this.limit;
  }
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  items: T[];
  totalCount: number;
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  pagination: PaginationVo,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / pagination.limit);
  return {
    data,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    },
    items: data,
    totalCount: total,
  };
}
