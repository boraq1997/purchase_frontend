<template>
    <div class="procurement-card surface-card border-round-2xl border-1 border-200 overflow-hidden transition-all transition-duration-300 hover:shadow-4 hover:-translate-y-1"
        style="cursor:pointer" @click="emit('view', procurement)">

        <!-- ─── Top accent bar ──────────────────────────────────────────── -->
        <div class="h-1" :style="{ background: statusGradient }" />

        <!-- ─── Header ──────────────────────────────────────────────────── -->
        <div class="px-4 pt-4 pb-3 flex justify-content-between align-items-start gap-3">
            <div class="flex align-items-center gap-3 min-w-0">
                <div class="flex align-items-center justify-content-center border-round-xl flex-shrink-0"
                    style="width:44px;height:44px"
                    :style="{ background: statusBg }">
                    <i :class="statusIcon" class="text-lg" :style="{ color: statusColor }" />
                </div>
                <div class="min-w-0">
                    <div class="font-bold text-900 text-base white-space-nowrap overflow-hidden text-overflow-ellipsis">
                        {{ procurement.reference_no ?? '—' }}
                    </div>
                    <div class="text-500 text-xs mt-1 flex align-items-center gap-1">
                        <i class="fas fa-cart-shopping text-xs"/>
                        {{ procurement.purchase_request?.title ?? '—' }}
                    </div>
                </div>
            </div>
            <Tag :value="statusLabel" :style="{ background: statusBg, color: statusColor, border: `1px solid ${statusColor}20` }"
                class="text-xs font-semibold flex-shrink-0 border-round-lg px-3" />
        </div>

        <!-- ─── Divider ──────────────────────────────────────────────────── -->
        <div class="mx-4 border-top-1 border-200" />

        <!-- ─── Body ─────────────────────────────────────────────────────── -->
        <div class="px-4 py-3 flex flex-column gap-3">

            <!-- المبلغ الإجمالي -->
            <div class="flex align-items-center justify-content-between p-3 border-round-xl"
                style="background: linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)">
                <span class="text-500 text-sm">المبلغ الإجمالي</span>
                <span class="font-bold text-primary-600 text-lg">
                    {{ formatCurrency(procurement.total_amount) }}
                    <span class="text-400 text-xs font-normal mr-1">د.ع</span>
                </span>
            </div>

            <!-- التفاصيل -->
            <div class="grid" style="gap:0.5rem">
                <div class="col-6">
                    <div class="text-400 text-xs mb-1"><i class="fas fa-calendar-alt ml-1"/>تاريخ الشراء</div>
                    <div class="text-800 text-sm font-medium">{{ formatDate(procurement.purchase_date) }}</div>
                </div>
                <div class="col-6">
                    <div class="text-400 text-xs mb-1"><i class="fas fa-boxes-stacked ml-1"/>عدد المواد</div>
                    <div class="text-800 text-sm font-medium">{{ procurement.items?.length ?? 0 }} مادة</div>
                </div>
                <div class="col-12">
                    <div class="text-400 text-xs mb-1"><i class="fas fa-file-invoice ml-1"/>رقم طلب الشراء</div>
                    <div class="text-800 text-sm font-medium">{{ procurement.purchase_request?.request_number ?? '—' }}</div>
                </div>
            </div>
        </div>

        <!-- ─── Footer actions ───────────────────────────────────────────── -->
        <div class="px-4 pb-4 flex gap-2 justify-content-end" @click.stop>
            <Button v-if="canEdit" icon="fas fa-pen" size="small" severity="secondary" variant="outlined"
                v-tooltip.top="'تعديل'" class="border-round-lg" style="width:34px;height:34px"
                @click="emit('edit', procurement)" />
            <Button v-if="canDelete" icon="fas fa-trash" size="small" severity="danger" variant="outlined"
                v-tooltip.top="'حذف'" class="border-round-lg" style="width:34px;height:34px"
                @click="emit('delete', procurement)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import type { Procurement } from '../procurementService';

const props = defineProps<{
    procurement: Procurement;
    canEdit?: boolean;
    canDelete?: boolean;
}>();

const emit = defineEmits<{
    view:   [p: Procurement];
    edit:   [p: Procurement];
    delete: [p: Procurement];
}>();

const statusMap = {
    in_progress: { label: 'جارية',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  icon: 'fas fa-spinner',      gradient: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
    completed:   { label: 'مكتملة',  color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   icon: 'fas fa-circle-check', gradient: 'linear-gradient(90deg,#22c55e,#4ade80)' },
    cancelled:   { label: 'ملغاة',   color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   icon: 'fas fa-circle-xmark', gradient: 'linear-gradient(90deg,#ef4444,#f87171)' },
};

const s              = computed(() => statusMap[props.procurement.status] ?? statusMap.in_progress);
const statusLabel    = computed(() => s.value.label);
const statusColor    = computed(() => s.value.color);
const statusBg       = computed(() => s.value.bg);
const statusIcon     = computed(() => s.value.icon);
const statusGradient = computed(() => s.value.gradient);

const formatDate     = (d?: string | null) => d ? new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const formatCurrency = (v: any) => parseFloat(v || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
</script>