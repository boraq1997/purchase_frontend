// services/purchaseRequestService.ts

import api from '../../../../api/api';


import type { 
  PurchaseRequest, 
  FormattedStatus, 
  FormattedPriority,
  StatusType,
  PriorityType
} from './types';

class PurchaseRequestService {
  /**
   * جلب تفاصيل طلب الشراء حسب المعرف
   */
  async getPurchaseRequest(id: number): Promise<PurchaseRequest> {
    try {
      const response = await api.get(`reportGene/${id}`)
      return response.data;
    } catch (error) {
      console.error('خطأ في جلب بيانات طلب الشراء:', error);
      throw error;
    }
  }

  /**
   * جلب جميع طلبات الشراء
   */
  // async getAllPurchaseRequests(): Promise<PurchaseRequest[]> {
  //   try {
  //     const response = await axios.get<PurchaseRequest[]>(`${API_URL}/reportGene`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('خطأ في جلب قائمة طلبات الشراء:', error);
  //     throw error;
  //   }
  // }

  /**
   * إنشاء طلب شراء جديد
   */
  // async createPurchaseRequest(data: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
  //   try {
  //     const response = await axios.post<PurchaseRequest>(`${API_URL}/reportGene`, data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('خطأ في إنشاء طلب الشراء:', error);
  //     throw error;
  //   }
  // }

  /**
   * تحديث طلب شراء موجود
   */
  // async updatePurchaseRequest(id: number, data: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
  //   try {
  //     const response = await axios.put<PurchaseRequest>(`${API_URL}/reportGene/${id}`, data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('خطأ في تحديث طلب الشراء:', error);
  //     throw error;
  //   }
  // }

  /**
   * حذف طلب شراء
   */
  // async deletePurchaseRequest(id: number): Promise<void> {
  //   try {
  //     await axios.delete(`${API_URL}/reportGene/${id}`);
  //   } catch (error) {
  //     console.error('خطأ في حذف طلب الشراء:', error);
  //     throw error;
  //   }
  // }

  /**
   * تنسيق حالة الطلب للعرض
   */
  formatStatus(status: StatusType): FormattedStatus {
    const statusMap: Record<StatusType, FormattedStatus> = {
      pending: { label: 'قيد الانتظار', severity: 'warning' },
      approved: { label: 'معتمد', severity: 'success' },
      rejected: { label: 'مرفوض', severity: 'danger' },
      completed: { label: 'مكتمل', severity: 'info' },
      cancelled: { label: 'ملغي', severity: 'secondary' }
    };
    return statusMap[status] || { label: status, severity: 'info' };
  }

  /**
   * تنسيق مستوى الأولوية للعرض
   */
  formatPriority(priority: PriorityType): FormattedPriority {
    const priorityMap: Record<PriorityType, FormattedPriority> = {
      low: { label: 'منخفضة', severity: 'info' },
      medium: { label: 'متوسطة', severity: 'warning' },
      high: { label: 'عالية', severity: 'danger' }
    };
    return priorityMap[priority] || { label: priority, severity: 'info' };
  }

  /**
   * حساب إجمالي التكلفة للعناصر
   */
  calculateTotalCost(items: Array<{ total_estimated_price: string }>): number {
    return items.reduce((total, item) => {
      return total + parseFloat(item.total_estimated_price || '0');
    }, 0);
  }

  /**
   * تنسيق الرقم بفواصل عربية
   */
  formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toLocaleString('ar-IQ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }) + ' د.ع';
  }

  /**
   * تنسيق التاريخ بصيغة عربية
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export default new PurchaseRequestService();