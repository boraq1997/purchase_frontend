<template>
    <div class="card" dir="rtl">

        <!-- ============================= -->
        <!-- Breadcrumb -->
        <!-- ============================= -->
        <div class="card flex justify-center mt-3 mb-3">
            <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
        </div>

        <!-- ============================= -->
        <!-- Global Loading Overlay -->
        <!-- ============================= -->
        <div
            v-if="isLoading"
            class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5"
            style="background-color: #2828289c;"
        >
            <div class="text-primary-500 border-round text-center">
                <i class="fa-solid fa-circle-notch fa-spin fa-2xl" style="font-size: 80px;"></i>
            </div>
        </div>

        <!-- ============================= -->
        <!-- Action Buttons -->
        <!-- ============================= -->
        <div class="flex justify-between mb-3">
            <Button 
                v-if="hasPermission('create-Committees')"
                class="mr-3" 
                label="لجنة جديدة" 
                icon="fas fa-plus" 
                @click="openAddEditCommitteeDialog()" 
            />
        </div>

        <!-- ============================= -->
        <!-- Committees DataTable -->
        <!-- ============================= -->
        <DataTable
            v-model:filters="filters"
            :value="allCommittees"
            dataKey="id"
            paginator
            :rows="10"
            filterDisplay="menu"
            :globalFilterFields="['name', 'description', 'manager.name', 'users.name']"
            responsiveLayout="scroll"
            class="text-right"
        >
            <!-- Table Header (Search Input) -->
            <template #header>
                <div class="flex justify-between items-center">
                    <IconField>
                        <InputIcon><i class="fas fa-search"></i></InputIcon>
                        <InputText v-model="filters.global.value" placeholder="بحث شامل..." style="width: 20vw"/>
                    </IconField>
                </div>
            </template>

            <!-- Empty Message -->
            <template #empty>
                <Message severity="warn">لم يتم العثور على لجان</Message>
            </template>

            <!-- Loading Message -->
            <template #loading> جاري تحميل بيانات اللجان... </template>

            <!-- Columns -->
            <Column field="id" sortable header="#">
                <template #header><i class="fas fa-hashtag text-gray-500"></i></template>
            </Column>

            <Column field="name" header="اسم اللجنة" sortable>
                <template #header><i class="fa-solid fa-object-group text-gray-500"></i></template>
            </Column>

            <Column field="manager.name" header="المدير" sortable>
                <template #header><i class="fas fa-user-tie text-gray-500"></i></template>
                <template #body="slotProps">
                    <!-- Display Manager -->
                    <Tag 
                        icon="fas fa-user-tie"
                        @click="getManagerUserInformation"
                        severity="contrast"
                        :value="slotProps.data.manager?.name || '-'"
                    />

                    <!-- Manager Info Popover -->
                    <Popover ref="managerInfo" dir="rtl">
                        <div class="flex flex-col gap-4 w-30rem p-3">
                            <div class="p-3">
                                <div class="grid mb-2">
                                    <div class="col-6"><i class="fas fa-user"></i> الاسم: </div>
                                    <div class="col-6">{{ slotProps.data.manager.name }}</div>
                                </div>
                                <div class="grid mb-2">
                                    <div class="col-6"><i class="fas fa-user-tag"></i> اسم المستخدم: </div>
                                    <div class="col-6">{{ slotProps.data.manager.username }}</div>
                                </div>
                                <div class="grid mb-2">
                                    <div class="col-6"><i class="fas fa-envelope"></i> البريد الالكتروني: </div>
                                    <div class="col-6">{{ slotProps.data.manager.email }}</div>
                                </div>
                                <div class="grid mb-2">
                                    <div class="col-6"><i class="fa-solid fa-phone-flip"></i> رقم الهاتف: </div>
                                    <div class="col-6">{{ slotProps.data.manager.phone }}</div>
                                </div>
                                <div class="grid mb-2">
                                    <div class="col-6"><i class="fa-solid fa-calendar-days"></i> تاريخ الاضافة: </div>
                                    <div class="col-6">{{ slotProps.data.manager.created_at }}</div>
                                </div>
                            </div>
                        </div>
                    </Popover>
                </template>
            </Column>

            <Column field="description" header="الوصف" sortable>
                <template #header><i class="fa-solid fa-text-width text-gray-500"></i></template>
            </Column>

            <!-- Actions Column -->
            <Column header="الإدارة">
                <template #header><i class="fas fa-cogs text-gray-500"></i></template>
                <template #body="{data}">
                    <Button icon="fas fa-users" class="ml-1" severity="secondary" rounded variant="outlined" aria-label="all users" @click="openUsersDialog(data)" />
                    <Button v-if="hasPermission('edit-Committees')" icon="fas fa-edit" class="ml-1" severity="secondary" rounded variant="outlined" aria-label="edit" @click="openAddEditCommitteeDialog(data)" />
                    <Button v-if="hasPermission('delete-Committees')" icon="fas fa-trash-alt" severity="danger" rounded variant="outlined" aria-label="delete" @click.stop="confirmDeleteCommittee(data)" />
                </template>
            </Column>
        </DataTable>

        <!-- ============================= -->
        <!-- Add / Edit Committee Dialog -->
        <!-- ============================= -->
        <Dialog
            v-model:visible="addEditCommitteesDialogVisible"
            :header="isEditMode ? 'تعديل بيانات اللجنة' : 'إضافة لجنة جديدة'"
            :style="{ width: '30vw' }"
            modal
            @hide="resetForm"
            dir="rtl"
        >
            <div class="flex flex-column gap-4 mt-3">
                <!-- Committee Name -->
                <IconField>
                    <InputIcon class="fa-solid fa-font" />
                    <InputText v-model="committeeForm.name" placeholder="اسم اللجنة" fluid />
                </IconField>

                <!-- Manager Selection -->
                <Select
                    v-model="committeeForm.manager"
                    :options="allUsers"
                    filter
                    optionLabel="name"
                    placeholder="اختر مدير اللجنة"
                    class="w-full md:w-56"
                />

                <!-- Members Selection -->
                <MultiSelect
                    v-model="committeeForm.users"
                    :options="filteredUsers"
                    filter
                    display="chip"
                    optionLabel="name"
                    placeholder="اختر الأعضاء"
                    class="w-full md:w-80"
                />

                <!-- Description -->
                <IconField>
                    <InputIcon class="fa-solid fa-text-width" />
                    <Textarea v-model="committeeForm.description" rows="5" style="resize: none" fluid />
                </IconField>
            </div>

            <!-- Dialog Footer -->
            <template #footer>
                <Button
                    @click="addEditCommitteesDialogVisible = false"
                    label="إلغاء"
                    icon="fas fa-times"
                    severity="secondary"
                    class="p-button-sm"
                />
                <Button
                    @click="saveHandling"
                    :label="isEditMode ? 'حفظ التعديلات' : 'إضافة'"
                    icon="fas fa-check"
                    :loading="isSaving"
                    :disabled="!committeeForm.name || !committeeForm.manager || !committeeForm.users"
                    class="p-button-sm"
                />
            </template>
        </Dialog>

        <!-- ============================= -->
        <!-- Committee Members Dialog -->
        <!-- ============================= -->
        <Dialog
            v-model:visible="showAllUsersInCommitteeDialogVisible"
            header="المنتسبين داخل اللجنة"
            :style="{ width: '60vw' }"
            modal
            dir="rtl"
        >
            <DataTable
                v-model:filters="userFilters"
                :value="committeeUsers"
                dataKey="id"
                paginator
                :rows="10"
                filterDisplay="menu"
                :globalFilterFields="['name', 'username', 'role']"
                responsiveLayout="scroll"
                class="text-right"
            >
                <template #header>
                    <div class="flex justify-between items-center">
                        <IconField>
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText v-model="userFilters.global.value" placeholder="بحث عن المنتسبين..." />
                        </IconField>
                    </div>
                </template>

                <template #empty>
                    <Message severity="warn">لم يتم العثور على منتسبين داخل اللجنة</Message>
                </template>

                <Column field="id" header="#">
                    <template #header><i class="fas fa-hashtag text-gray-500"></i></template>
                </Column>
                <Column field="name" header="الاسم" sortable>
                    <template #header><i class="fas fa-user text-gray-500"></i></template>
                </Column>
                <Column field="email" header="البريد الإلكتروني" sortable>
                    <template #header><i class="fas fa-envelope text-gray-500"></i></template>
                </Column>
                <Column field="username" header="اسم المستخدم" sortable>
                    <template #header><i class="fas fa-user-tag text-gray-500"></i></template>
                </Column>
                <Column field="phone" header="رقم الهاتف" sortable>
                    <template #header><i class="fa-solid fa-phone-flip text-gray-500"></i></template>
                </Column>
            </DataTable>
        </Dialog>

        <!-- Toast & Confirm Dialog -->
        <Toast dir="rtl" />
        <ConfirmDialog dir="rtl" group="deleteCommittees" />
    </div>
