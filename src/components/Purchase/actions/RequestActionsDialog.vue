<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import needsAssessmentTab from './components/needsAssessmentTab.vue';
import AdminDecisionTab from './components/adminDecisionTab.vue';
import warehouseTab from './components/warehouseTab.vue';
import estimateTab from './components/estimateTab.vue';


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
      <div>
            <h2 class="m-0 text-2xl font-bold">إجراءات الطلب</h2>
            <p class="m-0 text-sm mt-1 opacity-90" v-if="purchaseRequest">
              رقم الطلب: #{{ purchaseRequest.id }} - {{ purchaseRequest.title || 'طلب شراء' }}
            </p>
          </div>
    </template>

    <div class="dialog-content">
      <Tabs value="0" class="custom-tabs">
        <TabList class="custom-tab-list">
          <Tab value="0" class="custom-tab">
            <div class="tab-content">
              <div class="tab-icon admin-icon">
                <i class="fas fa-gavel"></i>
              </div>
              <div class="tab-text">
                <span class="tab-label">قرار الإدارة</span>
                <span class="tab-description">الموافقة أو الرفض</span>
              </div>
            </div>
          </Tab>
          
          <Tab value="1" class="custom-tab">
            <div class="tab-content">
              <div class="tab-icon warehouse-icon">
                <i class="fas fa-warehouse"></i>
              </div>
              <div class="tab-text">
                <span class="tab-label">رأي المخازن</span>
                <span class="tab-description">التوفر والحالة</span>
              </div>
            </div>
          </Tab>
          
          <Tab value="2" class="custom-tab">
            <div class="tab-content">
              <div class="tab-icon needs-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="tab-text">
                <span class="tab-label">بيان الحاجة</span>
                <span class="tab-description">تقييم الاحتياج</span>
              </div>
            </div>
          </Tab>
          
          <Tab value="3" class="custom-tab">
            <div class="tab-content">
              <div class="tab-icon quotes-icon">
                <i class="fas fa-file-invoice-dollar"></i>
              </div>
              <div class="tab-text">
                <span class="tab-label">عروض الأسعار</span>
                <span class="tab-description">المقارنة والاختيار</span>
              </div>
            </div>
          </Tab>
        </TabList>

        <TabPanels class="custom-tab-panels">
          <TabPanel value="0" class="custom-tab-panel">
            <AdminDecisionTab
              :id="purchaseRequest?.id"
              :items="purchaseRequest?.items ?? []"
              :purchaseRequest="purchaseRequest"
              @saved="emit('updated')"
            />
          </TabPanel>

          <TabPanel value="1" class="custom-tab-panel">
            <warehouseTab
              :id="purchaseRequest?.id"
              :items="purchaseRequest?.items ?? []"
              :purchaseRequest="purchaseRequest"
              :warehouse_checks="purchaseRequest?.warehouse_checks ?? []"
              @saved="emit('updated')"
            />
          </TabPanel>

          <TabPanel value="2" class="custom-tab-panel">
            <needsAssessmentTab
              :id="purchaseRequest?.id"
              :items="purchaseRequest?.items ?? []"
              :purchaseRequest="purchaseRequest"
              :needs_assessments="purchaseRequest?.needs_assessments ?? []"
              @saved="emit('updated')"
            />
          </TabPanel>

          <TabPanel value="3" class="custom-tab-panel">
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
          class="close-button"
          size="large"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* Dialog Customization */
.actions-dialog :deep(.p-dialog-header) {
  padding: 0;
  border-bottom: none;
}

.actions-dialog :deep(.p-dialog-content) {
  padding: 0;
  overflow: visible;
}

.actions-dialog :deep(.p-dialog-footer) {
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Dialog Header */
.dialog-header-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
  border-radius: 10px 10px 0 0;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

/* Dialog Content */
.dialog-content {
  padding: 2rem;
  min-height: 60vh;
}

/* Custom Tabs */
.custom-tabs {
  background: transparent;
}

.custom-tab-list {
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.custom-tab {
  flex: 1;
  min-width: 200px;
  border: none !important;
  background: transparent !important;
  border-radius: 10px !important;
  transition: all 0.3s ease;
  padding: 0 !important;
  margin-bottom: 10px;
}

.custom-tab :deep(button) {
  width: 100%;
  padding: 1rem !important;
  border: 2px solid transparent;
  border-radius: 10px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

/* .custom-tab:hover :deep(button) {
  background: #e9ecef;
  transform: translateY(-2px);
} */

.custom-tab :deep(button[data-p-active="true"]) {
  background: white !important;
  border-color: #667eea !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: right;
}

.tab-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tab-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.tab-label {
  font-weight: 600;
  font-size: 1rem;
}

.tab-description {
  font-size: 0.75rem;
  color: #6c757d;
}

/* Tab Panels */
.custom-tab-panels {
  background: transparent;
}

.custom-tab-panel {
  padding: 0 !important;
  background: transparent !important;
}

/* Quotes Empty State */
.quotes-empty-card :deep(.p-card-body) {
  padding: 3rem;
}

.quotes-empty-card :deep(.p-card-content) {
  padding: 0;
}

.quotes-empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.feature-item i {
  font-size: 1.5rem;
}

.feature-item span {
  font-weight: 500;
  color: #495057;
}

.add-quote-button {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border: none;
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.add-quote-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(250, 112, 154, 0.3);
}

/* Footer */
.dialog-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.close-button {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1200px) {
  .dialog-content {
    padding: 1.5rem;
  }
  
  .custom-tab-list {
    padding: 0.5rem;
  }
  
  .tab-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .tab-text {
    align-items: center;
  }
  
  .tab-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .tab-label {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .dialog-header-custom {
    padding: 1.5rem;
  }
  
  .header-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
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
  
  .tab-content {
    flex-direction: row;
    justify-content: flex-start;
    text-align: right;
  }
  
  .tab-text {
    align-items: flex-start;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .quotes-empty-state {
    padding: 1rem;
  }
  
  .empty-icon-wrapper {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
}

/* Animation for dialog entrance */
.actions-dialog :deep(.p-dialog) {
  animation: dialogSlideDown 0.3s ease-out;
}

@keyframes dialogSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>