<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="إدارة طلب الشراء"
    :draggable="false"
    @hide="closeDialog"
    :style="{ width: '80vw',}"
    dir="rtl"
    maximizable
  >
    <!-- LOADING -->
    <div v-if="isLoading" class="text-center py-8 flex flex-col items-center">
      <i class="fas fa-spinner animate-spin text-purple-600 text-3xl"/>
      <p class="mt-3 text-gray-600">جاري تحميل بيانات الطلب...</p>
    </div>

    <!-- المحتوى الرئيسي -->
    <div v-else class="card">


      <div class="mb-5">
        <Card class="border-round-lg overflow-hidden">
            <template #title>
                <div class="flex align-items-center gap-2 mb-2">
                    <Chip :label="`#${purchase?.id}`" class="text-sm" />
                    <Chip :label="purchase?.request_number" class="text-sm font-medium" />
                </div>
                
                <h1 class="text-2xl font-bold text-900 m-0 line-height-3">{{ purchase?.title }}</h1>
            </template>

            <template #content>
                <p class="text-sm text-600 line-height-3 m-0 mb-4">{{ purchase?.description }}</p>

                <Divider />

                <div class="grid">
                    <div class="col-6 md:col-3">
                        <div class="text-xs text-500 mb-2">القسم</div>
                        <div class="text-sm text-900 font-semibold">{{ purchase?.department?.name || '—' }}</div>
                    </div>

                    <div class="col-6 md:col-3">
                        <div class="text-xs text-500 mb-2">تاريخ الإنشاء</div>
                        <div class="text-sm text-900 font-semibold">{{ purchase?.created_at || '—' }}</div>
                    </div>

                    <div class="col-6 md:col-3">
                        <div class="text-xs text-500 mb-2">السعر المتوقع</div>
                        <div class="text-sm text-900 font-semibold">{{ purchase?.total_estimated_cost || '—' }}</div>
                    </div>

                    <div class="col-6 md:col-3">
                        <div class="text-xs text-500 mb-2">عدد المواد</div>
                        <div class="text-sm text-900 font-semibold">{{ purchase?.items?.length || 0 }}</div>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-content-between align-items-center flex-wrap gap-3">
                    <div class="flex align-items-center gap-2">
                        <span class="text-xs text-500">الأهمية:</span>
                        <Tag 
                            :value="priorityLabel" 
                            :severity="prioritySeverity"
                            class="font-semibold"
                        />
                    </div>

                    <Tag 
                        :value="statusData.label" 
                        :severity="statusData.severity"
                        :icon="statusData.icon"
                    />
                </div>
            </template>
        </Card>
      </div>

      <!-- STEPper -->
      <div class="">
        <Stepper v-model:value="activeStep" class="basis-[40rem]">
          <StepList>

            <!-- STEP 1 -->
            <Step v-slot="{ activateCallback, value, a11yAttrs }" :value="1" asChild>
                <Button
                v-bind="a11yAttrs.header"
                @click="() => {resetAllForms(); activateCallback();}"
                class="step-button"
                :outlined="value !== activeStep"
                :severity="value === activeStep ? 'primary' : 'secondary'"
                icon="fa-solid fa-boxes-stacked"
                label="المواد"
                />
            </Step>

            <Step v-slot="{activateCallback, value, a11yAttrs}" :value="2" asChild>
              <Button
                v-bind="a11yAttrs.header"
                @click="() => {resetAllForms(); activateCallback();}"
                class="step-button"
                :outlined="value !== activeStep"
                :severity="value === activeStep ? 'primary' : 'secondary'"
                icon="fas fa-clipboard-check"
                label="بيان الحاجة"
                />
            </Step>

            <!-- STEP 2 -->
            <Step v-slot="{ activateCallback, value, a11yAttrs }" :value="3" asChild>
                <Button
                v-bind="a11yAttrs.header"
                @click="() => {resetAllForms(); activateCallback();}"
                class="step-button"
                :outlined="value !== activeStep"
                :severity="value === activeStep ? 'primary' : 'secondary'"
                icon="pi pi-warehouse"
                label="المخازن"
                />
            </Step>

            <!-- STEP 3 -->
            <Step v-slot="{ activateCallback, value, a11yAttrs }" :value="4" asChild>
                <Button
                v-bind="a11yAttrs.header"
                @click="() => {resetAllForms(); activateCallback();}"
                class="step-button"
                :outlined="value !== activeStep"
                :severity="value === activeStep ? 'primary' : 'secondary'"
                icon="fas fa-receipt"
                label="عروض الاسعار"
                />
            </Step>

        </StepList>

          <StepPanels>
            <!-- Panel 1: معلومات الطلب -->
            <StepPanel :value="1">
 
              <PurchaseRequestItemsTable
                :items="purchase.items"
                :assessments="purchase.needs_assessments"
                :whareHouse="purchase.warehouse_checks"
                :estimates="purchase.estimates"
                :enableSelection="false"
                :paginator="true"
                :rows="5"
              />
            </StepPanel>

            <!-- Panel 2: الإجراءات -->
            <StepPanel :value="2">
              <div class="card">
                <div class="grid">

                  <!-- LEFT SIDE: MATERIALS LIST -->
                  <div class="col-12 md:col-5">
                    <h3 class="mb-3 font-semibold text-lg">
                      <i class="fa-solid fa-list-check ml-2"/> المواد الموجودة في الطلب
                    </h3>

                    <PurchaseRequestItemsTable
                      :items="purchase.items"
                      :assessments="purchase.needs_assessments"
                      v-model:selectedItem="selectedItem"
                      selectionType="radio"
                      :showWhareColumn="false"
                      :enableSelection="true"
                      :paginator="false"
                    />
                  </div>

                  <!-- RIGHT SIDE: FORM -->
                  <div class="col-12 md:col-7 pl-4 pr-2">
                    <Message 
                      v-if="!selectedItem"
                      severity="warn" 
                      class="mt-3"
                    >
                      <i class="fa-solid fa-triangle-exclamation"/>
                      اختر مادة من الجدول للبدء بإعداد بيان الحاجة
                    </Message>

                    <Message 
                      v-if="existingAssessment" 
                      severity="success" 
                      class="mb-3"
                    >
                      <i class="fa-solid fa-check-circle ml-2"></i>
                      تم تقييم هذه المادة مسبقاً — يمكن عرض التفاصيل فقط
                    </Message>

                    <h3 class="mb-3 font-semibold text-lg">
                      <i class="fa-solid fa-clipboard-check ml-2"/> نموذج بيان الحاجة
                    </h3>

                    <!-- URGENCY + NEED STATUS -->
                    <div class="grid mb-4">
                      <div class="col">
                        <label class="text-sm font-medium block mb-1">أهمية المادة</label>
                        <Select 
                          v-model="form.urgency_level"
                          :options="urgencyLevelOption"
                          optionLabel="name"
                          optionValue="value"
                          placeholder="اختر أهمية المادة"
                          class="w-full"
                          :disabled="formDisabled"
                        />
                      </div>

                      <div class="col">
                        <label class="text-sm font-medium block mb-1">حاجة المادة</label>
                        <Select 
                          v-model="form.needs_status"
                          :options="needsStatus"
                          optionLabel="name"
                          optionValue="value"
                          placeholder="اختر حاجة المادة"
                          class="w-full"
                          :disabled="formDisabled"
                        />
                      </div>
                    </div>

                    <!-- QUANTITY -->
                    <div class="mb-4">
                      <label class="text-sm font-medium block mb-1">الكمية المقترحة بعد التقييم</label>
                      <IconField>
                        <InputIcon class="fas fa-sort-numeric-up"/>
                        <InputNumber 
                          v-model="form.quantity_needed_after_assessment"
                          :min="0"
                          fluid
                          placeholder="أدخل الكمية المقترحة"
                          :disabled="formDisabled"
                        />
                      </IconField>
                    </div>

                    <!-- REASON -->
                    <div class="mb-4">
                      <label class="text-sm font-medium block mb-1">السبب</label>
                      <Textarea 
                        v-model="form.reason"
                        rows="3"
                        class="w-full"
                        style="resize: none"
                        placeholder="سبب الموافقة او الرفض ان وجد"
                        :disabled="formDisabled"
                      />
                    </div>

                    <!-- MODIFIED SPECIFICATIONS -->
                    <div class="mb-4">
                      <label class="text-sm font-medium block mb-1">المواصفات المعدلة (إن وجدت)</label>

                      <IconField class="w-full">
                        <InputIcon class="fa-solid fa-list" />
                        <InputChips 
                            v-model="form.modified_specifications"
                            placeholder="إضافة مواصفات..."
                            class="w-full"
                            :disabled="formDisabled"
                          />
                      </IconField>
                    </div>

                    <!-- RECOMMENDED ACTION -->
                    <div class="mb-4">
                      <label class="text-sm font-medium block mb-1">الإجراء المقترح</label>
                      <Textarea 
                        v-model="form.recommended_action"
                        rows="2"
                        class="w-full"
                        style="resize: none"
                        :disabled="formDisabled"
                      />
                    </div>

                    <!-- NOTES -->
                    <div class="mb-4">
                      <label class="text-sm font-medium block mb-1">ملاحظات عامة</label>
                      <Textarea 
                        v-model="form.notes"
                        rows="2"
                        class="w-full"
                        style="resize: none"
                        :disabled="formDisabled"
                      />
                    </div>

                    <!-- ADMIN SECTION -->
                     <Button 
                      label="حفظ"
                      icon="fas fa-floppy-disk"
                      class="p-button mt-3"
                      @click="savePurchaseItemNeedsNotes()"
                      :disabled="formDisabled"
                      />                    
                  </div>

                </div>
              </div>
            </StepPanel>

            <!-- Panel 3: السجل -->
            <StepPanel :value="3">
              <div class="card">
                <div class="grid">
                  <div class="col-12 md:col-5">
                    <h3 class="mb-3 font-semibold text-lg">
                      <i class="fa-solid fa-list-check ml-2"/> المواد الموجودة في الطلب
                    </h3>

                    <PurchaseRequestItemsTable
                      :items="purchase.items"
                      :assessments="purchase.needs_assessments"
                      :whareHouse="purchase.warehouse_checks"
                      v-model:selectedItem="selectedItem"
                      selectionType="radio"
                      :enableSelection="true"
                      :showStatusColumn="false"
                      :paginator="false"
                    />
                  </div>

                  <div class="col-12 md:col-7 pl-4 pr-2">
                    <Message 
                      v-if="!selectedItem"
                      severity="warn" 
                      class="mt-3"
                    >
                      <i class="fa-solid fa-triangle-exclamation"/>
                     اختر مادة من الجدول لاجراء تقرير مخزني للمادة
                    </Message>

                    <Message 
                      v-if="existingWarehouseCheck" 
                      severity="success" 
                      class="mb-3"
                    >
                      <i class="fa-solid fa-warehouse ml-2"></i>
                      تم إجراء تقرير مخزني لهذه المادة مسبقاً
                    </Message>

                    <h3 class="mb-3 font-semibold text-lg">
                      <i class="fa-solid fa-clipboard-check ml-2"/> نموذج بيان المخازن
                    </h3>

                    <div class="grid">
                      <div class="col">
                        <label class="text-sm font-medium block mb-1">حالة المادة</label>
                        <Select
                          v-model="warehouseForm.availability"
                          :options="[{name: 'متوفر', value: 'available'}, {name: 'غير متوفر', value: 'not_available'}]"
                          optionLabel="name"
                          optionValue="value"
                          placeholder="حالة المادة"
                          class="w-full"
                          :disabled="wharehouseFormDisabled"
                        />
                      </div>

                      <div class="col">
                        <label class="text-sm font-medium block mb-1">حالة المادة</label>
                        <Select
                          v-model="warehouseForm.condition"
                          :options='[
                              { name: "جديدة", value: "new" },
                              { name: "مستعملة", value: "used" },
                              { name: "متضررة", value: "damaged" }
                            ]'
                          optionLabel="name"
                          optionValue="value"
                          placeholder="اختر حالة المادة"
                          class="w-full"
                          :disabled="wharehouseFormDisabled"
                        />
                      </div>
                    </div>

                    <div class="grid">
                      <div class="col">
                        <label class="text-sm font-medium block mb-1">الكمية المتوفرة</label>
                        <IconField>
                          <InputIcon class="fas fa-boxes" />
                          <InputNumber
                            v-model="warehouseForm.available_quantity"
                            :min="0"
                            fluid
                            placeholder="أدخل الكمية المتوفرة"
                            :disabled="wharehouseFormDisabled"
                          />
                        </IconField>
                      </div>

                      <div class="col">
                        <label class="text-sm font-medium block mb-1">توصية المخزن</label>
                        <Select
                          v-model="warehouseForm.recommendation"
                          :options='[
                            { name: "تجهيز من المخزون", value: "provide_from_stock" },
                            { name: "شراء جديد", value: "purchase_new" },
                            { name: "رفض الطلب", value: "reject" }
                          ]'
                          optionLabel="name"
                          optionValue="value"
                          placeholder="اختر التوصية"
                          class="w-full"
                          :disabled="wharehouseFormDisabled"
                        />
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="text-sm font-medium block mb-1">الملاحظات</label>
                      <IconField>
                        <InputIcon class="fas fa-comment" />
                        <Textarea
                          v-model="warehouseForm.notes"
                          rows="3"
                          style="resize: none"
                          placeholder="أدخل الملاحظات"
                          class="w-full"
                          :disabled="wharehouseFormDisabled"
                        />
                      </IconField>
                    </div>

                    <Button
                      label="حفظ"
                      icon="fas fa-floppy-disk"
                      class="p-button mt-3"
                      :disabled="wharehouseFormDisabled"
                      @click="saveWarehouseCheck()"
                    />
                  </div>
                </div>
              </div>
            </StepPanel>

            <StepPanel :value="4">
              <div class="card">
                <div class="grid">
                  <div class="col-12 md:col-5">
                    <h3 class="mb-3 font-semibold text-lg">
                      <i class="fas fa-list-check ml-2"/>
                      المواد الموجودة في الطلب
                    </h3>

                    <div class="mb-3 flex gap-2">
                      <Button 
                      icon="fas fa-plus" 
                      severity="info" 
                      rounded 
                      variant="outlined" 
                      aria-label="Cancel" 
                      @click="addNewEstimateForm"
                    />

                    </div>

                    <!-- <PurchaseRequestItemsTable
                      :items="purchase.items"
                      :estimates="purchase.estimates"
                      :showEstimateColumn="true"
                      v-model:selectedItem="selectedItems"
                      selectionType="checkbox"
                      :enableSelection="true"
                      :showStatusColumn="false"
                      :showWhareColumn="false"
                      :paginator="false"
                    /> -->
                  </div>

                  <div class="col-12 md:col-7 pl-4 pr-2">
                    <!-- <Message
                      v-if="selectedItems.length === 0"
                      severity="warn"
                      class="mt-3"
                    >
                    <i class="fas fa-triangle-exclamation"/>
                    اختر مادة من الجدول لاضافة عروض اسعار
                    </Message> -->

                    <h3 class="mb-3 font-semibold text-lg">
                      <i class="fa-solid fa-clipboard-check ml-2"/> نموذج عروض الاسعار
                    </h3>

                    <div v-for="(form, index) in estimateForms" :key="index" class="border p-3 mb-4 rounded-lg shadow-sm">

  <div class="flex mb-2">
      <h4 class="font-semibold text-md flex-1">
          <i class="fas fa-receipt ml-2"></i>
          عرض سعر رقم {{ index + 1 }}
      </h4>

      <Button 
        icon="fas fa-trash-alt" 
        severity="danger" 
        rounded 
        variant="outlined" 
        aria-label="Cancel" 
        @click="removeEstimateForm(index)"
        v-if="estimateForms.length > 1"
      />
  </div>

  <!-- رقم عرض السعر -->
  <div class="mb-4">
    <label class="text-sm font-semibold block mb-1">رقم عرض السعر</label>
    <IconField>
      <InputIcon class="fa-solid fa-hashtag" />
      <InputText
        v-model="form.estimate_number"
        placeholder="رقم عرض السعر"
        fluid
      />
    </IconField>
  </div>

  <!-- تاريخ عرض السعر -->
  <div class="mb-4">
    <label class="text-sm font-semibold block mb-1">تاريخ عرض السعر</label>
    <IconField>
      <InputIcon class="fas fa-calendar" />
      <InputText
        v-model="form.estimate_date"
        placeholder="YYYY-MM-DD"
        fluid
      />
    </IconField>
  </div>

  <!-- المواد المرتبطة بعرض السعر -->
  <div class="mb-4">
    <label class="text-sm font-semibold block mb-1">المواد المرتبطة بعرض السعر</label>
    <MultiSelect
      v-model="form.items"
      :options="purchase.items"
      optionLabel="item_name"
      optionValue="id"
      placeholder="اختر المواد"
      class="w-full"
      display="chip"
      multiple
    />
  </div>

  <!-- معلومات الشركة -->
  <div class="mb-4">
    <label class="text-sm font-semibold block mb-1">اسم الشركة</label>
    <IconField>
      <InputIcon class="fas fa-shop"/>
      <InputText v-model="form.vendor_name" placeholder="اسم الشركة" fluid />
    </IconField>
  </div>

  <div class="grid mb-4">
    <div class="col">
      <label class="text-sm font-semibold block mb-1">رقم الهاتف</label>
      <IconField>
        <InputIcon class="fas fa-phone-flip"/>
        <InputText v-model="form.vendor_phone" placeholder="رقم الهاتف" fluid/>
      </IconField>
    </div>

    <div class="col">
      <label class="text-sm font-semibold block mb-1">البريد الالكتروني</label>
      <IconField>
        <InputIcon class="fas fa-envelope"/>
        <InputText v-model="form.vendor_email" placeholder="البريد الالكتروني" fluid />
      </IconField>
    </div>
  </div>

  <div class="mb-4">
    <label class="text-sm font-semibold block mb-1">العنوان</label>
    <IconField>
      <InputIcon class="fas fa-map-location-dot"/>
      <InputText v-model="form.vendor_address" placeholder="العنوان" fluid/>
    </IconField>
  </div>

  <div class="mb-4">
    <label class="text-sm font-semibold block mb-1">الملاحظات</label>
    <Textarea
      v-model="form.notes"
      rows="3"
      class="w-full"
      style="resize: none;"
      placeholder="الملاحظات"
    />
  </div>

  <!-- جدول تفاصيل المواد -->
  <DataTable :value="form.itemsDetails" class="mt-4">

    <!-- اسم المادة -->
    <Column field="item_name" header="المادة" />

    <!-- الكمية -->
    <Column header="الكمية">
      <template #body="{ data }">
        <InputNumber 
          v-model="data.quantity" 
          :min="1"
          @input="updateItemTotals(form, data)"
          placeholder="الكمية"
          fluid
        />
      </template>
    </Column>

    <!-- سعر القطعة -->
    <Column header="سعر القطعة">
      <template #body="{ data }">
        <InputNumber 
          v-model="data.unit_price"
          :min="0"
          @input="updateItemTotals(form, data)"
          fluid
        />
      </template>
    </Column>

    <!-- السعر الكلي -->
    <Column header="السعر الكلي">
      <template #body="{ data }">
        {{ data.total_price.toLocaleString() }} د.ع
      </template>
    </Column>

  </DataTable>

  <!-- المبلغ الكلي للقائمة -->
  <div class="mt-4 p-2 bg-gray-100 border-round">
    <h4 class="font-semibold text-md">
      <i class="fas fa-wallet ml-2"></i>
      المبلغ الكلي للقائمة: 
      <span class="text-green-600">
        {{ form.total_amount.toLocaleString() }}
      </span>
      د.ع
    </h4>
  </div>

