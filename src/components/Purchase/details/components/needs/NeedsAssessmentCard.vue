<script setup lang="ts">
/**
 * PrimeVue UI components used to display cards, tags, and separators
 */
import Card from 'primevue/card';
import Tag from 'primevue/tag';

/**
 * Vue Composition API helpers
 * - computed: used to create reactive derived state
 * - defineProps: used to strongly type incoming component props
 */
import { computed } from 'vue';

/**
 * Type definition representing a request item
 * Includes related data such as needs assessment information
 */
import type { PurchaseItem as RequestItem } from '../../../interfaces/purchase.interfaces';

/**
 * Component props definition
 *
 * @property item
 * - The request item passed from the parent component
 * - Can be null if no item is selected
 */
const props = defineProps<{
    item: RequestItem | null;
}>();

/**
 * Computed reference to the needs assessment object
 *
 * - Safely extracts needs_assessment from the item
 * - Returns null if item or needs_assessment is not available
 *
 * @returns Needs assessment object or null
 */
const na = computed(() => props.item?.needs_assessment || null);

/**
 * Configuration object for "Needs Assessment Status"
 *
 * Maps backend status values to UI presentation settings:
 * - label: Human-readable Arabic label
 * - severity: PrimeVue Tag severity (controls color)
 * - icon: PrimeIcons icon used in the Tag
 *
 * This allows consistent UI rendering based on status value
 */
const statusConfig: any = {
    approved: {
        label: 'موافقة',
        severity: 'success',
        icon: 'pi-check-circle'
    },
    pending: {
        label: 'معلقة',
        severity: 'warn',
        icon: 'pi-clock'
    },
    rejected: {
        label: 'مرفوضة',
        severity: 'danger',
        icon: 'pi-times-circle'
    },
    needed: {
        label: 'مطلوبة',
        severity: 'info',
        icon: 'pi-info-circle'
    }
};

/**
 * Configuration object for "Urgency Level"
 *
 * Maps urgency levels to UI properties:
 * - label: Descriptive Arabic label
 * - severity: Visual importance indicator
 * - icon: Icon that reflects urgency level
 *
 * Used to visually highlight how critical the request is
 */
const urgencyConfig: any = {
    high: {
        label: 'عالية',
        severity: 'danger',
        icon: 'pi-exclamation-triangle'
    },
    medium: {
        label: 'متوسطة',
        severity: 'warn',
        icon: 'pi-exclamation-circle'
    },
    low: {
        label: 'منخفضة',
        severity: 'info',
        icon: 'pi-info-circle'
    }
};

/**
 * Resolves the current needs assessment status configuration
 *
 * Logic:
 * - Checks if needs_status exists on the needs assessment object
 * - Maps the backend value to its corresponding UI configuration
 * - Returns null if status is not defined
 *
 * @returns Status configuration object or null
 */
const currentStatus = computed(() =>
    na.value?.needs_status
        ? statusConfig[na.value.needs_status]
        : null
);

/**
 * Resolves the current urgency level configuration
 *
 * Logic:
 * - Checks if urgency_level exists on the needs assessment object
 * - Maps the backend value to its corresponding UI configuration
 * - Returns null if urgency level is not defined
 *
 * @returns Urgency configuration object or null
 */
const currentUrgency = computed(() =>
    na.value?.urgency_level
        ? urgencyConfig[na.value.urgency_level]
        : null
);
</script>

