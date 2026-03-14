<template>
    <DataTable
        v-model:filters="filters"
        :value="users"
        :loading="loading"
        dataKey="id"
        paginator
        :rows="10"
        filterDisplay="menu"
        :globalFilterFields="['name', 'username', 'email', 'phone', 'created_at', 'department_id', 'role']"
        responsiveLayout="scroll"
        class="text-right"
    >
        <template #header>
            <div class="flex flex-column gap-3 p-3">

                <!-- ── البحث النصي دائم الظهور ── -->
                <div class="flex align-items-center gap-2">
                    <FloatLabel variant="on" class="flex-1">
                        <InputText v-model="filters.global.value" fluid />
                        <label><i class="fas fa-search" /> بحث شامل...</label>
                    </FloatLabel>

                    <!-- زر البحث المتقدم -->
                    <Button
                        :icon="advancedOpen ? 'fas fa-chevron-up' : 'fas fa-sliders'"
                        :label="advancedOpen ? 'إخفاء البحث المتقدم' : 'بحث متقدم'"
                        variant="outlined"
                        severity="secondary"
                        size="small"
                        @click="advancedOpen = !advancedOpen"
                    />

                    <!-- زر إعادة الضبط — يظهر فقط إذا فيه فلاتر نشطة -->
                    <Button
                        v-if="hasActiveFilters"
                        icon="fas fa-times"
                        label="إعادة الضبط"
                        severity="danger"
                        variant="outlined"
                        size="small"
                        @click="resetFilters"
                    />
                </div>

                <!-- ── البحث المتقدم (Expanded) ── -->
                <Transition name="slide-down">
                    <div v-if="advancedOpen" class="p-3 border-round surface-border border-1 flex flex-column gap-3">
                        
                        <div class="grid">
                            <!-- الاسم -->
                            <div class="col-12 md:col-3">
                                <FloatLabel variant="on">
                                    <InputText v-model="advancedFilters.name" fluid @keyup.enter="applyAdvanced" />
                                    <label><i class="fas fa-user" /> الاسم</label>
                                </FloatLabel>
                            </div>

                            <!-- اسم المستخدم -->
                            <div class="col-12 md:col-3">
                                <FloatLabel variant="on">
                                    <InputText v-model="advancedFilters.username" fluid @keyup.enter="applyAdvanced" />
                                    <label><i class="fas fa-user-tag" /> اسم المستخدم</label>
                                </FloatLabel>
                            </div>

                            <!-- البريد الإلكتروني -->
                            <div class="col-12 md:col-3">
                                <FloatLabel variant="on">
                                    <InputText v-model="advancedFilters.email" fluid @keyup.enter="applyAdvanced" />
                                    <label><i class="fas fa-envelope" /> البريد الإلكتروني</label>
                                </FloatLabel>
                            </div>

                            <!-- رقم الهاتف -->
                            <div class="col-12 md:col-3">
                                <FloatLabel variant="on">
                                    <InputText v-model="advancedFilters.phone" fluid @keyup.enter="applyAdvanced" />
                                    <label><i class="fas fa-phone" /> رقم الهاتف</label>
                                </FloatLabel>
                            </div>
                        </div>

                        <div class="grid">
                            <!-- الحالة -->
                            <div class="col-12 md:col-4">
                                <FloatLabel variant="on">
                                    <Select
                                        v-model="advancedFilters.status"
                                        :options="statusOptions"
                                        optionLabel="label"
                                        optionValue="value"
                                        showClear
                                        fluid
                                    />
                                    <label><i class="fas fa-circle-dot" /> الحالة</label>
                                </FloatLabel>
                            </div>

                            <!-- القسم -->
                            <div class="col-12 md:col-4">
                                <FloatLabel variant="on">
                                    <Select
                                        v-model="advancedFilters.department_id"
                                        :options="departments"
                                        optionLabel="name"
                                        optionValue="id"
                                        filter
                                        showClear
                                        fluid
                                    />
                                    <label><i class="fa-solid fa-layer-group" /> القسم</label>
                                </FloatLabel>
                            </div>

                            <!-- الصلاحية -->
                            <div class="col-12 md:col-4">
                                <FloatLabel variant="on">
                                    <Select
                                        v-model="advancedFilters.role"
                                        :options="roles"
                                        optionLabel="name"
                                        optionValue="name"
                                        filter
                                        showClear
                                        fluid
                                    />
                                    <label><i class="fas fa-shield-alt" /> الصلاحية</label>
                                </FloatLabel>
                            </div>
                        </div>

                        <!-- أزرار التطبيق -->
                        <div class="flex justify-content-end gap-2">
                            <Button
                                label="إعادة الضبط"
                                icon="fas fa-undo"
                                severity="secondary"
                                variant="outlined"
                                size="small"
                                @click="resetFilters"
                            />
                            <Button
                                label="تطبيق البحث"
                                icon="fas fa-search"
                                size="small"
                                @click="applyAdvanced"
                            />
                        </div>

                    </div>
                </Transition>

                <!-- ── Tags للفلاتر النشطة ── -->
                <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
                    <Tag
                        v-for="(tag, i) in activeTags"
                        :key="i"
                        :value="tag.label"
                        severity="info"
                        class="cursor-pointer"
                        icon="fas fa-times"
                        @click="removeFilter(tag.key)"
                    />
                </div>

            </div>
        </template>

        <template #empty>
            <Message severity="warn">لم يتم العثور على مستخدمين</Message>
        </template>
        <template #loading>جاري تحميل بيانات المستخدمين...</template>

        <Column field="id" sortable>
            <template #header>
                <span v-tooltip="{ value: 'الرقم التسلسلي', showDelay: 500 }">
                    <i class="fas fa-hashtag text-gray-500" />
                </span>
            </template>
        </Column>

        <Column field="name" sortable>
            <template #header>
                <span v-tooltip="{ value: 'الاسم الرباعي', showDelay: 500 }">
                    <i class="fas fa-user text-gray-500" />الاسم
                </span>
            </template>
        </Column>

        <Column field="username" sortable>
            <template #header>
                <span v-tooltip="{ value: 'اسم المستخدم لتسجيل الدخول', showDelay: 500 }">
                    <i class="fas fa-user-tag text-gray-500" />اسم المستخدم
                </span>
            </template>
        </Column>

        <Column field="email" sortable>
            <template #header>
                <span v-tooltip="{ value: 'البريد الإلكتروني', showDelay: 500 }">
                    <i class="fas fa-envelope text-gray-500" />البريد الإلكتروني
                </span>
            </template>
            <template #body="{ data }">
                <Button
                    as="a"
                    :label="data.email"
                    severity="info"
                    variant="text"
                    :href="`mailto:${data.email}`"
                    v-tooltip="{ value: 'إرسال بريد إلكتروني', showDelay: 500 }"
                />
            </template>
        </Column>

        <Column field="department.name" sortable>
            <template #header>
                <span v-tooltip="{ value: 'القسم', showDelay: 500 }">
                    <i class="fa-solid fa-layer-group text-gray-500" />القسم
                </span>
            </template>
        </Column>

        <Column field="phone" sortable>
            <template #header>
                <span v-tooltip="{ value: 'رقم الهاتف', showDelay: 500 }">
                    <i class="fa-solid fa-phone-flip text-gray-500" />رقم الهاتف
                </span>
            </template>
            <template #body="{ data }">
                <Tag v-if="data.phone"  icon="fas fa-phone-flip" severity="info"   :value="data.phone" />
                <Tag v-else             icon="fas fa-info-circle" severity="danger" value="لا يوجد" />
            </template>
        </Column>

        <Column field="parent" sortable>
            <template #header>
                <span v-tooltip="{ value: 'الحساب الرئيسي', showDelay: 500 }">
                    <i class="fa-solid fa-user-lock text-gray-500" />الحساب الرئيسي
                </span>
            </template>
            <template #body="{ data }">
                <Tag v-if="data.parent"  icon="fas fa-user-lock" severity="info" :value="data.parent?.name" />
                <Tag v-else              icon="fas fa-user-lock" severity="warn"  value="لا يوجد" />
            </template>
        </Column>

        <Column field="status" sortable>
            <template #header>
                <span v-tooltip="{ value: 'الحالة', showDelay: 500 }">
                    <i class="fa-solid fa-circle-dot text-gray-500" />الحالة
                </span>
            </template>
            <template #body="{ data }">
                <Tag v-if="data.status === 'active'"   icon="fas fa-check" severity="success" value="مفعل" />
                <Tag v-if="data.status === 'inactive'" icon="fas fa-times" severity="danger"  value="معطل" />
            </template>
        </Column>

        <Column field="role" sortable>
            <template #header>
                <span v-tooltip="{ value: 'الصلاحيات', showDelay: 500 }">
                    <i class="fas fa-shield-alt text-gray-500" />الصلاحيات
                </span>
            </template>
        </Column>

        <Column field="created_at" sortable>
            <template #header>
                <span v-tooltip="{ value: 'تاريخ الإضافة', showDelay: 500 }">
                    <i class="fa-solid fa-calendar-plus text-gray-500" />تاريخ الإضافة
                </span>
            </template>
            <template #body="{ data }">
                {{ formatDate(data.created_at) }}
            </template>
        </Column>

        <Column style="width: 10rem">
            <template #header>
                <span v-tooltip="{ value: 'إدارة المستخدم', showDelay: 500 }">
                    <i class="fas fa-cogs text-gray-500" />الإدارة
                </span>
            </template>
            <template #body="{ data }">
                <Button
                    v-if="hasPermission('view-Committee')"
                    icon="fa-solid fa-users-viewfinder"
                    class="ml-1" severity="secondary" rounded variant="outlined"
                    @click="$emit('view-committees', data.committees)"
                    v-tooltip="{ value: 'عرض اللجان', showDelay: 1000 }"
                />
                <Button
                    v-if="hasPermission('edit-User')"
                    icon="fas fa-user-edit"
                    class="ml-1" severity="secondary" rounded variant="outlined"
                    @click="$emit('edit', data)"
                    v-tooltip="{ value: 'تعديل بيانات المستخدم', showDelay: 1000 }"
                />
                <Button
                    v-if="hasPermission('delete-User')"
                    icon="fas fa-user-minus"
                    severity="danger" rounded variant="outlined"
                    @click.stop="$emit('delete', data)"
                    v-tooltip="{ value: 'حذف المستخدم', showDelay: 1000 }"
                />
            </template>
        </Column>
    </DataTable>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { hasPermission } from "../../services/permission";

