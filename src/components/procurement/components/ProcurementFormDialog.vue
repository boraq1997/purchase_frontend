<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        :style="{ width: '70vw', maxWidth: '1050px' }"
        modal
        @hide="emit('reset')"
        dir="rtl"
        :pt="{
            header:  { class: 'pb-3 border-bottom-1 border-200' },
            content: { class: 'pt-4 pb-2' },
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
                    <p class="m-0 text-500 text-sm mt-1">
                        {{ stepTitles[currentStep] }}
                    </p>
                </div>
            </div>
        </template>

        <!-- ─── Stepper Indicator ─────────────────────────────────────────── -->
        <div class="flex align-items-center justify-content-center gap-2 mb-5">
            <div v-for="(step, i) in steps" :key="i"
                class="flex align-items-center gap-2">
                <div class="flex align-items-center gap-2 cursor-pointer"
                    @click="currentStep >= i ? emit('update:currentStep', i) : null">
                    <div class="flex align-items-center justify-content-center border-round-full font-bold text-sm transition-all transition-duration-300"
                        style="width:32px;height:32px"
                        :style="{
                            background: currentStep === i ? 'var(--primary-500)' : currentStep > i ? 'var(--green-500)' : 'var(--surface-200)',
                            color: currentStep >= i ? '#fff' : 'var(--text-color-secondary)',
                        }">
                        <i v-if="currentStep > i" class="fas fa-check text-xs"/>
                        <span v-else>{{ i + 1 }}</span>
                    </div>
                    <span class="text-sm font-medium"
                        :class="currentStep === i ? 'text-primary-500' : currentStep > i ? 'text-green-500' : 'text-400'">
                        {{ step }}
                    </span>
                </div>
                <div v-if="i < steps.length - 1"
                    class="border-top-1 transition-all transition-duration-300"
                    style="width:40px"
                    :style="{ borderColor: currentStep > i ? 'var(--green-500)' : 'var(--surface-300)' }"/>
            </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════
             الخطوة ١ — اختيار طلب الشراء
        ══════════════════════════════════════════════════════════════════ -->
        <Transition name="slide-fade">
        <div v-if="currentStep === 0" class="flex flex-column gap-4">
            <div class="surface-50 border-round-xl p-4 border-1 border-200">
                <div class="flex align-items-center gap-2 mb-3">
                    <i class="fas fa-cart-shopping text-primary-500"/>
                    <span class="font-semibold text-700 text-sm">اختر طلب الشراء</span>
                </div>
                <FloatLabel variant="on">
                    <Select
                        id="purchase_request_id"
                        :modelValue="form.purchase_request_id"
                        @update:modelValue="emit('onPurchaseSelected', $event)"
                        :options="allPurchase"
                        optionLabel="title"
                        optionValue="id"
                        filter fluid
                    >
                        <template #value="{ value }">
                            <div v-if="value" class="flex align-items-center gap-2">
                                <i class="fas fa-cart-shopping text-sm text-primary-500"/>
                                <span>{{ allPurchase.find(p => p.id === value)?.title }}</span>
                                <small class="text-400">— {{ allPurchase.find(p => p.id === value)?.request_number }}</small>
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
                    <label for="purchase_request_id">طلب الشراء</label>
                </FloatLabel>
            </div>

            <!-- معلومات إضافية -->
            <div class="surface-50 border-round-xl p-4 border-1 border-200">
                <div class="flex align-items-center gap-2 mb-3">
                    <i class="fas fa-circle-info text-primary-500"/>
                    <span class="font-semibold text-700 text-sm">معلومات إضافية</span>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on">
                            <InputText id="reference_no" v-model="form.reference_no" fluid />
                            <label for="reference_no"><i class="fas fa-hashtag ml-1"/>رقم المرجع</label>
                        </FloatLabel>
                    </div>
                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on">
                            <DatePicker id="purchase_date" v-model="purchaseDateModel"
                                showIcon iconDisplay="input" fluid />
                            <label for="purchase_date"><i class="fas fa-calendar-alt ml-1"/>تاريخ الشراء</label>
                        </FloatLabel>
                    </div>
                    <div class="col-12 mt-3">
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
                                        <i :class="statusOptions.find(o=>o.value===value)?.icon"
                                           :style="{ color: statusOptions.find(o=>o.value===value)?.color }"/>
                                        <span>{{ statusOptions.find(o=>o.value===value)?.label }}</span>
                                    </div>
                                </template>
                            </Select>
                            <label for="status">الحالة</label>
                        </FloatLabel>
                    </div>
                    <div class="col-12 mt-3">
                        <FloatLabel variant="on">
                            <Textarea id="notes" v-model="form.notes" rows="2" style="resize:none" fluid />
                            <label for="notes"><i class="fas fa-note-sticky ml-1"/>الملاحظات</label>
                        </FloatLabel>
                    </div>
                </div>
            </div>
        </div>
        </Transition>

        <!-- ══════════════════════════════════════════════════════════════════
             الخطوة ٢ — اختيار عروض الأسعار
        ══════════════════════════════════════════════════════════════════ -->
        <Transition name="slide-fade">
        <div v-if="currentStep === 1" class="flex flex-column gap-4">

            <!-- Loading -->
            <div v-if="isLoadingEstimates"
                class="flex align-items-center justify-content-center py-6 gap-3 text-400">
                <i class="pi pi-spin pi-spinner text-2xl"/>
                <span>جاري جلب عروض الأسعار...</span>
            </div>

            <!-- لا توجد عروض -->
            <div v-else-if="!estimatesByPurchase.length"
                class="flex flex-column align-items-center justify-content-center py-6 gap-2 text-400 surface-50 border-round-xl border-1 border-200">
                <i class="fas fa-file-invoice-dollar text-3xl"/>
                <span class="text-sm">لا توجد عروض أسعار مقبولة لهذا الطلب</span>
            </div>

            <!-- عروض الأسعار -->
            <template v-else>
                <div class="surface-50 border-round-xl p-4 border-1 border-200">
                    <div class="flex align-items-center gap-2 mb-3">
                        <i class="fas fa-file-invoice-dollar text-primary-500"/>
                        <span class="font-semibold text-700 text-sm">اختر عروض الأسعار</span>
                        <Badge :value="selectedEstimateIds.length" severity="secondary" />
                    </div>

                    <div class="flex flex-column gap-3">
                        <div v-for="estimate in estimatesByPurchase" :key="estimate.id"
                            class="p-3 border-round-xl border-2 cursor-pointer transition-all transition-duration-200"
                            :class="selectedEstimateIds.includes(estimate.id)
                                ? 'border-primary-400 surface-card'
                                : 'border-200 surface-50 hover:border-primary-200'"
                            @click="toggleEstimate(estimate.id)">
                            <div class="flex align-items-center justify-content-between">
                                <div class="flex align-items-center gap-3">
                                    <Checkbox
                                        :modelValue="selectedEstimateIds.includes(estimate.id)"
                                        :binary="true"
                                        @click.stop
                                        @update:modelValue="toggleEstimate(estimate.id)"
                                    />
                                    <div>
                                        <div class="font-semibold text-900">
                                            عرض سعر #{{ estimate.id }}
                                            <span class="text-500 font-normal text-sm mr-2">
                                                — {{ estimate.vendor?.name ?? '—' }}
                                            </span>
                                        </div>
                                        <div class="flex gap-3 mt-1">
                                            <small class="text-400">
                                                <i class="fas fa-boxes-stacked ml-1"/>
                                                {{ estimate.estimate_items?.length ?? 0 }} مادة
                                            </small>
                                            <small class="text-400">
                                                <i class="fas fa-calendar-alt ml-1"/>
                                                {{ formatDate(estimate.estimate_date) }}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-left">
                                    <div class="font-bold text-primary-600">
                                        {{ formatCurrency(estimate.total_amount) }}
                                    </div>
                                    <small class="text-400">د.ع</small>
                                </div>
                            </div>

                            <!-- المواد في عرض السعر -->
                            <div v-if="selectedEstimateIds.includes(estimate.id)"
                                class="mt-3 pt-3 border-top-1 border-200 flex flex-wrap gap-2">
                                <Chip v-for="item in estimate.estimate_items" :key="item.id"
                                    :label="item.item_name"
                                    class="text-xs border-round-lg"
                                    style="background:var(--primary-50);color:var(--primary-700)" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        </Transition>

        <!-- ══════════════════════════════════════════════════════════════════
             الخطوة ٣ — اختيار المواد وتحديد أسعار الشراء
        ══════════════════════════════════════════════════════════════════ -->
        <Transition name="slide-fade">
        <div v-if="currentStep === 2" class="flex flex-column gap-4">

            <div v-for="estimate in selectedEstimates" :key="estimate.id"
                class="border-round-xl border-1 border-200 overflow-hidden">

                <!-- رأس عرض السعر -->
                <div class="flex align-items-center justify-content-between px-4 py-3 surface-card border-bottom-1 border-200">
                    <div class="flex align-items-center gap-2">
                        <i class="fas fa-file-invoice-dollar text-primary-500"/>
                        <span class="font-semibold text-700">عرض سعر #{{ estimate.id }}</span>
                        <span class="text-500 text-sm">— {{ estimate.vendor?.name }}</span>
                    </div>
                    <Badge
                        :value="`${selectedItemsCount(estimate.id)} / ${estimate.estimate_items?.length}`"
                        severity="secondary"
                    />
                </div>

                <!-- جدول المواد -->
                <DataTable :value="estimate.estimate_items ?? []" size="small"
                    :pt="{ thead: { class: 'surface-100' }, tbody: { class: 'surface-0' } }">

                    <!-- checkbox -->
                    <Column style="width:48px">
                        <template #body="{ data: item }">
                            <Checkbox
                                :modelValue="isItemSelected(item.id)"
                                :binary="true"
                                @update:modelValue="emit('onItemToggled', estimate.id, item, $event)"
                            />
                        </template>
                    </Column>

                    <!-- اسم المادة -->
                    <Column>
                        <template #header><span class="text-600 text-sm">المادة</span></template>
                        <template #body="{ data: item }">
                            <div class="flex align-items-center gap-2"
                                :class="!isItemSelected(item.id) ? 'opacity-50' : ''">
                                <i class="fas fa-box text-400 text-xs"/>
                                <span class="font-medium text-900">{{ item.item_name }}</span>
                            </div>
                        </template>
                    </Column>

                    <!-- الكمية -->
                    <Column style="width:90px">
                        <template #header><span class="text-600 text-sm">الكمية</span></template>
                        <template #body="{ data: item }">
                            <Tag :value="`${item.quantity}`" severity="secondary"
                                :class="!isItemSelected(item.id) ? 'opacity-50' : ''"
                                :pt="{ root: { class: 'border-round-lg px-3' } }" />
                        </template>
                    </Column>

                    <!-- سعر عرض السعر -->
                    <Column style="width:140px">
                        <template #header><span class="text-600 text-sm">سعر العرض</span></template>
                        <template #body="{ data: item }">
                            <span class="font-medium text-700"
                                :class="!isItemSelected(item.id) ? 'opacity-50' : ''">
                                {{ formatCurrency(item.unit_price) }}
                                <small class="text-400 mr-1">د.ع</small>
                            </span>
                        </template>
                    </Column>

                    <!-- سعر الشراء -->
                    <Column style="width:170px">
                        <template #header>
                            <span class="text-600 text-sm">سعر الشراء</span>
                        </template>
                        <template #body="{ data: item }">
                            <InputNumber
                                v-if="isItemSelected(item.id)"
                                :modelValue="getItemPurchasePrice(item.id)"
                                @update:modelValue="val => setItemPurchasePrice(item.id, val ?? 0)"
                                :min="0" mode="decimal" :useGrouping="true"
                                :inputStyle="{ width: '130px' }"
                                size="small"
                            />
                            <span v-else class="text-300">—</span>
                        </template>
                    </Column>

                    <!-- الفرق -->
                    <Column style="width:120px">
                        <template #header><span class="text-600 text-sm">الفرق</span></template>
                        <template #body="{ data: item }">
                            <template v-if="isItemSelected(item.id)">
                                <span :class="getDifferenceClass(item.id, item.unit_price)"
                                    class="font-semibold text-sm">
                                    {{ getDifferenceLabel(item.id, item.unit_price) }}
                                </span>
                            </template>
                            <span v-else class="text-300">—</span>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- إجمالي -->
            <div v-if="form.items.length"
                class="flex justify-content-between align-items-center px-4 py-3 border-round-xl"
                style="background:linear-gradient(135deg,#1e3a5f,#2d5986)">
                <div class="flex align-items-center gap-2 text-white">
                    <i class="fas fa-circle-check text-green-400"/>
                    <span class="text-sm">{{ form.items.length }} مادة محددة</span>
                </div>
                <div>
                    <span class="text-white font-bold text-xl">
                        {{ totalAmount.toLocaleString() }}
                    </span>
                    <span class="text-blue-200 text-sm mr-2">د.ع</span>
                </div>
            </div>

            <!-- empty -->
            <div v-else
                class="flex flex-column align-items-center justify-content-center gap-2 py-5 text-400 surface-50 border-round-xl border-1 border-200">
                <i class="fas fa-boxes-stacked text-3xl"/>
                <span class="text-sm">اختر المواد من عروض الأسعار أعلاه</span>
            </div>
        </div>
        </Transition>

        <!-- ─── Footer ────────────────────────────────────────────────────── -->
        <template #footer>
            <div class="flex justify-content-between align-items-center w-full">
                <Button v-if="currentStep > 0"
                    label="السابق" icon="fas fa-arrow-right"
                    severity="secondary" variant="outlined"
                    class="border-round-lg"
                    @click="emit('update:currentStep', currentStep - 1)"
                />
                <div v-else/>

                <div class="flex gap-2">
                    <Button label="إلغاء" icon="fas fa-times"
                        severity="secondary" variant="outlined"
                        class="border-round-lg"
                        @click="emit('update:visible', false)"
                    />
                    <Button v-if="currentStep < 2"
                        label="التالي" icon="fas fa-arrow-left" iconPos="right"
                        class="border-round-lg"
                        :disabled="!canGoNext"
                        @click="emit('update:currentStep', currentStep + 1)"
                    />
                    <Button v-else
                        :label="isEditMode ? 'تحديث' : 'حفظ'"
                        icon="fas fa-floppy-disk"
                        :loading="isSaving"
                        :disabled="!form.items.length"
                        class="border-round-lg"
                        @click="emit('submit')"
                    />
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Badge from 'primevue/badge';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import type { ProcurementPayload } from '../procurementService';

