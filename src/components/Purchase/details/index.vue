<script setup lang="ts">
// ============================================================================
// COMPONENT: PurchaseDetailsDialog
// FILE PATH: purchase/details/index.vue
//
// DESCRIPTION:
// - Main dialog component used to display purchase request details
// - Top section: basic request information (status, priority, header data)
// - Middle section: items table (selection-enabled)
// - Bottom section: detailed cards for the selected item:
//   • Needs Assessment
//   • Warehouse Check
//   • Estimates
//
// NOTES:
// - Designed to work with v-model:visible
// - Child dialogs are used for editing and request actions
// ============================================================================

/**
 * Vue Composition API utilities
 * - ref: for reactive primitive values
 * - computed: for derived reactive state
 * - watch: for observing reactive value changes
 */
import { computed, ref, watch } from 'vue';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

/**
 * PrimeVue UI components
 */
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Divider from 'primevue/divider';

/**
 * Local components
 */
import ItemsTable from './components/ItemsTable.vue';
import WarehouseCheckCard from './components/warehouse/WarehouseCheckCard.vue';
import EstimatesCard from './components/estimates/EstimatesCard.vue';
import PurchaseFormDialog from '../create/PurchaseFormDialog.vue';
import RequestActionsDialog from '../actions/RequestActionsDialog.vue';

/**
 * Services
 * Used to re-fetch the purchase request from the backend after updates
 */
/**
 * Type definitions
 */
import type { PurchaseRequest } from '../interfaces/purchase.interfaces';
import { RequestItem } from '../interfaces/item.interfaces'
import { hasAnyPermission, hasPermission } from '../../services/permission';
import purchaseRequestsService from '../services/purchaseRequests.service';

/**
 * Accordion active panel state
 * Controls which accordion panel is currently open
 */
const active = ref('0');
const toast = useToast(); // Toast notifications
const confirm = useConfirm(); // Confirm dialog
const isConfirming = ref(false); // Flag to prevent multiple confirm dialogs

/**
 * Component props
 *
 * @property visible
 * - Controls dialog visibility (v-model compatible)
 *
 * @property request
 * - The selected purchase request to display
 * - Can be null when no request is selected
 */
const props = defineProps<{
    visible: boolean;
    request: PurchaseRequest | null;
}>();

/**
 * UI configuration for request status colors
 * Maps backend status values to PrimeVue Tag severity
 */
const statusColor: any = {
    pending: 'warn',
    approved: 'success',
    rejected: 'danger',
    completed: 'info'
};

/**
 * UI configuration for request status labels
 * Maps backend status values to Arabic display labels
 */
const statusLabel: any = {
    pending: 'معلقة',
    approved: 'مقبولة',
    rejected: 'مرفوضة',
    completed: 'مكتملة'
};

/**
 * UI configuration for request priority colors
 */
const priorityColor: any = {
    high: 'danger',
    medium: 'warn',
    low: 'info'
};

/**
 * UI configuration for request priority labels
 */
const priorityLabel: any = {
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة'
};

/**
 * Currently selected item from the items table
 *
 * This value controls which item details are shown
 * in the Needs Assessment, Warehouse Check, and Estimates cards
 */
const selectedItem = ref<RequestItem | null>(null);

/**
 * Debug watcher for selected item
 * Logs the selected item whenever it changes
 */
watch(selectedItem, (v) => {
    console.log('SELECTED ITEM =>', JSON.parse(JSON.stringify(v)));
});

/**
 * Handles item selection from ItemsTable component
 *
 * @param item - The selected request item
 */
function handleSelectItem(item: RequestItem) {
    selectedItem.value = item;
}

/**
 * Component emits
 *
 * update:visible
 * - Required to support v-model:visible on Dialog
 */
const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'deleted'): void;
}>();

/**
 * Internal computed binding for Dialog visibility
 *
 * - Getter reads from props.visible
 * - Setter emits update:visible to parent
 */
const internalVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value),
});

/**
 * Controls visibility of the Edit Purchase dialog
 */
const editDialogVisible = ref(false);

/**
 * Opens the Edit Purchase dialog
 */
function openEdit() {
    editDialogVisible.value = true;
}