import DataTable  from "primevue/datatable";
import Column     from "primevue/column";
import InputText  from "primevue/inputtext";
import Message    from "primevue/message";
import Tag        from "primevue/tag";
import Button     from "primevue/button";
import Select     from "primevue/select";
import FloatLabel from "primevue/floatlabel";

// ── Props & Emits ──
defineProps<{
    users:       any[];
    loading:     boolean;
    departments: any[];
    roles:       any[];
}>();

const emit = defineEmits<{
    edit:              [user: any];
    delete:            [user: any];
    'view-committees': [committees: any[]];
    'advanced-search': [filters: any];
}>();

// ── Global filter ──
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// ── Advanced search state ──
const advancedOpen = ref(false);

const advancedFilters = reactive({
    name:          '',
    username:      '',
    email:         '',
    phone:         '',
    status:        null as string | null,
    department_id: null as number | null,
    role:          null as string | null,
});

// ── Options ──
const statusOptions = [
    { label: 'مفعل',  value: 'active'   },
    { label: 'معطل', value: 'inactive' },
];

// ── Active filters tags ──
const filterLabels: Record<string, string> = {
    name:          'الاسم',
    username:      'اسم المستخدم',
    email:         'البريد الإلكتروني',
    phone:         'رقم الهاتف',
    status:        'الحالة',
    department_id: 'القسم',
    role:          'الصلاحية',
};

