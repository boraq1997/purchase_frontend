import api from '../api/api';
import usersService from '../users/usersService';
// =============================
// 🧩 أنواع البيانات (Interfaces)
// =============================

export interface DepartmentUser {
  id: number
  name: string
  email: string
  username: string
}

export interface DepartmentManager {
  id: number
  name: string
}

export interface Department {
  id?: number
  name: string
  username: string
  code: string
  description: string
  manager: DepartmentManager | null
  users: DepartmentUser[]
}

export interface AvailableUser {
  id: number,
  name: string,
  email: string,
  username: string,
}

// =============================
// 🧭 خدمة الأقسام (Departments)
// =============================

class DepartmentsService {
  async getAll(): Promise<Department[]> {
    const response = await api.get<{data: Department[]}>('/departments');
    return response.data.data;
  }

  // جلب جميع الأقسام
  async getAllDepartmentsWithUsers(): Promise<Department[]> {
    const response = await api.get<{ data: Department[] }>('/departments/with-users')
    return response.data.data
  }

  // جلب قسم واحد حسب ID
  async getById(id: number): Promise<Department> {
    const response = await api.get<{ data: Department }>(`/departments/${id}`)
    return response.data.data
  }

  async getAvailableForDepartment(departmentId?: number): Promise<AvailableUser[]> {
    const response = await api.get<{data: AvailableUser[]}>(
      '/users/available-for-department',
      {
        params: {
          departmentId: departmentId
        }
      }
    )
    return response.data.data
  }

  // إنشاء قسم جديد
  async create(payload: Partial<Department>): Promise<Department> {
    const response = await api.post<{ data: Department }>('/departments', payload)
    return response.data.data
  }

  // تعديل قسم موجود
  async update(id: number, payload: Partial<Department>): Promise<Department> {
    const response = await api.put<{ data: Department }>(`/departments/${id}`, payload)
    return response.data.data
  }

  // حذف قسم
  async delete(id: number): Promise<void> {
    await api.delete(`/departments/${id}`)
  }
}

export default new DepartmentsService()
