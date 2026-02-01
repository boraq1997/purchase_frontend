<template>
    <div class="card" dir="rtl">
        <!-- =============================
        Breadcrumb Navigation
        ============================= -->
        <div class="card flex justify-center mt-3 mb-3">
            <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
        </div>

        <!-- =============================
        Global Loading Overlay
        ============================= -->
        <div
            v-if="isLoading"
            class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5"
            style="background-color: #2828289c;"
        >
            <div class="text-primary-500 border-round text-center">
                <i class="fa-solid fa-circle-notch fa-spin fa-2xl" style="font-size: 80px;"></i>
            </div>
        </div>

        <!-- =============================
        Action Buttons
        ============================= -->
        <div class="flex justify-between mb-3">
            <Button 
                v-if="hasPermission('create-User')"
                class="p-button-sm" 
                label="اضافة" 
                icon="fas fa-plus"
                @click="openAddEditUserDialog()"
                v-tooltip="{ value: 'اضافة مستخدم جديد', showDelay: 1000, hideDelay: 300 }"
            />
        </div>

        <!-- =============================
        Users DataTable
        ============================= -->
        <DataTable
            v-model:filters="filters"
            :value="allUsers"
            dataKey="id"
            paginator
            :rows="10"
            filterDisplay="menu"
            :globalFilterFields="['name', 'username', 'email', 'phone', 'created_at', 'department_id', 'role']"
            responsiveLayout="scroll"
            class="text-right"
        >
            <!-- Table Header: Global Search -->
            <template #header>
                <div>
                    <FloatLabel variant="on">
                        <InputText v-model="filters.global.value" style="width: 20vw;"/>
                        <label for="global_filter_feild"><i class="fas fa-search"/> بحث شامل...</label>
                    </FloatLabel>
                    <small class="text-gray-500 text-xs">
                        البحث الشامل على جميع الحقول مثل [الاسم - اسم المستخدم - البريد الالكتروني - رقم الهاتف - اسم الصلاحية]
                    </small>
                </div>
            </template>

            <!-- Empty Table Message -->
            <template #empty>
                <Message severity="warn">لم يتم العثور على مستخدمين</Message>
            </template>

            <!-- Loading Message -->
            <template #loading> جاري تحميل بيانات المستخدمين... </template>

            <!-- Columns Definitions -->

            <!-- User ID Column -->
            <Column field="id" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'الرقم التسلسلي الخاص بالمستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fas fa-hashtag text-gray-500"></i>
                    </span>
                </template>
            </Column>

            <!-- User Name Column -->
            <Column field="name" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'الاسم الرباعي الخاص بالمستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fas fa-user text-gray-500"></i>الاسم
                    </span>
                </template>
            </Column>

            <!-- Username Column -->
            <Column field="username" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'اسم المستخدم الخاص بتسجيل الدخول', showDelay: 500, hideDelay: 300 }">
                        <i class="fas fa-user-tag text-gray-500"></i>اسم المستخدم
                    </span>
                </template>
            </Column>

            <!-- Email Column -->
            <Column field="email" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'البريد الالكتروني الخاص بالمستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fas fa-envelope text-gray-500"></i>البريد الالكتروني
                    </span>
                </template>
                <template #body="slotProps">
                    <Button
                        as="a"
                        :label="slotProps.data.email" 
                        severity="info" 
                        variant="text"
                        :href="`mailto:${slotProps.data.email}?subject=${encodeURIComponent('عنوان الرسالة')}&body=${encodeURIComponent('نص الرسالة')}`"
                        v-tooltip="{ value: 'اضغط لارسال رسالة الى المستخدم باستخدام البريد الالكتروني', showDelay: 500, hideDelay: 300 }"
                    />
                </template>
            </Column>

            <!-- Department Column -->
            <Column field="department.name" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'القسم الذي ينتمي الية المستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fa-solid fa-layer-group text-gray-500"></i>القسم
                    </span>
                </template>
            </Column>

            <!-- Phone Column -->
            <Column field="phone" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'رقم الهاتف الخاص بالمستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fa-solid fa-phone-flip text-gray-500"></i>رقم الهاتف
                    </span>
                </template>
                <template #body="slotProps">
                    <Tag icon="fas fa-phone-flip" v-if="slotProps.data.phone" severity="info" :value="slotProps.data.phone"></Tag>
                    <Tag icon="fas fa-info-circle" v-if="!slotProps.data.phone" severity="danger" value="لا يوجد"></Tag>
                </template>
            </Column>

            <!-- Parent Account Column -->
            <Column field="parent" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'الحساب المرتبط به المستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fa-solid fa-user-lock text-gray-500"></i> الحساب الرئيسي
                    </span>
                </template>
                <template #body="slotProps">
                    <Tag icon="fas fa-user-lock" v-if="slotProps.data.parent" severity="info" :value="slotProps.data.parent?.name"></Tag>
                    <Tag icon="fas fa-user-lock" v-if="!slotProps.data.parent" severity="warn" value="لا يوجد"></Tag>
                </template>
            </Column>

            <!-- Status Column -->
            <Column field="status" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'الحالة الخاصة بالمستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fa-solid fa-layer-group text-gray-500"></i>الحالة
                    </span>
                </template>
                <template #body="slotProps">
                    <Tag v-if="slotProps.data.status === 'active'" icon="fas fa-check" severity="success" value="مفعل"></Tag>
                    <Tag v-if="slotProps.data.status === 'inactive'" icon="fas fa-times" severity="danger" value="معطل"></Tag>
                </template>
            </Column>

            <!-- Role Column -->
            <Column field="role" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'الصلاحيات الخاصه بالمستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fas fa-shild"/> الصلاحيات
                    </span>
                </template>
                <!-- TODO: Add drawer/modal to display all permissions for user -->
            </Column>

            <!-- Created At Column -->
            <Column field="created_at" sortable>
                <template #header>
                    <span v-tooltip="{ value: 'تأريخ اضافة المستخدم', showDelay: 500, hideDelay: 300 }">
                        <i class="fa-solid fa-calendar-plus text-gray-500"/> تاريخ الاضافة
                    </span>
                </template>
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.created_at) }}
                </template>
            </Column>

            <!-- Actions Column -->
            <Column>
                <template #header>
                    <span v-tooltip="{ value: 'ادارة المستخدم', showDelay: 500, hideDelay: 300 }" class="cursor-pointer">
                        <i class="fas fa-cogs text-gray-500"/>الادارة
                    </span>
                </template>
                <template #body="{data}">
                    <Button v-if="hasPermission('view-Committees')" icon="fa-solid fa-users-viewfinder" class="ml-1" severity="secondary" rounded variant="outlined" aria-label="all committees" @click="getUserCommittees(data.committees)" v-tooltip="{ value: 'عرض اللجان التي ينتمي اليها المستخدم', showDelay: 1000, hideDelay: 300 }"/>
                    <Button v-if="hasPermission('edit-User')" icon="fas fa-user-edit" class="ml-1" severity="secondary" rounded variant="outlined" aria-label="edit" @click="openAddEditUserDialog(data)" v-tooltip="{ value: 'تعديل بيانات المستخدم', showDelay: 1000, hideDelay: 300 }" />
                    <Button v-if="hasPermission('delete-User')" icon="fas fa-user-minus" severity="danger" rounded variant="outlined" aria-label="delete" @click.stop="confirmDeleteUser(data)" v-tooltip="{ value: 'حذف بيانات المستخدم', showDelay: 1000, hideDelay: 300 }" />
                </template>
            </Column>
            
        </DataTable>

        <!-- =============================
        User Committees Dialog
        ============================= -->
        <Dialog
            v-model:visible="userCommitteeDialogVisible"
            header="اللجان التي ينتمي اليها"
            :style="{width: '75vw'}"
            modal
            dir="rtl"
        >
            <!-- Committees DataTable -->
            <DataTable
                v-model:filters="committeesFilters"
                :value="userCommittees"
                dataKey="id"
                paginator
                :rows="10"
                filterDisplay="menu"
                :globalFilterFields="['name', 'description']"
                responsiveLayout="scroll"
                class="text-right"
            >
                <!-- Global Search -->
                <template #header>
                    <div>
                        <FloatLabel variant="on">
                            <InputText v-model="committeesFilters.global.value" style="width: 20vw;"/>
                            <label for="global_filter_feild"><i class="fas fa-search"/> بحث شامل...</label>
                        </FloatLabel>
                        <small class="text-gray-500 text-xs">
                            البحث الشامل على جميع الحقول مثل [الاسم - اسم المستخدم - البريد الالكتروني - رقم الهاتف - اسم الصلاحية]
                        </small>
                    </div>
                </template>

                <!-- Empty Message -->
                <template #empty>
                    <Message severity="warn">لم يتم العثور على مستخدمين</Message>
                </template>

                <!-- Columns -->
                <Column field="id" sortable header="#">
                    <template #header><i class="fas fa-hashtag text-gray-500"></i></template>
                </Column>

                <Column field="name" header="اسم اللجنة" sortable>
                    <template #header><i class="fa-solid fa-object-group text-gray-500"></i></template>
                </Column>

                <Column header="المدير" sortable>
                    <template #header><i class="fas fa-user-tie text-gray-500"></i></template>
                    <template #body="slotProps">
                        <!-- Display Manager -->
                        <Tag 
                            icon="fas fa-user-tie"
                            @click="getCommitteesManagerUserInfo"
                            severity="contrast"
                            :value="slotProps.data.manager?.name || '-'"
                        />

                        <!-- Manager Info Popover -->
                        <Popover ref="committeeManagerInfo" dir="rtl">
                            <div class="flex flex-col gap-4 w-30rem p-3">
                                <div class="p-3">
                                    <div class="grid mb-2">
                                        <div class="col-6"><i class="fas fa-user"></i> الاسم: </div>
                                        <div class="col-6">{{ slotProps.data.manager.name }}</div>
                                    </div>
                                    <div class="grid mb-2">
                                        <div class="col-6"><i class="fas fa-envelope"></i> البريد الالكتروني: </div>
                                        <div class="col-6">{{ slotProps.data.manager.email }}</div>
                                    </div>
                                    <div class="grid mb-2">
                                        <div class="col-6"><i class="fa-solid fa-phone-flip"></i> رقم الهاتف: </div>
                                        <div class="col-6">{{ slotProps.data.manager.phone }}</div>
                                    </div>
                                </div>
                            </div>
                        </Popover>
                    </template>
                </Column>

                <Column field="description" header="الوصف" sortable>
                    <template #header><i class="fa-solid fa-text-width text-gray-500"></i></template>
                </Column>
            </DataTable>
        </Dialog>

        <!-- =============================
        Add / Edit User Dialog
        ============================= -->
        <Dialog
            v-model:visible="addEditUsersDialogVisible"
            :header="isEditMode ? 'تعديل بيانات المستخدم' : 'اضافة مستحدم جديد'"
            :style="{width: '30vw'}"
            modal
            @hide="resetForm"
            dir="rtl"
        >
            <div class="flex flex-column gap-4 mt-3">
                <!-- Name Field -->
                <div>
                    <FloatLabel variant="on">
                        <InputText id="name_field" v-model="userForm.name" fluid />
                        <label for="name_field"><i class="fas fa-user"/> الاسم الرباعي</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">الاسم الرباعي الخاص بالمستخدم يستفاد منه لمعرفة وتمييز صاحب الحساب في جميع صفحات النظام</small>
                </div>

                <!-- Username Field -->
                <div>
                    <FloatLabel variant="on">
                        <InputText 
                            id="username_feild"
                            v-model="userForm.username"
                            @input="feildErrors.username=''"
                            fluid
                            :class="{'p-invalid': feildErrors.username}"
                            ref="usernameField"
                        />
                        <label for="username_feild"><i class="fas fa-user-tag"/> اسم المستخدم</label>
                    </FloatLabel>
                    <small v-if="feildErrors.username" class="text-red-500 text-s mt-0">{{ feildErrors.username }}</small>
                    <small v-if="!feildErrors.username" class="text-yellow-200 text-s mt-0">اسم المستخدم يستفاد منه لتسجيل الدخول الى النضام ويجب ان يكون لكل مستخدم اسم فريد خاص به ولا يجوز التكرار</small>
                </div>

                <!-- Password Field -->
                <div>
                    <FloatLabel variant="on">
                        <Password id="password_feild" v-model="userForm.password" toggleMask fluid/>
                        <label for="password_feild"><i class="fas fa-user-lock"/> كلمة المرور</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">كلمة المرور الخاصه بالمستخدم للاستخدام اثناء تسجيل الدخول مع اسم المستخدم</small>
                </div>

                <!-- Password Confirmation Field -->
                <div>
                    <FloatLabel variant="on">
                        <Password id="password_confirm_feild" v-model="userForm.password_confirmation" toggleMask fluid/>
                        <label for="password_confirm_feild">تأكيد كلمة المرور</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">تاكيد كلمة المرور يجب ان تكون مطابقة للقيمه في حقل كلمة المرور اعلاه</small>
                </div>

                <!-- Email Field -->
                <div>
                    <FloatLabel variant="on">
                        <InputText id="email_feild" v-model="userForm.email" fluid />
                        <label for="email_feild"><i class="fas fa-envelope"/> البريد الالكتروني</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">البريد الالكتروني الشخصي الخاص بالمستخدم</small>
                </div>

                <!-- Phone Field -->
                <div>
                    <FloatLabel variant="on">
                        <InputText id="phone_feild" v-model="userForm.phone" fluid />
                        <label for="phone_feild">رقم الهاتف</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">رقم الهاتف الشخصي الخاص بالمستخدم</small>
                </div>

                <!-- Status Field -->
                <div>
                    <FloatLabel variant="on">
                        <Select
                            id="status_feild"
                            v-model="userForm.status"
                            :options="[
                                { label: 'مفعل', value: 'active' },
                                { label: 'معطل', value: 'inactive' }
                            ]"
                            optionValue="value"
                            optionLabel="label"
                            class="w-full md:w-56"
                        />
                        <label for="status_feild">حالة المستخدم</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">حالة المستخدم في حال مفعله او معطلة في حال كانت معطلة لن يتمكن من تسجيل الدخول واستخدام النظام</small>
                </div>

                <!-- Role Field -->
                <div>
                    <FloatLabel variant="on">
                        <Select
                            id="role_feild"
                            v-model="userForm.role"
                            :options="allRoles"
                            filter
                            optionLabel="name"
                            optionValue="id"
                            class="w-full md:w-56"
                        />
                        <label for="role_feild">صلاحيات المستخدم</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">الصلاحيات والادوار الخاصه بالمستخدم ويمكن للمستخدم استخدام النظام على اساس الصلاحيات التي يتم منحها له</small>
                </div>

                <!-- Department Field -->
                <div>
                    <FloatLabel variant="on">
                        <Select
                            id="department_feild"
                            v-model="userForm.department_id"
                            :options="departments"
                            filter
                            optionLabel="name"
                            optionValue="id"
                            class="w-full md:w-56"
                        />
                        <label for="department_feild">القسم الخاص بالمستخدم</label>
                    </FloatLabel>
                    <small class="text-yellow-200 text-s mt-0">القسم الذي ينتمي اليه المستخدم ويمكنه الاطلاع فقط على الطلبات والامور التي تخص قسمه فقط</small>
                </div>
                
            </div>

            <!-- Dialog Footer -->
            <template #footer>
                <Button
                    @click="addEditUsersDialogVisible = false;"
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
                    :disabled="!userForm.name"
                    class="p-button-sm"
                />
            </template>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog dir="rtl" group="deleteUser" />
    </div>
