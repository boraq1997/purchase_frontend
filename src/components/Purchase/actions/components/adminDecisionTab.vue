<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import purchaseRequestsService from '../../services/purchaseRequests.service';
import FloatLabel from 'primevue/floatlabel';

// Props
const props = defineProps<{
  id: number | null;
  items: any[];
  purchaseRequest: any;
}>();
const emit = defineEmits<{
  (e: 'saved', payload?: any): void;
}>();

// Reactive state
const localRequest = reactive({ ...props.purchaseRequest });
const itemDecisions = ref<any[]>([]);
const decision = ref<'approved' | 'rejected' | null>(null);
const rejectReason = ref('');

const toast = useToast();

// Watchers
watch(() => props.purchaseRequest, (v) => Object.assign(localRequest, v), { immediate: true });
watch(() => props.items, (v) => {
  itemDecisions.value = (v ?? []).map(item => ({
    id: item.id ?? null,
    item_name: item.item_name ?? item.name ?? '',
    quantity: item.quantity ?? item.quantity ?? '',
    decision: 'approved',
    reason: ''
  }));
}, { immediate: true });

watch(
  () => localRequest.status_type,
  (status) => {
    if (!status) return;

    // اختيار القرار تلقائياً
    decision.value = status === 'approved' || status === 'rejected'
      ? status
      : null;

    // تعبئة سبب الرفض إن وجد
    if (status === 'rejected') {
      rejectReason.value = localRequest.rejected_reason ?? '';
    } else {
      rejectReason.value = '';
    }
  },
  { immediate: true }
);

// Fetch latest request on mounted
onMounted(async () => {
  if (!props.id) return;
  try {
    const updateRequest = await purchaseRequestsService.getById(props.id);
    Object.assign(localRequest, updateRequest);
  } catch (err) {
    console.error('Failed to fetch purchase request:', err);
  }
});

// Submit admin decision
async function submitDecision() {
  if (!props.id) return toast.add({ severity: 'error', summary: 'خطأ', detail: 'رقم الطلب غير موجود', life: 3000 });
  
  try {
    const payload = {
      status: decision.value,
      note: decision.value === 'rejected' ? rejectReason.value : null,
      items: itemDecisions.value.map(it => ({
        id: it.id,
        decision: it.decision,
        reason: it.reason || null
      }))
    };

    if (typeof purchaseRequestsService.updateStatus === 'function') {
      if (payload.status) {
        await purchaseRequestsService.updateStatus(props.id, payload.status, payload.note);
      }
    } else {
      await purchaseRequestsService.update(props.id, { status_type: payload.status ?? undefined } as any);
    }

    toast.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم حفظ قرار الإدارة بنجاح', life: 2500 });

    const updatedRequest = await purchaseRequestsService.getById(props.id);
    Object.assign(localRequest, updatedRequest);
    emit('saved', { ...payload, updatedRequest });

  } catch (err: any) {
    console.error('save admin decision error', err);
    toast.add({ severity: 'error', summary: 'فشل الحفظ', detail: err?.response?.data?.message ?? err.message ?? 'حدث خطأ غير متوقع', life: 4000 });
  }
}

// Get status info
const getStatusInfo = (status: string) => {
  switch(status) {
    case 'approved':
      return { label: 'تمت الموافقة', severity: 'success', icon: 'pi-check-circle' };
    case 'rejected':
      return { label: 'تم الرفض', severity: 'danger', icon: 'pi-times-circle' };
    default:
      return { label: 'قيد الانتظار', severity: 'warning', icon: 'pi-clock' };
  }
};
</script>

