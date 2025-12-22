<template>
  <DataTable 
    :value="items"
    dataKey="id"
    v-model:selection="internalSelection"
    :selectionMode="selectionType === 'checkbox' ? 'multiple' : 'single'"
    class="text-right"
    :paginator="paginator"
    :rows="rows"
    :globalFilterFields="[]"
  >
    <Column
      v-if="enableSelection"
      :selectionMode="selectionType === 'checkbox' ? 'multiple' : 'single'"
      headerStyle="width: 3rem"
    />

    <Column field="item_name" header="المادة" />
    <Column field="quantity" header="الكمية" />
    <Column field="unit" header="الوحدة" />

    <!-- بيان الحاجة -->
    <Column v-if="showStatusColumn">
      <template #header> بيان الحاجة </template>
      <template #body="{ data }">
        <Tag
          v-if="isAssessed(data.id)"
          severity="success"
          icon="fa-solid fa-check-circle"
          value="مُقيّم"
        />
        <Tag
          v-else
          severity="secondary"
          icon="fa-solid fa-clock"
          value="—"
        />
      </template>
    </Column>

    <!-- المخازن -->
    <Column v-if="showWhareColumn">
      <template #header>المخازن</template>
      <template #body="{data}">
        <Tag
          v-if="isWhares(data.id)"
          severity="success"
          icon="fa-solid fa-warehouse"
          value="تم الفحص"
        />
        <Tag
          v-else
          severity="secondary"
          icon="fa-solid fa-clock"
          value="—"
        />
      </template>
    </Column>

    <!-- عروض الأسعار -->
    <Column v-if="showEstimateColumn">
      <template #header>عروض الاسعار</template>
      <template #body="{data}">
        <Tag
          v-if="isEstimated(data.id)"
          severity="success"
          icon="fa-solid fa-receipt"
          value="تم تقديم عرض سعر"
        />
        <Tag
          v-else
          severity="secondary"
          icon="fas fa-clock"
          value="-"
        />
      </template>
    </Column>

    <slot name="extra-columns" />
  </DataTable>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const props = defineProps({
  items: Array,
  selectionType: {type: String, default: "radio"},
  assessments: Array,
  whareHouse: Array,
  estimates: Array,
  selectedItem: null,
  enableSelection: { type: Boolean, default: false },
  showStatusColumn: { type: Boolean, default: true },
  showWhareColumn: {type: Boolean, default: true},
  showEstimateColumn: {type: Boolean, default: true},
  paginator: { type: Boolean, default: false },
  rows: { type: Number, default: 5 },
});

const emit = defineEmits(["update:selectedItem"]);

const internalSelection = ref(
  props.selectionType === "checkbox" ? [] : null
);

// sync child → parent
watch(internalSelection, (value) => {
  emit("update:selectedItem", value);
});

// sync parent → child
watch(
  () => props.selectedItem,
  (value) => {
    internalSelection.value =
      props.selectionType === "checkbox" ? (value || []) : (value || null);
  }
);

// change mode dynamically
watch(
  () => props.selectionType,
  (type) => {
    internalSelection.value = type === "checkbox" ? [] : null;
  }
);

// helpers
const isAssessed = (id: number) =>
  props.assessments?.some((a: any) => a.request_item_id === id);

const isWhares = (id: number) =>
  props.whareHouse?.some((a: any) => a.request_item_id === id);

const isEstimated = (id: number) =>
  props.estimates?.some((e: any) => e.request_item_id === id);
</script>