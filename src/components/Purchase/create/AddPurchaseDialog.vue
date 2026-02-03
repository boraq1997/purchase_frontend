FILE: purchase/create/AddPurchaseDialog.vue
<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DepartmentService from '../../departments/DepartmentService';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';


import { ref, computed, reactive, onMounted } from 'vue';

import purchaseRequestsService from '../services/purchaseRequests.service';

import { useToast } from 'primevue/usetoast';

const toast = useToast();
const loading = ref(false);

// Props للتحكم بالظهور من الخارج
const props = defineProps<{
    visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'submitted']);

// لربط v-model:visible
const internalVisible = computed({
    get: () => props.visible,
    set: (v: boolean) => emit('update:visible', v)
});

// نموذج الطلب
const form = ref({
    title: '',
    description: '',
    department_id: null,
    user_id: 1, // لاحقاً نستبدلها بالمستخدم الحالي
    priority: 'medium',
    items: []
});

// قائمة الأقسام (ستجلب من API لاحقاً)
const departments = ref([]);

// أولويات الطلب
const priorities = [
    { label: 'عالية', value: 'high' },
    { label: 'متوسطة', value: 'medium' },
    { label: 'منخفضة', value: 'low' },
];

const unitsList: any[] = [
    { value: "piece", label: "قطعة", icon: "fas fa-home" },
    { value: "box", label: "صندوق", icon: "fas fa-home" },
    { value: "carton", label: "كارتون", icon: "fas fa-home" },
    { value: "pack", label: "حزمة", icon: "fas fa-home" },
    { value: "set", label: "طقم", icon: "fas fa-home" },
    { value: "kg", label: "كيلوجرام", icon: "fas fa-home" },
    { value: "g", label: "غرام", icon: "fas fa-home" },
    { value: "ton", label: "طن", icon: "fas fa-home" },
    { value: "meter", label: "متر", icon: "fas fa-home" },
    { value: "cm", label: "سنتيمتر", icon: "fas fa-home" },
    { value: "roll", label: "لفة", icon: "fas fa-home" },
    { value: "liter", label: "لتر", icon: "fas fa-home" },
    { value: "ml", label: "ملي لتر", icon: "fas fa-home" }
];

// ====================== إدارة المواد ======================
const itemDialogVisible = ref(false);
const isEditing = ref(false);
const currentIndex = ref<number | null>(null);

// نموذج المادة
const itemForm = reactive({
    item_name: '',
    specifications: '',
    quantity: null,
    unit: '',
});

// فتح نافذة الإضافة
function openAddItem() {
    isEditing.value = false;
    currentIndex.value = null;

    itemForm.item_name = '';
    itemForm.quantity = null;
    itemForm.unit = '';
    itemForm.specifications = '';
    itemForm.estimated_unit_price = null;

    itemDialogVisible.value = true;
}

// فتح نافذة التعديل
function editItem(index: number) {
    const item = form.value.items[index];
    isEditing.value = true;
    currentIndex.value = index;

    itemForm.item_name = item.item_name;
    itemForm.quantity = item.quantity;
    itemForm.unit = item.unit;
    itemForm.specifications = item.specifications;
    itemForm.estimated_unit_price = item.estimated_unit_price;

    itemDialogVisible.value = true;
}

// حفظ المادة
function saveItem() {
    if (!itemForm.item_name || !itemForm.quantity) return;

    const payload = {
        item_name: itemForm.item_name,
        specifications: itemForm.specifications,
        quantity: itemForm.quantity,
        unit: itemForm.unit,
        estimated_unit_price: itemForm.estimated_unit_price,
    };

    if (isEditing.value && currentIndex.value !== null) {
        form.value.items[currentIndex.value] = payload;
    } else {
        form.value.items.push(payload);
    }
    resetItemForm();
    isEditing.value = false;
    currentIndex.value = null;
    
}

function resetItemForm() {
    itemForm.item_name = '';
    itemForm.specifications = '';
    itemForm.quantity = null;
    itemForm.unit = '';
    itemForm.estimated_unit_price = null;
}

// حذف مادة
function deleteItem(index: number) {
    form.value.items.splice(index, 1);
}

async function submit() {
    if (!form.value.title) {
        toast.add({ severity: 'warn', summary: 'تنبيه', detail: 'عنوان الطلب مطلوب', life: 2000 });
        return;
    }

    if (!form.value.department_id) {
        toast.add({ severity: 'warn', summary: 'تنبيه', detail: 'يجب اختيار قسم', life: 2000 });
        return;
    }

    if (!form.value.items.length) {
        toast.add({ severity: 'warn', summary: 'تنبيه', detail: 'يجب إضافة مادة واحدة على الأقل', life: 2000 });
        return;
    }

    try {
        loading.value = true;

        const payload = { ...form.value };

        const response = await purchaseRequestsService.create(payload);

        toast.add({
            severity: 'success',
            summary: 'تم بنجاح',
            detail: 'تم إنشاء طلب الشراء بنجاح',
            life: 2500
        });

        emit('submitted', response.data);
        emit('update:visible', false);

        // reset
        form.value = {
            title: '',
            description: '',
            department_id: null,
            user_id: 1,
            priority: 'medium',
            items: []
        };

    } catch (err: any) {
        console.error(err);

        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: err.response?.data?.message ?? 'حدث خطأ غير متوقع',
            life: 2500
        });

    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    try {
        const response = await DepartmentService.getAll();
        departments.value = response.data ?? response;
    } catch (err: any) {
        console.log(err);
        toast.add({
            severity: 'error',
            summary: 'رسالة خطاء',
            detail: 'حدث خطاء اثناء جلب بيانات الاقسام',
            life: 3000
        });
    }
});
</script>

