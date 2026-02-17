import api from '../api/api';

/* =============================
🧩 Data Interfaces
============================= */

// Permission Interface
export interface Permission {
  id: number;
  name: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: any;
}

// Role Interface
export interface Role {
  id: number;
  name: string;
  guard_name?: string;
  permissions: Permission[];
  permissions_count?: number;
  created_at?: string;
}

// Filters for fetching roles
export interface RoleFilters {
  search?: string;              // General search text
  name?: string;                // Filter by role name
  guard_name?: string;          // Filter by guard name
  permissions?: string[];       // Filter by permission names
  permissions_count_min?: number;
  permissions_count_max?: number;
  created_from?: string;        // YYYY-MM-DD
  created_to?: string;          // YYYY-MM-DD
  order_by?: string;
  order_dir?: 'asc' | 'desc';
  all?: boolean;                // Fetch all roles without pagination
  per_page?: number;            // Pagination limit
}

/* =============================
 🧭 Roles Service
 ============================= */

class RolesService {
  /**
   * Fetch all roles with optional filters
   * @param filters Optional RoleFilters
   * @returns Array of Role
   */
  async getAllRoles(filters?: RoleFilters): Promise<Role[]> {
    const response = await api.get<{ data: Role[] }>('/roles', { params: filters });
    return response.data.data;
  }

  /**
   * Fetch all permissions for roles
   * @returns Array of Permission
   */
  async getAllPermissions(): Promise<PaginatedResponse<Permission> | Permission[]> {
    const response = await api.get<{ data: Permission[] }>('/permissions');
    return response.data.data;
  }

  /**
   * Fetch single role by ID including its permissions
   * @param id Role ID
   * @returns Role
   */
  async getRoleById(id: number): Promise<Role> {
    const response = await api.get<{ data: Role }>(`/roles/${id}`);
    return response.data.data;
  }

  /**
   * Create a new role with its permissions
   * @param payload Partial<Role>
   * @returns Created Role
   */
  async createRole(payload: Partial<Role>): Promise<Role> {
    const response = await api.post<{ data: Role }>('/roles', payload);
    return response.data.data;
  }

  /**
   * Update an existing role and its permissions
   * @param id Role ID
   * @param payload Partial<Role>
   * @returns Updated Role
   */
  async updateRole(id: number, payload: Partial<Role>): Promise<Role> {
    const response = await api.put<{ data: Role }>(`/roles/${id}`, payload);
    return response.data.data;
  }

  /**
   * Delete a role by ID
   * @param id Role ID
   */
  async deleteRole(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  }
}

export default new RolesService();