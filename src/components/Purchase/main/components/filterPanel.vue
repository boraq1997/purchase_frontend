<script setup lang="ts">
// ============================================================================
// COMPONENT: FilterPanel
// PATH: purchase/main/components/filterPanel.vue
// DESCRIPTION:
// - Controls filters for the main purchase requests page
// - Emits updated filters to parent using v-model:filters
// ============================================================================

import { ref, reactive, watch, defineProps, defineEmits, onMounted } from 'vue';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DepartmentService from '../../../departments/DepartmentService';
import FloatLabel from 'primevue/floatlabel';

// PROPS: الفلاتر القادمة من الصفحة الرئيسية
const props = defineProps<{
    filters: {
        department_id: number | null;
        status_type: string | null;
        priority: string | null;
        search: string;
        date_from: string | null;
        date_to: string | null;
    };
}>();

const hasDepartment = ref<boolean>(false)
const departmentId = ref<number>();

const emit = defineEmits(['update:filters']);
const internalFilters = reactive({ ...props.filters });
let searchTimeout: any = null;

watch(
    () => props.filters,
    (newFilters) => {
        Object.assign(internalFilters, newFilters);
    },
    { deep: true }
);

// ============================================================================
// WATCHERS
// - إعادة إرسال الفلاتر للصفحة الرئيسية عند أي تغيير
// ============================================================================
// watch(
//     internalFilters,
//     () => {
//         emit('update:filters', internalFilters);
//     }, 
//     { deep: true }
// );

watch(
    ()=>internalFilters.search,
    (newVal)=>{
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            emit('update:filters', {...internalFilters});
        }, 500);
    }
)

watch(() => ({
        department_id: hasDepartment.value
        ? departmentId.value
        : internalFilters.department_id,
        status_type: internalFilters.status_type,
        priority: internalFilters.priority,
        date_from: internalFilters.date_from,
        date_to: internalFilters.date_to,
    }),
    () => {
        emit('update:filters', {
        ...internalFilters,
        department_id: hasDepartment.value
            ? departmentId.value
            : internalFilters.department_id,
        });
    },
    { deep: true }
);

// ============================================================================
// STATIC LISTS (يمكن لاحقاً استبدالها عبر API)
// ============================================================================
const departments = ref([
    { label: 'جميع الأقسام', value: null },
]);

const loadDepartments = async()=>{
    try {
        const response = await DepartmentService.getAll()
        const depList = response.map((d: any) => ({
            label: d.name,
            value: d.id,
        }));
        departments.value = [
            { label: 'جميع الأقسام', value: null },
            ...depList
        ];
    } catch (err) {
        console.log(err)
    }
}

const statuses = [
    { label: 'جميع الحالات', value: null },
    { label: 'معلقة', value: 'pending' },
    { label: 'مقبولة', value: 'approved' },
    { label: 'مرفوضة', value: 'rejected' },
];

const priorities = [
    { label: 'جميع الأولويات', value: null },
    { label: 'عالية', value: 'high' },
    { label: 'متوسطة', value: 'medium' },
    { label: 'منخفضة', value: 'low' },
];

// دالة لإعادة تعيين جميع الفلاتر
const resetFilters = () => {
    Object.assign(internalFilters, {
        department_id: null,
        status_type: null,
        priority: null,
        search: '',
        date_from: null,
        date_to: null,
    });
};

onMounted(()=>{
    try {
        const row = localStorage.getItem('auth_department');
        if (row) {
            const authDepartment = JSON.parse(row);

            if (authDepartment?.id) {
                departmentId.value = authDepartment.id;
                hasDepartment.value = true;
                return;
            }
        }
        loadDepartments();
    } catch (err) {
        console.log(err);
        loadDepartments();
    }
})
</script>

