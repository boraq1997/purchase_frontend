<script setup lang="ts">
/**
 * PrimeVue UI components used for displaying structured data,
 * status tags, messages, and loading placeholders
 */
import Card from 'primevue/card';
import Tag from 'primevue/tag';

/**
 * Vue Composition API helpers
 * - computed: creates reactive derived values
 * - defineProps: provides strongly typed component props
 */
import { computed } from 'vue';

/**
 * Type definition for a single request item
 * Includes warehouse check data and related business logic fields
 */
import type { RequestItem } from '../../../interfaces/item.interfaces';

/**
 * Component props definition
 *
 * @property item
 * - The request item object passed from the parent component
 * - Can be null when no item is selected or data is not yet loaded
 */
const props = defineProps<{
    item: RequestItem | null;
}>();

/**
 * Computed reference to the warehouse check data
 *
 * - Safely extracts the warehouse_check object from the request item
 * - Returns null if item or warehouse_check does not exist
 *
 * @returns Warehouse check object or null
 */
const wh = computed(() => props.item?.warehouse_check || null);
const itemQuantity = props.item.quantity
/**
 * Configuration object for item availability status
 *
 * Maps backend availability values to UI display settings:
 * - label: Human-readable Arabic text
 * - severity: PrimeVue Tag severity (visual color)
 * - icon: PrimeIcons icon representing availability state
 */
const availabilityConfig: any = {
    available: {
        label: 'متوفر',
        severity: 'success',
        icon: 'pi-check-circle',
    },
    partial: {
        label: 'متوفر جزئياً',
        severity: 'warning',
        icon: 'pi-exclamation-triangle',
    },
    unavailable: {
        label: 'غير متوفر',
        severity: 'danger',
        icon: 'pi-times-circle',
    }
};

/**
 * Configuration object for item physical condition
 *
 * Maps condition states to UI indicators:
 * - label: Descriptive Arabic text
 * - severity: Visual importance level
 * - icon: Icon that reflects the condition state
 */

/**
 * Resolves the recommendation tag configuration based on the given value
 *
 * This function translates backend recommendation values into
 * user-friendly UI Tag settings.
 *
 * @param value
 * - Backend recommendation value
 *
 * Supported values:
 * - provide_from_stock
 * - purchase_new
 * - reject
 *
 * @returns Object containing label, severity, and icon
 */
const recommendationTag = (value: string | undefined) => {
    switch (value) {
        case 'provide_from_stock':
            return {
                label: 'توفير من المخزون',
                severity: 'success',
                icon: 'fas fa-warehouse'
            };

        case 'purchase_new':
            return {
                label: 'شراء جديد',
                severity: 'warn',
                icon: 'fas fa-cart-shopping'
            };

        case 'reject':
            return {
                label: 'مرفوض',
                severity: 'danger',
                icon: 'fas fa-xmark'
            };

        default:
            return {
                label: value,
                severity: 'info',
                icon: 'fas fa-note-sticky'
            };
    }
};

/**
 * Resolves the current availability UI configuration
 *
 * Logic:
 * - If warehouse check exists, map availability value to its config
 * - Returns null if warehouse check data is missing
 *
 * @returns Availability configuration or null
 */
const currentAvailability = computed(() =>
    wh.value ? availabilityConfig[wh.value.availability] : null
);

/**
 * Resolves the current condition UI configuration
 *
 * Logic:
 * - Safely accesses the condition value
 * - Maps it to the corresponding UI configuration
 *
 * @returns Condition configuration or null
 */
</script>

