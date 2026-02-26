<script setup lang="ts">
// ============================================================================
// COMPONENT: RedesignedChart_V5 — Clean Neutral Design
// ============================================================================

import { computed } from 'vue';
import type { PurchaseRequest } from '../../interfaces/purchase.interfaces';
import Chart from 'primevue/chart';

const props = defineProps<{
    requests: PurchaseRequest[];
}>();

const statusCounts = computed(() => {
    const counts = { pending: 0, approved: 0, rejected: 0, completed: 0 };
    props.requests.forEach(req => {
        if (req.status_type in counts) counts[req.status_type as keyof typeof counts]++;
    });
    return counts;
});

const totalRequests = computed(() => props.requests.length);

const statusPercentages = computed(() => {
    const t = totalRequests.value || 1;
    return {
        pending:   +((statusCounts.value.pending   / t) * 100).toFixed(1),
        approved:  +((statusCounts.value.approved  / t) * 100).toFixed(1),
        rejected:  +((statusCounts.value.rejected  / t) * 100).toFixed(1),
        completed: +((statusCounts.value.completed / t) * 100).toFixed(1),
    };
});

function miniChart(value: number, total: number, accentColor: string) {
    const rest = Math.max(0, total - value);
    return {
        data: {
            datasets: [{
                data: [value, rest],
                backgroundColor: [accentColor, 'rgba(0,0,0,0.06)'],
                borderWidth: 0,
                hoverOffset: 0,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            animation: { animateRotate: true, duration: 1000 },
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
        },
    };
}

const cards = computed(() => [
    {
        key: 'all',
        label: 'جميع الطلبات',
        sublabel: 'إجمالي الطلبات',
        icon: 'pi pi-th-large',
        count: totalRequests.value,
        percentage: 100,
        accent: '#6366f1',
        chart: miniChart(totalRequests.value, totalRequests.value, '#6366f1'),
    },
    {
        key: 'pending',
        label: 'الطلبات المعلقة',
        sublabel: 'في انتظار المراجعة',
        icon: 'pi pi-hourglass',
        count: statusCounts.value.pending,
        percentage: statusPercentages.value.pending,
        accent: '#f59e0b',
        chart: miniChart(statusCounts.value.pending, totalRequests.value, '#f59e0b'),
    },
    {
        key: 'approved',
        label: 'الطلبات المقبولة',
        sublabel: 'تمت الموافقة عليها',
        icon: 'pi pi-verified',
        count: statusCounts.value.approved,
        percentage: statusPercentages.value.approved,
        accent: '#10b981',
        chart: miniChart(statusCounts.value.approved, totalRequests.value, '#10b981'),
    },
    {
        key: 'completed',
        label: 'الطلبات المكتملة',
        sublabel: 'تم إنجازها بنجاح',
        icon: 'pi pi-check-square',
        count: statusCounts.value.completed,
        percentage: statusPercentages.value.completed,
        accent: '#3b82f6',
        chart: miniChart(statusCounts.value.completed, totalRequests.value, '#3b82f6'),
    },
    {
        key: 'rejected',
        label: 'الطلبات المرفوضة',
        sublabel: 'تم رفضها',
        icon: 'pi pi-ban',
        count: statusCounts.value.rejected,
        percentage: statusPercentages.value.rejected,
        accent: '#ef4444',
        chart: miniChart(statusCounts.value.rejected, totalRequests.value, '#ef4444'),
    },
]);
</script>

<template>
    <div class="stat-grid" dir="rtl">
        <div
            v-for="card in cards"
            :key="card.key"
            class="premium-card"
            :style="{ '--accent': card.accent }"
        >
            <!-- Top accent line -->
            <div class="accent-line"></div>

            <div class="card-body">

                <!-- Top row: icon + chart -->
                <div class="top-row">
                    <div class="icon-wrap" :style="{ background: card.accent + '14', borderColor: card.accent + '30' }">
                        <i :class="card.icon" :style="{ color: card.accent }"></i>
                    </div>
                    <div class="chart-ring">
                        <Chart
                            type="doughnut"
                            :data="card.chart.data"
                            :options="card.chart.options"
                            class="ring-chart"
                        />
                        <span class="ring-pct" :style="{ color: card.accent }">{{ card.percentage }}%</span>
                    </div>
                </div>

                <!-- Count -->
                <div class="count-row">
                    <span class="count-num">{{ card.count }}</span>
                    <span class="count-badge" :style="{ color: card.accent, background: card.accent + '12', borderColor: card.accent + '25' }">طلب</span>
                </div>

                <!-- Labels -->
                <div class="label-row">
                    <span class="card-title">{{ card.label }}</span>
                    <span class="card-sub">{{ card.sublabel }}</span>
                </div>

                <!-- Divider -->
                <div class="divider"></div>

                <!-- Footer bar -->
                <div class="footer-bar">
                    <span class="footer-text">النسبة من الإجمالي</span>
                    <span class="footer-pct" :style="{ color: card.accent }">{{ card.percentage }}%</span>
                </div>
                <div class="thin-bar">
                    <div
                        class="thin-fill"
                        :style="{ width: card.percentage + '%', background: card.accent }"
                    ></div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

/* ── Grid ── */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.1rem;
    font-family: 'Cairo', sans-serif;
}

@media (max-width: 1280px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px)  { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .stat-grid { grid-template-columns: 1fr; } }

/* ── Card ── */
.premium-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    background: #18181b !important;
    transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    color: #fff !important;
}

.premium-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px -4px rgba(0,0,0,0.12);
    border-color: var(--accent);
}

/* Colored top line */
.accent-line {
    height: 3px;
    background: var(--accent);
    width: 100%;
    opacity: 0.85;
}

/* ── Body ── */
.card-body {
    padding: 1.25rem 1.15rem 1rem;
}

/* ── Top row ── */
.top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.icon-wrap {
    width: 2.7rem;
    height: 2.7rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid;
    transition: transform 0.3s ease;
}

.premium-card:hover .icon-wrap {
    transform: rotate(-8deg) scale(1.1);
}

.icon-wrap i {
    font-size: 1.1rem;
}

/* ── Chart ring ── */
.chart-ring {
    position: relative;
    width: 58px;
    height: 58px;
}

.ring-chart {
    width: 100% !important;
    height: 100% !important;
}

.ring-pct {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.55rem;
    font-weight: 800;
    white-space: nowrap;
}

/* ── Count ── */
.count-row {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    margin-bottom: 0.3rem;
}

.count-num {
    font-size: 2.3rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.04em;
}

.count-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.1rem 0.45rem;
    border-radius: 20px;
    border: 1px solid;
}

/* ── Labels ── */
.label-row {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    margin-bottom: 0.9rem;
}

.card-title {
    font-size: 0.85rem;
    font-weight: 700;
}

.card-sub {
    font-size: 0.68rem;
    color: var(--text-color-secondary, #6b7280);
}

/* ── Divider ── */
.divider {
    height: 1px;
    background: var(--surface-border, #e5e7eb);
    margin-bottom: 0.7rem;
}

/* ── Footer ── */
.footer-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
}

.footer-text {
    font-size: 0.63rem;
    color: var(--text-color-secondary, #9ca3af);
}

.footer-pct {
    font-size: 0.63rem;
    font-weight: 700;
}

/* ── Thin bar ── */
.thin-bar {
    height: 4px;
    background: var(--surface-border, #e5e7eb);
    border-radius: 4px;
    overflow: hidden;
}

.thin-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.9s cubic-bezier(.4,0,.2,1);
    opacity: 0.8;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    .premium-card {
        background: var(--surface-ground, #1f2937);
        box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    }
}
</style>