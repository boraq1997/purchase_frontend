<template>
    <div class="roles-management-page p-4" dir="rtl">
        <!-- ============================= -->
        <!-- Header & Breadcrumb -->
        <!-- ============================= -->
        <div class="page-header mb-4">
            <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="bg-transparent p-0" />
        </div>

        <!-- ============================= -->
        <!-- Loading Overlay -->
        <!-- ============================= -->
        <div v-if="isLoading" class="loading-overlay">
            <ProgressSpinner strokeWidth="4" animationDuration=".5s" style="width: 60px; height: 60px" />
            <span class="mt-3 text-lg">جاري تحميل البيانات...</span>
        </div>

        <!-- ============================= -->
        <!-- Main Content -->
        <!-- ============================= -->
        <div v-else>
            <!-- Action Bar -->
            <div class="flex justify-content-end mb-4">
                <Button 
                    label="إضافة مجموعة جديدة" 
                    icon="fas fa-plus" 
                    @click="openAddEditRole()"
                    class="p-button-sm"
                />
            </div>

            <!-- Roles List (Card View) -->
            <div class="grid">
                <div v-for="role in allRoles" :key="role.id" class="col-12">
                    <Panel
                        :collapsed="openPanel !== role.id"
                        toggleable
                        @toggle="togglePanel(role.id)"
                    >
                        <template #header>
                            <div class="flex items-center gap-2">
                                    <Button 
                                        icon="fas fa-edit"
                                        variant="outlined"
                                        severity="secondary"
                                        @click="openAddEditRole(role)"
                                    />
                                    <Button
                                        icon="fas fa-trash-alt"
                                        variant="outlined"
                                        severity="danger"
                                        @click="confirmDeleteRole(role)"
                                    />
                                <span class="font-bold mt-2">{{ role.name }}</span>

                                <span class="text-color-secondary text-sm mt-2">
                                    <i class="fas fa-calendar-alt mr-1"></i>
                                    تاريخ الإنشاء: {{ new Date(role.created_at).toLocaleDateString('ar-EG') }}
                                </span>
                            </div>
                        </template>
                        <Card class="role-card mb-4 overflow-hidden">
                            <template #header>
                                <div class="card-header p-3 flex align-items-center justify-content-between">
                                    <div class="flex align-items-center">
                                        <span class="font-bold text-lg">{{ role.name }}</span>
                                        <span class="text-color-secondary text-sm mx-3">|</span>
                                    </div>
                                </div>
                            </template>
                            <template #content>
                                <div v-if="Object.keys(role.groupedPermissions).length > 0" class="p-1">
                                    <div class="grid -m-1">
                                        <div 
                                            v-for="(perms, group) in role.groupedPermissions"
                                            :key="group"
                                            class="col-12 md:col-6 lg:col-4 p-1"
                                        >
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
        <!-- Add/Edit Dialog -->
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
            <div class="form-container p-fluid mt-4">
                <div class="field">
                    <FloatLabel variant="on">
                        <InputText id="roleName" v-model="roleForm.name" fluid/>
                        <label for="roleName"><i class="fas fa-user-shield"/> اسم المجموعة</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">اسم المجموعة العام كي يتم اختياره عند اضافة مستخدمين جدد</small>
                </div>

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
                            <template #optiongroup="slotProps">
                                <div class="flex align-items-center font-bold">
                                    <i :class="getGroupIcon(slotProps.option.label)" class="mr-2 text-primary"></i>
                                    <span>{{ slotProps.option.label }}</span>
                                </div>
                            </template>
                        </MultiSelect>
                        <label for="permissions" class="font-semibold mb-2"><i class="fas fa-shield-alt"/> الصلاحيات</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">اختر الصلاحيات التي تحتاج اضافتها الى المجموعة</small>
                </div>
            </div>
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
import { ref, onMounted, reactive } from 'vue';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Panel from 'primevue/panel';
import rolesService from './rolesService';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import MultiSelect from 'primevue/multiselect';
import Dialog from "primevue/dialog";
import { FilterMatchMode } from "@primevue/core/api";
import ProgressSpinner from 'primevue/progressspinner';
import Card from 'primevue/card';
import Tooltip from 'primevue/tooltip';
import Divider from 'primevue/divider';
import FloatLabel from 'primevue/floatlabel';

/* =============================
 Refs & State
 ============================= */
const toast = useToast();
const confirm = useConfirm();
const isLoading = ref(true);
const isSaving = ref(false);
const isEditMode = ref(false);
const isConfirming = ref(false);

const allRoles = ref<any[]>([]);
const allPermissions = ref<any[]>([]);
const groupedPermissions = ref<any[]>([]);
const addEditRoleDialogVisible = ref(false);

// Breadcrumb
const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });
const breadcrumbItems = ref([
  { label: "الرئيسية", to: "/", icon: "fas fa-house" },
  { label: "المجموعات والصلاحيات", to: "/roles", icon: "fa-solid fa-shield-halved" },
]);

const roleForm = ref({
    id: undefined,
    name: "",
    permissions: [] as string[]
});

/* =============================
 Group Permissions For Display
 ============================= */

const groupPermissions = (permissions: any[]) => {
    const grouped: Record<string, any[]> = {};

    permissions.forEach((perm) => {
        const permName = typeof perm === "string" ? perm : perm.name;

        const [action, entity] = permName.split("-");
        if (!grouped[entity]) grouped[entity] = [];

        grouped[entity].push({
            name: permName,
            action,
            color: getPermissionColor(action),
            icon: getPermissionIcon(action),
        });
    });

    return grouped;
};

const getPermissionColor = (action: string) => {
    switch (action) {
        case "view": return "secondary";
        case "create": return "success";
        case "edit": return "info";
        case "delete": return "danger";
        default: return "warn";
    }
};

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
 Fetch Roles
 ============================= */

const getAllRoles = async () => {
    try {
        const response = await rolesService.getAllRoles();
        allRoles.value = response;

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
 Fetch All Permissions
 ============================= */

const getPermissions = async () => {
    try {
        const response = await rolesService.getAllPermissions();
        allPermissions.value = response.data;

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
 Open Dialog — Add or Edit
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
 Save / Update
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
 Confirm Delete
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

const resetForm = () => {
    roleForm.value = {
        id: undefined,
        name: "",
        permissions: []
    };
};

const getGroupIcon = (group: string) => {
    const icons: { [key: string]: string } = {
        users: 'fas fa-users',
        products: 'fas fa-box-open',
        orders: 'fas fa-shopping-cart',
        settings: 'fas fa-cog',
        reports: 'fas fa-chart-line',
        // أضف المزيد من الأيقونات حسب الحاجة
    };
    return icons[group] || 'fas fa-layer-group'; // أيقونة افتراضية
};

const openPanel = ref<number | null>(null); // null يعني كل البنل مغلقة

const togglePanel = (roleId: number) => {
    openPanel.value = openPanel.value === roleId ? null : roleId;
}

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
    background-color: rgba(255, 255, 255, 0.8);
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
</style>