</div>

                    <Button
                      label="حفظ"
                      icon="fas fa-floppy-disk"
                      class="p-button mt-3"
                      @click="saveAllEstimates"
                      :disabled="estimateForms.some(f=>f.itemsDetails.length === 0)"
                      />

                  </div>
                </div>
              </div>
            </StepPanel>
          </StepPanels>
        </Stepper>
      </div>
    </div>
  </Dialog>
</template>


<script lang="ts" setup>
// ============================================================================
// Purchase Request Dialog Logic
// - Shows purchase request details in a dialog
// - Handles needs assessment per item
// - Handles warehouse check per item
// - Controls UI state, steps, and actions
// NOTE: Logic is unchanged, only reordered and documented.
// ============================================================================

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import { ref, watch, computed, reactive } from 'vue';

import Dialog from 'primevue/dialog';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from "@primevue/core/api";
import Message from "primevue/message";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Chips from 'primevue/chips';
import Divider from "primevue/divider";
import Chip from 'primevue/chip';
import Card from 'primevue/card';

import { useToast } from "primevue/usetoast";

import PurchaseRequestItemsTable from './PurchaseRequestItemsTable.vue';
import purchaseRequestsService from './purchase-requestsService';
import warehouseService from '../warehouse/warehouseService';
import estimateService from '../estimate/estimateService';
import MultiSelect from 'primevue/multiselect';
import InputChips from 'primevue/inputchips';
import AutoComplete from 'primevue/autocomplete';
// ---------------------------------------------------------------------------
// Props & Emits
// ---------------------------------------------------------------------------

