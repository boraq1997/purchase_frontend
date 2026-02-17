// composables/usePurchaseRequest.ts

import { ref, computed, type Ref, type ComputedRef } from 'vue';
import purchaseRequestService from './service';
import type { 
    PurchaseRequest, 
    RequestInfo,
    RequestItem,
    Estimate,
    Procurement,
    Report,
    Statistics,
    ReportData
} from './types';

interface UsePurchaseRequestReturn {
    purchaseRequest: Ref<PurchaseRequest | null>;
    loading: Ref<boolean>;
    error: Ref<string | null>;
    fetchPurchaseRequest: (id: number) => Promise<PurchaseRequest | undefined>;
    requestInfo: ComputedRef<RequestInfo | null>;
    items: ComputedRef<RequestItem[]>;
    estimates: ComputedRef<Array<Estimate & { estimateDate: string; formattedAmount: string }>>;
    procurements: ComputedRef<Array<Procurement & { purchaseDate: string; formattedAmount: string }>>;
    report: ComputedRef<(Report & { parsedData: ReportData; generatedAt: string }) | null>;
    statistics: ComputedRef<Statistics | null>;
}

export function usePurchaseRequest(): UsePurchaseRequestReturn {
    const purchaseRequest = ref<PurchaseRequest | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    /**
   * جلب تفاصيل طلب الشراء
   */
const fetchPurchaseRequest = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
        purchaseRequest.value = await purchaseRequestService.getPurchaseRequest(id);
        return purchaseRequest.value;
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'حدث خطأ في جلب البيانات';
        throw err;
    } finally {
        loading.value = false;
    }
};

    /**
     * معلومات الطلب المنسقة
    */
const requestInfo = computed<RequestInfo | null>(() => {
    if (!purchaseRequest.value) return null;
    
    return {
        id: purchaseRequest.value.id,
        requestNumber: purchaseRequest.value.request_number,
        title: purchaseRequest.value.title,
        description: purchaseRequest.value.description,
        status: purchaseRequestService.formatStatus(purchaseRequest.value.status_type),
        priority: purchaseRequestService.formatPriority(purchaseRequest.value.priority),
        createdAt: purchaseRequestService.formatDate(purchaseRequest.value.created_at),
        statusDate: purchaseRequest.value.status_date 
        ? purchaseRequestService.formatDate(purchaseRequest.value.status_date)
        : null,
        creator: purchaseRequest.value.creator?.name || 'غير محدد',
        reviewStage: purchaseRequest.value.review_stage
    };
});

    /**
   * العناصر المطلوبة
   */
const items = computed<RequestItem[]>(() => {
    return purchaseRequest.value?.items || [];
});

    /**
   * التقديرات والعروض
   */
const estimates = computed(() => {
    if (!purchaseRequest.value?.estimates) return [];
    return purchaseRequest.value.estimates.map(est => ({
        ...est,
        estimateDate: purchaseRequestService.formatDate(est.estimate_date),
        formattedAmount: purchaseRequestService.formatCurrency(est.total_amount),
        status: purchaseRequestService.formatStatus(est.status)
    }));
});

    /**
   * عمليات الشراء
   */
const procurements = computed(() => {
    if (!purchaseRequest.value?.procurements) return [];
    return purchaseRequest.value.procurements.map(proc => ({
        ...proc,
        purchaseDate: purchaseRequestService.formatDate(proc.purchase_date),
        formattedAmount: purchaseRequestService.formatCurrency(proc.total_amount),
        status: purchaseRequestService.formatStatus(proc.status)
    }));
});

    /**
   * التقرير
   */
const report = computed(() => {
    if (!purchaseRequest.value?.report) return null;
    
    const data = typeof purchaseRequest.value.report.data === 'string' 
      ? JSON.parse(purchaseRequest.value.report.data) as ReportData
      : purchaseRequest.value.report.data as ReportData;
    
    return {
      ...purchaseRequest.value.report,
      parsedData: data,
      generatedAt: purchaseRequestService.formatDate(purchaseRequest.value.report.generated_at)
    };
  });

  /**
   * إحصائيات سريعة
   */
  const statistics = computed<Statistics | null>(() => {
    if (!purchaseRequest.value) return null;

    const itemsList = items.value;
    const totalItems = itemsList.length;
    const itemsWithWarehouseCheck = itemsList.filter(item => item.warehouse_check).length;
    const itemsWithNeedsAssessment = itemsList.filter(item => item.needs_assessment).length;
    const totalCost = purchaseRequestService.calculateTotalCost(itemsList);

    return {
      totalItems,
      itemsWithWarehouseCheck,
      itemsWithNeedsAssessment,
      totalEstimatedCost: purchaseRequestService.formatCurrency(totalCost),
      estimatesCount: estimates.value.length,
      procurementsCount: procurements.value.length
    };
  });

  return {
    purchaseRequest,
    loading,
    error,
    fetchPurchaseRequest,
    requestInfo,
    items,
    estimates,
    procurements,
    report,
    statistics
  };
}