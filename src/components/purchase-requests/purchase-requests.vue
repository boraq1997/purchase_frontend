<template>
    <div class="card" dir="rtl">
        <!-- ============================= -->
        <!-- Breadcrumb -->
        <!-- ============================= -->
        <div class="card flex justify-center mt-3 mb-3">
            <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems"/>
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

        <div class="grid mt-3 mb-3">
          <div class="col counting-cards" style="background-color: #0ABAB5;">
            <h2>طلبات غير مكتملة</h2>
            <p>جميع الطلبات التي تحت الاجراء الخاصه بالقسم</p>
            <Tag icon="fas fa-truck-ramp-box" severity="contrast" value="30"></Tag>
          </div>

          <div class="col counting-cards" style="background-color: #FF8F8F;">
            <h2>طلبات لدى بيان الحاجة</h2>
            <p>الطلبات الخاصه بالقسم التي لدى لجنة بيان الحاجة</p>
            <Tag icon="fas fa-truck-ramp-box" severity="contrast" value="30"></Tag>
          </div>

          <div class="col counting-cards" style="background-color: #6FE6FC;">
            <h2>طلبات لدى اللجنة</h2>
            <p>الطلبات التي لدى لجنة المشتريات</p>
            <Tag icon="fas fa-truck-ramp-box" severity="contrast" value="30"></Tag>
          </div>

          <div class="col counting-cards" style="background-color: #EC7FA9;">
            <h2>جميع الطلبات</h2>
            <p>جميع الطلبات التي تم طلبها من قبل القسم</p>
            <Tag icon="fas fa-truck-ramp-box" severity="contrast" value="30"></Tag>
          </div>
        </div>

        <div class="flex justify-between mb-3">
            <Button
                class="p-button-sm bg-teal-500"
                label="طلب شراء"
                icon="fas fa-plus"
                @click="openAddEditPurchaseDialog()"
            />
        </div>

        <Dialog
          v-model:visible="addEditPurchaseVisible"
          :header="isEditMode ? 'تعديل بيانات الطلب' : 'اضافة طلب جديد'"
          :style="{width: '80vw'}"
          modal
          dir="rtl"
          maximizable
        >
          <addNewPurchaseForm
            ref="purchaseFormRef"
            :user="userInfo"
            :isEdit="isEditMode"
            :editData="editPurchaseData"
            :departments="departments"  
            @saved="handleSavePurchase"
            @close="addEditPurchaseVisible = false"
        />

          <template #footer>
            <div class="flex justify-end gap-2">

              <Button
                label="إلغاء"
                class="p-button-secondary"
                @click="addEditPurchaseVisible = false"
              />

              <Button
                label="حفظ الطلب"
                class="p-button-success"
                @click="purchaseFormRef?.saveRequest()"
              />
              
            </div>
          </template>
        </Dialog>

        <showAllPurchases @edit="openAddEditPurchaseDialog"/>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import purchaseRequestsService from "./purchase-requestsService";
import Tag from 'primevue/tag';
import addNewPurchaseForm from "./addNewPurchaseForm.vue";
import Dialog from "primevue/dialog";
import showAllPurchases from "./showAllPurchases.vue";
import AuthServices from "../auth/auth-service";

/**
 * =============================
 *  Reactive State
 * =============================
 */
const toast = useToast();
const isLoading = ref(false);
const isEditMode = ref(false);
const addEditPurchaseVisible= ref(false);
const userInfo = AuthServices.getUser();

const purchaseFormRef = ref();

// Breadcrumb
const breadcrumbHome = ref({ icon: "pi pi-home", to: "/" });
const breadcrumbItems = ref([
  { label: "الرئيسية", to: "/" },
  { label: "طلبات الشراء", to: "/users" },
]);

const formatDate = (value: string) => new Date(value).toLocaleDateString("ar-EG");

// const allPurchase = ref<any[]>([]);
const editPurchaseData = ref(null);

const openAddEditPurchaseDialog = async (id?: number) => {
  isEditMode.value = !!id;

  if (id) {
    isLoading.value = true;
    try {
      const response = await purchaseRequestsService.getById(id);
      editPurchaseData.value = response;
    } catch (err) {
      console.log(err);
    } finally {
      isLoading.value = false;
    }

    addEditPurchaseVisible.value = true;
  } else {
    editPurchaseData.value = null;
    addEditPurchaseVisible.value = true;
  }
};


const handleSavePurchase = async (data: any) => {
  try {
    if (isEditMode.value) {
      await purchaseRequestsService.update(data.id, data);
    } else {
      await purchaseRequestsService.create(data);
    }

    addEditPurchaseVisible.value = false;

    toast.add({
      severity: "success",
      summary: "رسالة نجاح",
      detail: isEditMode.value ? "تم التعديل بنجاح" : "تم الحفظ بنجاح",
      life: 3000
    });

  } catch (err) {
    toast.add({
      severity: "error",
      summary: "رسالة خطأ",
      detail: "حدث خطأ أثناء حفظ بيانات طلب الشراء",
      life: 3000
    });
  }
};

onMounted(() => {
});
</script>

<style scoped>
.counting-cards {
  padding: 10px;
  height: 150px;
  border: 1px solid #CCC;
  border-radius: 5px;
  margin-left: 10px;
  background-color: #FCC;
  line-height: 20px;
}

.purchaseStoreModal {
  border: 1px solid #e9e9e955;
  border-radius: 5px;
  padding: 10px;
}
</style>