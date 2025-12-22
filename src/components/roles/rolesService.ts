import api from '../api/api'

// =============================
// 🧩 أنواع البيانات (Interfaces)
// =============================

export interface Permission {
  id: number
  name: string
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

// =============================
// 🧭 خدمة إدارة الأدوار (Roles)
// =============================

class RolesService {
  // 🟢 جلب جميع الأدوار مع صلاحياتها
  async getAllRoles(): Promise<Role[]> {
    const response = await api.get<{ data: Role[] }>('/roles')
    return response.data.data
  }

  // 🟢 جلب جميع الصلاحيات (لعرضها في واجهة اختيار الصلاحيات للدور)
  async getAllPermissions(): Promise<Permission[]> {
      const response = await api.get('/permissions');
      return response.data;   // <-- هنا المشكلة كانت
  }

  // 🟡 جلب دور واحد مع صلاحياته
  async getRoleById(id: number): Promise<Role> {
    const response = await api.get<{ data: Role }>(`/roles/${id}`)
    return response.data.data
  }

  // 🟢 إنشاء دور جديد مع صلاحياته
  async createRole(payload: Partial<Role>): Promise<Role> {
    const response = await api.post<{ data: Role }>('/roles', payload)
    return response.data.data
  }

  // 🟠 تعديل دور موجود مع صلاحياته
  async updateRole(id: number, payload: Partial<Role>): Promise<Role> {
    const response = await api.put<{ data: Role }>(`/roles/${id}`, payload)
    return response.data.data
  }

  // 🔴 حذف دور
  async deleteRole(id: number): Promise<void> {
    await api.delete(`/roles/${id}`)
  }
}

export default new RolesService()
