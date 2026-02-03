<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import AdminDecisionTab from './components/adminDecisionTab.vue';
import warehouseTab from './components/warehouseTab.vue';
import estimateTab from './components/estimateTab.vue';
import { hasAnyPermission, hasPermission } from '../../services/permission';

const props = defineProps<{
  visible: boolean;
  purchaseRequest: any | null;
}>();

const emit = defineEmits(['update:visible','updated']);

const internalVisible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v)
});
</script>

<template>
  <Dialog
    v-model:visible="internalVisible"
    modal
    maximizable
    :style="{ width: '95vw', maxWidth: '1800px' }"
    :contentStyle="{ padding: 0 }"
    dir="rtl"
    class="actions-dialog"
  >
    <template #header>
      <div class="dialog-header-content">
        <h2 class="m-0 text-xl font-semibold">إجراءات الطلب</h2>
        <p class="m-0 text-sm mt-1" v-if="purchaseRequest" style="opacity: 0.8;">
          رقم الطلب: #{{ purchaseRequest.id }} - {{ purchaseRequest.title || 'طلب شراء' }}
        </p>
      </div>
    </template>

    <div class="dialog-content">
      <Tabs value="0" class="custom-tabs">
        <TabList class="custom-tab-list">
          <Tab 
            value="0" 
            class="custom-tab"
            v-if="hasPermission('approve-purchase-request')"
            >
            <div class="tab-content">
              <i class="fas fa-gavel tab-icon"></i>
              <div class="tab-text">
                <span class="tab-label">قرار الإدارة</span>
                <span class="tab-description">الموافقة أو الرفض</span>
              </div>
            </div>
          </Tab>
          
          <Tab 
            value="1" 
            class="custom-tab"
            v-if="hasAnyPermission([
              'view-WarehouseCheck',
              'create-WarehouseCheck',
              'edit-WarehouseCheck',
              'delete-WarehouseCheck'
            ])"
            >
            <div class="tab-content">
              <i class="fas fa-warehouse tab-icon"></i>
              <div class="tab-text">
                <span class="tab-label">رأي المخازن</span>
                <span class="tab-description">التوفر والحالة</span>
              </div>
            </div>
          </Tab>
          
          <Tab 
            value="3" 
            class="custom-tab" 
            v-if="hasAnyPermission([
              'create-Estimate',
              'edit-Estimate'
            ])">
            <div class="tab-content">
              <i class="fas fa-file-invoice-dollar tab-icon"></i>
              <div class="tab-text">
                <span class="tab-label">عروض الأسعار</span>
                <span class="tab-description">المقارنة والاختيار</span>
              </div>
            </div>
          </Tab>
        </TabList>

        <TabPanels class="custom-tab-panels">
          <TabPanel value="0" class="custom-tab-panel" v-if="hasPermission('approve-purchase-request')">
            <AdminDecisionTab
              :id="purchaseRequest?.id"
              :items="purchaseRequest?.items ?? []"
              :purchaseRequest="purchaseRequest"
              @saved="emit('updated')"
            />
          </TabPanel>

          <TabPanel 
            value="1" 
            class="custom-tab-panel"
            v-if="hasAnyPermission([
              'view-WarehouseCheck',
              'create-WarehouseCheck',
              'edit-WarehouseCheck',
              'delete-WarehouseCheck'
            ])"
            >
            <warehouseTab
              :id="purchaseRequest?.id"
              :items="purchaseRequest?.items ?? []"
              :purchaseRequest="purchaseRequest"
              :warehouse_checks="purchaseRequest?.warehouse_checks ?? []"
              @saved="emit('updated')"
            />
          </TabPanel>

          <TabPanel 
            value="3" 
            class="custom-tab-panel"
            v-if="hasAnyPermission([
              'create-Estimate',
              'edit-Estimate'
            ])"
            >
            <estimateTab
              :id="purchaseRequest?.id"
              :items="purchaseRequest?.items ?? []"
              :purchaseRequest="purchaseRequest"
              :needs_assessments="purchaseRequest?.needs_assessments ?? []"
              @saved="emit('updated')"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <template #footer>
      <div class="dialog-footer-custom">
        <Button
          label="إغلاق"
          icon="pi pi-times"
          severity="secondary"
          @click="emit('update:visible', false)"
          outlined
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* Dialog Base */
.actions-dialog :deep(.p-dialog-header) {
  padding: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.actions-dialog :deep(.p-dialog-content) {
  padding: 0;
}

.actions-dialog :deep(.p-dialog-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--surface-border);
  background: var(--surface-50);
}

.dialog-header-content h2 {
  color: var(--text-color);
}

.dialog-content {
  padding: 1.5rem;
  min-height: 60vh;
}

/* Custom Tabs */
.custom-tab-list {
  border-radius: 8px;
  padding: 0.5rem;
  background: var(--surface-100);
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.custom-tab {
  flex: 1;
  min-width: 180px;
}

.custom-tab :deep(button) {
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  color: var(--text-color);
}

.custom-tab :deep(button:hover) {
  background: var(--surface-0);
}

.custom-tab :deep(button[data-p-active="true"]) {
  background: var(--surface-0);
  border-color: var(--primary-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: right;
}

.tab-icon {
  font-size: 1.125rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.tab-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  align-items: flex-start;
}

.tab-label {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-color);
}

.tab-description {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

/* Tab Panels */
.custom-tab-panels {
  background: transparent;
}

.custom-tab-panel {
  padding: 0 !important;
}

/* Footer */
.dialog-footer-custom {
  display: flex;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .dialog-content {
    padding: 1rem;
  }
  
  .custom-tab-list {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .custom-tab {
    min-width: 100%;
  }
}

/* Animation */
.actions-dialog :deep(.p-dialog) {
  animation: dialogFadeIn 0.2s ease;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>