const statusOptions = [
    { label: 'جارية',  value: 'in_progress', icon: 'fas fa-spinner',      color: 'var(--yellow-500)' },
    { label: 'مكتملة', value: 'completed',   icon: 'fas fa-circle-check', color: 'var(--green-500)'  },
    { label: 'ملغاة',  value: 'cancelled',   icon: 'fas fa-circle-xmark', color: 'var(--red-500)'    },
];

const steps      = ['طلب الشراء', 'عروض الأسعار', 'المواد والأسعار'];
const stepTitles = ['اختر طلب الشراء والمعلومات الأساسية', 'اختر عروض الأسعار المراد الشراء منها', 'حدد المواد وأدخل أسعار الشراء'];

const props = defineProps<{
    visible: boolean;
    isEditMode: boolean;
    form: ProcurementPayload;
    allPurchase: any[];
    estimatesByPurchase: any[];
    selectedEstimateIds: number[];
    selectedEstimates: any[];
    currentStep: number;
    isSaving: boolean;
    isLoadingEstimates?: boolean;
}>();

const emit = defineEmits<{
    'update:visible':      [boolean];
    'update:currentStep':  [number];
    'submit':              [];
    'reset':               [];
    'onPurchaseSelected':  [number];
    'onEstimatesSelected': [number[]];
    'onItemToggled':       [estimateId: number, item: any, checked: boolean];
}>();

