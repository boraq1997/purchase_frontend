// src/service/UserService.ts
import api from '../api/api';

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone?: string;
  status: 'active' | 'inactive';
  department?: {
    id: number;
    name: string;
  } | null;
  parent?: {
    id: number;
    name: string;
  } | null;
  committees?: { id: number; name: string }[];
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  id?: number;
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  // role_id?: number; // إذا أردت تفعيل الدور لاحقًا
  department_id?: number | null;
  parent_id?: number | null;
  status?: 'active' | 'inactive';
  role: number | null;
}


class UserService {
  private baseUrl = '/users';

  // Fetch all users
  getAllUsers(): Promise<User[]> {
    return api.get(this.baseUrl).then(res => res.data.data);
  }

  // Fetch single user by ID
  getUserById(id: number): Promise<User> {
    return api.get(`${this.baseUrl}/${id}`).then(res => res.data.data);
  }

  // Create new user
  createUser(data: UserFormData): Promise<User> {
    return api.post(this.baseUrl, data).then(res => res.data.data);
  }

  // Update existing user
  updateUser(id: number, data: UserFormData): Promise<User> {
    return api.put(`${this.baseUrl}/${id}`, data).then(res => res.data.data);
  }

  // Delete user
  deleteUser(id: number): Promise<void> {
    return api.delete(`${this.baseUrl}/${id}`).then(() => {});
  }
}

export default new UserService();
