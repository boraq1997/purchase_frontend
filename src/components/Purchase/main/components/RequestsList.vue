<script setup lang="ts">
// ============================================================================
// COMPONENT: RequestsList
// PATH: purchase/main/components/RequestsList.vue
// DESCRIPTION:
// - Displays a list of purchase requests
// - Emits event when user clicks on a request to open details dialog
// ============================================================================

import type { PurchaseRequest } from '../../interfaces/purchase.interfaces';
import RequestCard from './RequestCard.vue';

const _props = defineProps<{
    requests: PurchaseRequest[];
    loading: boolean;
}>();

// الحدث الذي نرسله للأب (الصفحة الرئيسية)
const emit = defineEmits<{
    (e: 'open-details', request: PurchaseRequest): void;
}>();

// دالة تمرير الطلب المختار للأب
function open(request: PurchaseRequest) {
    emit('open-details', request);
}
</script>

<template>
    <div class="space-y-4">

        <!-- LOADING STATE -->
        <div v-if="loading" class="text-center py-6 text-gray-500">
            يتم تحميل البيانات...
        </div>

        <!-- EMPTY STATE -->
        <div 
            v-else-if="!loading && requests.length === 0" 
            class="text-center p-8 text-gray-400 rounded-lg shadow"
        >
            لا توجد طلبات مطابقة لشروط البحث
        </div>

        <!-- REQUESTS GRID -->
        <div 
            v-else 
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-content-center"
        >
            <RequestCard
                v-for="request in requests"
                :key="request.id"
                :request="request"
                @click="open(request)"
            />
        </div>

    </div>
</template>