const confirmDeleteRequest = (request: any)=>{
    if (isConfirming.value) return;
    if (!request) return;
    isConfirming.value = true;

    confirm.require({
        message: `هل انت متاكد من حذف بيانات طلب الشراء  "${request.title}"`,
        header: "تأكيد الحذف",
        icon: "pi pi-exclamation-triangle text-yellow-200",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass:"p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass:"p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: async()=>{
            try {
                await purchaseRequestsService.delete(request.id)
                toast.add({
                    severity: "success",
                    summary: "رسالة نجاح",
                    detail: "تم حذف بيانات الطلب بنجاح",
                    life: 3000
                })
                emit('deleted');
                internalVisible.value = false;
            } catch (err: any) {
                toast.add({
                    severity: "error",
                    summary: "رسالة خطاء",
                    detail: "حدث خطاء ما اثناء حذف بيانات الطلب",
                    life: 3000
                })
            } finally {
                isConfirming.value = false;
            }
        },
        reject: ()=>(isConfirming.value = false)
    });
}

/**
 * Indicates whether a valid request is available
 *
 * Used to guard UI rendering and actions
 */
const hasRequest = computed(() => !!props.request);

/**
 * Controls visibility of the request actions dialog
 */
const actionsDialogVisible = ref(false);

/**
 * Re-fetches the purchase request from the backend
 *
 * Used after actions or updates to ensure the dialog
 * reflects the latest data from the server
 */

watch(
    () => props.visible,
    (v) => {
        if (v) {
            selectedItem.value = null;
            active.value = '0';
        }
    }
);

/**
 * Handles successful update from EditPurchaseDialog
 *
 * @param updatedRequest - The updated request data returned from the edit dialog
 */
function handleUpdated(updatedRequest: PurchaseRequest) {
    // Close edit dialog
    editDialogVisible.value = false;

    // Update current request data without reloading
    if (props.request) {
        props.request.title = updatedRequest.title;
        props.request.description = updatedRequest.description;
        props.request.priority = updatedRequest.priority;
        props.request.department_id = updatedRequest.department_id;
        props.request.items = updatedRequest.items;
    }
}

// Tab configurations for item details
const tabs = [
    { value: '0', icon: 'fa-solid fa-warehouse', label: 'المخازن', tooltip: 'معلومات المخازن' },
    { value: '2', icon: 'fa-solid fa-receipt', label: 'العروض', tooltip: 'عروض الأسعار' },
    { value: '3', icon: 'fas fa-print', label: 'التقارير', tooltip: 'طباعة التقارير' }
];
</script>

