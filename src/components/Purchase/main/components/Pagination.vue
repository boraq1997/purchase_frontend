<script setup lang="ts">
// ============================================================================
// COMPONENT: Pagination (PrimeVue Paginator)
// PATH: purchase/main/components/Pagination.vue
// DESCRIPTION:
// - Wraps PrimeVue Paginator
// - Emits update:page to parent
// ============================================================================

import { defineProps, defineEmits, computed } from 'vue';
import Paginator from 'primevue/paginator';

const props = defineProps<{
    page: number;      // رقم الصفحة الحالية (1,2,3,..)
    perPage: number;   // عدد العناصر في الصفحة
    total: number;     // إجمالي السجلات
}>();

const emit = defineEmits(['update:page']);

// PrimeVue يستخدم first كسجل البداية
// Example page 1 -> first = 0
// Example page 2 -> first = perPage
const first = computed({
    get: () => (props.page - 1) * props.perPage,
    set: (val: number) => {
        const newPage = Math.floor(val / props.perPage) + 1;
        emit('update:page', newPage);
    }
});

</script>

<template>
    <div class="mt-4">
        <Paginator
            :first="first"
            :rows="props.perPage"
            :totalRecords="props.total"
            @update:first="first = $event"
        />
    </div>
</template>

<style scoped>
</style>

