<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        modal
        header="تفاصيل عملية الشراء"
        :style="{ width: '85vw', maxWidth: '1100px' }"
        :breakpoints="{ '960px': '95vw' }"
        dir="rtl"
    >
        <!-- ─── Banner ────────────────────────────────────────────────────── -->
        <div class="mb-4 p-4 border-round-xl"
            style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5986 100%)">
            <div class="flex justify-content-between align-items-center flex-wrap gap-3">
                <div class="flex align-items-center gap-3">
                    <div class="flex align-items-center justify-content-center border-round-xl"
                        style="width:52px;height:52px;background:rgba(255,255,255,0.12)">
                        <i class="fas fa-truck-ramp-box text-2xl text-white"/>
                    </div>
                    <div>
                        <div class="flex align-items-center gap-2 mb-1">
                            <span class="font-bold text-white text-xl">{{ data?.reference_no ?? '—' }}</span>
                            <Tag :value="statusLabel" :style="{ background: statusBg, color: statusColor }"
                                class="text-xs font-semibold border-round-lg px-3" />
                        </div>
                        <div class="text-blue-200 text-sm flex align-items-center gap-2">
                            <i class="fas fa-cart-shopping"/>
                            {{ data?.purchase_request?.title ?? '—' }}
                            <span class="text-blue-300 mx-1">·</span>
                            <i class="fas fa-hashtag"/>
                            {{ data?.purchase_request?.request_number ?? '—' }}
                        </div>
                    </div>
                </div>
                <div class="p-3 border-round-xl text-center"
                    style="background:rgba(255,255,255,0.1);min-width:200px">
                    <div class="text-blue-200 text-xs mb-1 font-semibold">المبلغ الإجمالي</div>
                    <div class="text-white font-bold text-3xl">{{ formatCurrency(data?.total_amount) }}</div>
                    <div class="text-blue-200 text-xs mt-1">دينار عراقي</div>
                </div>
            </div>
        </div>

        <div class="grid">
            <!-- ─── العمود الأيسر ─────────────────────────────────────── -->
            <div class="col-12 lg:col-8">

                <!-- جدول المواد -->
                <div class="surface-card border-round-xl p-4 shadow-2 mb-4">
                    <h3 class="text-lg font-bold text-900 mb-4 flex align-items-center gap-2">
                        <i class="fas fa-boxes-stacked text-primary-500"/>
                        المواد
                        <Badge :value="data?.items?.length ?? 0" severity="secondary" class="mr-2" />
                    </h3>
                    <DataTable :value="data?.items ?? []" responsiveLayout="scroll" stripedRows size="small"
                        :pt="{ thead: { class: 'surface-100' } }">
                        <Column>
                            <template #header><span class="text-600 text-sm">المادة</span></template>
                            <template #body="{ data: row }">
                                <div class="flex align-items-center gap-2">
                                    <i class="fas fa-box text-400 text-sm"/>
                                    <span class="font-semibold text-900">{{ row.item_name }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column style="width:90px">
                            <template #header><span class="text-600 text-sm">الوحدة</span></template>
                            <template #body="{ data: row }">
                                <span class="text-500 text-sm">{{ unitLabel(row.unit) }}</span>
                            </template>
                        </Column>
                        <Column style="width:90px">
                            <template #header><span class="text-600 text-sm">الكمية</span></template>
                            <template #body="{ data: row }">
                                <Tag :value="`${row.quantity}`" severity="secondary"
                                    :pt="{ root: { class: 'border-round-lg px-3 font-semibold' } }" />
                            </template>
                        </Column>
                        <Column style="width:140px">
                            <template #header><span class="text-600 text-sm">سعر الوحدة</span></template>
                            <template #body="{ data: row }">
                                <span class="font-medium text-900">{{ formatCurrency(row.unit_price) }}</span>
                                <span class="text-400 text-xs mr-1">د.ع</span>
                            </template>
                        </Column>
                        <Column style="width:140px">
                            <template #header><span class="text-600 text-sm">المجموع</span></template>
                            <template #body="{ data: row }">
                                <span class="font-bold text-primary-600">{{ formatCurrency(row.total_price) }}</span>
                                <span class="text-400 text-xs mr-1">د.ع</span>
                            </template>
                        </Column>
                        <Column style="width:120px">
                            <template #header><span class="text-600 text-sm">الفرق</span></template>
                            <template #body="{ data: row }">
                                <span v-if="row.difference != null"
                                    :class="row.difference > 0 ? 'text-red-500' : row.difference < 0 ? 'text-green-500' : 'text-400'"
                                    class="font-semibold text-sm">
                                    {{ row.difference > 0 ? '+' : '' }}{{ formatCurrency(row.difference) }}
                                </span>
                                <span v-else class="text-400">—</span>
                            </template>
                        </Column>
                    </DataTable>

                    <!-- الإجمالي -->
                    <div class="mt-3 p-3 border-round-xl flex justify-content-between align-items-center"
                        style="background:linear-gradient(135deg,#1e3a5f,#2d5986)">
                        <span class="text-white font-semibold">المجموع الكلي</span>
                        <div>
                            <span class="text-white font-bold text-2xl">{{ formatCurrency(data?.total_amount) }}</span>
                            <span class="text-blue-200 text-sm mr-2">دينار عراقي</span>
                        </div>
                    </div>
                </div>

                <!-- عرض السعر المرتبط -->
                <div v-if="data?.estimate" class="surface-card border-round-xl p-4 shadow-2">
                    <h3 class="text-lg font-bold text-900 mb-3 flex align-items-center gap-2">
                        <i class="fas fa-file-invoice-dollar text-primary-500"/>
                        عرض السعر المرتبط
                    </h3>
                    <div class="grid">
                        <div class="col-6">
                            <div class="p-3 border-round-lg"
                                style="background:linear-gradient(135deg,rgba(102,126,234,0.05),rgba(118,75,162,0.05))">
                                <div class="text-500 text-xs mb-1">رقم عرض السعر</div>
                                <div class="font-bold text-900">#{{ data.estimate.id }}</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="p-3 border-round-lg"
                                style="background:linear-gradient(135deg,rgba(102,126,234,0.05),rgba(118,75,162,0.05))">
                                <div class="text-500 text-xs mb-1">المبلغ التقديري</div>
                                <div class="font-bold text-900">{{ formatCurrency(data.estimate.total_amount) }} د.ع</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ─── العمود الأيمن ──────────────────────────────────────── -->
            <div class="col-12 lg:col-4 flex flex-column gap-4">

                <!-- معلومات العملية -->
                <div class="surface-card border-round-xl p-4 shadow-2">
                    <h3 class="text-lg font-bold text-900 mb-3 flex align-items-center gap-2">
                        <i class="fas fa-circle-info text-primary-500"/>
                        معلومات العملية
                    </h3>
                    <div class="flex flex-column gap-3">
                        <div v-for="item in infoItems" :key="item.label"
                            class="flex align-items-center gap-3 p-2 border-round-lg hover:surface-100 transition-colors transition-duration-150">
                            <div class="flex align-items-center justify-content-center border-round-lg"
                                style="width:32px;height:32px;background:var(--primary-50)">
                                <i :class="item.icon" style="color:var(--primary-500);font-size:0.75rem"/>
                            </div>
                            <div class="flex-1">
                                <div class="text-400 text-xs">{{ item.label }}</div>
                                <div class="text-900 font-semibold text-sm">{{ item.value }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- الملاحظات -->
                <div class="surface-card border-round-xl p-4 shadow-2">
                    <h3 class="text-lg font-bold text-900 mb-3 flex align-items-center gap-2">
                        <i class="fas fa-note-sticky text-primary-500"/>
                        الملاحظات
                    </h3>
                    <div class="p-3 border-round-lg"
                        style="background:linear-gradient(135deg,rgba(255,216,155,0.08),rgba(25,84,123,0.08))">
                        <p v-if="data?.notes" class="text-900 m-0 line-height-3 text-sm">{{ data.notes }}</p>
                        <p v-else class="text-400 m-0 text-sm">لا توجد ملاحظات</p>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="إغلاق" icon="fas fa-times" severity="secondary" outlined
                class="px-5" @click="emit('update:visible', false)" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { Procurement } from '../procurementService';

const props = defineProps<{
    visible: boolean;
    data: Procurement | null;
}>();

const emit = defineEmits<{ 'update:visible': [boolean] }>();

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    in_progress: { label: 'جارية',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    completed:   { label: 'مكتملة', color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
    cancelled:   { label: 'ملغاة',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
};

const s           = computed(() => statusMap[props.data?.status ?? ''] ?? statusMap.in_progress);
const statusLabel = computed(() => s.value.label);
const statusColor = computed(() => s.value.color);
const statusBg    = computed(() => s.value.bg);

const formatDate     = (d?: string | null) => d ? new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const formatCurrency = (v: any) => parseFloat(v || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const unitLabels: Record<string, string> = {
    piece: 'قطعة', box: 'صندوق', carton: 'كارتون', pack: 'حزمة', set: 'طقم',
    kg: 'كغ', g: 'غرام', ton: 'طن', meter: 'متر', cm: 'سم', roll: 'لفة', liter: 'لتر', ml: 'مل',
};
const unitLabel = (u?: string | null) => u ? (unitLabels[u] ?? u) : '—';

const infoItems = computed(() => [
    { icon: 'fas fa-hashtag',        label: 'رقم المرجع',      value: props.data?.reference_no ?? '—' },
    { icon: 'fas fa-calendar-alt',   label: 'تاريخ الشراء',    value: formatDate(props.data?.purchase_date) },
    { icon: 'fas fa-cart-shopping',  label: 'طلب الشراء',      value: props.data?.purchase_request?.request_number ?? '—' },
    { icon: 'fas fa-boxes-stacked',  label: 'عدد المواد',      value: `${props.data?.items?.length ?? 0} مادة` },
]);
</script>