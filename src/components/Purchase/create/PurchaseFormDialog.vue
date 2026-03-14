<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import UnitService from '../../units/unitsService';
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
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Message from 'primevue/message';

import UploadFile from './components/fileUpload.vue';

import purchaseRequestsService from '../services/purchaseRequests.service';
import DepartmentService from '../../departments/DepartmentService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const confirm = useConfirm();
const departmentId = ref<number>();
const hasDeapartment = ref<boolean>(false);
const validationMessages = ref<string[]>([]);

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

const unitIsLoading = ref(true);
const unitsList = ref<any[]>([]);

const getAllUnits = async()=>{
    unitIsLoading.value = true;
    try {
        const response = await UnitService.getAllUnits();
        unitsList.value = response.data;
    } catch (err: any) {
        console.log(err);
        toast.add({
            severity: 'danger',
            summary: "رسالة خطاء",
            detail: "حدث خطاء ما اثناء جلب وحدات القياس",
            life: 3000
        });
    } finally {
        unitIsLoading.value = false;
    }
}



const form = reactive({
    title: '',
    description: '',
    department_id: null as number | null,
    priority: 'medium',
    items: [] as any[],
});

const newFilesToUpload = ref<File[]>([]);
const existingFiles = ref<any[]>([]);

/* =========================
VALIDATION ERRORS
========================= */
const formErrors = reactive({
    title: '',
    description: '',
    department_id: '',
    items: '',
    images: ''
});

const itemErrors = reactive({
    item_name: '',
    quantity: '',
    unit: '',
    specifications: ''
});

function resetFormErrors() {
    formErrors.title = '';
    formErrors.description = '';
    formErrors.department_id = '';
    formErrors.items = '';
    formErrors.images = '';
    validationMessages.value = [];
}

function resetItemErrors() {
    itemErrors.item_name = '';
    itemErrors.quantity = '';
    itemErrors.unit = '';
    itemErrors.specifications = '';
    validationMessages.value = [];
}

function validateForm(): boolean {
    resetFormErrors();
    validationMessages.value = [];
    let isValid = true;

    if (!form.title || form.title.trim() === '') {
        formErrors.title = 'عنوان الطلب مطلوب';
        validationMessages.value.push('يرجى إدخال عنوان الطلب');
        isValid = false;
    } else if (form.title.length < 3) {
        formErrors.title = 'العنوان يجب أن يكون 3 أحرف على الأقل';
        validationMessages.value.push('عنوان الطلب قصير جداً (3 أحرف على الأقل)');
        isValid = false;
    } else if (form.title.length > 200) {
        formErrors.title = 'العنوان طويل جداً (200 حرف كحد أقصى)';
        validationMessages.value.push('عنوان الطلب طويل جداً');
        isValid = false;
    }

    const finalDepartmentId = departmentId.value ?? form.department_id;
    if (!finalDepartmentId) {
        formErrors.department_id = 'القسم مطلوب';
        validationMessages.value.push('يرجى اختيار القسم');
        isValid = false;
    }

    if (!form.items || form.items.length === 0) {
        formErrors.items = 'يجب إضافة مادة واحدة على الأقل';
        validationMessages.value.push('يجب إضافة مادة واحدة على الأقل للطلب');
        isValid = false;
    }

    if (newFilesToUpload.value.length === 0 && existingFiles.value.length === 0) {
        formErrors.images = 'يجب رفع صورة واحدة على الأقل';
        validationMessages.value.push('يجب رفع صورة واحدة على الأقل');
        isValid = false;
    }

    return isValid;
}

