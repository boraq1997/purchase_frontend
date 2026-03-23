<template>
    <!-- Breadcrumb -->
    <div class="card flex justify-center mt-3 mb-3">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
    </div>

    <div class="flex flex-column gap-4 h-full p-4" dir="rtl">

        <!-- رأس الصفحة -->
        <div class="flex align-items-center justify-content-between gap-3 flex-wrap">
            <div class="flex align-items-center gap-2">
                <i class="pi pi-file-pdf text-2xl text-primary" />
                <span class="text-xl font-semibold">التقارير</span>
            </div>
            <Button
                label="توليد تقرير جديد"
                icon="pi pi-plus"
                @click="openGenerateDialog"
            />
        </div>

        <!-- البطاقة الرئيسية -->
        <Card class="flex-1">
            <template #content>
                <div class="flex flex-column gap-4">

                    <!-- فلاتر -->
                    <div class="flex align-items-center gap-3 flex-wrap">
                        <InputText
                            v-model="searchPrId"
                            placeholder="ابحث برقم طلب الشراء..."
                            class="w-15rem"
                            @keyup.enter="onFilter"
                        />
                        <Dropdown
                            v-model="filterType"
                            :options="reportTypeOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="نوع التقرير"
                            class="w-12rem"
                            show-clear
                            @change="onFilter"
                        />
                        <Button
                            icon="pi pi-search"
                            label="بحث"
                            outlined
                            @click="onFilter"
                        />
                        <div class="flex align-items-center gap-2 text-color-secondary text-sm mr-auto">
                            <i class="pi pi-list" />
                            <span>{{ meta?.total ?? 0 }} تقرير</span>
                        </div>
                    </div>

                    <!-- جدول التقارير -->
                    <DataTable
                        :value="reports"
                        :loading="loading"
                        striped-rows
                        responsive-layout="scroll"
                        class="p-datatable-sm"
                        empty-message="لا توجد تقارير محفوظة"
                    >
                        <Column field="purchase_request.request_number" header="رقم الطلب" style="width:10rem">
                            <template #body="{ data }">
                                <Tag :value="data.purchase_request?.request_number" severity="info" />
                            </template>
                        </Column>

                        <Column field="purchase_request.title" header="عنوان الطلب" />

                        <Column field="report_type" header="نوع التقرير" style="width:11rem">
                            <template #body="{ data }">
                                <Tag
                                    :value="reportTypeLabel(data.report_type)"
                                    :severity="data.report_type === 'full_review' ? 'success' : 'warning'"
                                />
                            </template>
                        </Column>

                        <Column field="generated_by.name" header="أنشأه" style="width:10rem" />

                        <Column field="generated_at" header="تاريخ التوليد" style="width:11rem">
                            <template #body="{ data }">
                                <span class="text-sm">{{ data.generated_at }}</span>
                            </template>
                        </Column>

                        <Column header="إجراءات" style="width:9rem">
                            <template #body="{ data }">
                                <div class="flex gap-2">
                                    <Button
                                        icon="pi pi-eye"
                                        size="small"
                                        text
                                        rounded
                                        severity="info"
                                        v-tooltip.top="'عرض التقرير'"
                                        @click="openReport(data)"
                                    />
                                    <Button
                                        icon="pi pi-refresh"
                                        size="small"
                                        text
                                        rounded
                                        severity="secondary"
                                        v-tooltip.top="'إعادة توليد'"
                                        :loading="regeneratingId === data.id"
                                        @click="regenerateReport(data)"
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        size="small"
                                        text
                                        rounded
                                        severity="danger"
                                        v-tooltip.top="'حذف'"
                                        @click="confirmDelete(data)"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>

                    <!-- Pagination -->
                    <div v-if="meta && meta.last_page > 1" class="flex justify-content-center mt-2">
                        <Paginator
                            :rows="meta.per_page"
                            :total-records="meta.total"
                            :first="(meta.current_page - 1) * meta.per_page"
                            :rows-per-page-options="[10, 15, 25, 50]"
                            @page="onPageChange"
                        />
                    </div>

                </div>
            </template>
        </Card>

        <!-- ─── Dialog توليد تقرير جديد ─── -->
        <Dialog
            v-model:visible="showGenerateDialog"
            header="توليد تقرير جديد"
            :modal="true"
            :style="{ width: '28rem' }"
            dir="rtl"
        >
            <div class="flex flex-column gap-4 pt-2">
                <div class="flex flex-column gap-2">
                    <label class="font-medium text-sm">رقم طلب الشراء <span class="text-red-400">*</span></label>
                    <Select
                        v-model="generateForm.purchase_request_id"
                        :options="availablePurchaseRequests"
                        option-label="label"
                        option-value="value"
                        placeholder="اختر طلب الشراء..."
                        class="w-full"
                        :loading="loadingPurchaseRequests"
                        filter
                        filter-placeholder="ابحث..."
                        empty-message="لا توجد طلبات متاحة"
                        empty-filter-message="لا توجد نتائج"
                    />
                </div>
                <div class="flex flex-column gap-2">
                    <label class="font-medium text-sm">نوع التقرير</label>
                    <Select
                        v-model="generateForm.report_type"
                        :options="reportTypeOptions"
                        option-label="label"
                        option-value="value"
                        class="w-full"
                    />
                </div>
            </div>
            <template #footer>
                <Button label="إلغاء" text @click="showGenerateDialog = false" />
                <Button
                    label="توليد"
                    icon="pi pi-check"
                    :loading="generating"
                    @click="generateReport"
                />
            </template>
        </Dialog>

        <!-- ─── Dialog عرض التقرير الكامل ─── -->
        <Dialog
            v-model:visible="showReportDialog"
            :header="`تقرير: ${activeReportData?.purchase_request?.request_number ?? ''}`"
            :modal="true"
            :style="{ width: '92vw', maxWidth: '1100px' }"
            :maximizable="true"
            dir="rtl"
        >
            <div v-if="reportLoading" class="flex justify-content-center align-items-center py-6">
                <ProgressSpinner style="width:48px;height:48px" />
            </div>

            <ReportViewer
                v-else-if="activeReportData"
                :data="activeReportData"
            />
        </Dialog>

        <!-- ─── Confirm Delete ─── -->
        <ConfirmDialog />

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import Breadcrumb    from 'primevue/breadcrumb'
import Card          from 'primevue/card'
import Button        from 'primevue/button'
import DataTable     from 'primevue/datatable'
import Column        from 'primevue/column'
import Tag           from 'primevue/tag'
import InputText     from 'primevue/inputtext'
import Dropdown      from 'primevue/dropdown'
import Dialog        from 'primevue/dialog'
import Paginator     from 'primevue/paginator'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import Select from 'primevue/select'
import ReportViewer from './components/reportViewer.vue'
import reportService from './reportService'
import type { ReportMeta, ReportData } from './reportService'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast   = useToast()
const confirm = useConfirm()

