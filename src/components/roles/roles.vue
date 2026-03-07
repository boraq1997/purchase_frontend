<template>
    <div class="card flex justify-center mb-3 mt-3">
            <Breadcrumb 
                :home="breadcrumbHome" 
                :model="breadcrumbItems" 
            />
        </div>
    <div class="roles-management-page p-4" dir="rtl">
        <!-- ============================= -->
        <!-- Header & Breadcrumb Section -->
        <!-- ============================= -->
        

        <!-- ============================= -->
        <!-- Loading Overlay -->
        <!-- ============================= -->
        <div v-if="isLoading" class="loading-overlay">
            <ProgressSpinner 
                strokeWidth="4" 
                animationDuration=".5s" 
                style="width: 60px; height: 60px" 
            />
            <span class="mt-3 text-lg">جاري تحميل البيانات...</span>
        </div>

        <!-- ============================= -->
        <!-- Main Content -->
        <!-- ============================= -->
        <div v-else>
            <!-- Action Bar: Add New Role -->
            <Button 
                label="إضافة مجموعة جديدة" 
                icon="fas fa-plus" 
                @click="openAddEditRole()"
            />

            <!-- Filter Section -->
            <div class="p-4 rounded-lg shadow space-y-4" dir="rtl">
                <!-- Reset Filter Button -->
                <div class="flex justify-content-end mb-2">
                    <Button
                        label="اعادة تعيين الفلترة"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        text
                        size="small"
                        @click="resetFilter"
                        class="reset-button"
                    />
                </div>

                <!-- Filters: Search & Permissions -->
                <div class="grid gap-4">
                    <div class="col">
                        <InputText 
                            v-model="filters.search" 
                            placeholder="بحث عام..." 
                            fluid
                        />
                    </div>
                    <div class="col">
                        <MultiSelect
                            v-model="filters.permissions"
                            :options="allPermissionsArabic"
                            optionLabel="arabicLabel"
                            optionValue="value"
                            display="chip"
                            placeholder="فلترة حسب الصلاحيات"
                            @change="getAllRoles"
                            fluid
                        />
                    </div>
                </div>
            </div>

            <!-- Roles List (Card View) -->
            <div class="grid">
                <div 
                    v-for="role in filteredRoles" 
                    :key="role.id" 
                    class="col-12"
                >
                    <Panel
                        :collapsed="openPanel !== role.id"
                        toggleable
                        @toggle="togglePanel(role.id)"
                    >
                        <!-- Panel Header -->
                        <template #header>
                            <div class="flex items-center gap-2">
                                <!-- Edit & Delete Buttons -->
                                <Button 
                                    icon="fas fa-edit"
                                    variant="outlined"
                                    severity="secondary"
                                    @click="openAddEditRole(role)"
                                    v-if="hasPermission('Role-edit')"
                                />
                                <Button
                                    icon="fas fa-trash-alt"
                                    variant="outlined"
                                    severity="danger"
                                    @click="confirmDeleteRole(role)"
                                    v-if="hasPermission('Role-delete')"
                                />
                                
                                <!-- Role Name -->
                                <span class="font-bold mt-2">{{ role.name }}</span>

                                <!-- Creation Date -->
                                <span class="text-color-secondary text-sm mt-2">
                                    <i class="fas fa-calendar-alt mr-1"></i>
                                    تاريخ الإنشاء: {{ new Date(role.created_at).toLocaleDateString('ar-EG') }}
                                </span>
                            </div>
                        </template>

                        <!-- Role Card -->
                        <Card class="role-card mb-4 overflow-hidden">
                            <!-- Card Header -->
                            <template #header>
                                <div class="card-header p-3 flex align-items-center justify-content-between">
                                    <div class="flex align-items-center">
                                        <span class="font-bold text-lg">{{ role.name }}</span>
                                        <span class="text-color-secondary text-sm mx-3">|</span>
                                    </div>
                                </div>
                            </template>

                            <!-- Card Content: Permissions -->
                            <template #content>
                                <div v-if="Object.keys(role.groupedPermissions).length > 0" class="p-1">
                                    <div class="grid -m-1">
                                        <div 
                                            v-for="(perms, group) in role.groupedPermissions"
                                            :key="group"
                                            class="col-12 md:col-6 lg:col-4 p-1"
                                        >
                                            <!-- Permission Group Card -->
                                            <div class="permission-group p-3 border-round h-full">
                                                <h4 class="font-semibold text-base mb-3">
                                                    <i :class="getGroupIcon(String(group))" class="mr-2 text-primary"></i>
                                                    {{ getEntityArabicName(String(group)) }}
                                                </h4>
                                                <div class="flex flex-wrap gap-2">
                                                    <Tag
                                                        v-for="perm in perms"
                                                        :key="perm.name"
                                                        :icon="perm.icon"
                                                        :severity="perm.color"
                                                        class="permission-tag-enhanced"
                                                    >
                                                        <span class="permission-label">{{ perm.arabicLabel }}</span>
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- No Permissions Placeholder -->
                                <div v-else class="p-4 text-center text-color-secondary">
                                    <i class="fas fa-shield-alt fa-2x mb-2"></i>
                                    <p>لا توجد صلاحيات محددة لهذه المجموعة.</p>
                                </div>
                            </template>
                        </Card>
                    </Panel>
                </div>
            </div>
        </div>

        <!-- ============================= -->
        <!-- Add/Edit Role Dialog -->
        <!-- ============================= -->
        <Dialog
            v-model:visible="addEditRoleDialogVisible"
            :header="isEditMode ? 'تعديل بيانات المجموعة' : 'إضافة مجموعة جديدة'"
            :style="{width: '55vw'}"
            :breakpoints="{'960px': '75vw', '640px': '95vw'}"
            modal
            @hide="resetForm"
            dir="rtl"
        >
            <!-- Form Fields -->
            <div class="form-container p-fluid mt-4">
                <!-- Role Name -->
                <div class="field">
                    <FloatLabel variant="on">
                        <InputText id="roleName" v-model="roleForm.name" fluid/>
                        <label for="roleName"><i class="fas fa-user-shield"/> اسم المجموعة</label>
                    </FloatLabel>
                    <small class=" text-s mt-0">
                        اسم المجموعة العام كي يتم اختياره عند اضافة مستخدمين جدد
                    </small>
                </div>

                <!-- Role Permissions -->
                <div class="field permissions-field">
                    <label for="permissions" class="permissions-label">
                        <i class="fas fa-shield-alt mr-2"/> الصلاحيات
                    </label>
                    <small class="permissions-hint mb-3 block">
                        <i class="fas fa-info-circle mr-1"></i>
                        اختر الصلاحيات التي تحتاج إضافتها إلى المجموعة
                    </small>
                    
                    <MultiSelect
                        id="permissions"
                        v-model="roleForm.permissions"
                        :options="groupedPermissions"
                        optionGroupLabel="arabicLabel"
                        optionGroupChildren="items"
                        optionLabel="arabicLabel"
                        optionValue="value"
                        display="chip"
                        filter
                        :showToggleAll="false"
                        class="w-full permissions-multiselect-enhanced"
                        :filterPlaceholder="'🔍 ابحث عن الصلاحيات...'"
                        placeholder="انقر لاختيار الصلاحيات"
                        :panelStyle="{ minWidth: '600px' }"
                    >
                        <!-- Custom Option Group Template -->
                        <template #optiongroup="slotProps">
                            <div class="permission-group-header-enhanced">
                                <div class="group-header-content">
                                    <div class="group-icon-wrapper">
                                        <i :class="getGroupIcon(slotProps.option.entity)"></i>
                                    </div>
                                    <span class="group-title">{{ slotProps.option.arabicLabel }}</span>
                                    <span class="group-count">{{ slotProps.option.items.length }} صلاحية</span>
                                </div>
                            </div>
                        </template>

                        <!-- Custom Option Template -->
                        <template #option="slotProps">
                            <div class="permission-option-enhanced">
                                <div class="permission-main-row">
                                    <div class="permission-icon-wrapper" :style="{backgroundColor: getPermissionColorHex(slotProps.option.action) + '20'}">
                                        <i :class="slotProps.option.icon" :style="{color: getPermissionColorHex(slotProps.option.action)}"></i>
                                    </div>
                                    <div class="permission-info">
                                        <div class="permission-title">{{ slotProps.option.arabicLabel }}</div>
                                        <div class="permission-description">
                                            {{ slotProps.option.description }}
                                        </div>
                                    </div>
                                    <div class="permission-badge" :style="{backgroundColor: getPermissionColorHex(slotProps.option.action) + '15', color: getPermissionColorHex(slotProps.option.action)}">
                                        {{ getActionArabicLabel(slotProps.option.action) }}
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- Custom Chip Template -->
                        <template #chip="slotProps">
                            <div class="custom-chip-enhanced" :style="{backgroundColor: getPermissionColorHexFromValue(slotProps.value) + '20', borderColor: getPermissionColorHexFromValue(slotProps.value) + '40'}">
                                <div class="chip-icon" :style="{backgroundColor: getPermissionColorHexFromValue(slotProps.value)}">
                                    <i :class="getPermissionIconFromValue(slotProps.value)"></i>
                                </div>
                                <span class="chip-text">{{ getArabicLabelFromValue(slotProps.value) }}</span>
                            </div>
                        </template>

                        <!-- Empty Message -->
                        <template #empty>
                            <div class="empty-message">
                                <i class="fas fa-search fa-2x mb-2"></i>
                                <p>لم يتم العثور على صلاحيات</p>
                            </div>
                        </template>
                    </MultiSelect>

                    <!-- Selected Permissions Summary -->
                    <div v-if="roleForm.permissions.length > 0" class="selected-permissions-summary">
                        <div class="summary-header">
                            <i class="fas fa-check-circle mr-2"></i>
                            <span>تم اختيار {{ roleForm.permissions.length }} صلاحية</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dialog Footer: Cancel & Save Buttons -->
            <template #footer>
                <Button
                    label="إلغاء"
                    icon="fas fa-times"
                    severity="secondary"
                    variant="outlined"
                    @click="addEditRoleDialogVisible = false"
                />
                <Button
                    :label="isEditMode ? 'حفظ التعديلات' : 'إضافة المجموعة'"
                    icon="fas fa-check"
                    :loading="isSaving"
                    :disabled="!roleForm.name || roleForm.permissions.length === 0"
                    @click="saveHandling"
                />
            </template>
        </Dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Panel from 'primevue/panel';
