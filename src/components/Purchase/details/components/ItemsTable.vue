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
import Chip from 'primevue/chip';
import Button from 'primevue/button';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional


// Types
import type { RequestItem } from '../../interfaces/item.interfaces';

// Props
const props = defineProps<{
    items: RequestItem[];
}>();

// Emit event when user selects an item
const emit = defineEmits<{
    (e: 'select-item', item: RequestItem): void;
}>();

// Maps for status colors
const needsStatusColor: Record<string, string> = {
  needed: 'info',
  not_needed: 'warn',
  modified: 'success',
};



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
                    <Chip
                        :label="`${data.quantity} ${data.unit}`"
                        icon="pi pi-box"
                    />
                </template>
            </Column>

            <!-- الملاحظات/المواصفات -->
            <Column header="الملاحظات" style="min-width: 150px;">
                <template #header>
                    <i class="fas fa-note-sticky text-gray-500"/>
                </template>
                <template #body="{ data }">
                    <div class="flex flex-wrap gap-2">
                        <Chip
                            v-if="data.unit"
                            :label="`الوحدة: ${data.unit}`"
                            class="bg-green-50 text-green-700"
                            icon="pi pi-wallet"
                        />
                        <Chip
                            v-if="data.modified_specifications"
                            :label="data.modified_specifications"
                            class="bg-gray-100 text-gray-700"
                            icon="pi pi-align-left"
                        />
                    </div>
                </template>
            </Column>

            <Column header="بيان الحاجة" style="min-width: 180px;">
                <template #header>
                    <i class="fas fa-hand-holding-medical text-gray-400 dark:text-gray-300"/>
                </template>

                <template #body="{ data }">
                    <div v-if="data.needs_assessment" class="flex flex-col gap-2">

                    <!-- حالة التقييم -->
                        <Tag
                            :severity="needsStatusColor[data.needs_assessment.needs_status]"
                            :value="
                                data.needs_assessment.needs_status === 'needed'
                                ? 'مطلوبة'
                                : data.needs_assessment.needs_status === 'not_needed'
                                    ? 'غير مطلوبة'
                                    : 'مواصفات معدلة'
                            "
                            rounded
                            class="font-semibold text-sm px-3 py-1 shadow-sm"
                        />


                    <!-- سبب التقييم -->
                    <div
                        v-if="data.needs_assessment.reason"
                        class="text-xs text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner max-h-28 overflow-auto break-words whitespace-pre-line"
                    >
                        {{ data.needs_assessment.reason }}
                    </div>

                    </div>

                    <!-- حالة عدم التقييم -->
                    <div v-else class="text-gray-400 dark:text-gray-500 text-xs italic">
                    غير مقيم
                    </div>
                </template>
            </Column>





            <!-- فحص المخازن -->
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

                    <div v-else class="text-500 text-xs">
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
                        severity="info"
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