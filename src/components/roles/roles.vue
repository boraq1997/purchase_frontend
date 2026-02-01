<template>
    <div class="roles-management-page p-4" dir="rtl">
        <!-- ============================= -->
        <!-- Header & Breadcrumb Section -->
        <!-- ============================= -->
        <div class="card flex justify-center">
            <Breadcrumb 
                :home="breadcrumbHome" 
                :model="breadcrumbItems" 
            />
        </div>

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
            <div class="flex justify-content-start mt-4">
                <Button 
                    label="إضافة مجموعة جديدة" 
                    icon="fas fa-plus" 
                    @click="openAddEditRole()"
                    class="p-button-sm"
                />
            </div>

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
                            :options="allPermissions"
                            optionLabel="name"
                            optionValue="name"
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
                                    v-if="hasPermission('edit-Role')"
                                />
                                <Button
                                    icon="fas fa-trash-alt"
                                    variant="outlined"
                                    severity="danger"
                                    @click="confirmDeleteRole(role)"
                                    v-if="hasPermission('delete-Role')"
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
                                                <h4 class="font-semibold text-base mb-3 capitalize">
                                                    <i :class="getGroupIcon(group)" class="mr-2 text-primary"></i>
                                                    {{ group }}
                                                </h4>
                                                <div class="flex flex-wrap gap-2">
                                                    <Tag
                                                        v-for="perm in perms"
                                                        :key="perm.name"
                                                        :icon="perm.icon"
                                                        :severity="perm.color"
                                                        :value="perm.action"
                                                        class="permission-tag"
                                                    />
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
            :style="{width: '40vw'}"
            :breakpoints="{'960px': '75vw', '640px': '90vw'}"
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
                    <small class="text-yellow-200 text-s mt-0">
                        اسم المجموعة العام كي يتم اختياره عند اضافة مستخدمين جدد
                    </small>
                </div>

                <!-- Role Permissions -->
                <div class="field">
                    <FloatLabel variant="on">
                        <MultiSelect
                            id="permissions"
                            v-model="roleForm.permissions"
                            :options="groupedPermissions"
                            optionGroupLabel="label"
                            optionGroupChildren="items"
                            optionLabel="label"
                            optionValue="value"
                            display="chip"
                            filter
                            class="w-full"
                        >
                            <!-- Custom Option Group Template -->
                            <template #optiongroup="slotProps">
                                <div class="flex align-items-center font-bold">
                                    <i :class="getGroupIcon(slotProps.option.label)" class="mr-2 text-primary"></i>
                                    <span>{{ slotProps.option.label }}</span>
                                </div>
                            </template>
                        </MultiSelect>
                        <label for="permissions" class="font-semibold mb-2">
                            <i class="fas fa-shield-alt"/> الصلاحيات
                        </label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">
                        اختر الصلاحيات التي تحتاج اضافتها الى المجموعة
                    </small>
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
import rolesService, { type RoleFilters } from './rolesService';
import Tag from 'primevue/tag';
import MultiSelect from 'primevue/multiselect';
import Dialog from "primevue/dialog";
import ProgressSpinner from 'primevue/progressspinner';
import Card from 'primevue/card';
import FloatLabel from 'primevue/floatlabel';
import { hasPermission } from '../services/permission';

/* =============================
 Refs & Reactive State
 ============================= */

// Toast & Confirmation dialogs
const toast = useToast();
const confirm = useConfirm();

// Loading & Saving States
const isLoading = ref(true);       // Global loading indicator
const isSaving = ref(false);       // Save button loading
const isEditMode = ref(false);     // Detect if editing or adding
const isConfirming = ref(false);   // Prevent multiple delete confirms

// Data Containers
const allRoles = ref<any[]>([]);        // All roles fetched from API
const allPermissions = ref<any[]>([]);  // All permissions fetched
const groupedPermissions = ref<any[]>([]); // Permissions grouped for MultiSelect

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
 Computed: Filtered Roles
 ============================= */
const filteredRoles = computed(() => {
    isLoading.value = true;
    const result = allRoles.value.filter(role => {
        const matchSearch = !filters.search || role.name.includes(filters.search);
        const matchName = !filters.name || role.name.includes(filters.name);
        const matchPermissions = !filters.permissions.length || role.permissions.some(p => filters.permissions.includes(p.name));
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
    const actionLabels: Record<string, string> = {
        view: "عرض",
        create: "إضافة",
        edit: "تعديل",
        delete: "حذف",
        approve: "اعتماد",
        review: "مراجعة",
        finalize: "إنهاء",
        generate: "توليد"
    };

    permissions.forEach((perm) => {
        const permName = typeof perm === "string" ? perm : perm.name;
        const parts = permName.split("-");
        const action = parts[0];
        const entity = parts.slice(1).join("-") || "عمليات خاصة";

        if (!grouped[entity]) grouped[entity] = [];

        grouped[entity].push({
            name: permName,
            action,
            label: actionLabels[action] || action,
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
        default: return "warn";
    }
};

// Map action to icon
const getPermissionIcon = (action: string) => {
    switch (action) {
        case "view": return "fas fa-eye";
        case "create": return "fas fa-plus-circle";
        case "edit": return "fas fa-edit";
        case "delete": return "fas fa-trash-alt";
        default: return "fas fa-question";
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
        allPermissions.value = Array.isArray(response) ? response : response.data || [];

        const grouped: Record<string, any[]> = {};

        allPermissions.value.forEach((perm: any) => {
            const permName = perm.name;
            const [action, entity] = permName.split("-");
            if (!grouped[entity]) grouped[entity] = [];
            grouped[entity].push({
                label: action,
                value: permName
            });
        });

        groupedPermissions.value = Object.entries(grouped).map(([entity, items]) => ({
            label: entity,
            items
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
        if (isEditMode.value && roleForm.value.id) {
            await rolesService.updateRole(roleForm.value.id, roleForm.value);
            toast.add({ severity: "success", summary: "نجاح", detail: "تم التحديث", life: 2000 });
        } else {
            await rolesService.createRole(roleForm.value);
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
        users: 'fas fa-users',
        products: 'fas fa-box-open',
        orders: 'fas fa-shopping-cart',
        settings: 'fas fa-cog',
        reports: 'fas fa-chart-line',
        // Add more icons as needed
    };
    return icons[group] || 'fas fa-layer-group'; // Default icon
};

/* =============================
 Panel Toggle Logic
 ============================= */
const openPanel = ref<number | null>(null); // null = all panels closed
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

/* Customizing Panel Header */
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

/* Custom Toggle Icon Animation */
:deep(.p-panel-header-icon-custom) {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%236c757d'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e" );
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.2s ease-in-out;
}
:deep(.p-panel:not(.p-panel-collapsed) .p-panel-header-icon-custom) {
    transform: rotate(-180deg);
}


.permission-group {
    background-color: var(--surface-a);
    border: 1px solid var(--surface-border);
}

.permission-tag {
    font-size: 0.8rem;
}

/* Dialog styling */
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
</style>