import rolesService, { type RoleFilters, type Permission } from './rolesService';
import Tag from 'primevue/tag';
import MultiSelect from 'primevue/multiselect';
import Dialog from "primevue/dialog";
import ProgressSpinner from 'primevue/progressspinner';
import Card from 'primevue/card';
import FloatLabel from 'primevue/floatlabel';
import { hasPermission } from '../services/permission';

/* =============================
Translation & Description Maps
============================= */

// Arabic translations for actions
const actionTranslations: Record<string, string> = {
    view: "عرض",
    create: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    approve: "اعتماد",
    review: "مراجعة",
    finalize: "إنهاء",
    generate: "توليد"
};

// Arabic translations for entities (comprehensive list)
const entityTranslations: Record<string, string> = {
    // Main entities
    "User": "المستخدمين",
    "Department": "الأقسام",
    "Role": "الأدوار والصلاحيات",
    "Permission": "الصلاحيات",
    "Committees": "اللجان",
    
    // Estimates
    "Estimate": "التخمينات",
    "EstimateItem": "عناصر التخمين",
    
    // Purchase Requests
    "PurchaseRequest": "طلبات الشراء",
    "RequestItem": "عناصر الطلب",
    
    // Procurement
    "Procurement": "المشتريات",
    "ProcurementItem": "عناصر المشتريات",
    
    // Warehouse
    "WarehouseCheck": "فحص المستودع",
    
    // Assessments
    "NeedsAssessment": "تقييم الاحتياجات",
    
    // Reports & Vendors
    "Report": "التقارير",
    "Vendors": "الموردين",
    
    // Special permissions
    "department-users": "مستخدمي القسم",
    "purchase-request": "طلب الشراء",
    "estimate": "التخمين",
    "procurement": "المشتريات",
    "report": "التقرير"
};

