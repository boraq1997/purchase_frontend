<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import EstimateService from '../../../estimate/estimateService'; // تحقق من المسار
import VendorsService from '../../../vendors/VendorsService';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';



const props = defineProps<{ purchaseRequest: any }>();
const emit = defineEmits<{ (e: 'saved'): void }>();
const toast = useToast();
const allVendors = ref<any[]>([]);

const newEstimateForms = ref<Array<any>>([]);
const expandedEstimates = ref<any[]>([]);
// Computed: تتبع المواد التي لها عروض سعر
const itemsWithEstimates = computed(() => {
    const itemIds = new Set<number>();
    props.purchaseRequest?.items?.forEach((item: any) => {
        if (item.estimate && item.estimate.length > 0) itemIds.add(item.id);
    });
    newEstimateForms.value.forEach(form => {
        form.itemsDetails?.forEach((it: any) => itemIds.add(it.id));
    });
    return itemIds;
});

function addNewEstimateForm() {
    newEstimateForms.value.push({
        id: Date.now(),
        estimate_date: '',
        items: [] as number[],
        itemsDetails: [] as any[],
        vendor_id: null,
        notes: '',
        total_amount: 0,
    });
}

function removeEstimateForm(index: number) { newEstimateForms.value.splice(index, 1); }

function updateItemTotals(form: any) {
    let total = 0;
    form.itemsDetails.forEach((item: any) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        item.total_price = quantity * unitPrice;
        total += item.total_price;
    });
    form.total_amount = total;
}

async function saveAllEstimates() {
    const purchaseRequestId = props.purchaseRequest?.id;
    if (!purchaseRequestId) return toast.add({ severity: 'warn', summary: 'خطأ', detail: 'معرف طلب الشراء غير موجود', life: 3000 });
    if (newEstimateForms.value.length === 0) return toast.add({ severity: 'warn', summary: 'تحقق', detail: 'الرجاء إضافة عرض سعر واحد على الأقل', life: 3000 });

    try {
        for (const form of newEstimateForms.value) {
            if (!form.vendor_id) throw new Error(`اسم البائع مطلوب في عرض السعر #${newEstimateForms.value.indexOf(form) + 1}`);
            if (form.itemsDetails.length === 0) throw new Error(`اختر مادة واحدة على الأقل في عرض السعر #${newEstimateForms.value.indexOf(form) + 1}`);

            const payload = {
                vendor_id: form.vendor_id,
                estimate_date: form.estimate_date,
                total_amount: form.total_amount,
                notes: form.notes || null,
                items: form.itemsDetails.map((it: any) => ({
                    request_item_id: it.id,
                    quantity: it.quantity,
                    unit_price: it.unit_price,
                })),
            };
            await EstimateService.createWithItems(purchaseRequestId, payload);
        }
        toast.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ عروض الأسعار بنجاح', life: 3000 });
        newEstimateForms.value = [];
        emit('saved');
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'خطأ', detail: err.message || 'حدث خطأ أثناء الحفظ', life: 4000 });
    }
}

// Watcher: تحديث تفاصيل المواد عند اختيارها
watch(newEstimateForms, (forms) => {
    forms.forEach(form => {
        if (form.isWatched) return;
        watch(() => form.items, (selectedIds) => {
            const currentMap = new Map(form.itemsDetails.map((d: any) => [d.id, d]));
            const newDetails: any[] = [];
            selectedIds.forEach((id: number) => {
                if (currentMap.has(id)) newDetails.push(currentMap.get(id));
                else {
                    const item = props.purchaseRequest.items.find((i: any) => i.id === id);
                    if (item) newDetails.push({ ...item, quantity: 1, unit_price: 0, total_price: 0 });
                }
            });
            form.itemsDetails = newDetails;
            updateItemTotals(form);
        }, { deep: true });
        form.isWatched = true;
    });
}, { deep: true });

async function getAllVendors() {
  try {
    const response = await VendorsService.getAll();
    allVendors.value = response;
  } catch (err: any) {
    console.log(err)
    toast.add({
      severity: "error",
      summary: "رسالة خطاء",
      detail: "حدث خطاء اثناء جلب بيانات الباعة",
      life: 3000
    })
  }
}

onMounted(()=>{
  getAllVendors()
})
</script>