</template>

<script lang="ts" setup>
/**
 * =============================
 *  Imports
 * =============================
 */
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { FilterMatchMode } from "@primevue/core/api";
import committeesService from "./committeesService";
import usersService from "../users/usersService";
import type { Committee, CommitteeUser } from "./committeesService";

import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Popover from "primevue/popover";
import Tag from "primevue/tag";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import MultiSelect from "primevue/multiselect";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import ConfirmDialog from "primevue/confirmdialog";
import { hasPermission } from "../services/permission";

/**
 * =============================
 *  Reactive State
 * =============================
 */
const toast = useToast();
const confirm = useConfirm();
const isLoading = ref(true);
const isSaving = ref(false);
const isEditMode = ref(false);
const isConfirming = ref(false);

const allCommittees = ref<Committee[]>([]);
const allUsers = ref<any[]>([]);
const committeeUsers = ref<any[]>([]);
const managerInfo = ref();

const addEditCommitteesDialogVisible = ref(false);
const showAllUsersInCommitteeDialogVisible = ref(false);

const committeeForm = ref<Committee>({
    id: undefined,
    name: "",
    description: "",
    department_id: null,
    department: null,
    manager_user_id: undefined,
    manager: null,
    users: [] as CommitteeUser[],
});

const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/" },
    { label: "اللجان", to: "/committees" },
]);

