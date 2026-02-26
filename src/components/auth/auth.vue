<template>
    <div class="card">
        <Card class="flex flex-column row-gap-3 shadow-5 loginForm p-1">
            <template #title>
                <div class="text-center mb-4">
                    <Avatar image="/login_logo.png" class="mr-2" size="xlarge" shape="circle" />
                    <h3>تسجيل الدخول</h3>
                </div>
            </template>
            <template #content>
                <div class="flex flex-column">
                    <IconField class="mb-4">
                        <InputIcon class="fas fa-user-tag" />
                        <InputText 
                            v-model="username" 
                            placeholder="البريد الإلكتروني"
                            autocomplete="username"
                            @keyup.enter="handleLogin"
                            fluid 
                        />
                    </IconField>

                    <IconField class="mb-2">
                        <InputIcon class="fas fa-lock" />
                        <Password 
                            v-model="password" 
                            toggleMask 
                            placeholder="كلمة المرور" 
                            :feedback="false"
                            autocomplete="current-password"
                            @keyup.enter="handleLogin"
                            fluid 
                        />
                    </IconField>

                    <Button label="هل نسيت كلمة المرور؟" class="mb-3 align-self-start" variant="link" />

                    <Button 
                        type="submit"
                        @click="handleLogin"
                        severity="primary"
                        label="الدخول"
                        class="block p-button-sm" 
                        :disabled="isLoginDisabled"
                        :loading="isLoading"
                        icon="pi pi-sign-in"
                    />
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Card from 'primevue/card';
import AuthServices from "./auth-service";
import router from "../../router";
import { useToast } from "primevue/usetoast";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { resolveMessages } from "../services/messageResolver";
import Avatar from 'primevue/avatar';

const isLoading = ref(false);
const toast = useToast();

const username = ref('');
const password = ref('');
const isLoginDisabled = computed(() => !username.value || !password.value);

const handleLogin = async () => {
    if (isLoginDisabled.value || isLoading.value) return;
    
    isLoading.value = true;
    try {
        const response = await AuthServices.login({
            username: username.value,
            password: password.value
        });

        if (response.token) {
            toast.add({
                severity: 'success', 
                summary: 'نجاح', 
                detail: 'تم تسجيل الدخول بنجاح', 
                life: 3000 
            });
            router.push('/home');
        }
    } catch (err) {
        if (err && typeof err === 'object' && 'response' in err) {
            const axiosError = err as any;
            const messageKey = axiosError.response?.data?.message;
            const message = resolveMessages(messageKey);

            toast.add({
                severity: 'error', 
                summary: 'خطأ', 
                detail: message, 
                life: 3000
            });
        } else {
            toast.add({
                severity: 'error', 
                summary: 'خطأ', 
                detail: 'حدث خطأ ما، راجع الـ Console الخاص بالمتصفح', 
                life: 3000
            });
            console.error(err);
        } 
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        router.push('/home');
    }
});
</script>

<style scoped>
.loginForm {
  width: 400px;
  border-radius: 8px;
  margin: auto;
  margin-top: 25vh;
}
</style>