export type ListResponse<T> = {
  data: T
  totalItems: number
}

export type PagedResponse<T> = {
  data: T
  pagination: {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
  }
}
