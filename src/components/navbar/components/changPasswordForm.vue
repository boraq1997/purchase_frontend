<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import FloatLabel from 'primevue/floatlabel';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';
import navbarService from '../navbarServices';

const toast = useToast();
const isLoading = ref(false);
const formTouched = ref(false);

interface PasswordFormData {
    old_password: string;
    new_password: string;
    new_password_confirmation: string;
}

const passwordChangeForm = ref<PasswordFormData>({
    old_password: '',
    new_password: '',
    new_password_confirmation: ''
});

const errors = ref<Record<string, string>>({});

const emit = defineEmits<{
    success: [];
    cancel: [];
}>();

// متطلبات كلمة المرور
interface PasswordRequirement {
    id: string;
    label: string;
    test: (password: string) => boolean;
    met: boolean;
}

const passwordRequirements = ref<PasswordRequirement[]>([
    {
        id: 'length',
        label: 'على الأقل 8 أحرف',
        test: (pwd) => pwd.length >= 8,
        met: false
    },
    {
        id: 'uppercase',
        label: 'حرف كبير واحد',
        test: (pwd) => /[A-Z]/.test(pwd),
        met: false
    },
    {
        id: 'lowercase',
        label: 'حرف صغير واحد',
        test: (pwd) => /[a-z]/.test(pwd),
        met: false
    },
    {
        id: 'number',
        label: 'رقم واحد',
        test: (pwd) => /[0-9]/.test(pwd),
        met: false
    },
    {
        id: 'special',
        label: 'رمز خاص (!@#$%)',
        test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
        met: false
    }
]);

// تحديث المتطلبات
const updatePasswordRequirements = () => {
    const password = passwordChangeForm.value.new_password;
    passwordRequirements.value.forEach(req => {
        req.met = req.test(password);
    });
};

watch(() => passwordChangeForm.value.new_password, updatePasswordRequirements);

// قوة كلمة المرور
const passwordStrength = computed(() => {
    const metCount = passwordRequirements.value.filter(r => r.met).length;
    const percentage = (metCount / passwordRequirements.value.length) * 100;

    if (percentage === 0) return { label: 'بدء', percentage: 0, color: '#EF4444' };
    if (percentage <= 40) return { label: 'ضعيفة', percentage, color: '#F59E0B' };
    if (percentage <= 70) return { label: 'متوسطة', percentage, color: '#10B981' };
    return { label: 'قوية', percentage, color: '#10B981' };
});

// التحقق من التطابق
const passwordsMatch = computed(() => {
    if (!passwordChangeForm.value.new_password_confirmation) return null;
    return passwordChangeForm.value.new_password === passwordChangeForm.value.new_password_confirmation;
});

// تفعيل الزر
const canSubmit = computed(() => {
    return (
        passwordChangeForm.value.old_password.trim() &&
        passwordChangeForm.value.new_password.trim() &&
        passwordChangeForm.value.new_password_confirmation.trim() &&
        passwordsMatch.value === true &&
        passwordRequirements.value.filter(r => r.met).length >= 4 &&
        !isLoading.value
    );
});

const validateForm = (): boolean => {
    errors.value = {};
    let isValid = true;

    if (!passwordChangeForm.value.old_password.trim()) {
        errors.value.old_password = 'كلمة المرور الحالية مطلوبة';
        isValid = false;
    }

    if (!passwordChangeForm.value.new_password.trim()) {
        errors.value.new_password = 'كلمة المرور الجديدة مطلوبة';
        isValid = false;
    } else if (passwordRequirements.value.filter(r => !r.met).length > 0) {
        errors.value.new_password = 'كلمة المرور لا تستوفي المتطلبات';
        isValid = false;
    }

    if (!passwordChangeForm.value.new_password_confirmation.trim()) {
        errors.value.new_password_confirmation = 'تأكيد كلمة المرور مطلوب';
        isValid = false;
    } else if (passwordsMatch.value === false) {
        errors.value.new_password_confirmation = 'كلمات المرور غير متطابقة';
        isValid = false;
    }

    if (
        passwordChangeForm.value.old_password === passwordChangeForm.value.new_password &&
        passwordChangeForm.value.old_password
    ) {
        errors.value.new_password = 'يجب أن تكون مختلفة عن الحالية';
        isValid = false;
    }

    return isValid;
};

