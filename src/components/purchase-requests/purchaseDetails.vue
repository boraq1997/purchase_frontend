<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="تفاصيل طلب الشراء"
    :draggable="false"
    @hide="closeDialog"
    :style="{width: '80vw'}"
    dir="rtl"
    maximizable
  >
    <!-- LOADING -->
    <div v-if="isLoading" class="text-center py-6">
      <font-awesome-icon
        icon="fa-solid fa-spinner"
        class="animate-spin text-purple-600 text-3xl"
      />
      <p class="mt-3 text-gray-600">جاري تحميل تفاصيل الطلب...</p>
    </div>

    <div class="card">
      <Timeline align="alternate" class="customized-timeline">
        <template #marker="slotProps">
          MARKER
        </template>
        <template #content="slotProps">
          CONTENT
        </template>
      </Timeline>
    </div>

    <!-- FOOTER -->
    <template #footer>
      <Button
        label="إغلاق"
        icon="fa-solid fa-xmark"
        class="p-button-secondary"
        @click="closeDialog"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import purchaseRequestsService from "./purchase-requestsService";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Timeline from 'primevue/timeline';

interface Props {
  purcaseId: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits(["close"]);

const visible = ref(false);
const purchase = ref<any>(null);
const isLoading = ref(false);

const fetchPurchase = async (id: number) => {
  try {
    isLoading.value = true;
    purchase.value = await purchaseRequestsService.getById(id);
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// تحميل التفاصيل عند تغيير ID
watch(
  () => props.purcaseId,
  async (id) => {
    if (!id) return;
    visible.value = true;
    await fetchPurchase(id);
  },
  { immediate: true }
);

const closeDialog = () => {
  visible.value = false;
  emit("close");
};

// معالجة الحالة
const getStatusData = (status: string) => {
  switch (status) {
    case "pending":
      return {
        label: "معلقة",
        icon: "fas fa-hourglass-half",
        severity: "info",
      };
    case "approved":
      return {
        label: "تمت الموافقة",
        icon: "fas fa-check-double",
        severity: "success",
      };
    case "rejected":
      return {
        label: "مرفوضة",
        icon: "fas fa-times-circle",
        severity: "danger",
      };
    default:
      return {
        label: "غير معروف",
        icon: "fas fa-question-circle",
        severity: "secondary",
      };
  }
};

const statusData = computed(() =>
  purchase.value ? getStatusData(purchase.value.status_type) : {}
);
</script>

<style scoped></style>