// Props interface: the dialog receives the purchase request ID from the parent
interface Props {
  purchaseId: number | null;
}

// Props instance
const props = defineProps<Props>();

// Emits: 'close' is fired when the dialog is closed
const emit = defineEmits(['close']);


// ---------------------------------------------------------------------------
// Core UI / State Refs
// ---------------------------------------------------------------------------

// Controls the visibility of the dialog
const visible = ref(false);

// Holds the full purchase request object fetched from the API
const purchase = ref<any>(null);

// Indicates when purchase data is being loaded from the API
const isLoading = ref(false);

// Tracks the active step index in the stepper UI
const activeStep = ref(1);

// Toast instance for showing success/error notifications
const toast = useToast();

// Free text note used when performing actions (approve, reject, complete)
const actionNote = ref('');

// Holds any existing needs assessment for the selected item (if found)
const existingAssessment = ref(null);

// Holds any existing warehouse check record for the selected item (if found)
const existingWarehouseCheck = ref(null);
const existingEstimateCheck = ref(null);


// ---------------------------------------------------------------------------
// Selected Item & Form Disable Logic
// ---------------------------------------------------------------------------

// Currently selected purchase request item in the items table
const selectedItem = ref<any>(null);  // لخطوة 2 و 3
const selectedItems = ref<any[]>([]); // لخطوة 4