// Comprehensive permission descriptions
const permissionDescriptions: Record<string, string> = {
    // User permissions
    "view-User": "عرض قائمة المستخدمين والاطلاع على معلوماتهم الشخصية والوظيفية",
    "create-User": "إضافة مستخدمين جدد إلى النظام وتعيين صلاحياتهم",
    "edit-User": "تعديل بيانات المستخدمين الموجودين وتحديث معلوماتهم",
    "delete-User": "حذف المستخدمين من النظام بشكل نهائي",
    
    // Department permissions
    "view-Department": "عرض قائمة الأقسام والاطلاع على تفاصيلها وهيكلتها",
    "create-Department": "إنشاء أقسام جديدة وتحديد مسؤولياتها",
    "edit-Department": "تعديل بيانات الأقسام الموجودة وإعادة هيكلتها",
    "delete-Department": "حذف الأقسام من النظام",
    
    // Role permissions
    "view-Role": "عرض المجموعات والأدوار وصلاحياتها المخصصة",
    "create-Role": "إنشاء مجموعات وأدوار جديدة وتحديد صلاحياتها",
    "edit-Role": "تعديل الأدوار الموجودة وتحديث صلاحياتها",
    "delete-Role": "حذف الأدوار والمجموعات من النظام",
    
    // Permission permissions
    "view-Permission": "عرض جميع الصلاحيات المتاحة في النظام",
    "create-Permission": "إنشاء صلاحيات جديدة وتخصيصها",
    "edit-Permission": "تعديل الصلاحيات الموجودة",
    "delete-Permission": "حذف الصلاحيات من النظام",
    
    // Committees permissions
    "view-Committees": "عرض قائمة اللجان وأعضائها ومهامها",
    "create-Committees": "تشكيل لجان جديدة وتحديد أعضائها",
    "edit-Committees": "تعديل تشكيل اللجان وتحديث مهامها",
    "delete-Committees": "حل اللجان وحذفها من النظام",
    
    // Estimate permissions
    "view-Estimate": "عرض التخمينات والتقديرات المالية",
    "create-Estimate": "إنشاء تخمينات وتقديرات مالية جديدة",
    "edit-Estimate": "تعديل التخمينات الموجودة وتحديث قيمها",
    "delete-Estimate": "حذف التخمينات من النظام",
    
    // EstimateItem permissions
    "view-EstimateItem": "عرض عناصر التخمين التفصيلية",
    "create-EstimateItem": "إضافة عناصر جديدة للتخمينات",
    "edit-EstimateItem": "تعديل عناصر التخمين وتحديث تفاصيلها",
    "delete-EstimateItem": "حذف عناصر من التخمينات",
    
    // PurchaseRequest permissions
    "view-PurchaseRequest": "عرض طلبات الشراء وحالتها ومراحل الموافقة",
    "create-PurchaseRequest": "إنشاء طلبات شراء جديدة وتحديد احتياجاتها",
    "edit-PurchaseRequest": "تعديل طلبات الشراء الموجودة قبل الموافقة",
    "delete-PurchaseRequest": "إلغاء وحذف طلبات الشراء",
    
    // RequestItem permissions
    "view-RequestItem": "عرض عناصر طلبات الشراء التفصيلية",
    "create-RequestItem": "إضافة عناصر جديدة لطلبات الشراء",
    "edit-RequestItem": "تعديل عناصر طلبات الشراء",
    "delete-RequestItem": "حذف عناصر من طلبات الشراء",
    
    // Procurement permissions
    "view-Procurement": "عرض عمليات المشتريات والموردين المختارين",
    "create-Procurement": "إنشاء عمليات شراء جديدة وتحديد الموردين",
    "edit-Procurement": "تعديل تفاصيل عمليات المشتريات",
    "delete-Procurement": "إلغاء وحذف عمليات المشتريات",
    
    // ProcurementItem permissions
    "view-ProcurementItem": "عرض عناصر المشتريات التفصيلية",
    "create-ProcurementItem": "إضافة عناصر جديدة لعمليات المشتريات",
    "edit-ProcurementItem": "تعديل عناصر المشتريات",
    "delete-ProcurementItem": "حذف عناصر من المشتريات",
    
    // WarehouseCheck permissions
    "view-WarehouseCheck": "عرض سجلات فحص المستودع والجرد",
    "create-WarehouseCheck": "إنشاء عمليات فحص وجرد جديدة للمستودع",
    "edit-WarehouseCheck": "تعديل سجلات الفحص والجرد",
    "delete-WarehouseCheck": "حذف سجلات فحص المستودع",
    
    // NeedsAssessment permissions
    "view-NeedsAssessment": "عرض تقييمات الاحتياجات والمتطلبات",
    "create-NeedsAssessment": "إنشاء تقييمات جديدة للاحتياجات",
    "edit-NeedsAssessment": "تعديل تقييمات الاحتياجات الموجودة",
    "delete-NeedsAssessment": "حذف تقييمات الاحتياجات",
    
    // Report permissions
    "view-Report": "عرض التقارير والإحصائيات المختلفة",
    "create-Report": "إنشاء تقارير جديدة",
    "edit-Report": "تعديل التقارير الموجودة",
    "delete-Report": "حذف التقارير",
    
    // Vendors permissions
    "view-Vendors": "عرض قائمة الموردين وتفاصيل تعاملاتهم",
    "create-Vendors": "إضافة موردين جدد إلى قاعدة البيانات",
    "edit-Vendors": "تعديل معلومات الموردين وتحديث بياناتهم",
    "delete-Vendors": "حذف الموردين من النظام",
    
    // Special permissions
    "view-department-users": "عرض مستخدمي القسم المخصصين وصلاحياتهم",
    "approve-purchase-request": "اعتماد والموافقة على طلبات الشراء",
    "review-estimate": "مراجعة التخمينات والتقديرات المالية",
    "finalize-procurement": "إنهاء واعتماد عمليات المشتريات",
    "generate-report": "توليد وإنشاء التقارير الإحصائية"
};