/**
 * =============================
 *  Filters and Computed
 * =============================
 */
const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const userFilters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Exclude selected manager from the selectable users list
const filteredUsers = computed(() =>
    allUsers.value.filter((u) => u.id !== committeeForm.value.manager?.id)
);

/**
 * =============================
 *  Fetch Functions
 * =============================
 */
const getAllCommittees = async () => {
    isLoading.value = true;
    try {
        allCommittees.value = await committeesService.getAllWithRelations();
    } catch (err) {
        console.error("Error fetching committees:", err);
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "حدث خطأ عند جلب بيانات اللجان",
            life: 3000,
        });
    } finally {
        isLoading.value = false;
    }
};

const getAllUsers = async () => {
    try {
        allUsers.value = await usersService.getAllUsers();
    } catch (err) {
        console.error(err);
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "حدث خطأ أثناء جلب المستخدمين",
            life: 3000,
        });
    }
};

/**
 * =============================
 *  Dialog Handlers
 * =============================
 */
const openAddEditCommitteeDialog = async (committee: any = null) => {
    await getAllUsers();
    if (committee) {
        // Edit Mode
        isEditMode.value = true;
        const manager = committee.manager
            ? allUsers.value.find((u) => u.id === committee.manager.id) || committee.manager
            : null;

        const users =
            committee.users
                ?.map((u: any) => allUsers.value.find((x) => x.id === u.id) || u)
                .filter(Boolean) || [];

        committeeForm.value = {
            id: committee.id,
            name: committee.name,
            description: committee.description,
            department_id: committee.department_id,
            manager_user_id: manager?.id ?? null,
            manager,
            users,
        };
    } else {
        // Add Mode
        resetForm();
    }
    addEditCommitteesDialogVisible.value = true;
};

const openUsersDialog = (committee: any) => {
    committeeUsers.value = committee.users;
    showAllUsersInCommitteeDialogVisible.value = true;
};

const getManagerUserInformation = (event: any) => {
    managerInfo.value.toggle(event);
};

/**
 * =============================
 *  Save / Update Handling
 * =============================
 */
const saveHandling = async () => {
    if (!committeeForm.value.name || !committeeForm.value.manager) {
        toast.add({
            severity: "warn",
            summary: "تنبيه",
            detail: "يرجى ملء الحقول المطلوبة",
            life: 3000,
        });
        return;
    }

    isSaving.value = true;

    // ✅ تحويل users إلى شكل متوافق مع CommitteeUser[]
    const payload = {
        ...committeeForm.value,
        manager_user_id: committeeForm.value.manager?.id ?? undefined,
        users: committeeForm.value.users.map((u) => ({ 
            id: u.id,
            name: u.name,
            email: u.email,
            username: u.username,
            department: u.department ?? null,
        })),
    };

    try {
        if (isEditMode.value && committeeForm.value.id !== undefined) {
            await committeesService.update(committeeForm.value.id, payload);
            toast.add({
                severity: "success",
                summary: "نجاح",
                detail: "تم تحديث بيانات اللجنة بنجاح",
                life: 3000,
            });
        } else {
            await committeesService.create(payload);
            toast.add({
                severity: "success",
                summary: "نجاح",
                detail: "تم إنشاء لجنة جديدة",
                life: 3000,
            });
        }
    } catch (err) {
        console.error(err);
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "حدث خطأ أثناء حفظ بيانات اللجنة",
            life: 3000,
        });
    } finally {
        isSaving.value = false;
        await getAllCommittees();
        addEditCommitteesDialogVisible.value = false;
    }
};

/**
 * =============================
 *  Delete Handling
 * =============================
 */
const confirmDeleteCommittee = (committee: any) => {
    if (isConfirming.value) return;

    isConfirming.value = true;

    confirm.require({
        group: 'deleteCommittees',
        message: `هل أنت متأكد من حذف بيانات اللجنة؟ "${committee.name}"`,
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
                await committeesService.delete(committee.id);
                toast.add({
                    severity: "success",
                    summary: "تم الحذف",
                    detail: "تم حذف اللجنة بنجاح",
                    life: 3000,
                });
                await getAllCommittees();
            } catch (err) {
                console.error(err);
                toast.add({
                    severity: "error",
                    summary: "خطأ",
                    detail: "حدث خطأ أثناء حذف اللجنة",
                    life: 3000,
                });
            } finally {
                isConfirming.value = false;
            }
        },
        reject: () => (isConfirming.value = false),
    });
};

/**
 * =============================
 *  Utility Functions
 * =============================
 */
const resetForm = () => {
    isEditMode.value = false;
    committeeForm.value = {
        id: undefined,
        name: "",
        description: "",
        department_id: null,
        department: null,
        manager_user_id: null,
        manager: null,
        users: [],
    };
};

/**
 * =============================
 *  Lifecycle
 * =============================
 */
onMounted(async () => {
    await getAllCommittees();
});
</script>

<style scoped>
/* Add your custom styles here if needed */
</style>