// Computed: controls if the needs assessment form should be disabled
// - Disabled when no item is selected
// - Disabled when a warehouse check already exists for that item
const formDisabled = computed(() => {
  if (!selectedItem.value) return true;
  if (existingAssessment.value) return true; // فقط بيان الحاجة
  return false;
});

// Computed: controls if the warehouse form should be disabled
// - Disabled when no item is selected
// - Disabled when availability is not set
const wharehouseFormDisabled = computed(() => {
  if (!selectedItem.value) return true;
  if (existingWarehouseCheck.value !== null) return true;
  return false;
});

const estimateFormDisabled = computed(()=>{
  if (!selectedItem.value) return true;
  if (existingEstimateCheck.value) return true;
  return false;
})


// ---------------------------------------------------------------------------
// DataTable Filters
// ---------------------------------------------------------------------------

// Global filter for items DataTable (search box)
const itemsFilter = reactive({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});


// ---------------------------------------------------------------------------
// Dummy Logs (placeholder until backend history is connected)
// ---------------------------------------------------------------------------

// Temporary hard-coded history log to display actions done on the request
const dummyLogs = ref([
  { action: 'إنشاء الطلب', user: 'النظام', date: '2025-11-01 10:30' },
  { action: 'تعديل الوصف', user: 'أمين المخزن', date: '2025-11-02 09:15' }
]);