// ── Breadcrumb ────────────────────────────────────────
const breadcrumbHome  = ref({ icon: 'fas fa-house', to: '/' })
const breadcrumbItems = ref([
    { label: 'الرئيسية', to: '/', icon: 'fas fa-house' },
    { label: 'التقارير', icon: 'pi pi-file-pdf' },
])

// ── State ─────────────────────────────────────────────
const reports  = ref<ReportMeta[]>([])
const meta     = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)
const loading  = ref(false)

const searchPrId  = ref('')
const filterType  = ref<string | null>(null)
const currentPage = ref(1)
const perPage     = ref(15)

const reportTypeOptions = [
    { label: 'مراجعة كاملة',          value: 'full_review' },
    { label: 'توصية مشتريات',         value: 'procurement_recommendation' },
]

// ── Generate Dialog ───────────────────────────────────
const showGenerateDialog = ref(false)
const generating         = ref(false)
const generateForm       = ref({ purchase_request_id: null as number | null, report_type: 'full_review' })

// ── Report Viewer Dialog ──────────────────────────────
const showReportDialog  = ref(false)
const reportLoading     = ref(false)
const activeReportData  = ref<ReportData | null>(null)

// ── Regenerate ────────────────────────────────────────
const regeneratingId = ref<number | null>(null)
const availablePurchaseRequests = ref<{ label: string; value: number }[]>([])
const loadingPurchaseRequests   = ref(false)

