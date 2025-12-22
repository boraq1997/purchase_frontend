<template>
    <div class="p-4" dir="rtl">
        <!-- Breadcrumb -->
        <div class="card flex justify-center mt-3 mb-3">
            <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
        </div>

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5" style="background-color: #2828289c;">
            <div class="text-primary-500 border-round text-center">
                <i class="fa-solid fa-circle-notch fa-spin fa-2xl" style="font-size: 80px;"></i>
            </div>
        </div>

        <!-- Page Header -->
        <div class="flex gap-2 mb-3">
            <Button icon="pi pi-plus" label="عرض جديد" />
        </div>

        <!-- Stats Cards -->
        <div class="grid mb-4">
            <div class="col-12 md:col-6 lg:col-3" v-for="(stat, index) in stats" :key="index">
                <div class="surface-card border-round-lg p-3" style="border: 1px solid var(--surface-border);">
                    <div class="flex justify-content-between align-items-center">
                        <div>
                            <div class="text-500 text-xs mb-2">{{ stat.label }}</div>
                            <div class="text-900 font-bold text-2xl">{{ stat.value }}</div>
                        </div>
                        <div class="border-circle" :class="stat.bgClass" style="width: 48px; height: 48px;">
                            <i :class="stat.iconClass"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="grid mb-3 gap-3">
            <div class="col-12 md:col-3">
                <IconField class="w-full">
                    <InputIcon class="fas fa-search" />
                    <InputText v-model="filters.vendor_name" class="w-full" placeholder="اسم المعرض" />
                </IconField>
            </div>

            <div class="col-12 md:col-3">
                <Select
                    v-model="filters.department_id"
                    class="w-full"
                    :options="allDepartments"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="اختر القسم"
                    filter
                />
            </div>

            <div class="col-12 md:col-3">
                <IconField class="w-full">
                    <InputIcon class="fas fa-search" />
                    <InputText v-model="filters.request_title" class="w-full" placeholder="عنوان الطلب" />
                </IconField>
            </div>
        </div>

        <!-- Estimates Cards -->
        <div class="grid">
            <div v-for="estimate in allEstimate" :key="estimate.id" class="col-12 lg:col-6 xl:col-4">
                <Card class="h-full transition-all transition-duration-200 hover:shadow-3">
                    <template #title>
                        <div class="flex justify-content-between align-items-start gap-2">
                            <div class="flex-1">
                                <div class="flex align-items-center gap-2 mb-2">
                                    <Chip :label="`#${estimate.id}`" class="text-xs font-semibold" />
                                    <Tag 
                                        :value="getStatusLabel(estimate.status)" 
                                        :severity="getStatusSeverity(estimate.status)"
                                        class="text-xs font-semibold"
                                    />
                                </div>
                                <h3 class="text-lg font-bold text-900 m-0 mb-1 line-height-3">
                                    {{ estimate.vendor.name }}
                                </h3>
                                <div class="flex align-items-center gap-2 text-xs text-600">
                                    <i class="pi pi-calendar"></i>
                                    <span>{{ formatDate(estimate.estimate_date) }}</span>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #content>
                        <!-- Purchase Request Info -->
                        <div class="p-3 border-round mb-3" style="background: var(--surface-50);">
                            <div class="text-xs text-500 mb-1">طلب الشراء</div>
                            <div class="text-sm font-semibold text-900 mb-1">
                                {{ estimate.purchase_request.title }}
                            </div>
                            <div class="text-xs text-600">
                                {{ estimate.purchase_request.request_number }}
                            </div>
                        </div>

                        <!-- Vendor Details -->
                        <div class="mb-3">
                            <div class="flex align-items-center gap-2 mb-2">
                                <i class="pi pi-phone text-600 text-sm"></i>
                                <span class="text-sm text-900 font-medium">{{ estimate.vendor.phone1 || '—' }}</span>
                            </div>
                            <div class="flex align-items-center gap-2 mb-2">
                                <i class="pi pi-envelope text-600 text-sm"></i>
                                <span class="text-sm text-900 font-medium">{{ estimate.vendor.email || '—' }}</span>
                            </div>
                            <div class="flex align-items-start gap-2">
                                <i class="pi pi-map-marker text-600 text-sm mt-1"></i>
                                <span class="text-sm text-900 font-medium line-height-3">{{ estimate.vendor.address || '—' }}</span>
                            </div>
                        </div>

                        <!-- Financial Info -->
                        <Divider class="my-3" />
                        <div class="flex justify-content-between align-items-center mb-3 p-3 border-round" style="background: var(--green-50);">
                            <div>
                                <div class="text-xs text-600 mb-1">المبلغ الإجمالي</div>
                                <div class="text-xl font-bold text-green-700">{{ estimate.total_amount }} <span class="text-sm">د.ع</span></div>
                            </div>
                            <div class="border-circle bg-green-100 flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                <i class="pi pi-dollar text-green-700"></i>
                            </div>
                        </div>

                        <!-- Notes -->
                        <div v-if="estimate.notes" class="mt-3 p-3 border-round" style="background: var(--blue-50);">
                            <div class="text-xs text-500 mb-1">ملاحظات</div>
                            <p class="text-sm text-700 m-0 line-height-3">{{ estimate.notes }}</p>
                        </div>
                    </template>

                    <template #footer>
                        <div class="flex gap-2 flex-wrap">
                            <Button label="عرض التفاصيل" icon="pi pi-eye" size="small" outlined class="flex-1" />
                            <Button label="تعديل" icon="pi pi-check" size="small" severity="success" class="flex-1" />
                            <Button icon="pi pi-trash" size="small" severity="danger" outlined @click="confirmDeleteEstimate(estimate)" />
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <Paginator
            :rows="pagination.per_page"
            :totalRecords="pagination.total"
            :first="(pagination.page - 1) * pagination.per_page"
            @page="onPageChange"
            class="mt-4"
        />

        <div v-if="!allEstimate || allEstimate.length === 0" class="text-center py-8">
            <i class="pi pi-inbox text-6xl text-400 mb-4"></i>
            <p class="text-xl text-600 m-0">لا توجد عروض أسعار</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import estimateService from './estimateService';
