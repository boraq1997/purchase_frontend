<template>
  <div class="card" dir="rtl">
    <!-- ============================= -->
    <!-- Breadcrumb -->
    <!-- ============================= -->
    <div class="card flex justify-center mt-3 mb-3">
      <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
    </div>

    <!-- ============================= -->
    <!-- Loading Overlay -->
    <!-- ============================= -->
    <div
      v-if="isLoading"
      class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5"
      style="background-color: #2828289c;"
    >
      <div class="text-primary-500 border-round text-center">
        <i class="fa-solid fa-circle-notch fa-spin fa-spin-reverse fa-2xl" style="font-size: 80px;"></i>
      </div>
    </div>

    <!-- ============================= -->
    <!-- Buttons -->
    <!-- ============================= -->
    <div class="flex justify-between mb-3">
      <Button 
        class="p-button-sm bg-teal-500" 
        label="قسم جديد" 
        icon="fas fa-plus" 
        @click="openAddEditDepartmentDialog()" 
      />
    </div>

    <!-- ============================= -->
    <!-- Departments DataTable -->
    <!-- ============================= -->
    <DataTable
      v-model:expandedRows="expandedRows"
      v-model:filters="filters"
      :value="allDepartments"
      dataKey="id"
      paginator
      :rows="10"
      filterDisplay="menu"
      :globalFilterFields="['name', 'code', 'username', 'manager.name', 'description']"
      responsiveLayout="scroll"
      class="text-right"
    >
      <!-- Table Header with Search -->
      <template #header>
        <div class="flex justify-between items-center">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters.global.value" placeholder="بحث شامل..." />
          </IconField>
        </div>
      </template>

      <template #empty>
        <Message severity="warn">لم يتم العثور على اقسام</Message>
      </template>
      <template #loading> جاري تحميل بيانات الأقسام... </template>

      <!-- Columns -->
      <Column field="id" sortable>
        <template #header>
          <i class="fas fa-hashtag text-gray-500"></i>
        </template>
      </Column>

      <Column field="name" header="اسم القسم" sortable>
        <template #header>
          <i class="fa-solid fa-object-group text-gray-500"></i>
        </template>
      </Column>

      <Column field="code" header="رمز القسم" sortable>
        <template #header>
          <i class="fa-solid fa-square-binary text-gray-500"></i>
        </template>
      </Column>

      <Column field="username" header="اسم المستخدم" sortable>
        <template #header>
          <i class="fa-solid fa-tag text-gray-500"></i>
        </template>
      </Column>

      <Column field="manager.name" header="المدير" sortable>
        <template #header>
          <i class="fas fa-user-tie text-gray-500"></i>
        </template>
        <template #body="slotProps">
          <!-- Display Manager Name -->
          <Tag 
            icon="fas fa-user-tie" 
            @click="getManagerUserInformation" 
            severity="contrast" 
            :value="slotProps.data.manager?.name || '-'"
          />
          <!-- Manager Details Popover -->
          <Popover ref="managerInfo" dir="rtl">
            <div class="flex flex-col gap-4 w-30rem">
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
        <template #header>
          <i class="fa-solid fa-text-width text-gray-500"></i>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="الادارة">
        <template #header>
          <i class="fas fa-cogs text-gray-500"></i>
        </template>
        <template #body="{ data }">
          <Button icon="fas fa-users" class="ml-1" severity="secondary" rounded variant="outlined" aria-label="all users" @click="openUsersDialog(data)" />
          <Button icon="fas fa-edit" class="ml-1" severity="secondary" rounded variant="outlined" aria-label="edit" @click="openAddEditDepartmentDialog(data)" />
          <Button icon="fas fa-trash-alt" severity="danger" rounded variant="outlined" aria-label="delete" @click.stop="confirmDeleteDepartment(data)" />
        </template>
      </Column>
    </DataTable>

    <!-- ============================= -->
    <!-- Add/Edit Department Dialog -->
    <!-- ============================= -->
    <Dialog
      v-model:visible="addEditDepartmentDialogVisible"
      :header="isEditMode ? 'تعديل بيانات القسم' : 'اضافة قسم جديد'"
      :style="{ width: '30vw'}"
      modal
      @hide="resetForm"
      dir="rtl"
    >
      <div class="flex flex-column gap-4 mt-3">
        <IconField>
          <InputIcon class="fa-solid fa-font" />
          <InputText v-model="departmentForm.name" placeholder="اسم القسم" fluid />
        </IconField>

        <IconField>
          <InputIcon class="fas fa-tag"/>
          <InputText v-model="departmentForm.username" placeholder="اسم قسم فريد" fluid />
        </IconField>

        <IconField>
          <InputIcon class="fa-solid fa-barcode"/>
          <InputText v-model="departmentForm.code" placeholder="رمز القسم" fluid />
        </IconField>

        <!-- Manager Selection -->
        <Select 
          v-model="departmentForm.manager" 
          :options="allUsers" 
          filter 
          optionLabel="name" 
          placeholder="اختر مدير القسم" 
          class="w-full md:w-56" 
        />

        <!-- Users Selection -->
        <MultiSelect 
          v-model="departmentForm.users" 
          optionLabel="name" 
          :options="filteredUsers" 
          filter 
          placeholder="اختر المستخدمين" 
          display="chip" 
          class="w-full md:w-80"
        />

        <IconField>
          <InputIcon class="fa-solid fa-text-width"/>
          <Textarea v-model="departmentForm.description" rows="5" style="resize: none" fluid />
        </IconField>
      </div>

      <template #footer>
        <Button 
          @click="addEditDepartmentDialogVisible = false" 
          label="الغاء" 
          icon="pi pi-times" 
          severity="secondary" 
          class="p-button-sm" 
        />
        <Button 
          @click="saveHandling" 
          :label="isEditMode ? 'حفظ التعديلات' : 'اضافة'" 
          icon="pi pi-check" 
          :loading="isSaving" 
          :disabled="!departmentForm.name || !departmentForm.code"
          class="p-button-sm" 
        />
      </template>
    </Dialog>

    <!-- ============================= -->
    <!-- Show Users Dialog -->
    <!-- ============================= -->
    <Dialog
      v-model:visible="showAllUsersInDepartmentDialogVisible"
      header="المنتسبين داخل القسم"
      :style="{width: '60vw'}"
      modal
      dir="rtl"
    >
      <DataTable
        v-model:filters="userFilters"
        :value="departmentUsers"
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
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="userFilters.global.value" placeholder="بحث عن المنتسبين..." />
            </IconField>
          </div>
        </template>
        <template #empty>
          <Message severity="warn">لم يتم العثور على منتسبين داخل القسم</Message>
        </template>
        <Column field="id" sortable>
          <template #header>
            <i class="fas fa-hashtag text-gray-500"></i>
          </template>
        </Column>
        <Column field="name" header="الاسم" sortable>
          <template #header>
            <i class="fas fa-user text-gray-500"></i>
          </template>
        </Column>
        <Column field="email" header="البريد الإلكتروني" sortable>
          <template #header>
            <i class="fas fa-envelope text-gray-500"></i>
          </template>
        </Column>
        <Column field="username" header="اسم المستخدم" sortable>
          <template #header>
            <i class="fas fa-user-tag text-gray-500"></i>
          </template>
        </Column>
        <Column field="phone" header="رقم الهاتف" sortable>
          <template #header>
            <i class="fa-solid fa-phone-flip text-gray-500"></i>
          </template>
        </Column>
      </DataTable>
    </Dialog>

    <!-- Toast & Confirm Dialog -->
    <Toast dir="rtl"/>
    <ConfirmDialog group="deleteDepartment" />
  </div>