<template>
    <!-- Main Dialog -->
    <Dialog
        v-model:visible="internalVisible"
        modal
        maximizable
        :draggable="false"
        :closable="true"
        :breakpoints="{ '960px': '95vw', '640px': '100vw' }"
        :style="{ width: '85vw' }"
        dir="rtl"
        :pt="{
            header: { class: 'border-bottom-1 surface-border pb-3' },
            content: { class: 'pt-3' }
        }"
    >
        <template #header>
            <div class="flex align-items-center gap-2">
                <i class="pi pi-file-edit text-2xl text-primary"></i>
                <span class="text-xl font-semibold">تفاصيل طلب الشراء</span>
            </div>
        </template>

        <!-- في حالة لا يوجد طلب محدد -->
        <div v-if="!hasRequest" class="text-center py-6">
            <i class="pi pi-inbox text-6xl text-400 mb-3 block"></i>
            <p class="text-600 text-lg">لا يوجد طلب محدد لعرض تفاصيله</p>
        </div>

        <!-- في حالة وجود طلب -->
        <div v-else>

            <!-- ============================= -->
            <!-- SECTION: Basic Request Info  -->
            <!-- ============================= -->
            <section class="mb-4">
                <div class="surface-card border-1 surface-border border-round-lg p-4">

                    <!-- HEADER (Request number + status + priority + actions) -->
                    <div class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

                        <!-- Request Number -->
                        <div class="flex align-items-center gap-2">
                            <div class="bg-primary-100 text-primary-700 border-circle w-2rem h-2rem flex align-items-center justify-content-center">
                                <i class="pi pi-hashtag text-sm"></i>
                            </div>
                            <span class="text-xl font-semibold text-900">
                                {{ props.request?.request_number }}
                            </span>
                            <Tag
                                :value="statusLabel[props.request?.status_type || 'pending']"
                                :severity="statusColor[props.request?.status_type || 'pending']"
                                rounded
                            >
                                <template #default>
                                    <div class="flex align-items-center gap-2 px-2">
                                        <i class="pi pi-flag-fill text-xs"></i>
                                        <span class="font-medium">{{ statusLabel[props.request?.status_type || 'pending'] }}</span>
                                    </div>
                                </template>
                            </Tag>

                            <!-- PRIORITY TAG -->
                            <Tag
                                :value="priorityLabel[props.request?.priority || 'medium']"
                                :severity="priorityColor[props.request?.priority || 'medium']"
                                rounded
                            >
                                <template #default>
                                    <div class="flex align-items-center gap-2 px-2">
                                        <i class="pi pi-exclamation-circle text-xs"></i>
                                        <span class="font-medium">{{ priorityLabel[props.request?.priority || 'medium'] }}</span>
                                    </div>
                                </template>
                            </Tag>
                        </div>

                        <!-- Status + Priority + Actions -->
                        <div class="flex align-items-center gap-2 flex-wrap">

                            <!-- STATUS TAG -->
                            

                            <!-- ACTIONS -->
                            <div class="flex gap-2">
                                <Button
                                    v-if="hasPermission('edit-Procurement')"
                                    icon="fas fa-pen"
                                    severity="info"
                                    size="small"
                                    @click="openEdit"
                                    outlined
                                    v-tooltip.top="'تعديل الطلب'"
                                />

                                <Button
                                    severity="danger"
                                    icon="fas fa-trash-alt"
                                    size="small"
                                    outlined
                                    v-tooltip.top="'حذف الطلب'"
                                    @click="confirmDeleteRequest(props.request)"
                                />

                                <Button
                                    v-if="hasAnyPermission([
                                        'finalize-procurement',
                                        'approve-purchase-request',
                                        'generate-report',
                                        'create-WarehouseCheck',
                                        'edit-WarehouseCheck',
                                        'delete-WarehouseCheck',
                                        'view-Report',
                                        'create-Report',
                                        'edit-Report',
                                        'delete-Report'
                                    ])"
                                    label="إجراءات"
                                    icon="fas fa-cog"
                                    severity="warn"
                                    size="small"
                                    outlined
                                    @click="actionsDialogVisible = true"
                                    v-tooltip.top="'إجراءات الطلب'"
                                />
                            </div>
                        </div>

                    </div>

                    <Divider class="my-3" />

                    <!-- TITLE & DESCRIPTION -->
                    <div class="mb-4">
                        <h3 class="text-900 font-semibold text-xl mb-2 m-0">
                            {{ props.request?.title }}
                        </h3>
                        <p class="text-600 line-height-3 m-0" v-if="props.request?.description">
                            {{ props.request?.description }}
                        </p>
                        <p class="text-400 text-sm m-0" v-else>
                            لا يوجد وصف
                        </p>
                    </div>

                    <!-- GRID INFO -->
                    <div class="grid text-sm">

                        <!-- Department -->
                        <div class="col-12 md:col-4 mb-3">
                            <div class="flex align-items-start gap-3 p-3 surface-50 border-round">
                                <div class="bg-blue-100 text-blue-600 border-circle w-2rem h-2rem flex align-items-center justify-content-center flex-shrink-0">
                                    <i class="pi pi-building text-sm"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="text-500 text-xs mb-1">القسم</div>
                                    <div class="text-900 font-medium">
                                        {{ props.request?.department?.name ?? '—' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Creator -->
                        <div class="col-12 md:col-4 mb-3">
                            <div class="flex align-items-start gap-3 p-3 surface-50 border-round">
                                <div class="bg-teal-100 text-teal-600 border-circle w-2rem h-2rem flex align-items-center justify-content-center flex-shrink-0">
                                    <i class="pi pi-user text-sm"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="text-500 text-xs mb-1">مقدم الطلب</div>
                                    <div class="text-900 font-medium">
                                        {{ props.request?.creator?.name ?? '—' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Date -->
                        <div class="col-12 md:col-4 mb-3">
                            <div class="flex align-items-start gap-3 p-3 surface-50 border-round">
                                <div class="bg-orange-100 text-orange-600 border-circle w-2rem h-2rem flex align-items-center justify-content-center flex-shrink-0">
                                    <i class="pi pi-calendar text-sm"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="text-500 text-xs mb-1">تاريخ الإنشاء</div>
                                    <div class="text-900 font-medium">
                                        {{ props.request?.created_at ? new Date(props.request.created_at).toLocaleDateString('ar-IQ', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        }) : '-' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <!-- ============================= -->
            <!-- SECTION: Items Table -->
            <!-- ============================= -->
            <section class="mb-4">
                <div class="surface-card border-1 surface-border border-round-lg p-4">
                    <div class="flex align-items-center gap-2 mb-3">
                        <i class="pi pi-list text-primary text-xl"></i>
                        <h3 class="text-lg font-semibold m-0">المواد المطلوبة</h3>
                        <Tag :value="`${props.request?.items?.length ?? 0} مادة`" severity="secondary" rounded />
                    </div>
                    <ItemsTable :items="props.request?.items ?? []" @select-item="handleSelectItem" />
                </div>
            </section>

            <!-- ============================================= -->
            <!-- SECTION: Selected Item Details -->
            <!-- ============================================= -->
            <section>
                <div class="surface-card border-1 surface-border border-round-lg p-4">
                    
                    <div class="flex align-items-center gap-2 mb-3">
                        <i class="pi pi-info-circle text-primary text-xl"></i>
                        <h3 class="text-lg font-semibold m-0">تفاصيل المادة المختارة</h3>
                    </div>

                    <!-- No Item Selected State -->
                    <div v-if="!selectedItem" class="text-center py-6">
                        <div class="inline-flex align-items-center justify-content-center bg-gray-100 border-circle mb-3" style="width: 4rem; height: 4rem;">
                            <i class="pi pi-arrow-up text-3xl text-400"></i>
                        </div>
                        <p class="text-600 m-0">اختر مادة من الجدول أعلاه لعرض تفاصيلها</p>
                    </div>

                    <!-- Item Selected - Show Tabs -->
                    <div v-else>
                        
                        <!-- Tab Navigation -->
                        <div class="flex gap-2 mb-4 border-bottom-1 surface-border pb-2 overflow-x-auto">
                            <Button
                                v-for="tab in tabs"
                                :key="tab.value"
                                @click="active = tab.value"
                                :outlined="active !== tab.value"
                                size="small"
                                class="flex-shrink-0"
                                v-tooltip.top="tab.tooltip"
                            >
                                <template #default>
                                    <i :class="tab.icon" class="mr-2"></i>
                                    <span>{{ tab.label }}</span>
                                </template>
                            </Button>
                        </div>

                        <!-- Accordion Content -->
                        <Accordion v-model:value="active">
                            
                            <!-- Warehouse Check -->
                            <AccordionPanel value="0">
                                <AccordionHeader>
                                    <div class="flex align-items-center gap-2">
                                        <i class="fa-solid fa-warehouse text-primary"></i>
                                        <span>معلومات المخازن</span>
                                    </div>
                                </AccordionHeader>
                                <AccordionContent>
                                    <WarehouseCheckCard :item="selectedItem" />
                                </AccordionContent>
                            </AccordionPanel>

                            <!-- Estimates -->
                            <AccordionPanel value="2">
                                <AccordionHeader>
                                    <div class="flex align-items-center gap-2">
                                        <i class="fa-solid fa-receipt text-primary"></i>
                                        <span>عروض الأسعار</span>
                                    </div>
                                </AccordionHeader>
                                <AccordionContent>
                                    <EstimatesCard :item="selectedItem" />
                                </AccordionContent>
                            </AccordionPanel>

                            <!-- Reports -->
                            <AccordionPanel value="3">
                                <AccordionHeader>
                                    <div class="flex align-items-center gap-2">
                                        <i class="fas fa-print text-primary"></i>
                                        <span>التقارير</span>
                                    </div>
                                </AccordionHeader>
                                <AccordionContent>
                                    <div class="text-center py-4 text-500">
                                        <i class="pi pi-file-pdf text-4xl mb-3 block"></i>
                                        <p>قريباً: سيتم إضافة خاصية طباعة التقارير</p>
                                    </div>
                                </AccordionContent>
                            </AccordionPanel>

                        </Accordion>

                    </div>
                </div>
            </section>

        </div>
    </Dialog>

    <!-- Edit Purchase Dialog -->
    <PurchaseFormDialog
        v-model:visible="editDialogVisible"
        :request="props.request"
        @updated="handleUpdated"
    />

    <!-- Request Actions Dialog -->
    <RequestActionsDialog
        v-model:visible="actionsDialogVisible"
        :purchaseRequest="props.request"
    />
</template>

<style scoped>
/* Smooth transitions for better UX */
.p-accordion-content {
    transition: all 0.3s ease;
}

/* Improve button group appearance */
.flex.gap-2 > .p-button {
    transition: all 0.2s ease;
}

.flex.gap-2 > .p-button:hover {
    transform: translateY(-1px);
}

/* Better scrollbar for tab navigation on mobile */
.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: var(--surface-ground);
    border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: var(--primary-700);
}
</style>