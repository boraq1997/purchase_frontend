import http from '../api/api'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ReportMeta {
    id: number
    report_type: 'full_review' | 'procurement_recommendation'
    generated_at: string
    purchase_request: {
        id: number
        request_number: string
        title: string
        status_type: string
        priority: string
    }
    generated_by: {
        id: number
        name: string
    } | null
}

export interface ReportImage {
    id: number
    file_name: string
    file_url: string | null
    file_type: string | null
    file_size: number | null
    uploaded_by: number | null
}

export interface WarehouseCheck {
    availability: string
    availability_label: string
    available_quantity: number
    item_condition: string
    recommendation: string
    recommendation_label: string
    notes: string
    checked_by: string
    checked_at: string
}

export interface NeedsAssessment {
    urgency_level: string
    urgency_label: string
    needs_status: string
    needs_status_label: string
    quantity_needed_after_assessment: number | null
    admin_decision: string
    admin_decision_label: string
    reason: string
    recommended_action: string
    admin_comment: string
    assessed_by: string
    assessed_at: string
}

export interface EstimateItemInReport {
    id: number
    item_name: string
    quantity: number
    unit_price: number
    total_price: number
    notes: string
    estimate: {
        id: number
        status: string
        status_label: string
        estimate_date: string
        total_amount: number
        vendor: { name: string }
        images: ReportImage[]
    } | null
}

export interface ReportItem {
    id: number
    item_name: string
    quantity: number
    specifications: string
    estimated_unit_price: number
    total_estimated_price: number
    unit: { id: number; name: string; code: string } | null
    warehouse_check: WarehouseCheck | null
    needs_assessment: NeedsAssessment | null
    estimate_items: EstimateItemInReport[]
}

export interface ReportEstimate {
    id: number
    status: string
    status_label: string
    total_amount: number
    estimate_date: string
    notes: string
    vendor: {
        id: number
        name: string
        phone1: string
        phone2: string | null
        email: string
        address: string
    } | null
    items: {
        item_name: string
        quantity: number
        unit_price: number
        total_price: number
        notes: string
    }[]
    images: ReportImage[]
}

export interface ReportProcurement {
    id: number
    reference_no: string
    status: string
    status_label: string
    total_amount: number
    purchase_date: string
    notes: string
    created_by: string
    items: {
        item_name: string
        unit: string
        quantity: number
        unit_price: number
        purchase_price: number
        estimate_price: number
        difference: number
        total_price: number
        notes: string
    }[]
}

export interface ReportData {
    purchase_request: {
        id: number
        request_number: string
        title: string
        description: string
        status_type: string
        status_label: string
        priority: string
        priority_label: string
        total_estimated_cost: number
        rejected_reason: string
        status_date: string | null
        created_at: string
        department: { name: string }
        committee: { name: string }
        creator: { name: string }
        images: ReportImage[]
    }
    items: ReportItem[]
    estimates: ReportEstimate[]
    procurements: ReportProcurement[]
    financial: {
        total_estimated_cost: number
        accepted_estimates_total: number
        actual_procurement_total: number
        saving: number | null
        estimates_count: number
        accepted_estimates_count: number
        procurements_count: number
        estimates_by_vendor: Record<string, number>
    }
    generated_at: string
    generated_by: string
}

export interface StoreReportPayload {
    purchase_request_id: number
    report_type?: 'full_review' | 'procurement_recommendation'
}

// ─── Service ────────────────────────────────────────────────────────────────

const reportService = {

    /** قائمة التقارير المحفوظة */
    getAll(params?: { page?: number; per_page?: number; report_type?: string; purchase_request_id?: number }) {
        return http.get('/reports', { params }).then(r => r.data)
    },

    /** بيانات تقرير واحد (سجل فقط) */
    getOne(reportId: number) {
        return http.get(`/reports/${reportId}`).then(r => r.data)
    },

    /** بيانات التقرير الكاملة لطلب شراء محدد */
    getData(purchaseRequestId: number): Promise<{ success: boolean; data: ReportData }> {
        return http.get(`/reports/${purchaseRequestId}/data`).then(r => r.data)
    },

    /** حفظ سجل التقرير + الحصول على البيانات */
    store(payload: StoreReportPayload): Promise<{ success: boolean; message: string; report: ReportMeta; data: ReportData }> {
        return http.post('/reports', payload).then(r => r.data)
    },

    /** تحديث سجل التقرير */
    update(reportId: number, payload: { report_type?: string }) {
        return http.put(`/reports/${reportId}`, payload).then(r => r.data)
    },

    /** حذف تقرير */
    destroy(reportId: number) {
        return http.delete(`/reports/${reportId}`).then(r => r.data)
    },
    // جلب طلبات الشراء التي ليس لها تقرير
    getAvailablePurchaseRequests() {
        return http.get('/purchase-requests', {
            params: { without_report: true }
        })
    },
}

export default reportService