<template>
<div class="estimates-container" dir="rtl">
  <div class="grid" v-if="purchaseRequest">
    <!-- Left Column: Items List with Needs/Warehouse/Estimate -->
    <div class="col-12 lg:col-4">
      <Card class="items-card shadow-3">
        <template #header>
          <div class="card-header-custom">
            <div class="flex align-items-center gap-2">
              <i class="fas fa-boxes-stacked text-2xl"></i>
              <h3 class="m-0 text-xl font-bold">مواد الطلب</h3>
            </div>
            <Tag :value="`${purchaseRequest.items.length} مادة`" severity="info" />
          </div>
        </template>
        <template #content>
          <DataTable :value="purchaseRequest.items" stripedRows class="custom-datatable" :paginator="purchaseRequest.items.length > 10" :rows="10">
            <Column field="item_name" header="اسم المادة" />
            <Column field="quantity" header="الكمية">
              <template #body="{ data }"><Tag :value="data.quantity" severity="secondary" /></template>
            </Column>
            <Column header="عدد عروض السعر">
              <template #body="{ data }">
                <Tag v-if="data.estimate && data.estimate.length > 0" :value="data.estimate.length + ' عرض'" severity="success" icon="pi pi-check" />
                <Tag v-else value="لا يوجد عرض" severity="warn" style="font-size: 12px;" icon="pi pi-clock" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Right Column: New Estimate Forms -->
    <div class="col-12 lg:col-8">
      <div class="flex justify-content-between align-items-center mb-4">
        <h3 class="m-0 text-2xl font-bold text-800">إضافة عروض أسعار جديدة</h3>
        <Button label="إضافة عرض سعر" icon="pi pi-plus" @click="addNewEstimateForm" />
      </div>

      <Card v-if="newEstimateForms.length === 0" class="empty-state-card shadow-2">
        <template #content>
          <div class="empty-state text-center">
            <i class="fas fa-file-invoice-dollar text-6xl text-400 mb-4"></i>
            <h3 class="text-2xl font-bold text-700 mb-2">لم تتم إضافة عروض أسعار جديدة</h3>
            <p class="text-600 m-0">انقر على زر "إضافة عرض سعر" لإنشاء نموذج.</p>
          </div>
        </template>
      </Card>

      <div v-for="(form, index) in newEstimateForms" :key="form.id" class="mb-4">
          <Card class="estimate-card shadow-3" style="border-left: 4px solid var(--orange-500)">
            <template #header>
              <div class="estimate-header">
                <div class="flex align-items-center gap-3">
                  <div class="icon-wrapper">
                    <i class="fas fa-plus"/>
                  </div>
                  <div>
                    <h3 class="m-0 text-xl font-bold">عرض سعر جديد #{{ index + 1 }}</h3>
                  </div>
                </div>
                <Button icon="fas fa-trash-alt" severity="danger" rounded text @click="removeEstimateForm(index)" />
              </div>
            </template>
            <template #content>
              <div class="form-grid">
                <div class="form-section">
                  <h4 class="section-title"><i class="fas fa-store text-primary"/>بيانات المورد</h4>

                  <div class="grid">

                    <div class="col-12 md:col-6">
                      <label class="form-label">اسم الشركة <span class="required">*</span></label>
                      <Select v-model="form.vendor_id" :options="allVendors" optionLabel="name" optionValue="id" placeholder="اختر اسم الشركة" fluid/>
                    </div>

                    <div class="col-12 md:col-6">
                      <label class="form-label">تاريخ عرض السعر</label>
                      <DatePicker v-model="form.estimate_date" showIcon fluid iconDisplay="input" />
                    </div>

                  </div>
                </div>
                <Divider />
                <div class="form-section">
                  <h4 class="section-title"><i class="fas fa-tasks text-primary"/>تفاصيل المواد والأسعار</h4>
                  
                  <label class="form-label">اختر المواد <span class="required">*</span></label>

                  <MultiSelect v-model="form.items" :options="purchaseRequest.items" optionLabel="item_name" optionValue="id" placeholder="اختر المواد" class="w-full mb-4" display="chip" />
                  <DataTable :value="form.itemsDetails" v-if="form.itemsDetails.length > 0" class="mt-2">
                    <Column field="item_name" header="المادة" />
                    <Column header="الكمية" style="width: 120px;"><template #body="{ data }"><InputNumber v-model="data.quantity" :min="1" @update:modelValue="updateItemTotals(form)" class="w-full" /></template></Column>
                    <Column header="سعر الوحدة" style="width: 150px;"><template #body="{ data }"><InputNumber v-model="data.unit_price" :min="0" @update:modelValue="updateItemTotals(form)" class="w-full" mode="decimal" :minFractionDigits="2" /></template></Column>
                    <Column header="السعر الكلي" style="width: 150px;"><template #body="{ data }"><span class="font-bold">{{ (data.total_price || 0).toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD' }) }}</span></template></Column>
                  </DataTable>
                  <div class="mt-4 p-3 border-round flex justify-content-between align-items-center">
                    <h4 class="font-bold text-lg m-0">المبلغ الإجمالي للعرض:</h4>
                    <span class="font-bold text-xl text-green-600">{{ (form.total_amount || 0).toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD' }) }}</span>
                  </div>
                </div>
                <Divider />
                <div class="form-section"><h4 class="section-title"><i class="fas fa-comment-dots text-primary"></i>ملاحظات إضافية</h4><Textarea v-model="form.notes" rows="4" class="w-full"/></div>
              </div>
            </template>
          </Card>
        </div>

      <div v-if="newEstimateForms.length > 0" class="flex justify-content-end gap-2 mt-4">
        <Button label="حفظ كل العروض الجديدة" icon="pi pi-check" @click="saveAllEstimates" size="large" />
      </div>
    </div>
  </div>

  <!-- Existing Estimates Table -->
  <div class="mt-5" v-if="purchaseRequest?.estimates?.length > 0">
    <Card class="shadow-3">
      <template #header>
        <div class="card-header-custom">
          <div class="flex align-items-center gap-2">
            <i class="fas fa-history text-2xl"></i>
            <h3 class="m-0 text-xl font-bold">عروض الأسعار المحفوظة مسبقًا</h3>
          </div>
        </div>
      </template>
      <template #content>
      
        <DataTable 
          :value="purchaseRequest.estimates" 
          stripedRows 
          responsiveLayout="scroll"
          dataKey="id"
        >
        
          <Column field="vendor_name" header="اسم المورد" />
          <Column field="vendor_phone" header="رقم الهاتف"/>
          <Column field="vendor_email" header="البريد الالكتروني"/>
          <Column field="vendor_address" header="العنوان"/>
          <Column field="estimate_date" header="التاريخ">
            <template #body="{ data }">{{ new Date(data.estimate_date).toLocaleDateString() }}</template>
          </Column>
          
          <Column field="total_amount" header="المبلغ الإجمالي">
            <template #body="{ data }">
              <span class="font-bold text-green-600">
                {{ Number(data.total_amount).toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD' }) }}
              </span>
            </template>
          </Column>
          <Column field="status" header="الحالة">
            <template #body="{ data }"><Tag :value="data.status" /></template>
          </Column>
        </DataTable>

      </template>
    </Card>
  </div>
</div>
</template>
<style scoped>
/* Styles remain unchanged */
.estimates-container { 
    padding: 1rem; 
}

.items-card :deep(.p-card-body), 
.estimate-card :deep(.p-card-body), 
.empty-state-card :deep(.p-card-body) {
     padding: 0; 
}

.items-card :deep(.p-card-content), 
.estimate-card :deep(.p-card-content), 
.empty-state-card :deep(.p-card-content) {
     padding: 1.5rem; 
}

.card-header-custom, 
.estimate-header {
     background: linear-gradient(14deg, #1b1645 0%, #38333c 100%); 
     padding: 0.5rem; 
     display: flex; 
     justify-content: space-between; 
     align-items: center; 
     color: white; 
     border-radius: 10px 10px 0 0; 
}

.icon-wrapper {
    width: 50px; 
    height: 50px; 
    background: rgba(255, 255, 255, 0.1); 
    border-radius: 12px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 1.5rem; 
}

.custom-datatable :deep(.p-datatable-thead > tr > th) {
     border-bottom: 1px solid #e9ecef; 
     font-weight: 600; 
}

.empty-state {
    text-align: center; 
    padding: 4rem 2rem; 
    border: 2px dashed #414141; 
    border-radius: 10px; 
}

.empty-state i {
     animation: float 3s ease-in-out infinite; 
}

@keyframes float {
    0%, 100% {
         transform: translateY(0); 
        } 
    50% {
         transform: translateY(-10px); 
        } 
}

.form-grid {
    padding: 0.5rem 0; 
}

.form-section { 
    margin-bottom: 1rem; 
}

.section-title {
    font-size: 1.1rem; 
    font-weight: 700; 
    margin-bottom: 1.5rem; 
    display: flex; 
    align-items: center; 
    gap: 0.75rem; 
    border-bottom: 1px solid #e9ecef; 
    padding-bottom: 0.75rem; 
}

.form-label {
    display: block; 
    margin-bottom: 0.5rem; 
    font-weight: 800; 
    font-size: 0.95rem; 
}

.required { 
    color: #e74c3c; 
    margin-right: 2px; 
}

:deep(.p-inputtext), :deep(.p-inputnumber-input), :deep(.p-multiselect), :deep(.p-textarea) { border-radius: 8px; border: 1px solid #ced4da; transition: all 0.2s ease; }
:deep(.p-inputtext:focus), :deep(.p-inputnumber-input:focus), :deep(.p-multiselect.p-focus), :deep(.p-textarea:focus) { border-color: #667eea; box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.5); }
:deep(.p-tag) { font-weight: 500; padding: 0.4rem 0.8rem; border-radius: 6px; }
:deep(.p-divider) { margin: 2rem 0; }
</style>