<template>
    <div @click="emit('view', procurement)" style="cursor:pointer">
        <Card class="border-1 border-200 border-round-2xl overflow-hidden hover:shadow-4 transition-all transition-duration-300 hover:-translate-y-1">

            <template #header>
                <!-- شريط الحالة -->
                <div class="h-1 w-full" :style="{ background: statusBar }" />
            </template>

            <template #content>
                <div class="flex flex-column gap-3">

                    <!-- ── الرأس: أيقونة + عنوان + badge ── -->
                    <div class="flex align-items-start justify-content-between gap-2">
                        <div class="flex align-items-start gap-3 min-w-0">
                            <Avatar
                                :icon="statusIcon"
                                shape="square"
                                size="large"
                                class="border-round-xl flex-shrink-0"
                                :style="{ background: statusBg, color: statusColor }"
                            />
                            <div class="min-w-0">
                                <div class="font-bold text-900 text-base line-height-2 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                    {{ procurement.purchase_request?.title ?? '—' }}
                                </div>
                                <div class="flex align-items-center gap-2 mt-1 flex-wrap">
                                    <Chip
                                        :label="procurement.purchase_request?.request_number ?? '—'"
                                        class="text-xs border-round-lg"
                                        style="height:20px;padding:0 8px;background:var(--surface-100);font-size:0.7rem"
                                    >
                                        <template #default>
                                            <i class="fas fa-hashtag text-xs text-400 ml-1"/>
                                            <span class="text-600 text-xs font-medium">{{ procurement.purchase_request?.request_number ?? '—' }}</span>
                                        </template>
                                    </Chip>
                                    <Chip
                                        class="text-xs border-round-lg"
                                        style="height:20px;padding:0 8px;background:var(--surface-100);font-size:0.7rem"
                                    >
                                        <template #default>
                                            <i class="fas fa-building text-xs text-400 ml-1"/>
                                            <span class="text-600 text-xs">{{ procurement.purchase_request?.department?.name ?? '—' }}</span>
                                        </template>
                                    </Chip>
                                </div>
                            </div>
                        </div>
                        <Tag
                            :value="statusLabel"
                            :style="{ background: statusBg, color: statusColor, border: `1px solid ${statusColor}30` }"
                            class="border-round-lg text-xs font-semibold flex-shrink-0"
                        />
                    </div>

                    <!-- ── المبلغ الإجمالي ── -->
                    <div class="flex align-items-center justify-content-between p-3 border-round-xl"
                        style="background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.06));border:1px solid rgba(99,102,241,0.1)">
                        <div class="flex align-items-center gap-2">
                            <i class="fas fa-coins text-primary-400 text-sm"/>
                            <span class="text-500 text-sm">المبلغ الإجمالي</span>
                        </div>
                        <div class="flex align-items-baseline gap-1">
                            <span class="font-bold text-primary-600" style="font-size:1.1rem;letter-spacing:-0.5px">
                                {{ formatCurrency(procurement.total_amount) }}
                            </span>
                            <span class="text-400 text-xs">د.ع</span>
                        </div>
                    </div>

                    <Divider class="my-0" />

                    <!-- ── شبكة المعلومات ── -->
                    <div class="grid" style="">
                        <div class="col-6">
                            <div class="surface-50 border-round-lg p-2 border-1 border-100">
                                <div class="text-400 text-xs mb-1 flex align-items-center gap-1">
                                    <i class="fas fa-calendar-check text-xs"/>
                                    تاريخ الشراء
                                </div>
                                <div class="text-800 text-sm font-semibold">
                                    {{ formatDate(procurement.purchase_date) }}
                                </div>
                            </div>
                        </div>

                        <div class="col-6">
                            <div class="surface-50 border-round-lg p-2 border-1 border-100">
                                <div class="text-400 text-xs mb-1 flex align-items-center gap-1">
                                    <i class="fas fa-boxes-stacked text-xs"/>
                                    عدد المواد
                                </div>
                                <div class="flex align-items-center gap-1">
                                    <Badge
                                        :value="String(procurement.items?.length ?? 0)"
                                        severity="secondary"
                                        class="text-xs"
                                    />
                                    <span class="text-700 text-xs">مادة</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-6">
                            <div class="surface-50 border-round-lg p-2 border-1 border-100">
                                <div class="text-400 text-xs mb-1 flex align-items-center gap-1">
                                    <i class="fas fa-clock text-xs"/>
                                    تاريخ الإضافة
                                </div>
                                <div class="text-800 text-sm font-semibold">
                                    {{ formatDate(procurement.created_at) }}
                                </div>
                            </div>
                        </div>

                        <div class="col-6">
                            <div class="surface-50 border-round-lg p-2 border-1 border-100">
                                <div class="text-400 text-xs mb-1 flex align-items-center gap-1">
                                    <i class="fas fa-rotate text-xs"/>
                                    آخر تحديث
                                </div>
                                <div class="text-800 text-sm font-semibold">
                                    {{ formatDate(procurement.updated_at) }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ── الملاحظات ── -->
                    <Message
                        v-if="procurement.notes"
                        severity="warn"
                        :closable="false"
                        class="border-round-lg text-sm m-0"
                        :pt="{
                            root: { style: 'padding: 8px 12px; border-right: 3px solid #f59e0b' },
                            text: { class: 'text-sm line-clamp-2' },
                        }"
                    >
                        {{ procurement.notes }}
                    </Message>

                </div>
            </template>

            <template #footer>
                <div class="flex align-items-center justify-content-between pt-2 border-top-1 border-100" @click.stop>
                    <!-- رقم المرجع -->
                    <div class="flex align-items-center gap-1 text-400 text-xs">
                        <i class="fas fa-file-invoice text-xs"/>
                        <span>{{ procurement.reference_no ?? '—' }}</span>
                    </div>

                    <!-- أزرار الإجراءات -->
                    <div class="flex gap-2">
                        <Button
                            v-if="canEdit"
                            icon="fas fa-pen"
                            size="small"
                            severity="secondary"
                            variant="outlined"
                            v-tooltip.top="'تعديل'"
                            class="border-round-lg"
                            style="width:30px;height:30px"
                            @click="emit('edit', procurement)"
                        />
                        <Button
                            v-if="canDelete"
                            icon="fas fa-trash"
                            size="small"
                            severity="danger"
                            variant="outlined"
                            v-tooltip.top="'حذف'"
                            class="border-round-lg"
                            style="width:30px;height:30px"
                            @click="emit('delete', procurement)"
                        />
                    </div>
                </div>
            </template>

        </Card>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card    from 'primevue/card';
