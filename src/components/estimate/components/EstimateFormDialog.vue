<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        :style="{ width: '60vw', maxWidth: '920px' }"
        modal
        @hide="emit('reset')"
        dir="rtl"
        :pt="{
            header: { class: 'pb-3 border-bottom-1 border-200' },
            content: { class: 'pt-4 pb-2' },
            footer: { class: 'pt-3 border-top-1 border-200' }
        }"
    >
        <!-- ─── Header ───────────────────────────────────────────────────────── -->
        <template #header>
            <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center border-round-xl"
                    style="width:42px;height:42px;background:var(--primary-50)">
                    <i class="fas fa-file-invoice-dollar text-xl" style="color:var(--primary-500)"/>
                </div>
                <div>
                    <h2 class="m-0 text-900 font-semibold text-xl">
                        {{ isEditMode ? 'تعديل عرض السعر' : 'إضافة عرض سعر جديد' }}
                    </h2>
                    <p class="m-0 text-500 text-sm mt-1">
                        {{ isEditMode ? 'قم بتحديث بيانات عرض السعر' : 'أدخل بيانات عرض السعر الجديد' }}
                    </p>
                </div>
            </div>
        </template>

        <div class="flex flex-column gap-4">

            <!-- ─── Section 1: Vendor ─────────────────────────────────────────── -->
            <div class="surface-50 border-round-xl p-4 border-1 border-200">
                <div class="flex align-items-center gap-2 mb-3">
                    <i class="fas fa-store text-primary-500"/>
                    <span class="font-semibold text-700 text-sm">بيانات البائع</span>
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <FloatLabel variant="on">
                            <Select v-model="estimateForm.vendor_id" id="vendor_id"
                                :options="allVendors" optionLabel="name" optionValue="id" fluid>
                                <template #option="{ option }">
                                    <div class="flex align-items-center gap-2">
                                        <div class="flex align-items-center justify-content-center border-round-lg border-1 border-200"
                                            style="width:32px;height:32px;background:var(--surface-50)">
                                            <i class="fas fa-store text-sm text-500"/>
                                        </div>
                                        <span>{{ option.name }}</span>
                                    </div>
                                </template>
                            </Select>
                            <label for="vendor_id">اختر البائع</label>
                        </FloatLabel>
                    </div>
                    <Button
                        :icon="showAddVendorForm ? 'fas fa-times' : 'fas fa-plus'"
                        :severity="showAddVendorForm ? 'secondary' : 'primary'"
                        v-tooltip.bottom="showAddVendorForm ? 'إلغاء' : 'إضافة بائع جديد'"
                        variant="outlined" class="border-round-lg flex-shrink-0"
                        style="width:46px;height:46px"
                        @click="emit('update:showAddVendorForm', !showAddVendorForm)"
                    />
                </div>

                <Transition name="slide-fade">
                    <div v-if="showAddVendorForm" class="mt-3 surface-card border-round-xl border-1 border-primary-200 p-4"
                        style="background:var(--primary-50)">
                        <div class="flex align-items-center gap-2 mb-4">
                            <i class="fas fa-circle-plus text-primary-500"/>
                            <span class="font-semibold text-primary-700">إضافة بائع جديد</span>
                        </div>
                        <div class="grid">
                            <div class="col-12">
                                <FloatLabel variant="on">
                                    <InputText id="vendor_name" v-model="vendorForm.name" fluid />
                                    <label for="vendor_name"><i class="fas fa-store ml-1"/>اسم البائع</label>
                                </FloatLabel>
                            </div>
                            <div class="col-12 md:col-6">
                                <FloatLabel variant="on">
                                    <InputText id="vendor_phone1" v-model="vendorForm.phone1" fluid />
                                    <label for="vendor_phone1"><i class="fas fa-phone-flip ml-1"/>رقم الهاتف</label>
                                </FloatLabel>
                            </div>
                            <div class="col-12 md:col-6">
                                <FloatLabel variant="on">
                                    <InputText id="vendor_phone2" v-model="vendorForm.phone2" fluid />
                                    <label for="vendor_phone2"><i class="fas fa-phone-flip ml-1"/>رقم إضافي</label>
                                </FloatLabel>
                            </div>
                            <div class="col-12">
                                <FloatLabel variant="on">
                                    <InputText id="vendor_email" v-model="vendorForm.email" fluid />
                                    <label for="vendor_email"><i class="fas fa-envelope ml-1"/>البريد الإلكتروني</label>
                                </FloatLabel>
                            </div>
                            <div class="col-12">
                                <FloatLabel variant="on">
                                    <Textarea id="vendor_address" v-model="vendorForm.address" rows="2" fluid />
                                    <label for="vendor_address"><i class="fas fa-map-location-dot ml-1"/>العنوان</label>
                                </FloatLabel>
                            </div>
                        </div>
                        <div class="flex justify-content-end gap-2 mt-2">
                            <Button label="إلغاء" severity="secondary" size="small"
                                @click="emit('update:showAddVendorForm', false)" />
                            <Button label="حفظ البائع" icon="fas fa-floppy-disk" size="small"
                                :loading="isSavingVendor" @click="emit('saveVendor')" />
                        </div>
                    </div>
                </Transition>
            </div>

            <!-- ─── FileUpload ─────────────────────────────────────────────────── -->
            <ImageUpload
                :existing-files="existingFiles"
                @update:files="onFilesUpdated"
            />

            <!-- ─── Section 2: Core Info ──────────────────────────────────────── -->
            <div class="surface-50 border-round-xl p-4 border-1 border-200">
                <div class="flex align-items-center gap-2 mb-3">
                    <i class="fas fa-circle-info text-primary-500"/>
                    <span class="font-semibold text-700 text-sm">معلومات العرض</span>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on">
                            <DatePicker v-model="estimateForm.estimate_date" id="estimate_date"
                                showIcon iconDisplay="input" fluid />
                            <label for="estimate_date"><i class="fas fa-calendar-alt ml-1"/>تاريخ العرض</label>
                        </FloatLabel>
                    </div>
                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on">
                            <Select v-model="estimateForm.status" id="status"
                                :options="statusOptions" optionLabel="label" optionValue="value" fluid>
                                <template #option="{ option }">
                                    <div class="flex align-items-center gap-2">
                                        <i :class="option.icon" :style="{ color: option.color }"/>
                                        <span>{{ option.label }}</span>
                                    </div>
                                </template>
                                <template #value="{ value }">
                                    <div v-if="value" class="flex align-items-center gap-2">
                                        <i :class="statusOptions.find(o=>o.value===value)?.icon"
                                           :style="{ color: statusOptions.find(o=>o.value===value)?.color }"/>
                                        <span>{{ statusOptions.find(o=>o.value===value)?.label }}</span>
                                    </div>
                                    <span v-else class="text-500">اختر الحالة</span>
                                </template>
                            </Select>
                            <label for="status">حالة العرض</label>
                        </FloatLabel>
                    </div>

                    <!-- طلب الشراء -->
                    <div class="col-12 mt-2">
                        <FloatLabel variant="on">
                            <Select
                                id="purchase_id"
                                :modelValue="selectedPurchaseId ? Number(selectedPurchaseId) : null"
                                @update:modelValue="emit('update:selectedPurchaseId', $event)"
                                :options="allPurchase" optionLabel="title" optionValue="id"
                                filter show-clear fluid
                            >
                                <template #value="{ value }">
                                    <template v-if="value">
                                        <div v-if="allPurchase.find(p => p.id === value)" class="flex align-items-center gap-2">
                                            <i class="fas fa-cart-shopping text-sm text-primary-500"/>
                                            <span class="font-medium text-900">{{ allPurchase.find(p => p.id === value)?.title }}</span>
                                            <small class="text-400">— {{ allPurchase.find(p => p.id === value)?.department?.name }}</small>
                                        </div>
                                        <span v-else class="text-400">جاري التحميل...</span>
                                    </template>
                                    
                                </template>
                                <template #option="{ option }">
                                    <div class="flex flex-column gap-1 py-1">
                                        <div class="flex align-items-center gap-2">
                                            <i class="fas fa-cart-shopping text-sm text-primary-500"/>
                                            <strong class="text-900">{{ option.title }}</strong>
                                        </div>
                                        <div class="flex gap-3">
                                            <small class="text-500"><i class="fas fa-building ml-1"/>{{ option.department?.name }}</small>
                                            <small class="text-500"><i class="fas fa-hashtag ml-1"/>{{ option.request_number }}</small>
                                        </div>
                                    </div>
                                </template>
                            </Select>
                            <label for="purchase_id"><i class="fas fa-cart-shopping ml-1"/>طلب الشراء</label>
                        </FloatLabel>
                    </div>

                    <!-- ─── MultiSelect المواد ──────────────────────────────── -->
                    <Transition name="slide-fade">
                        <div v-if="selectedPurchaseId && availableItems.length" class="col-12 mt-2">
                            <FloatLabel variant="on">
                                <MultiSelect
                                    id="selected_items"
                                    :modelValue="selectedItemIds"
                                    @update:modelValue="onItemsSelected"
                                    :options="availableItems"
                                    optionLabel="item_name"
                                    optionValue="id"
                                    filter
                                    :showToggleAll="true"
                                    fluid
                                    display="chip"
                                    :maxSelectedLabels="3"
                                    selectedItemsLabel="{0} مواد محددة"
                                >
                                    <template #option="{ option }">
                                        <div class="flex align-items-center justify-content-between w-full gap-3">
                                            <div class="flex align-items-center gap-2">
                                                <i class="fas fa-box text-sm text-400"/>
                                                <span class="font-medium">{{ option.item_name }}</span>
                                            </div>
                                            <div class="flex align-items-center gap-2">
                                                <Tag :value="`${option.quantity}`" severity="secondary" class="text-xs" />
                                                <small v-if="option.unit?.name" class="text-400">{{ option.unit.name }}</small>
                                            </div>
                                        </div>
                                    </template>
                                    <template #chip="{ value }">
                                        <div class="flex align-items-center gap-1">
                                            <i class="fas fa-box text-xs"/>
                                            <span class="text-sm">{{ availableItems.find((i: any) => i.id === value)?.item_name }}</span>
                                        </div>
                                    </template>
                                    <template #footer>
                                        <div class="px-3 py-2 border-top-1 border-200 flex align-items-center gap-2 text-500 text-sm surface-50">
                                            <i class="fas fa-circle-info"/>
                                            <span>{{ selectedItemIds.length }} مادة محددة من أصل {{ availableItems.length }}</span>
                                        </div>
                                    </template>
                                </MultiSelect>
                                <label for="selected_items"><i class="fas fa-boxes-stacked ml-1"/>اختر المواد</label>
                            </FloatLabel>
                        </div>
                    </Transition>

                    <div class="col-12 mt-2">
                        <FloatLabel variant="on">
                            <Textarea v-model="estimateForm.notes" id="notes" rows="3"
                                style="resize: none" fluid />
                            <label for="notes"><i class="fas fa-note-sticky ml-1"/>الملاحظات</label>
                        </FloatLabel>
                    </div>
                </div>
            </div>

            <!-- ─── Section 3: جدول الأسعار ───────────────────────────────────── -->
            <Transition name="slide-fade">
                <div v-if="estimateForm.items?.length"
                    class="border-round-xl border-1 border-200 overflow-hidden">
                    <div class="flex align-items-center justify-content-between px-4 py-3 surface-card border-bottom-1 border-200">
                        <div class="flex align-items-center gap-2">
                            <i class="fas fa-boxes-stacked text-primary-500"/>
                            <span class="font-semibold text-700 text-sm">أسعار المواد المختارة</span>
                            <Badge :value="estimateForm.items.length" severity="secondary" />
                        </div>
                        <div v-if="totalEstimateAmount > 0" class="flex align-items-center gap-2">
                            <span class="text-500 text-sm">الإجمالي:</span>
                            <span class="font-bold text-primary-600 text-lg">
                                {{ totalEstimateAmount.toLocaleString() }}
                            </span>
                        </div>
                    </div>

                    <DataTable :value="estimateForm.items" size="small"
                        :pt="{ thead: { class: 'surface-100' }, tbody: { class: 'surface-0' } }">
                        <Column>
                            <template #header><span class="text-600 text-sm font-medium">المادة</span></template>
                            <template #body="{ data }">
                                <div class="flex align-items-center gap-2">
                                    <div class="flex align-items-center justify-content-center border-round border-1 border-200 surface-50"
                                        style="width:28px;height:28px;flex-shrink:0">
                                        <i class="fas fa-box text-xs text-400"/>
                                    </div>
                                    <span class="font-medium text-900">{{ data.item_name }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column style="width: 100px">
                            <template #header><span class="text-600 text-sm font-medium">الكمية</span></template>
                            <template #body="{ data }">
                                <Tag :value="`${data.quantity}`" severity="secondary"
                                    :pt="{ root: { class: 'border-round-lg px-3 font-semibold' } }" />
                            </template>
                        </Column>
                        <Column style="width: 180px">
                            <template #header><span class="text-600 text-sm font-medium">سعر الوحدة</span></template>
                            <template #body="{ data }">
                                <InputNumber
                                    :modelValue="data.unit_price"
                                    @update:modelValue="val => data.unit_price = val ?? 0"
                                    :min="0" mode="decimal" :useGrouping="true"
                                    :minFractionDigits="0" :maxFractionDigits="0"
                                    :pt="{ input: { class: 'border-round-lg text-sm' } }"
                                    :inputStyle="{width: '140px'}"
                                />
                            </template>
                        </Column>
                        <Column style="width: 130px">
                            <template #header><span class="text-600 text-sm font-medium">المجموع</span></template>
                            <template #body="{ data }">
                                <span class="font-semibold text-900">
                                    {{ (data.unit_price && data.quantity)
                                        ? (Number(data.unit_price) * data.quantity).toLocaleString()
                                        : '—' }}
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </Transition>

            <!-- Empty states -->
            <div v-if="!selectedPurchaseId"
                class="flex flex-column align-items-center justify-content-center gap-2 py-4 text-400 surface-50 border-round-xl border-1 border-200">
                <i class="fas fa-cart-shopping text-3xl"/>
                <span class="text-sm">اختر طلب الشراء أولاً لعرض المواد</span>
            </div>
            <div v-else-if="selectedPurchaseId && !estimateForm.items?.length"
                class="flex flex-column align-items-center justify-content-center gap-2 py-4 text-400 surface-50 border-round-xl border-1 border-200">
                <i class="fas fa-boxes-stacked text-3xl"/>
                <span class="text-sm">اختر المواد من القائمة أعلاه لتحديد أسعارها</span>
            </div>
        </div>

        <!-- ─── Footer ────────────────────────────────────────────────────────── -->
        <template #footer>
            <div class="flex justify-content-between align-items-center w-full">
                <div v-if="totalEstimateAmount > 0 && estimateForm.items?.length"
                    class="flex align-items-center gap-2 text-500 text-sm">
                    <i class="fas fa-circle-check text-green-500"/>
                    <span>{{ estimateForm.items.length }} مادة · إجمالي {{ totalEstimateAmount.toLocaleString() }}</span>
                </div>
                <div v-else/>
                <div class="flex gap-2">
                    <Button label="إلغاء" icon="fas fa-times" severity="secondary" variant="outlined"
                        class="border-round-lg" @click="emit('update:visible', false)" />
                    <Button :label="isEditMode ? 'تحديث' : 'حفظ'" icon="fas fa-floppy-disk"
                        :loading="isSaving" class="border-round-lg" @click="emit('submit')" />
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import ImageUpload from './fileUpload.vue';

const statusOptions = [
    { label: 'معلق',  value: 'pending',  icon: 'fas fa-clock',       color: 'var(--yellow-500)' },
    { label: 'مقبول', value: 'accepted', icon: 'fas fa-circle-check', color: 'var(--green-500)'  },
    { label: 'مرفوض', value: 'rejected', icon: 'fas fa-circle-xmark', color: 'var(--red-500)'    },
];

// ─── حالة الملفات ────────────────────────────────────────────────────────────
const newFilesToUpload = ref<File[]>([]);
// بعد - اجعلها تستقبل الصور من estimateForm
const existingFiles = computed(() => {
    console.log(props)

    return props.estimateForm?.images ?? [];
});

function onFilesUpdated(files: File[]) {
    newFilesToUpload.value = files;
    emit('update:newFiles', files);
}

// ─── Props ───────────────────────────────────────────────────────────────────
const props = defineProps<{
    visible: boolean;
    isEditMode: boolean;
    estimateForm: any;
    allVendors: any[];
    allPurchase: any[];
    vendorForm: any;
    showAddVendorForm: boolean;
    isSavingVendor: boolean;
    isSaving: boolean;
    totalEstimateAmount: number;
    selectedPurchaseId: number | null;
}>();

const emit = defineEmits<{
    'update:visible': [value: boolean];
    'update:selectedPurchaseId': [value: number | null];
    'update:showAddVendorForm': [value: boolean];
    'submit': [];
    'saveVendor': [];
    'reset': [];
    'update:newFiles': [files: File[]];
}>();

// ─── المواد المتاحة من طلب الشراء المختار ───────────────────────────────────
const availableItems = computed(() => {
    if (!props.selectedPurchaseId) return [];
    const purchase = props.allPurchase.find(p => p.id === props.selectedPurchaseId);
    return purchase?.items ?? [];
});

// ─── IDs المواد المحددة في MultiSelect ──────────────────────────────────────
const selectedItemIds = ref<number[]>([]);

// عند تغيير طلب الشراء → مسح التحديد (إلا في وضع التعديل)
watch(() => props.selectedPurchaseId, () => {
    if (!props.isEditMode) {
        selectedItemIds.value = [];
    }
});

// عند فتح الـ Dialog في وضع التعديل → sync المواد المحددة
watch(() => props.visible, (val) => {
    if (val && props.isEditMode && props.estimateForm.items?.length) {
        selectedItemIds.value = props.estimateForm.items.map((i: any) => i.request_item_id);
    }
    if (!val) selectedItemIds.value = [];
}, { immediate: true });

// ─── عند تغيير التحديد في MultiSelect ──────────────────────────────────────
function onItemsSelected(newIds: number[]) {
    const oldIds = selectedItemIds.value;

    const added   = newIds.filter(id => !oldIds.includes(id));
    const removed = oldIds.filter(id => !newIds.includes(id));

    added.forEach(id => {
        const item = availableItems.value.find((i: any) => i.id === id);
        if (!item) return;
        const existing = props.estimateForm.items.find((i: any) => i.request_item_id === id);
        props.estimateForm.items.push({
            request_item_id: id,
            item_name:   item.item_name,
            quantity:    item.quantity,
            unit_price:  existing?.unit_price ?? 0,
            notes:       existing?.notes ?? null,
        });
    });

    removed.forEach(id => {
        const idx = props.estimateForm.items.findIndex((i: any) => i.request_item_id === id);
        if (idx !== -1) props.estimateForm.items.splice(idx, 1);
    });

    selectedItemIds.value = newIds;
}
</script>

<style scoped>
.slide-fade-enter-active { transition: all 0.25s ease-out; }
.slide-fade-leave-active { transition: all 0.2s ease-in; }
.slide-fade-enter-from,
.slide-fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>