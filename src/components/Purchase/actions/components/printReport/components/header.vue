<!-- components/PurchaseRequest/RequestHeader.vue -->

<template>
  <div class="request-header">
    <div class="header-gradient"></div>
    <div class="header-content">
      <div class="header-main">
        <div class="title-section">
          <h1 class="request-title">{{ requestInfo.title }}</h1>
          <p class="request-number">{{ requestInfo.requestNumber }}</p>
        </div>
        <div class="badges-section">
          <Tag 
            :value="requestInfo.status.label" 
            :severity="requestInfo.status.severity"
            class="status-badge"
          />
          <Tag 
            :value="requestInfo.priority.label" 
            :severity="requestInfo.priority.severity"
            class="priority-badge"
          />
        </div>
      </div>

      <div class="header-details">
        <div class="detail-item">
          <i class="pi pi-align-right"></i>
          <div class="detail-content">
            <span class="detail-label">الوصف</span>
            <p class="detail-value">{{ requestInfo.description }}</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item compact">
            <i class="pi pi-calendar"></i>
            <div class="detail-content">
              <span class="detail-label">تاريخ الإنشاء</span>
              <p class="detail-value">{{ requestInfo.createdAt }}</p>
            </div>
          </div>

          <div class="detail-item compact">
            <i class="pi pi-user"></i>
            <div class="detail-content">
              <span class="detail-label">المنشئ</span>
              <p class="detail-value">{{ requestInfo.creator }}</p>
            </div>
          </div>

          <div class="detail-item compact" v-if="requestInfo.statusDate">
            <i class="pi pi-check-circle"></i>
            <div class="detail-content">
              <span class="detail-label">تاريخ الحالة</span>
              <p class="detail-value">{{ requestInfo.statusDate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag';
import type { RequestInfo } from '../types';

interface Props {
  requestInfo: RequestInfo;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.request-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
  padding: 2.5rem;
  color: white;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.title-section {
  flex: 1;
  min-width: 300px;
}

.request-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.request-number {
  font-size: 1rem;
  margin: 0;
  opacity: 0.85;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.badges-section {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

:deep(.status-badge),
:deep(.priority-badge) {
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white !important;
}

.header-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  
  i {
    font-size: 1.25rem;
    opacity: 0.9;
    margin-top: 0.25rem;
  }

  &.compact {
    align-items: center;
    
    i {
      font-size: 1rem;
      margin-top: 0;
    }
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-content {
  flex: 1;
}

.detail-label {
  display: block;
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .header-content {
    padding: 1.5rem;
  }

  .request-title {
    font-size: 1.75rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>