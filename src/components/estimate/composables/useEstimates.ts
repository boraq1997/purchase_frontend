import { ref, computed, reactive, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import estimateService, { type EstimatePayload, type Vendor, type Estimate, type EstimateItem } from '../estimateService';
import DepartmentService from '../../departments/DepartmentService';
import VendorsService from '../../vendors/VendorsService';
import purchaseRequestsService from '../../Purchase/services/purchase-requestsService';

export function useEstimates() {
    const toast = useToast();
    const confirm = useConfirm();

    const isLoading = ref(true);
    const isEditMode = ref(false);
    const isConfirming = ref(false);
    const isSaving = ref(false);
    const isSavingVendor = ref(false);
    const showAddVendorForm = ref(false);

    const allEstimate = ref<Estimate[]>([]);
    const allDepartments = ref<any[]>([]);
    const allVendors = ref<Vendor[]>([]);
    const allPurchase = ref<any[]>([]);
    const estimateId = ref<number | null>(null);
    const selectedPurchaseId = ref<number | null>(null);
    const estimateData = ref<Estimate | null>(null);

    const addEditEstimateDialogVisible = ref(false);
    const estimateAllDetailsDialogVisible = ref(false);

    const departmentId = ref<number>();
    const hasDepartment = ref<boolean>(false);

    const pagination = ref({
        page: 1,
        per_page: 12,
        total: 0,
    });

    const filters = ref({
        vendor_name: '',
        department_id: null,
        request_title: '',
        status: null,
        date_from: null,
        date_to: null,
    });

    const estimateForm = reactive<EstimatePayload & { estimate_date: Date | null }>({
        vendor_id: undefined,
        estimate_date: null,
        status: 'pending',
        notes: null,
        items: [],
    });

    const vendorForm = reactive({
        name: '',
        phone1: '',
        phone2: undefined as string | undefined,
        email: undefined as string | undefined,
        address: undefined as string | undefined,
    });

    const resolvedDepartmentId = computed<number | undefined>(() => {
        const row = localStorage.getItem('auth_department');
        if (row) {
            try {
                return JSON.parse(row)?.id;
            } catch {
                return filters.value.department_id || undefined;
            }
        }
        return filters.value.department_id || undefined;
    });

    const totalEstimateAmount = computed(() =>
        (estimateForm.items ?? []).reduce((total, item) => {
            return total + (Number(item.unit_price) || 0) * (item.quantity || 0);
        }, 0)
    );

    const statusCounts = computed(() => ({
        pending: allEstimate.value.filter(e => e.status === 'pending').length,
        accepted: allEstimate.value.filter(e => e.status === 'accepted').length,
        rejected: allEstimate.value.filter(e => e.status === 'rejected').length,
    }));

    const totalEstimates = computed(() => allEstimate.value.length || 1);

    const statusPercentages = computed(() => ({
        pending: Math.round((statusCounts.value.pending / totalEstimates.value) * 100),
        accepted: Math.round((statusCounts.value.accepted / totalEstimates.value) * 100),
        rejected: Math.round((statusCounts.value.rejected / totalEstimates.value) * 100),
    }));

    // ── Fetch ──────────────────────────────────────────
    const fetchAllEstimates = async () => {
        isLoading.value = true;
        try {
            const response = await estimateService.getAll({
                page: pagination.value.page,
                per_page: pagination.value.per_page,
                vendor_name: filters.value.vendor_name || undefined,
                department_id: resolvedDepartmentId.value,
                request_title: filters.value.request_title || undefined,
            });
            allEstimate.value = response.data;
            pagination.value.total = response.total;
            pagination.value.page = response.current_page;
            pagination.value.per_page = response.per_page;
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء جلب عروض الأسعار', life: 3000 });
        } finally {
            isLoading.value = false;
        }
    };

    const fetchAllDepartments = async () => {
        try {
            allDepartments.value = await DepartmentService.getAll();
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء جلب الأقسام', life: 3000 });
        }
    };

    const fetchAllVendors = async () => {
        try {
            const response = await VendorsService.getAll();
            const list = 'data' in response ? response.data : response;
            allVendors.value = list.map((v: any) => ({ ...v, id: v.id ?? 0 }));
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء جلب الباعة', life: 3000 });
        }
    };

    const fetchAllPurchase = async () => {
        try {
            allPurchase.value = await purchaseRequestsService.getAll();
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء جلب طلبات الشراء', life: 3000 });
        }
    };

    // ── Actions ────────────────────────────────────────
    const openAddEditDialog = async (estimate?: Estimate | null) => {
        resetForm();
        const estimateSnapshot = estimate ? { ...estimate } : null;
        await Promise.all([fetchAllVendors(), fetchAllPurchase()]);
        if (estimateSnapshot) {
            isEditMode.value = true;
            estimateId.value = estimateSnapshot.id;
            estimateForm.vendor_id = estimateSnapshot.vendor?.id ?? undefined;
            estimateForm.estimate_date = estimateSnapshot.estimate_date ? new Date(estimateSnapshot.estimate_date) : null;
            estimateForm.status = estimateSnapshot.status;
            estimateForm.notes = estimateSnapshot.notes;
            estimateForm.items = (estimateSnapshot.estimate_items ?? []).map((item: EstimateItem) => ({
                request_item_id: item.request_item?.id ?? item.id,
                item_name: item.item_name,
                quantity: item.quantity,
                unit_price: item.unit_price != null ? Number(item.unit_price) : 0,
                notes: item.notes,
            }));
            selectedPurchaseId.value = estimateSnapshot.purchase_request?.id ?? null;
        } else {
            isEditMode.value = false;
            estimateId.value = null;
        }
        addEditEstimateDialogVisible.value = true;
    };

    const submitEstimate = async () => {
        try {
            isSaving.value = true;
            if (isEditMode.value && estimateId.value) {
                await estimateService.update(estimateId.value, {
                    ...estimateForm,
                    estimate_date: estimateForm.estimate_date?.toISOString() ?? null,
                });
                toast.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ عرض السعر بنجاح', life: 3000 });
            } else {
                if (!selectedPurchaseId.value) {
                    toast.add({ severity: 'error', summary: 'خطأ', detail: 'يرجى اختيار طلب شراء', life: 3000 });
                    return;
                }
                await estimateService.createWithItems(selectedPurchaseId.value, estimateForm);
                toast.add({ severity: 'success', summary: 'تم', detail: 'تم إضافة عرض سعر جديد', life: 3000 });
            }
            addEditEstimateDialogVisible.value = false;
            fetchAllEstimates();
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء حفظ عرض السعر', life: 3000 });
        } finally {
            isSaving.value = false;
        }
    };

    const saveVendor = async () => {
        try {
            isSavingVendor.value = true;
            await VendorsService.create(vendorForm);
            await fetchAllVendors();
            Object.assign(vendorForm, { name: '', phone1: '', phone2: undefined, email: undefined, address: undefined });
            showAddVendorForm.value = false;
            toast.add({ severity: 'success', summary: 'تم', detail: 'تم إضافة البائع بنجاح', life: 3000 });
        } catch {
            toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل إضافة البائع', life: 3000 });
        } finally {
            isSavingVendor.value = false;
        }
    };

    const confirmDeleteEstimate = (estimate: any) => {
        if (isConfirming.value) return;
        isConfirming.value = true;
        confirm.require({
            header: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف عرض السعر؟',
            icon: 'pi pi-exclamation-triangle text-yellow-500',
            acceptLabel: 'تأكيد',
            acceptIcon: 'pi pi-check',
            acceptClass: 'p-button-sm border border-red-500 bg-red-500 text-white',
            rejectLabel: 'إلغاء',
            rejectIcon: 'pi pi-times',
            rejectClass: 'p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200',
            accept: async () => {
                try {
                    await estimateService.delete(estimate.id);
                    fetchAllEstimates();
                    toast.add({ severity: 'success', summary: 'تم', detail: 'تم حذف عرض السعر', life: 3000 });
                } catch {
                    toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء الحذف', life: 3000 });
                } finally {
                    isConfirming.value = false;
                }
            },
            reject: () => { isConfirming.value = false; },
        });
    };

    const showEstimateDetails = (estimate: any) => {
        if (!estimate) return;
        estimateData.value = estimate;
        estimateAllDetailsDialogVisible.value = true;
    };

    const onPageChange = (e: any) => {
        pagination.value.page = e.page + 1;
        fetchAllEstimates();
    };

    const resetFilters = () => {
        filters.value = { vendor_name: '', department_id: null, request_title: '', status: null, date_from: null, date_to: null };
    };

    const resetForm = () => {
        estimateForm.vendor_id = undefined;
        estimateForm.estimate_date = null;
        estimateForm.status = 'pending';
        estimateForm.notes = null;
        estimateForm.items = [];
        selectedPurchaseId.value = null;
    };

    // watch(selectedPurchaseId, (purchaseId) => {
    //     if (isEditMode.value) return; // ✅ تجاهل في وضع التعديل
    //     if (!purchaseId) { estimateForm.items = []; return; }
    //     const purchase = allPurchase.value.find(p => p.id === purchaseId);
    //     if (!purchase?.items) { estimateForm.items = []; return; }
    //     estimateForm.items = purchase.items.map((item: any) => ({
    //         request_item_id: item.id,
    //         item_name: item.item_name,
    //         quantity: item.quantity,
    //         unit_price: null,
    //         note: '',
    //     }));
    // });

    watch(filters, () => {
        pagination.value.page = 1;
        fetchAllEstimates();
    }, { deep: true });

    return {
        // state
        isLoading, isEditMode, isSaving, isSavingVendor, showAddVendorForm,
        allEstimate, allDepartments, allVendors, allPurchase,
        estimateData, estimateForm, vendorForm, filters, pagination,
        selectedPurchaseId, addEditEstimateDialogVisible, estimateAllDetailsDialogVisible,
        hasDepartment, departmentId,
        // computed
        totalEstimateAmount, statusCounts, statusPercentages,
        // methods
        fetchAllEstimates, fetchAllDepartments, fetchAllVendors,
        openAddEditDialog, submitEstimate, saveVendor,
        confirmDeleteEstimate, showEstimateDetails,
        onPageChange, resetFilters, resetForm,
    };
}