const activeTags = computed(() =>
    Object.entries(advancedFilters)
        .filter(([, v]) => v !== null && v !== '')
        .map(([k, v]) => ({
            key:   k,
            label: `${filterLabels[k]}: ${
                k === 'status'
                    ? (v === 'active' ? 'مفعل' : 'معطل')
                    : v
            }`,
        }))
);

const hasActiveFilters = computed(() =>
    activeTags.value.length > 0 || !!filters.value.global.value
);

// ── Methods ──
const applyAdvanced = () => {
    // أرسل الفلاتر للـ parent ليقوم بالفلترة أو الـ API call
    const clean = Object.fromEntries(
        Object.entries(advancedFilters).filter(([, v]) => v !== null && v !== '')
    );
    emit('advanced-search', clean);
};

const removeFilter = (key: string) => {
    (advancedFilters as any)[key] = key === 'status' || key === 'department_id' ? null : '';
    applyAdvanced();
};

const resetFilters = () => {
    advancedFilters.name          = '';
    advancedFilters.username      = '';
    advancedFilters.email         = '';
    advancedFilters.phone         = '';
    advancedFilters.status        = null;
    advancedFilters.department_id = null;
    advancedFilters.role          = null;
    filters.value.global.value   = null;
    emit('advanced-search', {});
};

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("ar-EG");
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.25s ease;
    overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
    opacity: 1;
    max-height: 400px;
}
</style>