<script setup lang="ts">
// ============================================================================
// COMPONENT: FilterPanel
// PATH: purchase/main/components/filterPanel.vue
// DESCRIPTION:
// - Controls filters for the main purchase requests page
// - Emits updated filters to parent using v-model:filters
// ============================================================================

import { ref, reactive, watch, defineProps, defineEmits, onMounted } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DepartmentService from '../../../departments/DepartmentService';

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

// EMITS: لإرسال الفلاتر عند تغييرها
const emit = defineEmits(['update:filters']);

// STATE: نسخة محلية من الفلاتر
const internalFilters = reactive({ ...props.filters });

// مزامنة internalFilters مع الفلاتر القادمة من الصفحة الرئيسية
watch(
    () => props.filters,
    (newFilters) => {
        console.log("🔥 props.filters changed => syncing");
        Object.assign(internalFilters, newFilters);
    },
    { deep: true }
);

// ============================================================================
// WATCHERS
// - إعادة إرسال الفلاتر للصفحة الرئيسية عند أي تغيير
// ============================================================================
watch(
    internalFilters,
    () => {
        console.log("🔥 internalFilters changed => emitting to parent");
        emit('update:filters', internalFilters);
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
    loadDepartments();
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
            />
        </div>

        <div class="grid gap-4">

            <!-- قسم -->
            <div class="col">
                <Select 
                    v-model="internalFilters.department_id" 
                    :options="departments" 
                    filter 
                    optionLabel="label" 
                    optionValue="value" 
                    placeholder="اختر القسم" 
                    fluid
                />
            </div>

            <!-- حالة الطلب -->
            <div class="col">
                <Select 
                    v-model="internalFilters.status_type" 
                    :options="statuses" 
                    filter 
                    optionLabel="label" 
                    optionValue="value" 
                    placeholder="اختر حالة الطلب" 
                    fluid 
                />
            </div>

            <!-- الأولوية -->
            <div class="col">
                <Select 
                    v-model="internalFilters.priority" 
                    :options="priorities" 
                    filter 
                    optionLabel="label" 
                    optionValue="value" 
                    placeholder="اختر أولوية الطلب" 
                    fluid 
                />
            </div>

            <!-- البحث -->
            <div class="col">
                <IconField>
                    <InputIcon class="pi pi-search"/>
                    <InputText 
                        v-model="internalFilters.search" 
                        class="w-full" 
                        placeholder="ابحث بالعنوان / رقم الطلب" 
                        fluid
                    />
                </IconField>
            </div>
        </div>

        <!-- التاريخ -->
        <div class="grid mt-2">
            <div class="col">
                <DatePicker 
                    v-model="internalFilters.date_from" 
                    showIcon 
                    fluid 
                    iconDisplay="input" 
                    placeholder="من تاريخ"
                    dateFormat="yy/mm/dd"
                />
            </div>
            <div class="col">
                <DatePicker 
                    v-model="internalFilters.date_to" 
                    showIcon 
                    fluid 
                    iconDisplay="input" 
                    placeholder="إلى تاريخ"
                    dateFormat="yy/mm/dd"
                />
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