<script setup lang="ts">
// ============================================================================
// COMPONENT: FilterPanel
// PATH: purchase/main/components/filterPanel.vue
// DESCRIPTION:
// - Controls filters for the main purchase requests page
// - Emits updated filters to parent using v-model:filters
// - Search input is always visible; advanced filters are collapsible
// ============================================================================

import { ref, reactive, watch, onMounted } from 'vue';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DepartmentService from '../../../departments/DepartmentService';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// PROPS
const props = defineProps<{
    filters: {
        department_id: number | null;
        status_type: string | null;
        priority: string | null;
        search: string;
        date_from: Date | null;
        date_to: Date | null;
    };
}>();

const hasDepartment = ref<boolean>(false);
const departmentId = ref<number>();

// حالة التوسيع/الطي للفلاتر المتقدمة
const isExpanded = ref<boolean>(false);

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
// ============================================================================
watch(
    () => internalFilters.search,
    (_newVal) => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            emit('update:filters', { ...internalFilters });
        }, 500);
    }
);

watch(
    () => ({
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
// STATIC LISTS
// ============================================================================
const departments = ref([
    { label: 'جميع الأقسام', value: null },
]);

const loadDepartments = async () => {
    try {
        const response = await DepartmentService.getAll();
        const depList = response.map((d: any) => ({
            label: d.name,
            value: d.id,
        }));
        departments.value = [
            { label: 'جميع الأقسام', value: null },
            ...depList,
        ];
    } catch (err) {
        console.log(err);
    }
};

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

// حساب عدد الفلاتر النشطة في القسم المطوي
const activeAdvancedFiltersCount = () => {
    let count = 0;
    if (internalFilters.department_id !== null) count++;
    if (internalFilters.status_type !== null) count++;
    if (internalFilters.priority !== null) count++;
    if (internalFilters.date_from !== null) count++;
    if (internalFilters.date_to !== null) count++;
    return count;
};

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

onMounted(() => {
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
});
</script>

<template>
    <div class="filter-panel rounded-lg shadow" dir="rtl">

        <!-- ============================================================
            الشريط الرئيسي: البحث + زر الفلاتر المتقدمة
        ============================================================ -->
        <div class="card flex align-items-center gap-2">

            <!-- حقل البحث النصي -->
            <div class="flex-1">
                <FloatLabel variant="on">
                    <IconField>
                        <InputIcon class="fas fa-search"/>
                        <InputText id="search_label" v-model="internalFilters.search" class="w-full" fluid/>
                    </IconField>
                        <label for="search_label">البحث...</label>
                </FloatLabel>
                <!-- <span class="p-input-icon-right w-full">
                    <i class="fas fa-search search-icon" />
                    <InputText
                        v-model="internalFilters.search"
                        placeholder="بحث في الطلبات... (العنوان، التاريخ، الأهمية)"
                        class="w-full search-input"
                        fluid
                    />
                </span> -->
            </div>

            <!-- زر الفلاتر المتقدمة -->
            <Button
                :icon="isExpanded ? 'pi pi-angle-up' : 'pi pi-sliders-h'"
                :severity="activeAdvancedFiltersCount() > 0 ? 'warning' : 'secondary'"
                :outlined="activeAdvancedFiltersCount() === 0"
                :badge="activeAdvancedFiltersCount() > 0 ? String(activeAdvancedFiltersCount()) : undefined"
                badgeSeverity="warning"
                size="small"
                class="advanced-toggle-btn"
                @click="isExpanded = !isExpanded"
                v-tooltip="{
                    value: isExpanded ? 'إخفاء الفلاتر المتقدمة' : 'إظهار الفلاتر المتقدمة',
                    showDelay: 300,
                    hideDelay: 300
                }"
            />

            <!-- زر إعادة التعيين (يظهر فقط عند وجود فلاتر نشطة) -->
            <Button
                v-if="activeAdvancedFiltersCount() > 0 || internalFilters.search"
                icon="pi pi-filter-slash"
                severity="danger"
                text
                size="small"
                class="reset-btn"
                @click="resetFilters"
                v-tooltip="{
                    value: 'مسح جميع الفلاتر',
                    showDelay: 300,
                    hideDelay: 300
                }"
            />
        </div>

        <!-- ============================================================
             قسم الفلاتر المتقدمة (قابل للتوسيع/الطي)
        ============================================================ -->
        <Transition name="expand">
            <div v-if="isExpanded" class="advanced-filters">

                <div class="advanced-filters-header flex justify-content-between align-items-center mb-3">
                    <span class="advanced-label">
                        <i class="pi pi-filter ml-1" />
                        فلاتر متقدمة
                    </span>
                    <Button
                        label="إعادة تعيين"
                        icon="pi pi-times"
                        severity="secondary"
                        text
                        size="small"
                        @click="resetFilters"
                    />
                </div>

                <div class="grid gap-3">

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
                            <label for="internal_filter_department_id">
                                <i class="fas fa-layer-group" /> اختر القسم
                            </label>
                        </FloatLabel>
                        <small class="hint-text">فلترة حسب القسم</small>
                    </div>

                    <!-- حالة الطلب -->
                    <div class="col">
                        <Select
                            id="internla_filter_status_type"
                            v-model="internalFilters.status_type"
                            :options="statuses"
                            filter
                            optionLabel="label"
                            optionValue="value"
                            fluid
                            placeholder="حالة الطلب"
                        />
                        <small class="hint-text">فلترة حسب حالة الطلب</small>
                    </div>

                    <!-- الأولوية -->
                    <div class="col">
                        <Select
                            id="internla_filters_priority"
                            v-model="internalFilters.priority"
                            :options="priorities"
                            filter
                            optionLabel="label"
                            optionValue="value"
                            fluid
                            placeholder="الأولوية"
                        />
                        <small class="hint-text">فلترة حسب أهمية الطلب</small>
                    </div>
                </div>

                <!-- التواريخ -->
                <div class="grid mt-3">
                    <div class="col">
                        <FloatLabel variant="on">
                            <DatePicker
                                id="internal_filter_date_from"
                                v-model="internalFilters.date_from"
                                showIcon
                                fluid
                                iconDisplay="input"
                                dateFormat="yy/mm/dd"
                            />
                            <label for="internal_filter_date_from">
                                <i class="fas fa-calendar-alt" /> من تاريخ
                            </label>
                        </FloatLabel>
                        <small class="hint-text">الطلبات ما بعد هذا التاريخ</small>
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
                            <label for="internal_filter_date_to">
                                <i class="fas fa-calendar-alt" /> إلى تاريخ
                            </label>
                        </FloatLabel>
                        <small class="hint-text">الطلبات ما قبل هذا التاريخ</small>
                    </div>
                </div>

            </div>
        </Transition>

    </div>
</template>

<style scoped>
/* ===== الحاوية الرئيسية ===== */
.filter-panel {
    padding: 0.75rem 1rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
}

/* ===== شريط البحث ===== */
.search-bar {
    gap: 0.5rem;
}

.search-input {
    border-radius: 8px;
    transition: box-shadow 0.2s ease;
}

.search-input:focus {
    box-shadow: 0 0 0 2px var(--primary-color-text), 0 0 0 4px var(--primary-200);
}

.search-icon {
    color: var(--text-color-secondary);
    padding-right: 0.75rem;
}

/* ===== زر الفلاتر المتقدمة ===== */
.advanced-toggle-btn {
    flex-shrink: 0;
    min-width: 2.5rem;
    transition: transform 0.2s ease;
}

.advanced-toggle-btn:hover {
    transform: scale(1.05);
}

/* ===== زر إعادة التعيين ===== */
.reset-btn {
    flex-shrink: 0;
    transition: transform 0.2s ease;
}

.reset-btn:hover {
    transform: scale(1.1);
}

/* ===== قسم الفلاتر المتقدمة ===== */
.advanced-filters {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--surface-border);
    overflow: hidden;
}

.advanced-filters-header {
    margin-bottom: 0.75rem;
}

.advanced-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    display: flex;
    align-items: center;
}

/* ===== نص التلميح ===== */
.hint-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.72rem;
    color: var(--text-color-secondary);
}

/* ===== أنيميشن التوسيع/الطي ===== */
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