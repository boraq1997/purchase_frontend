import { ref, computed, reactive } from 'vue';
import { useToast }   from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import procurementService, {
    type Procurement,
    type ProcurementPayload,
} from '../procurementService';
import purchaseRequestsService from '../../Purchase/services/purchase-requestsService';

export function useProcurements() {
    const toast   = useToast();
    const confirm = useConfirm();

    // ── state ──────────────────────────────────────────────────────────────
    const isLoading          = ref(false);
    const isSaving           = ref(false);
    const isLoadingRequest   = ref(false);   // جلب تفاصيل الطلب المختار
    const isConfirming       = ref(false);
    const isEditMode         = ref(false);

    const allProcurements        = ref<Procurement[]>([]);
    const allPurchase            = ref<any[]>([]);
    const selectedPurchaseRequest = ref<any | null>(null);  // الطلب المختار كاملاً
    const procurementData        = ref<Procurement | null>(null);
    const procurementId          = ref<number | null>(null);

    const addEditDialogVisible  = ref(false);
    const detailsDialogVisible  = ref(false);

    const filters = ref({
        search:    '',
        status:    null as string | null,
        date_from: null,
        date_to:   null,
    });

    const procurementForm = reactive<ProcurementPayload>({
        purchase_request_id:   null,
        reference_no:          null,
        purchase_date:         null,
        status:                'in_progress',
        notes:                 null,
        selected_estimate_ids: [],
        items:                 [],
    });

    const selectedEstimateIds = ref<number[]>([]);

    // ── computed ───────────────────────────────────────────────────────────
    const statusCounts = computed(() => ({
        in_progress: allProcurements.value.filter(p => p.status === 'in_progress').length,
        completed:   allProcurements.value.filter(p => p.status === 'completed').length,
        cancelled:   allProcurements.value.filter(p => p.status === 'cancelled').length,
    }));

    const filteredProcurements = computed(() => {
        let list = allProcurements.value;
        if (filters.value.status) list = list.filter(p => p.status === filters.value.status);
        if (filters.value.search) {
            const q = filters.value.search.toLowerCase();
            list = list.filter(p =>
                p.reference_no?.toLowerCase().includes(q) ||
                p.purchase_request?.title?.toLowerCase().includes(q)
            );
        }
        return list;
    });

    // ── fetch ──────────────────────────────────────────────────────────────
    const fetchAll = async () => {
        isLoading.value = true;
        try {
            allProcurements.value = await procurementService.getAll();
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل جلب عمليات الشراء', life: 3000 });
        } finally {
            isLoading.value = false;
        }
    };

    const fetchPurchaseList = async () => {
        try {
            const res = await purchaseRequestsService.getAll();
            allPurchase.value = Array.isArray(res) ? res : (res as any).data ?? res;
        } catch {}
    };

    // جلب تفاصيل طلب الشراء المختار (مع items و estimates)
    const fetchPurchaseRequestById = async (id: number) => {
        isLoadingRequest.value = true;
        try {
            const res = await purchaseRequestsService.getById(id);
            // getById يرجع response.data — قد يكون مغلفاً بـ data
            selectedPurchaseRequest.value = (res as any).data ?? res;
        } catch {
            selectedPurchaseRequest.value = null;
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل جلب تفاصيل الطلب', life: 3000 });
        } finally {
            isLoadingRequest.value = false;
        }
    };

    // ── actions ────────────────────────────────────────────────────────────
    const openAddEditDialog = async (procurement?: Procurement | null) => {
        resetForm();
        await fetchPurchaseList();

        if (procurement) {
            isEditMode.value    = true;
            procurementId.value = procurement.id;

            procurementForm.purchase_request_id   = procurement.purchase_request?.id ?? null;
            procurementForm.reference_no          = procurement.reference_no ?? null;
            procurementForm.purchase_date         = procurement.purchase_date ?? null;
            procurementForm.status                = procurement.status;
            procurementForm.notes                 = procurement.notes ?? null;

            if (procurement.purchase_request?.id) {
                await fetchPurchaseRequestById(procurement.purchase_request.id);

                // استخراج العروض المختارة من المواد
                const ids = [...new Set(
                    (procurement.items ?? [])
                        .map(i => i.estimate_id)
                        .filter((id): id is number => id != null)
                )];
                selectedEstimateIds.value             = ids;
                procurementForm.selected_estimate_ids = ids;

                // بناء form.items من بيانات الـ procurement
                procurementForm.items = (procurement.items ?? []).map(i => ({
                    request_item_id:  i.request_item_id ?? null,
                    estimate_id:      i.estimate_id ?? null,
                    estimate_item_id: i.estimate_item_id ?? null,
                    item_name:        i.item_name,
                    unit_id:          i.unit?.id ?? null,
                    quantity:         Number(i.quantity),
                    unit_price:       Number(i.unit_price),
                    purchase_price:   Number(i.purchase_price),
                    estimate_price:   Number(i.estimate_price),
                    notes:            i.notes ?? null,
                }));
            }
        } else {
            isEditMode.value    = false;
            procurementId.value = null;
        }

        addEditDialogVisible.value = true;
    };

    // عند اختيار طلب شراء من الـ Select
    const onPurchaseRequestSelected = async (purchaseRequestId: number) => {
        procurementForm.purchase_request_id   = purchaseRequestId;
        procurementForm.selected_estimate_ids = [];
        procurementForm.items                 = [];
        selectedEstimateIds.value             = [];
        selectedPurchaseRequest.value         = null;
        await fetchPurchaseRequestById(purchaseRequestId);
    };

    // عند تغيير عروض الأسعار المختارة
    const onEstimatesSelected = (ids: number[]) => {
        selectedEstimateIds.value             = ids;
        procurementForm.selected_estimate_ids = ids;
    };

    // الحفظ — يستقبل صور الفواتير من الـ Dialog
    const submitProcurement = async (invoiceFiles: File[]) => {
        try {
            isSaving.value = true;

            // مزامنة selected_estimate_ids
            procurementForm.selected_estimate_ids = [...selectedEstimateIds.value];

            if (invoiceFiles.length) {
                // إذا كان هناك صور، استخدم FormData
                const formData = buildFormData(procurementForm, invoiceFiles);

                if (isEditMode.value && procurementId.value) {
                    await procurementService.updateWithFiles(procurementId.value, formData);
                } else {
                    await procurementService.createWithFiles(formData);
                }
            } else {
                if (isEditMode.value && procurementId.value) {
                    await procurementService.update(procurementId.value, procurementForm);
                } else {
                    await procurementService.create(procurementForm);
                }
            }

            toast.add({
                severity: 'success',
                summary:  'تم',
                detail:   isEditMode.value ? 'تم تحديث عملية الشراء' : 'تم إضافة عملية الشراء',
                life: 3000,
            });

            addEditDialogVisible.value = false;
            fetchAll();
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء الحفظ', life: 3000 });
        } finally {
            isSaving.value = false;
        }
    };

    // بناء FormData لإرسال الصور
    const buildFormData = (payload: ProcurementPayload, files: File[]): FormData => {
        const fd = new FormData();
        fd.append('purchase_request_id',   String(payload.purchase_request_id ?? ''));
        if (payload.reference_no)  fd.append('reference_no',  payload.reference_no);
        if (payload.purchase_date) fd.append('purchase_date', payload.purchase_date);
        if (payload.status)        fd.append('status',        payload.status);
        if (payload.notes)         fd.append('notes',         payload.notes);

        (payload.selected_estimate_ids ?? []).forEach((id, i) => {
            fd.append(`selected_estimate_ids[${i}]`, String(id));
        });

        payload.items.forEach((item, i) => {
            Object.entries(item).forEach(([key, val]) => {
                if (val != null) fd.append(`items[${i}][${key}]`, String(val));
            });
        });

        files.forEach((file, i) => {
            fd.append(`invoice_images[${i}]`, file);
        });

        return fd;
    };

    const confirmDelete = (procurement: Procurement) => {
        if (isConfirming.value) return;
        isConfirming.value = true;
        confirm.require({
            header:      'تأكيد الحذف',
            message:     'هل أنت متأكد من حذف عملية الشراء؟',
            icon:        'pi pi-exclamation-triangle text-yellow-500',
            acceptLabel: 'تأكيد',
            acceptClass: 'p-button-sm border border-red-500 bg-red-500 text-white',
            rejectLabel: 'إلغاء',
            rejectClass: 'p-button-sm border border-gray-400 text-gray-600 bg-transparent',
            accept: async () => {
                try {
                    await procurementService.delete(procurement.id);
                    fetchAll();
                    toast.add({ severity: 'success', summary: 'تم', detail: 'تم حذف عملية الشراء', life: 3000 });
                } catch {
                    toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل الحذف', life: 3000 });
                } finally {
                    isConfirming.value = false;
                }
            },
            reject: () => { isConfirming.value = false; },
        });
    };

    const showDetails = (procurement: Procurement) => {
        procurementData.value      = procurement;
        detailsDialogVisible.value = true;
    };

    const resetForm = () => {
        procurementForm.purchase_request_id   = null;
        procurementForm.reference_no          = null;
        procurementForm.purchase_date         = null;
        procurementForm.status                = 'in_progress';
        procurementForm.notes                 = null;
        procurementForm.selected_estimate_ids = [];
        procurementForm.items                 = [];
        selectedEstimateIds.value             = [];
        selectedPurchaseRequest.value         = null;
    };

    const resetFilters = () => {
        filters.value = { search: '', status: null, date_from: null, date_to: null };
    };

    return {
        isLoading, isSaving, isEditMode, isLoadingRequest,
        allProcurements, filteredProcurements, allPurchase,
        selectedPurchaseRequest, selectedEstimateIds,
        procurementData, procurementForm, filters, statusCounts,
        addEditDialogVisible, detailsDialogVisible,
        fetchAll, openAddEditDialog, submitProcurement,
        onPurchaseRequestSelected, onEstimatesSelected,
        confirmDelete, showDetails, resetForm, resetFilters,
    };
}