import Breadcrumb from "primevue/breadcrumb";
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import DepartmentService from '../departments/DepartmentService';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import Select from "primevue/select";
import Paginator from 'primevue/paginator';

const isLoading = ref(true);
const toast = useToast();
const confirm = useConfirm();
const isConfirming = ref(false);

const allEstimate = ref<any[]>([]);
const allDepartments = ref<any[]>([]);

const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/" },
    { label: "عروض الاسعار", to: "/estimate" },
]);

const filters = ref({
    vendor_name: "",
    department_id: null,
    request_title: ""
});

const pagination = ref({
    page:1,
    per_page: 12,
    total: 0,
});

const fetchAllEstimates = async()=>{
    isLoading.value = true;
    try {
        const params = {
            page: pagination.value.page,
            per_page: pagination.value.per_page,
            vendor_name: filters.value.vendor_name || undefined,
            department_id: filters.value.department_id || undefined,
            request_title: filters.value.request_title || undefined,
        }
        const response = await estimateService.getAll(params);
        allEstimate.value = response.data;
        
        pagination.value.total = response.total;
        pagination.value.page = response.current_page;
        pagination.value.per_page = response.per_page;

    } catch (err) {
        console.log(err)
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء اثناء جلب بيانات عروض الاسعر",
            life: 3000
        })
    } finally {
        isLoading.value = false
    }
}

const fetchAllDepartments = async()=>{
    try {
        const response = await DepartmentService.getAll()
        allDepartments.value = response;
    } catch (err: any) {
        console.log(err)
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء اثناء جلب الاقسام لاستخدامهم داخل البحث",
            life: 3000
        })
    }
}

const confirmDeleteEstimate = async(estimate: any) => {
    if (isConfirming.value) return;
    isConfirming.value = true;

    confirm.require({
        header: "تأكيد الحذف",
        message: `هل انت متاكد من حذف بيانات عرض السعر`,
        icon: "pi pi-exclamation-triangle text-yellow-500",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass:"p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass:"p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: async()=>{
            try {
                await estimateService.delete(estimate.id);
                fetchAllEstimates();
            } catch (err: any) {
                console.log(err)
                toast.add({
                    severity: "error",
                    summary: "رسالة خطاء",
                    detail: "عذرا حدث خطاء ما اثناء حذف عرض السعر",
                    life: 3000
                });
            } finally {
                isConfirming.value = false;
            }
        },
        reject: () => isConfirming.value = false
    })
}

const onPageChange = (e: any)=> {
    pagination.value.page = e.page + 1;
    fetchAllEstimates();
}

watch(
    filters,
    () => {
        pagination.value.page = 1;
        fetchAllEstimates();
    },
    { deep: true }
);

// Stats
const stats = computed(() => [
    { label: 'إجمالي العروض', value: allEstimate.value.length, iconClass: 'pi pi-file text-blue-600 text-xl', bgClass: 'bg-blue-50 flex align-items-center justify-content-center' },
    { label: 'قيد الانتظار', value: allEstimate.value.filter(e => e.status === 'pending').length, iconClass: 'pi pi-clock text-orange-600 text-xl', bgClass: 'bg-orange-50 flex align-items-center justify-content-center' },
    { label: 'موافق عليها', value: allEstimate.value.filter(e => e.status === 'approved').length, iconClass: 'pi pi-check-circle text-green-600 text-xl', bgClass: 'bg-green-50 flex align-items-center justify-content-center' },
    { label: 'إجمالي المبالغ', value: allEstimate.value.reduce((acc, e) => acc + parseFloat(e.total_amount || '0'), 0).toFixed(2) + ' د.ع', iconClass: 'pi pi-dollar text-purple-600 text-xl', bgClass: 'bg-purple-50 flex align-items-center justify-content-center' }
]);

const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        'pending': 'قيد الانتظار',
        'approved': 'موافق عليه',
        'rejected': 'مرفوض',
        'completed': 'مكتملة',
    };
    return statusMap[status] || status;
};

const getStatusSeverity = (status: string) => {
    const severityMap: Record<string, "success" | "secondary" | "info" | "warning" | "danger"> = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'completed': 'info'
    };
    return severityMap[status] || 'secondary';
};

const formatDate = (dateString: string): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(()=>{
    fetchAllEstimates();
    fetchAllDepartments();
})
</script>