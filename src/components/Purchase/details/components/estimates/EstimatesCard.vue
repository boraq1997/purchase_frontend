<script setup lang="ts">
/**
 * PrimeVue UI components used for layout and visualization
 */
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';

/**
 * Vue Composition API helpers
 * - computed: used to derive reactive calculated values
 * - defineProps: used to strongly type component props
 */
import { computed, defineProps } from 'vue';

/**
 * Type definition for a single request item
 * This interface represents the backend structure of the item
 * including its estimates and related data.
 */
import type { RequestItem } from '../../../interfaces/item.interfaces';

/**
 * Component props definition
 *
 * @property item
 * - The request item object received from the parent component
 * - Can be null if no item is selected
 */
const props = defineProps<{
    item: RequestItem | null;
}>();

/**
 * Extracts the list of estimates related to the request item
 *
 * - Uses optional chaining to avoid runtime errors
 * - Returns an empty array when no item or estimates exist
 *
 * @returns Array of estimates
 */
const estimates = computed(() => props.item?.estimate ?? []);

/**
 * Calculates the lowest total price among all estimates
 *
 * Logic:
 * - If there are no estimates, return null
 * - Convert each total_amount to a number
 * - Use Math.min to find the lowest value
 * - Invalid or missing values are treated as Infinity
 *
 * @returns Lowest price or null
 */
const lowestPrice = computed(() => {
    if (!estimates.value.length) return null;

    return Math.min(
        ...estimates.value.map(
            e => parseFloat(e.estimate.total_amount) || Infinity
        )
    );
});

/**
 * Calculates the highest total price among all estimates
 *
 * Logic:
 * - If there are no estimates, return null
 * - Convert each total_amount to a number
 * - Use Math.max to find the highest value
 * - Invalid or missing values are treated as 0
 *
 * @returns Highest price or null
 */
const highestPrice = computed(() => {
    if (!estimates.value.length) return null;

    return Math.max(
        ...estimates.value.map(
            e => parseFloat(e.estimate.total_amount) || 0
        )
    );
});

/**
 * Calculates the average price of all estimates
 *
 * Logic:
 * - If no estimates exist, return 0
 * - Sum all total_amount values
 * - Divide by the number of estimates
 * - Round the result to the nearest integer
 *
 * @returns Average price as a rounded number
 */
const averagePrice = computed(() => {
    if (!estimates.value.length) return 0;

    const sum = estimates.value.reduce(
        (acc, e) => acc + parseFloat(e.estimate.total_amount || '0'),
        0
    );

    return Math.round(sum / estimates.value.length);
});

/**
 * Calculates the price difference between the highest and lowest estimates
 *
 * Logic:
 * - If either value is missing, return 0
 * - Subtract the lowest price from the highest price
 *
 * @returns Price difference
 */
const priceDifference = computed(() => {
    if (!lowestPrice.value || !highestPrice.value) return 0;

    return highestPrice.value - lowestPrice.value;
});
</script>

