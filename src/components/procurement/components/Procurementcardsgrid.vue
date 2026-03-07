<template>
    <div>
        <!-- ─── Cards Grid ───────────────────────────────────────────────── -->
        <div class="grid">
            <div v-for="procurement in procurements" :key="procurement.id"
                class="col-12 lg:col-6 xl:col-4">
                <ProcurementCard
                    :procurement="procurement"
                    :canEdit="canEdit"
                    :canDelete="canDelete"
                    @view="emit('view', $event)"
                    @edit="emit('edit', $event)"
                    @delete="emit('delete', $event)"
                />
            </div>
        </div>

        <!-- ─── Empty State ───────────────────────────────────────────────── -->
        <div v-if="!isLoading && procurements.length === 0" class="text-center py-8">
            <div class="inline-block p-6 border-round-2xl"
                style="background:linear-gradient(135deg,rgba(102,126,234,0.05),rgba(118,75,162,0.05))">
                <i class="fas fa-truck-ramp-box text-6xl mb-4" style="color:#667eea"/>
                <h3 class="text-2xl font-bold text-900 mb-2">لا توجد عمليات شراء</h3>
                <p class="text-600 m-0">ابدأ بإضافة عملية شراء جديدة</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ProcurementCard from './ProcurementCard.vue';
import type { Procurement } from '../procurementService';

defineProps<{
    procurements: Procurement[];
    isLoading: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}>();

const emit = defineEmits<{
    view:   [p: Procurement];
    edit:   [p: Procurement];
    delete: [p: Procurement];
}>();
</script>