/* =============================
Refs & Reactive State
============================= */

// Toast & Confirmation dialogs
const toast = useToast();
const confirm = useConfirm();

// Loading & Saving States
const isLoading = ref(true);
const isSaving = ref(false);
const isEditMode = ref(false);
const isConfirming = ref(false);

// Data Containers
const allRoles = ref<any[]>([]);
const allPermissions = ref<any[]>([]);
const allPermissionsArabic = ref<any[]>([]);
const groupedPermissions = ref<any[]>([]);
const groupedPermissionsForFilter = ref<any[]>([]);

// Dialog visibility
const addEditRoleDialogVisible = ref(false);

// Breadcrumbs
const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/", icon: "fas fa-house" },
    { label: "المجموعات والصلاحيات", to: "/roles", icon: "fa-solid fa-shield-halved" },
]);

// Role Form
const roleForm = ref({
    id: undefined,
    name: "",
    permissions: [] as string[]
});

// Filters
const filters = reactive<RoleFilters>({
    search: '',
    name: '',
    permissions: [],
    all: false
});

// Reset all filters
const resetFilter = () => {
    filters.search = '';
    filters.name = '';
    filters.permissions = [];
    getAllRoles();
};

/* =============================
Helper Functions
============================= */

// Get Arabic name for entity
const getEntityArabicName = (entity: string): string => {
    return entityTranslations[entity] || entity;
};