<template>
    <div class="estimates-dashboard p-3">
        <!-- Empty State -->
        <div v-if="!estimates.length" class="flex align-items-center justify-content-center text-center h-full empty-state">
            <div>
                <i class="pi pi-inbox empty-icon mb-3"></i>
                <h3 class="text-xl font-bold mb-2">لا توجد عروض أسعار</h3>
                <p class="text-color-secondary m-0">لم يتم إضافة أي عروض أسعار لهذه المادة بعد.</p>
            </div>
        </div>

        <!-- Estimates Data -->
        <div v-else>
            <!-- Statistics Card -->
            <Card class="statistics-card mb-3">
                <!-- Header -->
                <template #header>
                    <div class="card-header-custom">
                        <div class="flex align-items-center gap-3">
                            <div class="header-icon-wrapper">
                                <i class="pi pi-wallet"></i>
                            </div>
                            <div>
                                <h2 class="header-title">عروض الأسعار</h2>
                                <p class="header-subtitle">مقارنة شاملة للأسعار المقدمة</p>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Content -->
                <template #content>
                    <div class="statistics-grid">
                        <!-- Total Estimates -->
                        <div class="stat-box stat-box-blue">
                            <div class="stat-label">
                                <i class="pi pi-list"></i>
                                <span>إجمالي العروض</span>
                            </div>
                            <div class="stat-value">
                                <span class="number">{{ estimates.length }}</span>
                                <span class="unit">عرض</span>
                            </div>
                        </div>

                        <!-- Lowest Price -->
                        <div class="stat-box stat-box-green">
                            <div class="stat-label">
                                <i class="pi pi-star-fill"></i>
                                <span>أفضل سعر</span>
                            </div>
                            <div class="stat-value">
                                <span class="number">{{ lowestPrice?.toLocaleString() ?? '—' }}</span>
                                <span class="unit">IQD</span>
                            </div>
                        </div>

                        <!-- Average Price -->
                        <div class="stat-box stat-box-orange">
                            <div class="stat-label">
                                <i class="pi pi-chart-bar"></i>
                                <span>متوسط السعر</span>
                            </div>
                            <div class="stat-value">
                                <span class="number">{{ averagePrice.toLocaleString() }}</span>
                                <span class="unit">IQD</span>
                            </div>
                        </div>

                        <!-- Price Difference -->
                        <div class="stat-box stat-box-purple">
                            <div class="stat-label">
                                <i class="pi pi-arrows-h"></i>
                                <span>فرق السعر</span>
                            </div>
                            <div class="stat-value">
                                <span class="number">{{ priceDifference.toLocaleString() }}</span>
                                <span class="unit">IQD</span>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Estimates List -->
            <div class="estimates-list">
                <Card
                    v-for="(est, index) in estimates"
                    :key="est.id"
                    class="estimate-card mb-3"
                    :class="{ 'best-offer': parseFloat(est.estimate.total_amount) === lowestPrice }"
                >
                    <!-- Header -->
                    <template #header>
                        <div class="estimate-header">
                            <div class="flex align-items-center justify-content-between flex-wrap gap-3">
                                <div class="flex align-items-center gap-3">
                                    <div class="estimate-number">
                                        {{ index + 1 }}
                                    </div>
                                    <div>
                                        <p class="estimate-label">رقم العرض</p>
                                        <h3 class="estimate-id">#{{ est.id }}</h3>
                                    </div>
                                </div>

                                <div class="flex align-items-center gap-2 flex-wrap">
                                    <Tag
                                        v-if="parseFloat(est.estimate.total_amount) === lowestPrice"
                                        value="أفضل عرض"
                                        severity="success"
                                        icon="pi pi-star-fill"
                                        class="best-offer-tag"
                                    />
                                    <div class="total-price-box">
                                        <i class="pi pi-dollar"></i>
                                        <span class="price">{{ parseFloat(est.estimate.total_amount)?.toLocaleString() ?? '—' }}</span>
                                        <span class="currency">IQD</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Content -->
                    <template #content>
                        <!-- Vendor Info -->
                        <div class="section-block mb-4">
                            <div class="section-header">
                                <i class="pi pi-building"></i>
                                <span>معلومات المورد</span>
                            </div>

                            <div class="info-grid">
                                <div class="info-item info-item-blue">
                                    <div class="info-icon">
                                        <i class="pi pi-store"></i>
                                    </div>
                                    <div class="info-content">
                                        <span class="info-label">اسم المحل</span>
                                        <span class="info-value">{{ est.estimate.vendor?.name ?? '—' }}</span>
                                    </div>
                                </div>

                                <div class="info-item info-item-green">
                                    <div class="info-icon">
                                        <i class="pi pi-phone"></i>
                                    </div>
                                    <div class="info-content">
                                        <span class="info-label">رقم الهاتف</span>
                                        <div class="info-value">
                                            <a :href="`tel:${est.estimate.vendor?.phone1}`" class="phone-link">
                                                {{ est.estimate.vendor?.phone1 ?? '—' }}
                                            </a>
                                            <span v-if="est.estimate.vendor?.phone2"> / </span>
                                            <a v-if="est.estimate.vendor?.phone2" :href="`tel:${est.estimate.vendor?.phone2}`" class="phone-link">
                                                {{ est.estimate.vendor?.phone2 }}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div class="info-item info-item-purple">
                                    <div class="info-icon">
                                        <i class="pi pi-envelope"></i>
                                    </div>
                                    <div class="info-content">
                                        <span class="info-label">البريد الإلكتروني</span>
                                        <a :href="`mailto:${est.estimate.vendor?.email}`" class="info-value email-link">
                                            {{ est.estimate.vendor?.email ?? '—' }}
                                        </a>
                                    </div>
                                </div>

                                <div class="info-item info-item-red">
                                    <div class="info-icon">
                                        <i class="pi pi-map-marker"></i>
                                    </div>
                                    <div class="info-content">
                                        <span class="info-label">العنوان</span>
                                        <span class="info-value">{{ est.estimate.vendor?.address ?? '—' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <!-- Price Details -->
                        <div class="section-block">
                            <div class="section-header">
                                <i class="pi pi-money-bill"></i>
                                <span>تفاصيل الأسعار</span>
                            </div>

                            <div class="price-grid">
                                <div class="price-item price-item-cyan">
                                    <div class="price-icon">
                                        <i class="pi pi-tag"></i>
                                    </div>
                                    <div class="price-content">
                                        <span class="price-label">السعر المفرد</span>
                                        <span class="price-value">
                                            {{ parseFloat(est.estimated_unit_price ?? est.unit_price)?.toLocaleString() ?? '—' }}
                                        </span>
                                    </div>
                                </div>

                                <div class="price-item price-item-indigo">
                                    <div class="price-icon">
                                        <i class="pi pi-calculator"></i>
                                    </div>
                                    <div class="price-content">
                                        <span class="price-label">السعر الكلي</span>
                                        <span class="price-value">
                                            {{ parseFloat(est.estimate.total_amount)?.toLocaleString() ?? '—' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Empty State */
.empty-state {
    min-height: 300px;
}

.empty-icon {
    font-size: 4rem;
    color: var(--text-color-secondary);
}

/* Statistics Card */
.statistics-card {
    border: 1px solid var(--surface-border);
    box-shadow: 0px 0px 3px rgb(90 90 90 / 93%);
}

.card-header-custom {
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-50) 0%, var(--surface-card) 100%);
    border-bottom: 1px solid var(--surface-border);
}

.header-icon-wrapper {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(var(--primary-500-rgb), 0.25);
}

.header-icon-wrapper i {
    font-size: 1.5rem;
    color: white;
}

.header-title {
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    line-height: 1.2;
}

.header-subtitle {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin: 0.25rem 0 0 0;
    line-height: 1.4;
}

/* Statistics Grid */
.statistics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-box {
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s ease;
}

.stat-box-blue {
    background: linear-gradient(135deg, var(--blue-50) 0%, var(--surface-50) 100%);
    border-color: var(--blue-200);
}

.stat-box-green {
    background: linear-gradient(135deg, var(--green-50) 0%, var(--surface-50) 100%);
    border-color: var(--green-200);
}

.stat-box-orange {
    background: linear-gradient(135deg, var(--orange-50) 0%, var(--surface-50) 100%);
    border-color: var(--orange-200);
}

.stat-box-purple {
    background: linear-gradient(135deg, var(--purple-50) 0%, var(--surface-50) 100%);
    border-color: var(--purple-200);
}

.stat-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    margin-bottom: 0.75rem;
}

.stat-label i {
    font-size: 1rem;
}

.stat-box-blue .stat-label i { color: var(--blue-600); }
.stat-box-green .stat-label i { color: var(--green-600); }
.stat-box-orange .stat-label i { color: var(--orange-600); }
.stat-box-purple .stat-label i { color: var(--purple-600); }

.stat-value {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.stat-value .number {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
}

.stat-box-blue .number { color: var(--blue-600); }
.stat-box-green .number { color: var(--green-600); }
.stat-box-orange .number { color: var(--orange-600); }
.stat-box-purple .number { color: var(--purple-600); }

.stat-value .unit {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color-secondary);
}

/* Estimate Card */
.estimate-card {
    border: 1px solid var(--surface-border);
    box-shadow: 0px 0px 3px rgb(90 90 90 / 93%);
    transition: all 0.2s ease;
}

.estimate-card.best-offer {
    border: 2px solid var(--green-500);
}

.estimate-header {
    padding: 1.5rem;
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-border);
}

