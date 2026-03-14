<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        :style="{ width: '75vw', maxWidth: '1100px' }"
        modal
        @hide="emit('reset')"
        dir="rtl"
        :pt="{
            header:  { class: 'pb-3 border-bottom-1 border-200' },
            content: { class: 'pt-4 pb-2 overflow-y-auto', style: 'max-height:75vh' },
            footer:  { class: 'pt-3 border-top-1 border-200' },
        }"
    >
        <!-- ─── Header ───────────────────────────────────────────────────── -->
        <template #header>
            <div class="flex align-items-center gap-3">
                <div class="flex align-items-center justify-content-center border-round-xl"
                    style="width:42px;height:42px;background:var(--primary-50)">
                    <i class="fas fa-truck-ramp-box text-xl" style="color:var(--primary-500)"/>
                </div>
                <div>
                    <h2 class="m-0 text-900 font-semibold text-xl">
                        {{ isEditMode ? 'تعديل عملية الشراء' : 'إضافة عملية شراء جديدة' }}
                    </h2>
                    <p class="m-0 text-500 text-sm mt-1">أدخل بيانات عملية الشراء</p>
                </div>
            </div>
        </template>

        <div class="flex flex-column gap-4">

            <!-- ══════════════════════════════════════════════════════════
                القسم ١ — بيانات الطلب
            ══════════════════════════════════════════════════════════ -->
            <div class="surface-50 border-round-xl p-4 border-1 border-200">
                <SectionTitle number="١" label="بيانات الطلب" />

                <div class="grid mt-3">
                    <!-- طلب الشراء -->
                    <div class="col-12">
                        <FloatLabel variant="on">
                            <Select
                                id="purchase_request_id"
                                :modelValue="form.purchase_request_id"
                                @update:modelValue="onPurchaseSelected"
                                :options="allPurchase"
                                optionLabel="title"
                                optionValue="id"
                                filter fluid
                                :loading="isLoadingRequest"
                            >
                                <template #value="{ value }">
                                    <div v-if="value" class="flex align-items-center gap-2">
                                        <i class="fas fa-cart-shopping text-sm text-primary-500"/>
                                        <span>{{ allPurchase.find(p => p.id === value)?.title }}</span>
                                        <small class="text-400">
                                            — {{ allPurchase.find(p => p.id === value)?.request_number }}
                                        </small>
                                    </div>
                                    <span v-else class="text-400">اختر طلب الشراء</span>
                                </template>
                                <template #option="{ option }">
                                    <div class="flex flex-column gap-1 py-1">
                                        <div class="flex align-items-center gap-2">
                                            <i class="fas fa-cart-shopping text-sm text-primary-500"/>
                                            <strong class="text-900">{{ option.title }}</strong>
                                        </div>
                                        <small class="text-500">
                                            <i class="fas fa-hashtag ml-1"/>{{ option.request_number }}
                                        </small>
                                    </div>
                                </template>
                            </Select>
                            <label for="purchase_request_id">
                                طلب الشراء <span class="text-red-400">*</span>
                            </label>
                        </FloatLabel>
                    </div>

                    <div class="col-12 md:col-4 mt-3">
                        <FloatLabel variant="on">
                            <InputText id="reference_no" v-model="form.reference_no" fluid />
                            <label for="reference_no">
                                <i class="fas fa-hashtag ml-1"/>رقم المرجع
                            </label>
                        </FloatLabel>
                    </div>

                    <div class="col-12 md:col-4 mt-3">
                        <FloatLabel variant="on">
                            <DatePicker id="purchase_date" v-model="purchaseDateModel"
                                showIcon iconDisplay="input" fluid />
                            <label for="purchase_date">
                                <i class="fas fa-calendar-alt ml-1"/>تاريخ الشراء
                            </label>
                        </FloatLabel>
                    </div>

                    <div class="col-12 md:col-4 mt-3">
                        <FloatLabel variant="on">
                            <Select id="status" v-model="form.status"
                                :options="statusOptions" optionLabel="label" optionValue="value" fluid>
                                <template #option="{ option }">
                                    <div class="flex align-items-center gap-2">
                                        <i :class="option.icon" :style="{ color: option.color }"/>
                                        <span>{{ option.label }}</span>
                                    </div>
                                </template>
                                <template #value="{ value }">
                                    <div v-if="value" class="flex align-items-center gap-2">
                                        <i :class="statusOptions.find(o => o.value === value)?.icon"
                                           :style="{ color: statusOptions.find(o => o.value === value)?.color }"/>
                                        <span>{{ statusOptions.find(o => o.value === value)?.label }}</span>
                                    </div>
                                </template>
                            </Select>
                            <label for="status">الحالة</label>
                        </FloatLabel>
                    </div>

                    <div class="col-12 mt-3">
                        <FloatLabel variant="on">
                            <Textarea id="notes" v-model="form.notes" rows="2"
                                style="resize:none" fluid />
                            <label for="notes">
                                <i class="fas fa-note-sticky ml-1"/>الملاحظات
                            </label>
                        </FloatLabel>
                    </div>
                </div>
            </div>

            <!-- ══════════════════════════════════════════════════════════
                 القسم ٢ — عروض الأسعار (اختياري، يظهر بعد اختيار الطلب)
            ══════════════════════════════════════════════════════════ -->
            <Transition name="slide-down">
            <div v-if="form.purchase_request_id"
                class="surface-50 border-round-xl p-4 border-1 border-200">

                <div class="flex align-items-center justify-content-between mb-3">
                    <div class="flex align-items-center gap-2">
                        <SectionTitle number="٢" label="عروض الأسعار" />
                        <Badge v-if="selectedEstimateIds.length"
                            :value="`${selectedEstimateIds.length} مختار`"
                            severity="success" class="mr-1" />
                    </div>
                    <span class="text-xs text-400 border-1 border-200 border-round-lg px-2 py-1">
                        <i class="fas fa-circle-info ml-1"/>اختياري
                    </span>
                </div>

                <!-- Loading -->
                <div v-if="isLoadingRequest"
                    class="flex align-items-center justify-content-center py-4 gap-2 text-400">
                    <i class="pi pi-spin pi-spinner"/>
                    <span class="text-sm">جاري جلب البيانات...</span>
                </div>

                <!-- لا توجد عروض -->
                <div v-else-if="!availableEstimates.length"
                    class="flex align-items-center justify-content-center gap-2 py-3 text-400 text-sm">
                    <i class="fas fa-file-invoice-dollar"/>
                    <span>لا توجد عروض أسعار لهذا الطلب</span>
                </div>

                <!-- قائمة العروض -->
                <div v-else class="flex flex-column gap-2">
                    <div v-for="est in availableEstimates" :key="est.id"
                        class="flex align-items-center justify-content-between p-3 border-round-xl border-2 cursor-pointer transition-all transition-duration-200"
                        :class="selectedEstimateIds.includes(est.id)
                            ? 'border-primary-400 surface-card shadow-1'
                            : 'border-200 hover:border-primary-200'"
                        @click="toggleEstimate(est.id)">
                        <div class="flex align-items-center gap-3">
                            <Checkbox
                                :modelValue="selectedEstimateIds.includes(est.id)"
                                :binary="true"
                                @click.stop
                                @update:modelValue="toggleEstimate(est.id)"
                            />
                            <div>
                                <div class="font-semibold text-900 text-sm">
                                    {{ est.vendor?.name ?? `عرض #${est.id}` }}
                                </div>
                                <small class="text-400">
                                    <i class="fas fa-calendar-alt ml-1"/>
                                    {{ formatDate(est.estimate_date) }}
                                </small>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-primary-600 text-sm">
                                {{ formatCurrency(est.total_amount) }}
                            </div>
                            <small class="text-400">د.ع</small>
                        </div>
                    </div>
                </div>
            </div>
            </Transition>

            <!-- ══════════════════════════════════════════════════════════
                 القسم ٣ — مواد الطلب وأسعار الشراء
            ══════════════════════════════════════════════════════════ -->
            <Transition name="slide-down">
            <div v-if="form.purchase_request_id && !isLoadingRequest"
                class="border-round-xl border-1 border-200 overflow-hidden">

                <div class="flex align-items-center justify-content-between px-4 py-3 surface-card border-bottom-1 border-200">
                    <div class="flex align-items-center gap-2">
                        <SectionTitle number="٣" label="المواد وأسعار الشراء" />
                        <Badge :value="`${requestItems.length} مادة`" severity="secondary" />
                    </div>
                    <div v-if="totalAmount > 0" class="flex align-items-center gap-2">
                        <span class="text-500 text-sm">الإجمالي:</span>
                        <span class="font-bold text-primary-600">
                            {{ formatCurrency(totalAmount) }}
                        </span>
                        <span class="text-400 text-xs">د.ع</span>
                    </div>
                </div>

                <!-- لا توجد مواد -->
                <div v-if="!requestItems.length"
                    class="flex align-items-center justify-content-center gap-2 py-5 text-400 text-sm">
                    <i class="fas fa-boxes-stacked"/>
                    <span>لا توجد مواد في هذا الطلب</span>
                </div>

                <DataTable v-else :value="requestItems" size="small"
                    :pt="{ thead: { class: 'surface-100' }, tbody: { class: 'surface-0' } }">

                    <!-- المادة -->
                    <Column>
                        <template #header><span class="text-600 text-sm">المادة</span></template>
                        <template #body="{ data: item }">
                            <div>
                                <div class="font-medium text-900 text-sm">{{ item.item_name }}</div>
                                <small v-if="item.specifications" class="text-400 text-xs">
                                    {{ item.specifications }}
                                </small>
                            </div>
                        </template>
                    </Column>

                    <!-- الوحدة -->
                    <Column style="width:80px">
                        <template #header><span class="text-600 text-sm">الوحدة</span></template>
                        <template #body="{ data: item }">
                            <span class="text-500 text-sm">{{ item.unit?.name ?? '—' }}</span>
                        </template>
                    </Column>

                    <!-- الكمية -->
                    <Column style="width:80px">
                        <template #header><span class="text-600 text-sm">الكمية</span></template>
                        <template #body="{ data: item }">
                            <Tag :value="`${item.quantity}`" severity="secondary"
                                :pt="{ root: { class: 'border-round-lg px-2 font-semibold' } }" />
                        </template>
                    </Column>

                    <!-- السعر التقديري -->
                    <Column style="width:140px">
                        <template #header><span class="text-600 text-sm">السعر التقديري</span></template>
                        <template #body="{ data: item }">
                            <span class="text-500 text-sm">
                                {{ formatCurrency(item.estimated_unit_price) }}
                                <small class="text-400 mr-1">د.ع</small>
                            </span>
                        </template>
                    </Column>

                    <!-- سعر عرض السعر — يظهر فقط عند اختيار عرض أسعار -->
                    <Column v-if="selectedEstimateIds.length" style="width:160px">
                        <template #header><span class="text-600 text-sm">سعر العرض</span></template>
                        <template #body="{ data: item }">
                            <div v-if="getEstimateInfo(item)" class="flex flex-column">
                                <span class="font-medium text-blue-700 text-sm">
                                    {{ formatCurrency(getEstimateInfo(item)!.unit_price) }}
                                    <small class="text-400 mr-1">د.ع</small>
                                </span>
                                <small class="text-400 text-xs">{{ getEstimateInfo(item)!.vendor }}</small>
                            </div>
                            <span v-else class="text-300 text-sm">—</span>
                        </template>
                    </Column>

                    <!-- سعر الشراء الفعلي -->
                    <Column style="width:180px">
                        <template #header>
                            <span class="text-600 text-sm">
                                سعر الشراء <span class="text-red-400">*</span>
                            </span>
                        </template>
                        <template #body="{ data: item }">
                            <InputNumber
                                :modelValue="getFormItem(item.id)?.purchase_price ?? 0"
                                @update:modelValue="val => setFormItemPrice(item, val ?? 0)"
                                :min="0" mode="decimal" :useGrouping="true"
                                :inputStyle="{ width: '145px' }"
                                size="small"
                            />
                        </template>
                    </Column>

                    <!-- الفرق — يظهر فقط عند اختيار عرض أسعار -->
                    <Column v-if="selectedEstimateIds.length" style="width:110px">
                        <template #header><span class="text-600 text-sm">الفرق</span></template>
                        <template #body="{ data: item }">
                            <span v-if="getEstimateInfo(item)"
                                :class="getDiffClass(item)"
                                class="font-semibold text-sm">
                                {{ getDiffLabel(item) }}
                            </span>
                            <span v-else class="text-300">—</span>
                        </template>
                    </Column>

                </DataTable>
            </div>
            </Transition>

            <!-- placeholder قبل اختيار الطلب -->
            <div v-if="!form.purchase_request_id"
                class="flex flex-column align-items-center justify-content-center gap-2 py-6 text-400
                       surface-50 border-round-xl border-1 border-200">
                <i class="fas fa-boxes-stacked text-4xl"/>
                <span class="text-sm">اختر طلب الشراء لعرض المواد وعروض الأسعار</span>
            </div>

            <!-- ══════════════════════════════════════════════════════════
                 القسم ٤ — صور الفواتير
            ══════════════════════════════════════════════════════════ -->
            <Transition name="slide-down">
            <div v-if="form.purchase_request_id"
                class="surface-50 border-round-xl p-4 border-1 border-200">

                <div class="flex align-items-center justify-content-between mb-3">
                    <SectionTitle number="٤" label="صور الفواتير" />
                    <span class="text-xs text-400 border-1 border-200 border-round-lg px-2 py-1">
                        <i class="fas fa-circle-info ml-1"/>اختياري
                    </span>
                </div>

                <!-- منطقة السحب والإفلات -->
                <div class="border-2 border-dashed border-300 border-round-xl p-5 text-center cursor-pointer
                            transition-all transition-duration-200 hover:border-primary-400 hover:surface-card"
                    @click="triggerFileInput"
                    @dragover.prevent
                    @drop.prevent="onDrop">
                    <input ref="fileInputRef" type="file"
                        accept="image/jpeg,image/png" multiple class="hidden"
                        @change="onFileChange" />
                    <i class="fas fa-cloud-arrow-up text-4xl text-400 mb-3 block"/>
                    <p class="text-600 text-sm m-0">
                        اسحب الصور هنا أو
                        <span class="text-primary-500 font-semibold">تصفح الملفات</span>
                    </p>
                    <p class="text-400 text-xs mt-1 m-0">JPG, PNG — حد أقصى 5MB لكل صورة</p>
                </div>

                <!-- معاينة الصور -->
                <div v-if="invoiceFiles.length" class="flex flex-wrap gap-3 mt-3">
                    <div v-for="(file, idx) in invoiceFiles" :key="idx"
                        class="relative border-round-xl overflow-hidden border-1 border-200 flex-shrink-0"
                        style="width:100px;height:100px">
                        <img :src="file.preview" class="w-full h-full" style="object-fit:cover"/>
                        <!-- overlay حذف -->
                        <div class="absolute top-0 left-0 w-full h-full flex align-items-center justify-content-center
                                    opacity-0 hover:opacity-100 transition-all transition-duration-200"
                            style="background:rgba(0,0,0,0.5)">
                            <Button icon="fas fa-trash" severity="danger" size="small" rounded
                                @click.stop="removeFile(idx)" />
                        </div>
                        <!-- اسم الملف -->
                        <div class="absolute bottom-0 right-0 left-0 px-1 py-1"
                            style="background:rgba(0,0,0,0.55)">
                            <p class="text-white text-xs m-0 overflow-hidden white-space-nowrap text-overflow-ellipsis">
                                {{ file.name }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            </Transition>

        </div><!-- /flex flex-column -->

        <!-- ─── Footer ────────────────────────────────────────────────────── -->
        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="إلغاء" icon="fas fa-times"
                    severity="secondary" variant="outlined" class="border-round-lg"
                    @click="emit('update:visible', false)" />
                <Button
                    :label="isEditMode ? 'تحديث' : 'حفظ'"
                    icon="fas fa-floppy-disk"
                    :loading="isSaving"
                    :disabled="!canSubmit"
                    class="border-round-lg"
                    @click="handleSubmit"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog      from 'primevue/dialog';
import Button      from 'primevue/button';
import Select      from 'primevue/select';
import FloatLabel  from 'primevue/floatlabel';
import InputText   from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea    from 'primevue/textarea';
import DatePicker  from 'primevue/datepicker';
import DataTable   from 'primevue/datatable';
import Column      from 'primevue/column';
import Badge       from 'primevue/badge';
import Checkbox    from 'primevue/checkbox';
import Tag         from 'primevue/tag';
import type { ProcurementPayload } from '../procurementService';

// ─── مكوّن مساعد لعنوان القسم ─────────────────────────────────────────────
const SectionTitle = {
    props: ['number', 'label'],
    template: `
        <div class="flex align-items-center gap-2">
            <div class="flex align-items-center justify-content-center border-round-lg flex-shrink-0"
                style="width:26px;height:26px;background:var(--primary-100)">
                <span class="font-bold text-primary-600 text-xs">{{ number }}</span>
            </div>
            <span class="font-semibold text-700">{{ label }}</span>
        </div>
    `,
};

// ─── Props ────────────────────────────────────────────────────────────────
const props = defineProps<{
    visible: boolean;
    isEditMode: boolean;
    form: ProcurementPayload;
    allPurchase: any[];
    selectedPurchaseRequest: any | null;  // الطلب المختار كاملاً
    selectedEstimateIds: number[];
    isSaving: boolean;
    isLoadingRequest?: boolean;
}>();

const emit = defineEmits<{
    'update:visible':      [boolean];
    'submit':              [invoiceFiles: File[]];
    'reset':               [];
    'onPurchaseSelected':  [id: number];
    'onEstimatesSelected': [ids: number[]];
}>();

// ─── Status options ───────────────────────────────────────────────────────
const statusOptions = [
    { label: 'جاري الشراء',  value: 'in_progress', icon: 'fas fa-spinner',      color: 'var(--yellow-500)' },
    { label: 'تم الشراء',    value: 'completed',   icon: 'fas fa-circle-check', color: 'var(--green-500)'  },
    { label: 'إلغاء الشراء', value: 'cancelled',   icon: 'fas fa-circle-xmark', color: 'var(--red-500)'    },
];

// ─── Derived data from selectedPurchaseRequest ────────────────────────────
const requestItems = computed<any[]>(() =>
    props.selectedPurchaseRequest?.items ?? []
);

const availableEstimates = computed<any[]>(() =>
    props.selectedPurchaseRequest?.estimates ?? []
);

// ─── Date model ───────────────────────────────────────────────────────────
const purchaseDateModel = computed({
    get: () => props.form.purchase_date ? new Date(props.form.purchase_date) : null,
    set: (v: Date | null) => {
        props.form.purchase_date = v?.toISOString().split('T')[0] ?? null;
    },
});

// ─── Estimate toggle ──────────────────────────────────────────────────────
const toggleEstimate = (id: number) => {
    const ids = [...props.selectedEstimateIds];
    const idx = ids.indexOf(id);
    idx === -1 ? ids.push(id) : ids.splice(idx, 1);
    emit('onEstimatesSelected', ids);
};

// ─── Form items helpers ───────────────────────────────────────────────────
const getFormItem = (requestItemId: number) =>
    props.form.items.find(i => i.request_item_id === requestItemId);

const setFormItemPrice = (requestItem: any, price: number) => {
    const existing = props.form.items.find(i => i.request_item_id === requestItem.id);
    if (existing) {
        existing.purchase_price = price;
    } else {
        const info = getEstimateInfo(requestItem);
        props.form.items.push({
            request_item_id:  requestItem.id,
            estimate_id:      info?.estimate_id ?? null,
            estimate_item_id: info?.estimate_item_id ?? null,
            item_name:        requestItem.item_name,
            unit_id:          requestItem.unit?.id ?? null,
            quantity:         requestItem.quantity,
            unit_price:       Number(requestItem.estimated_unit_price ?? 0),
            purchase_price:   price,
            estimate_price:   Number(info?.unit_price ?? 0),
            notes:            null,
        });
    }
};

// ─── Estimate info لمادة معينة ────────────────────────────────────────────
// يبحث في item.estimate[] عن أي عرض سعر مختار
const getEstimateInfo = (requestItem: any): {
    unit_price: number;
    vendor: string;
    estimate_id: number;
    estimate_item_id: number;
} | null => {
    if (!props.selectedEstimateIds.length) return null;
    const match = (requestItem.estimate ?? []).find((ei: any) =>
        props.selectedEstimateIds.includes(ei.estimate?.id)
    );
    if (!match) return null;
    return {
        unit_price:       Number(match.unit_price),
        vendor:           match.estimate?.vendor?.name ?? '—',
        estimate_id:      match.estimate?.id,
        estimate_item_id: match.id,
    };
};

// ─── مزامنة estimate_price في form.items عند تغيير العروض المختارة ────────
watch(() => props.selectedEstimateIds, () => {
    props.form.items.forEach(formItem => {
        const reqItem = requestItems.value.find(r => r.id === formItem.request_item_id);
        if (!reqItem) return;
        const info = getEstimateInfo(reqItem);
        formItem.estimate_price   = info ? info.unit_price : 0;
        formItem.estimate_id      = info?.estimate_id ?? null;
        formItem.estimate_item_id = info?.estimate_item_id ?? null;
    });
}, { deep: true });

// ─── بناء form.items تلقائياً عند جلب مواد الطلب ─────────────────────────
watch(requestItems, (items) => {
    // احذف المواد القديمة وأعد البناء
    props.form.items.splice(0);
    items.forEach(requestItem => {
        props.form.items.push({
            request_item_id:  requestItem.id,
            estimate_id:      null,
            estimate_item_id: null,
            item_name:        requestItem.item_name,
            unit_id:          requestItem.unit?.id ?? null,
            quantity:         requestItem.quantity,
            unit_price:       Number(requestItem.estimated_unit_price ?? 0),
            purchase_price:   0,
            estimate_price:   0,
            notes:            null,
        });
    });
});

// ─── Difference helpers ───────────────────────────────────────────────────
const getDiffClass = (requestItem: any) => {
    const formItem = getFormItem(requestItem.id);
    const info     = getEstimateInfo(requestItem);
    if (!formItem || !info || formItem.purchase_price === 0) return 'text-400';
    const diff = formItem.purchase_price - info.unit_price;
    return diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-400';
};

const getDiffLabel = (requestItem: any) => {
    const formItem = getFormItem(requestItem.id);
    const info     = getEstimateInfo(requestItem);
    if (!formItem || !info || formItem.purchase_price === 0) return '—';
    const diff = formItem.purchase_price - info.unit_price;
    if (diff === 0) return '=';
    return `${diff > 0 ? '▲' : '▼'} ${Math.abs(diff).toLocaleString()}`;
};

// ─── Total ────────────────────────────────────────────────────────────────
const totalAmount = computed(() =>
    props.form.items.reduce((s, i) =>
        s + (Number(i.purchase_price) * Number(i.quantity)), 0)
);

// ─── Invoice files ────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);
const invoiceFiles = ref<{ file: File; name: string; preview: string }[]>([]);

const triggerFileInput = () => fileInputRef.value?.click();

const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) return;
        invoiceFiles.value.push({
            file,
            name:    file.name,
            preview: URL.createObjectURL(file),
        });
    });
};