<template>
    <Dialog
        v-model:visible="internalVisible"
        modal
        maximizable
        :draggable="false"
        :closable="true"
        :style="{ width: '80vw' }"
        header="إضافة طلب شراء جديد"
        dir="rtl"
    >

        <Card>

            <!-- ============= تفاصيل الطلب ============= -->
            <template #title>
                <h2 class="text-2xl font-bold mb-4">تفاصيل الطلب</h2>
            </template>

            <template #content>
                <!-- عنوان -->
                <div class="mb-4">
                    <label class="block mb-2 font-semibold">عنوان الطلب</label>
                    <InputText v-model="form.title" class="w-full" placeholder="أدخل عنوان الطلب" />
                </div>

                <!-- الوصف -->
                <div class="mb-4">
                    <label class="block mb-2 font-semibold">الوصف</label>
                    <Textarea
                        v-model="form.description"
                        class="w-full"
                        rows="4"
                        auto-resize
                        placeholder="أدخل وصف الطلب"
                        :maxlength="500" counter
                    />
                </div>

                <!-- القسم + الأولوية -->
                <div class="grid mb-4">
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-semibold">القسم</label>
                        <Select
                            v-model="form.department_id"
                            :options="departments"
                            optionLabel="name"
                            optionValue="id"
                            filter
                            placeholder="اختر القسم"
                            fluid
                        />
                    </div>

                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-semibold">الأولوية</label>
                        <Select
                            v-model="form.priority"
                            :options="priorities"
                            optionLabel="label"
                            optionValue="value"
                            fluid
                        />
                    </div>
                </div>

                <Divider />

                <!-- ============= المواد (Placeholder) ============= -->
                <div class="mt-4">
                    <!-- ============= المواد المطلوبة ============= -->
                    <h2 class="text-xl font-bold mb-3">المواد المطلوبة</h2>

                    <!-- زر إضافة مادة -->
                    <div class="mb-3">
                        <Button
                            label="إضافة مادة"
                            icon="pi pi-plus"
                            class="p-button-success"
                            @click="openAddItem"
                        />
                    </div>

                    <!-- جدول المواد -->
                    <div v-if="form.items.length" class="mt-3">
                        <DataTable
                            :value="form.items"
                            responsiveLayout="scroll"
                            class="text-right"
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
                                    <i class="fas fa-circle-info text-gray-500"/>
                                    الوحدة
                                </template>
                            </Column>

                            <Column field="specifications">
                                <template #header>
                                    <i class="fas fa-tags text-gray-500"/>
                                    المواصفات
                                </template>
                            </Column>

                            <Column>
                                <template #header>
                                    <i class="fas fa-cogs text-gray-500"/>
                                    التحكم
                                </template>
                                <template #body="slotProps">
                                    <Button 
                                        icon="fas fa-pencil" 
                                        severity="info" 
                                        rounded 
                                        variant="outlined" 
                                        aria-label="Bookmark" 
                                        @click="editItem(slotProps.index)"
                                        class="ml-2"
                                    />
                                    <Button 
                                        icon="fas fa-trash-alt" 
                                        severity="danger" 
                                        rounded 
                                        variant="outlined" 
                                        aria-label="Bookmark" 
                                        @click="deleteItem(slotProps.index)"
                                    />
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <!-- لا يوجد مواد -->
                    <div v-else class="text-gray-500 mt-2">
                        لم تتم إضافة أي مواد حتى الآن.
                    </div>
                </div>
            </template>

            <!-- ============= زر الإرسال ============= -->
            <template #footer>
                <Button
                    :label="loading ? 'جاري الإرسال...' : 'إرسال الطلب'"
                    icon="fas fa-check"
                    :loading="loading"
                    class="p-button-sm"
                    @click="submit"
                />
            </template>

        </Card>
    </Dialog>

    <!-- Dialog إضافة وتعديل مادة -->
    <Dialog
        v-model:visible="itemDialogVisible"
        modal
        :style="{ width: '35vw' }"
        :header="isEditing ? 'تعديل مادة' : 'إضافة مادة'"
        dir="rtl"
    >
        <div class="p-fluid">

            <div class="mb-3">
                <label class="font-semibold mb-2 block">اسم المادة</label>
                <InputText v-model="itemForm.item_name" class="w-full" />
            </div>

            <div class="mb-3">
                <label class="font-semibold mb-2 block">الكمية</label>
                <InputNumber 
                    v-model="itemForm.quantity" 
                    inputClass="w-full"
                    class="w-full"
                />
            </div>

            <div class="mb-3">
                <label class="font-semibold mb-2 block">الوحدة</label>
                <Select v-model="itemForm.unit" :options="unitsList" optionLabel="label" optionValue="value" placeholder="اختر الوحدة" filter fluid/>
            </div>

            <div class="mb-3">
                <label class="font-semibold mb-2 block">المواصفات</label>
                <Textarea v-model="itemForm.specifications" class="w-full" rows="3" auto-resize :maxlength="500" counter />
            </div>

            <div class="mt-4 flex justify-content-end gap-2">
                <Button label="إلغاء" severity="secondary" @click="itemDialogVisible = false" />
                <Button label="حفظ" icon="pi pi-check" severity="success" @click="saveItem" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped></style>