// ---------------------------------------------------------------------------
// Dropdown Options (Urgency & Needs Status)
// ---------------------------------------------------------------------------

// Dropdown options for urgency level of the requested item
const urgencyLevelOption = ref([
  { name: 'قليلة', value: 'low' },
  { name: 'متوسطة', value: 'medium' },
  { name: 'عالية', value: 'high' },
  { name: 'جداً مهم', value: 'critical' },
]);

// Dropdown options for needs status of the item
const needsStatus = ref([
  { name: 'بحاجة', value: 'needed' },
  { name: 'لا حاجة', value: 'not_needed' },
  { name: 'معدل', value: 'modified' },
]);


// ---------------------------------------------------------------------------
// Needs Assessment Form State
// ---------------------------------------------------------------------------

// Reactive object holding all fields for the needs assessment form
const form = reactive({
  request_item_id: null as number | null, // The related request_item_id, set when saving (or after selection)
  urgency_level: null as string | null, // Urgency level of the item (low, medium, high, critical)
  needs_status: null as string | null, // Needs status (needed, not_needed, modified)
  quantity_needed_after_assessment: null as number | null, // Final quantity needed after the assessment
  modified_specifications: [] as string[], // Modified specifications (stored as array, later joined into a comma string)
  reason: null as string | null, // Reason / justification for the decision
  recommended_action: null as string | null, // Recommended action (e.g., purchase, adjust, etc.)
  notes: null as string | null, // Additional notes
  assessment_state: null as string | null, // Internal assessment state (e.g., draft, submitted, etc.)
  admin_decision: null as string | null, // Decision taken by admin (if any)
  admin_comment: null as string | null, // Admin comment for the decision
});

/** 
 * Resets Needs Assessment form back to default values
 */
const resetAssessmentForm = () => {
  form.request_item_id = null;
  form.urgency_level = null;
  form.needs_status = null;
  form.quantity_needed_after_assessment = null;
  form.modified_specifications = [];
  form.reason = null;
  form.recommended_action = null;
  form.notes = null;
  form.assessment_state = null;
  form.admin_decision = null;
  form.admin_comment = null;
};


// ---------------------------------------------------------------------------
// Warehouse Check Form State
// ---------------------------------------------------------------------------

// Reactive object holding all fields for the warehouse check form
const warehouseForm = reactive({
  purchase_request_id: 0, // ID of the purchase request
  request_item_id: 0, // ID of the request item
  availability: "available" as string, // Availability status (available, partially_available, not_available, etc.)
  condition: null as string | null, // Condition/status of the available item in warehouse
  available_quantity: 0, // Quantity available in warehouse
  recommendation: "purchase_new" as string, // Recommendation based on stock (purchase_new, use_existing, etc.)
  notes: "" as string, // Extra notes about the warehouse check
  checked_by: 0 // ID of the user who checked the warehouse
});

/** 
 * Resets Warehouse Check form back to default values
 */
const resetWarehouseForm = () => {
  warehouseForm.purchase_request_id = 0;
  warehouseForm.request_item_id = 0;
  warehouseForm.availability = "available";
  warehouseForm.condition = null;
  warehouseForm.available_quantity = 0;
  warehouseForm.recommendation = "purchase_new";
  warehouseForm.notes = "";
  warehouseForm.checked_by = purchase.value?.user_id ?? 1;
};

