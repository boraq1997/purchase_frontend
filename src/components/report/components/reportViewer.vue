<template>
    <div class="report-viewer flex flex-column gap-5" dir="rtl">

        <!-- ═══════════════════════════════════════════════════════
            ١. معلومات طلب الشراء
        ═══════════════════════════════════════════════════════ -->
        <Panel header="معلومات طلب الشراء" toggleable>
            <div class="grid">
                <!-- يسار: البيانات الأساسية -->
                <div class="col-12 md:col-8">
                    <div class="grid row-gap-3">

                        <div class="col-6 md:col-4">
                            <InfoItem label="رقم الطلب"    :value="pr.request_number" />
                        </div>
                        <div class="col-6 md:col-4">
                            <InfoItem label="الأولوية">
                                <PriorityTag :priority="pr.priority" :label="pr.priority_label" />
                            </InfoItem>
                        </div>
                        <div class="col-6 md:col-4">
                            <InfoItem label="الحالة">
                                <StatusTag :status="pr.status_type" :label="pr.status_label" />
                            </InfoItem>
                        </div>

                        <div class="col-12 md:col-8">
                            <InfoItem label="العنوان"       :value="pr.title" />
                        </div>
                        <div class="col-6 md:col-4">
                            <InfoItem label="تاريخ الإنشاء" :value="pr.created_at" />
                        </div>

                        <div class="col-6 md:col-4">
                            <InfoItem label="القسم"         :value="pr.department?.name" />
                        </div>
                        <div class="col-6 md:col-4">
                            <InfoItem label="اللجنة"        :value="pr.committee?.name" />
                        </div>
                        <div class="col-6 md:col-4">
                            <InfoItem label="أنشأه"         :value="pr.creator?.name" />
                        </div>

                        <div class="col-12">
                            <InfoItem label="الوصف"         :value="pr.description || '—'" />
                        </div>

                        <div class="col-6 md:col-4">
                            <InfoItem label="التكلفة التقديرية الإجمالية">
                                <span class="font-bold text-primary">
                                    {{ formatCurrency(pr.total_estimated_cost) }}
                                </span>
                            </InfoItem>
                        </div>

                        <div v-if="pr.rejected_reason" class="col-12">
                            <InfoItem label="سبب الرفض">
                                <span class="text-red-500">{{ pr.rejected_reason }}</span>
                            </InfoItem>
                        </div>
                    </div>
                </div>

                <!-- يمين: صور الطلب -->
                <div class="col-12 md:col-4">
                    <div v-if="pr.images?.length" class="flex flex-column gap-2">
                        <span class="text-sm font-medium text-color-secondary mb-1">
                            <i class="pi pi-images ml-1" />مرفقات الطلب ({{ pr.images.length }})
                        </span>
                        <ImageGallery :images="pr.images" />
                    </div>
                    <div v-else class="text-color-secondary text-sm">
                        <i class="pi pi-image ml-1" />لا توجد مرفقات
                    </div>
                </div>

            </div>
        </Panel>

        <!-- ═══════════════════════════════════════════════════════
             ٢. الملخص المالي
        ═══════════════════════════════════════════════════════ -->
        <Panel header="الملخص المالي" toggleable>
            <div class="grid row-gap-3">

                <div class="col-6 md:col-3">
                    <FinancialCard
                        label="التكلفة التقديرية"
                        :amount="data.financial.total_estimated_cost"
                        icon="pi-calculator"
                        color="blue"
                    />
                </div>
                <div class="col-6 md:col-3">
                    <FinancialCard
                        label="إجمالي العروض المقبولة"
                        :amount="data.financial.accepted_estimates_total"
                        icon="pi-check-circle"
                        color="green"
                    />
                </div>
                <div class="col-6 md:col-3">
                    <FinancialCard
                        label="إجمالي المشتريات الفعلية"
                        :amount="data.financial.actual_procurement_total"
                        icon="pi-shopping-cart"
                        color="orange"
                    />
                </div>
                <div class="col-6 md:col-3">
                    <FinancialCard
                        label="الوفر / الفارق"
                        :amount="data.financial.saving"
                        icon="pi-wallet"
                        :color="(data.financial.saving ?? 0) >= 0 ? 'green' : 'red'"
                        :show-sign="true"
                    />
                </div>

                <!-- إحصائيات -->
                <div class="col-12">
                    <Divider />
                    <div class="flex flex-wrap gap-4">
                        <div class="flex align-items-center gap-2 text-sm">
                            <i class="pi pi-file text-blue-400" />
                            <span>عروض الأسعار: <strong>{{ data.financial.estimates_count }}</strong></span>
                        </div>
                        <div class="flex align-items-center gap-2 text-sm">
                            <i class="pi pi-check text-green-400" />
                            <span>المقبولة: <strong>{{ data.financial.accepted_estimates_count }}</strong></span>
                        </div>
                        <div class="flex align-items-center gap-2 text-sm">
                            <i class="pi pi-shopping-bag text-orange-400" />
                            <span>عمليات الشراء: <strong>{{ data.financial.procurements_count }}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- توزيع العروض على الموردين -->
                <div v-if="Object.keys(data.financial.estimates_by_vendor).length" class="col-12">
                    <Divider align="right">
                        <span class="text-sm text-color-secondary">توزيع عروض الأسعار على الموردين</span>
                    </Divider>
                    <div class="flex flex-wrap gap-3">
                        <div
                            v-for="(amount, vendor) in data.financial.estimates_by_vendor"
                            :key="vendor"
                            class="vendor-chip surface-100 border-round px-3 py-2"
                        >
                            <span class="text-sm font-medium">{{ vendor }}</span>
                            <span class="text-sm text-color-secondary mr-2">{{ formatCurrency(amount) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>

        <!-- ═══════════════════════════════════════════════════════
             ٣. المواد المطلوبة
        ═══════════════════════════════════════════════════════ -->
        <Panel header="المواد المطلوبة" toggleable>
            <div class="flex flex-column gap-4">
                <div
                    v-for="item in data.items"
                    :key="item.id"
                    class="item-card surface-50 border-round-lg border-1 border-200 p-4"
                >
                    <!-- رأس المادة -->
                    <div class="flex align-items-start justify-content-between gap-3 mb-3">
                        <div class="flex align-items-center gap-3">
                            <div class="item-index flex align-items-center justify-content-center
                                        w-2rem h-2rem border-round-lg bg-primary text-white text-sm font-bold flex-shrink-0">
                                {{ item.id }}
                            </div>
                            <div>
                                <div class="font-semibold text-lg">{{ item.item_name }}</div>
                                <div v-if="item.specifications" class="text-sm text-color-secondary mt-1">
                                    {{ item.specifications }}
                                </div>
                            </div>
                        </div>
                        <div class="flex align-items-center gap-3 flex-shrink-0">
                            <div class="text-sm text-color-secondary">
                                الكمية: <strong>{{ item.quantity }}</strong>
                                <span v-if="item.unit" class="mr-1">{{ item.unit.name }}</span>
                            </div>
                            <div v-if="item.total_estimated_price" class="text-sm">
                                التقدير: <strong class="text-primary">{{ formatCurrency(item.total_estimated_price) }}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="grid row-gap-3">

                        <!-- فحص المستودع -->
                        <div class="col-12 md:col-6">
                            <div class="sub-card surface-card border-round border-1 border-200 p-3 h-full">
                                <div class="flex align-items-center gap-2 mb-3">
                                    <i class="pi pi-box text-blue-500" />
                                    <span class="font-medium text-sm">فحص المستودع</span>
                                </div>
                                <div v-if="item.warehouse_check" class="flex flex-column gap-2">
                                    <div class="flex align-items-center justify-content-between">
                                        <span class="text-sm text-color-secondary">التوفر</span>
                                        <AvailabilityTag
                                            :availability="item.warehouse_check.availability"
                                            :label="item.warehouse_check.availability_label"
                                        />
                                    </div>
                                    <div class="flex align-items-center justify-content-between">
                                        <span class="text-sm text-color-secondary">الكمية المتوفرة</span>
                                        <strong>{{ item.warehouse_check.available_quantity }}</strong>
                                    </div>
                                    <div v-if="item.warehouse_check.item_condition" class="flex align-items-center justify-content-between">
                                        <span class="text-sm text-color-secondary">الحالة</span>
                                        <span class="text-sm">{{ item.warehouse_check.item_condition }}</span>
                                    </div>
                                    <div class="flex align-items-center justify-content-between">
                                        <span class="text-sm text-color-secondary">التوصية</span>
                                        <span class="text-sm font-medium">{{ item.warehouse_check.recommendation_label }}</span>
                                    </div>
                                    <div v-if="item.warehouse_check.notes" class="text-sm text-color-secondary border-top-1 border-200 pt-2 mt-1">
                                        {{ item.warehouse_check.notes }}
                                    </div>
                                    <div class="text-xs text-color-secondary mt-1">
                                        فحص بواسطة: {{ item.warehouse_check.checked_by }}
                                    </div>
                                </div>
                                <div v-else class="text-sm text-color-secondary">
                                    <i class="pi pi-minus-circle ml-1" />لم يُفحص بعد
                                </div>
                            </div>
                        </div>

                        <!-- تقييم الاحتياج -->
                        <div class="col-12 md:col-6">
                            <div class="sub-card surface-card border-round border-1 border-200 p-3 h-full">
                                <div class="flex align-items-center gap-2 mb-3">
                                    <i class="pi pi-chart-bar text-purple-500" />
                                    <span class="font-medium text-sm">تقييم الاحتياج</span>
                                </div>
                                <div v-if="item.needs_assessment" class="flex flex-column gap-2">
                                    <div class="flex align-items-center justify-content-between">
                                        <span class="text-sm text-color-secondary">مستوى الإلحاح</span>
                                        <UrgencyTag
                                            :level="item.needs_assessment.urgency_level"
                                            :label="item.needs_assessment.urgency_label"
                                        />
                                    </div>
                                    <div class="flex align-items-center justify-content-between">
                                        <span class="text-sm text-color-secondary">حالة الاحتياج</span>
                                        <span class="text-sm font-medium">{{ item.needs_assessment.needs_status_label }}</span>
                                    </div>
                                    <div v-if="item.needs_assessment.quantity_needed_after_assessment" class="flex align-items-center justify-content-between">
                                        <span class="text-sm text-color-secondary">الكمية المطلوبة</span>
                                        <strong>{{ item.needs_assessment.quantity_needed_after_assessment }}</strong>
                                    </div>
                                    <div class="flex align-items-center justify-content-between">
                                        <span class="text-sm text-color-secondary">قرار الإدارة</span>
                                        <AdminDecisionTag
                                            :decision="item.needs_assessment.admin_decision"
                                            :label="item.needs_assessment.admin_decision_label"
                                        />
                                    </div>
                                    <div v-if="item.needs_assessment.recommended_action" class="text-sm border-top-1 border-200 pt-2 mt-1">
                                        <span class="text-color-secondary">التوصية: </span>{{ item.needs_assessment.recommended_action }}
                                    </div>
                                    <div class="text-xs text-color-secondary mt-1">
                                        قيّمه: {{ item.needs_assessment.assessed_by }}
                                    </div>
                                </div>
                                <div v-else class="text-sm text-color-secondary">
                                    <i class="pi pi-minus-circle ml-1" />لم يُقيَّم بعد
                                </div>
                            </div>
                        </div>

                        <!-- عروض الأسعار للمادة -->
                        <div v-if="item.estimate_items?.length" class="col-12">
                            <div class="sub-card surface-card border-round border-1 border-200 p-3">
                                <div class="flex align-items-center gap-2 mb-3">
                                    <i class="pi pi-tag text-orange-500" />
                                    <span class="font-medium text-sm">عروض الأسعار ({{ item.estimate_items.length }})</span>
                                </div>
                                <DataTable
                                    :value="item.estimate_items"
                                    class="p-datatable-sm"
                                    striped-rows
                                    :show-gridlines="false"
                                >
                                    <Column field="estimate.vendor.name" header="المورد" />
                                    <Column field="quantity" header="الكمية" style="width:7rem" />
                                    <Column field="unit_price" header="سعر الوحدة" style="width:9rem">
                                        <template #body="{ data: ei }">{{ formatCurrency(ei.unit_price) }}</template>
                                    </Column>
                                    <Column field="total_price" header="الإجمالي" style="width:9rem">
                                        <template #body="{ data: ei }">
                                            <strong>{{ formatCurrency(ei.total_price) }}</strong>
                                        </template>
                                    </Column>
                                    <Column field="estimate.status_label" header="الحالة" style="width:8rem">
                                        <template #body="{ data: ei }">
                                            <StatusTag
                                                v-if="ei.estimate"
                                                :status="ei.estimate.status"
                                                :label="ei.estimate.status_label"
                                            />
                                        </template>
                                    </Column>
                                    <Column header="صور" style="width:6rem">
                                        <template #body="{ data: ei }">
                                            <Button
                                                v-if="ei.estimate?.images?.length"
                                                icon="pi pi-images"
                                                text
                                                rounded
                                                size="small"
                                                :badge="String(ei.estimate.images.length)"
                                                v-tooltip.top="`${ei.estimate.images.length} صورة`"
                                                @click="previewImages(ei.estimate.images)"
                                            />
                                            <span v-else class="text-color-secondary text-xs">—</span>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Panel>

        <!-- ═══════════════════════════════════════════════════════
             ٤. عروض الأسعار
        ═══════════════════════════════════════════════════════ -->
        <Panel header="عروض الأسعار" toggleable>
            <div class="flex flex-column gap-4">
                <div
                    v-for="est in data.estimates"
                    :key="est.id"
                    class="estimate-card surface-50 border-round-lg border-1 p-4"
                    :class="estimateCardClass(est.status)"
                >
                    <!-- رأس عرض السعر -->
                    <div class="flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                        <div class="flex align-items-center gap-3">
                            <div class="flex flex-column">
                                <span class="font-semibold">{{ est.vendor?.name ?? '—' }}</span>
                                <span class="text-sm text-color-secondary mt-1">
                                    <i class="pi pi-calendar ml-1" />{{ est.estimate_date }}
                                </span>
                            </div>
                        </div>
                        <div class="flex align-items-center gap-3">
                            <StatusTag :status="est.status" :label="est.status_label" />
                            <span class="font-bold text-xl text-primary">{{ formatCurrency(est.total_amount) }}</span>
                        </div>
                    </div>

                    <!-- بيانات المورد -->
                    <div v-if="est.vendor" class="grid text-sm mb-3">
                        <div class="col-6 md:col-3 flex align-items-center gap-2 text-color-secondary">
                            <i class="pi pi-phone" /> {{ est.vendor.phone1 }}
                        </div>
                        <div v-if="est.vendor.email" class="col-6 md:col-3 flex align-items-center gap-2 text-color-secondary">
                            <i class="pi pi-envelope" /> {{ est.vendor.email }}
                        </div>
                        <div v-if="est.vendor.address" class="col-12 md:col-6 flex align-items-center gap-2 text-color-secondary">
                            <i class="pi pi-map-marker" /> {{ est.vendor.address }}
                        </div>
                    </div>

                    <!-- جدول المواد -->
                    <DataTable
                        :value="est.items"
                        class="p-datatable-sm mb-3"
                        striped-rows
                        :show-gridlines="false"
                    >
                        <Column field="item_name" header="المادة" />
                        <Column field="quantity"  header="الكمية"  style="width:7rem" />
                        <Column field="unit_price" header="سعر الوحدة" style="width:9rem">
                            <template #body="{ data: ei }">{{ formatCurrency(ei.unit_price) }}</template>
                        </Column>
                        <Column field="total_price" header="الإجمالي" style="width:9rem">
                            <template #body="{ data: ei }">
                                <strong>{{ formatCurrency(ei.total_price) }}</strong>
                            </template>
                        </Column>
                    </DataTable>

                    <!-- صور عرض السعر -->
                    <div v-if="est.images?.length" class="flex flex-column gap-2">
                        <span class="text-sm text-color-secondary">
                            <i class="pi pi-images ml-1" />مرفقات عرض السعر ({{ est.images.length }})
                        </span>
                        <ImageGallery :images="est.images" />
                    </div>

                    <!-- ملاحظات -->
                    <div v-if="est.notes" class="text-sm text-color-secondary border-top-1 border-200 pt-2 mt-2">
                        <i class="pi pi-comment ml-1" />{{ est.notes }}
                    </div>
                </div>

                <div v-if="!data.estimates.length" class="text-center text-color-secondary py-4">
                    <i class="pi pi-inbox text-4xl mb-2 block" />
                    لا توجد عروض أسعار
                </div>
            </div>
        </Panel>

        <!-- ═══════════════════════════════════════════════════════
             ٥. عمليات الشراء
        ═══════════════════════════════════════════════════════ -->
        <Panel header="عمليات الشراء" toggleable>
            <div class="flex flex-column gap-4">
                <div
                    v-for="proc in data.procurements"
                    :key="proc.id"
                    class="surface-50 border-round-lg border-1 border-200 p-4"
                >
                    <!-- رأس عملية الشراء -->
                    <div class="flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                        <div class="flex align-items-center gap-3">
                            <Tag :value="proc.reference_no" severity="secondary" />
                            <StatusTag :status="proc.status" :label="proc.status_label" />
                        </div>
                        <div class="flex align-items-center gap-4 text-sm text-color-secondary">
                            <span><i class="pi pi-calendar ml-1" />{{ proc.purchase_date }}</span>
                            <span><i class="pi pi-user ml-1" />{{ proc.created_by }}</span>
                            <span class="font-bold text-xl text-primary">{{ formatCurrency(proc.total_amount) }}</span>
                        </div>
                    </div>

                    <!-- جدول المواد -->
                    <DataTable
                        :value="proc.items"
                        class="p-datatable-sm"
                        striped-rows
                        :show-gridlines="false"
                    >
                        <Column field="item_name"      header="المادة" />
                        <Column field="unit"           header="الوحدة"    style="width:7rem" />
                        <Column field="quantity"       header="الكمية"    style="width:7rem" />
                        <Column field="estimate_price" header="سعر العرض" style="width:9rem">
                            <template #body="{ data: pi }">{{ formatCurrency(pi.estimate_price) }}</template>
                        </Column>
                        <Column field="purchase_price" header="سعر الشراء" style="width:9rem">
                            <template #body="{ data: pi }">{{ formatCurrency(pi.purchase_price) }}</template>
                        </Column>
                        <Column field="difference" header="الفارق" style="width:8rem">
                            <template #body="{ data: pi }">
                                <span :class="pi.difference > 0 ? 'text-red-500' : pi.difference < 0 ? 'text-green-500' : ''">
                                    {{ formatCurrency(pi.difference) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="total_price" header="الإجمالي" style="width:9rem">
                            <template #body="{ data: pi }">
                                <strong>{{ formatCurrency(pi.total_price) }}</strong>
                            </template>
                        </Column>
                    </DataTable>

                    <div v-if="proc.notes" class="text-sm text-color-secondary border-top-1 border-200 pt-2 mt-2">
                        <i class="pi pi-comment ml-1" />{{ proc.notes }}
                    </div>
                </div>

                <div v-if="!data.procurements.length" class="text-center text-color-secondary py-4">
                    <i class="pi pi-inbox text-4xl mb-2 block" />
                    لا توجد عمليات شراء
                </div>
            </div>
        </Panel>

        <!-- ─── Footer ─── -->
        <div class="flex justify-content-end text-xs text-color-secondary gap-4 pt-2 border-top-1 border-200">
            <span><i class="pi pi-clock ml-1" />تم التوليد: {{ data.generated_at }}</span>
            <span><i class="pi pi-user ml-1" />بواسطة: {{ data.generated_by }}</span>
        </div>

    </div>

    <!-- ─── Image Preview Dialog ─── -->
    <Dialog
        v-model:visible="showImageDialog"
        header="معاينة الصور"
        :modal="true"
        :style="{ width: '80vw', maxWidth: '900px' }"
        dir="rtl"
    >
        <Galleria
            :value="previewImageList"
            :num-visible="5"
            :circular="true"
            :show-thumbnails="true"
            :show-item-navigators="true"
            :pt="{ root: { style: 'max-width: 860px; margin: 0 auto' } }"
        >
            <template #item="{ item }">
                <img
                    :src="item.file_url"
                    :alt="item.file_name"
                    style="width:100%; max-height:500px; object-fit:contain"
                />
            </template>
            <template #thumbnail="{ item }">
                <img
                    :src="item.file_url"
                    :alt="item.file_name"
                    style="width:60px; height:40px; object-fit:cover"
                />
            </template>
        </Galleria>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import Panel      from 'primevue/panel'
import DataTable  from 'primevue/datatable'
import Column     from 'primevue/column'
import Tag        from 'primevue/tag'
import Button     from 'primevue/button'
import Dialog     from 'primevue/dialog'
import Galleria   from 'primevue/galleria'
import Divider    from 'primevue/divider'

import InfoItem       from './InfoItem.vue'
import StatusTag      from './StatusTag.vue'
import PriorityTag    from './PriorityTag.vue'
import AvailabilityTag from './AvailabilityTag.vue'
import UrgencyTag     from './UrgencyTag.vue'
import AdminDecisionTag from './AdminDecisionTag.vue'
import FinancialCard  from './FinancialCard.vue'
import ImageGallery   from './ImageGallery.vue'

import type { ReportData, ReportImage } from '../reportService'

const props = defineProps<{ data: ReportData }>()

const pr = computed(() => props.data.purchase_request)

// ── Image Preview ─────────────────────────────────────
const showImageDialog   = ref(false)
const previewImageList  = ref<ReportImage[]>([])

function previewImages(images: ReportImage[]) {
    previewImageList.value = images
    showImageDialog.value  = true
}

// ── Helpers ───────────────────────────────────────────
function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—'
    return new Intl.NumberFormat('ar-IQ', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value) + ' د.ع'
}

function estimateCardClass(status: string) {
    return {
        'border-green-400 bg-green-50': status === 'accepted',
        'border-red-300  bg-red-50':   status === 'rejected',
        'border-200':                   status === 'pending',
    }
}
</script>

<style scoped>
.item-card   { transition: box-shadow .2s; }
.item-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }
.item-index { min-width: 2rem; }
.vendor-chip { border: 1px solid var(--surface-border); }
</style>