.estimate-card.best-offer .estimate-header {
    background: linear-gradient(135deg, var(--green-50) 0%, var(--surface-50) 100%);
}

.estimate-number {
    width: 48px;
    height: 48px;
    background: var(--primary-500);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
}

.estimate-card.best-offer .estimate-number {
    background: var(--green-500);
}

.estimate-label {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    margin: 0 0 0.25rem 0;
}

.estimate-id {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
}

.best-offer-tag {
    font-weight: 600;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

.total-price-box {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.total-price-box i {
    color: var(--primary-500);
    font-size: 1.25rem;
}

.total-price-box .price {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-600);
}

.total-price-box .currency {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Section Block */
.section-block {
    margin-top: 1rem;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 1rem;
}

.section-header i {
    color: var(--primary-500);
    font-size: 1.125rem;
}

/* Info Grid */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid;
    transition: all 0.2s ease;
    border: 1px solid #404040 !important;
}

.info-item-blue {
    background: linear-gradient(135deg, var(--blue-50) 0%, var(--surface-50) 100%);
    border-color: var(--blue-200);
}

.info-item-green {
    background: linear-gradient(135deg, var(--green-50) 0%, var(--surface-50) 100%);
    border-color: var(--green-200);
}

.info-item-purple {
    background: linear-gradient(135deg, var(--purple-50) 0%, var(--surface-50) 100%);
    border-color: var(--purple-200);
}

.info-item-red {
    background: linear-gradient(135deg, var(--red-50) 0%, var(--surface-50) 100%);
    border-color: var(--red-200);
}

.info-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.125rem;
    color: white;
}

