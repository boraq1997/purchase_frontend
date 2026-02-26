<script setup lang="ts">
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { computed } from 'vue';
import type { RequestItem } from '../../../interfaces/item.interfaces';

const props = defineProps<{
    item: RequestItem | null;
}>();

const wh = computed(() => props.item?.warehouse_check || null);
const itemQuantity = computed(() => props.item?.quantity ?? 0);

const availabilityConfig: Record<string, { label: string; severity: string; icon: string }> = {
    available:   { label: 'متوفر',          severity: 'success', icon: 'pi pi-check-circle' },
    partial:     { label: 'متوفر جزئياً',   severity: 'warn',    icon: 'pi pi-exclamation-triangle' },
    unavailable: { label: 'غير متوفر',      severity: 'danger',  icon: 'pi pi-times-circle' },
};

const recommendationTag = (value: string | undefined) => {
    switch (value) {
        case 'provide_from_stock': return { label: 'توفير من المخزون', severity: 'success', icon: 'fas fa-warehouse' };
        case 'purchase_new':       return { label: 'شراء جديد',        severity: 'warn',    icon: 'fas fa-cart-shopping' };
        case 'reject':             return { label: 'مرفوض',            severity: 'danger',  icon: 'fas fa-xmark' };
        default:                   return { label: value ?? '',         severity: 'info',    icon: 'fas fa-note-sticky' };
    }
};

const currentAvailability = computed(() =>
    wh.value ? availabilityConfig[wh.value.availability] : null
);
</script>

<template>
    <div class="p-3">

        <!-- ── Empty State ── -->
        <div v-if="!wh" class="flex flex-column align-items-center justify-content-center text-center py-7 gap-3">
            <div class="flex align-items-center justify-content-center border-round-2xl bg-primary-50 p-4">
                <i class="pi pi-inbox text-primary text-4xl" />
            </div>
            <div>
                <h3 class="text-xl font-bold text-900 mb-2 mt-0">لا يوجد فحص مخزني</h3>
                <p class="text-color-secondary m-0 text-sm">لم يتم تسجيل بيانات الفحص المخزني لهذه المادة بعد.</p>
            </div>
        </div>

        <!-- ── Warehouse Data ── -->
        <Card v-else class="border-1 surface-border shadow-2 overflow-hidden">

            <!-- Header -->
            <template #header>
                <div class="flex align-items-center gap-3 px-4 py-3 border-bottom-1 surface-border">
                    <div class="flex align-items-center justify-content-center bg-primary border-round-xl p-3">
                        <i class="pi pi-warehouse text-white text-2xl" />
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-900 m-0 mb-1">فحص المخزن</h2>
                        <p class="text-color-secondary text-sm m-0">تفاصيل التوفر والحالة للمادة المحددة</p>
                    </div>
                </div>
            </template>

            <!-- Content -->
            <template #content>
                <div class="flex flex-column gap-4">

                    <!-- حالة التوفر -->
                    <div class="flex flex-column gap-2">
                        <div class="flex align-items-center gap-2 text-color-secondary text-sm font-semibold">
                            <i class="pi pi-check-circle text-primary" />
                            <span>حالة التوفر</span>
                        </div>
                        <Tag
                            v-if="currentAvailability"
                            :value="currentAvailability.label"
                            :severity="currentAvailability.severity"
                            :icon="currentAvailability.icon"
                            class="w-full justify-content-center text-base font-semibold py-2 px-4"
                            rounded
                        />
                    </div>

                    <!-- الكميات -->
                    <div class="grid">

                        <!-- الكمية المتوفرة -->
                        <div class="col-12 md:col-6">
                            <div class="surface-50 border-1 surface-border border-round-xl p-4 h-full">
                                <div class="flex align-items-center gap-2 text-color-secondary text-xs font-semibold mb-3">
                                    <i class="pi pi-box text-primary" />
                                    <span>الكمية المتوفرة</span>
                                </div>
                                <div class="flex align-items-baseline gap-2">
                                    <span class="text-4xl font-bold text-primary">{{ wh.available_quantity ?? '0' }}</span>
                                    <span class="text-color-secondary text-sm font-medium">وحدة</span>
                                </div>
                            </div>
                        </div>

                        <!-- الكمية المطلوبة -->
                        <div class="col-12 md:col-6">
                            <div class="surface-50 border-1  border-round-xl p-4 h-full">
                                <div class="flex align-items-center gap-2 text-color-secondary text-xs font-semibold mb-3">
                                    <i class="pi pi-shopping-cart text-primary" />
                                    <span>الكمية المطلوبة</span>
                                </div>
                                <div class="flex align-items-baseline gap-2">
                                    <span class="text-4xl font-bold text-primary">{{ itemQuantity }}</span>
                                    <span class="text-color-secondary text-sm font-medium">وحدة</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- الملاحظات -->
                    <div v-if="wh.notes" class="surface-50 border-1 surface-border border-round-xl p-4">
                        <div class="flex align-items-center gap-2 text-color-secondary text-sm font-semibold mb-2">
                            <i class="pi pi-comment text-primary" />
                            <span>ملاحظات</span>
                        </div>
                        <p class="m-0 text-color-secondary line-height-3 text-base">{{ wh.notes }}</p>
                    </div>

                </div>
            </template>

            <!-- Footer -->
            <template #footer>
                <div class="flex align-items-center justify-content-between flex-wrap gap-3 pt-2 border-top-1 surface-border">

                    <div class="flex align-items-center gap-2 text-color-secondary text-sm">
                        <div class="flex align-items-center justify-content-center border-round-lg bg-primary-50 p-2">
                            <i class="pi pi-user text-primary text-xs" />
                        </div>
                        <span>{{ wh.checked_by?.name || 'غير محدد' }}</span>
                    </div>

                    <Tag
                        v-if="wh.recommendation"
                        :severity="recommendationTag(wh.recommendation).severity"
                        :value="recommendationTag(wh.recommendation).label"
                        rounded
                        class="font-semibold text-xs"
                    >
                        <template #default>
                            <i :class="recommendationTag(wh.recommendation).icon" class="ml-1 text-xs" />
                            {{ recommendationTag(wh.recommendation).label }}
                        </template>
                    </Tag>

                </div>
            </template>

        </Card>
    </div>
</template>