interface EstimateFormItemRow {
  request_item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
}

interface EstimateFormState {
  estimate_number: string;                   // 👈 جديد
  estimate_date: string | null;

  vendor_name: string;
  vendor_phone: string | null;
  vendor_email: string | null;
  vendor_address: string | null;

  total_amount: number;
  status: "pending" | "approved" | "rejected";
  notes: string | null;

  items: number[];                // المواد المختارة
  itemsDetails: EstimateFormItemRow[]; // تفاصيل التسعير
}

const estimateForms = ref<EstimateFormState[]>([
  {
    estimate_number: "",
    estimate_date: null,

    vendor_name: "",
    vendor_phone: null,
    vendor_email: null,
    vendor_address: null,

    total_amount: 0,
    status: "pending",
    notes: null,

    items: [],
    itemsDetails: []
  }
]);

const resetEstimateForms = () => {
  estimateForms.value = [
    {
      estimate_number: "",
      estimate_date: null,

      vendor_name: "",
      vendor_phone: null,
      vendor_email: null,
      vendor_address: null,

      total_amount: 0,
      status: "pending",
      notes: null,

      items: [],
      itemsDetails: []
    }
  ];
};

/**
 * Resets all forms and clears selected item 
 */
const resetAllForms = () => {
  resetAssessmentForm();
  resetWarehouseForm();
  resetEstimateForms();
  selectedItem.value = null;
  existingAssessment.value = null;
  existingWarehouseCheck.value = null;
};


// ---------------------------------------------------------------------------
// Fetch Purchase By ID
// ---------------------------------------------------------------------------

// Fetches the purchase request by its ID from the backend
const fetchPurchase = async (id: number) => {
  isLoading.value = true;
  try {
    // Call the purchaseRequestsService to get the full purchase data
    purchase.value = await purchaseRequestsService.getById(id);
  } catch (err: any) {
    console.log(err);
  } finally {
    isLoading.value = false;
  }
};


// ---------------------------------------------------------------------------
// Watch: purchaseId Prop → Open Dialog & Fetch Data
// ---------------------------------------------------------------------------

// Whenever the parent passes a new purchaseId, open the dialog and load data
watch(
  () => props.purchaseId,
  async (id) => {
    if (!id) return;
    visible.value = true;
    activeStep.value = 1;
    resetAllForms()
    await fetchPurchase(id);
  },
  { immediate: true }
);


// ---------------------------------------------------------------------------
// Watch: selectedItem → Load Warehouse Report For That Item
// ---------------------------------------------------------------------------

// When the selected item changes, attempt to load its warehouse check report
watch(selectedItem, async (item) => {
  if (!item) {
    // Reset if no item selected
    existingWarehouseCheck.value = null;
    return;
  }

  try {
    // Try to get an existing warehouse report for this item
    const response = await warehouseService.getItemReport(
      purchase.value.id,
      item.id
    );

    // Store the existing report
    existingWarehouseCheck.value = response.data;

    // Fill warehouse form from existing report
    warehouseForm.purchase_request_id = purchase.value.id;
    warehouseForm.request_item_id = item.id;
    warehouseForm.availability = response.data.availability;
    warehouseForm.condition = response.data.condition;
    warehouseForm.available_quantity = response.data.available_quantity;
    warehouseForm.recommendation = response.data.recommendation;
    warehouseForm.notes = response.data.notes;
    warehouseForm.checked_by = response.data.checked_by;

  } catch (e) {
    // If there is no existing warehouse report for this item
    existingWarehouseCheck.value = null;

    // Initialize default values for a new warehouse report
    warehouseForm.purchase_request_id = purchase.value.id;
    warehouseForm.request_item_id = item.id;
    warehouseForm.availability = "available";
    warehouseForm.condition = null;
    warehouseForm.available_quantity = 0;
    warehouseForm.recommendation = "purchase_new";
    warehouseForm.notes = "";
    warehouseForm.checked_by = purchase.value.user_id ?? 1;
  }
});


// ---------------------------------------------------------------------------
// Save Warehouse Check (Create or Update)
// ---------------------------------------------------------------------------

// Saves the warehouse check for the currently selected item
const saveWarehouseCheck = async () => {
  if (!selectedItem.value) return alert("اختر مادة");

  // Build payload from form state and selected item
  const payload = {
    purchase_request_id: purchase.value.id,
    request_item_id: selectedItem.value.id,
    availability: warehouseForm.availability,
    condition: warehouseForm.condition,
    available_quantity: warehouseForm.available_quantity,
    recommendation: warehouseForm.recommendation,
    notes: warehouseForm.notes,
    checked_by: purchase.value.user_id ?? 1
  };

  try {
    let res;

    // If an existing warehouse check exists, update it
    if (existingWarehouseCheck.value) {
      res = await warehouseService.update(existingWarehouseCheck.value.id, payload);
    } else {
      // Otherwise create a new warehouse check
      res = await warehouseService.create(payload);
    }

    // Show success toast
    toast.add({
      severity: "success",
      summary: "نجاح",
      detail: "تم حفظ تقرير المخزن بنجاح",
      life: 3000
    });

    // Update local reference with latest data
    existingWarehouseCheck.value = res.data.data;
  } catch (err) {
    console.log(err);
    alert("حدث خطأ أثناء الحفظ");
  }
};


