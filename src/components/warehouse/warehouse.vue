<template>

</template>
<script lang="ts" setup>
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

import warehouseService from "./warehouseService";
import purchaseRequestsService from "../purchase-requests/purchase-requestsService";
import { FilterMatchMode } from "@primevue/core/api";

/* =============================
   Refs & Reactive State
============================= */
const toast = useToast();
const confirm = useConfirm();

const allWareHouse = ref<any[]>([]);

</script>
<style scoped>

</style>