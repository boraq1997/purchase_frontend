<!-- components/PurchaseRequest/ProcurementsTable.vue -->

<template>
  <div class="procurements-section" v-if="procurements.length > 0">
    <div class="section-header">
      <div class="section-title">
        <i class="pi pi-shopping-cart"></i>
        <h2>عمليات الشراء</h2>
      </div>
    </div>

    <div class="procurements-list">
      <div 
        v-for="(procurement, index) in procurements" 
        :key="procurement.id"
        class="procurement-card"
        :style="{ '--index': index }"
      >
        <div class="procurement-main">
          <div class="procurement-icon">
            <i class="pi pi-shopping-bag"></i>
          </div>

          <div class="procurement-details">
            <div class="detail-row">
              <span class="label">الرقم المرجعي</span>
              <span class="value reference">{{ procurement.reference_no }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">تاريخ الشراء</span>
              <span class="value">
                <i class="pi pi-calendar"></i>
                {{ procurement.purchaseDate }}
              </span>
            </div>

            <div class="detail-row amount-row">
              <span class="label">المبلغ الإجمالي</span>
              <span class="value amount">{{ procurement.formattedAmount }}</span>
            </div>
          </div>

          <div class="procurement-status">
            <Tag 
              :value="procurement.status.label" 
              :severity="procurement.status.severity"
            />
          </div>
        </div>

        <div class="procurement-notes" v-if="procurement.notes">
          <i class="pi pi-info-circle"></i>
          <p>{{ procurement.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag';
import type { Procurement } from '../types';

interface Props {
  procurements: Array<Procurement & { purchaseDate: string; formattedAmount: string }>;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.procurements-section {
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
    color: #a855f7;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.01em;
  }
}

.procurements-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.procurement-card {
  background: linear-gradient(135deg, #faf5ff 0%, #fcf9ff 100%);
  border: 2px solid #e9d5ff;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideInRight 0.5s ease-out backwards;
  animation-delay: calc(var(--index) * 0.1s);

  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15);
    border-color: #d8b4fe;
  }
}

.procurement-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
}

.procurement-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 1.75rem;
    color: white;
  }
}

.procurement-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  &.amount-row {
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin-top: 0.5rem;
  }
}

.label {
  font-size: 0.85rem;
  color: #6b21a8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value {
  font-weight: 600;
  color: #4c1d95;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    color: #a855f7;
    font-size: 0.9rem;
  }

  &.reference {
    font-family: 'Courier New', monospace;
    background: white;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.95rem;
  }

  &.amount {
    font-size: 1.35rem;
    color: #a855f7;
    direction: ltr;
  }
}

.procurement-status {
  flex-shrink: 0;

  :deep(.p-tag) {
    padding: 0.5rem 1rem;
    border-radius: 10px;
    font-weight: 600;
  }
}

.procurement-notes {
  background: white;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9d5ff;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;

  i {
    color: #a855f7;
    font-size: 1.1rem;
    margin-top: 0.25rem;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    color: #4c1d95;
    line-height: 1.6;
    font-size: 0.95rem;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .procurements-section {
    padding: 1.25rem;
  }

  .procurement-main {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .procurement-icon {
    margin: 0 auto;
  }

  .detail-row {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }

  .procurement-status {
    display: flex;
    justify-content: center;
  }
}
</style>