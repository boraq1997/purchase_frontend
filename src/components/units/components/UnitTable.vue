<template>
    <DataTable
        v-model:filters="filters"
        :value="units"
        :loading="loading"
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="['name', 'code', 'description']"
        responsiveLayout="scroll"
        class="text-right"
    >

        <!-- ── Empty ── -->
        <template #empty>
            <div class="flex flex-column align-items-center gap-3 py-5">
                <div class="empty-icon-wrap">
                    <i class="pi pi-box" />
                </div>
                <p class="font-medium text-color m-0">لا توجد وحدات مضافة</p>
                <p class="text-color-secondary text-sm m-0">ابدأ بإضافة وحدة قياس جديدة</p>
                <Button label="إضافة وحدة" icon="pi pi-plus" size="small" @click="emit('add')" />
            </div>
        </template>

        <!-- ── Loading ── -->
        <template #loading>
            <div class="flex align-items-center justify-content-center gap-2 py-4">
                <i class="pi pi-spinner pi-spin text-primary" />
                <span class="text-color-secondary">جارٍ تحميل البيانات...</span>
            </div>
        </template>

        <!-- ── # ── -->
        <Column field="id" sortable style="width: 4rem">
            <template #header>
                <span v-tooltip="{ value: 'الرقم التسلسلي', showDelay: 500, hideDelay: 300 }">
                    <i class="pi pi-hashtag text-color-secondary" />
                </span>
            </template>
            <template #body="{ index }">
                <span class="text-color-secondary text-sm font-mono">
                    {{ (currentPage - 1) * perPage + index + 1 }}
                </span>
            </template>
        </Column>

        <!-- ── الوحدة ── -->
        <Column field="name" sortable>
            <template #header>
                <span v-tooltip="{ value: 'اسم وحدة القياس', showDelay: 500, hideDelay: 300 }">
                    <i class="pi pi-tag text-color-secondary" /> الوحدة
                </span>
            </template>
            <template #body="{ data }">
                <div class="flex align-items-center gap-2">
                    <div class="unit-avatar">{{ data.name.charAt(0) }}</div>
                    <div>
                        <div class="font-semibold text-sm">{{ data.name }}</div>
                        <div v-if="data.description" class="text-color-secondary unit-desc">
                            {{ data.description }}
                        </div>
                    </div>
                </div>
            </template>
        </Column>

        <!-- ── الكود ── -->
        <Column field="code" sortable>
            <template #header>
                <span v-tooltip="{ value: 'الكود المختصر للوحدة', showDelay: 500, hideDelay: 300 }">
                    <i class="pi pi-hashtag text-color-secondary" /> الكود
                </span>
            </template>
            <template #body="{ data }">
                <Tag v-if="data.code" :value="data.code" severity="secondary" class="font-mono" />
                <span v-else class="text-color-secondary text-sm">—</span>
            </template>
        </Column>

        <!-- ── العناصر المرتبطة ── -->
        <Column>
            <template #header>
                <span v-tooltip="{ value: 'عدد عناصر الطلبات المرتبطة بهذه الوحدة', showDelay: 500, hideDelay: 300 }">
                    <i class="pi pi-list text-color-secondary" /> العناصر
                </span>
            </template>
            <template #body="{ data }">
                <Tag
                    v-if="data.request_items_count !== undefined"
                    :value="String(data.request_items_count)"
                    :severity="data.request_items_count > 0 ? 'info' : 'secondary'"
                />
                <span v-else class="text-color-secondary text-sm">—</span>
            </template>
        </Column>

        <!-- ── تاريخ الإضافة ── -->
        <Column field="created_at" sortable>
            <template #header>
                <span v-tooltip="{ value: 'تاريخ إضافة الوحدة', showDelay: 500, hideDelay: 300 }">
                    <i class="pi pi-calendar text-color-secondary" /> تاريخ الإضافة
                </span>
            </template>
            <template #body="{ data }">
                <span class="text-color-secondary text-sm">{{ formatDate(data.created_at) }}</span>
            </template>
        </Column>

        <!-- ── الإجراءات ── -->
        <Column>
            <template #header>
                <span v-tooltip="{ value: 'إدارة الوحدة', showDelay: 500, hideDelay: 300 }">
                    <i class="pi pi-cog text-color-secondary" /> الإدارة
                </span>
            </template>
            <template #body="{ data }">
                <div class="flex align-items-center gap-1">
                    <Button
                        icon="pi pi-pencil"
                        severity="secondary"
                        rounded
                        outlined
                        v-tooltip="{ value: 'تعديل بيانات الوحدة', showDelay: 1000, hideDelay: 300 }"
                        @click="emit('edit', data)"
                    />
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        rounded
                        outlined
                        v-tooltip="{ value: 'حذف الوحدة', showDelay: 1000, hideDelay: 300 }"
                        @click="handleDeleteUnit(data)"
                    />
                </div>
            </template>
        </Column>

    </DataTable>

    <!-- ConfirmDialog خاص بحذف الوحدات -->
    <ConfirmDialog group="deleteUnit" dir="rtl" />
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Unit } from '../unitsType'
import unitsService from '../unitsService'

const confirm = useConfirm()
const toast = useToast()
const isConfirming = ref(false) // منع فتح أكثر من confirm في نفس الوقت

defineProps<{
    units: Unit[]
    loading: boolean
    currentPage: number
    perPage: number
}>()

const emit = defineEmits<{
    'edit': [unit: Unit]
    'delete': [unit: Unit] // يُطلق بعد الحذف الناجح ليعيد الـ parent الـ fetch
    'add': []
}>()

const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

function formatDate(date: string | null): string {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('ar-IQ', {
        year: 'numeric', month: 'short', day: 'numeric'
    })
}

function handleDeleteUnit(data: Unit) {
    if (isConfirming.value) return

    isConfirming.value = true

    confirm.require({
        group: 'deleteUnit',
        message: `هل أنت متأكد من حذف الوحدة "${data.name}"؟`,
        header: 'تأكيد الحذف',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'تأكيد',
        acceptIcon: 'pi pi-check',
        acceptClass: 'p-button-sm border border-red-500 bg-red-500 text-white',
        rejectLabel: 'إلغاء',
        rejectIcon: 'pi pi-times',
        rejectClass: 'p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200',
        accept: async () => {
            try {
                await unitsService.deleteUnit(data.id)
                toast.add({
                    severity: 'success',
                    summary: 'نجاح',
                    detail: 'تم حذف الوحدة بنجاح',
                    life: 3000,
                })
                emit('delete', data) // الـ parent يستقبل ويعيد الـ fetch
            } catch (err: any) {
                toast.add({
                    severity: 'error',
                    summary: 'خطأ',
                    detail: err?.response?.data?.message ?? 'حدث خطأ أثناء حذف الوحدة',
                    life: 3000,
                })
            } finally {
                isConfirming.value = false
            }
        },
        reject: () => {
            isConfirming.value = false
            
        },
    })
}
</script>

<style scoped>
.unit-avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--p-primary-500) 15%, transparent);
    color: var(--p-primary-600);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
    text-transform: uppercase;
}

.unit-desc {
    
    white-space: nowrap;
    text-overflow: ellipsis;
}

.empty-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: var(--p-surface-100);
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-icon-wrap .pi {
    font-size: 1.5rem;
    color: var(--p-text-muted-color);
}
</style>