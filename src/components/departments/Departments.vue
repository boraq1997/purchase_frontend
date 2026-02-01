<template>
  <div class="card" dir="rtl">
    <!-- ============================= -->
    <!-- Breadcrumb -->
    <!-- ============================= -->
    <div class="card flex justify-center mt-2 mb-3">
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
        v-if="hasPermission('create-Department')"
        class="p-button-sm" 
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
        <div class="">
          <FloatLabel variant="on">
            <InputText v-model="filters.global.value" style="width: 20vw"/>
            <label for="global_filter_field"><i class="fas fa-search"/> بحث شامل</label>
          </FloatLabel>
          <small class="text-gray-500 text-xs">البحث الشامل على جميع الحقول مثل [الاسم, كود القسم, مدير القسم, الوصف]</small>
        </div>
      </template>

      <template #empty>
        <Message severity="warn">لم يتم العثور على اقسام</Message>
      </template>
      <template #loading> جاري تحميل بيانات الأقسام... </template>

      <!-- Columns -->
      <Column field="id" sortable>
        <template #header>
          <span v-tooltip="{ value: 'الرقم التسلسلي الخاص بالقسم', showDelay: 500, hideDelay: 300 }">
            <i class="fas fa-hashtag text-gray-500"></i>
          </span>
        </template>
      </Column>

      <Column field="name" sortable>
        <template #header>
          <span v-tooltip="{ value: 'اسم القسم الكامل الذي يضهر في جميع الصفحات والتقارير', showDelay: 500, hideDelay: 300 }">
            <i class="fa-solid fa-object-group text-gray-500"></i>اسم القسم
          </span>
        </template>
      </Column>

      <Column field="code" sortable>
        <template #header>
          <span v-tooltip="{ value: 'الرمز الفريد الخاص بالقسم', showDelay: 500, hideDelay: 300 }">
            <i class="fa-solid fa-square-binary text-gray-500"></i>رمز القسم
          </span>
        </template>
      </Column>

      <Column field="manager.name" sortable>
        <template #header>
          <span v-tooltip="{ value: 'مدير القسم وهوه الشخص الذي لديه صلاحيات كامله على القسم', showDelay: 500, hideDelay: 300 }">
            <i class="fas fa-user-tie text-gray-500"></i>المدير
          </span>
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

      <Column field="description" sortable>
        <template #header>
          <span v-tooltip="{ value: 'الوصف الخاص بالقسم وجميع تفاصيل القسم', showDelay: 500, hideDelay: 300 }">
            <i class="fa-solid fa-text-width text-gray-500"></i>الوصف
          </span>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column>
        <template #header>
          <span v-tooltip="{ value: 'ازرار ادارة القسم [تعديل, حذف, عرض المستخدمين]', showDelay: 500, hideDelay: 300 }">
            <i class="fas fa-cogs text-gray-500"></i>الادارة
          </span>
        </template>
        <template #body="{ data }">
          <Button icon="fas fa-users" class="ml-1" severity="secondary" rounded variant="outlined" aria-label="all users" @click="openUsersDialog(data)" v-tooltip="{ value: 'عرض جميع المستخدمين المنتمين الى القسم', showDelay: 1000, hideDelay: 300 }"/>
          <Button v-if="hasPermission('edit-Permission')" icon="fas fa-edit" class="ml-1" severity="secondary" rounded variant="outlined" aria-label="edit" @click="openAddEditDepartmentDialog(data)" v-tooltip="{ value: 'تعديل بيانات القسم', showDelay: 1000, hideDelay: 300 }"/>
          <Button v-if="hasPermission('delete-Permission')" icon="fas fa-trash-alt" severity="danger" rounded variant="outlined" aria-label="delete" @click.stop="confirmDeleteDepartment(data)" v-tooltip="{ value: 'حذف بيانات القسم', showDelay: 1000, hideDelay: 300 }"/>
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
        <FloatLabel variant="on">
          <InputText id="name_feild" v-model="departmentForm.name" fluid />
          <label for="name_feild"><i class="fas fa-font"/> اسم القسم</label>
        </FloatLabel>

        <FloatLabel variant="on">
          <InputText id="code_field" v-model="departmentForm.code" fluid />
          <label for="code_field"><i class="fas fa-barcode"/> رمز القسم</label>
        </FloatLabel>


        <FloatLabel variant="on">
          <Select 
            id="manager_field"
            v-model="departmentForm.manager" 
            :options="allUsers"
            filter 
            optionLabel="name"
            class="w-full md:w-56" 
          />
          <label for="manager_field"><i class="fas fa-user-tie"/> مدير القسم</label>
        </FloatLabel>


        <!-- Users Selection -->
        <FloatLabel variant="on">
          <MultiSelect 
            id="users_field"
            v-model="departmentForm.users" 
            optionLabel="name" 
            :options="filteredUsers" 
            filter 
            display="chip" 
            class="w-full md:w-80"
          />
          <label for="users_field"><i class="fas fa-users"/> المستخدمين</label>
        </FloatLabel>
        <small class="text-yellow-200 text-s mt-0"></small>


        <FloatLabel variant="on">
          <Textarea id="description_field" v-model="departmentForm.description" rows="5" style="resize: none" fluid />
          <label for="description_field"><i class="fas fa-text-width"/> الملاحظات</label>
        </FloatLabel>

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
import FloatLabel from 'primevue/floatlabel';

import DepartmentService, { Department } from "./DepartmentService";
// import type { Department } from "./DepartmentService";
import usersService from "../users/usersService";
import { FilterMatchMode } from "@primevue/core/api";
import { hasPermission } from "../services/permission";

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
  { label: "الرئيسية", to: "/", icon: "fas fa-house" },
  { label: "الأقسام", to: "/departments", icon: "fa-solid fa-people-roof" },
]);

// Refs for Popovers
const managerInfo = ref();

/* =============================
   Computed Properties
============================= */
// Exclude manager from users list in MultiSelect
const filteredUsers = computed(() => {
    return allUsers.value.filter(user => user.id !== departmentForm.value.manager?.id)
});

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

const getAllUsers = async (department?: any) => {
  try {
    let availableUsers: any[] = [];

    // جلب المستخدمين الغير منتمين لأي قسم
    availableUsers = await DepartmentService.getAvailableForDepartment();
    allUsers.value = await usersService.getAllUsers();

    // إضافة المستخدمين المنتسبين للقسم الحالي
    if (department && department.users) {
      const currentUsers = department.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      }));

      const userIds = new Set(availableUsers.map(u => u.id));
      currentUsers.forEach(u => {
        if (!userIds.has(u.id)) availableUsers.push(u);
      });
    }

    // إضافة المدير الحالي إذا لم يكن موجودًا
    if (department?.manager && !availableUsers.find(u => u.id === department.manager.id)) {
      availableUsers.push({
        id: department.manager.id,
        name: department.manager.name,
        email: department.manager.email,
        username: department.manager.username
      });
    }

    allUsers.value = availableUsers;

  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "خطأ",
      detail: "حدث خطأ اثناء جلب بيانات المستخدمين",
      life: 3000
    });
  }
};

/* =============================
   Methods
============================= */

// Open Add/Edit Department Dialog
const openAddEditDepartmentDialog = async (department: any = null) => {
  await getAllUsers(department);

  if (department) {
    isEditMode.value = true;

    console.log('users: ', allUsers.value)
    // المدير الحالي من القائمة نفسها
    const manager = allUsers.value.find(user => user.id === department.manager?.id) || null;
    console.log('mn1', manager)
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
    console.log('mn2: ', manager);
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

</style>

