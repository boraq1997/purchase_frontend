<template>
    <div class="grid mb-5">
        <div v-for="stat in stats" :key="stat.key" class="col-12 sm:col-6 lg:col-3">
            <div class="surface-card border-round-2xl p-4 shadow-1 border-1 border-200 overflow-hidden relative stat-card">
                <div class="absolute top-0 right-0 left-0 h-1" :style="{ background: stat.gradient }"/>
                <div class="flex align-items-center justify-content-between">
                    <div>
                        <div class="text-500 text-sm mb-1">{{ stat.label }}</div>
                        <div class="text-900 font-bold text-3xl">{{ stat.value }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center border-round-xl"
                        style="width:52px;height:52px"
                        :style="{ background: stat.bg }">
                        <i :class="stat.icon" class="text-xl" :style="{ color: stat.color }"/>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="h-1 border-round-xl surface-100 overflow-hidden">
                        <div class="h-full border-round-xl transition-all transition-duration-500"
                            :style="{ width: stat.percent + '%', background: stat.gradient }"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    total: number;
    counts: {
        in_progress: number;
        completed: number;
        cancelled: number;
    };
}>();

const t = computed(() => props.total || 1);

const stats = computed(() => [
    {
        key: 'total', label: 'إجمالي العمليات',
        value: props.total,
        icon: 'fas fa-truck-ramp-box', color: '#667eea', bg: 'rgba(102,126,234,0.1)',
        gradient: 'linear-gradient(90deg,#667eea,#764ba2)',
        percent: 100,
    },
    {
        key: 'in_progress', label: 'جارية',
        value: props.counts.in_progress,
        icon: 'fas fa-spinner', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
        gradient: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
        percent: Math.round((props.counts.in_progress / t.value) * 100),
    },
    {
        key: 'completed', label: 'مكتملة',
        value: props.counts.completed,
        icon: 'fas fa-circle-check', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
        gradient: 'linear-gradient(90deg,#22c55e,#4ade80)',
        percent: Math.round((props.counts.completed / t.value) * 100),
    },
    {
        key: 'cancelled', label: 'ملغاة',
        value: props.counts.cancelled,
        icon: 'fas fa-circle-xmark', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',
        gradient: 'linear-gradient(90deg,#ef4444,#f87171)',
        percent: Math.round((props.counts.cancelled / t.value) * 100),
    },
]);
</script>

<style scoped>
.stat-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
</style>