<template>
    <div class="needs-assessment-dashboard p-3">
        <!-- Empty State -->
        <div v-if="!na" class="flex align-items-center justify-content-center text-center h-full empty-state">
            <div>
                <i class="pi pi-inbox empty-icon mb-3"></i>
                <h3 class="text-xl font-bold mb-2">لا يوجد بيان حاجة</h3>
                <p class="text-color-secondary m-0">لم يتم تسجيل بيان حاجة لهذه المادة بعد.</p>
            </div>
        </div>

        <!-- Needs Assessment Data -->
        <div v-else>
            <!-- Main Card -->
            <Card class="needs-card mb-3">
                <!-- Header -->
                <template #header>
                    <div class="card-header-custom">
                        <div class="flex align-items-center gap-3">
                            <div class="header-icon-wrapper">
                                <i class="pi pi-exclamation-circle"></i>
                            </div>
                            <div>
                                <h2 class="header-title">بيان الحاجة</h2>
                                <p class="header-subtitle">تفاصيل تقييم الطلب للمادة المحددة</p>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Content -->
                <template #content>
                    <div class="card-content-section">
                        <!-- Status & Urgency Grid -->
                        <div class="status-grid">
                            <!-- Status -->
                            <div class="status-box">
                                <div class="status-label">
                                    <i class="pi pi-flag"></i>
                                    <span>حالة البيان</span>
                                </div>
                                <Tag 
                                    v-if="currentStatus"
                                    :value="currentStatus.label"
                                    :severity="currentStatus.severity"
                                    :icon="`pi ${currentStatus.icon}`"
                                    class="status-tag-large"
                                />
                            </div>

                            <!-- Urgency -->
                            <div class="status-box status-box-alt">
                                <div class="status-label">
                                    <i class="pi pi-bolt"></i>
                                    <span>مستوى الحاجة</span>
                                </div>
                                <Tag 
                                    v-if="currentUrgency"
                                    :value="currentUrgency.label"
                                    :severity="currentUrgency.severity"
                                    :icon="`pi ${currentUrgency.icon}`"
                                    class="status-tag-large"
                                />
                            </div>
                        </div>

                        <!-- Quantity -->
                        <div class="quantity-box-main">
                            <div class="quantity-label">
                                <i class="pi pi-box"></i>
                                <span>الكمية المقررة</span>
                            </div>
                            <div class="quantity-value">
                                <span class="number">{{ na.quantity_needed_after_assessment ?? '0' }}</span>
                                <span class="unit">وحدة</span>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Footer -->
                <template #footer>
                    <div class="card-footer-custom">
                        <div class="footer-user-info">
                            <i class="pi pi-user"></i>
                            <span> {{ typeof na.assessed_by === 'object' ? na.assessed_by?.name : 'غير محدد' }}</span>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Details Card -->
            <Card class="details-card">
                <template #header>
                    <div class="details-header">
                        <i class="pi pi-list"></i>
                        <span>التفاصيل الكاملة</span>
                    </div>
                </template>

                <template #content>
                    <div class="details-content">
                        <!-- Modified Specifications -->
                        <div v-if="na.modified_specifications" class="detail-block detail-block-primary">
                            <div class="detail-icon">
                                <i class="pi pi-pencil"></i>
                            </div>
                            <div class="detail-body">
                                <h4 class="detail-title">المواصفات المعدّلة</h4>
                                <p class="detail-text">{{ na.modified_specifications }}</p>
                            </div>
                        </div>

                        <!-- Reason -->
                        <div v-if="na.reason" class="detail-block detail-block-orange">
                            <div class="detail-icon">
                                <i class="pi pi-file-edit"></i>
                            </div>
                            <div class="detail-body">
                                <h4 class="detail-title">السبب</h4>
                                <p class="detail-text">{{ na.reason }}</p>
                            </div>
                        </div>

                        <!-- Recommended Action -->
                        <div v-if="na.recommended_action" class="detail-block detail-block-green">
                            <div class="detail-icon">
                                <i class="pi pi-directions"></i>
                            </div>
                            <div class="detail-body">
                                <h4 class="detail-title">الإجراء المقترح</h4>
                                <p class="detail-text">{{ na.recommended_action }}</p>
                            </div>
                        </div>

                        <!-- Notes -->
                        <div v-if="na.notes" class="detail-block detail-block-cyan">
                            <div class="detail-icon">
                                <i class="pi pi-info-circle"></i>
                            </div>
                            <div class="detail-body">
                                <h4 class="detail-title">ملاحظات</h4>
                                <p class="detail-text">{{ na.notes }}</p>
                            </div>
                        </div>

                        <!-- Admin Decision -->
                        <div v-if="na.admin_decision || na.admin_comment" class="detail-block detail-block-purple">
                            <div class="detail-icon">
                                <i class="pi pi-check-circle"></i>
                            </div>
                            <div class="detail-body">
                                <h4 class="detail-title">قرار الإدارة</h4>
                                <div class="admin-decision-box">
                                    <div class="decision-item">
                                        <span class="decision-label">القرار:</span>
                                        <span class="decision-value">{{ na.admin_decision ?? '—' }}</span>
                                    </div>
                                    <div v-if="na.admin_comment" class="decision-item">
                                        <span class="decision-label">تعليق:</span>
                                        <p class="decision-comment">{{ na.admin_comment }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
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

/* Card Base */
.needs-card,
.details-card {
    border: 1px solid var(--surface-border);
    box-shadow: 0px 0px 3px rgb(90 90 90 / 93%);
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

/* Status Grid */
.status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.status-box {
    background: var(--surface-50);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s ease;
}

.status-box-alt {
    background: linear-gradient(135deg, var(--orange-50) 0%, var(--surface-50) 100%);
}

.status-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    margin-bottom: 0.75rem;
}

.status-label i {
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

/* Quantity Box */
.quantity-box-main {
    background: linear-gradient(135deg, var(--green-50) 0%, var(--surface-50) 100%);
    border: 1px solid var(--green-200);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s ease;
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
    color: var(--green-600);
}

.quantity-value {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.quantity-value .number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--green-600);
    line-height: 1;
}

.quantity-value .unit {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color-secondary);
}