</template>

<script setup lang="ts">
/**
 * =============================
 *  Imports
 * =============================
 */
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import usersService, {type UserFormData} from "../users/usersService";
import { FilterMatchMode } from "@primevue/core/api";
import DepartmentService from "../departments/DepartmentService";
import rolesService from "../roles/rolesService";

import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Tag from 'primevue/tag';
import Dialog from "primevue/dialog";
import Popover from "primevue/popover";
import ConfirmDialog from "primevue/confirmdialog";
import Select from 'primevue/select';
import Password from 'primevue/password';
import FloatLabel from 'primevue/floatlabel';
import { hasPermission } from "../services/permission";

/**
 * =============================
 *  Reactive State
 * =============================
 */
const toast = useToast(); // Toast notifications
const confirm = useConfirm(); // Confirm dialog
const isLoading = ref(true); // Loading state for data fetching
const isSaving = ref(false); // Loading state for save operation
const isEditMode = ref(false); // Flag to indicate edit mode
const isConfirming = ref(false); // Flag to prevent multiple confirm dialogs

const allUsers = ref<any[]>([]); // Array of all users
const userCommittees = ref<any[]>([]); // Committees of selected user
const committeeManagerInfo = ref() // Popover ref for manager info
const userForm = ref<UserFormData>({ // Reactive form for user create/edit
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
const departments = ref<any[]>([]); // List of departments
const allRoles = ref<any[]>([]); // List of roles

const addEditUsersDialogVisible = ref(false); // Visibility of add/edit user dialog
const userCommitteeDialogVisible = ref(false); // Visibility of user committees dialog

const filters = reactive({
    global: {value: null, matchMode: FilterMatchMode.CONTAINS}, // Global search filters for users table
})

const committeesFilters = reactive({
    global: {value: null, matchMode: FilterMatchMode.CONTAINS}, // Global search filters for committees table
})

// Breadcrumb configuration
const breadcrumbHome = ref({ icon: "fas fa-house", to: "/" });
const breadcrumbItems = ref([
  { label: "الرئيسية", to: "/", icon: "fas fa-house"},
  { label: "المستخدمين", to: "/users", icon: "fas fa-users"},
]);

const usernameField = ref<HTMLInputElement|null>(null); // Reference to username input field
const feildErrors = reactive({
    username: '', // Username validation error
    email: '',    // Email validation error
})

const formatDate = (value: string) => new Date(value).toLocaleDateString("ar-EG"); // Format date in Arabic locale

/**
 * =============================
 *  Fetch Functions
 * =============================
 */

const getAllUsers = async()=>{
    isLoading.value = true; // Start loading
    try {
        allUsers.value = await usersService.getAllUsers(); // Fetch all users
        console.log(allUsers.value)
    } catch (err) {
        console.log('error fetching users: ', err)
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "حدث خطاء اثناء جلب بيانات المستخدمين",
            life: 3000,
        });
    } finally {
        isLoading.value = false; // Stop loading
    }
}