const purchaseDateModel = computed({
    get: () => props.form.purchase_date ? new Date(props.form.purchase_date) : null,
    set: (v: Date | null) => { props.form.purchase_date = v?.toISOString().split('T')[0] ?? null; },
});

const totalAmount = computed(() =>
    props.form.items.reduce((s, i) => s + (Number(i.purchase_price) * Number(i.quantity)), 0)
);

const canGoNext = computed(() => {
    if (props.currentStep === 0) return !!props.form.purchase_request_id;
    if (props.currentStep === 1) return props.selectedEstimateIds.length > 0;
    return true;
});

const toggleEstimate = (estimateId: number) => {
    const current = [...props.selectedEstimateIds];
    const idx = current.indexOf(estimateId);
    if (idx === -1) current.push(estimateId);
    else current.splice(idx, 1);
    emit('onEstimatesSelected', current);
};

const isItemSelected = (estimateItemId: number) =>
    props.form.items.some(i => i.estimate_item_id === estimateItemId);

const getItemPurchasePrice = (estimateItemId: number) =>
    props.form.items.find(i => i.estimate_item_id === estimateItemId)?.purchase_price ?? 0;

const setItemPurchasePrice = (estimateItemId: number, val: number) => {
    const item = props.form.items.find(i => i.estimate_item_id === estimateItemId);
    if (item) item.purchase_price = val;
};

const selectedItemsCount = (estimateId: number) =>
    props.form.items.filter(i => i.estimate_id === estimateId).length;

const getDifferenceClass = (estimateItemId: number, estimatePrice: number) => {
    const purchase = getItemPurchasePrice(estimateItemId);
    const diff = purchase - Number(estimatePrice);
    if (diff > 0) return 'text-red-500';
    if (diff < 0) return 'text-green-500';
    return 'text-400';
};

const getDifferenceLabel = (estimateItemId: number, estimatePrice: number) => {
    const purchase = getItemPurchasePrice(estimateItemId);
    const diff = purchase - Number(estimatePrice);
    if (diff === 0) return '—';
    return `${diff > 0 ? '+' : ''}${diff.toLocaleString()}`;
};

const formatDate     = (d?: string | null) => d ? new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const formatCurrency = (v: any) => parseFloat(v || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
</script>

<style scoped>
.slide-fade-enter-active { transition: all 0.25s ease-out; }
.slide-fade-leave-active { transition: all 0.2s ease-in; }
.slide-fade-enter-from,
.slide-fade-leave-to { opacity: 0; transform: translateX(10px); }
</style>