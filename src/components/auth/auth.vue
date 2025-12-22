<template>
    <div class="card">
        <Card class="flex flex-column row-gap-3 shadow-5 loginForm">
            <template #title>تسجيل الدخول</template>
            <template #content>
                <div class="flex flex-column row-gap-3">
                    <IconField>
                        <InputIcon class="fas fa-user-tag" />
                        <InputText v-model="username" placeholder="البريد الإلكتروني" fluid />
                    </IconField>

                    <IconField>
                        <InputIcon class="fas fa-lock" />
                        <Password v-model="password" toggleMask placeholder="كلمة المرور" :feedback="false" fluid />
                    </IconField>

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

const isLoading = ref(false);
const toast = useToast();

const username = ref();
const password = ref();
const isLoginDisabled = computed(()=> !username.value || !password.value);

const handleLogin = async()=>{
    isLoading.value = true;
    try {
        const response = await AuthServices.login({
            username: username.value,
            password: password.value
        });

        if (response.token) {
            toast.add({ severity: 'success', summary: 'نجاح', detail: 'تم تسجيل الدخول بنجاح', life: 3000 });
            router.push('/home');
        }
    } catch (err) {
        if (err && typeof err === 'object' && 'response' in err) {
            const axiosError = err as any;
            toast.add({severity: 'error', summary: 'رسالة خطاء', detail: axiosError.response?.data?.message, life: 3000})
        } else {
            toast.add({severity: 'error', summary: 'خطاء', detail: 'حدث خطاء ما راجع الconsole الخاص بالمتصفح', life: 3000})
            console.log(err);
        } 
    } finally {
        isLoading.value = false
    }
}

onMounted(()=>{
    const token = localStorage.getItem('auth_token');
    if (token) {
        router.push('/home');
    }
})

</script>

<style scoped>
.loginForm {
  width: 350px;
  border-radius: 8px;
  margin: auto;
  margin-top: 25vh;
}
</style>