/* Footer */
.card-footer-custom {
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

/* Details Card */
.details-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--surface-border);
}

.details-header i {
    color: var(--primary-500);
    font-size: 1.125rem;
}

.details-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Detail Block */
.detail-block {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 12px;
    border: 1px solid;
    transition: all 0.2s ease;
}

.detail-block-primary {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.1) 100%);
    border-color: var(--primary-200);
}

.detail-block-orange {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(251, 146, 60, 0.1) 100%);
    border-color: var(--orange-200);
}

.detail-block-green {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.1) 100%);
    border-color: var(--green-200);
}

.detail-block-cyan {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(6, 182, 212, 0.1) 100%);
    border-color: var(--cyan-200);
}

.detail-block-purple {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0.1) 100%);
    border-color: var(--purple-200);
}

.detail-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.detail-block-primary .detail-icon {
    background: var(--primary-500);
    color: white;
}

.detail-block-orange .detail-icon {
    background: var(--orange-500);
    color: white;
}

.detail-block-green .detail-icon {
    background: var(--green-500);
    color: white;
}

.detail-block-cyan .detail-icon {
    background: var(--cyan-500);
    color: white;
}

.detail-block-purple .detail-icon {
    background: var(--purple-500);
    color: white;
}

.detail-icon i {
    font-size: 1.125rem;
}

.detail-body {
    flex: 1;
}

.detail-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
}

.detail-block-primary .detail-title {
    color: var(--primary-600);
}

.detail-block-orange .detail-title {
    color: var(--orange-600);
}

.detail-block-green .detail-title {
    color: var(--green-600);
}

.detail-block-cyan .detail-title {
    color: var(--cyan-600);
}

.detail-block-purple .detail-title {
    color: var(--purple-600);
}

.detail-text {
    margin: 0;
    color: var(--text-color-secondary);
    line-height: 1.6;
    font-size: 0.9375rem;
}

/* Admin Decision Box */
.admin-decision-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.decision-item {
    background: var(--surface-card);
    border-radius: 8px;
    padding: 0.875rem;
}

.decision-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    display: block;
    margin-bottom: 0.375rem;
}

.decision-value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-color);
}

.decision-comment {
    margin: 0;
    color: var(--text-color-secondary);
    line-height: 1.6;
    font-size: 0.9375rem;
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

    .status-grid {
        grid-template-columns: 1fr;
    }

    .quantity-value .number {
        font-size: 1.75rem;
    }

    .detail-block {
        flex-direction: column;
        gap: 0.75rem;
    }

    .detail-icon {
        width: 36px;
        height: 36px;
    }
}
</style>