// Get Arabic label for action
const getActionArabicLabel = (action: string): string => {
    return actionTranslations[action] || action;
};

// Get full Arabic label for permission
const getFullArabicLabel = (action: string, entity: string): string => {
    const actionAr = getActionArabicLabel(action);
    const entityAr = getEntityArabicName(entity);
    return `${actionAr} ${entityAr}`;
};

// Get description for permission
const getPermissionDescription = (permissionName: string): string => {
    return permissionDescriptions[permissionName] || `صلاحية ${permissionName}`;
};

// Get Arabic label from permission value
const getArabicLabelFromValue = (value: string): string => {
    const parts = value.split("-");
    const action = parts[0];
    const entity = parts.slice(1).join("-");
    return getFullArabicLabel(action ?? '', entity ?? '');
};

// Get icon from permission value
const getPermissionIconFromValue = (value: string): string => {
    const action = value.split("-")[0];
    return getPermissionIcon(action ?? '');
};

// Get color hex from permission value
const getPermissionColorHexFromValue = (value: string): string => {
    const action = value.split("-")[0];
    return getPermissionColorHex(action ?? '');
};

/* =============================
Computed: Filtered Roles
============================= */
const filteredRoles = computed(() => {
    isLoading.value = true;
    const result = allRoles.value.filter(role => {
        const matchSearch = !filters.search || role.name.includes(filters.search);
        const matchName = !filters.name || role.name.includes(filters.name);
        const matchPermissions = !filters.permissions?.length 
            || role.permissions.some((p: Permission) => filters.permissions!.includes(p.name));
        return matchSearch && matchName && matchPermissions;
    });
    isLoading.value = false;
    return result;
});

/* =============================
Group Permissions For Display
============================= */
const groupPermissions = (permissions: any[]) => {
    const grouped: Record<string, any[]> = {};

    permissions.forEach((perm) => {
        const permName = typeof perm === "string" ? perm : perm.name;
        const parts = permName.split("-");
        const action = parts[0];
        const entity = parts.slice(1).join("-");

        if (!grouped[entity]) grouped[entity] = [];

        grouped[entity].push({
            name: permName,
            action,
            label: getActionArabicLabel(action),
            arabicLabel: getActionArabicLabel(action),
            color: getPermissionColor(action),
            icon: getPermissionIcon(action),
        });
    });

    return grouped;
};

// Map action to color
const getPermissionColor = (action: string) => {
    switch (action) {
        case "view": return "secondary";
        case "create": return "success";
        case "edit": return "info";
        case "delete": return "danger";
        case "approve": return "success";
        case "review": return "warn";
        case "finalize": return "success";
        case "generate": return "info";
        default: return "warn";
    }
};

// Map action to color hex
const getPermissionColorHex = (action: string) => {
    switch (action) {
        case "view": return "#64748b";
        case "create": return "#22c55e";
        case "edit": return "#3b82f6";
        case "delete": return "#ef4444";
        case "approve": return "#10b981";
        case "review": return "#f59e0b";
        case "finalize": return "#10b981";
        case "generate": return "#06b6d4";
        default: return "#f59e0b";
    }
};

// Map action to icon
const getPermissionIcon = (action: string) => {
    switch (action) {
        case "view": return "fas fa-eye";
        case "create": return "fas fa-plus-circle";
        case "edit": return "fas fa-edit";
        case "delete": return "fas fa-trash-alt";
        case "approve": return "fas fa-check-circle";
        case "review": return "fas fa-clipboard-check";
        case "finalize": return "fas fa-flag-checkered";
        case "generate": return "fas fa-magic";
        default: return "fas fa-shield-alt";
    }
};

