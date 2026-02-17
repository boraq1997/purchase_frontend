import api from '../api/api';

/**
 * =============================
 * Types
 * =============================
 */
export interface ActivityLog {
  id: number;
  actor_type: string;
  actor_id?: number;
  actor_name?: string;
  actor_role?: string;
  action: string;
  action_label?: string;
  status: string;
  severity: string;
  subject_type?: string;
  subject_id?: number;
  subject_identifier?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_fields?: string[];
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  platform?: string;
  request_id?: string;
  module?: string;
  route?: string;
  method?: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLogFilters {
  actor_type?: string;
  actor_id?: number;
  actor_name?: string;
  actor_role?: string;
  subject_type?: string;
  subject_id?: number;
  subject_identifier?: string;
  action?: string;
  action_label?: string;
  status?: string;
  severity?: string;
  module?: string;
  route?: string;
  method?: string;
  from_date?: string;
  to_date?: string;
  q?: string;
  per_page?: number;
  page?: Number;
}

/**
 * =============================
 * Service
 * =============================
 */
class ActivityLogService {
  private baseUrl = '/activity-logs';

  /**
   * Get activity logs with optional filters and pagination
   */
  async getAll(filters?: ActivityLogFilters): Promise<{ data: ActivityLog[]; meta: any }> {
    const response = await api.get(this.baseUrl, { params: filters });
    return {
      data: response.data.data,
      meta: response.data.meta || {}
    };
  }

  /**
   * Get a single activity log by ID
   */
  async getById(id: number): Promise<ActivityLog> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }
}

/**
 * =============================
 * Export singleton
 * =============================
 */
export default new ActivityLogService();