.info-item-blue .info-icon { background: var(--blue-500); }
.info-item-green .info-icon { background: var(--green-500); }
.info-item-purple .info-icon { background: var(--purple-500); }
.info-item-red .info-icon { background: var(--red-500); }

.info-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
}

.info-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.info-value {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-color);
    word-break: break-word;
}

.phone-link,
.email-link {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;
}

/* Price Grid */
.price-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.price-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 10px;
    border: 2px solid;
    transition: all 0.2s ease;
    border-color: #404040 !important;
}

.price-item-cyan {
    background: linear-gradient(135deg, var(--cyan-50) 0%, var(--surface-50) 100%);
    border-color: var(--cyan-300);
}

.price-item-indigo {
    background: linear-gradient(135deg, var(--indigo-50) 0%, var(--surface-50) 100%);
    border-color: var(--indigo-300);
}

.price-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.25rem;
    color: white;
}

.price-item-cyan .price-icon { background: var(--cyan-500); }
.price-item-indigo .price-icon { background: var(--indigo-500); }

.price-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.price-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.price-value {
    font-size: 1.5rem;
    font-weight: 700;
}

.price-item-cyan .price-value { color: var(--cyan-600); }
.price-item-indigo .price-value { color: var(--indigo-600); }

/* Responsive */
@media (max-width: 768px) {
    .statistics-grid {
        grid-template-columns: 1fr;
    }

    .estimate-header {
        padding: 1.25rem;
    }

    .estimate-number {
        width: 40px;
        height: 40px;
        font-size: 1rem;
    }

    .estimate-id {
        font-size: 1.125rem;
    }

    .total-price-box .price {
        font-size: 1.125rem;
    }

    .info-grid,
    .price-grid {
        grid-template-columns: 1fr;
    }

    .stat-value .number {
        font-size: 1.75rem;
    }

    .price-value {
        font-size: 1.25rem;
    }
}
</style>