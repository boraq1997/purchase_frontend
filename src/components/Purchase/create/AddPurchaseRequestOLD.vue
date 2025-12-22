FILE: purchase/create/AddPurchaseRequest.vue
<script setup lang="ts">
// import { ref } from 'vue';
// import Card from 'primevue/card';
// import InputText from 'primevue/inputtext';
// import Textarea from 'primevue/textarea';
// import Dropdown from 'primevue/dropdown';
// import Button from 'primevue/button';
// import Divider from 'primevue/divider';
// import Select from 'primevue/select';


// // النموذج الأساسي
// const form = ref({
//     title: '',
//     description: '',
//     department_id: null,
//     user_id: null,
//     priority: 'medium',
//     items: []
// });

// // الأقسام (سيتم جلبها API لاحقاً)
// const departments = ref([]);

// // المستخدم (سيتم تعيينه تلقائياً)
// const user = ref({ id: 1, name: "Boraq Nezar" });

// // الأولويات
// const priorities = [
//     { label: 'عالية', value: 'high' },
//     { label: 'متوسطة', value: 'medium' },
//     { label: 'منخفضة', value: 'low' }
// ];

// // إرسال الطلب (سيتم تنفيذه لاحقاً)
// function submit() {
//     console.log("Submitting form:", form.value);
// }
</script>

<template>
    <div class="p-4">

        <Card class="p-3 shadow-3 border-round-2xl">

            <template #title>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-plus-circle text-primary text-2xl"></i>
                    <span class="text-2xl font-bold">إضافة طلب لاقلاقفشراء جديد</span>
                </div>
            </template>

            <template #content>

                <!-- ========== عنوان الطلب ========== -->
                <div class="mb-4">
                    <label class="block mb-2 font-semibold text-900">عنوان الطلب</label>
                    <InputText v-model="form.title" class="w-full" placeholder="أدخل عنوان الطلب" />
                </div>

                <!-- ========== وصف الطلب ========== -->
                <div class="mb-4">
                    <label class="block mb-2 font-semibold text-900">الوصف</label>
                    <Textarea v-model="form.description" class="w-full" rows="4" auto-resize placeholder="أدخل وصف الطلب" :maxlength="500" counter />
                </div>

                <!-- ========== القسم + الأولوية ========== -->
                <div class="grid mb-4">
                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-semibold text-900">القسم</label>
                        <Select v-model="form.department_id" filter :options="departments" optionLabel="name" optionValue="id" fluid placeholder="اختر القسم"/>
                    </div>

                    <div class="col-12 md:col-6">
                        <label class="block mb-2 font-semibold text-900">الأولوية</label>
                        <Select v-model="form.priority" :options="priorities" optionLabel="label" optionValue="value" fluid/>
                    </div>
                </div>

                <Divider />

                <!-- ======================== المواد ======================== -->
                <div class="mt-4">
                    <h3 class="text-xl font-bold mb-3">
                        المواد المطلوبة
                    </h3>

                    <!-- لاحقاً: هنا نضيف جدول + زر إضافة مادة -->
                    <p class="text-gray-500">سيتم إضافة جدول المواد هنا في الخطوة التالية.</p>
                </div>

            </template>

            <template #footer>
                <Button label="إرسال الطلب" icon="pi pi-check" class="w-full" @click="submit" />
            </template>

        </Card>

    </div>
</template>

<style scoped></style>