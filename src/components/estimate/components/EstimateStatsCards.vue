<template>
    <div class="grid mb-5">
        <div class="col-12 sm:col-6 lg:col-3">
            <div class="stat-card stat-card-total surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                <div class="flex justify-content-between align-items-start mb-3">
                    <div class="flex-1">
                        <span class="block text-600 font-medium mb-2 text-sm">إجمالي العروض</span>
                        <div class="text-900 font-bold text-3xl mb-1">{{ total }}</div>
                        <span class="text-sm text-500">جميع عروض الأسعار</span>
                    </div>
                    <div class="icon-container icon-total border-round-lg flex align-items-center justify-content-center">
                        <i class="pi pi-file text-2xl"></i>
                    </div>
                </div>
                <div class="progress-bar progress-total border-round relative overflow-hidden" style="height: 18px;">
                    <div class="progress-fill-total h-full flex align-items-center justify-content-center text-white text-xs font-medium" style="width: 100%">100%</div>
                </div>
            </div>
        </div>

        <div class="col-12 sm:col-6 lg:col-3">
            <div class="stat-card stat-card-pending surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                <div class="flex justify-content-between align-items-start mb-3">
                    <div class="flex-1">
                        <span class="block text-600 font-medium mb-2 text-sm">قيد الانتظار</span>
                        <div class="text-900 font-bold text-3xl mb-1">{{ counts.pending }}</div>
                        <span class="text-sm text-500">في انتظار المراجعة</span>
                    </div>
                    <div class="icon-container icon-pending border-round-lg flex align-items-center justify-content-center">
                        <i class="pi pi-clock text-2xl"></i>
                    </div>
                </div>
                <div class="progress-bar progress-pending border-round relative overflow-hidden" style="height: 18px;">
                    <div class="progress-fill-pending h-full flex align-items-center justify-content-center text-white text-xs font-medium" :style="{ width: percentages.pending + '%' }">{{ percentages.pending }}%</div>
                </div>
            </div>
        </div>

        <div class="col-12 sm:col-6 lg:col-3">
            <div class="stat-card stat-card-approved surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                <div class="flex justify-content-between align-items-start mb-3">
                    <div class="flex-1">
                        <span class="block text-600 font-medium mb-2 text-sm">الطلبات المقبولة</span>
                        <div class="text-900 font-bold text-3xl mb-1">{{ counts.accepted }}</div>
                        <span class="text-sm text-500">تمت الموافقة عليها</span>
                    </div>
                    <div class="icon-container icon-approved border-round-lg flex align-items-center justify-content-center">
                        <i class="pi pi-check-circle text-2xl"></i>
                    </div>
                </div>
                <div class="progress-bar progress-approved border-round relative overflow-hidden" style="height: 18px;">
                    <div class="progress-fill-approved h-full flex align-items-center justify-content-center text-white text-xs font-medium" :style="{ width: percentages.accepted + '%' }">{{ percentages.accepted }}%</div>
                </div>
            </div>
        </div>

        <div class="col-12 sm:col-6 lg:col-3">
            <div class="stat-card stat-card-rejected surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                <div class="flex justify-content-between align-items-start mb-3">
                    <div class="flex-1">
                        <span class="block text-600 font-medium mb-2 text-sm">الطلبات المرفوضة</span>
                        <div class="text-900 font-bold text-3xl mb-1">{{ counts.rejected }}</div>
                        <span class="text-sm text-500">تم رفضها</span>
                    </div>
                    <div class="icon-container icon-rejected border-round-lg flex align-items-center justify-content-center">
                        <i class="pi pi-times-circle text-2xl"></i>
                    </div>
                </div>
                <div class="progress-bar progress-rejected border-round relative overflow-hidden" style="height: 18px;">
                    <div class="progress-fill-rejected h-full flex align-items-center justify-content-center text-white text-xs font-medium" :style="{ width: percentages.rejected + '%' }">{{ percentages.rejected }}%</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    total: number;
    counts: { pending: number; accepted: number; rejected: number };
    percentages: { pending: number; accepted: number; rejected: number };
}>();
</script>