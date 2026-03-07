<script setup lang="ts">
// ============================================================================
// PAGE: Main Purchase Requests Page
// PATH: purchase/main/index.vue
// DESCRIPTION:
// - Loads purchase requests from API
// - Displays: Chart + Filters + Requests List + Pagination
// ============================================================================

import { ref, reactive, onMounted, watch } from 'vue';

// Components
import Chart from './components/Chart.vue';
import FilterPanel from './components/filterPanel.vue';
import RequestsList from './components/RequestsList.vue';
import Pagination from './components/Pagination.vue';
import PurchaseDetailsDialog from '../details/index.vue';
import Button from 'primevue/button';
import Breadcrumb from "primevue/breadcrumb";

// Types
import type { PurchaseRequest } from '../interfaces/purchase.interfaces';

// Services
import purchaseRequestsService from '../services/purchaseRequests.service';
// ============================================================================
// STATE
// ============================================================================

const detailsDialogVisible = ref(false);
const selectedRequest = ref<PurchaseRequest | null>(null);

function openDetails(request: PurchaseRequest) {
    selectedRequest.value = request;
    detailsDialogVisible.value = true;
}

const breadcrumbHome = ref({icon: "fas fa-house", to: '/'})
const breadcrumbItems = ref([
    {label: "الرئيسية", to: "/", icon: "fas fa-house"},
    {label: "طلبات الشراء", to: "/purchase", icon: "fa-solid fa-cart-shopping"},
])

// القائمة الرئيسية للطلبات
const requests = ref<PurchaseRequest[]>([]);

// التحكم بالصفحات
const pagination = reactive({
    page: 1,
    perPage: 10,
    total: 0
});

const filters = reactive({
    department_id: null as number | null,
    status_type: null as string | null,
    priority: null as string | null,
    search: '',
    date_from: null as string | null,
    date_to: null as string | null,
});

// حالة التحميل
const loading = ref(false);

// ============================================================================
// METHODS: جلب البيانات من الـ API
// ============================================================================

async function loadRequests() {
    loading.value = true;

    try {
        const response = await purchaseRequestsService.getAll({
            page: pagination.page,
            per_page: pagination.perPage,
            ...filters,
        });

        // response هو الكائن الكامل القادم من API
        requests.value = response.data ?? [];
        pagination.total = response.total ?? 0;

    } catch (e) {
        console.error('Error loading purchase requests:', e);
    }

    loading.value = false;
}

import PurchaseFormDialog from '../create/PurchaseFormDialog.vue';
import { hasPermission } from '../../services/permission';

const addDialogVisible = ref(false);

function openAddDialog() {
    addDialogVisible.value = true;
}

// ============================================================================
// WATCHERS
// ============================================================================

// إعادة جلب البيانات عند تغيير الفلاتر
watch(filters, () => {
    pagination.page = 1;
    loadRequests();
}, { deep: true });

// تغيير الصفحة
watch(() => pagination.page, () => {
    loadRequests();
});

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
    loadRequests();
});
</script>

<template>
    <div class="card flex justify-center mt-3 mb-3">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems"/>
    </div>
    <div class="p-4" dir="rtl">
        

        <!-- CHART -->
        <Chart :requests="requests" />

        <!-- PAGE TITLE -->

            <Button
                v-if="hasPermission('PurchaseRequest-create')"
                label="إضافة طلب جديد"
                icon="fas fa-plus"
                @click="openAddDialog"
                class="mt-5 mb-0"
            />
        <!-- FILTER PANEL -->
        <FilterPanel
            :filters="filters"
            class="mb-3"
            @update:filters="(newFilters) => {
                Object.assign(filters, newFilters)
            }" />

        <!-- REQUESTS LIST -->
        <RequestsList 
            :requests="requests"
            :loading="loading"
            @open-details="openDetails"
        />

        <!-- PAGINATION -->
        <Pagination
            :page="pagination.page"
            :total="pagination.total"
            :perPage="pagination.perPage"
            @update:page="pagination.page = $event"
        />

        <PurchaseDetailsDialog
            v-model:visible="detailsDialogVisible"
            :request="selectedRequest"
            @deleted="loadRequests"
        />
    </div>

    <PurchaseFormDialog
        v-model:visible="addDialogVisible"
        @submitted="loadRequests"
    />
</template>

<style scoped>
/* يمكنك إضافة تنسيقات عامة للصفحة هنا */
</style>