import Tag     from 'primevue/tag';
import Badge   from 'primevue/badge';
import Avatar  from 'primevue/avatar';
import Button  from 'primevue/button';
import Chip    from 'primevue/chip';
import Divider from 'primevue/divider';
import Message from 'primevue/message';
import type { Procurement } from '../procurementService';

const props = defineProps<{
    procurement: Procurement;
    canEdit?:   boolean;
    canDelete?: boolean;
}>();

const emit = defineEmits<{
    view:   [p: Procurement];
    edit:   [p: Procurement];
    delete: [p: Procurement];
}>();

const statusMap = {
    in_progress: {
        label:  'جاري الشراء',
        color:  '#d97706',
        bg:     'rgba(217,119,6,0.1)',
        icon:   'fas fa-spinner',
        bar:    'linear-gradient(90deg,#f59e0b,#fbbf24)',
    },
    completed: {
        label:  'تم الشراء',
        color:  '#16a34a',
        bg:     'rgba(22,163,74,0.1)',
        icon:   'fas fa-circle-check',
        bar:    'linear-gradient(90deg,#22c55e,#4ade80)',
    },
    cancelled: {
        label:  'إلغاء الشراء',
        color:  '#dc2626',
        bg:     'rgba(220,38,38,0.1)',
        icon:   'fas fa-circle-xmark',
        bar:    'linear-gradient(90deg,#ef4444,#f87171)',
    },
};

const s           = computed(() => statusMap[props.procurement.status] ?? statusMap.in_progress);
const statusLabel = computed(() => s.value.label);
const statusColor = computed(() => s.value.color);
const statusBg    = computed(() => s.value.bg);
const statusIcon  = computed(() => s.value.icon);
const statusBar   = computed(() => s.value.bar);

const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('ar-IQ', {
            year: 'numeric', month: 'short', day: 'numeric',
        })
      : '—';

const formatCurrency = (v: any) =>
    parseFloat(v || '0').toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
</script>