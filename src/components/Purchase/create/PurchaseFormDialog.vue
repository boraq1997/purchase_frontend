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
import { hasPermission } from '../../services/permission';

const toast = useToast();
const confirm = useConfirm();
const departmentId = ref<number>();
const hasDeapartment = ref<boolean>(false);

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
   VALIDATION ERRORS
========================= */
const formErrors = reactive({
    title: '',
    description: '',
    department_id: '',
    items: ''
});

const itemErrors = reactive({
    item_name: '',
    quantity: '',
    unit: '',
    specifications: ''
});

// دالة لإعادة تعيين أخطاء النموذج الرئيسي
function resetFormErrors() {
    formErrors.title = '';
    formErrors.description = '';
    formErrors.department_id = '';
    formErrors.items = '';
}

// دالة لإعادة تعيين أخطاء المادة
function resetItemErrors() {
    itemErrors.item_name = '';
    itemErrors.quantity = '';
    itemErrors.unit = '';
    itemErrors.specifications = '';
}

// دالة للتحقق من صحة النموذج الرئيسي
function validateForm(): boolean {
    resetFormErrors();
    let isValid = true;

    // التحقق من العنوان
    if (!form.title || form.title.trim() === '') {
        formErrors.title = 'عنوان الطلب مطلوب';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'يرجى إدخال عنوان الطلب',
            life: 3000
        });
    } else if (form.title.length < 3) {
        formErrors.title = 'العنوان يجب أن يكون 3 أحرف على الأقل';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'عنوان الطلب قصير جداً (3 أحرف على الأقل)',
            life: 3000
        });
    } else if (form.title.length > 200) {
        formErrors.title = 'العنوان طويل جداً (200 حرف كحد أقصى)';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'عنوان الطلب طويل جداً',
            life: 3000
        });
    }

    // التحقق من القسم
    const finalDepartmentId = departmentId.value ?? form.department_id;
    if (!finalDepartmentId) {
        formErrors.department_id = 'القسم مطلوب';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'يرجى اختيار القسم',
            life: 3000
        });
    }

    // التحقق من المواد
    if (!form.items || form.items.length === 0) {
        formErrors.items = 'يجب إضافة مادة واحدة على الأقل';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'يجب إضافة مادة واحدة على الأقل للطلب',
            life: 3000
        });
    }

    return isValid;
}

// دالة للتحقق من صحة بيانات المادة
function validateItem(): boolean {
    resetItemErrors();
    let isValid = true;

    // التحقق من اسم المادة
    if (!itemForm.item_name || itemForm.item_name.trim() === '') {
        itemErrors.item_name = 'اسم المادة مطلوب';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'يرجى إدخال اسم المادة',
            life: 3000
        });
    } else if (itemForm.item_name.length < 2) {
        itemErrors.item_name = 'اسم المادة قصير جداً';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'اسم المادة يجب أن يكون حرفين على الأقل',
            life: 3000
        });
    }

    // التحقق من الكمية
    if (!itemForm.quantity || itemForm.quantity <= 0) {
        itemErrors.quantity = 'الكمية مطلوبة ويجب أن تكون أكبر من صفر';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'يرجى إدخال كمية صحيحة (أكبر من صفر)',
            life: 3000
        });
    } else if (itemForm.quantity > 1000000) {
        itemErrors.quantity = 'الكمية كبيرة جداً';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'الكمية المدخلة كبيرة جداً',
            life: 3000
        });
    }

    // التحقق من الوحدة
    if (!itemForm.unit || itemForm.unit.trim() === '') {
        itemErrors.unit = 'الوحدة مطلوبة';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'يرجى اختيار وحدة القياس',
            life: 3000
        });
    }

    // التحقق من السعر التقديري (اختياري لكن إذا تم إدخاله يجب أن يكون صحيحاً)
    if (itemForm.estimated_unit_price !== null && itemForm.estimated_unit_price !== undefined) {
        if (itemForm.estimated_unit_price < 0) {
            toast.add({
                severity: 'error',
                summary: 'خطأ في التحقق',
                detail: 'السعر لا يمكن أن يكون سالباً',
                life: 3000
            });
            isValid = false;
        } else if (itemForm.estimated_unit_price > 100000000) {
            toast.add({
                severity: 'error',
                summary: 'خطأ في التحقق',
                detail: 'السعر كبير جداً',
                life: 3000
            });
            isValid = false;
        }
    }

    // التحقق من طول المواصفات
    if (itemForm.specifications && itemForm.specifications.length > 500) {
        itemErrors.specifications = 'المواصفات طويلة جداً (500 حرف كحد أقصى)';
        isValid = false;
        toast.add({
            severity: 'error',
            summary: 'خطأ في التحقق',
            detail: 'المواصفات طويلة جداً',
            life: 3000
        });
    }

    return isValid;
}

