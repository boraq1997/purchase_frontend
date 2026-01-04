<script setup lang="ts">
// ============================================================================
// COMPONENT: RedesignedChart_V2
// PATH: /home/ubuntu/RedesignedChart_V2.vue
// DESCRIPTION:
// - Revised component using PrimeFlex and PrimeVue for a dashboard pattern.
// - Includes four stat cards and three different chart types (Pie, Bar, Radar)
//   for the same data, all wrapped in PrimeVue Card components.
// ============================================================================

import { computed, defineProps } from 'vue';
import type { PurchaseRequest } from './purchase.interfaces';
import Chart from 'primevue/chart';
import Card from 'primevue/card';

// Mock interface for demonstration purposes if not available
interface PurchaseRequest {
    status_type: 'pending' | 'approved' | 'rejected' | 'completed';
}

const props = defineProps<{
    requests: PurchaseRequest[];
}>();

// ============================================================================
// COMPUTED: حساب أعداد الحالات
// ============================================================================
const statusCounts = computed(() => {
    const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
    };

    props.requests.forEach(req => {
        if (req.status_type in counts) {
            counts[req.status_type as keyof typeof counts]++;
        }
    });

    return counts;
});

const totalRequests = computed(() => {
    return props.requests.length;
});

const statusPercentages = computed(() => {
    const total = totalRequests.value || 0;
    return {
        pending: total ? ((statusCounts.value.pending / total) * 100).toFixed(1): '0',
        approved: total ? ((statusCounts.value.approved / total) * 100).toFixed(1): '0',
        rejected: total ? ((statusCounts.value.rejected / total) * 100).toFixed(1): '0',
        completed: total ? ((statusCounts.value.completed / total) * 100).toFixed(1): '0',
    }
});

// ============================================================================
// CHART DATA
// ============================================================================
const chartData = computed(() => ({
    labels: ['معلقة', 'مقبولة', 'مرفوضة', 'مكتملة'],
    datasets: [
        {
            label: 'عدد الطلبات',
            backgroundColor: [
                'rgba(255, 193, 7, 0.8)',    // Amber - معلقة
                'rgba(76, 175, 80, 0.8)',    // Green - مقبولة
                'rgba(244, 67, 54, 0.8)',    // Red - مرفوضة
                'rgba(33, 150, 243, 0.8)',   // Blue - مكتملة
            ],
            hoverBackgroundColor: [
                'rgba(255, 193, 7, 1)',
                'rgba(76, 175, 80, 1)',
                'rgba(244, 67, 54, 1)',
                'rgba(33, 150, 243, 1)',
            ],
            borderColor: [
                'rgba(255, 193, 7, 1)',
                'rgba(76, 175, 80, 1)',
                'rgba(244, 67, 54, 1)',
                'rgba(33, 150, 243, 1)',
            ],
            borderWidth: 3,
            data: [
                statusCounts.value.pending,
                statusCounts.value.approved,
                statusCounts.value.rejected,
                statusCounts.value.completed,
            ],
        },
    ],
}));

// ============================================================================
// CHART OPTIONS
// ============================================================================
const chartOptions = computed(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    color: textColor,
                    font: {
                        size: 13,
                        family: 'Cairo, sans-serif',
                    },
                    padding: 15,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: surfaceBorder,
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed || context.parsed.y || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary,
                    font: {
                        size: 12,
                    },
                    stepSize: 1,
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false,
                },
            },
        },
    };
});

const radarOptions = computed(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
            },
        },
        scales: {
            r: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary,
                    stepSize: 1,
                },
                grid: {
                    color: surfaceBorder,
                },
                pointLabels: {
                    color: textColor,
                    font: {
                        size: 12,
                        family: 'Cairo, sans-serif',
                    },
                },
            },
        },
    };
});
</script>