/* =============================
API Calls: Fetch Roles
============================= */
const getAllRoles = async () => {
    isLoading.value = true;
    try {
        const response = await rolesService.getAllRoles(filters);
        allRoles.value = response;

        // Group permissions inside each role
        allRoles.value.forEach(role => {
            role.groupedPermissions = groupPermissions(role.permissions);
        });
    } catch (err) {
        console.error(err);
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "حدث خطأ أثناء جلب بيانات الأدوار",
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

/* =============================
API Calls: Fetch Permissions
============================= */
const getPermissions = async () => {
    try {
        const response = await rolesService.getAllPermissions();
        allPermissions.value = Array.isArray(response) 
            ? response 
            : response.data ?? [];

        const grouped: Record<string, any[]> = {};

        // Build Arabic permissions list for filter (same as allPermissions but with Arabic labels)
        allPermissionsArabic.value = allPermissions.value.map((perm: any) => {
            const permName = perm.name;
            const parts = permName.split("-");
            const action = parts[0];
            const entity = parts.slice(1).join("-");
            
            return {
                name: permName,
                arabicLabel: getFullArabicLabel(action, entity),
                value: permName
            };
        });

        allPermissions.value.forEach((perm: any) => {
            const permName = perm.name;
            const parts = permName.split("-");
            const action = parts[0];
            const entity = parts.slice(1).join("-");
            
            if (!grouped[entity]) grouped[entity] = [];
            
            grouped[entity].push({
                label: action,
                arabicLabel: getFullArabicLabel(action, entity),
                value: permName,
                action: action,
                entity: entity,
                icon: getPermissionIcon(action),
                description: getPermissionDescription(permName)
            });
        });

        // For the main permissions field (with icons and descriptions)
        groupedPermissions.value = Object.entries(grouped).map(([entity, items]) => ({
            label: entity,
            arabicLabel: getEntityArabicName(entity),
            entity: entity,
            items
        }));

        // For the filter field (simple, Arabic names only)
        groupedPermissionsForFilter.value = Object.entries(grouped).map(([entity, items]) => ({
            label: entity,
            arabicLabel: getEntityArabicName(entity),
            entity: entity,
            items: items.map(item => ({
                arabicLabel: item.arabicLabel,
                value: item.value
            }))
        }));
    } catch (err) {
        console.error(err);
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "لم يتم جلب الصلاحيات",
            life: 3000
        });
    }
};

/* =============================
Open Dialog: Add or Edit Role
============================= */
const openAddEditRole = (role: any = null) => {
    if (role) {
        isEditMode.value = true;
        roleForm.value = {
            id: role.id,
            name: role.name,
            permissions: role.permissions.map((p: any) => p.name)
        };
    } else {
        resetForm();
        isEditMode.value = false;
    }
    addEditRoleDialogVisible.value = true;
};

/* =============================
Save / Update Role
============================= */
const saveHandling = async () => {
    // تحقق من الحقول المطلوبة
    if (!roleForm.value.name || roleForm.value.permissions.length === 0) {
        toast.add({
            severity: "error",
            summary: "تحذير",
            detail: "جميع الحقول مطلوبة",
            life: 3000
        });
        return;
    }

    isSaving.value = true;

    try {
        // حضر الـ payload لتوافق واجهة Role
        const payload = {
            ...roleForm.value,
            // حول permissions من string[] إلى Permission[]
            permissions: roleForm.value.permissions.map((p) =>
                typeof p === 'string' ? { id: 0, name: p } : p
            ),
        };

        if (isEditMode.value && roleForm.value.id) {
            // id مؤكد موجود، استخدم non-null assertion
            await rolesService.updateRole(roleForm.value.id, payload);
            toast.add({ severity: "success", summary: "نجاح", detail: "تم التحديث", life: 2000 });
        } else {
            await rolesService.createRole(payload);
            toast.add({ severity: "success", summary: "نجاح", detail: "تمت الإضافة", life: 2000 });
        }

        addEditRoleDialogVisible.value = false;
        await getAllRoles();
    } catch (err) {
        console.error(err);
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "تعذر حفظ البيانات",
            life: 3000
        });
    } finally {
        isSaving.value = false;
    }
};

/* =============================
Confirm Delete Role
============================= */
const confirmDeleteRole = (role: any) => {
    if (isConfirming.value) return;
    isConfirming.value = true;

    confirm.require({
        message: `هل أنت متأكد من حذف الدور "${role.name}"؟`,
        header: "تأكيد الحذف",
        icon: "pi pi-exclamation-triangle text-yellow-500",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass:"p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass:"p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: async () => {
            try {
                await rolesService.deleteRole(role.id);
                toast.add({ severity: "success", summary: "تم الحذف", detail: 'تم حذف مجموعة الصلاحيات بنجاح', life: 2000 });
                await getAllRoles();
            } catch (err) {
                console.error(err);
                toast.add({ severity: "error", summary: "خطأ في الحذف", detail: 'حدث خطاء اثناء حذف مجموعة الصلاحيات', life: 2000 });
            } finally {
                isConfirming.value = false;
            }
        },
        reject: () => isConfirming.value = false
    });
};

/* =============================
 Reset Form
 ============================= */
const resetForm = () => {
    roleForm.value = {
        id: undefined,
        name: "",
        permissions: []
    };
};

