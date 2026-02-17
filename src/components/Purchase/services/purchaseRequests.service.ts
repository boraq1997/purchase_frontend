// Service module for interacting with the Purchase Request API.
// This file defines functions to fetch, create, update and delete purchase requests.

import api from '../../api/api';
import type { PurchaseRequest } from '../interfaces/purchase.interfaces';
import type { ID } from '../types/purchase.types';

const API_BASE_URL = '/purchase-requests';

export default {
  async getAll(params: any = {}): Promise<any> {
    // إزالة أي قيم null حتى لا ترسل بالطلب
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null && v !== '')
    );

    const response = await api.get(API_BASE_URL, { params: cleanParams });

    // دعم كلا الشكلين:
    // { data: [...], total: X }
    // أو شكل Laravel paginator: { data: [...], meta: { total: X } }
    const data = response.data.data ?? response.data;
    
    return {
        data: data,
        total: response.data.total ??
              response.data.meta?.total ??
              data.length
    };
  },

  async getById(id: ID): Promise<PurchaseRequest> {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: Partial<PurchaseRequest> | FormData): Promise<PurchaseRequest> {
    const response = await api.post(API_BASE_URL, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
},

  async update(id: ID, data: Partial<PurchaseRequest> | FormData): Promise<PurchaseRequest> {
    data.append('_method', 'PUT'); 
    const response = await api.post(`${API_BASE_URL}/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
},

  async delete(id: ID): Promise<void> {
    await api.delete(`${API_BASE_URL}/${id}`);
  },

  async updateStatus(id: ID, status: string, note: string | null = null): Promise<PurchaseRequest> {
      const payload: any = { status };

      if (note) {
          payload.note = note;
      }

      const response = await api.patch(`${API_BASE_URL}/${id}/status`, payload);
      return response.data;
  },
};