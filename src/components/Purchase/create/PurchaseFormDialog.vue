<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';

import Dialog from 'primevue/dialog';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';
import { useConfirm } from "primevue/useconfirm";

import purchaseRequestsService from '../services/purchaseRequests.service';
import DepartmentService from '../../departments/DepartmentService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const confirm = useConfirm();

/* =========================
   PROPS & EMITS
========================= */
const props = defineProps<{
    visible: boolean;
    request?: any | null;
}>();

const emit = defineEmits([
    'update:visible',
    'submitted',
    'updated'
]);

const internalVisible = computed({
    get: () => props.visible,
    set: v => emit('update:visible', v)
});

const isEditMode = computed(() => !!props.request);
const loading = ref(false);

/* =========================
   DATA
========================= */
const departments = ref<any[]>([]);

const priorities = [
    { label: 'عالية', value: 'high' },
    { label: 'متوسطة', value: 'medium' },
    { label: 'منخفضة', value: 'low' },
];

const unitsList = [
    { value: "piece", label: "قطعة" },
    { value: "box", label: "صندوق" },
    { value: "carton", label: "كارتون" },
    { value: "pack", label: "حزمة" },
    { value: "set", label: "طقم" },
    { value: "kg", label: "كيلوجرام" },
    { value: "g", label: "غرام" },
    { value: "ton", label: "طن" },
    { value: "meter", label: "متر" },
    { value: "cm", label: "سنتيمتر" },
    { value: "liter", label: "لتر" },
    { value: "ml", label: "ملي لتر" },
];

const form = reactive({
    title: '',
    description: '',
    department_id: null as number | null,
    priority: 'medium',
    items: [] as any[],
});

/* =========================
   LOAD DEPARTMENTS
========================= */
onMounted(async () => {
    try {
        const res = await DepartmentService.getAll();
        departments.value = res.data ?? res;
    } catch {
        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'تعذر جلب الأقسام',
            life: 2000
        });
    }
});

/* =========================
   WATCH OPEN DIALOG
========================= */
watch(
    () => props.visible,
    v => {
        if (!v) return;

        if (isEditMode.value && props.request) {
            form.title = props.request.title;
            form.description = props.request.description;
            form.department_id = props.request.department.id;
            form.priority = props.request.priority;

            form.items = props.request.items.map((it: any) => ({
                id: it.id,
                item_name: it.item_name,
                specifications: it.specifications ?? it.specs ?? '',
                quantity: it.quantity,
                unit: it.unit,
                estimated_unit_price: it.estimated_unit_price,
            }));
        } else {
            resetForm();
        }
    }
);

/* =========================
   RESET FORM
========================= */
function resetForm() {
    form.title = '';
    form.description = '';
    form.department_id = null;
    form.priority = 'medium';
    form.items = [];
}

/* =========================
   ITEMS MANAGEMENT
========================= */
const itemDialogVisible = ref(false);
const isEditingItem = ref(false);
const currentItemIndex = ref<number | null>(null);

const itemForm = reactive({
    item_name: '',
    specifications: '',
    quantity: null as number | null,
    unit: '',
    estimated_unit_price: null as number | null,
});

function resetItemForm() {
    itemForm.item_name = '';
    itemForm.specifications = '';
    itemForm.quantity = null;
    itemForm.unit = '';
    itemForm.estimated_unit_price = null;
}

function openAddItem() {
    isEditingItem.value = false;
    currentItemIndex.value = null;
    resetItemForm();
    itemDialogVisible.value = true;
}

function editItem(index: number) {
    const item = form.items[index];
    isEditingItem.value = true;
    currentItemIndex.value = index;

    Object.assign(itemForm, item);
    itemDialogVisible.value = true;
}