/* =============================
Helper: Get Icon for Permission Group
============================= */
const getGroupIcon = (group: string) => {
    const icons: { [key: string]: string } = {
        // Main entities
        "User": 'fas fa-users',
        "Department": 'fas fa-building',
        "Role": 'fas fa-shield-halved',
        "Permission": 'fas fa-key',
        "Committees": 'fas fa-users-cog',
        
        // Estimates & Requests
        "Estimate": 'fas fa-calculator',
        "EstimateItem": 'fas fa-list-ol',
        "PurchaseRequest": 'fas fa-shopping-cart',
        "RequestItem": 'fas fa-clipboard-list',
        
        // Procurement
        "Procurement": 'fas fa-handshake',
        "ProcurementItem": 'fas fa-boxes',
        
        // Warehouse & Assessment
        "WarehouseCheck": 'fas fa-warehouse',
        "NeedsAssessment": 'fas fa-tasks',
        
        // Reports & Vendors
        "Report": 'fas fa-chart-line',
        "Vendors": 'fas fa-truck',
        
        // Special
        "department-users": 'fas fa-user-friends',
        "purchase-request": 'fas fa-file-invoice',
        "estimate": 'fas fa-calculator',
        "procurement": 'fas fa-shopping-bag',
        "report": 'fas fa-file-alt'
    };
    return icons[group] || 'fas fa-layer-group';
};

/* =============================
Panel Toggle Logic
============================= */
const openPanel = ref<number | null>(null);
const togglePanel = (roleId: number) => {
    openPanel.value = openPanel.value === roleId ? null : roleId;
};

/* =============================
Lifecycle: On Mounted
============================= */
onMounted(() => {
    getAllRoles();
    getPermissions();
});
</script>

<style scoped>
.roles-management-page {
    background-color: var(--surface-ground);
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(64, 64, 64, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: var(--primary-color);
}

.role-panel {
    border: 1px solid var(--surface-border);
    box-shadow: 0 1px 3px var(--surface-200);
    transition: box-shadow 0.3s;
}
.role-panel:hover {
    box-shadow: 0 4px 12px var(--surface-200);
}

:deep(.p-panel-header) {
    padding: 0.75rem 1rem;
}
:deep(.p-panel-content) {
    padding: 0;
    border-bottom: 1px solid var(--surface-border);
}

.panel-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.permission-group {
    background: linear-gradient(135deg, var(--surface-a) 0%, var(--surface-b) 100%);
    border: 1px solid var(--surface-border);
    transition: all 0.3s ease;
}

.permission-group:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.permission-tag-enhanced {
    font-size: 0.85rem;
    padding: 0.5rem 0.85rem;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.permission-tag-enhanced:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.permission-label {
    font-weight: 600;
}

/* MultiSelect Custom Styling */
.permissions-multiselect {
    min-height: 50px;
}

:deep(.permissions-multiselect .p-multiselect-label) {
    padding: 0.75rem;
}

.permission-group-header {
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 6px;
    margin: 0.25rem 0;
}

.permission-option {
    padding: 0.75rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.permission-option:hover {
    background: var(--surface-100);
}

.permission-description {
    color: var(--text-color-secondary);
    font-size: 0.85rem;
    line-height: 1.5;
    margin-top: 0.35rem;
}

.custom-chip {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: var(--primary-color);
    color: white;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
}

/* Enhanced Permissions Field Styling */
.permissions-field {
    margin-bottom: 2rem;
}

.permissions-label {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.5rem;
}

.permissions-hint {
    color: var(--text-color-secondary);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
}

.permissions-multiselect-enhanced {
    min-height: 60px;
    border: 2px solid var(--surface-border);
    border-radius: 12px;
    transition: all 0.3s ease;
}

.permissions-multiselect-enhanced:hover {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.1);
}

:deep(.permissions-multiselect-enhanced.p-focus) {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.15);
}

:deep(.permissions-multiselect-enhanced .p-multiselect-label) {
    padding: 1rem;
    font-size: 1rem;
    min-height: 60px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

:deep(.permissions-multiselect-enhanced .p-multiselect-trigger) {
    width: 3rem;
}

/* Permission Group Header Enhanced */
.permission-group-header-enhanced {
    background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
    border-radius: 8px;
    padding: 0;
    margin: 0.5rem 0;
    border-right: 4px solid var(--primary-color);
}

.group-header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
}

.group-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--primary-color);
    color: white;
    border-radius: 8px;
    font-size: 1.2rem;
}

.group-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--primary-color);
    flex: 1;
}

