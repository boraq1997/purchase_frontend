<template>
    <div class="card flex justify-center mt-3 mb-3">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
    </div>

    <div class="p-4 lg:p-6" dir="rtl">

        <!-- ─── Header ──────────────────────────────────────────────────── -->
        <div class="flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
            <div>
                <h1 class="text-2xl font-bold text-900 m-0">عمليات الشراء</h1>
                <p class="text-500 text-sm mt-1 m-0">إدارة ومتابعة عمليات الشراء</p>
            </div>
            <Button icon="fas fa-plus" label="إضافة عملية شراء" @click="openAddEditDialog()" />
        </div>

        <!-- ─── Loading ───────────────────────────────────────────────────── -->
        <div v-if="isLoading"
            class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5"
            style="background:rgba(0,0,0,0.7);backdrop-filter:blur(8px)">
            <div class="text-center">
                <i class="pi pi-spin pi-spinner text-6xl" style="color:#667eea"/>
                <p class="text-white text-xl font-semibold mt-4">جاري التحميل...</p>
            </div>
        </div>

        <!-- ─── Stats ─────────────────────────────────────────────────────── -->
        <ProcurementStatsCards
            :total="allProcurements.length"
            :counts="statusCounts"
        />

        <!-- ─── Filters ───────────────────────────────────────────────────── -->
        <ProcurementFilters
            v-model="filters"
            @reset="resetFilters"
        />

        <!-- ─── Cards ─────────────────────────────────────────────────────── -->
        <ProcurementCardsGrid
            :procurements="filteredProcurements"
            :isLoading="isLoading"
            :canEdit="true"
            :canDelete="true"
            @view="showDetails"
            @edit="openAddEditDialog"
            @delete="confirmDelete"
        />

        <!-- ─── Form Dialog ────────────────────────────────────────────────── -->
        <ProcurementFormDialog
            v-model:visible="addEditDialogVisible"
            :isEditMode="isEditMode"
            :form="procurementForm"
            :allPurchase="allPurchase"
            :selectedPurchaseRequest="selectedPurchaseRequest"
            :selectedEstimateIds="selectedEstimateIds"
            :isSaving="isSaving"
            :isLoadingRequest="isLoadingRequest"
            @submit="submitProcurement"
            @reset="resetForm"
            @onPurchaseSelected="onPurchaseRequestSelected"
            @onEstimatesSelected="onEstimatesSelected"
        />

        <!-- ─── Details Dialog ─────────────────────────────────────────────── -->
        <ProcurementDetailsDialog
            v-model:visible="detailsDialogVisible"
            :data="procurementData"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';

import ProcurementStatsCards    from './components/Procurementstatscards.vue';
import ProcurementFilters       from './components/Procurementfilters.vue';
import ProcurementCardsGrid     from './components/Procurementcardsgrid.vue';
import ProcurementFormDialog    from './components/ProcurementFormDialog.vue';
import ProcurementDetailsDialog from './components/ProcurementDetailsDialog.vue';

import { useProcurements } from './composables/useProcurements';

const {
    isLoading, isSaving, isEditMode, isLoadingRequest,
    allProcurements, filteredProcurements, allPurchase,
    selectedPurchaseRequest, selectedEstimateIds,
    procurementData, procurementForm, filters, statusCounts,
    addEditDialogVisible, detailsDialogVisible,
    fetchAll, openAddEditDialog, submitProcurement,
    onPurchaseRequestSelected, onEstimatesSelected,
    confirmDelete, showDetails, resetForm, resetFilters,
} = useProcurements();

const breadcrumbHome  = ref({ icon: 'fas fa-house', to: '/' });
const breadcrumbItems = ref([
    { label: 'الرئيسية',      to: '/',             icon: 'fas fa-house'          },
    { label: 'عمليات الشراء', to: '/procurements', icon: 'fas fa-truck-ramp-box' },
]);

onMounted(() => fetchAll());
</script>