import { ref, computed, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
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
    const isLoading       = ref(false);
    const isSaving        = ref(false);
    const isLoadingEstimates = ref(false);
    const isConfirming    = ref(false);
    const isEditMode      = ref(false);

    const allProcurements  = ref<Procurement[]>([]);
    const allPurchase      = ref<any[]>([]);
    const estimatesByPurchase = ref<any[]>([]); // عروض الأسعار للطلب المختار
    const procurementData  = ref<Procurement | null>(null);
    const procurementId    = ref<number | null>(null);

    // الخطوة الحالية في الـ Stepper
    const currentStep = ref(0);

    const addEditDialogVisible  = ref(false);
    const detailsDialogVisible  = ref(false);

    const filters = ref({
        search:    '',
        status:    null as string | null,
        date_from: null,
        date_to:   null,
    });

    const procurementForm = reactive<ProcurementPayload>({
        purchase_request_id: null,
        reference_no:        null,
        purchase_date:       null,
        status:              'in_progress',
        notes:               null,
        items:               [],
    });

    // عروض الأسعار المختارة من الـ MultiSelect
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

    // عروض الأسعار المختارة فقط
    const selectedEstimates = computed(() =>
        estimatesByPurchase.value.filter(e => selectedEstimateIds.value.includes(e.id))
    );

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

    const fetchPurchase = async () => {
        try {
            allPurchase.value = await purchaseRequestsService.getAll();
        } catch {}
    };

    const fetchEstimatesByPurchase = async (purchaseRequestId: number) => {
        isLoadingEstimates.value = true;
        try {
            estimatesByPurchase.value = await procurementService.getEstimatesByPurchaseRequest(purchaseRequestId);
        } catch {
            estimatesByPurchase.value = [];
        } finally {
            isLoadingEstimates.value = false;
        }
    };

    // ── actions ────────────────────────────────────────────────────────────
    const openAddEditDialog = async (procurement?: Procurement | null) => {
        resetForm();
        await fetchPurchase();

        if (procurement) {
            isEditMode.value    = true;
            procurementId.value = procurement.id;

            procurementForm.purchase_request_id = procurement.purchase_request?.id ?? null;
            procurementForm.reference_no        = procurement.reference_no ?? null;
            procurementForm.purchase_date       = procurement.purchase_date ?? null;
            procurementForm.status              = procurement.status;
            procurementForm.notes               = procurement.notes ?? null;
            procurementForm.items               = (procurement.items ?? []).map(i => ({
                estimate_id:      i.estimate_id,
                estimate_item_id: i.estimate_item_id,
                item_name:        i.item_name,
                unit_id:          i.unit?.id ?? null,
                quantity:         Number(i.quantity),
                unit_price:       Number(i.unit_price),
                purchase_price:   Number(i.purchase_price),
                estimate_price:   Number(i.estimate_price),
                notes:            i.notes ?? null,
            }));

            // جلب عروض الأسعار وتحديد المختار منها
            if (procurement.purchase_request?.id) {
                await fetchEstimatesByPurchase(procurement.purchase_request.id);
                selectedEstimateIds.value = [...new Set(
                    procurement.items?.map(i => i.estimate_id) ?? []
                )];
            }

            currentStep.value = 2; // افتح على خطوة المواد مباشرة
        } else {
            isEditMode.value    = false;
            procurementId.value = null;
            currentStep.value   = 0;
        }

        addEditDialogVisible.value = true;
    };

    // عند اختيار طلب الشراء
    const onPurchaseRequestSelected = async (purchaseRequestId: number) => {
        procurementForm.purchase_request_id = purchaseRequestId;
        selectedEstimateIds.value           = [];
        procurementForm.items               = [];
        estimatesByPurchase.value           = [];
        await fetchEstimatesByPurchase(purchaseRequestId);
    };

    // عند تغيير عروض الأسعار المختارة
    const onEstimatesSelected = (estimateIds: number[]) => {
        const removedIds = selectedEstimateIds.value.filter(id => !estimateIds.includes(id));

        // احذف المواد التابعة للعروض المحذوفة
        removedIds.forEach(estimateId => {
            procurementForm.items = procurementForm.items.filter(
                i => i.estimate_id !== estimateId
            );
        });

        selectedEstimateIds.value = estimateIds;
    };

    // عند تحديد/إلغاء مادة
    const onItemToggled = (estimateId: number, estimateItem: any, checked: boolean) => {
        if (checked) {
            const alreadyExists = procurementForm.items.find(
                i => i.estimate_item_id === estimateItem.id
            );
            if (!alreadyExists) {
                procurementForm.items.push({
                    estimate_id:      estimateId,
                    estimate_item_id: estimateItem.id,
                    item_name:        estimateItem.item_name,
                    unit_id:          estimateItem.unit?.id ?? null,
                    quantity:         estimateItem.quantity,
                    unit_price:       Number(estimateItem.unit_price),
                    purchase_price:   0,
                    estimate_price:   Number(estimateItem.unit_price),
                    notes:            null,
                });
            }
        } else {
            procurementForm.items = procurementForm.items.filter(
                i => i.estimate_item_id !== estimateItem.id
            );
        }
    };

    const submitProcurement = async () => {
        try {
            isSaving.value = true;

            if (isEditMode.value && procurementId.value) {
                await procurementService.update(procurementId.value, procurementForm);
                toast.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث عملية الشراء', life: 3000 });
            } else {
                await procurementService.create(procurementForm);
                toast.add({ severity: 'success', summary: 'تم', detail: 'تم إضافة عملية الشراء', life: 3000 });
            }

            addEditDialogVisible.value = false;
            fetchAll();
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء الحفظ', life: 3000 });
        } finally {
            isSaving.value = false;
        }
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
        procurementForm.purchase_request_id = null;
        procurementForm.reference_no        = null;
        procurementForm.purchase_date       = null;
        procurementForm.status              = 'in_progress';
        procurementForm.notes               = null;
        procurementForm.items               = [];
        selectedEstimateIds.value           = [];
        estimatesByPurchase.value           = [];
        currentStep.value                   = 0;
    };

    const resetFilters = () => {
        filters.value = { search: '', status: null, date_from: null, date_to: null };
    };

    return {
        isLoading, isSaving, isEditMode,
        allProcurements, filteredProcurements, allPurchase,
        estimatesByPurchase, selectedEstimateIds, selectedEstimates,
        procurementData, procurementForm, filters,
        statusCounts, currentStep, isLoadingEstimates,
        addEditDialogVisible, detailsDialogVisible,
        fetchAll, openAddEditDialog, submitProcurement,
        onPurchaseRequestSelected, onEstimatesSelected, onItemToggled,
        confirmDelete, showDetails, resetForm, resetFilters,
    };
}