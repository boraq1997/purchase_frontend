<template>
    <div class="p-4 mb-5">
        <div class="flex justify-content-end mb-2">
            <Button label="إعادة تعيين الفلترة" icon="pi pi-filter-slash" severity="secondary" text size="small"
                @click="emit('reset')"
                v-tooltip="{ value: 'إعادة تعيين جميع الفلاتر', showDelay: 300, hideDelay: 300 }"
            />
        </div>
        <div class="grid">
            <div class="col-12 md:col-4">
                <FloatLabel variant="on" class="w-full">
                    <InputText id="filter_vendor_name" :modelValue="modelValue.vendor_name" @update:modelValue="update('vendor_name', $event)" class="w-full" />
                    <label for="filter_vendor_name"><i class="fas fa-search"/> البحث عن اسم المعرض</label>
                </FloatLabel>
                <small class="text-gray-500 text-xs">البحث بواسطة اسم المعرض</small>
            </div>

            <div class="col-12 md:col-4" v-if="!hasDepartment">
                <FloatLabel variant="on">
                    <Select id="filter_department" :modelValue="modelValue.department_id" @update:modelValue="update('department_id', $event)"
                        class="w-full" :options="departments" optionLabel="name" optionValue="id" filter />
                    <label for="filter_department"><i class="fa-solid fa-object-group"/> اختر القسم</label>
                </FloatLabel>
                <small class="text-gray-500 text-xs">العروض الخاصة بقسم معين</small>
            </div>

            <div class="col-12 md:col-4">
                    <Select id="filter_status" :modelValue="modelValue.status" @update:modelValue="update('status', $event)"
                        :options="statusOptions" filter optionLabel="label" optionValue="value" fluid placeholder="حالة العرض" />
                <small class="text-gray-500 text-xs">فلترة حسب حالة العرض</small>
            </div>

            <div class="col-12 md:col-4">
                <FloatLabel variant="on" class="w-full">
                    <InputText :modelValue="modelValue.request_title" @update:modelValue="update('request_title', $event)" class="w-full" />
                    <label><i class="fas fa-search"/> البحث عن عنوان الطلب</label>
                </FloatLabel>
            </div>

            <div class="col-12 md:col-4">
                <FloatLabel variant="on">
                    <DatePicker id="filter_date_from" :modelValue="modelValue.date_from" @update:modelValue="update('date_from', $event)"
                        showIcon fluid iconDisplay="input" dateFormat="yy/mm/dd" />
                    <label for="filter_date_from"><i class="pi pi-calendar ml-2"/> من تاريخ</label>
                </FloatLabel>
            </div>

            <div class="col-12 md:col-4">
                <FloatLabel variant="on">
                    <DatePicker id="filter_date_to" :modelValue="modelValue.date_to" @update:modelValue="update('date_to', $event)"
                        showIcon fluid iconDisplay="input" dateFormat="yy/mm/dd" />
                    <label for="filter_date_to"><i class="pi pi-calendar ml-2"/> إلى تاريخ</label>
                </FloatLabel>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';

const props = defineProps<{
    modelValue: any;
    departments: any[];
    hasDepartment: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: any];
    'reset': [];
}>();

const statusOptions = [
    { label: 'جميع الحالات', value: null },
    { label: 'قيد الانتظار', value: 'pending' },
    { label: 'موافق عليه', value: 'accepted' },
    { label: 'مرفوض', value: 'rejected' },
];

function update(key: string, value: any) {
    emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>