/* =========================
   LOAD DEPARTMENTS
========================= */
const loadDepartments = async()=>{
    try {
        const res = await DepartmentService.getAll();
        departments.value = res.data ?? res;
        
        if (!departments.value || departments.value.length === 0) {
            toast.add({
                severity: 'warn',
                summary: 'تنبيه',
                detail: 'لا توجد أقسام متاحة',
                life: 3000
            });
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
}

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
        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ في قراءة بيانات القسم',
            life: 3000
        });
        loadDepartments();
    }
});

/* =========================
   WATCH OPEN DIALOG
========================= */
const resolvedDepartmentId = computed<number | undefined>(() => {
    const row = localStorage.getItem('auth_department');

    if (row) {
        try {
            const authDepartment = JSON.parse(row);
            return authDepartment?.id;
        } catch (err) {
            console.error('Error parsing auth_department:', err);
        }
    }
})

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

                form.items = props.request.items?.map((it: any) => ({
                    id: it.id,
                    item_name: it.item_name || '',
                    specifications: it.specifications ?? it.specs ?? '',
                    quantity: it.quantity || 0,
                    unit: it.unit || '',
                    estimated_unit_price: it.estimated_unit_price || null,
                })) || [];

                resetFormErrors();
            } catch (error) {
                console.error('Error loading request data:', error);
                toast.add({
                    severity: 'error',
                    summary: 'خطأ',
                    detail: 'حدث خطأ في تحميل بيانات الطلب',
                    life: 3000
                });
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
    resetFormErrors();
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
    unit: '',
    estimated_unit_price: null as number | null,
});

function resetItemForm() {
    itemForm.item_name = '';
    itemForm.specifications = '';
    itemForm.quantity = null;
    itemForm.unit = '';
    itemForm.estimated_unit_price = null;
    resetItemErrors();
}

function openAddItem() {
    if (form.items.length >= 100) {
        toast.add({
            severity: 'warn',
            summary: 'تحذير',
            detail: 'لا يمكن إضافة أكثر من 100 مادة في الطلب الواحد',
            life: 3000
        });
        return;
    }

    isEditingItem.value = false;
    currentItemIndex.value = null;
    resetItemForm();
    itemDialogVisible.value = true;
    
    // التركيز على حقل اسم المادة
    nextTick(() => {
        itemNameInputRef.value?.$el?.focus();
    });
}

function editItem(index: number) {
    if (index < 0 || index >= form.items.length) {
        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'المادة المحددة غير موجودة',
            life: 3000
        });
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
    // التحقق من صحة البيانات
    if (!validateItem()) {
        return;
    }

    const payload = { ...itemForm };

    try {
        if (isEditingItem.value && currentItemIndex.value !== null) {
            form.items[currentItemIndex.value] = payload;
            toast.add({
                severity: "success",
                summary: "تم التحديث",
                detail: "تم تحديث المادة بنجاح",
                life: 3000
            });
        } else {
            form.items.push(payload);
            toast.add({
                severity: "success",
                summary: "تمت الإضافة",
                detail: "تم إضافة المادة بنجاح",
                life: 3000
            });
        }

        itemDialogVisible.value = false;
        resetItemForm();
        isEditingItem.value = false;
        currentItemIndex.value = null;
    } catch (error) {
        console.error('Error saving item:', error);
        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء حفظ المادة',
            life: 3000
        });
    }
}

function deleteItem(index: number) {
    if (index < 0 || index >= form.items.length) {
        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'المادة المحددة غير موجودة',
            life: 3000
        });
        return;
    }

    confirm.require({
        header: "تأكيد حذف المادة",
        message: "هل أنت متأكد من حذف المادة من الطلب؟",
        icon: "pi pi-exclamation-triangle text-yellow-500",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass:"p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass:"p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: ()=>{
            try {
                form.items.splice(index, 1);
                toast.add({
                    severity: 'success',
                    summary: 'تم الحذف',
                    detail: 'تم حذف المادة بنجاح',
                    life: 2500
                });
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.add({
                    severity: 'error',
                    summary: 'خطأ',
                    detail: 'حدث خطأ أثناء حذف المادة',
                    life: 3000
                });
            }
        }
    });
}

