import api from '../api/api';

// =============================
// 🧩 أنواع البيانات (Interfaces)
// =============================

export interface PurchaseRequestItem {
  id?: number;
  item_name: string;
  quantity: number;
  unit?: string | null;
  notes?: string | null;
}

export interface PurchaseRequest {
  id?: number;
  request_number?: string;
  title: string;
  description?: string | null;
  department_id: number;
  user_id: number;
  committee_id?: number | null;
  priority?: 'low' | 'medium' | 'high';

  status_type?: 
    'draft' | 'pending' | 'approved' | 'rejected' | 'completed';

  rejected_reason?: string | null;
  closed_at?: string | null;

  // العناصر
  items?: PurchaseRequestItem[];

  // العلاقات (اختيارية)
  department?: { id: number; name: string };
  committee?: { id: number; name: string };
  creator?: {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
  };
}

class PurchaseRequestsService {

  async getAll(params?: any): Promise<PurchaseRequest[]> {
    const response = await api.get<{ data: PurchaseRequest[] }>(
      '/purchase-requests',
      { params }
    );
    return response.data.data;
  }

  async getById(id: number): Promise<PurchaseRequest> {
    const response = await api.get<{ data: PurchaseRequest }>(
      `/purchase-requests/${id}`
    );
    return response.data.data;
  }

  async create(payload: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const response = await api.post<{ data: PurchaseRequest }>(
      '/purchase-requests',
      payload
    );
    return response.data.data;
  }

  async update(id: number, payload: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const response = await api.put<{ data: PurchaseRequest }>(
      `/purchase-requests/${id}`,
      payload
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/purchase-requests/${id}`);
  }

  async saveNeedsAssessment(data: any) {
    return api.post('needs-assessments', data);
  }

  async getNeedsAssessment(id: any) {
    return api.get(`/needs-assessments/${id}`)
  }

async getAssessmentByItem(purchaseRequestId: number, requestItemId: number) {
  return api.get(`/needs-assessments/by-item/${purchaseRequestId}/${requestItemId}`);
}
  // =============================
  // 🆕 جلب طلبات قسم معيّن فقط
  // =============================
  async getByDepartment(departmentId: number): Promise<PurchaseRequest[]> {
    const response = await api.get<{ data: PurchaseRequest[] }>(
      '/purchase-requests',
      {
        params: {
          department_id: departmentId
        }
      }
    );

    return response.data.data;
  }
}

export default new PurchaseRequestsService();