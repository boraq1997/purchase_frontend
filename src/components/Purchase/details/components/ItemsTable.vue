<script setup lang="ts">
// ============================================================================
// COMPONENT: ItemsTable
// PATH: purchase/details/components/ItemsTable.vue
// DESCRIPTION:
// - Table displaying all items of a purchase request
// - Includes: name, qty, needs assessment, warehouse check, estimates count
// ============================================================================

import { defineProps, defineEmits } from 'vue';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';              // optional


// Types
import type { PurchaseItem as RequestItem } from '../../interfaces/purchase.interfaces';
// Props
const props = defineProps<{
    items: RequestItem[];
}>();

// Emit event when user selects an item
const emit = defineEmits<{
    (e: 'select-item', item: RequestItem): void;
}>();


const warehouseAvailabilityColor: Record<string, string> = {
    available: 'success',
    partial: 'warn',
    unavailable: 'danger',
};

function getEstimatesCount(item: RequestItem) {
    return item.estimate ? item.estimate.length : 0;
}

</script>

<template>
    <div class="mt-4">

        <h3 class="text-md font-bold mb-3">المواد ضمن الطلب</h3>

        <DataTable
            :value="props.items"
            stripedRows
            paginator
            :rows="10"
            responsiveLayout="scroll"
            class="shadow-sm border-round text-right"
            emptyMessage="لا توجد مواد مسجلة"
        >

            <!-- اسم المادة -->
            <Column header="المادة" field="item_name" style="min-width: 180px;">
                <template #header>
                    <i class="fas fa-box text-gray-500"/>
                </template>
                <template #body="{ data }">
                    <div class="font-bold text-900">
                        {{ data.item_name }}
                    </div>
                </template>
            </Column>

            <!-- الكمية -->
            <Column header="الكمية" style="min-width: 120px;">
                <template #header>
                    <i class="fas fa-hashtag text-gray-500"/>
                </template>
                <template #body="{ data }">
                    <div class="flex flex-wrap gap-2">
                        <Tag
                            :value="`${data.quantity}`"
                            class="font-mono"
                            severity="info"
                        />
                        <Tag
                            v-if="data.unit"
                            :value="data.unit?.name ?? data.unit"
                            class="font-mono"
                            severity="warn"
                        />
                        <span v-if="data.unit?.code">
                            <Tag
                                :value="data.unit.code"
                                severity="info"
                                class="font-mono text-xs"
                            />
                        </span>
                    </div>
                </template>
            </Column>

            <Column header="الملاحظات" style="min-width: 180px;">
    <template #header>
        <div class="flex align-items-center gap-2">
            <i class="fas fa-note-sticky text-gray-500"></i>
            <span>الملاحظات</span>
        </div>
    </template>

    <template #body="{ data }">
        <span
            v-tooltip.top="data.specifications"
            class="text-sm text-gray-700"
        >
            {{ data.specifications?.length > 40
                ? data.specifications.substring(0,40) + '...'
                : data.specifications || '-' }}
        </span>
    </template>
</Column>

            <Column header="المخازن" style="min-width: 150px;">
                <template #header>
                    <i class="fas fa-warehouse text-gray-500"/>
                </template>
                <template #body="{ data }">

                    <div v-if="data.warehouse_check">
                        <Tag
                            :severity="warehouseAvailabilityColor[data.warehouse_check.availability]"
                            :value="
                                data.warehouse_check.availability === 'available'
                                    ? 'متوفر'
                                    : data.warehouse_check.availability === 'partial'
                                        ? 'متوفر جزئياً'
                                        : 'غير متوفر'
                            "
                        />

                        <p v-if="data.warehouse_check.available_quantity" class="text-xs text-600 mt-1">
                            الكمية المتوفرة: {{ data.warehouse_check.available_quantity }}
                        </p>
                    </div>

                    <div v-else class="text-yellow-500">
                        لم يتم الفحص
                    </div>

                </template>
            </Column>

            <!-- عروض الأسعار -->
            <Column header="عروض الأسعار" style="min-width: 120px;">
                <template #header>
                    <i class="fas fa-receipt text-gray-500"/>
                </template>
                <template #body="{ data }">
                    <Tag
                        :severity="getEstimatesCount(data) === 0 ? 'danger' : 'info'"
                        :value="getEstimatesCount(data)"
                        icon="fas fa-hashtag"
                        class="font-bold"
                    />
                </template>
            </Column>

            <!-- زر التفاصيل -->
            <Column header="التفاصيل" style="width: 130px;">
                <template #header>
                    <i class="fas fa-eye text-gray-500"/>
                </template>
                <template #body="{ data }">
                    <Button
                        label="عرض"
                        icon="pi pi-eye"
                        size="small"
                        severity="secondary"
                        text
                        @click="emit('select-item', data)"
                    />
                </template>
            </Column>

        </DataTable>
    </div>
</template>

<style scoped></style>