<template>
    <div class="card flex justify-center mt-3 mb-3">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
    </div>
    <div class="p-4 lg:p-6" dir="rtl">
        <div class="mb-5">
            
            <Button v-if="hasPermission('create-Estimate')" icon="fas fa-plus" label="إضافة عرض جديد" class="mt-4" @click="openAddEditDialog()" />
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5"
            style="background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);">
            <div class="text-center">
                <i class="pi pi-spin pi-spinner text-6xl" style="color: #667eea;"></i>
                <p class="text-white text-xl font-semibold mt-4">جاري التحميل...</p>
            </div>
        </div>

        <EstimateStatsCards :total="allEstimate.length" :counts="statusCounts" :percentages="statusPercentages" />

        <EstimateFilters v-model="filters" :departments="allDepartments" :hasDepartment="hasDepartment" @reset="resetFilters" />

        <!-- Cards Grid -->
        <div class="grid">
            <div v-for="estimate in allEstimate" :key="estimate.id" class="col-12 lg:col-6 xl:col-4">
                <EstimateCard
                    :estimate="estimate"
                    :canEdit="hasPermission('edit-Estimate')"
                    :canDelete="hasPermission('delete-Estimate')"
                    @view="showEstimateDetails"
                    @edit="openAddEditDialog"
                    @delete="confirmDeleteEstimate"
                />
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="allEstimate.length > 0" class="mt-5">
            <Paginator :rows="pagination.per_page" :totalRecords="pagination.total"
                :first="(pagination.page - 1) * pagination.per_page" @page="onPageChange" class="border-round-xl shadow-2" />
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && allEstimate.length === 0" class="text-center py-8">
            <div class="inline-block p-6 border-round-2xl" style="background: linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%);">
                <i class="pi pi-inbox text-6xl mb-4" style="color: #667eea;"></i>
                <h3 class="text-2xl font-bold text-900 mb-2">لا توجد عروض أسعار</h3>
                <p class="text-600 m-0">ابدأ بإضافة عرض سعر جديد</p>
            </div>
        </div>

        <EstimateFormDialog
            v-model:visible="addEditEstimateDialogVisible"
            :isEditMode="isEditMode"
            :estimateForm="estimateForm"
            :allVendors="allVendors"
            :allPurchase="allPurchase"
            :vendorForm="vendorForm"
            :showAddVendorForm="showAddVendorForm"
            :isSavingVendor="isSavingVendor"
            :isSaving="isSaving"
            :totalEstimateAmount="totalEstimateAmount"
            v-model:selectedPurchaseId="selectedPurchaseId"
            v-model:showAddVendorForm="showAddVendorForm"
            @submit="submitEstimate"
            @saveVendor="saveVendor"
            @reset="resetForm"
        />
        <EstimateDetailsDialog
            v-model:visible="estimateAllDetailsDialogVisible"
            :estimateData="estimateData"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';

import EstimateStatsCards from './components/EstimateStatsCards.vue';
import EstimateFilters from './components/EstimateFilters.vue';
import EstimateCard from './components/EstimateCard.vue';
import EstimateFormDialog from './components/EstimateFormDialog.vue';
import EstimateDetailsDialog from './components/EstimateDetailsDialog.vue';

import { useEstimates } from './composables/useEstimates';
import { hasPermission } from '../services/permission';

const {
    isLoading, isEditMode, isSaving, isSavingVendor, showAddVendorForm,
    allEstimate, allDepartments, allVendors, allPurchase,
    estimateData, estimateForm, vendorForm, filters, pagination,
    selectedPurchaseId, addEditEstimateDialogVisible, estimateAllDetailsDialogVisible,
    hasDepartment,
    totalEstimateAmount, statusCounts, statusPercentages,
    fetchAllEstimates, fetchAllDepartments,
    openAddEditDialog, submitEstimate, saveVendor,
    confirmDeleteEstimate, showEstimateDetails,
    onPageChange, resetFilters, resetForm,
} = useEstimates();

const breadcrumbHome = ref({ icon: 'fas fa-house', to: '/' });
const breadcrumbItems = ref([
    { label: 'الرئيسية', to: '/', icon: 'fas fa-house' },
    { label: 'عروض الأسعار', to: '/estimate', icon: 'fas fa-receipt' },
]);

onMounted(async () => {
    fetchAllEstimates();
    try {
        const row = localStorage.getItem('auth_department');
        if (row) {
            const auth = JSON.parse(row);
            if (auth?.id) { hasDepartment.value = true; return; }
        }
        fetchAllDepartments();
    } catch {
        fetchAllDepartments();
    }
});
</script>

<style>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.6s ease-out; }

.stat-card {
    animation: fadeIn 0.6s ease-out both;
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
}
.stat-card:hover::before { left: 100%; }

.icon-container { width: 60px; height: 60px; transition: all 0.3s ease; }
.stat-card:hover .icon-container { transform: scale(1.1) rotate(5deg); }

.icon-total    { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.icon-pending  { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
.icon-approved { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
.icon-rejected { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; }

.progress-bar { background: var(--surface-100); }

.progress-fill-total    { background: linear-gradient(90deg, #667eea, #764ba2); box-shadow: 0 2px 8px rgba(102,126,234,0.4); }
.progress-fill-pending  { background: linear-gradient(90deg, #f093fb, #f5576c); box-shadow: 0 2px 8px rgba(240,147,251,0.4); }
.progress-fill-approved { background: linear-gradient(90deg, #4facfe, #00f2fe); box-shadow: 0 2px 8px rgba(79,172,254,0.4); }
.progress-fill-rejected { background: linear-gradient(90deg, #fa709a, #fee140); box-shadow: 0 2px 8px rgba(250,112,154,0.4); }

.estimate-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

.price-section { position: relative; overflow: hidden; }
.price-section::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: slide 3s infinite;
}

@keyframes slide {
    0%   { left: -100%; }
    100% { left:  100%; }
}
</style>
