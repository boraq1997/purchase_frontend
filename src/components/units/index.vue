<template>
    <!-- ============================= -->
    <!-- Breadcrumb -->
    <!-- ============================= -->
    <div class="card flex justify-center mt-3 mb-3">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
    </div>

    <div class="flex flex-column gap-4 h-full p-4" dir="rtl">

        <!-- رأس الصفحة -->
        <div class="flex align-items-center  gap-3">
            <Button
                label="إضافة وحدة"
                icon="pi pi-plus"
                @click="openAdd"
            />
            
        </div>

        <!-- البطاقة الرئيسية -->
        <Card class="flex-1 flex flex-column overflow-hidden">
            <template #content>
                <div class="flex flex-column gap-4 h-full">

                    <!-- شريط الفلاتر + عدد النتائج -->
                    <div class="flex align-items-center gap-3 flex-wrap">
                        <UnitFilters
                            v-model="search"
                            class="flex-1"
                            @filter="onFilter"
                        />
                        <div class="flex align-items-center gap-2 text-color-secondary text-sm">
                            <i class="pi pi-list" />
                            <span>{{ meta?.total ?? 0 }} وحدة</span>
                        </div>
                    </div>

                    <!-- الجدول -->
                    <UnitTable
                        :units="units"
                        :loading="tableLoading"
                        :current-page="meta?.current_page ?? 1"
                        :per-page="meta?.per_page ?? 15"
                        @edit="openEdit"
                        @add="openAdd"
                        @delete="fetchUnits"
                    />

                    <!-- Pagination -->
                    <div v-if="meta && meta.last_page > 1" class="flex justify-content-center mt-2">
                        <Paginator
                            :rows="meta.per_page"
                            :totalRecords="meta.total"
                            :first="(meta.current_page - 1) * meta.per_page"
                            :rowsPerPageOptions="[10, 15, 25, 50]"
                            @page="onPageChange"
                        />
                    </div>

                </div>
            </template>
        </Card>

        <!-- Drawer الإضافة / التعديل -->
        <UnitForm
            v-model="showForm"
            :unit="selectedUnit"
            ref="unitFormRef"
            @submit="onFormSubmit"
        />

        <!-- Toast للإشعارات -->
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

import Breadcrumb from "primevue/breadcrumb";
import Card from 'primevue/card'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'

import UnitFilters from './components/UnitFilters.vue'
import UnitTable from './components/UnitTable.vue'
import UnitForm from './components/UnitForm.vue'

import unitService from './unitsService'
import type { Unit, CreateUnitPayload, UpdateUnitPayload } from './unitsType'

const toast = useToast()

// ── State ──────────────────────────────────────────────
const units       = ref<Unit[]>([])
const meta        = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)
const tableLoading = ref(false)

const search      = ref('')
const currentPage = ref(1)
const perPage     = ref(15)

const showForm    = ref(false)
const selectedUnit = ref<Unit | null>(null)
const unitFormRef  = ref<InstanceType<typeof UnitForm> | null>(null)

// Breadcrumb configuration
const breadcrumbHome = ref({ icon: "fas fa-house", to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/", icon: "fas fa-house"},
    { label: "وحدات القياس", to: "/users", icon: "fa-solid fa-scale-unbalanced"},
]);

// ── Fetch ──────────────────────────────────────────────
async function fetchUnits() {
    tableLoading.value = true
    try {
        const res = await unitService.getAllUnits({
            search: search.value || undefined,
            page: currentPage.value,
            per_page: perPage.value,
        })
        units.value = res.data
        meta.value  = res.meta
    } catch {
        toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل الوحدات', life: 3000 })
    } finally {
        tableLoading.value = false
    }
}

// ── Filter & Pagination ────────────────────────────────
function onFilter() {
    currentPage.value = 1
    fetchUnits()
}

function onPageChange(event: { page: number; rows: number }) {
    currentPage.value = event.page + 1
    perPage.value = event.rows
    fetchUnits()
}

// ── Add / Edit ─────────────────────────────────────────
function openAdd() {
    selectedUnit.value = null
    showForm.value = true
}

function openEdit(unit: Unit) {
    selectedUnit.value = unit
    showForm.value = true
}

async function onFormSubmit(data: CreateUnitPayload | UpdateUnitPayload) {
    unitFormRef.value?.setLoading(true)
    try {
        if (selectedUnit.value) {
            await unitService.updateUnitInfo(selectedUnit.value.id, data as UpdateUnitPayload)
            toast.add({ severity: 'success', summary: 'تم', detail: 'تم تعديل الوحدة بنجاح', life: 3000 })
        } else {
            await unitService.createNewUnit(data as CreateUnitPayload)
            toast.add({ severity: 'success', summary: 'تم', detail: 'تم إضافة الوحدة بنجاح', life: 3000 })
        }
        showForm.value = false
        fetchUnits()
    } catch (err: any) {
        const msg = err?.response?.data?.message ?? 'حدث خطأ غير متوقع'
        toast.add({ severity: 'error', summary: 'خطأ', detail: msg, life: 4000 })
    } finally {
        unitFormRef.value?.setLoading(false)
    }
}

// ── Init ───────────────────────────────────────────────
onMounted(fetchUnits)
</script>