const updatePassword = async () => {
    formTouched.value = true;

    if (!validateForm()) {
        return;
    }

    isLoading.value = true;

    try {
        await navbarService.updateUserPassword(passwordChangeForm.value);

        toast.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تحديث كلمة المرور بنجاح',
            life: 3000
        });

        resetForm();
        emit('success');
    } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'حدث خطأ أثناء التحديث';

        if (err?.response?.status === 401) {
            errors.value.old_password = 'كلمة المرور الحالية غير صحيحة';
        }

        toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: errorMessage,
            life: 4000
        });

        console.error('Password update error:', err);
    } finally {
        isLoading.value = false;
    }
};

const resetForm = () => {
    passwordChangeForm.value = {
        old_password: '',
        new_password: '',
        new_password_confirmation: ''
    };
    errors.value = {};
    formTouched.value = false;
    passwordRequirements.value.forEach(req => {
        req.met = false;
    });
};

const handleCancel = () => {
    resetForm();
    emit('cancel');
};

const showRequirements = computed(() => passwordChangeForm.value.new_password.length > 0);
</script>

<template>
    <div class="password-form" dir="rtl">
        <!-- Header -->
         <Message
            severity="warn"
            icon="fas fa-user-shield"
            >
                <h3>تحديث كلمة المرور</h3>
                <p>حافظ على أمان حسابك</p>
        </Message>
        

        <!-- Info Message -->
        <Message 
            severity="info" 
            icon="pi pi-info-circle"
            class="info-msg"
        >
            اتبع المتطلبات لإنشاء كلمة مرور قوية
        </Message>

        <!-- Form Fields -->
        <div class="form-fields">
            <!-- Old Password -->
            <div class="field-group">
                <label for="old_password" class="field-label">كلمة المرور الحالية</label>
                <FloatLabel variant="on">
                    <Password 
                        id="old_password"
                        v-model="passwordChangeForm.old_password"
                        toggleMask
                        :feedback="false"
                        @blur="formTouched = true"
                    />
                    <label for="old_password">أدخل كلمتك الحالية</label>
                </FloatLabel>
                <small v-if="formTouched && errors.old_password" class="error-text">
                    <i class="pi pi-exclamation-circle"></i>
                    {{ errors.old_password }}
                </small>
            </div>

            <!-- New Password -->
            <div class="field-group">
                <label for="new_password" class="field-label">كلمة المرور الجديدة</label>
                <FloatLabel variant="on">
                    <Password 
                        id="new_password"
                        v-model="passwordChangeForm.new_password"
                        toggleMask
                        :feedback="false"
                        @blur="formTouched = true"
                    />
                    <label for="new_password">أدخل كلمة جديدة</label>
                </FloatLabel>
                <small v-if="formTouched && errors.new_password" class="error-text">
                    <i class="pi pi-exclamation-circle"></i>
                    {{ errors.new_password }}
                </small>

                <!-- Password Requirements -->
                <transition name="fade">
                    <div v-if="showRequirements" class="requirements-box">
                        <!-- Strength Bar -->
                        <div class="strength-bar">
                            <div 
                                class="strength-progress"
                                :style="{ 
                                    width: `${passwordStrength.percentage}%`,
                                    backgroundColor: passwordStrength.color
                                }"
                            ></div>
                        </div>
                        <small class="strength-text">
                            القوة: <strong :class="passwordStrength.color">{{ passwordStrength.label }}</strong>
                        </small>

                        <!-- Requirements List -->
                        <ul class="requirements-list">
                            <li v-for="req in passwordRequirements" :key="req.id" :class="{ met: req.met }">
                                <i :class="req.met ? 'pi pi-check text-green-400' : 'pi pi-times text-red-500'" class=""></i>
                                <span>{{ req.label }}</span>
                            </li>
                        </ul>
                    </div>
                </transition>
            </div>

            <!-- Confirm Password -->
            <div class="field-group">
                <label for="confirm_password" class="field-label">تأكيد كلمة المرور</label>
                <FloatLabel variant="on">
                    <Password 
                        id="confirm_password"
                        v-model="passwordChangeForm.new_password_confirmation"
                        toggleMask
                        :feedback="false"
                        @blur="formTouched = true"
                    />
                    <label for="confirm_password">أعد إدخال الكلمة</label>
                </FloatLabel>
                <small v-if="formTouched && errors.new_password_confirmation" class="error-text">
                    <i class="pi pi-exclamation-circle"></i>
                    {{ errors.new_password_confirmation }}
                </small>
                <small v-else-if="passwordsMatch === true && passwordChangeForm.new_password_confirmation" class="success-text">
                    <i class="pi pi-check-circle"></i>
                    كلمات المرور متطابقة
                </small>
            </div>
        </div>

        <!-- Buttons -->
        <div class="form-actions">
            <Button 
                label="إلغاء"
                severity="secondary"
                outlined
                @click="handleCancel"
                :disabled="isLoading"
                icon="pi pi-times"
            />
            <Button 
                label="تحديث"
                @click="updatePassword"
                :loading="isLoading"
                :disabled="!canSubmit"
                icon="pi pi-check"
            />
        </div>
    </div>