const getAllDepartments = async()=>{
    try {
        departments.value = await DepartmentService.getAll(); // Fetch all departments
    } catch (err) {
        console.log(err)
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء اثناء جلب بيانات الاقسام",
            life: 3000
        });
    }
}

// Show user committees dialog
const getUserCommittees = (committee: any)=>{
    if (committee) {
        userCommittees.value = committee;
        userCommitteeDialogVisible.value = true;
    } else {
        toast.add({
            severity: "warn",
            summary: "تنبيه",
            detail: "لم يتم العثور على لجان خاصه بالمستخدم",
            life: 3000
        });
    }
}

// Show manager info popover
const getCommitteesManagerUserInfo = (event:any)=>{
    committeeManagerInfo.value.toggle(event);
}

// Open Add/Edit User Dialog
const openAddEditUserDialog = async(user:any = null) => {
    getAllDepartments(); // Fetch departments before opening dialog
    if (user) {
        isEditMode.value = true;
        const selectedRole = allRoles.value.find(r => r.name === user.role);

        userForm.value = {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            department_id: user.department?.id ?? 0,
            parent_id: user.parent_id,
            status: user.status,
            role: selectedRole ? selectedRole.id : null, // Set role ID
        };
    } else {
        resetForm(); // Reset form for new user
    }
    addEditUsersDialogVisible.value = true;
}

