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

/**
 * Local components
 */
import ItemsTable from './components/ItemsTable.vue';
import NeedsAssessmentCard from './components/needs/NeedsAssessmentCard.vue';
import WarehouseCheckCard from './components/warehouse/WarehouseCheckCard.vue';
import EstimatesCard from './components/estimates/EstimatesCard.vue';
import EditPurchaseDialog from '../create/EditPurchaseDialog.vue';
import PurchaseFormDialog from '../create/PurchaseFormDialog.vue';
import RequestActionsDialog from '../actions/RequestActionsDialog.vue';

/**
 * Services
 * Used to re-fetch the purchase request from the backend after updates
 */
import purchaseRequestsService from '../services/purchaseRequests.service';

/**
 * Type definitions
 */
import type { PurchaseRequest } from '../interfaces/purchase.interfaces';
import { RequestItem } from '../interfaces/item.interfaces';

/**
 * Accordion active panel state
 * Controls which accordion panel is currently open
 */
const active = ref('0');

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
    low: 'success'
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
async function refreshRequest() {
    if (!props.request) return;

    // Fetch updated request data
    const updated = await purchaseRequestsService.getById(props.request.id);

    // Update request fields inside the dialog
    props.request.title = updated.title;
    props.request.description = updated.description;
    props.request.department_id = updated.department_id;
    props.request.priority = updated.priority;
    props.request.items = updated.items;
}

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
function handleUpdated(updatedRequest) {
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
        header="تفاصيل طلب الشراء"
        dir="rtl"
    >
        <!-- في حالة لا يوجد طلب محدد -->
        <div v-if="!hasRequest" class="p-4 text-center text-500">
            لا يوجد طلب محدد لعرض تفاصيله.
        </div>

        <!-- في حالة وجود طلب -->
        <div v-else class="p-2">

            <!-- ============================= -->
            <!-- SECTION: Basic Request Info  -->
            <!-- ============================= -->
            <section class="mb-4">

                <div class="surface-card shadow-1 border-round-xl p-4 mb-4">

                    <!-- HEADER (Request number + status + priority) -->
                    <div class="flex justify-content-between align-items-center mb-3">

                        <!-- Request Number -->
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-hashtag text-primary text-lg"></i>
                            <span class="text-xl font-bold text-900">
                                {{ props.request?.request_number }}
                            </span>
                        </div>

                        <!-- Status + Priority -->
                        <div class="flex align-items-center gap-2">

                            <!-- STATUS TAG -->
                            <Tag
                                :value="statusLabel[props.request?.status_type]"
                                :severity="statusColor[props.request?.status_type]"
                                icon="pi pi-flag-fill"
                                rounded
                                class="px-3 py-2 text-xs"
                            />

                            <!-- PRIORITY TAG -->
                            <Tag
                                :value="priorityLabel[props.request?.priority]"
                                :severity="priorityColor[props.request?.priority]"
                                rounded
                                class="px-3 py-2 text-xs"
                            />
                            <Button
                                label="تعديل"
                                icon="fas fa-pen"
                                severity="info"
                                class="ml-2"
                                @click="openEdit"
                                rounded
                                variant="outlined"
                            />

                            <Button
                                label="إجراءات"
                                icon="fas fa-cog"
                                severity="warn"
                                class="ml-2"
                                rounded
                                variant="outlined"
                                @click="actionsDialogVisible = true"
                            />
                        </div>

                    </div>

                    <!-- TITLE -->
                    <div class="text-900 font-bold text-lg mb-1">
                        {{ props.request?.title }}
                    </div>

                    <!-- DESCRIPTION -->
                    <p class="text-sm text-600 mb-3">
                        {{ props.request?.description }}
                    </p>

                    <!-- SOFT DIVIDER -->
                    <div class="w-full h-1 surface-200 border-round my-3"></div>

                    <!-- GRID INFO -->
                    <div class="grid text-sm text-700 mt-2">

                        <!-- Department -->
                        <div class="col-12 md:col-4 flex align-items-center gap-2">
                            <i class="pi pi-building text-blue-500"></i>
                            <span class="font-medium text-700">القسم:</span>
                            <span class="font-semibold text-900">
                                {{ props.request?.department?.name ?? '—' }}
                            </span>
                        </div>

                        <!-- Creator -->
                        <div class="col-12 md:col-4 flex align-items-center gap-2">
                            <i class="pi pi-user text-teal-600"></i>
                            <span class="font-medium text-700">مقدم الطلب:</span>
                            <span class="font-semibold text-900">
                                {{ props.request?.creator?.name ?? '—' }}
                            </span>
                        </div>

                        <!-- Date -->
                        <div class="col-12 md:col-4 flex align-items-center gap-2">
                            <i class="pi pi-clock text-orange-600"></i>
                            <span class="font-medium text-700">تاريخ الطلب:</span>
                            <span class="font-semibold text-900">
                                {{ new Date(props.request?.created_at).toLocaleString('ar-IQ') ?? '—' }}
                            </span>
                        </div>

                    </div>
                </div>

            </section>

            <!-- ============================= -->
            <!-- 2) جدول المواد (Placeholder حالياً) -->
            <!-- ============================= -->
            <section class="mb-4">
                <ItemsTable :items="props.request?.items ?? []" @select-item="handleSelectItem" />
            </section>

            <!-- ============================================= -->
            <!-- 3) تفاصيل المادة المختارة (Placeholder حالياً) -->
            <!-- ============================================= -->
            <!-- <section>
                <h3 class="text-md font-bold mb-2">تفاصيل المادة المختارة</h3>

                <div v-if="!selectedItem" class="surface-0 border-1 border-dashed surface-border border-round p-3 text-center text-500 text-sm">
                    اختر مادة من الجدول لعرض تفاصيلها
                </div>
                <div v-else>
                    <NeedsAssessmentCard :item="selectedItem" class="mb-5"/>
                    <WarehouseCheckCard :item="selectedItem" class="mb-5"/>
                    <EstimatesCard :item="selectedItem" />
                </div>
            </section> -->

            <section>
                <h3 class="text-md font-bold mb-2">تفاصيل المادة المختارة</h3>

                <div v-if="!selectedItem" class="surface-0 border-1 border-dashed surface-border border-round p-3 text-center text-500 text-sm">
                    اختر مادة من الجدول لعرض تفاصيلها
                </div>

                <div class="card" v-else>
                    <div class="flex mb-4 gap-2 justify-end mt-4">
                        <Button 
                            @click="active = '0'" 
                            rounded 
                            icon="fa-solid fa-warehouse" 
                            class="ml-1 p-button-sm"
                            :outlined="active !== '0'"
                        />
                        <Button 
                            @click="active = '1'" 
                            rounded 
                            icon="fa-solid fa-hand-holding-hand" 
                            class="ml-1 p-button-sm" 
                            :outlined="active !== '1'"
                        />
                        <Button 
                            @click="active = '2'" 
                            rounded icon="fa-solid fa-receipt" 
                            class="ml-1 p-button-sm" 
                            :outlined="active !== '2'"
                        />
                        <Button 
                            @click="active = '3'" 
                            rounded 
                            icon="fas fa-print" 
                            class="ml-1 p-button-sm" 
                            :outlined="active !== '3'"
                        />
                    </div>

                    <Accordion v-model:value="active">
                        <AccordionPanel value="0">
                            <AccordionHeader>المخازن</AccordionHeader>
                            <AccordionContent>
                                <WarehouseCheckCard :item="selectedItem" class="mb-5"/>
                            </AccordionContent>
                        </AccordionPanel>

                        <AccordionPanel value="1">
                            <AccordionHeader>بيان الحاجة</AccordionHeader>
                            <AccordionContent>
                                <NeedsAssessmentCard :item="selectedItem" class="mb-5"/>
                            </AccordionContent>
                        </AccordionPanel>

                        <AccordionPanel value="2">
                            <AccordionHeader>عروض الاسعار</AccordionHeader>
                            <AccordionContent>
                                <EstimatesCard :item="selectedItem" />
                            </AccordionContent>
                        </AccordionPanel>

                        <AccordionPanel value="3">
                            <AccordionHeader>H1</AccordionHeader>
                            <AccordionContent>
                                4444444
                            </AccordionContent>
                        </AccordionPanel>

                        <AccordionPanel value="4">
                            <AccordionHeader>H1</AccordionHeader>
                            <AccordionContent>
                                5555555
                            </AccordionContent>
                        </AccordionPanel>
                    </Accordion>

                </div>
            </section>

        </div>
    </Dialog>

    <PurchaseFormDialog
        v-model:visible="editDialogVisible"
        :request="props.request"
        @updated="handleUpdated"
    />

    

<RequestActionsDialog
  v-model:visible="actionsDialogVisible"
  :purchaseRequest="props.request"
/>
</template>

<style scoped>
</style>