function saveItem() {
    if (!itemForm.item_name || !itemForm.quantity) return;

    const payload = { ...itemForm };

    if (isEditingItem.value && currentItemIndex.value !== null) {
        form.items[currentItemIndex.value] = payload;
    } else {
        form.items.push(payload);
    }

    toast.add({
        severity: "success",
        summary: "رسالة نجاح",
        detail: "تم اضافة مادة جديده بنجاح",
        life: 3000
    })
    resetItemForm();
    isEditingItem.value = false;
    currentItemIndex.value = null;
}

function deleteItem(index: number) {
    confirm.require({
        header: "تاكيد حذف المادة",
        message: "هل انت متاكد من حذف المادة من الطلب؟",
        icon: "pi pi-exclamation-triangle text-yellow-500",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass:"p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass:"p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: ()=>{
            form.items.splice(index, 1);
        }
    })
}

/* =========================
   SUBMIT
========================= */
async function submit() {
    if (!form.title || !form.department_id || !form.items.length) {
        toast.add({
            severity: 'warn',
            summary: 'تنبيه',
            detail: 'يرجى تعبئة جميع الحقول المطلوبة',
            life: 2000
        });
        return;
    }

    try {
        loading.value = true;

        const payload = {
            title: form.title,
            description: form.description,
            department_id: form.department_id,
            priority: form.priority,
            items: form.items.map(it => ({
                id: isEditMode.value ? it.id : undefined,
                item_name: it.item_name,
                quantity: it.quantity,
                unit: it.unit,
                specs: it.specifications,
                estimated_unit_price: it.estimated_unit_price,
            }))
        };

        const res = isEditMode.value
            ? await purchaseRequestsService.update(props.request.id, payload)
            : await purchaseRequestsService.create(payload);

        toast.add({
            severity: 'success',
            summary: isEditMode.value ? 'تم التحديث' : 'تم الإنشاء',
            detail: isEditMode.value
                ? 'تم تعديل طلب الشراء بنجاح'
                : 'تم إنشاء طلب الشراء بنجاح',
            life: 2500
        });

        emit(isEditMode.value ? 'updated' : 'submitted', res.data);
        emit('update:visible', false);

    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: err?.response?.data?.message ?? 'حدث خطأ غير متوقع',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
}
</script>
<template>
    <Dialog
        v-model:visible="internalVisible"
        modal
        maximizable
        :style="{ width: '60vw' }"
        :header="isEditMode ? 'تعديل طلب الشراء' : 'إضافة طلب شراء جديد'"
        dir="rtl"
    >
        <Card>

            <template #content>

                <FloatLabel variant="on" class="mt-3">
                    <InputText v-model="form.title" fluid id="title_field"/>
                    <label for="title_field" class="font-semibold block mb-2"><i class="fa-solid fa-heading"/>عنوان الطلب</label>
                </FloatLabel>

                <FloatLabel variant="on" class="mt-4">
                    <Textarea v-model="form.description" id="description_field" rows="3" fluid />
                    <label for="description_field" class="font-semibold block mb-2"><i class="fa-solid fa-text-width"/>الوصف</label>
                </FloatLabel>

                <!-- القسم + الأولوية -->
                <div class="grid mt-4">
                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on">
                            <Select
                                v-model="form.department_id"
                                :options="departments"
                                optionLabel="name"
                                optionValue="id"
                                fluid
                                id="department_field"
                            />
                            <label for="department_field" class="font-semibold block mb-2"><i class="fa-solid fa-layer-group"/>القسم</label>
                        </FloatLabel>
                    </div>

                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on">
                            <Select
                                v-model="form.priority"
                                :options="priorities"
                                optionLabel="label"
                                optionValue="value"
                                fluid
                                id="priority_field"
                            />
                            <label for="priority_field" class="font-semibold block mb-2"><i class="fa-solid fa-circle-exclamation"/>الأولوية</label>
                        </FloatLabel>
                    </div>
                </div>

                <Divider />

                <!-- المواد -->
                <h3 class="text-xl font-bold mb-3">المواد المطلوبة</h3>

                <Button
                    icon="fas fa-plus"
                    v-tooltip="{ value: 'اضغط لاضافة مادة جديده', showDelay: 200, hideDelay: 300 }"
                    outlined
                    severity="warn"
                    class="mb-3"
                    @click="openAddItem"
                />

                <DataTable v-if="form.items.length" :value="form.items">
                    <Column field="item_name">
                        <template #header>
                            <i class="fas fa-box text-gray-500"/>
                            اسم المادة
                        </template>
                    </Column>

                    <Column field="quantity">
                        <template #header>
                            <i class="fas fa-hashtag text-gray-500"/>
                            الكمية
                        </template>
                    </Column>

                    <Column field="unit">
                        <template #header>
                            <i class="fas fa-object-group text-gray-500"/>
                            الوحدة  
                        </template>
                    </Column>

                    <Column field="specifications">
                        <template #header>
                            <i class="fas fa-star-half-stroke text-gray-500"/>
                            الاهمية
                        </template>
                    </Column>
                    <Column>
                        <template #header>
                            <i class="fas fa-cogs"/>
                            الادارة
                        </template>
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" text @click="editItem(slotProps.index)" />
                            <Button icon="pi pi-trash" text severity="danger" @click="deleteItem(slotProps.index)" />
                        </template>
                    </Column>
                </DataTable>

            </template>

            <template #footer>
                <div class="flex justify-content-end gap-2">
                     <Button
                        label="إغلاق"
                        icon="fas fa-times"
                        outlined
                        severity="secondary"
                        @click="internalVisible = false"
                    />
                    <Button
                        :label="loading
                            ? (isEditMode ? 'جاري التحديث...' : 'جاري الإرسال...')
                            : (isEditMode ? 'حفظ التعديلات' : 'إرسال الطلب')"
                        icon="fas fa-check"
                        :loading="loading"
                        @click="submit"
                    />
                </div>
            </template>

        </Card>
    </Dialog>

    <!-- Dialog إضافة / تعديل مادة -->
    <Dialog
        v-model:visible="itemDialogVisible"
        modal
        :style="{ width: '35vw' }"
        :header="isEditingItem ? 'تعديل مادة' : 'إضافة مادة'"
        dir="rtl"
    >
        <div class="p-fluid">
            <FloatLabel variant="on" class="mt-3">
                <InputText v-model="itemForm.item_name" id="itemName_field" class="w-full" ref="itemNameInputRef" />
                <label for="itemName_field" class="font-semibold mb-2 block"><i class="fas fa-box"/>اسم المادة</label>
            </FloatLabel>

            <FloatLabel variant="on" class="mt-5">
                <InputNumber  v-model="itemForm.quantity" id="quantity_field" inputClass="w-full" class="w-full"/>
                <label for="quantity_field" class="font-semibold mb-2 block"><i class="fas fa-hashtag"/>الكمية</label>
            </FloatLabel>

            <FloatLabel variant="on" class="mt-5">
                <Select v-model="itemForm.unit" id="unit_field" :options="unitsList" optionLabel="label" optionValue="value" filter fluid/>
                <label for="unit_field" class="font-semibold mb-2 block"><i class="fas fa-object-group"/>اختر الوحدة</label>
            </FloatLabel>

            <FloatLabel variant="on" class="mt-5">
                <Textarea v-model="itemForm.specifications" id="specifications_field" class="w-full" rows="3" auto-resize :maxlength="500" counter />
                <label for="specifications_field" class="font-semibold mb-2 block"><i class="fa-solid fa-tags"/>المواصفات</label>
            </FloatLabel>
            <div class="mt-4 flex justify-content-end gap-2">
                <Button label="اغلاق" icon="fas fa-times" outlined severity="secondary" @click="itemDialogVisible = false" />
                <Button label="حفظ" icon="fas fa-check" @click="saveItem" />
            </div>
        </div>
    </Dialog>
</template>
<style scoped>

</style>