// Service module to handle the different committee opinions and actions.
// Provides helper functions for needs assessments, warehouse checks, estimates and procurements.

import api from '../../api/api';
import type {
  NeedsAssessment,
  WarehouseCheck,
  Estimate,
  Procurement,
} from '../interfaces/purchase.interfaces';
import type { ID } from '../types/purchase.types';

// Base URLs for different committee actions; adjust these if your API uses different endpoints.
const NEEDS_ASSESSMENTS_URL = '/needs-assessments';
const WAREHOUSE_CHECKS_URL = '/warehouse-checks';
const ESTIMATES_URL = '/estimates';
const PROCUREMENTS_URL = '/procurements';

export default {
  async saveNeedsAssessment(data: NeedsAssessment): Promise<NeedsAssessment> {
    const response = await api.post(NEEDS_ASSESSMENTS_URL, data);
    return response.data;
  },

  async updateNeedsAssessment(id: number, data:NeedsAssessment): Promise<NeedsAssessment> {
    const response = await api.put(`${NEEDS_ASSESSMENTS_URL}/${id}`, data);
    return response.data;
  },

  async saveWarehouseCheck(data: WarehouseCheck): Promise<WarehouseCheck> {
    const response = await api.post(WAREHOUSE_CHECKS_URL, data);
    return response.data;
  },

  async saveEstimate(data: Estimate): Promise<Estimate> {
    const response = await api.post(ESTIMATES_URL, data);
    return response.data;
  },

  async saveProcurement(data: Procurement): Promise<Procurement> {
    const response = await api.post(PROCUREMENTS_URL, data);
    return response.data;
  },

  async getNeedsAssessment(id: ID): Promise<NeedsAssessment> {
    const response = await api.get(`${NEEDS_ASSESSMENTS_URL}/${id}`);
    return response.data;
  },

  async getWarehouseCheck(id: ID): Promise<WarehouseCheck> {
    const response = await api.get(`${WAREHOUSE_CHECKS_URL}/${id}`);
    return response.data;
  },

  async getEstimate(id: ID): Promise<Estimate> {
    const response = await api.get(`${ESTIMATES_URL}/${id}`);
    return response.data;
  },

  async getProcurement(id: ID): Promise<Procurement> {
    const response = await api.get(`${PROCUREMENTS_URL}/${id}`);
    return response.data;
  },
};