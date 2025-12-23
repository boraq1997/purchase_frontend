<template>
    <!-- Main Card Container -->
    <div class="card" dir="rtl">

        <!-- Breadcrumb Navigation -->
        <div class="flex justify-center mt-3 mb-3">
            <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems"/>
        </div>

        <!-- Loading Overlay -->
        <div
            v-if="isLoading"
            class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5"
            style="background-color: #2828289C;"
        >
            <div class="text-primary-500 border-round text-center">
                <i 
                    class="fas fa-circle-notch fa-spin fa-2xl" 
                    style="font-size: 80px;"
                />
            </div>
        </div>

        <!-- Add Vendor Button -->
        <div class="flex justify-between mb-3">
            <Button
                label="بائع جديد"
                icon="fas fa-plus"
                @click="openAddEditVendorDialog()"
            />
        </div>

        <!-- Vendors Data Table -->
        <DataTable
            v-model:filters="filters"
            :value="allVendors"
            dataKey="id"
            paginator
            :rows="10"
            filterDisplay="menu"
            :globalFilterFields="['name', 'phone1', 'phone2', 'emial', 'address']"
            responsiveLayout="scroll"
            class="text-right"
        >
            <!-- Table Header with Global Search -->
            <template #header>
                <div>
                    <FloatLabel variant="on">
                        <InputText id="global_filter_label" v-model="filters.global.value" style="width: 20vw;"/>
                        <label for="global_filter_label">
                            <i class="fas fa-search"/> بحث شامل
                        </label>
                    </FloatLabel>
                    <small class="text-gray-500 text-xs">بحث شامل على كل من الحقول [اسم البائع, ارقام الهواتف, البريد الالكتروني, العنوان]</small>
                </div>
            </template>

            <!-- Empty State Message -->
            <template #empty>
                <Message severity="warn">لم يتم العثور على بيانات للبائعين</Message>
            </template>

            <!-- Loading Message -->
            <template #loading>
                جاري تحميل بيانات البائعين...
            </template>

            <!-- Table Columns -->
            <Column field="id" sortable>
                <template #header>
                    <i class="fas fa-hashtag text-gray-500"/>
                </template>
            </Column>

            <Column field="name" sortable>
                <template #header>
                    <i class="fas fa-user-tie text-gray-500"/> الاسم
                </template>
            </Column>

            <Column field="phone1" sortable>
                <template #header>
                    <i class="fas fa-phone-flip text-gray-500"/> رقم الهاتف 1
                </template>
            </Column>

            <Column field="phone2" sortable>
                <template #header>
                    <i class="fas fa-phone-flip text-gray-500"/> رقم الهاتف 2    
                </template>
            </Column>

            <Column field="email" sortable>
                <template #header>
                    <i class="fas fa-envelope text-gray-500"/> البريد الالكتروني
                </template>
                <template #body="slotProps">
                    <!-- Email Button with mailto link -->
                    <Button
                        as="a"
                        :label="slotProps.data.email"
                        severity="info"
                        variant="text"
                        :href="`mailto:${slotProps.data.email}?subject=${encodeURIComponent('عنوان الرسالة')}&body=${encodeURIComponent('نص الرسالة')}`"
                        v-tooltip="{ value: 'اضغط لارسال رسالة الى البائع بواسطة البريد الالكتروني', showDelay: 500, hideDelay: 300 }"
                    />
                </template>
            </Column>

            <Column field="address" sortable>
                <template #header>
                    <i class="fas fa-map-location-dot text-gray-500"/> العنوان
                </template>
            </Column>

            <!-- Management Actions Column -->
            <Column>
                <template #header>
                    <i class="fas fa-cogs text-gray-500"/> الادارة
                </template>
                <template #body="{data}">
                    <!-- Edit Vendor Button -->
                    <Button 
                        icon="fa-solid fa-pen-to-square" 
                        class="ml-1" 
                        severity="secondary" 
                        rounded 
                        variant="outlined" 
                        aria-label="edit" 
                        @click="openAddEditVendorDialog(data)" 
                        v-tooltip="{ value: 'تعديل بيانات البائع', showDelay: 1000, hideDelay: 300 }"
                    />
                    <!-- View Vendor Estimates Button -->
                    <Button 
                        icon="fa-solid fa-receipt" 
                        class="ml-1" 
                        severity="secondary" 
                        rounded 
                        variant="outlined" 
                        aria-label="estimates" 
                        @click="openAllEstimatesDialog(data)" 
                        v-tooltip="{ value: 'عرض جميع عروض الاسعار السابقة الخاصه بالبائع', showDelay: 1000, hideDelay: 300 }"
                    />
                    <!-- Delete Vendor Button -->
                    <Button 
                        icon="fas fa-minus" 
                        class="ml-1" 
                        severity="danger" 
                        rounded 
                        variant="outlined" 
                        aria-label="delete" 
                        @click="confirmDeleteVendor(data)" 
                        v-tooltip="{ value: 'حذف بيانات البائع', showDelay: 1000, hideDelay: 300 }"
                    />
                </template>
            </Column>
        </DataTable>

        <!-- Add/Edit Vendor Dialog -->
        <Dialog
            v-model:visible="addEditVendorDialogVisible"
            :header="isEditMode ? 'تعديل بيانات البائع' : 'اضافة بائع جديد'"
            modal
            dir="rtl"
        >
            <div class="flex flex-column gap-4 mt-3">
                <!-- Vendor Name -->
                <FloatLabel variant="on">
                    <InputText id="name_field" v-model="vendorForm.name" fluid/>
                    <label for="name_field"><i class="fas fa-user-tie"/> اسم البائع</label>
                </FloatLabel>

                <!-- Vendor Phones and Email -->
                <div class="grid">
                    <FloatLabel variant="on" class="col">
                        <InputText id="phone1_field" v-model="vendorForm.phone1" fluid/>
                        <label for="phone1_field"><i class="fas fa-phone-flip"/> رقم الهاتف 1</label>
                    </FloatLabel>

                    <FloatLabel variant="on" class="col">
                        <InputText id="phone2_field" v-model="vendorForm.phone2" fluid/>
                        <label for="phone2_field"><i class="fas fa-phone-flip"/> رقم الهاتف 2</label>
                    </FloatLabel>

                    <FloatLabel variant="on" class="col">
                        <InputText id="email_field" v-model="vendorForm.email" fluid/>
                        <label for="email_field"><i class="fas fa-envelope"/> البريد الالكتروني</label>
                    </FloatLabel>
                </div>

                <!-- Vendor Address -->
                <FloatLabel variant="on">
                    <InputText v-model="vendorForm.address" fluid/>
                    <label for="address_field"><i class="fas fa-map-location-dot"/> العنوان</label>
                </FloatLabel>
            </div>

            <!-- Dialog Footer Buttons -->
            <template #footer>
                <Button
                    label="الغاء"
                    icon="fas fa-times"
                    severity="secondary"
                    class="p-button-sm"
                    @click="addEditVendorDialogVisible = false;"
                />
                <Button
                    label="حفظ"
                    icon="fas fa-floppy-disk"
                    severity="success"
                    :loading="isSaving"
                    :disabled="!vendorForm.name"
                    class="p-button-sm"    
                    @click="saveHandling"
                />
            </template>
        </Dialog>

        <!-- All Estimates Dialog -->
        <Dialog
            v-model:visible="showAllEstimatesDialogVisible"
            header="جميع عروض الاسعار"
            :style="{width: '70vw'}"
            modal
            maximizable
            dir="rtl"
        >
            <div class="grid">
                <div 
                    v-for="estimate in vendorEstimates" 
                    :key="estimate.id"
                    class="col-12 lg:col-4 xl:col-4"
                >
                    <Card class="purchase-card shadow-2 border-round-xl bg-gray-800" dir="rtl">
                        <template #content>
                            <div class="p-0">

                                <!-- Header with Request Number and Priority -->
                                <div class="flex align-items-center justify-content-between mb-3">
                                    <div class="flex align-items-center gap-2">
                                        <i class="fas fa-hashtag"/>
                                        <span class="text-lg font-bold text-900">
                                            {{ estimate.purchase_request?.request_number ?? "—" }}
                                        </span>
                                    </div>
                                    <Tag 
                                        :value="estimate.purchase_request?.priority ?? 'low'"
                                        :severity="priorityColor[estimate.purchase_request?.priority ?? 'low']"
                                        rounded
                                    />
                                </div>

                                <!-- Estimate Title -->
                                <div class="surface-100 border-round-lg p-3 mb-3">
                                    <div class="font-bold text-900 text-lg">
                                        {{ estimate.purchase_request?.title ?? "—" }}
                                    </div>
                                    <div class="text-xs text-600 mt-2">
                                        <i class="pi pi-id-card"></i>
                                        <span>رقم الطلب: {{ estimate.purchase_request?.id ?? "—" }}</span>
                                    </div>
                                </div>

                                <!-- Estimate Summary Grid -->
                                <div class="grid mb-3">
                                    <div class="col-6">
                                        <div class="text-xs text-600 mb-2 flex align-items-center gap-1">
                                            <i class="pi pi-flag text-orange-600"></i>
                                            <span>حالة الطلب</span>
                                        </div>
                                        <Chip
                                            :label="statusMap[estimate.status]?.label ?? '—'"
                                            :icon="statusMap[estimate.status]?.icon ?? ''"
                                            :class="(statusMap[estimate.status]?.class ?? '') + ' w-full justify-content-center font-semibold'"
                                        />
                                    </div>

                                    <div class="col-6">
                                        <div class="text-xs text-600 mb-2 flex align-items-center gap-1">
                                            <i class="pi pi-list-check text-teal-600"></i>
                                            <span>عدد المواد</span>
                                        </div>
                                        <Chip 
                                            :label="String(estimate.estimate_items?.length ?? 0)"
                                            class="w-full justify-content-center font-bold"
                                            icon="pi pi-box"
                                        />
                                    </div>
                                </div>

                                <!-- Estimated Cost -->
                                <div class="border-round-lg p-3 mb-3">
                                    <div class="flex align-items-center justify-content-between">
                                        <div class="flex align-items-center gap-2">
                                            <i class="pi pi-dollar"></i>
                                            <span class="text-sm font-semibold text-700">التكلفة التقديرية</span>
                                        </div>
                                        <span class="text-2xl font-bold text-green-700">
                                            {{ estimate.total_amount ?? "—" }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Items List Accordion -->
                                <div class="mb-3">
                                    <Accordion :multiple="false">
                                        <AccordionPanel multiple >
                                            <AccordionHeader>
                                                <div class="flex align-items-center justify-content-between w-full pl-3">
                                                    <div class="flex align-items-center gap-2">
                                                        <i class="pi pi-box text-primary"></i>
                                                        <span class="font-bold text-900">قائمة المواد</span>
                                                    </div>
                                                    <Badge 
                                                        :value="estimate.estimate_items?.length ?? 0" 
                                                        severity="info"
                                                    />
                                                </div>
                                            </AccordionHeader>
                                            
                                            <AccordionContent>
                                                <div v-if="estimate.estimate_items?.length > 0" class="max-h-20rem overflow-y-auto">
                                                    <div 
                                                        v-for="(item, index) in estimate.estimate_items" 
                                                        :key="item.id"
                                                        class="p-3 border-round mb-2 hover:surface-100 transition-colors transition-duration-200"
                                                        :class="index % 2 === 0 ? 'surface-50' : 'surface-0'"
                                                    >
                                                        <!-- Item Details -->
                                                        <div class="flex align-items-start justify-content-between mb-2">
                                                            <div class="flex align-items-start gap-2 flex-1">
                                                                <Badge :value="index + 1" class="mt-1" />
                                                                <div>
                                                                    <div class="font-semibold text-900 mb-1">
                                                                        {{ item.item_name }}
                                                                    </div>
                                                                    <div class="text-sm text-600">
                                                                        <i class="pi pi-info-circle ml-1"></i>
                                                                        {{ item.description || 'لا يوجد وصف' }}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <Divider class="my-2" />
                                                        
                                                        <!-- Quantity, Unit Price, Total -->
                                                        <div class="grid">
                                                            <div class="col">
                                                                <div class="text-xs text-500 mb-1">الكمية</div>
                                                                <div class="font-bold text-primary">
                                                                    <i class="pi pi-hashtag ml-1"></i>
                                                                    {{ item.quantity }}
                                                                </div>
                                                            </div>
                                                            <div class="col">
                                                                <div class="text-xs text-500 mb-1">سعر الوحدة</div>
                                                                <div class="font-bold text-orange-600">
                                                                    {{ item.unit_price }}
                                                                </div>
                                                            </div>
                                                            <div class="col">
                                                                <div class="text-xs text-500 mb-1">المجموع</div>
                                                                <div class="font-bold text-green-600">
                                                                    {{ (item.quantity * item.unit_price).toFixed(2) }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div v-else class="text-center text-500 py-4">
                                                    <i class="pi pi-inbox text-4xl mb-3"></i>
                                                    <div>لا توجد مواد</div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionPanel>
                                    </Accordion>
                                </div>

                                <!-- Footer with Created At -->
                                <div class="flex align-items-center justify-content-between pt-3 ">
                                    <div class="flex align-items-center gap-2 text-xs text-500">
                                        <i class="pi pi-clock"></i>
                                        <span>
                                            {{ estimate.created_at ? new Date(estimate.created_at).toLocaleString('ar-IQ') : "—" }}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </Dialog>

    </div>
</template>

<script lang="ts" setup>

/* =========================================================
   Vue & PrimeVue Core Imports
   ========================================================= */
import { ref, reactive, onMounted } from 'vue';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { FilterMatchMode } from "@primevue/core/api";

/* =========================================================
   Services & Types
   ========================================================= */
import VendorsService, { type Vendor } from './VendorsService';
import estimateService from '../estimate/estimateService';

/* =========================================================
   PrimeVue Components Imports
   ========================================================= */
import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import Accordion from 'primevue/accordion';
import Badge from 'primevue/badge';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import FloatLabel from 'primevue/floatlabel';

/* =========================================================
   PrimeVue Utilities
   ========================================================= */
const toast = useToast();      // Toast notifications handler
const confirm = useConfirm(); // Confirmation dialog handler

/* =========================================================
   UI State Flags
   ========================================================= */
const isLoading = ref(true);        // Global loading indicator
const isSaving = ref(false);        // Save button loading state
const isEditMode = ref(false);      // Determines add/edit mode
const isConfirming = ref(false);    // Prevents multiple confirmations

/* =========================================================
   Data Collections
   ========================================================= */
const allVendors = ref<any[]>([]);       // All vendors list
const vendorEstimates = ref<any[]>([]);  // Estimates related to a vendor

/* =========================================================
   Vendor Form State
   ========================================================= */
const vendorForm = ref<Vendor>({
    id: undefined,
    name: '',
    phone1: '',
    phone2: '',
    email: '',
    address: ''
});

/* =========================================================
   Dialog Visibility Controls
   ========================================================= */
const addEditVendorDialogVisible = ref(false);
const showAllEstimatesDialogVisible = ref(false);

/* =========================================================
   DataTable Filters
   ========================================================= */
const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

/* =========================================================
   Breadcrumb Configuration
   ========================================================= */
const breadcrumbHome = ref({ icon: 'fas fa-store', to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/", icon: "fas fa-house" },
    { label: "الباعه", to: "/vendors", icon: "fas fa-store" }
]);

/* =========================================================
   Fetch All Vendors with Relations
   ========================================================= */
const getAllVendors = async () => {
    isLoading.value = true;

    try {
        const response = await VendorsService.getAllVendorsWithRelations();
        allVendors.value = response;
        console.log(allVendors.value);
    } catch (err: any) {
        console.log(err);
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء ما اثناء جلب بيانات الباعة",
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

/* =========================================================
   Open Add / Edit Vendor Dialog
   ========================================================= */
const openAddEditVendorDialog = async (vendor: any = null) => {
    if (vendor) {
        // Edit mode
        isEditMode.value = true;
        vendorForm.value = {
            id: vendor.id,
            name: vendor.name,
            phone1: vendor.phone1,
            phone2: vendor.phone2,
            email: vendor.email,
            address: vendor.address
        };
    } else {
        // Add mode
        resetForm();
    }

    addEditVendorDialogVisible.value = true;
};

/* =========================================================
   Open Vendor Estimates Dialog
   ========================================================= */
const openAllEstimatesDialog = async (vendor: any) => {
    if (!vendor) {
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء ما اثناء جلب عروض الاسعار الخاصه بالبائع",
            life: 3000
        });
    } else {
        try {
            const response = await estimateService.getAll({ vendor_id: vendor.id });
            vendorEstimates.value = response.data;
            showAllEstimatesDialogVisible.value = true;
        } catch (err: any) {
            console.log(err);
            toast.add({
                severity: "error",
                summary: "رسالة خطاء",
                detail: "حدث خطاء ما اثناء جلب بيانات عروض الاسعار",
                life: 3000
            });
        }
    }
};

/* =========================================================
   Confirm & Delete Vendor
   ========================================================= */
const confirmDeleteVendor = (vendor: any) => {
    if (isConfirming.value) return;

    isConfirming.value = true;

    confirm.require({
        message: `هل أنت متأكد من حذف بيانات البائع "${vendor.name}"`,
        header: "تأكيد الحذف",
        icon: "pi pi-exclamation-triangle text-yellow-500",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass: "p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass: "p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",

        accept: async () => {
            try {
                await VendorsService.delete(vendor.id);
                toast.add({
                    severity: "success",
                    summary: "نجاح",
                    detail: "تم حذف بيانات البائع بنجاح",
                    life: 3000,
                });
                await getAllVendors();
            } catch (err: any) {
                console.log(err);
                toast.add({
                    severity: "error",
                    summary: "رسالة خطاء",
                    detail: "حدث خطاء ما اثناء حذف بيانات البائع",
                    life: 3000,
                });
            } finally {
                isConfirming.value = false;
            }
        },

        reject: () => (isConfirming.value = false),
    });
};

/* =========================================================
   Create / Update Vendor
   ========================================================= */
const saveHandling = async () => {
    if (!vendorForm.value.name) {
        toast.add({
            severity: "warn",
            summary: "رسالة خطاء",
            detail: "يرجى مراعاة جميع الحقول مطلوبة",
            life: 3000
        });
        return;
    }

    isSaving.value = true;

    const payload = {
        ...vendorForm.value,
    };

    try {
        if (isEditMode.value && vendorForm.value.id) {
            // Update vendor
            await VendorsService.update(payload.id, payload);
            toast.add({
                severity: "success",
                summary: "رسالة نجاح",
                detail: "تم تحديث بيانات البائع بنجاح",
                life: 3000
            });
        } else {
            // Create vendor
            await VendorsService.create(payload);
            toast.add({
                severity: "success",
                summary: "رسالة نجاح",
                detail: "تم اضافة بائع جديد بنجاح",
                life: 3000
            });
        }
    } catch (err: any) {
        console.log(err);
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء ما اثناء اضافة بيانات البائع",
            life: 3000
        });
    } finally {
        addEditVendorDialogVisible.value = false;
        isSaving.value = false;
        isEditMode.value = false;
        resetForm();
        getAllVendors();
    }
};

