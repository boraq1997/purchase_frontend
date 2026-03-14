<template>
    <div class="card flex justify-center mt-3 mb-3">
        <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
    </div>
    <div class="card" dir="rtl">

        <!-- Loading Overlay -->
        <div
            v-if="isLoading"
            class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5"
            style="background-color: #2828289c;"
        >
            <div class="text-primary-500 border-round text-center">
                <i class="fa-solid fa-circle-notch fa-spin fa-2xl" style="font-size: 80px;"></i>
            </div>
        </div>

        <!-- Add Button -->
        <Button
            v-if="hasPermission('create-User')"
            class="mb-3 mr-3"
            size="small"
            label="اضافة"
            icon="fas fa-plus"
            @click="openAddDialog"
            v-tooltip="{ value: 'اضافة مستخدم جديد', showDelay: 1000, hideDelay: 300 }"
        />

        <!-- DataTable -->
        <UsersDataTable
            :users="allUsers"
            :loading="isLoading"
            :departments="departments"
            :roles="allRoles"
            @edit="openEditDialog"
            @delete="confirmDeleteUser"
            @view-committees="openCommitteesDialog"
            @advanced-search="handleAdvancedSearch"
        />

        <!-- Committees Dialog -->
        <CommitteesDialog
            v-model:visible="userCommitteeDialogVisible"
            :committees="userCommittees"
        />

        <!-- Add/Edit Dialog -->
        <UserFormDialog
            v-model:visible="addEditUsersDialogVisible"
            :is-edit-mode="isEditMode"
            :form="userForm"
            :departments="departments"
            :roles="allRoles"
            :is-saving="isSaving"
            @save="saveHandling"
            @hide="resetForm"
        />

        <ConfirmDialog dir="rtl" group="deleteUser" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import usersService, { type UserFormData } from "../users/usersService";
import DepartmentService from "../departments/DepartmentService";
import rolesService from "../roles/rolesService";
import { hasPermission } from "../services/permission";

import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";

import UsersDataTable from "./components/UsersDataTable.vue";
import CommitteesDialog from "./components/CommitteesDialog.vue";
import UserFormDialog from "./components/UserFormDialog.vue";

// ── State ──
const toast        = useToast();
const confirm      = useConfirm();
const isLoading    = ref(true);
const isSaving     = ref(false);
const isEditMode   = ref(false);
const isConfirming = ref(false);

const allUsers       = ref<any[]>([]);
const userCommittees = ref<any[]>([]);
const departments    = ref<any[]>([]);
const allRoles       = ref<any[]>([]);

const addEditUsersDialogVisible  = ref(false);
const userCommitteeDialogVisible = ref(false);

const breadcrumbHome  = ref({ icon: "fas fa-house", to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/", icon: "fas fa-house" },
    { label: "المستخدمين", to: "/users", icon: "fas fa-users" },
]);

const userForm = ref<UserFormData>({
    id: undefined,
    name: '',
    email: '',
    username: '',
    password: '',
    password_confirmation: '',
    phone: '',
    department_id: null,
    parent_id: null,
    status: 'active',
    role: null,
});

// ── Fetch ──
const getAllUsers = async () => {
    isLoading.value = true;
    try {
        allUsers.value = await usersService.getAllUsers();
    } catch {
        toast.add({ severity: "error", summary: "خطأ", detail: "حدث خطأ أثناء جلب بيانات المستخدمين", life: 3000 });
    } finally {
        isLoading.value = false;
    }
};

const getAllDepartments = async () => {
    try {
        departments.value = await DepartmentService.getAll();
    } catch {
        toast.add({ severity: "error", summary: "خطأ", detail: "حدث خطأ أثناء جلب بيانات الأقسام", life: 3000 });
    }
};

const getAllRoles = async () => {
    try {
        allRoles.value = await rolesService.getAllRoles();
    } catch (err) {
        console.error(err);
    }
};

// ── Dialog Handlers ──
const openAddDialog = () => {
    getAllDepartments();
    resetForm();
    addEditUsersDialogVisible.value = true;
};

const openEditDialog = (user: any) => {
    getAllDepartments();
    isEditMode.value = true;
    const selectedRole = allRoles.value.find(r => r.name === user.role);
    userForm.value = {
        id:            user.id,
        name:          user.name,
        username:      user.username,
        email:         user.email,
        phone:         user.phone,
        department_id: user.department?.id ?? null,
        parent_id:     user.parent_id,
        status:        user.status,
        role:          selectedRole ? selectedRole.id : null,
    };
    addEditUsersDialogVisible.value = true;
};

const openCommitteesDialog = (committees: any[]) => {
    if (committees?.length) {
        userCommittees.value = committees;
        userCommitteeDialogVisible.value = true;
    } else {
        toast.add({ severity: "warn", summary: "تنبيه", detail: "لم يتم العثور على لجان خاصة بالمستخدم", life: 3000 });
    }
};

const resetForm = () => {
    userForm.value = {
        id: undefined,
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        phone: '',
        department_id: null,
        parent_id: null,
        status: 'active',
        role: null,
    };
    isEditMode.value = false;
};

// ── Save ──
const saveHandling = async (payload: any) => {
    isSaving.value = true;
    try {
        if (isEditMode.value && userForm.value.id) {
            await usersService.updateUser(userForm.value.id, payload);
            toast.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث بيانات المستخدم بنجاح', life: 3000 });
        } else {
            await usersService.createUser(payload);
            toast.add({ severity: 'success', summary: 'نجاح', detail: 'تم إنشاء المستخدم بنجاح', life: 3000 });
        }
        addEditUsersDialogVisible.value = false;
    } catch (err: any) {
        const errors  = err?.response?.data?.errors;
        const message = err?.response?.data?.message;
        if (errors) {
            const firstError = Object.values(errors)[0] as string[];
            toast.add({ severity: 'error', summary: 'خطأ في البيانات', detail: firstError[0], life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'خطأ', detail: message ?? 'حدث خطأ أثناء حفظ البيانات', life: 3000 });
        }
        // أعد الأخطاء للـ dialog ليعرضها على الحقول
        throw err;
    } finally {
        isSaving.value = false;
        await getAllUsers();
    }
};

// ── Delete ──
const confirmDeleteUser = (user: any) => {
    if (isConfirming.value) return;
    isConfirming.value = true;

    confirm.require({
        group: 'deleteUser',
        message: `هل أنت متأكد من حذف بيانات المستخدم؟ "${user.name}"`,
        header: "تأكيد الحذف",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass: "p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass: "p-button-sm border border-gray-400 text-gray-600 bg-transparent",
        accept: async () => {
            try {
                await usersService.deleteUser(user.id);
                toast.add({ severity: 'success', summary: "نجاح", detail: "تم حذف بيانات المستخدم بنجاح", life: 3000 });
                await getAllUsers();
            } catch {
                toast.add({ severity: 'error', summary: "خطأ", detail: "حدث خطأ أثناء حذف بيانات المستخدم", life: 3000 });
            } finally {
                isConfirming.value = false;
            }
        },
        reject: () => (isConfirming.value = false),
    });
};

const handleAdvancedSearch = async (searchFilters: any) => {
    isLoading.value = true;
    try {
        allUsers.value = await usersService.getAllUsers(searchFilters);
    } catch {
        toast.add({ severity: "error", summary: "خطأ", detail: "حدث خطأ أثناء البحث", life: 3000 });
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await getAllUsers();
    getAllRoles();
});
</script>