<template>
  <div class="admin-decision-container" dir="rtl">
    <div class="grid">
      
      <!-- الحالة الحالية للطلب -->
      <div class="col-12 lg:col-6">
        <Card class="status-card shadow-3">
          <template #header>
            <div class="status-header">
              <div class="flex align-items-center gap-3">
                <div class="icon-wrapper">
                  <i class="fas fa-info-circle"></i>
                </div>
                <div>
                  <h3 class="m-0 text-xl font-bold">حالة الطلب الحالية</h3>
                  <p class="m-0 text-sm mt-1 opacity-90">معلومات حالة الطلب والقرار المتخذ</p>
                </div>
              </div>
            </div>
          </template>

          <template #content>
            <div class="status-content">
              <!-- الحالة -->
              <div class="status-badge-wrapper">
                <Tag 
                  :value="getStatusInfo(localRequest.status_type).label"
                  :severity="getStatusInfo(localRequest.status_type).severity"
                  :icon="`pi ${getStatusInfo(localRequest.status_type).icon}`"
                  class="status-badge"
                />
              </div>

              <!-- سبب الرفض -->
              <div v-if="localRequest.rejected_reason" class="rejection-reason">
                <div class="flex align-items-start gap-2">
                  <i class="fas fa-exclamation-triangle text-red-500 mt-1"></i>
                  <div>
                    <strong class="text-red-700">سبب الرفض:</strong>
                    <p class="mt-1 mb-0 text-red-600">{{ localRequest.rejected_reason }}</p>
                  </div>
                </div>
              </div>

              <Divider v-if="localRequest.status_action_by || localRequest.status_date" />

              <!-- تفاصيل القرار -->
              <div class="decision-details">
                <div v-if="localRequest.status_action_by" class="detail-item">
                  <i class="fas fa-user text-primary"></i>
                  <div>
                    <span class="label">تم بواسطة:</span>
                    <span class="value">{{ localRequest.status_action_by.name }}</span>
                    <Tag v-if="localRequest.status_role" :value="localRequest.status_role" severity="secondary" class="mr-2" />
                  </div>
                </div>

                <div v-if="localRequest.status_date" class="detail-item">
                  <i class="fas fa-calendar-alt text-primary"></i>
                  <div>
                    <span class="label">التاريخ:</span>
                    <span class="value">{{ new Date(localRequest.status_date).toLocaleString('ar-EG') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- قرار الطلب الجديد -->
      <div class="col-12 lg:col-6">
        <Card class="decision-card shadow-3">
          <template #header>
            <div class="decision-header">
              <div class="flex align-items-center gap-3">
                <div class="icon-wrapper">
                  <i class="fas fa-gavel"></i>
                </div>
                <div>
                  <h3 class="m-0 text-xl font-bold">قرار الإدارة</h3>
                  <p class="m-0 text-sm mt-1 opacity-90">اتخذ القرار المناسب للطلب</p>
                </div>
              </div>
            </div>
          </template>

          <template #content>
            <div class="decision-content">
              
              <FloatLabel variant="on">
                <Select
                  v-model="decision"
                  id="decision_field"
                  :options="[
                    { label: 'موافقة', value: 'approved', icon: 'pi-check' },
                    { label: 'رفض', value: 'rejected', icon: 'pi-times' }
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full decision-select"
                >
                </Select> 
                <label class="form-label" for="decision_field">
                  <i class="fas fa-balance-scale text-primary"></i>
                  حالة الطلب <span class="required">*</span>
                </label>
              </FloatLabel>
                

              <!-- سبب الرفض -->
              <div v-if="decision === 'rejected'" class="reject-reason-section">
                <Divider />

                <FloatLabel variant="on">
                  <Textarea 
                    v-model="rejectReason" 
                    id="rejectReson_field"
                    autoResize 
                    rows="4" 
                    class="w-full" 
                    :maxlength="500"
                  />
                  <small class="text-500">{{ rejectReason.length }}/500</small>
                  <label for="rejectReson_field" class="form-label">
                    <i class="fas fa-comment-dots text-primary"></i>
                    سبب الرفض <span class="required">*</span>
                  </label>
                </FloatLabel>
                
                
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
    <!-- زر الحفظ -->
    <div class="flex justify-content-end mt-4">
      <Button 
        label="حفظ القرار النهائي" 
        icon="pi pi-check" 
        @click="submitDecision"
        class="save-button"
        size="large"
      />
    </div>
  </div>
</template>

<style scoped>
.admin-decision-container {
  padding: 1rem;
}

/* Card Styles */
.status-card :deep(.p-card-header),
.decision-card :deep(.p-card-header),
.items-decision-card :deep(.p-card-header) {
  padding: 0;
}

.status-card :deep(.p-card-body),
.decision-card :deep(.p-card-body),
.items-decision-card :deep(.p-card-body) {
  padding: 1.5rem;
}

.status-card :deep(.p-card-content),
.decision-card :deep(.p-card-content),
.items-decision-card :deep(.p-card-content) {
  padding: 0;
}

/* Card Headers */
.status-header {
  background: linear-gradient(14deg, #1b1645 0%, #38333c 100%);
  padding: .5rem;
  color: white;
  border-radius: 10px 10px 0 0;
}

.decision-header {
  background: linear-gradient(14deg, #1b1645 0%, #38333c 100%);
  padding: 0.5rem;
  color: white;
  border-radius: 10px 10px 0 0;
}

.items-header {
  background: linear-gradient(14deg, #1b1645 0%, #38333c 100%);
  padding: 0.5rem;
  color: white;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* Status Content */
.status-content {
  padding: 0.5rem 0;
}

.status-badge-wrapper {
  margin-bottom: 1.5rem;
}

.status-badge {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.rejection-reason {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.decision-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.detail-item:hover {
  transform: translateX(-2px);
}

.detail-item i {
  font-size: 1.25rem;
  margin-top: 2px;
}

.detail-item .label {
  font-weight: 600;
  color: #495057;
  margin-left: 0.5rem;
}

.detail-item .value {
  color: #6c757d;
}

/* Decision Content */
.decision-content {
  padding: 0.5rem 0;
}

.reject-reason-section {
  margin-top: 1rem;
}

/* Form Labels */
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
}

.form-label i {
  margin-left: 0.5rem;
}

.required {
  color: #e74c3c;
  margin-right: 2px;
}

/* Select Styles */
.decision-select,
.item-decision-select {
  transition: all 0.2s ease;
}

:deep(.p-select),
:deep(.p-inputtext),
:deep(.p-textarea) {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

:deep(.p-select:focus),
:deep(.p-inputtext:focus),
:deep(.p-textarea:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

/* DataTable Styles */
.custom-datatable :deep(.p-datatable-thead > tr > th) {
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  padding: 1rem;
}

.custom-datatable :deep(.p-datatable-tbody > tr) {
  transition: all 0.2s ease;
}

.reject-textarea-wrapper {
  position: relative;
}

.char-count {
  display: block;
  text-align: left;
  color: #6c757d;
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

/* Tags */
:deep(.p-tag) {
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
}

/* Divider */
:deep(.p-divider) {
  margin: 1rem 0;
}

/* Responsive */
@media (max-width: 992px) {
  .admin-decision-container {
    padding: 0.5rem;
  }
  
  .status-header,
  .decision-header,
  .items-header {
    padding: 1rem;
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
  
  .items-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .detail-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .custom-datatable :deep(.p-datatable-thead > tr > th),
  .custom-datatable :deep(.p-datatable-tbody > tr > td) {
    padding: 0.75rem 0.5rem;
  }
}
</style>