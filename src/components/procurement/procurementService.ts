import api from "../api/api";

export interface ProcurementItem {
    id?: number;
    request_item_id?: number | null;
    estimate_id?: number | null;
    estimate_item_id?: number | null;
    item_name: string;
    unit_id?: number | null;
    unit?: { id: number; name: string } | null;
    quantity: number;
    unit_price: number;
    purchase_price: number;
    estimate_price: number;
    total_price?: number;
    difference?: number | null;
    notes?: string | null;
    estimate?: { id: number; vendor: string; total_amount: number };
    estimate_item?: { id: number; item_name: string; quantity: number };
}

export interface Procurement {
    id: number;
    reference_no?: string | null;
    purchase_date?: string | null;
    total_amount: number;
    status: 'in_progress' | 'completed' | 'cancelled';
    notes?: string | null;
    purchase_request?: {
        id: number;
        request_number: string;
        title: string;
        description?: string | null;
        department?: { id: number; name: string } | null;
    };
    items?: ProcurementItem[];
    created_at?: string;
    updated_at?: string;
}

export interface ProcurementPayload {
    purchase_request_id: number | null;
    reference_no?: string | null;
    purchase_date?: string | null;
    status?: 'in_progress' | 'completed' | 'cancelled';
    notes?: string | null;
    selected_estimate_ids?: number[];
    items: {
        request_item_id?: number | null;
        estimate_id?: number | null;
        estimate_item_id?: number | null;
        item_name: string;
        unit_id?: number | null;
        quantity: number;
        unit_price?: number;
        purchase_price: number;
        estimate_price?: number;
        notes?: string | null;
    }[];
}

class ProcurementService {
    async getAll(params?: any): Promise<Procurement[]> {
        const res = await api.get('/procurements', { params });
        return res.data.data ?? res.data;
    }

    async getById(id: number): Promise<Procurement> {
        const res = await api.get(`/procurements/${id}`);
        return res.data.data ?? res.data;
    }

    async create(payload: ProcurementPayload): Promise<Procurement> {
        const res = await api.post('/procurements', payload);
        return res.data.data ?? res.data;
    }

    async createWithFiles(formData: FormData): Promise<Procurement> {
        const res = await api.post('/procurements', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data ?? res.data;
    }

    async update(id: number, payload: Partial<ProcurementPayload>): Promise<Procurement> {
        const res = await api.put(`/procurements/${id}`, payload);
        return res.data.data ?? res.data;
    }

    async updateWithFiles(id: number, formData: FormData): Promise<Procurement> {
        formData.append('_method', 'PUT');
        const res = await api.post(`/procurements/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data ?? res.data;
    }

    async delete(id: number): Promise<boolean> {
        const res = await api.delete(`/procurements/${id}`);
        return res.data.status === true;
    }

    async markAsCompleted(id: number): Promise<Procurement> {
        const res = await api.patch(`/procurements/${id}/complete`);
        return res.data.data ?? res.data;
    }
}

export default new ProcurementService();