function validateItem(): boolean {
    resetItemErrors();
    validationMessages.value = [];
    let isValid = true;

    if (!itemForm.item_name || itemForm.item_name.trim() === '') {
        itemErrors.item_name = 'اسم المادة مطلوب';
        validationMessages.value.push('يرجى إدخال اسم المادة');
        isValid = false;
    } else if (itemForm.item_name.length < 2) {
        itemErrors.item_name = 'اسم المادة قصير جداً';
        validationMessages.value.push('اسم المادة يجب أن يكون حرفين على الأقل');
        isValid = false;
    }

    if (!itemForm.quantity || itemForm.quantity <= 0) {
        itemErrors.quantity = 'الكمية مطلوبة ويجب أن تكون أكبر من صفر';
        validationMessages.value.push('يرجى إدخال كمية صحيحة (أكبر من صفر)');
        isValid = false;
    } else if (itemForm.quantity > 1000000) {
        itemErrors.quantity = 'الكمية كبيرة جداً';
        validationMessages.value.push('الكمية المدخلة كبيرة جداً');
        isValid = false;
    }

    if (!itemForm.unit) {
        itemErrors.unit = 'وحدة القياس مطلوبة';
        validationMessages.value.push('يرجى اختيار وحدة القياس');
        isValid = false;
    }

    if (itemForm.estimated_unit_price !== null && itemForm.estimated_unit_price !== undefined) {
        if (itemForm.estimated_unit_price < 0) {
            validationMessages.value.push('السعر لا يمكن أن يكون سالباً');
            isValid = false;
        } else if (itemForm.estimated_unit_price > 100000000) {
            validationMessages.value.push('السعر كبير جداً');
            isValid = false;
        }
    }

    if (itemForm.specifications && itemForm.specifications.length > 500) {
        itemErrors.specifications = 'المواصفات طويلة جداً (500 حرف كحد أقصى)';
        validationMessages.value.push('المواصفات طويلة جداً (500 حرف كحد أقصى)');
        isValid = false;
    }

    return isValid;
}

/* =========================
LOAD DEPARTMENTS
========================= */
const loadDepartments = async () => {
    try {
        const res = await DepartmentService.getAll();
        departments.value = Array.isArray(res) ? res : (res as any).data ?? [];

        if (!departments.value || departments.value.length === 0) {
            toast.add({ severity: 'warn', summary: 'تنبيه', detail: 'لا توجد أقسام متاحة', life: 3000 });
        }
    } catch (error: any) {
        console.error('Error loading departments:', error);
        toast.add({
            severity: 'error',
            summary: 'خطأ في تحميل البيانات',
            detail: error?.response?.data?.message || 'تعذر جلب الأقسام، يرجى المحاولة مرة أخرى',
            life: 4000
        });
    }
};

onMounted(async () => {
    try {
        const row = localStorage.getItem('auth_department');
        if (row) {
            const authDepartment = JSON.parse(row);
            if (authDepartment?.id) {
                departmentId.value = authDepartment.id;
                hasDeapartment.value = true;
                return;
            }
        }
        loadDepartments();
    } catch (err) {
        console.error('Invalid auth_department in localStorage', err);
        toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ في قراءة بيانات القسم', life: 3000 });
        loadDepartments();
    }
});