<template>
    <div class="p-4 rounded-lg shadow space-y-4" dir="rtl">

        <!-- زر إعادة التعيين -->
        <div class="flex justify-content-end mb-2">
            <Button 
                label="إعادة تعيين الفلترة" 
                icon="pi pi-filter-slash" 
                severity="secondary"
                text
                size="small"
                @click="resetFilters"
                class="reset-button"
                v-tooltip="{ value: 'قم بالضغط لحذف جميع قيم الفلترة واعادة جلب جميع الطلبات', showDelay: 300, hideDelay: 300 }"
            />
        </div>

        <div class="grid gap-4">

            <!-- قسم -->
            <div class="col" v-if="!hasDepartment">
                <FloatLabel variant="on">
                    <Select 
                        id="internal_filter_department_id"
                        v-model="internalFilters.department_id" 
                        :options="departments" 
                        filter 
                        optionLabel="label" 
                        optionValue="value" 
                        fluid
                    />  
                    <label for="internal_filter_department_id"><i class="fas fa-layer-group"/> اختر القسم</label>
                </FloatLabel>
                <small class="text-gray-500 text-xs">بحث وفلترة حسب القسم قم باختيار القسم المراد عرض الطلبات الخاصه به</small>
            </div>

            <!-- حالة الطلب -->
            <div class="col">
                <FloatLabel variant="on">
                    <Select 
                        id="internla_filter_status_type"
                        v-model="internalFilters.status_type" 
                        :options="statuses" 
                        filter 
                        optionLabel="label" 
                        optionValue="value" 
                        fluid 
                    />
                    <label for="internla_filter_status_type"><i class="fa-solid fa-spinner"/> حالة الطلب</label>
                </FloatLabel>
                <small class="text-gray-500 text-xs">بحث وفلترة حسب حالة الطلب</small>
            </div>

            <!-- الأولوية -->
            <div class="col">
                <FloatLabel variant="on">
                    <Select 
                        id="internla_filters_priority"
                        v-model="internalFilters.priority" 
                        :options="priorities" 
                        filter 
                        optionLabel="label" 
                        optionValue="value" 
                        fluid 
                    />
                    <label for="internla_filters_priority"><i class="fa-solid fa-circle-exclamation"/> الاولوية</label>
                </FloatLabel>
                <small class="text-gray-500 text-xs">بحث وفلترة حسب اهمية الطلب</small>
            </div>

            <!-- البحث -->
            <div class="col">
                <FloatLabel variant="on">
                    <InputText 
                        v-model="internalFilters.search" 
                        class="w-full" 
                        fluid
                    />
                    <label for="internal_filters_search"><i class="fas fa-search"/> بحث</label>
                </FloatLabel>
                <small class="text-gray-500 text-xs">بحث عام  يشمل التالي [عنوان الطلب, التاريخ, الاهمية]</small>
            </div>
        </div>

        <!-- التاريخ -->
        <div class="grid mt-2">
            <div class="col">
                <FloatLabel variant="on">
                    <DatePicker 
                        id="internal_filter_date_form"
                        v-model="internalFilters.date_from" 
                        showIcon 
                        fluid 
                        iconDisplay="input" 
                        dateFormat="yy/mm/dd"
                    />
                    <label for="internal_filter_date_form"><i class="fas fa-calendar-alt"/> من تاريخ</label>
                </FloatLabel>
                <small class="text-gray-500 text-xs">الطلبات مابعد التاريخ اعلاه</small>
            </div>
            <div class="col">
                <FloatLabel variant="on">
                    <DatePicker 
                        id="internal_filter_date_to"
                        v-model="internalFilters.date_to" 
                        showIcon 
                        fluid 
                        iconDisplay="input" 
                        dateFormat="yy/mm/dd"
                    />
                    <label for="internal_filter_date_to"><i class="fas fa-calendar-alt"/> الى تاريخ</label>
                </FloatLabel>
                <small class="text-gray-500 text-xs">الطلبات ماقبل التاريخ اعلاه</small>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* زر إعادة التعيين */
.reset-button {
    transition: all 0.3s ease;
}

.reset-button:hover {
    background: var(--surface-100);
    transform: scale(1.05);
}

.reset-button .p-button-icon {
    color: var(--red-500);
}

.reset-button:hover .p-button-icon {
    color: var(--red-600);
}
</style>