<template>
    <div class="dashboard-container p-4" dir="rtl">
        
        <!-- Stat Cards Row -->
        <div class="grid mb-4">
            
            <!-- Card: Pending -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-pending surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">الطلبات المعلقة</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ statusCounts.pending }}</div>
                            <span class="text-sm text-500">في انتظار المراجعة</span>
                        </div>
                        <div class="icon-container icon-pending border-round-lg flex align-items-center justify-content-center">
                            <i class="pi pi-clock text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-pending border-round relative overflow-hidden" style="height: 18px;">
                        <div
                            class="progress-fill-pending h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: statusPercentages.pending + '%' }"
                        >
                            {{ statusPercentages.pending }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card: Approved -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-approved surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">الطلبات المقبولة</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ statusCounts.approved }}</div>
                            <span class="text-sm text-500">تمت الموافقة عليها</span>
                        </div>
                        <div class="icon-container icon-approved border-round-lg flex align-items-center justify-content-center">
                            <i class="pi pi-check-circle text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-approved border-round" style="height: 18px;">
                        <div
                            class="progress-fill-approved h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: statusPercentages.approved + '%' }"
                        >
                            {{ statusPercentages.approved }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card: Rejected -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-rejected surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">الطلبات المرفوضة</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ statusCounts.rejected }}</div>
                            <span class="text-sm text-500">تم رفضها</span>
                        </div>
                        <div class="icon-container icon-rejected border-round-lg flex align-items-center justify-content-center">
                            <i class="pi pi-times-circle text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-rejected border-round" style="height: 18px;">
                        <div
                            class="progress-fill-rejected h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: statusPercentages.rejected + '%' }"
                        >
                            {{ statusPercentages.rejected }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card: Completed -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-completed surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">الطلبات المكتملة</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ statusCounts.completed }}</div>
                            <span class="text-sm text-500">تم إنجازها</span>
                        </div>
                        <div class="icon-container icon-completed border-round-lg flex align-items-center justify-content-center">
                            <i class="pi pi-box text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-completed border-round" style="height: 18px;">
                        <div
                            class="progress-fill-completed h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: statusPercentages.completed + '%' }"
                        >
                            {{ statusPercentages.completed }}%
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="grid">
            
            <!-- Chart 1: Pie Chart -->
            <div class="col-12 lg:col-4">
                <Card class="chart-card shadow-3 border-round-lg h-full border-1 surface-border">
                    <template #header>
                        <div class="flex align-items-center gap-2 p-3 border-bottom-1 surface-border">
                            <div class="w-2rem h-2rem border-circle bg-primary-100 flex align-items-center justify-content-center">
                                <i class="pi pi-chart-pie text-primary"></i>
                            </div>
                            <span class="text-lg font-bold text-900">التوزيع الدائري</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="chart-wrapper">
                            <Chart
                                type="doughnut"
                                :data="chartData"
                                :options="chartOptions"
                                class="chart-canvas"
                            />
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Chart 2: Bar Chart -->
            <div class="col-12 lg:col-4">
                <Card class="chart-card shadow-3 border-round-lg h-full border-1 surface-border">
                    <template #header>
                        <div class="flex align-items-center gap-2 p-3 border-bottom-1 surface-border">
                            <div class="w-2rem h-2rem border-circle bg-primary-100 flex align-items-center justify-content-center">
                                <i class="pi pi-chart-bar text-primary"></i>
                            </div>
                            <span class="text-lg font-bold text-900">المقارنة بالأعمدة</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="chart-wrapper">
                            <Chart
                                type="line"
                                :data="chartData"
                                :options="chartOptions"
                                class="chart-canvas"
                            />
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Chart 3: Radar Chart -->
            <div class="col-12 lg:col-4">
                <Card class="chart-card shadow-3 border-round-lg h-full border-1 surface-border">
                    <template #header>
                        <div class="flex align-items-center gap-2 p-3 border-bottom-1 surface-border">
                            <div class="w-2rem h-2rem border-circle bg-primary-100 flex align-items-center justify-content-center">
                                <i class="pi pi-chart-line text-primary"></i>
                            </div>
                            <span class="text-lg font-bold text-900">التحليل الراداري</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="chart-wrapper">
                            <Chart
                                type="polarArea"
                                :data="chartData"
                                :options="radarOptions"
                                class="chart-canvas"
                            />
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Dashboard Container */
.dashboard-container {
    background: transparent;
}

/* Stat Cards */
.stat-card {
    border: 1px solid var(--surface-border);
    background: var(--surface-card);
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.stat-card:hover {
    transform: translateY(-4px);
}

/* بطاقة المعلقة - Amber/Orange Gradient */
.stat-card-pending::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #FF6F00, #FFC107, #FFD54F);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.stat-card-pending:hover::before {
    opacity: 1;
}

.icon-pending {
    background: linear-gradient(135deg, #FFE082 0%, #FFB74D 100%);
    color: #E65100;
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.progress-pending {
    background: rgba(255, 193, 7, 0.15);
}

.progress-fill-pending {
    background: linear-gradient(90deg, #FF6F00, #FFC107);
    box-shadow: 0 0 8px rgba(255, 193, 7, 0.5);
}

/* بطاقة المقبولة - Green Gradient */
.stat-card-approved::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2E7D32, #4CAF50, #66BB6A);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.stat-card-approved:hover::before {
    opacity: 1;
}

.icon-approved {
    background: linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%);
    color: #1B5E20;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.progress-approved {
    background: rgba(76, 175, 80, 0.15);
}

.progress-fill-approved {
    background: linear-gradient(90deg, #2E7D32, #4CAF50);
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

/* بطاقة المرفوضة - Red/Pink Gradient */
.stat-card-rejected::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #C62828, #F44336, #EF5350);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.stat-card-rejected:hover::before {
    opacity: 1;
}

.icon-rejected {
    background: linear-gradient(135deg, #FFCDD2 0%, #EF5350 100%);
    color: #B71C1C;
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.progress-rejected {
    background: rgba(244, 67, 54, 0.15);
}

.progress-fill-rejected {
    background: linear-gradient(90deg, #C62828, #F44336);
    box-shadow: 0 0 8px rgba(244, 67, 54, 0.5);
}

/* بطاقة المكتملة - Blue Gradient */
.stat-card-completed::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1565C0, #2196F3, #42A5F5);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.stat-card-completed:hover::before {
    opacity: 1;
}

.icon-completed {
    background: linear-gradient(135deg, #90CAF9 0%, #42A5F5 100%);
    color: #0D47A1;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.progress-completed {
    background: rgba(33, 150, 243, 0.15);
}

.progress-fill-completed {
    background: linear-gradient(90deg, #1565C0, #2196F3);
    box-shadow: 0 0 8px rgba(33, 150, 243, 0.5);
}

.icon-container {
    width: 3.5rem;
    height: 3.5rem;
    transition: all 0.3s ease;
}

.stat-card:hover .icon-container {
    transform: scale(1.15) rotate(-5deg);
}

.progress-bar {
    overflow: hidden;
}

/* Chart Cards */
.chart-card {
    transition: all 0.3s ease;
    background: var(--surface-card);
    position: relative;
    overflow: hidden;
}

.chart-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, transparent 0%, rgba(var(--primary-rgb), 0.03) 100%);
    pointer-events: none;
    transition: opacity 0.3s ease;
    opacity: 0;
}

.chart-card:hover::after {
    opacity: 1;
}

.chart-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.chart-wrapper {
    height: 20rem;
    padding: 1rem;
}

.chart-canvas {
    height: 100%;
    width: 100%;
}

/* Card Headers */
:deep(.p-card-header) {
    padding: 0;
}

:deep(.p-card-body) {
    padding: 0;
}

:deep(.p-card-content) {
    padding: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .stat-card {
        margin-bottom: 1rem;
    }
    
    .chart-wrapper {
        height: 16rem;
    }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
    .stat-card {
        background: var(--surface-ground);
    }
    
    .chart-card {
        background: var(--surface-ground);
    }
}


.progress-fill-pending,
.progress-fill-approved,
.progress-fill-rejected,
.progress-fill-completed {
    min-width: 32px;
    white-space: nowrap;
}
</style>