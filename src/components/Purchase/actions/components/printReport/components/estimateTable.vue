<!-- components/PurchaseRequest/EstimatesTable.vue -->

<template>
  <div class="estimates-section" v-if="estimates.length > 0">
    <div class="section-header">
      <div class="section-title">
        <i class="pi pi-file"></i>
        <h2>العروض المقدمة</h2>
      </div>
    </div>

    <div class="estimates-grid">
      <div 
        v-for="(estimate, index) in estimates" 
        :key="estimate.id"
        class="estimate-card"
        :style="{ '--index': index }"
      >
        <div class="estimate-header">
          <div class="vendor-info">
            <i class="pi pi-briefcase"></i>
            <span>مورد #{{ estimate.vendor_id }}</span>
          </div>
          <Tag 
            :value="estimate.status.label" 
            :severity="estimate.status.severity"
            class="estimate-status"
          />
        </div>

        <div class="estimate-body">
          <div class="estimate-detail">
            <span class="detail-label">تاريخ العرض</span>
            <span class="detail-value">
              <i class="pi pi-calendar"></i>
              {{ estimate.estimateDate }}
            </span>
          </div>

          <div class="estimate-detail highlight">
            <span class="detail-label">المبلغ الإجمالي</span>
            <span class="detail-value amount">{{ estimate.formattedAmount }}</span>
          </div>

          <div class="estimate-detail" v-if="estimate.notes">
            <span class="detail-label">ملاحظات</span>
            <p class="detail-value notes">{{ estimate.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag';
import type { Estimate } from '../types';

interface Props {
  estimates: Array<Estimate & { estimateDate: string; formattedAmount: string }>;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.estimates-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  i {
    font-size: 1.5rem;
    color: #f59e0b;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.01em;
  }
}

.estimates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.estimate-card {
  background: linear-gradient(135deg, #fff9ed 0%, #fffaf5 100%);
  border: 2px solid #fed7aa;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out backwards;
  animation-delay: calc(var(--index) * 0.1s);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(245, 158, 11, 0.15);
    border-color: #fdba74;
  }
}

.estimate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #fed7aa;
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #92400e;

  i {
    color: #f59e0b;
  }
}

.estimate-status {
  :deep(.p-tag) {
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
  }
}

.estimate-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.estimate-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &.highlight {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    border: 2px solid #fde68a;
  }
}

.detail-label {
  font-size: 0.85rem;
  color: #92400e;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  color: #78350f;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    color: #f59e0b;
    font-size: 0.9rem;
  }

  &.amount {
    font-size: 1.5rem;
    color: #f59e0b;
    direction: ltr;
    justify-content: flex-end;
  }

  &.notes {
    font-weight: 400;
    line-height: 1.6;
    margin: 0;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .estimates-section {
    padding: 1.25rem;
  }

  .estimates-grid {
    grid-template-columns: 1fr;
  }
}
</style>