const onFileChange = (e: Event) =>
    addFiles((e.target as HTMLInputElement).files);
const onDrop = (e: DragEvent) =>
    addFiles(e.dataTransfer?.files ?? null);
const removeFile = (idx: number) => {
    const file = invoiceFiles.value[idx];
    if (file) URL.revokeObjectURL(file.preview)
};

watch(() => props.visible, (val) => {
    if (!val) {
        invoiceFiles.value.forEach(f => URL.revokeObjectURL(f.preview));
        invoiceFiles.value = [];
    }
});

// ─── Submit ───────────────────────────────────────────────────────────────
const canSubmit = computed(() =>
    !!props.form.purchase_request_id && props.form.items.length > 0
);

const onPurchaseSelected = (id: number) => emit('onPurchaseSelected', id);

const handleSubmit = () =>
    emit('submit', invoiceFiles.value.map(f => f.file));

// ─── Formatters ───────────────────────────────────────────────────────────
const formatDate = (d?: string | null) => d
    ? new Date(d).toLocaleDateString('ar-IQ', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—';

const formatCurrency = (v: any) =>
    parseFloat(v || '0').toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
</script>

<style scoped>
.slide-down-enter-active { transition: all 0.3s ease-out; }
.slide-down-leave-active { transition: all 0.2s ease-in; }
.slide-down-enter-from   { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>