// ── Fetch ─────────────────────────────────────────────
async function fetchReports() {
    loading.value = true
    try {
        const res = await reportService.getAll({
            page:                currentPage.value,
            per_page:            perPage.value,
            report_type:         filterType.value ?? undefined,
            purchase_request_id: searchPrId.value ? Number(searchPrId.value) : undefined,
        })
        reports.value = res.data.data ?? res.data
        meta.value    = res.meta ?? null
    } catch {
        toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل التقارير', life: 3000 })
    } finally {
        loading.value = false
    }
}

async function fetchAvailablePurchaseRequests() {
    loadingPurchaseRequests.value = true
    try {
        const res = await reportService.getAvailablePurchaseRequests()
        console.log(res.data.data)
        availablePurchaseRequests.value = res.data.data.map((pr: any) => ({
            label: `#${pr.request_number} — ${pr.title}`,
            value: pr.id,
        }))
    } catch {
        toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل طلبات الشراء', life: 3000 })
    } finally {
        loadingPurchaseRequests.value = false
    }
}


function onFilter() {
    currentPage.value = 1
    fetchReports()
}

function onPageChange(event: { page: number; rows: number }) {
    currentPage.value = event.page + 1
    perPage.value     = event.rows
    fetchReports()
}

// ── Generate ──────────────────────────────────────────
function openGenerateDialog() {
    generateForm.value = { purchase_request_id: null, report_type: 'full_review' }
    showGenerateDialog.value = true
    fetchAvailablePurchaseRequests() // ← أضف هذا
}


async function generateReport() {
    if (!generateForm.value.purchase_request_id) {
        toast.add({ severity: 'warn', summary: 'تنبيه', detail: 'أدخل رقم طلب الشراء', life: 3000 })
        return
    }
    generating.value = true
    try {
        const res = await reportService.store({
            purchase_request_id: generateForm.value.purchase_request_id!,
            report_type: generateForm.value.report_type as any,
        })
        toast.add({ severity: 'success', summary: 'تم', detail: res.message, life: 3000 })
        showGenerateDialog.value = false
        fetchReports()
        // فتح التقرير مباشرة بعد التوليد
        activeReportData.value  = res.data
        showReportDialog.value  = true
    } catch (err: any) {
        const msg = err?.response?.data?.message ?? 'فشل توليد التقرير'
        toast.add({ severity: 'error', summary: 'خطأ', detail: msg, life: 4000 })
    } finally {
        generating.value = false
    }
}

// ── View Report ───────────────────────────────────────
async function openReport(report: ReportMeta) {
  if (!report?.id) return

  router.push(`/reportsPrint/${report.id}`)
}

// ── Regenerate ────────────────────────────────────────
async function regenerateReport(report: ReportMeta) {
    regeneratingId.value = report.id
    try {
        const res = await reportService.update(report.id, { report_type: report.report_type })
        toast.add({ severity: 'success', summary: 'تم', detail: 'تم إعادة التوليد بنجاح', life: 3000 })
        fetchReports()
        activeReportData.value = res.data
        showReportDialog.value = true
    } catch {
        toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل إعادة التوليد', life: 3000 })
    } finally {
        regeneratingId.value = null
    }
}

// ── Delete ────────────────────────────────────────────
function confirmDelete(report: ReportMeta) {
    confirm.require({
        message: `هل أنت متأكد من حذف تقرير "${report.purchase_request?.request_number}"؟`,
        header:  'تأكيد الحذف',
        icon:    'pi pi-exclamation-triangle',
        rejectLabel: 'إلغاء',
        acceptLabel: 'حذف',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await reportService.destroy(report.id)
                toast.add({ severity: 'success', summary: 'تم', detail: 'تم حذف التقرير', life: 3000 })
                fetchReports()
            } catch {
                toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل حذف التقرير', life: 3000 })
            }
        },
    })
}

// ── Helpers ───────────────────────────────────────────
function reportTypeLabel(type: string) {
    return type === 'full_review' ? 'مراجعة كاملة' : 'توصية مشتريات'
}

// ── Init ──────────────────────────────────────────────
onMounted(fetchReports)
</script>