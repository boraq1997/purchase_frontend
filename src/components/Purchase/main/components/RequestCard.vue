<script setup lang="ts">
// ============================================================================
// COMPONENT: RequestCard (Pro Premium Design)
// PATH: purchase/main/components/RequestCard.vue
// ============================================================================

import type { PurchaseRequest } from '../../interfaces/purchase.interfaces';

import Card from "primevue/card";
import Tag from "primevue/tag";
import Chip from "primevue/chip";
import Button from "primevue/button";

const props = defineProps<{
    request: PurchaseRequest;
}>();

const priorityValue = {
    high: {
        label: "عالية",
        severity: "danger",
    },
    medium: {
        label: "متوسطة",
        severity: "warn"
    },
    low: {
        label: "ضعيفة",
        severity: "info"
    },
};

const statusMap = {
    pending: {
        label: "معلقة",
        icon: "pi pi-hourglass",
        class: "bg-yellow-500 text-yellow-700",
    },
    approved: {
        label: "تمت الموافقة",
        icon: "pi pi-check-circle",
        class: "bg-green-500 text-green-700",
    },
    rejected: {
        label: "مرفوضة",
        icon: "pi pi-times-circle",
        class: "bg-red-500 text-red-700",
    },
    completed: {
        label: "مكتملة",
        icon: "pi pi-check-square",
        class: "bg-blue-500 text-blue-700",
    },
};
</script>

<template>
    <Card
        class="purchase-card shadow-1 border-round-xl"
        dir="rtl"
    >
        <template #content>
            <div class="p-0">

                <!-- HEADER -->
                <div class="flex align-items-center justify-content-between mb-3">
                    <!-- Request number -->
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-hashtag text-700"></i>
                        <span class="text-lg font-bold text-900">
                            {{ request.request_number }}
                        </span>
                    </div>

                    <Tag 
                        :value="priorityValue[request.priority].label"
                        :severity="priorityValue[request.priority].severity"
                        rounded
                    />
                </div>

                <!-- TITLE (Surface) -->
                <div class="surface-100 border-round p-3 mb-3">
                    <div class="font-bold text-900 text-lg">
                        {{ request.title }}
                    </div>
                    <div class="text-xs text-600 mt-1">
                        رقم الطلب: {{ request.id }}
                    </div>
                </div>

                <!-- DEPARTMENT -->
                <div class="flex align-items-center gap-2 mb-3 pb-3 border-bottom-1 surface-border">
                    <i class="pi pi-building text-blue-600"></i>
                    <span class="text-sm text-600">القسم:</span>
                    <span class="text-sm font-semibold text-900">
                        {{ request.department?.name ?? "—" }}
                    </span>
                </div>

                <!-- GRID INFO -->
                <div class="grid mb-3">

                    <!-- Status -->
                    <div class="col-6">
                        <div class="text-xs text-600 mb-2">
                            <i class="pi pi-flag ml-1 text-orange-600"></i>
                            حالة الطلب
                        </div>

                        <Chip
                            :label="statusMap[request.status_type]?.label"
                            :icon="statusMap[request.status_type]?.icon"
                            :class="statusMap[request.status_type]?.class + ' w-full justify-content-center font-semibold'"
                        />
                    </div>

                    <!-- Items Count -->
                    <div class="col-6">
                        <div class="text-xs text-600 mb-2">
                            <i class="pi pi-list-check ml-1 text-teal-600"></i>
                            عدد المواد
                        </div>
                        <Chip 
                            :label="request.items?.length ?? 0"
                            class="w-full justify-content-center"
                            icon="pi pi-box"
                        />
                    </div>
                </div>

                <!-- ESTIMATED COST -->
                <div class="surface-50 border-round p-3 mb-3">
                    <div class="flex align-items-center justify-content-between">
                        <span class="text-sm text-700">التكلفة التقديرية</span>
                        <span class="text-xl font-bold text-green-600">
                            {{ request.total_estimated_cost ?? "—" }}
                        </span>
                    </div>
                </div>

                <!-- FOOTER -->
                <div class="flex align-items-center justify-content-between pt-2">
                    <span class="text-xs text-500">
                        <i class="pi pi-clock ml-1"></i>
                        {{ new Date(request.created_at).toLocaleString('ar-IQ') ?? "—" }}
                    </span>

                    <Button 
                        label="التفاصيل" 
                        icon="pi pi-arrow-left" 
                        text
                        size="small"
                    />
                </div>

            </div>
        </template>
    </Card>
</template>

<style scoped>
.purchase-card {
    border: 1px solid var(--surface-border);
    transition: 0.25s ease;
    width: 100%;
    max-width: 380px;
    cursor: pointer;
}

.purchase-card:hover {
    box-shadow: 0 4px 12px -1px rgba(0,0,0,0.15);
    transform: translateY(-3px);
}

:deep(.p-card-body) {
  padding: 1.25rem;
}

:deep(.p-card-content) {
  padding: 0;
}
</style>