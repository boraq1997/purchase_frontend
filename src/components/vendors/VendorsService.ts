import api from '../api/api';

export interface VendorCreator {
    id: number;
    fullname: string;
    username: string;
}

export interface Vendor {
    id?: number;
    name: string;
    phone1: string;
    phone2?: string;
    email: string;
    address: string;
    creator?: VendorCreator;
}

// إذا لديك pagination
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

class VendorsService {

    // ⬅ يدعم pagination وغير pagination
    async getAll(params?: any): Promise<PaginatedResponse<Vendor> | Vendor[]> {
        const response = await api.get('/vendors', { params });

        return response.data.data;
    }

    // ⬅ جلب نفس البيانات مع Relations كاملة
    async getAllVendorsWithRelations(params?: any): Promise<PaginatedResponse<Vendor> | Vendor[]> {
        const response = await api.get('/vendors/with-relations', { params });

        return response.data.data;
    }

    async getById(id: number): Promise<Vendor> {
        const response = await api.get(`/vendors/${id}`);
        return response.data.data;
    }

    async create(payload: Partial<Vendor>): Promise<Vendor> {
        const response = await api.post('/vendors', payload);
        return response.data.data;
    }

    async update(id: number, payload: Partial<Vendor>): Promise<Vendor> {
        const response = await api.put(`/vendors/${id}`, payload);
        return response.data.data;
    }

    async delete(id: number): Promise<void> {
        await api.delete(`/vendors/${id}`);
    }
}

export default new VendorsService();