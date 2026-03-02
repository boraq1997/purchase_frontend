<template>
    <div class="surface-card border-round-2xl border-1 border-200 overflow-hidden h-full flex flex-column transition-all transition-duration-200 hover:shadow-4 hover:border-primary-200 cursor-pointer">

        <!-- ─── Header ───────────────────────────────────────────────────── -->
        <div class="px-4 pt-4 pb-3 flex align-items-start justify-content-between gap-3">
            <div class="flex flex-column gap-2 flex-1 min-w-0">
                <div class="flex align-items-center gap-2">
                    <Tag
                        :value="getStatusLabel(estimate.status)"
                        :severity="getStatusSeverity(estimate.status)"
                        class="text-xs border-round-lg"
                    />
                    <span class="text-400 text-xs font-medium">#{{ estimate.id }}</span>
                </div>
                <div class="flex align-items-center gap-2">
                    <Avatar icon="fas fa-store" shape="square" size="normal"
                        class="border-round-lg flex-shrink-0"
                        :style="{ background: 'var(--primary-50)', color: 'var(--primary-600)' }" />
                    <span class="font-bold text-900 text-lg white-space-nowrap overflow-hidden text-overflow-ellipsis">
                        {{ estimate.vendor?.name || 'غير متوفر' }}
                    </span>
                </div>
            </div>
            <div class="flex flex-column align-items-end gap-1 flex-shrink-0">
                <span class="text-400 text-xs flex align-items-center gap-1">
                    <i class="fas fa-calendar-days text-xs"/>
                    {{ formatDate(estimate.estimate_date) }}
                </span>
            </div>
        </div>

        <Divider class="my-0" />

        <!-- ─── Body ─────────────────────────────────────────────────────── -->
        <div class="px-4 py-3 flex flex-column gap-3 flex-1">

            <!-- طلب الشراء -->
            <div class="surface-50 border-round-xl border-1 border-200 p-3">
                <div class="flex align-items-center gap-2 mb-2">
                    <i class="fas fa-cart-shopping text-xs text-primary-500"/>
                    <span class="text-400 text-xs font-semibold uppercase" style="letter-spacing:.06em">طلب الشراء</span>
                </div>
                <p class="font-semibold text-900 text-sm m-0 mb-1 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                    {{ estimate.purchase_request?.title || 'غير محدد' }}
                </p>
                <p class="text-400 text-xs m-0 font-medium" style="font-family:monospace">
                    {{ estimate.purchase_request?.request_number || '—' }}
                </p>
            </div>

            <!-- بيانات التواصل -->
            <div class="flex flex-column gap-2">
                <div v-for="(row, i) in contactRows" :key="i"
                    class="flex align-items-center gap-2">
                    <div class="flex align-items-center justify-content-center border-round border-1 border-200 surface-100 flex-shrink-0"
                        style="width:28px;height:28px">
                        <i :class="row.icon + ' text-xs text-500'"/>
                    </div>
                    <span class="text-700 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">
                        {{ row.value }}
                    </span>
                </div>
            </div>

            <!-- ملاحظات -->
            <div v-if="estimate.notes"
                class="border-round-lg border-1 border-orange-200 p-2 flex align-items-start gap-2"
                style="background:var(--orange-50)">
                <i class="fas fa-note-sticky text-orange-400 text-xs mt-1 flex-shrink-0"/>
                <p class="text-700 text-xs m-0 line-height-3"
                    style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                    {{ estimate.notes }}
                </p>
            </div>
        </div>

        <!-- ─── Amount ────────────────────────────────────────────────────── -->
        <div class="mx-4 mb-3 border-round-xl p-3 flex align-items-center justify-content-between"
            style="background:linear-gradient(135deg,var(--primary-600),var(--primary-400))">
            <div>
                <p class="text-xs m-0 mb-1 font-medium" style="color:rgba(255,255,255,.75)">المبلغ الإجمالي</p>
                <p class="text-xl font-bold m-0 text-white">
                    {{ formatCurrency(estimate.total_amount) }}
                    <span class="text-sm font-normal" style="opacity:.8">د.ع</span>
                </p>
            </div>
            <div class="border-round-lg flex align-items-center justify-content-center"
                style="width:40px;height:40px;background:rgba(255,255,255,.15)">
                <i class="fas fa-coins text-white"/>
            </div>
        </div>

        <!-- ─── Actions ───────────────────────────────────────────────────── -->
        <div class="px-4 pb-4 flex gap-2">
            <Button label="عرض" icon="fas fa-eye" size="small" outlined
                class="flex-1 border-round-lg" @click="emit('view', estimate)" />
            <Button v-if="canEdit" label="تعديل" icon="fas fa-pen" size="small"
                class="flex-1 border-round-lg" @click="emit('edit', estimate)" />
            <Button v-if="canDelete" icon="fas fa-trash" size="small"
                severity="danger" outlined class="border-round-lg"
                @click="emit('delete', estimate)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import type { Estimate } from '../estimateService';

const props = defineProps<{
    estimate: Estimate;
    canEdit?: boolean;
    canDelete?: boolean;
}>();

const emit = defineEmits<{
    'view': [estimate: Estimate];
    'edit': [estimate: Estimate];
    'delete': [estimate: Estimate];
}>();

const contactRows = computed(() => [
    { icon: 'fas fa-phone-flip', value: props.estimate.vendor?.phone1 || 'غير متوفر' },
    { icon: 'fas fa-envelope',   value: props.estimate.vendor?.email   || 'غير متوفر' },
    { icon: 'fas fa-location-dot', value: props.estimate.vendor?.address || 'غير متوفر' },
]);

const getStatusLabel    = (s: string) => ({ pending: 'قيد الانتظار', accepted: 'موافق عليه', rejected: 'مرفوض' }[s] || s);
const getStatusSeverity = (s: string): any => ({ pending: 'warn', accepted: 'success', rejected: 'danger' }[s] || 'secondary');
const formatDate        = (d?: string | null) => d ? new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const formatCurrency    = (v: any) => parseFloat(v || '0').toLocaleString('ar-IQ');
</script>