/* =========================================================
   Estimates Helpers (UI Mapping)
   ========================================================= */
const priorityColor = {
    high: "danger",
    medium: "warn",
    low: "success",
};

const statusMap = {
    pending: {
        label: "معلقة",
        icon: "pi pi-hourglass",
        class: "bg-yellow-500 text-yellow-700",
    },
    approved: {
        label: "تمت الموافقة",
        icon: "pi pi-check-circle",
        class: "bg-green-500 text-green-700",
    },
    rejected: {
        label: "مرفوضة",
        icon: "pi pi-times-circle",
        class: "bg-red-500 text-red-700",
    },
    completed: {
        label: "مكتملة",
        icon: "pi pi-check-square",
        class: "bg-blue-500 text-blue-700",
    },
};

/* =========================================================
   Reset Vendor Form
   ========================================================= */
const resetForm = () => {
    vendorForm.value = {
        id: undefined,
        name: '',
        phone1: '',
        phone2: '',
        email: '',
        address: ''
    };
};

/* =========================================================
   Lifecycle Hook
   ========================================================= */
onMounted(() => {
    getAllVendors();
});

</script>

<style scoped>
.purchase-card {
    border: 1px solid var(--surface-border);
    transition: 0.25s ease;
    width: 100%;
    max-width: 380px;
}

.purchase-card {
    box-shadow: 0 4px 12px -1px rgba(0,0,0,0.15);
    transform: translateY(-3px);
}

:deep(.p-card-body) {
  padding: 1.25rem;
}

:deep(.p-card-content) {
  padding: 0;
}
</style>