.group-count {
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

/* Permission Option Enhanced */
.permission-option-enhanced {
    padding: 0.75rem;
    margin: 0.25rem 0;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.permission-option-enhanced:hover {
    background: var(--surface-50);
    transform: translateX(-4px);
}

.permission-main-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.permission-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 8px;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.permission-info {
    flex: 1;
    min-width: 0;
}

.permission-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.35rem;
}

.permission-description {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    line-height: 1.5;
}

.permission-badge {
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
}

/* Custom Chip Enhanced */
.custom-chip-enhanced {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    border: 1.5px solid;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.custom-chip-enhanced:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 5px;
    color: white;
    font-size: 0.75rem;
}

.chip-text {
    font-weight: 600;
}

/* Selected Permissions Summary */
.selected-permissions-summary {
    margin-top: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, var(--green-50) 0%, var(--green-100) 100%);
    border-radius: 8px;
    border-right: 4px solid var(--green-500);
}

.summary-header {
    display: flex;
    align-items: center;
    color: var(--green-700);
    font-weight: 600;
    font-size: 0.95rem;
}

.summary-header i {
    color: var(--green-500);
}

/* Empty Message */
.empty-message {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-color-secondary);
}

.empty-message i {
    color: var(--text-color-secondary);
    opacity: 0.5;
}

.empty-message p {
    margin-top: 0.5rem;
    font-size: 1rem;
}

/* Panel Styling */
:deep(.p-multiselect-panel) {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid var(--surface-border);
}

:deep(.p-multiselect-header) {
    padding: 1rem;
    border-bottom: 2px solid var(--surface-border);
    background: var(--surface-50);
}

:deep(.p-multiselect-filter-container) {
    margin: 0;
}

:deep(.p-multiselect-filter) {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border-radius: 8px;
    border: 2px solid var(--surface-border);
}

:deep(.p-multiselect-filter:focus) {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

:deep(.p-multiselect-items-wrapper) {
    max-height: 400px;
}

:deep(.p-multiselect-items) {
    padding: 0.5rem;
}

:deep(.p-multiselect-item) {
    padding: 0;
    margin: 0;
    border-radius: 8px;
}

:deep(.p-multiselect-item:not(.p-disabled):hover) {
    background: transparent;
}

:deep(.p-multiselect-item.p-highlight) {
    background: transparent;
}

/* Scrollbar Styling */
:deep(.p-multiselect-items-wrapper::-webkit-scrollbar) {
    width: 8px;
}

:deep(.p-multiselect-items-wrapper::-webkit-scrollbar-track) {
    background: var(--surface-100);
    border-radius: 10px;
}

:deep(.p-multiselect-items-wrapper::-webkit-scrollbar-thumb) {
    background: var(--primary-color);
    border-radius: 10px;
}

:deep(.p-multiselect-items-wrapper::-webkit-scrollbar-thumb:hover) {
    background: var(--primary-600);
}

/* Form styling */
.form-container .field {
    margin-bottom: 1.5rem;
}

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

/* Improved Dialog Styling */
:deep(.p-dialog) {
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

:deep(.p-dialog-header) {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 1.5rem;
}

:deep(.p-dialog-header .p-dialog-title) {
    font-size: 1.25rem;
    font-weight: 600;
}

:deep(.p-dialog-content) {
    padding: 2rem;
}

/* Responsive improvements */
@media (max-width: 768px) {
    .permission-group {
        margin-bottom: 1rem;
    }
    
    .permission-tag-enhanced {
        font-size: 0.75rem;
        padding: 0.3rem 0.6rem;
    }
    
    .permission-description {
        font-size: 0.8rem;
    }
    
    /* Mobile optimizations for permissions field */
    .permissions-multiselect-enhanced {
        min-height: 55px;
    }
    
    :deep(.permissions-multiselect-enhanced .p-multiselect-label) {
        padding: 0.75rem;
        min-height: 55px;
        font-size: 0.9rem;
    }
    
    .group-header-content {
        padding: 0.75rem;
        gap: 0.5rem;
    }
    
    .group-icon-wrapper {
        width: 35px;
        height: 35px;
        font-size: 1rem;
    }
    
    .group-title {
        font-size: 0.95rem;
    }
    
    .group-count {
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
    }
    
    .permission-main-row {
        gap: 0.75rem;
    }
    
    .permission-icon-wrapper {
        width: 36px;
        height: 36px;
        font-size: 1rem;
    }
    
    .permission-title {
        font-size: 0.9rem;
    }
    
    .permission-description {
        font-size: 0.85rem;
    }
    
    .permission-badge {
        padding: 0.25rem 0.6rem;
        font-size: 0.8rem;
    }
    
    .custom-chip-enhanced {
        padding: 0.35rem 0.6rem;
        font-size: 0.85rem;
        gap: 0.35rem;
    }
    
    .chip-icon {
        width: 20px;
        height: 20px;
        font-size: 0.7rem;
    }
    
    .selected-permissions-summary {
        padding: 0.75rem;
    }
    
    .summary-header {
        font-size: 0.9rem;
    }
    
    :deep(.p-multiselect-panel) {
        max-width: 95vw !important;
    }
}
</style>