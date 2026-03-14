<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :header="isEditMode ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'"
        :style="{ width: '40vw' }"
        modal
        @hide="$emit('hide')"
        dir="rtl"
    >
        <div class="flex flex-column gap-4 mt-3">

            <!-- Name + Username -->
            <div class="grid">
                <div class="col">
                    <FloatLabel variant="on">
                        <InputText id="name_field" v-model="localForm.name" fluid />
                        <label for="name_field">
                            <i class="fas fa-user" /> الاسم الرباعي
                            <span class="text-red-500">*</span>
                        </label>
                    </FloatLabel>
                    <small class="text-gray-400 text-xs">الاسم الرباعي الخاص بالمستخدم</small>
                </div>

                <div class="col">
                    <FloatLabel variant="on">
                        <InputText
                            id="username_feild"
                            v-model="localForm.username"
                            @input="fieldErrors.username = ''"
                            fluid
                            :class="{ 'p-invalid': fieldErrors.username }"
                            ref="usernameField"
                        />
                        <label for="username_feild">
                            <i class="fas fa-user-tag" /> اسم المستخدم
                            <span class="text-red-500">*</span>
                        </label>
                    </FloatLabel>
                    <small v-if="fieldErrors.username" class="text-red-500 text-xs">{{ fieldErrors.username }}</small>
                    <small v-else class="text-gray-400 text-xs">يُستخدم لتسجيل الدخول ويجب أن يكون فريداً</small>
                </div>
            </div>

            <!-- Password + Confirmation -->
            <div class="grid">
                <div class="col">
                    <FloatLabel variant="on">
                        <Password
                            id="password_feild"
                            v-model="localForm.password"
                            toggleMask fluid
                            :feedback="false"
                            :class="{ 'p-invalid': passwordErrors.length > 0 && localForm.password }"
                            @focus="passwordFocused = true"
                            @blur="passwordFocused = false"
                        />
                        <label for="password_feild">
                            <i class="fas fa-lock" /> كلمة المرور
                            <span v-if="!isEditMode" class="text-red-500">*</span>
                            <span v-else class="text-gray-400 text-xs"> (اتركها فارغة إن لم تريد تغييرها)</span>
                        </label>
                    </FloatLabel>

                    <!-- شروط كلمة المرور عند الـ focus -->
                    <div class="mt-2 flex flex-column gap-1" v-if="passwordFocused && (!isEditMode || localForm.password)">
                        <small :class="passwordChecks.minLength    ? 'text-green-500' : 'text-red-400'" class="text-xs">
                            <i :class="passwordChecks.minLength    ? 'fas fa-check' : 'fas fa-times'" class="mr-1" />
                            8 أحرف على الأقل
                        </small>
                        <small :class="passwordChecks.hasUppercase ? 'text-green-500' : 'text-red-400'" class="text-xs">
                            <i :class="passwordChecks.hasUppercase ? 'fas fa-check' : 'fas fa-times'" class="mr-1" />
                            حرف كبير (A-Z)
                        </small>
                        <small :class="passwordChecks.hasLowercase ? 'text-green-500' : 'text-red-400'" class="text-xs">
                            <i :class="passwordChecks.hasLowercase ? 'fas fa-check' : 'fas fa-times'" class="mr-1" />
                            حرف صغير (a-z)
                        </small>
                        <small :class="passwordChecks.hasNumber    ? 'text-green-500' : 'text-red-400'" class="text-xs">
                            <i :class="passwordChecks.hasNumber    ? 'fas fa-check' : 'fas fa-times'" class="mr-1" />
                            رقم (0-9)
                        </small>
                        <small :class="passwordChecks.hasSpecial   ? 'text-green-500' : 'text-red-400'" class="text-xs">
                            <i :class="passwordChecks.hasSpecial   ? 'fas fa-check' : 'fas fa-times'" class="mr-1" />
                            رمز خاص (!@#$...)
                        </small>
                    </div>

                    <!-- رسالة موجزة بعد الـ blur -->
                    <small v-if="!passwordFocused && localForm.password && !isPasswordValid" class="text-red-400 text-xs">
                        <i class="fas fa-exclamation-circle mr-1" />كلمة المرور لا تستوفي الشروط
                    </small>
                    <small v-else-if="!passwordFocused && localForm.password && isPasswordValid" class="text-green-500 text-xs">
                        <i class="fas fa-check-circle mr-1" />كلمة المرور قوية ✓
                    </small>
                </div>

                <div class="col">
                    <FloatLabel variant="on">
                        <Password
                            id="password_confirm_feild"
                            v-model="localForm.password_confirmation"
                            toggleMask fluid
                            :feedback="false"
                            :class="{ 'p-invalid': localForm.password && localForm.password !== localForm.password_confirmation }"
                        />
                        <label for="password_confirm_feild">
                            تأكيد كلمة المرور
                            <span v-if="!isEditMode" class="text-red-500">*</span>
                        </label>
                    </FloatLabel>
                    <small v-if="localForm.password && localForm.password !== localForm.password_confirmation" class="text-red-500 text-xs">
                        <i class="fas fa-times mr-1" />كلمة المرور وتأكيدها غير متطابقين
                    </small>
                    <small v-else-if="localForm.password && localForm.password === localForm.password_confirmation" class="text-green-500 text-xs">
                        <i class="fas fa-check mr-1" />كلمة المرور متطابقة
                    </small>
                </div>
            </div>

            <!-- Email + Phone -->
            <div class="grid">
                <div class="col">
                    <FloatLabel variant="on">
                        <InputText
                            id="email_feild"
                            v-model="localForm.email"
                            @input="fieldErrors.email = ''"
                            fluid
                            :class="{ 'p-invalid': fieldErrors.email }"
                        />
                        <label for="email_feild"><i class="fas fa-envelope" /> البريد الإلكتروني</label>
                    </FloatLabel>
                    <small v-if="fieldErrors.email" class="text-red-500 text-xs">{{ fieldErrors.email }}</small>
                    <small v-else class="text-gray-400 text-xs">اختياري</small>
                </div>

                <div class="col">
                    <FloatLabel variant="on">
                        <InputText id="phone_feild" v-model="localForm.phone" fluid />
                        <label for="phone_feild">
                            رقم الهاتف
                            <span v-if="!isEditMode" class="text-red-500">*</span>
                        </label>
                    </FloatLabel>
                    <small class="text-gray-400 text-xs">
                        <span v-if="!isEditMode">مطلوب عند الإنشاء</span>
                        <span v-else>اختياري عند التعديل</span>
                    </small>
                </div>
            </div>

            <!-- Status + Role + Department -->
            <div class="grid">
                <div class="col">
                    <FloatLabel variant="on">
                        <Select
                            id="status_feild"
                            v-model="localForm.status"
                            :options="[{ label: 'مفعل', value: 'active' }, { label: 'معطل', value: 'inactive' }]"
                            optionValue="value"
                            optionLabel="label"
                            class="w-full"
                        />
                        <label for="status_feild">
                            الحالة <span class="text-red-500">*</span>
                        </label>
                    </FloatLabel>
                </div>

                <div class="col">
                    <FloatLabel variant="on">
                        <Select
                            id="role_feild"
                            v-model="localForm.role"
                            :options="roles"
                            filter
                            optionLabel="name"
                            optionValue="id"
                            class="w-full"
                            :class="{ 'p-invalid': !localForm.role && isSaving }"
                        />
                        <label for="role_feild">
                            الصلاحية <span class="text-red-500">*</span>
                        </label>
                    </FloatLabel>
                    <small class="text-gray-400 text-xs">مطلوب</small>
                </div>

                <div class="col">
                    <FloatLabel variant="on">
                        <Select
                            id="department_feild"
                            v-model="localForm.department_id"
                            :options="departments"
                            filter
                            optionLabel="name"
                            optionValue="id"
                            class="w-full"
                            showClear
                        />
                        <label for="department_feild">القسم</label>
                    </FloatLabel>
                    <small class="text-gray-400 text-xs">اختياري</small>
                </div>
            </div>

        </div>

        <template #footer>
            <Button
                label="إلغاء"
                icon="fas fa-times"
                severity="secondary"
                @click="$emit('update:visible', false)"
            />
            <Button
                :label="isEditMode ? 'حفظ التعديلات' : 'إضافة'"
                icon="fas fa-check"
                :loading="isSaving"
                :disabled="isSaveDisabled"
                @click="handleSave"
            />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import type { UserFormData } from "../../users/usersService";

import Dialog     from "primevue/dialog";
import Button     from "primevue/button";
import InputText  from "primevue/inputtext";
import Password   from "primevue/password";
import Select     from "primevue/select";
import FloatLabel from "primevue/floatlabel";

// ── Props & Emits ──
const props = defineProps<{
    visible:    boolean;
    isEditMode: boolean;
    form:       UserFormData;
    departments: any[];
    roles:       any[];
    isSaving:    boolean;
}>();

const emit = defineEmits<{
    'update:visible': [value: boolean];
    save:             [payload: any];
    hide:             [];
}>();

// ── Local form (نسخة محلية لتجنب تعديل الـ props مباشرة) ──
const localForm = ref<UserFormData>({ ...props.form });

watch(() => props.form, (val) => {
    localForm.value = { ...val };
}, { deep: true });

// ── Field Errors ──
const fieldErrors = reactive({ username: '', email: '' });

watch(() => localForm.value.username, () => { fieldErrors.username = ''; });

// ── Password ──
const passwordFocused = ref(false);

const passwordChecks = computed(() => {
    const p = localForm.value.password ?? '';
    return {
        minLength:    p.length >= 8,
        hasUppercase: /[A-Z]/.test(p),
        hasLowercase: /[a-z]/.test(p),
        hasNumber:    /[0-9]/.test(p),
        hasSpecial:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
    };
});

const passwordErrors = computed(() =>
    Object.values(passwordChecks.value).filter(v => !v)
);

const isPasswordValid = computed(() =>
    Object.values(passwordChecks.value).every(v => v)
);

// ── Save disabled condition ──
const isSaveDisabled = computed(() => {
    if (!localForm.value.name || !localForm.value.username || !localForm.value.status || !localForm.value.role) return true;
    if (!props.isEditMode) {
        if (!localForm.value.password || !localForm.value.phone) return true;
        if (!isPasswordValid.value) return true;
        if (localForm.value.password !== localForm.value.password_confirmation) return true;
    }
    if (props.isEditMode && localForm.value.password && !isPasswordValid.value) return true;
    return false;
});

// ── Handle Save ──
const handleSave = () => {
    // بناء الـ payload
    const payload: any = {
        name:          localForm.value.name,
        username:      localForm.value.username,
        status:        localForm.value.status,
        role:          localForm.value.role,
        department_id: localForm.value.department_id ?? null,
        parent_id:     localForm.value.parent_id ?? null,
    };

    if (!props.isEditMode) {
        // إنشاء: أرسل كل الحقول
        payload.password              = localForm.value.password;
        payload.password_confirmation = localForm.value.password_confirmation;
        payload.phone                 = localForm.value.phone;
        if (localForm.value.email) payload.email = localForm.value.email;
    } else {
        // تعديل: أرسل الاختيارية فقط إذا فيها قيمة
        if (localForm.value.email)    payload.email = localForm.value.email;
        if (localForm.value.phone)    payload.phone = localForm.value.phone;
        if (localForm.value.password) {
            payload.password              = localForm.value.password;
            payload.password_confirmation = localForm.value.password_confirmation;
        }
    }

    emit('save', payload);
};
</script>