/* =========================
   SUBMIT
========================= */
async function submit() {
    // التحقق من صحة النموذج
    if (!validateForm()) {
        return;
    }

    const finalDepartmentId = departmentId.value ?? form.department_id;

    try {
        loading.value = true;

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            department_id: finalDepartmentId,
            priority: form.priority,
            items: form.items.map(it => ({
                id: isEditMode.value ? it.id : undefined,
                item_name: it.item_name.trim(),
                quantity: it.quantity,
                unit: it.unit,
                specs: it.specifications?.trim() || '',
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

        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: errorMessage,
            life: 4000
        });
    } finally {
        loading.value = false;
    }
}

// إغلاق نافذة المادة مع تأكيد إذا كانت هناك بيانات
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
                    <span class="text-sm text-gray-500">
                        ({{ form.items.length }} مادة)
                    </span>
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
                        <template #body="slotProps">
                            {{ unitsList.find(u => u.value === slotProps.data.unit)?.label || slotProps.data.unit }}
                        </template>
                    </Column>

                    <Column field="specifications">
                        <template #header>
                            <i class="fas fa-tags text-gray-500"/>
                            المواصفات
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
                            <i class="fas fa-cogs"/>
                            الإدارة
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
                    <i class="fas fa-box"/>
                    اسم المادة
                    <span class="text-red-500">*</span>
                </label>
            </FloatLabel>
            <small v-if="itemErrors.item_name" class="p-error block mt-1">{{ itemErrors.item_name }}</small>

            <FloatLabel variant="on" class="mt-5">
                <InputNumber  
                    v-model="itemForm.quantity" 
                    id="quantity_field" 
                    inputClass="w-full" 
                    class="w-full "
                    :invalid="itemErrors.quantity != '' "
                    :min="0"
                    :max="1000000"
                />
                <label for="quantity_field" class="font-semibold mb-2 block">
                    <i class="fas fa-hashtag"/>
                    الكمية
                    <span class="text-red-500">*</span>
                </label>
            </FloatLabel>
            <small v-if="itemErrors.quantity" class="p-error block mt-1">{{ itemErrors.quantity }}</small>

            <FloatLabel variant="on" class="mt-5">
                <Select 
                    v-model="itemForm.unit" 
                    id="unit_field" 
                    :options="unitsList" 
                    optionLabel="label" 
                    optionValue="value" 
                    filter 
                    fluid
                    :invalid="itemErrors.unit != ''"
                />
                <label for="unit_field" class="font-semibold mb-2 block">
                    <i class="fas fa-object-group"/>
                    اختر الوحدة
                    <span class="text-red-500">*</span>
                </label>
            </FloatLabel>
            <small v-if="itemErrors.unit" class="p-error block mt-1">{{ itemErrors.unit }}</small>

            <FloatLabel variant="on" class="mt-5">
                <InputNumber  
                    v-model="itemForm.estimated_unit_price" 
                    id="price_field" 
                    inputClass="w-full" 
                    class="w-full"
                    :min="0"
                    :max="100000000"
                    mode="currency"
                    currency="IQD"
                    locale="ar-IQ"
                />
                <label for="price_field" class="font-semibold mb-2 block">
                    <i class="fas fa-dollar-sign"/>
                    السعر التقديري للوحدة (اختياري)
                </label>
            </FloatLabel>

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
                    <i class="fa-solid fa-tags"/>
                    المواصفات
                </label>
            </FloatLabel>
            <small v-if="itemErrors.specifications" class="p-error block mt-1">{{ itemErrors.specifications }}</small>
            <small v-else-if="itemForm.specifications" class="text-gray-500 block mt-1">
                {{ itemForm.specifications.length }} / 500 حرف
            </small>

            <div class="mt-4 flex justify-content-end gap-2">
                <Button 
                    label="إلغاء" 
                    icon="fas fa-times" 
                    outlined 
                    severity="secondary" 
                    @click="closeItemDialog" 
                />
                <Button 
                    :label="isEditingItem ? 'تحديث' : 'إضافة'" 
                    icon="fas fa-check" 
                    @click="saveItem" 
                />
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