// ---------------------------------------------------------------------------
// Close Dialog
// ---------------------------------------------------------------------------

// Hides the dialog and notifies the parent component
const closeDialog = () => {
  visible.value = false;
  emit('close');
};


// ---------------------------------------------------------------------------
// Computed: Status Data (for main request status tag)
// ---------------------------------------------------------------------------

// Returns label, icon, and severity based on purchase.status_type
const statusData = computed(() => {
  const status = purchase.value?.status_type;
  switch (status) {
    case 'pending':
      return {
        label: 'الحالة: معلّقة',
        icon: 'fas fa-hourglass-half',
        severity: 'info'
      };
    case 'approved':
      return {
        label: 'الحالة: تمت الموافقة',
        icon: 'fas fa-check-double',
        severity: 'success'
      };
    case 'rejected':
      return {
        label: 'الحالة: مرفوضة',
        icon: 'fas fa-times-circle',
        severity: 'danger'
      };
    case 'completed':
      return {
        label: 'الحالة: مكتملة',
        icon: 'fas fa-check-circle',
        severity: 'success'
      };
    default:
      return {
        label: 'حالة غير معروفة',
        icon: 'fas fa-question-circle',
        severity: 'secondary'
      };
  }
});


// ---------------------------------------------------------------------------
// Computed: Priority Label & Severity
// ---------------------------------------------------------------------------

// Returns Arabic label for purchase.priority
const priorityLabel = computed(() => {
  switch (purchase.value?.priority) {
    case 'high':
      return 'عالية';
    case 'medium':
      return 'متوسطة';
    case 'low':
      return 'طبيعية';
    default:
      return 'غير محددة';
  }
});

// Returns PrimeVue severity value based on purchase.priority
const prioritySeverity = computed(() => {
  switch (purchase.value?.priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'secondary';
  }
});


// ---------------------------------------------------------------------------
// Helper: Check If Item Has Any Assessment
// ---------------------------------------------------------------------------

// Checks if the given item ID has at least one assessment record in purchase.needs_assessments
const checkAssessmentStatus = (itemId: number) => {
  if (!purchase.value?.needs_assessments) return false;

  return purchase.value.needs_assessments.some(
    (a: any) => a.request_item_id === itemId
  );
};

const checkWareHouseStatus = (itemId: number) => {
  if (!purchase.value?.warehouse_checks) return false;
  return purchase.value.warehouse_checks.some(
    (a:any) => a.request_item_id === itemId
  );
}


// ---------------------------------------------------------------------------
// Watch: selectedItem → Load Needs Assessment For That Item
// ---------------------------------------------------------------------------

// When the selected item changes, load its needs assessment (if exists)
watch(selectedItem, async (item) => {
  if (!item) {
    existingAssessment.value = null;
    return;
  }

  try {
    // Fetch existing assessment for this item
    const res = await purchaseRequestsService.getAssessmentByItem(
      purchase.value.id,
      item.id
    );

    existingAssessment.value = res.data.data;

    // Fill needs assessment form with existing data
    form.urgency_level = res.data.data.urgency_level;
    form.needs_status = res.data.data.needs_status;
    form.quantity_needed_after_assessment = res.data.data.quantity_needed_after_assessment;

    form.modified_specifications = res.data.data.modified_specifications
      ? res.data.data.modified_specifications.split(',')
      : [];

    form.reason = res.data.data.reason;
    form.recommended_action = res.data.data.recommended_action;
    form.notes = res.data.data.notes;
    form.assessment_state = res.data.data.assessment_state;
    form.admin_decision = res.data.data.admin_decision;
    form.admin_comment = res.data.data.admin_comment;

  } catch (error) {
    // If there is no previous assessment, reset the form to initial state
    existingAssessment.value = null;

    form.urgency_level = null;
    form.needs_status = null;
    form.quantity_needed_after_assessment = null;
    form.modified_specifications = [];
    form.reason = null;
    form.recommended_action = null;
    form.notes = null;
    form.assessment_state = null;
    form.admin_decision = null;
    form.admin_comment = null;
  }
});


// ---------------------------------------------------------------------------
// Save Needs Assessment For Selected Item
// ---------------------------------------------------------------------------

// Saves the needs assessment for the currently selected item
const savePurchaseItemNeedsNotes = async () => {
  // Ensure an item is selected
  if (!selectedItem.value) {
    alert("يجب اختيار مادة أولاً");
    return;
  }

  // Validate required fields
  if (!form.urgency_level || !form.needs_status) {
    alert("يرجى اختيار أهمية المادة وحالة الحاجة");
    return;
  }

  // Convert modified_specifications array into comma-separated string
  const specsString = Array.isArray(form.modified_specifications)
    ? form.modified_specifications.join(",")
    : (form.modified_specifications as unknown as string);

  // Current user ID (fallback to 1 if not found)
  const currentUserId = purchase.value?.user_id ?? 1;

  // Build payload for API
  const payload = {
    purchase_request_id: purchase.value.id,
    request_item_id: selectedItem.value.id,

    urgency_level: form.urgency_level,
    needs_status: form.needs_status,

    quantity_needed_after_assessment: form.quantity_needed_after_assessment,

    modified_specifications: specsString,
    reason: form.reason,
    recommended_action: form.recommended_action,
    notes: form.notes,

    assessment_state: form.assessment_state ?? "draft",

    assessed_by: currentUserId,

    admin_decision: form.admin_decision,
    admin_comment: form.admin_comment,
  };

  try {
    // Save assessment via service
    const res = await purchaseRequestsService.saveNeedsAssessment(payload);

    // Show success message
    toast.add({
      severity: "success",
      summary: "رسالة نجاح",
      detail: `تم حفظ التقرير الخاص بالمادة ${selectedItem.value.item_name}`,
      life: 3000
    });

    // Reset form fields after successful save
    form.request_item_id = null;
    form.urgency_level = null;
    form.needs_status = null;
    form.quantity_needed_after_assessment = null;
    form.modified_specifications = [];
    form.reason = null;
    form.recommended_action = null;
    form.notes = null;
    form.assessment_state = null;
    form.admin_decision = null;
    form.admin_comment = null;

    // Clear selected item
    selectedItem.value = null;
  } catch (error: any) {
    console.error(error);

    if (error.response?.data?.errors) {
      alert("خطأ في البيانات المدخلة");
      console.log(error.response.data.errors);
    } else {
      alert("حدث خطأ أثناء الحفظ");
    }
  }
};