/* =========================
WATCH OPEN DIALOG
========================= */
watch(
    () => props.visible,
    v => {
        if (!v) {
            resetFormErrors();
            return;
        }

        if (isEditMode.value && props.request) {
            try {
                form.title = props.request.title || '';
                form.description = props.request.description || '';
                form.department_id = props.request.department?.id || null;
                form.priority = props.request.priority || 'medium';
                
                existingFiles.value = props.request.images || [];

                form.items = props.request.items?.map((it: any) => ({
                    id: it.id,
                    item_name: it.item_name || '',
                    specifications: it.specifications ?? it.specs ?? '',
                    quantity: it.quantity || 0,
                    unit: it.unit?.id ?? it.unit ?? null,
                    estimated_unit_price: it.estimated_unit_price || null,
                })) || [];

                resetFormErrors();
            } catch (error) {
                console.error('Error loading request data:', error);
                toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ في تحميل بيانات الطلب', life: 3000 });
            }
        } else {
            resetForm();
            resetFormErrors();
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
    
    newFilesToUpload.value = [];
    existingFiles.value = [];

    resetFormErrors();
}

/* =========================
FILE UPLOAD HANDLER
========================= */
function onFilesUpdated(files: File[]) {
    newFilesToUpload.value = files;
}

/* =========================
ITEMS MANAGEMENT
========================= */
const itemDialogVisible = ref(false);
const isEditingItem = ref(false);
const currentItemIndex = ref<number | null>(null);
const itemNameInputRef = ref();

const itemForm = reactive({
    item_name: '',
    specifications: '',
    quantity: null as number | null,
    unit: null as number | null,
    estimated_unit_price: null as number | null,
});

function resetItemForm() {
    itemForm.item_name = '';
    itemForm.specifications = '';
    itemForm.quantity = null;
    itemForm.unit = null;
    itemForm.estimated_unit_price = null;
    resetItemErrors();
}

function openAddItem() {
    if (form.items.length >= 100) {
        toast.add({ severity: 'warn', summary: 'تحذير', detail: 'لا يمكن إضافة أكثر من 100 مادة في الطلب الواحد', life: 3000 });
        return;
    }

    isEditingItem.value = false;
    currentItemIndex.value = null;
    resetItemForm();
    itemDialogVisible.value = true;

    nextTick(() => {
        itemNameInputRef.value?.$el?.focus();
    });
}

function editItem(index: number) {
    if (index < 0 || index >= form.items.length) {
        toast.add({ severity: 'error', summary: 'خطأ', detail: 'المادة المحددة غير موجودة', life: 3000 });
        return;
    }

    const item = form.items[index];
    isEditingItem.value = true;
    currentItemIndex.value = index;

    Object.assign(itemForm, item);
    resetItemErrors();
    itemDialogVisible.value = true;
}

function saveItem() {
    if (!validateItem()) return;

    const payload = { ...itemForm };

    try {
        if (isEditingItem.value && currentItemIndex.value !== null) {
            form.items[currentItemIndex.value] = payload;
            toast.add({ severity: "success", summary: "تم التحديث", detail: "تم تحديث المادة بنجاح", life: 3000 });
        } else {
            form.items.push(payload);
            toast.add({ severity: "success", summary: "تمت الإضافة", detail: "تم إضافة المادة بنجاح", life: 3000 });
        }

        itemDialogVisible.value = false;
        resetItemForm();
        isEditingItem.value = false;
        currentItemIndex.value = null;
    } catch (error) {
        console.error('Error saving item:', error);
        toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء حفظ المادة', life: 3000 });
    }
}

function deleteItem(index: number) {
    if (index < 0 || index >= form.items.length) {
        toast.add({ severity: 'error', summary: 'خطأ', detail: 'المادة المحددة غير موجودة', life: 3000 });
        return;
    }

    confirm.require({
        header: "تأكيد حذف المادة",
        message: "هل أنت متأكد من حذف المادة من الطلب؟",
        icon: "pi pi-exclamation-triangle text-yellow-500",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass: "p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass: "p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: () => {
            try {
                form.items.splice(index, 1);
                toast.add({ severity: 'success', summary: 'تم الحذف', detail: 'تم حذف المادة بنجاح', life: 2500 });
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء حذف المادة', life: 3000 });
            }
        }
    });
}

/* =========================
SUBMIT
========================= */
async function submit() {
     console.log(formErrors);
    if (!validateForm()) return;

    const finalDepartmentId = departmentId.value ?? form.department_id;

    try {
        loading.value = true;

        // ✅ استخدام FormData لإرسال الملفات مع البيانات
        const formData = new FormData();
        formData.append('title', form.title.trim());
        formData.append('description', form.description.trim());
        formData.append('department_id', String(finalDepartmentId));
        formData.append('priority', form.priority);

        form.items.forEach((item: any, index: number) => {
            for (const key in item) {
                if (item[key] !== null && item[key] !== undefined) {
                    formData.append(`items[${index}][${key}]`, String(item[key]));
                }
            }
        });


        if (newFilesToUpload.value.length > 0) {
            newFilesToUpload.value.forEach((file: File) => {
                formData.append('images[]', file);
            });
        }


        const res = isEditMode.value
            ? await purchaseRequestsService.update(props.request.id, formData)
            : await purchaseRequestsService.create(formData);

        toast.add({
            severity: 'success',
            summary: isEditMode.value ? 'تم التحديث' : 'تم الإنشاء',
            detail: isEditMode.value ? 'تم تعديل طلب الشراء بنجاح' : 'تم إنشاء طلب الشراء بنجاح',
            life: 2500
        });

        emit(isEditMode.value ? 'updated' : 'submitted', (res as any).data ?? res);
        emit('update:visible', false);
        resetForm();

    } catch (err: any) {
        console.error('Submit error:', err);

        let errorMessage = 'حدث خطأ غير متوقع';

        if (err?.response?.status === 401) {
            errorMessage = 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى';
        } else if (err?.response?.status === 403) {
            errorMessage = 'ليس لديك صلاحية لتنفيذ هذا الإجراء';
        } else if (err?.response?.status === 404) {
            errorMessage = 'الطلب غير موجود';
        } else if (err?.response?.status === 422) {
            errorMessage = err?.response?.data?.message || 'البيانات المدخلة غير صحيحة';
        } else if (err?.response?.status === 500) {
            errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
        } else if (err?.message === 'Network Error') {
            errorMessage = 'خطأ في الاتصال بالشبكة، يرجى التحقق من اتصال الإنترنت';
        } else if (err?.response?.data?.message) {
            errorMessage = err.response.data.message;
        }

        toast.add({ severity: 'error', summary: 'خطأ', detail: errorMessage, life: 4000 });
    } finally {
        loading.value = false;
    }
}

function closeItemDialog() {
    const hasData = itemForm.item_name || itemForm.quantity || itemForm.unit || itemForm.specifications;


    if (hasData && !isEditingItem.value) {
        confirm.require({
            header: "تأكيد الإغلاق",
            message: "هل أنت متأكد من إغلاق النافذة؟ سيتم فقدان البيانات المدخلة.",
            icon: "pi pi-exclamation-triangle text-yellow-500",
            acceptLabel: "نعم، أغلق",
            acceptIcon: "pi pi-check",
            acceptClass: "p-button-sm border border-red-500 bg-red-500 text-white",
            rejectLabel: "إلغاء",
            rejectIcon: "pi pi-times",
            rejectClass: "p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
            accept: () => {
                itemDialogVisible.value = false;
                resetItemForm();
            }
        });
    } else {
        itemDialogVisible.value = false;
        resetItemForm();
    }
}

onMounted(()=>{
    getAllUnits();
})
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
                <Message
                    v-if="validationMessages.length"
                    severity="error"
                    class="mb-3"
                    :closable="true"
                    @close="validationMessages = []"
                >
                    <ul class="m-0 pr-3">
                        <li v-for="(msg, i) in validationMessages" :key="i">{{ msg }}</li>
                    </ul>
                </Message>
                
                <FloatLabel variant="on" class="mt-3">
                    <InputText
                        v-model="form.title"
                        fluid
                        id="title_field"
                        :class="{ 'p-invalid': formErrors.title }"
                        maxlength="200"
                    />
                    <label for="title_field" class="font-semibold block mb-2">
                        <i class="fa-solid fa-heading"/>
                        عنوان الطلب
                        <span class="text-red-500">*</span>
                    </label>
                </FloatLabel>
                <small v-if="formErrors.title" class="p-error block mt-1">{{ formErrors.title }}</small>

                <FloatLabel variant="on" class="mt-4">
                    <Textarea
                        v-model="form.description"
                        id="description_field"
                        rows="3"
                        fluid
                        maxlength="1000"
                    />
                    <label for="description_field" class="font-semibold block mb-2">
                        <i class="fa-solid fa-text-width"/>
                        الوصف
                    </label>
                </FloatLabel>

                <!-- القسم + الأولوية -->
                <div class="grid mt-4">
                    <div class="col-12 md:col-6" v-if="!hasDeapartment">
                        <FloatLabel variant="on">
                            <Select
                                v-model="form.department_id"
                                :options="departments"
                                optionLabel="name"
                                optionValue="id"
                                fluid
                                id="department_field"
                                :class="{ 'p-invalid': formErrors.department_id }"
                            />
                            <label for="department_field" class="font-semibold block mb-2">
                                <i class="fa-solid fa-layer-group"/>
                                القسم
                                <span class="text-red-500">*</span>
                            </label>
                        </FloatLabel>
                        <small v-if="formErrors.department_id" class="p-error block mt-1">{{ formErrors.department_id }}</small>
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
                            <label for="priority_field" class="font-semibold block mb-2">
                                <i class="fa-solid fa-circle-exclamation"/>
                                الأولوية
                            </label>
                        </FloatLabel>
                    </div>
                </div>

                <Divider />

                <!-- المواد -->
                <div class="flex justify-content-between align-items-center mb-3">
                    <h3 class="text-xl font-bold m-0">
                        المواد المطلوبة
                        <span class="text-red-500">*</span>
                    </h3>
                    <span class="text-sm text-gray-500">({{ form.items.length }} مادة)</span>
                </div>

                <Button
                    icon="fas fa-plus"
                    label="إضافة مادة"
                    v-tooltip="{ value: 'اضغط لإضافة مادة جديدة', showDelay: 200, hideDelay: 300 }"
                    outlined
                    severity="warn"
                    class="mb-3"
                    @click="openAddItem"
                />
                <small v-if="formErrors.items" class="p-error block mt-1 mb-2">{{ formErrors.items }}</small>

                <DataTable
                    v-if="form.items.length"
                    :value="form.items"
                    class="mt-3"
                    stripedRows
                >
                    <Column field="item_name">
                        <template #header>
                            <i class="fas fa-box text-gray-500"/> اسم المادة
                        </template>
                    </Column>

                    <Column field="quantity">
                        <template #header>
                            <i class="fas fa-hashtag text-gray-500"/> الكمية
                        </template>
                    </Column>

                    <Column field="unit">
                        <template #header>
                            <i class="fas fa-object-group text-gray-500"/> الوحدة
                        </template>
                        <template #body="slotProps">
                            <Tag
                                v-if="unitsList.find(u=>u.id===slotProps.data.unit)"
                                :value="unitsList.find(u=>u.id===slotProps.data.unit)?.name"
                                severity="warn"
                                class="font-mono text-xs"
                            />
                            <span v-else class="text-color-warn text-sm">-</span>
                        </template>
                    </Column>

                    <Column field="specifications">
                        <template #header>
                            <i class="fas fa-tags text-gray-500"/> المواصفات
                        </template>
                        <template #body="slotProps">
                            <span v-if="slotProps.data.specifications" class="text-sm">
                                {{ slotProps.data.specifications.substring(0, 50) }}
                                {{ slotProps.data.specifications.length > 50 ? '...' : '' }}
                            </span>
                            <span v-else class="text-gray-400 text-sm">-</span>
                        </template>
                    </Column>

                    <Column>
                        <template #header>
                            <i class="fas fa-cogs"/> الإدارة
                        </template>
                        <template #body="slotProps">
                            <Button
                                icon="pi pi-pencil"
                                text
                                severity="info"
                                v-tooltip.top="'تعديل'"
                                @click="editItem(slotProps.index)"
                            />
                            <Button
                                icon="pi pi-trash"
                                text
                                severity="danger"
                                v-tooltip.top="'حذف'"
                                @click="deleteItem(slotProps.index)"
                            />
                        </template>
                    </Column>
                </DataTable>

                <Card v-else class="card text-center p-4 border-round">
                    <template #content>
                        <i class="fas fa-inbox text-4xl mb-3 text-gray-400 dark:text-gray-300"></i>
                        <p class="font-medium">لا توجد مواد مضافة بعد</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">اضغط على زر "إضافة مادة" لبدء إضافة المواد</p>
                    </template>
                </Card>

                <Divider />

                <div class="mt-2">
                    <div class="flex align-items-center gap-2 mb-3">
                        <i class="fas fa-paperclip text-gray-500 text-lg" />
                        <h3 class="text-xl font-bold m-0">المرفقات</h3>
                        <span class="text-sm text-gray-400">(اختياري)</span>
                    </div>

                    <UploadFile @update:files="onFilesUpdated" :existing-files="existingFiles" />
                    <small v-if="formErrors.images" class="p-error flex align-items-center gap-1 mt-1">
                        <i class="pi pi-exclamation-circle text-xs" />
                        {{ formErrors.images }}
                    </small>
                </div>

            </template>

            <template #footer>
                <div class="flex justify-content-end gap-2">
                    <Button
                        label="إغلاق"
                        icon="fas fa-times"
                        outlined
                        severity="secondary"
                        @click="internalVisible = false"
                        :disabled="loading"
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
        :closable="true"
    >
        <div class="p-fluid">
            <FloatLabel variant="on" class="mt-3">
                <InputText
                    v-model="itemForm.item_name"
                    id="itemName_field"
                    class="w-full"
                    ref="itemNameInputRef"
                    :class="{ 'p-invalid': itemErrors.item_name }"
                    maxlength="200"
                />
                <label for="itemName_field" class="font-semibold mb-2 block">
                    <i class="fas fa-box"/> اسم المادة
                    <span class="text-red-500">*</span>
                </label>
            </FloatLabel>
            <small v-if="itemErrors.item_name" class="p-error block mt-1">{{ itemErrors.item_name }}</small>

            <FloatLabel variant="on" class="mt-5">
                <InputNumber
                    v-model="itemForm.quantity"
                    id="quantity_field"
                    inputClass="w-full"
                    class="w-full"
                    :invalid="itemErrors.quantity != ''"
                    :min="0"
                    :max="1000000"
                />
                <label for="quantity_field" class="font-semibold mb-2 block">
                    <i class="fas fa-hashtag"/> الكمية
                    <span class="text-red-500">*</span>
                </label>
            </FloatLabel>
            <small v-if="itemErrors.quantity" class="p-error block mt-1">{{ itemErrors.quantity }}</small>

            <FloatLabel variant="on" class="mt-5">
                <Select
                    v-model="itemForm.unit"
                    id="unit_field"
                    :options="unitsList"
                    optionLabel="name"
                    optionValue="id"
                    filter
                    fluid
                    show-clear
                    :loading="unitIsLoading"
                    :invalid="itemErrors.unit != ''"
                >
                    <template #value="{ value }">
                        <div v-if="value" class="flex align-items-center gap-2">
                            <Tag
                                v-if="unitsList.find(u => u.id === value)?.code"
                                :value="unitsList.find(u => u.id === value)?.code"
                                severity="secondary"
                                class="font-mono text-xs"
                            />
                            <span class="font-semibold text-sm">
                                {{ unitsList.find(u => u.id === value)?.name }}
                            </span>
                        </div>
                    </template>

                    <template #option="{ option }">
                        <div class="flex align-items-center gap-2 w-full">
                            <Avatar
                                :label="option.name.charAt(0).toUpperCase()"
                                size="small"
                                shape="square"
                                class="text-xs font-bold flex-shrink-0"
                            />
                            <div class="flex flex-column flex-1 min-w-0">
                                <span class="font-semibold text-sm">{{ option.name }}</span>
                                <span v-if="option.description" class="text-color-secondary text-xs">
                                    {{ option.description }}
                                </span>
                            </div>
                            <Tag
                                v-if="option.code"
                                :value="option.code"
                                severity="secondary"
                                class="font-mono text-xs flex-shrink-0"
                            />
                        </div>
                    </template>
                </Select>
                <label for="unit_field" class="font-semibold mb-2 block">
                    <i class="fas fa-object-group"/> اختر الوحدة
                    <span class="text-red-500">*</span>
                </label>
            </FloatLabel>
            <small v-if="itemErrors.unit" class="p-error block mt-1">{{ itemErrors.unit }}</small>

            <FloatLabel variant="on" class="mt-5">
                <Textarea
                    v-model="itemForm.specifications"
                    id="specifications_field"
                    class="w-full"
                    rows="3"
                    auto-resize
                    :maxlength="500"
                    :class="{ 'p-invalid': itemErrors.specifications }"
                />
                <label for="specifications_field" class="font-semibold mb-2 block">
                    <i class="fa-solid fa-tags"/> المواصفات
                </label>
            </FloatLabel>
            <small v-if="itemErrors.specifications" class="p-error block mt-1">{{ itemErrors.specifications }}</small>
            <small v-else-if="itemForm.specifications" class="text-gray-500 block mt-1">
                {{ itemForm.specifications.length }} / 500 حرف
            </small>

            <div class="mt-4 flex justify-content-end gap-2">
                <Button label="إلغاء" icon="fas fa-times" outlined severity="secondary" @click="closeItemDialog" />
                <Button :label="isEditingItem ? 'تحديث' : 'إضافة'" icon="fas fa-check" @click="saveItem" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.p-invalid {
    border-color: #ef4444 !important;
}

.p-error {
    color: #ef4444;
    font-size: 0.875rem;
}
</style>