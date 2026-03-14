<template>
    <div dir="rtl">

        <!-- شريط البحث الرئيسي -->
        <div class="flex align-items-center gap-2">

            <!-- البحث النصي -->
            <span class="p-input-icon-right flex-1">
                <FloatLabel variant="on">
                    <IconField>
                        <InputIcon class="fas fa-search"/>
                        <InputText 
                            id="search_label" 
                            v-model="modelValue.vendor_name"
                            @update:modelValue="update('vendor_name', $event)"
                            class="w-full"
                            style="padding-right: 2.25rem;"
                        />
                    </IconField>
                    <label for="search_label">البحث...</label>
                </FloatLabel>
            </span>

            <!-- زر الفلاتر المتقدمة -->
            <Button
                :icon="isExpanded ? 'pi pi-angle-up' : 'pi pi-sliders-h'"
                :severity="activeCount > 0 ? 'warning' : 'secondary'"
                :outlined="activeCount === 0"
                :badge="activeCount > 0 ? String(activeCount) : undefined"
                badgeSeverity="warning"
                size="small"
                @click="isExpanded = !isExpanded"
                v-tooltip="{ value: isExpanded ? 'إخفاء الفلاتر' : 'فلاتر متقدمة', showDelay: 300 }"
            />

            <!-- زر إعادة التعيين -->
            <Button
                v-if="activeCount > 0 || modelValue.vendor_name"
                icon="pi pi-filter-slash"
                severity="danger"
                text
                size="small"
                @click="emit('reset')"
                v-tooltip="{ value: 'مسح جميع الفلاتر', showDelay: 300 }"
            />

        </div>

        <!-- الفلاتر المتقدمة -->
        <Transition name="expand">
            <div v-if="isExpanded" class="advanced-section">

                <div class="flex justify-content-between align-items-center mb-3">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-color-secondary);">
                        <i class="pi pi-filter ml-1" /> فلاتر متقدمة
                    </span>
                    <Button label="إعادة تعيين" icon="pi pi-times" severity="secondary" text size="small" @click="emit('reset')" />
                </div>

                <div class="grid gap-3">

                    <!-- القسم -->
                    <div class="col" v-if="!hasDepartment">
                        <FloatLabel variant="on">
                            <Select
                                id="filter_department"
                                :modelValue="modelValue.department_id"
                                @update:modelValue="update('department_id', $event)"
                                class="w-full"
                                :options="departments"
                                optionLabel="name"
                                optionValue="id"
                                filter
                                fluid
                            />
                            <label for="filter_department"><i class="fa-solid fa-object-group" /> اختر القسم</label>
                        </FloatLabel>
                        <small style="font-size: 0.72rem; color: var(--text-color-secondary);">العروض الخاصة بقسم معين</small>
                    </div>

                    <!-- حالة العرض -->
                    <div class="col">
                        <Select
                            id="filter_status"
                            :modelValue="modelValue.status"
                            @update:modelValue="update('status', $event)"
                            :options="statusOptions"
                            filter
                            optionLabel="label"
                            optionValue="value"
                            fluid
                            placeholder="حالة العرض"
                        />
                        <small style="font-size: 0.72rem; color: var(--text-color-secondary);">فلترة حسب حالة العرض</small>
                    </div>

                    <!-- عنوان الطلب -->
                    <div class="col">
                        <FloatLabel variant="on" class="w-full">
                            <InputText
                                :modelValue="modelValue.request_title"
                                @update:modelValue="update('request_title', $event)"
                                class="w-full"
                                id="filter_request_title"
                            />
                            <label for="filter_request_title"><i class="fas fa-search" /> عنوان الطلب</label>
                        </FloatLabel>
                        <small style="font-size: 0.72rem; color: var(--text-color-secondary);">بحث بعنوان طلب الشراء</small>
                    </div>

                </div>

                <!-- التواريخ -->
                <div class="grid mt-3">
                    <div class="col">
                        <FloatLabel variant="on">
                            <DatePicker
                                id="filter_date_from"
                                :modelValue="modelValue.date_from"
                                @update:modelValue="update('date_from', $event)"
                                showIcon fluid iconDisplay="input" dateFormat="yy/mm/dd"
                            />
                            <label for="filter_date_from"><i class="pi pi-calendar" /> من تاريخ</label>
                        </FloatLabel>
                        <small style="font-size: 0.72rem; color: var(--text-color-secondary);">العروض ما بعد هذا التاريخ</small>
                    </div>
                    <div class="col">
                        <FloatLabel variant="on">
                            <DatePicker
                                id="filter_date_to"
                                :modelValue="modelValue.date_to"
                                @update:modelValue="update('date_to', $event)"
                                showIcon fluid iconDisplay="input" dateFormat="yy/mm/dd"
                            />
                            <label for="filter_date_to"><i class="pi pi-calendar" /> إلى تاريخ</label>
                        </FloatLabel>
                        <small style="font-size: 0.72rem; color: var(--text-color-secondary);">العروض ما قبل هذا التاريخ</small>
                    </div>
                </div>

            </div>
        </Transition>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const props = defineProps<{
    modelValue: any;
    departments: any[];
    hasDepartment: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: any];
    'reset': [];
}>();

const isExpanded = ref(false);

const activeCount = computed(() => {
    let count = 0;
    if (props.modelValue.department_id) count++;
    if (props.modelValue.status)        count++;
    if (props.modelValue.request_title) count++;
    if (props.modelValue.date_from)     count++;
    if (props.modelValue.date_to)       count++;
    return count;
});

const statusOptions = [
    { label: 'جميع الحالات',  value: null       },
    { label: 'قيد الانتظار', value: 'pending'  },
    { label: 'موافق عليه',   value: 'accepted' },
    { label: 'مرفوض',        value: 'rejected' },
];

function update(key: string, value: any) {
    emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<style scoped>
.advanced-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--surface-border);
    overflow: hidden;
}

.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 500px;
    opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
    margin-top: 0;
    padding-top: 0;
}
</style>