// Save or update user
const saveHandling = async()=>{
    if (!userForm.value.name) {
        toast.add({
            severity: "warn",
            summary: "تنبية",
            detail: "يرجى ملئ جميع الحقول المطلوبة",
            life: 3000
        });
        return;
    }

    isSaving.value = true; // Start saving

    const payload = {
        ...userForm.value,
    };

    try {
        if (isEditMode.value && userForm.value.id) {
            await usersService.updateUser(payload.id, payload);
            toast.add({
                severity: "success",
                summary: "نجاح",
                detail: "تم تحديث بيانات المستخدم بنجاح",
                life: 3000,
            });
        } else {
            await usersService.createUser(payload);
            toast.add({
                severity: "success",
                summary: "نجاح",
                detail: "تم إنشاء مستخدم جديد",
                life: 3000,
            });
        }
        addEditUsersDialogVisible.value = false; // Close dialog
    } catch (err) {
        console.error(err);
        if (err?.response?.data?.message?.includes("username") && err.response.data.message.includes("taken")) {
            toast.add({
                severity: "error",
                summary: "رسالة خطاء",
                detail: "اسم المستخدم تم استخدامه بالفعل",
                life: 3000
            });
            feildErrors.username = "اسم المستخدم تم استخدامه مسبقاٌ";

            nextTick(()=> {usernameField.value?.focus();})
        } else {
            toast.add({
                severity: "error",
                summary: "خطأ",
                detail: "حدث خطأ أثناء حفظ بيانات المستخدم",
                life: 3000,
            });
        }
    } finally {
        isSaving.value = false // Stop saving
        await getAllUsers(); // Refresh users table
    }
}

