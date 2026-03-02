export interface StatusOption {
    label: string;
    value: string | null;
}

export interface PaginationState {
    page: number;
    per_page: number;
    total: number;
}

export interface EstimateFilters {
    vendor_name: string;
    department_id: number | null;
    request_title: string;
    status: string | null;
    date_from: Date | null;
    date_to: Date | null;
}

export interface StatusCounts {
    pending: number;
    accepted: number;
    rejected: number;
}