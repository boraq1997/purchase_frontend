import api from "../api/api";

/* ================================================================
Interfaces
================================================================ */

export interface Vendor {
    id: number;
    name: string;
    phone1: string;
    phone2?: string | null;
    email?: string | null;
    address?: string | null;
}

export interface EstimateItemInput {
    request_item_id: number;
    quantity?: number;
    unit_price: number;
    notes?: string | null;
}

export interface EstimatePayload {
    vendor_id?: number;
    estimate_date: Date | null;
    status?: "pending" | "accepted" | "rejected";
    notes?: string | null;
    items?: EstimateItemInput[];
}

export interface EstimateItem {
    id: number;
    request_item_id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string | null;

    request_item?: {
        id: number;
        item_name: string;
        quantity: number;
        unit: string;
    };
}

interface PurchaseRequest {
    id: number;
    request_number: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
}

export interface Estimate {
    id: number;

    vendor?: Vendor;

    estimate_date?: string | null;
    total_amount: number;
    status: "pending" | "accepted" | "rejected";
    notes: string | null;

    estimate_items: EstimateItem[];

    purchase_request: PurchaseRequest; 

    created_at?: string;
    updated_at?: string;
}

// src/services/estimateService.ts


class EstimateService {

    /*
    |--------------------------------------------------------------------------
    | Create Estimate WITH ITEMS
    |--------------------------------------------------------------------------
    */
    async createWithItems(
        purchaseRequestId: number,
        payload: EstimatePayload
    ): Promise<Estimate> {
        const res = await api.post(
            `/purchase-requests/${purchaseRequestId}/estimates/with-items`,
            payload
        );
        return res.data.data;
    }

    /*
    |--------------------------------------------------------------------------
    | Get all estimates (filters supported)
    |--------------------------------------------------------------------------
    | filters: vendor_id, department_id, request_title, status
    |--------------------------------------------------------------------------
    */
    async getAll(params?: any): Promise<{
        data: Estimate[];
        total: number;
        current_page: number;
        per_page: number;
        last_page: number;
    }> {
        const res = await api.get("/estimates", { params });

        return {
            data: res.data.data,
            total: res.data.meta.total,
            current_page: res.data.meta.current_page,
            per_page: res.data.meta.per_page,
            last_page: res.data.meta.last_page,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Get estimate by ID
    |--------------------------------------------------------------------------
    */
    async getById(id: number): Promise<Estimate> {
        const res = await api.get(`/estimates/${id}`);
        return res.data.data;
    }

    /*
    |--------------------------------------------------------------------------
    | Get latest estimate by request item
    |--------------------------------------------------------------------------
    */
    async getByRequestItem(requestItemId: number): Promise<Estimate | null> {
        const res = await api.get(`/estimates/by-item/${requestItemId}`);
        return res.data.data;
    }

    /*
    |--------------------------------------------------------------------------
    | Update estimate
    |--------------------------------------------------------------------------
    */
    async update(id: number, payload: Partial<EstimatePayload>): Promise<Estimate> {
        const res = await api.put(`/estimates/${id}`, payload);
        return res.data.data;
    }

    /*
    |--------------------------------------------------------------------------
    | Delete estimate
    |--------------------------------------------------------------------------
    */
    async delete(id: number): Promise<boolean> {
        const res = await api.delete(`/estimates/${id}`);
        return res.data.status === true;
    }
}

export default new EstimateService();