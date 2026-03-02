export interface Unit {
    id: number
    name: string
    code: string | null
    description: string | null
    created_at: string | null
    updated_at: string | null
    request_items_count?: number
}

export interface CreateUnitPayload {
    name: string
    code?: string | null
    description?: string | null
}

export interface UpdateUnitPayload {
    name?: string
    code?: string | null
    description?: string | null
}

export interface PaginatedResponse<T> {
    data: T[]
    links: {
        first: string | null
        last: string | null
        prev: string | null
        next: string | null
    }
    meta: {
        current_page: number
        from: number | null
        last_page: number
        path: string
        per_page: number
        to: number | null
        total: number
    }
}

export interface DeleteResponse {
    success: boolean
    message: string
}

export interface UnitFilters {
    search?: string
    page?: number
    per_page?: number
}