<template>
    <div class="warehouse-dashboard p-3">
        <!-- Empty State -->
        <div v-if="!wh" class="flex align-items-center justify-content-center text-center h-full empty-state">
            <div>
                <i class="pi pi-inbox empty-icon mb-3"></i>
                <h3 class="text-xl font-bold mb-2">لا يوجد فحص مخزني</h3>
                <p class="text-color-secondary m-0">لم يتم تسجيل بيانات الفحص المخزني لهذه المادة بعد.</p>
            </div>
        </div>

        <!-- Warehouse Data -->
        <div v-else>
            <!-- Quantity Card -->
            <Card class="warehouse-card">
                <!-- Header -->
                <template #header>
                    <div class="card-header-custom">
                        <div class="flex align-items-center gap-3">
                            <div class="header-icon-wrapper">
                                <i class="pi pi-warehouse"></i>
                            </div>
                            <div>
                                <h2 class="header-title">فحص المخزن</h2>
                                <p class="header-subtitle">تفاصيل التوفر والحالة للمادة المحددة</p>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Content -->
                <template #content>
                    <div class="card-content-section">
                        <!-- Status Section -->
                        <div class="info-block">
                            <div class="info-label">
                                <i class="pi pi-check-circle"></i>
                                <span>حالة التوفر</span>
                            </div>
                            <Tag 
                                v-if="currentAvailability"
                                :value="currentAvailability.label"
                                :severity="currentAvailability.severity"
                                class="status-tag-large"
                            />
                        </div>

                        <!-- Quantities Grid -->
                        <div class="quantities-grid">
                            <div class="quantity-box">
                                <div class="quantity-label">
                                    <i class="pi pi-box"></i>
                                    <span>الكمية المتوفرة</span>
                                </div>
                                <div class="quantity-value">
                                    <span class="number">{{ wh.available_quantity ?? '0' }}</span>
                                    <span class="unit">وحدة</span>
                                </div>
                            </div>

                            <div class="quantity-box quantity-box-alt">
                                <div class="quantity-label">
                                    <i class="pi pi-shopping-cart"></i>
                                    <span>الكمية المطلوبة</span>
                                </div>
                                <div class="quantity-value">
                                    <span class="number">{{ itemQuantity ?? '0' }}</span>
                                    <span class="unit">وحدة</span>
                                </div>
                            </div>
                        </div>

                        <!-- Notes Section -->
                        <div v-if="wh.notes" class="notes-block">
                            <div class="notes-label">
                                <i class="pi pi-comment"></i>
                                <span>ملاحظات</span>
                            </div>
                            <p class="notes-text">{{ wh.notes }}</p>
                        </div>
                    </div>
                </template>

                <!-- Footer -->
                <template #footer>
                    <div class="card-footer-custom">
                        <div class="footer-user-info">
                            <i class="pi pi-user"></i>
                            <span>{{ wh.checked_by?.name || 'غير محدد' }}</span>
                        </div>
                        <Tag 
                            v-if="wh.recommendation"
                            :icon="`pi ${recommendationTag(wh.recommendation).icon}`"
                            :severity="recommendationTag(wh.recommendation).severity" 
                            :value="recommendationTag(wh.recommendation).label"
                            class="recommendation-tag"
                        />
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
/* Card Base */
.warehouse-card {
    border: 1px solid var(--surface-border);
    box-shadow: 0px 0px 3px rgb(90 90 90 / 93%);
    height: 100%;
}

/* Header */
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

/* Content Section */
.card-content-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Info Block */
.info-block {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.info-label i {
    font-size: 1rem;
    color: var(--primary-500);
}

.status-tag-large {
    font-size: 1rem;
    font-weight: 600;
    padding: 0.625rem 1.25rem;
    width: 100%;
    justify-content: center;
}

/* Quantities Grid */
.quantities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.quantity-box {
    background: var(--surface-50);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s ease;
}

.quantity-box:hover {
    border-color: var(--primary-200);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.quantity-box-alt {
    background: linear-gradient(135deg, var(--blue-50) 0%, var(--surface-50) 100%);
}

.quantity-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    margin-bottom: 0.75rem;
}

.quantity-label i {
    font-size: 1rem;
    color: var(--primary-500);
}

.quantity-value {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.quantity-value .number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-600);
    line-height: 1;
}

.quantity-value .unit {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color-secondary);
}

/* Notes Block */
.notes-block {
    background: var(--surface-50);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
}

.notes-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    margin-bottom: 0.5rem;
}

.notes-label i {
    color: var(--primary-500);
}

.notes-text {
    margin: 0;
    color: var(--text-color-secondary);
    line-height: 1.6;
    font-size: 0.9375rem;
}

/* Footer */
.card-footer-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    padding-top: 0.5rem;
}

.footer-user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

.footer-user-info i {
    color: var(--primary-500);
}

.recommendation-tag {
    font-size: 0.8125rem;
    font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
    .card-header-custom {
        padding: 1.25rem;
    }

    .header-icon-wrapper {
        width: 40px;
        height: 40px;
    }

    .header-icon-wrapper i {
        font-size: 1.25rem;
    }

    .header-title {
        font-size: 1.25rem;
    }

    .quantities-grid {
        grid-template-columns: 1fr;
    }

    .quantity-value .number {
        font-size: 1.75rem;
    }

    .card-footer-custom {
        flex-direction: column;
        align-items: flex-start;
    }

    .recommendation-tag {
        width: 100%;
        justify-content: center;
    }
}
</style>