</template>

<script setup lang="ts">
/* =============================
   Imports
============================= */
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import Breadcrumb from "primevue/breadcrumb";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Dialog from "primevue/dialog";
import MultiSelect from 'primevue/multiselect';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import Tag from 'primevue/tag';
import Popover from 'primevue/popover';
import Message from 'primevue/message';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

import DepartmentService, { Department } from "./DepartmentService";
// import type { Department } from "./DepartmentService";
import usersService from "../users/usersService";
import { FilterMatchMode } from "@primevue/core/api";

/* =============================
   Refs & Reactive State
============================= */
const toast = useToast();
const confirm = useConfirm();

// Data & State
const allDepartments = ref<Department[]>([]);
const allUsers = ref<any[]>([]);
const departmentUsers = ref<any[]>([]);
const expandedRows = ref<any[]>([]);

// Dialog States
const addEditDepartmentDialogVisible = ref(false);
const showAllUsersInDepartmentDialogVisible = ref(false);
const isEditMode = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const isConfirming = ref(false);

// Form Model
const departmentForm = ref<Department>({
  id: undefined,
  name: '',
  username: '',
  code: '',
  description: '',
  manager: null,
  users: [],
});

// Filters
const filters = reactive({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const userFilters = reactive({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Breadcrumb
const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });
const breadcrumbItems = ref([
  { label: "الرئيسية", to: "/" },
  { label: "الأقسام", to: "/departments" },
]);

// Refs for Popovers
const managerInfo = ref();

/* =============================
   Computed Properties
============================= */
// Exclude manager from users list in MultiSelect
const filteredUsers = computed(() =>
  allUsers.value.filter(user => user.id !== departmentForm.value.manager?.id)
);

/* =============================
   API Calls
============================= */
const fetchAllDepartments = async () => {
  isLoading.value = true;
  try {
    allDepartments.value = await DepartmentService.getAllDepartmentsWithUsers();
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "رسالة خطاء", detail: "حدث خطاء اثناء جلب بيانات الاقسام", life: 3000 });
  } finally {
    isLoading.value = false;
  }
};