</template>

<style scoped>
.password-form {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.form-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--surface-border);
}

.header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-300));
    border-radius: 8px;
    color: white;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.header-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
}

.header-desc {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Info Message */
.info-msg {
    font-size: 0.875rem;
}

:deep(.info-msg .p-message-wrapper) {
    gap: 0.75rem;
}

/* Form Fields */
.form-fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
}

:deep(.p-float-label) {
    width: 100%;
}

:deep(.p-password) {
    width: 100%;
}

:deep(.p-password-input) {
    width: 100%;
    padding: 0.75rem 0.875rem;
    font-size: 0.875rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

:deep(.p-password-input:focus) {
    box-shadow: 0 0 0 0.2rem rgba(var(--primary-500-rgb), 0.1);
}

/* Error & Success Messages */
.error-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--red-500);
    margin-top: 0.25rem;
}

.success-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--green-500);
    margin-top: 0.25rem;
}

/* Requirements Box */
.requirements-box {
    padding: 1rem;
    background: var(--surface-section);
    border-radius: 6px;
    border: 1px solid var(--surface-border);
    margin-top: 0.75rem;
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Strength Bar */
.strength-bar {
    width: 100%;
    height: 6px;
    background: var(--surface-border);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.strength-progress {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
    border-radius: 3px;
}

.strength-text {
    display: block;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    margin-bottom: 0.75rem;
}

.strength-text strong {
    color: var(--text-color);
}

/* Requirements List */
.requirements-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.requirements-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    padding: 0.25rem 0;
    transition: color 0.2s ease;
}

.requirements-list li i {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--surface-border);
    color: var(--text-color-secondary);
    font-size: 0.65rem;
    flex-shrink: 0;
}

.requirements-list li.met {
    color: var(--green-500);
}

.requirements-list li.met i {
    background: var(--green-500);
    color: white;
}

/* Form Actions */
.form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--surface-border);
}

:deep(.p-button) {
    padding: 0.5rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.2s ease;
}

:deep(.p-button:disabled) {
    opacity: 0.6;
    cursor: not-allowed;
}

:deep(.p-button-secondary) {
    border-color: var(--surface-border);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive */
@media (max-width: 600px) {
    .password-form {
        gap: 1rem;
    }

    .header-icon {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
    }

    .header-title {
        font-size: 1.1rem;
    }

    .form-actions {
        flex-direction: column-reverse;
        gap: 0.5rem;
    }

    :deep(.p-button) {
        width: 100%;
    }
}
</style>