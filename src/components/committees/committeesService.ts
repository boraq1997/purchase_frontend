import api from '../api/api';

// =============================
// 🧩 أنواع البيانات (Interfaces)
// =============================

export interface CommitteeUser {
  id: number;
  name: string;
  email: string;
  username: string;
  department?: {
    id: number;
    name: string;
  } | null;
}

export interface CommitteeDepartment {
  id: number;
  name: string;
}

export interface CommitteeManager {
  id: number;
  name: string;
  email: string;
  username: string;
}

export interface Committee {
  id?: number;
  name: string;
  description?: string | null;
  department_id?: number | null;
  department?: CommitteeDepartment | null;
  manager_user_id?: number | null;
  manager?: CommitteeManager | null;
  users: CommitteeUser[];
}

// =============================
// 🧭 خدمة اللجان (Committees)
// =============================

class CommitteesService {
  // جلب جميع اللجان
  async getAll(): Promise<Committee[]> {
    const response = await api.get<{ data: Committee[] }>('/committees');
    return response.data.data;
  }

  // جلب لجنة واحدة حسب ID
  async getById(id: number): Promise<Committee> {
    const response = await api.get<{ data: Committee }>(`/committees/${id}`);
    return response.data.data;
  }

  // إنشاء لجنة جديدة
  async create(payload: Partial<Committee>): Promise<Committee> {
    // تحويل manager إلى manager_user_id إذا كان موجوداً كمصفوفة
    if (Array.isArray(payload.manager) && payload.manager.length > 0) {
      payload.manager_user_id = payload.manager[0];
      delete payload.manager;
    }

    const response = await api.post<{ data: Committee }>('/committees', payload);
    return response.data.data;
  }

  // تعديل لجنة موجودة
  async update(id: number, payload: Partial<Committee>): Promise<Committee> {
    if (Array.isArray(payload.manager) && payload.manager.length > 0) {
      payload.manager_user_id = payload.manager[0];
      delete payload.manager;
    }

    const response = await api.put<{ data: Committee }>(`/committees/${id}`, payload);
    return response.data.data;
  }

  // حذف لجنة
  async delete(id: number): Promise<void> {
    await api.delete(`/committees/${id}`);
  }

  // جلب جميع اللجان مع المستخدمين والأقسام والمدير
  async getAllWithRelations(): Promise<Committee[]> {
    const response = await api.get<{ data: Committee[] }>('/committees/with-relations');
    return response.data.data;
  }
}

export default new CommitteesService();
