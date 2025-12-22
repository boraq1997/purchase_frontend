import api from '../api/api';
// api = axios instance جاهز، مثل باقي المشروع

/* ---------------------------------------------
    TYPES
---------------------------------------------- */

export interface WarehouseCheck {
  id: number;
  purchase_request_id: number;
  request_item_id: number;
  availability: "available" | "partial" | "unavailable"; 
  condition: "new" | "used" | "damaged" | null;
  available_quantity: number;
  recommendation: "provide_from_stock" | "purchase_new" | "reject";
  notes: string | null;
  checked_by: number | null;

  // العلاقات المحملة من Laravel
  purchase_request?: any;
  request_item?: any;
  checked_by_user?: any;
}

export interface CreateWarehouseCheckPayload {
  purchase_request_id: number;
  request_item_id: number;
  availability: "available" | "partial" | "unavailable";
  condition?: "new" | "used" | "damaged";
  available_quantity?: number;
  recommendation?: "provide_from_stock" | "purchase_new" | "reject";
  notes?: string | null;
  checked_by: number;
}

export interface UpdateWarehouseCheckPayload {
  availability?: "available" | "partial" | "unavailable";
  condition?: "new" | "used" | "damaged";
  available_quantity?: number;
  recommendation?: "provide_from_stock" | "purchase_new" | "reject";
  notes?: string;
  checked_by?: number;
}

/* ---------------------------------------------
    SERVICE METHODS
---------------------------------------------- */

class WarehouseCheckService {
  
  /** جلب جميع سجلات فحص المخزن */
  async getAll(): Promise<WarehouseCheck[]> {
    const response = await api.get<WarehouseCheck[]>("/warehouse-checks");
    return response.data;
  }

  /** جلب تقرير مادة معينة داخل طلب */
  async getItemReport(
    purchaseRequestId: number,
    requestItemId: number
  ): Promise<WarehouseCheck> {
    const response = await api.get<WarehouseCheck>(
      `/warehouse-checks/report/${purchaseRequestId}/${requestItemId}`
    );
    return response.data;
  }

  /** جلب فحص مستودع حسب الـ ID */
  async getById(id: number): Promise<WarehouseCheck> {
    const response = await api.get<WarehouseCheck>(`/warehouse-checks/${id}`);
    return response.data;
  }

  /** إنشاء فحص مخزني جديد */
  async create(payload: CreateWarehouseCheckPayload): Promise<WarehouseCheck> {
    const response = await api.post<WarehouseCheck>("/warehouse-checks", payload);
    return response.data;
  }

  /** تحديث فحص مخزني */
  async update(
    id: number,
    payload: UpdateWarehouseCheckPayload
  ): Promise<WarehouseCheck> {
    const response = await api.put<WarehouseCheck>(
      `/warehouse-checks/${id}`,
      payload
    );
    return response.data;
  }

  /** حذف فحص مخزني */
  async delete(id: number): Promise<void> {
    await api.delete(`/warehouse-checks/${id}`);
  }
}

export default new WarehouseCheckService();