const saveAllEstimates = async () => {
  if (estimateForms.value.length === 0) {
    toast.add({
      severity: "warn",
      summary: "رسالة خطأ",
      detail: "لا توجد عروض أسعار لاضافتها",
      life: 3000,
    });
    return;
  }

  try {
    for (const form of estimateForms.value) {

      // التحقق الأساسي
      if (!form.items || form.items.length === 0) {
        toast.add({
          severity: "warn",
          summary: "تنبيه",
          detail: "اختر المواد لعرض السعر",
          life: 3000,
        });
        continue;
      }

      if (!form.estimate_number) {
        form.estimate_number = Date.now().toString(); // auto number
      }

      if (!form.vendor_name) {
        toast.add({
          severity: "warn",
          summary: "تنبيه",
          detail: "اسم الشركة مطلوب",
          life: 3000,
        });
        continue;
      }

      // تجهيز بيانات المواد (itemsDetails)
      const itemsData = form.itemsDetails.map((row) => ({
        request_item_id: row.request_item_id,
        quantity: row.quantity,
        unit_price: row.unit_price,
        total_price: row.total_price,
        notes: row.notes ?? null,
      }));

      // Payload
      const payload = {
        estimate_number: form.estimate_number,
        estimate_date: form.estimate_date,

        vendor_name: form.vendor_name,
        vendor_phone: form.vendor_phone,
        vendor_email: form.vendor_email,
        vendor_address: form.vendor_address,

        total_amount: form.total_amount,
        status: form.status,
        notes: form.notes,

        items: itemsData,
      };

      // إرسال البيانات
      await estimateService.createWithItems(purchase.value.id, payload);
    }

    toast.add({
      severity: "success",
      summary: "تم الحفظ",
      detail: "تم حفظ جميع عروض الأسعار بنجاح",
      life: 3000,
    });

  } catch (err: any) {
    console.log(err);
    toast.add({
      severity: "danger",
      summary: "خطأ",
      detail: "حدث خطأ أثناء حفظ عروض الأسعار",
      life: 3000,
    });
  } finally {
    resetAllForms();
  }
};

// احذف أي watcher يراقب estimateForms كاملاً

const registerEstimateWatcher = (form: EstimateFormState) => {
  watch(
    () => form.items,
    (newItems) => {
      if (!newItems || newItems.length === 0) {
        form.itemsDetails = [];
        form.total_amount = 0;
        return;
      }

      form.itemsDetails = newItems.map((id) => {
        const item = purchase.value.items.find((x) => x.id === id);

        return {
          request_item_id: id,
          item_name: item?.item_name ?? "—",
          quantity: 1,
          unit_price: 0,
          total_price: 0,
          notes: "",
        };
      });

      form.total_amount = form.itemsDetails.reduce(
        (sum, r) => sum + r.total_price,
        0
      );
    },
    { immediate: true }
  );
};

const updateItemTotals = (form: EstimateFormState, row: EstimateFormItemRow) => {
  row.total_price = row.unit_price * row.quantity;

  form.total_amount = form.itemsDetails.reduce(
    (sum, r) => sum + r.total_price,
    0
  );
};

const addNewEstimateForm = () => {
  const newForm: EstimateFormState = {
    estimate_number: "",
    estimate_date: null,

    vendor_name: "",
    vendor_phone: null,
    vendor_email: null,
    vendor_address: null,

    total_amount: 0,
    status: "pending",
    notes: null,

    items: [],
    itemsDetails: []
  };

  estimateForms.value.push(newForm);

  // 🔥 أهم شيء
  registerEstimateWatcher(newForm);
};

const removeEstimateForm = (index: number) => {
  estimateForms.value.splice(index, 1);
}

// ---------------------------------------------------------------------------
// Action Handlers (currently only logging, to be connected to API later)
// ---------------------------------------------------------------------------

const selectAllItemsForEstimate = ()=>{
  selectedItems.value = [...purchase.value.items];
};

// Approve action handler (will call API to set status to 'approved')
const handleApprove = () => {
  console.log('Approve clicked', purchase.value?.id, actionNote.value);
  // TODO: call API to update status to 'approved'
};

// Reject action handler (will call API to set status to 'rejected')
const handleReject = () => {
  console.log('Reject clicked', purchase.value?.id, actionNote.value);
  // TODO: call API to update status to 'rejected'
};

// Complete action handler (will call API to set status to 'completed')
const handleComplete = () => {
  console.log('Complete clicked', purchase.value?.id, actionNote.value);
  // TODO: call API to update status to 'completed'
};


</script>

<style scoped>
.card {
  @apply p-4;
}
</style>