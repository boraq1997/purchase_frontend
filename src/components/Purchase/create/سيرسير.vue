<script setup lang="ts">
import { reactive, computed, ref, watch, onMounted } from 'vue';

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

import purchaseRequestsService from '../services/purchaseRequests.service';
import DepartmentService from '../../departments/DepartmentService';

import { useToast } from 'primevue/usetoast';

const toast = useToast();

// props
const props = defineProps<{
    visible: boolean;
    request: any | null;
}>();

const emit = defineEmits(["update:visible", "updated"]);

// v-model:visible
const internalVisible = computed({
    get: () => props.visible,
    set: v => emit('update:visible', v)
});

const loading = ref(false);

// الأقسام
const departments = ref([]);

// الأولويات
const priorities = [
    { label: 'عالية', value: 'high' },
    { label: 'متوسطة', value: 'medium' },
    { label: 'منخفضة', value: 'low' },
];

// النموذج الرئيسي
const form = reactive({
    title: '',
    description: '',
    department_id: null,
    priority: 'medium',
    items: [] as any[],
});

// تحميل بيانات الأقسام
onMounted(async () => {
    try {
        const res = await DepartmentService.getAll();
        departments.value = (res as any).data ?? res;
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'تعذر جلب الأقسام',
            life: 2000
        });
    }
});

// عند فتح الديالوج → نملأ البيانات
watch(() => props.visible, (v) => {
    if (v && props.request) {
        form.title = props.request.title;
        form.description = props.request.description;
        form.department_id = props.request.department_id;
        form.priority = props.request.priority;

        form.items = props.request.items.map((it: any) => ({
            id: it.id,
            item_name: it.item_name,
            specifications: it.specifications,
            quantity: it.quantity,
            unit: it.unit,
            estimated_unit_price: it.estimated_unit_price,
        }));
    }
});

// ==========================
// إدارة المواد
// ==========================

const itemDialogVisible = ref(false);
const isEditing = ref(false);
const currentIndex = ref<number | null>(null);

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
    isEditing.value = false;
    currentIndex.value = null;
    resetItemForm();
    itemDialogVisible.value = true;
}

function editItem(index: number) {
    const item = form.items[index];
    isEditing.value = true;
    currentIndex.value = index;

    itemForm.item_name = item.item_name;
    itemForm.specifications = item.specifications;
    itemForm.quantity = item.quantity;
    itemForm.unit = item.unit;
    itemForm.estimated_unit_price = item.estimated_unit_price;

    itemDialogVisible.value = true;
}

function saveItem() {
    const payload = {
        item_name: itemForm.item_name,
        specifications: itemForm.specifications,
        quantity: itemForm.quantity,
        unit: itemForm.unit,
        estimated_unit_price: itemForm.estimated_unit_price,
    };

    if (isEditing.value && currentIndex.value !== null) {
        form.items[currentIndex.value] = payload;
    } else {
        form.items.push(payload);
    }

    itemDialogVisible.value = false;
}

function deleteItem(index: number) {
    form.items.splice(index, 1);
}

// ==========================
// SUBMIT UPDATE
// ==========================

async function submitUpdate() {
    console.log('SUBMIT UPDATE CLICKED');

    try {
        loading.value = true;

        // نحول العناصر لصيغة يقدر الـ API يتعامل معها
        const mappedItems = form.items.map((it: any) => ({
            id: it.id, // مهم للتعديل
            item_name: it.item_name,
            quantity: it.quantity,
            unit: it.unit,
            // backend غالباً يتعامل مع specs مثل ما كنت ترسله في الإنشاء
            specs: it.specifications ?? it.specs ?? '',
            estimated_unit_price: it.estimated_unit_price,
        }));

        const payload = {
            title: form.title,
            description: form.description,
            department_id: form.department_id ?? undefined,
            priority: form.priority,
            items: mappedItems,
        };

        const res = await purchaseRequestsService.update(props.request.id, payload);

        console.log('UPDATE RESPONSE =>', res);

        toast.add({
            severity: 'success',
            summary: 'تم التحديث',
            detail: 'تم تعديل الطلب بنجاح',
            life: 2500
        });

        emit('updated', res);
        emit('update:visible', false);

    } catch (err: any) {
        console.error('ERROR RESPONSE =>', err?.response?.data);
        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: err?.response?.data?.message ?? 'حدث خطأ غير متوقع أثناء حفظ التعديلات',
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
        :style="{ width: '80vw' }"
        header="تعديل طلب الشراء"
        dir="rtl"
    >
        <Card>

            <template #title>
                <h2 class="text-2xl font-bold mb-4">تعديل تفاصيل الطلب</h2>
            </template>

            <template #content>

                <!-- عنوان -->
                <div class="mb-4">
                    <label class="block mb-2 font-semibold">عنوان الطلب</label>
                    <InputText v-model="form.title" class="w-full" />
                </div>

                <!-- الوصف -->
                <div class="mb-4">
                    <label class="block mb-2 font-semibold">الوصف</label>
                    <Textarea v-model="form.description" rows="4" class="w-full" :maxlength="500" counter />
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
                            fluid
                            placeholder="اختر القسم"
                        />
                    </div>

                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-semibold">الأولوية</label>
                        <Select
                            v-model="form.priority"
                            :options="priorities"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                        />
                    </div>
                </div>

                <Divider />

                <!-- ================= المواد ================= -->
                <h3 class="text-xl font-bold mb-3">المواد المطلوبة</h3>

                <Button
                    label="إضافة مادة"
                    icon="pi pi-plus"
                    severity="success"
                    class="mb-3"
                    @click="openAddItem"
                />

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

                        <Column field="specs">
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

            </template>

            <template #footer>
                <Button
                    :label="loading ? 'جاري التحديث...' : 'حفظ التعديلات'"
                    icon="pi pi-check"
                    class="p-button-sm"
                    :loading="loading"
                    @click="submitUpdate"
                />
            </template>

        </Card>

    </Dialog>

    <!-- Dialog إضافة/تعديل مادة -->
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
                <InputNumber v-model="itemForm.quantity" inputClass="w-full" class="w-full" />
            </div>

            <div class="mb-3">
                <label class="font-semibold mb-2 block">الوحدة</label>
                <InputText v-model="itemForm.unit" class="w-full" />
            </div>

            <div class="mb-3">
                <label class="font-semibold mb-2 block">المواصفات</label>
                <Textarea v-model="itemForm.specifications" rows="2" class="w-full" :maxlength="500" counter />
            </div>

            <div class="mb-3">
                <label class="font-semibold mb-2 block">السعر التخميني للوحدة</label>
                <InputNumber
                    v-model="itemForm.estimated_unit_price"
                    mode="currency"
                    currency="IQD"
                    locale="ar-IQ"
                    inputClass="w-full"
                    class="w-full"
                />
            </div>

            <div class="mt-4 flex justify-content-end gap-2">
                <Button label="إلغاء" severity="secondary" @click="itemDialogVisible = false" />
                <Button label="حفظ" severity="success" icon="pi pi-check" @click="saveItem" />
            </div>
        </div>
    </Dialog>
</template>