// Confirm deletion of user
const confirmDeleteUser = (user:any)=> {
    if (isConfirming.value) return; // Prevent multiple confirm dialogs

    isConfirming.value = true;

    confirm.require({
        group: 'deleteUser',
        message: `هل أنت متأكد من حذف بيانات المستخدم؟ "${user.name}"`,
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
                await usersService.deleteUser(user.id);
                toast.add({
                    severity: 'success',
                    summary: "نجاح",
                    detail: "تم حذف بيانات المستخدم بنجاح",
                    life: 3000,
                });
                await getAllUsers(); // Refresh table after deletion
            } catch (err) {
                console.log(err);
                toast.add({
                    severity: 'error',
                    summary: "خطأ",
                    detail: "حدث خطأ اثناء حذف بيانات المستخدم",
                    life: 3000,
                });
            } finally {
                isConfirming.value = false;
            }
        },
        reject: ()=>(isConfirming.value = false),
    });
}

// Fetch all roles
const getAllRoles = async()=>{
    try {
        const response = await rolesService.getAllRoles();
        allRoles.value = response;
    } catch (err) {
        console.log(err)
    }
}

// Watch username field to reset validation error
watch(()=> userForm.value.username, ()=>{
    feildErrors.username = '';
})

// Reset user form to default values
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

// Fetch initial data on component mount
onMounted(async () => {
    await getAllUsers();
    getAllRoles();
});
</script>

<style scoped>
</style>