const getAllUsers = async () => {
  try {
    allUsers.value = await usersService.getAllUsers();
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "خطاء", detail: "حدث خطاء اثناء جلب بيانات المستخدمين", life: 3000 });
  }
};

/* =============================
   Methods
============================= */

// Open Add/Edit Department Dialog
const openAddEditDepartmentDialog = async (department: any = null) => {
  await getAllUsers();

  if (department) {
    isEditMode.value = true;

    const manager = department.manager
      ? allUsers.value.find(user => user.id === department.manager.id) || department.manager
      : null;

    const users = department.users
      ?.map((user: any) => allUsers.value.find(u => u.id === user.id) || user)
      .filter((user: any) => user) || [];

    departmentForm.value = {
      id: department.id,
      name: department.name,
      username: department.username,
      code: department.code,
      description: department.description,
      manager: manager,
      users: users,
    };
  } else {
    resetForm();
  }

  addEditDepartmentDialogVisible.value = true;
};

// Open Users Dialog
const openUsersDialog = (department: any) => {
  departmentUsers.value = department.users;
  showAllUsersInDepartmentDialogVisible.value = true;
};

// Save Add/Edit Form
const saveHandling = async () => {
  if (!departmentForm.value.name || !departmentForm.value.code) {
    toast.add({ severity: "warn", summary: "رسالة تنبيه", detail: "رجاءً قم بملئ جميع الحقول", life: 3000 });
    return;
  }

  isSaving.value = true;

  const payload = {
    ...departmentForm.value,
    manager_user_id: departmentForm.value.manager?.id ?? null,
    users: departmentForm.value.users.map(u => u.id),
  };

  try {
    if (isEditMode.value && departmentForm.value.id !== null) {
      await DepartmentService.update(payload.id, payload);
      toast.add({ severity: "success", summary: "نجاح", detail: "تم تحديث بيانات القسم بنجاح", life: 3000 });
    } else {
      await DepartmentService.create(payload);
      toast.add({ severity: "success", summary: "نجاح", detail: "تم اضافة قسم بنجاح", life: 3000 });
    }

    
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "رسالة خطاء", detail: "حصل خطاء اثناء اضافة القسم", life: 3000 });
  } finally {
    isSaving.value = false;
    await fetchAllDepartments();
    addEditDepartmentDialogVisible.value = false;
  }
};

// Show Manager Info Popover
const getManagerUserInformation = (event: any) => {
  managerInfo.value.toggle(event);
};

// Confirm Department Deletion
const confirmDeleteDepartment = (department: any) => {
  if (isConfirming.value) return;

  isConfirming.value = true;

  confirm.require({
    group: "deleteDepartment",
    message: `هل أنت متأكد من حذف بيانات القسم؟ "${department.name}"`,
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
        await DepartmentService.delete(department.id);
        toast.add({ severity: "success", summary: "نجاح", detail: "تم حذف القسم بنجاح", life: 3000 });
        await fetchAllDepartments();
      } catch (err) {
        console.error(err);
        toast.add({ severity: "error", summary: "رسالة خطاء", detail: "حدث خطاء اثناء حذف بيانات القسم", life: 3000 });
      } finally {
        isConfirming.value = false;
      }
    },
    reject: () => {
      isConfirming.value = false;
    },
  });
};

// Reset Form
const resetForm = () => {
  isEditMode.value = false;
  departmentForm.value = {
    id: null,
    name: '',
    username: '',
    code: '',
    description: '',
    manager: null,
    users: [],
  };
};

/* =============================
   Lifecycle Hooks
============================= */
onMounted(async () => {
  await getAllUsers();
  await fetchAllDepartments();
});
</script>

<style scoped>
.card {
  padding: 1rem;
}
</style>
