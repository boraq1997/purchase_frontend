<template>
    <div>
        <div class="flex gap-3 mb-4">
            <IconField>
                <InputIcon class="fa-solid fa-search" />
                <InputText v-model="serachQuery" placeholder="بحث..." />
            </IconField>

            <Select v-model="priorityFilter" :options="priorityOptions" placeholder="اهمية الطلب" optionLabel="name" optionValue="value"/>

            <Select v-model="statusFilter" :options="statusOptions" placeholder="حالة الطلب" optionLabel="name" optionValue="value"/>

            <Select v-model="departmentFilter" :options="departments" placeholder="حسب القسم" optionLabel="name" optionValue="id"/> 
        </div>

        <Card 
            v-for="purchase in paginationPurchases" 
            :key="purchase.id" 
            class="mb-4 surface-card border-round-lg overflow-hidden"
            style="border: 1px solid var(--surface-border);"
        >
            <template #title>
                <div class="flex justify-content-between align-items-start gap-3 p-0">
                    <div class="flex-1">
                        <div class="flex align-items-center gap-2 mb-2">
                            <span class="text-sm font-medium text-500">#{{ purchase.id }}</span>
                            <div class="border-circle bg-primary" style="width: 4px; height: 4px;"></div>
                            <span class="text-sm text-primary font-semibold">{{ purchase.request_number }}</span>
                        </div>
                        <h3 class="text-xl font-semibold text-900 m-0 line-height-3">{{ purchase.title }}</h3>
                    </div>

                    <Button 
                        icon="pi pi-ellipsis-v" 
                        text 
                        rounded
                        severity="secondary"
                        @click="toggle($event, purchase.id)"
                        style="width: 2.5rem; height: 2.5rem;"
                    />

                    <Menu
                        :ref="el => setMenuRef(el, purchase.id)"
                        :model="items"
                        :popup="true"
                        dir="rtl"
                    />
                </div>
            </template>
    
            <template #content>
                <div class="pt-0">
                    <p class="text-600 line-height-3 m-0 mb-4">{{ purchase.description }}</p>

                    <div class="flex flex-wrap gap-3 mb-4">
                        <div class="flex align-items-center gap-2 px-3 py-2 border-round surface-100">
                            <i class="fas fa-calendar text-sm text-600"></i>
                            <span class="text-sm text-700">{{ purchase.created_at }}</span>
                        </div>

                        <div class="flex align-items-center gap-2 px-3 py-2 border-round surface-100">
                            <i class="fa-solid fa-dollar-sign text-sm text-600"></i>
                            <span class="text-sm font-medium text-700">
                                {{ purchase.total_estimated_cost || 'غير محدد' }}
                            </span>
                        </div>

                        <div class="flex align-items-center gap-2 px-3 py-2 border-round surface-100">
                            <i class="fa-solid fa-cubes text-sm text-600"></i>
                            <span class="text-sm text-700">{{ purchase.items.length }} مادة</span>
                        </div>

                        <div class="flex align-items-center gap-2 px-3 py-2 border-round surface-100">
                            <i class="fa-solid fa-building text-sm text-600"></i>
                            <span class="text-sm text-700">{{ purchase.department.name }}</span>
                        </div>
                    </div>

                    <div class="flex justify-content-between align-items-center pt-3" style="border-top: 1px solid var(--surface-border);">
                        <div 
                            class="flex align-items-center gap-2 cursor-pointer"
                            @click="createdByToggle($event, purchase.id)"
                        >
                            <div class="border-circle bg-primary-100 flex align-items-center justify-content-center" 
                                style="width: 32px; height: 32px;">
                                <span class="text-primary font-semibold text-sm">
                                    {{ purchase.creator.name.charAt(0) }}
                                </span>
                            </div>
                            <div>
                                <div class="text-xs text-500">أضيف بواسطة</div>
                                <div class="text-sm font-medium text-900">{{ purchase.creator.name }}</div>
                            </div>
                        </div>

                        <div class="flex align-items-center gap-2 px-3 py-2 border-round"
                            :style="`background: var(--${getStatusData(purchase.status_type).severity}-50); border: 1px solid var(--${getStatusData(purchase.status_type).severity}-200);`">
                    
                            <Tag 
                                :icon="getStatusData(purchase.status_type).icon" 
                                :value="getStatusData(purchase.status_type).label "
                                :severity="getStatusData(purchase.status_type).severity"
                                :style="`color: var(--${getStatusData(purchase.status_type).severity}-600);`"
                                class="text-sm"
                            />

                        </div>
                    </div>

                    <Popover :ref="el => setPopoverRef(el, purchase.id)">
                        <div style="width: 280px;">
                            <div class="p-3 surface-50" style="border-bottom: 1px solid var(--surface-border);">
                                <div class="flex align-items-center gap-3">
                                    <div class="border-circle bg-primary flex align-items-center justify-content-center" 
                                        style="width: 48px; height: 48px;">
                                        <span class="text-white font-bold text-xl">
                                            {{ purchase.creator.name.charAt(0) }}
                                        </span>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-900 mb-1">{{ purchase.creator.name }}</div>
                                        <div class="text-xs text-500">@{{ purchase.creator.username }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="p-3">
                                <div class="flex align-items-center gap-3 mb-3">
                                    <i class="fas fa-envelope text-600"></i>
                                    <span class="text-sm text-700">{{ purchase.creator.email }}</span>
                                </div>
                            </div>
                        </div>
                    </Popover>
                </div>
            </template>
        </Card>

        <Paginator 
            :rows="itemsPerPage" 
            :totalRecords="filteredPurchases.length" 
            @page="onPageChange"
        />

        <purchaseDetails
            v-if="showDetailsDialog && selectedPurchaseId"
            :purcaseId="selectedPurchaseId"
            @close="showDetailsDialog = false"
        />

        <purchaseAction
            v-if="showActionsDialog && selectedPurchaseId"
            :purchaseId="selectedPurchaseId"
            @close="showActionsDialog = false"
        />
    </div>
</template>

<script lang="ts" setup>
import Card from 'primevue/card';
import { ref, onMounted, computed } from "vue";
import Menu from 'primevue/menu';
import Button from "primevue/button";
import purchaseRequestsService from "./purchase-requestsService";
import Tag from 'primevue/tag';
import Popover from 'primevue/popover';
import Listbox from 'primevue/listbox';
import purchaseDetails from './purchaseDetails.vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import AuthServices from "../auth/auth-service";
import Select from 'primevue/select';
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Paginator from 'primevue/paginator';
import InputText from 'primevue/inputtext';
import DepartmentService from '../departments/DepartmentService';
import purchaseAction from './purchaseAction.vue';

const toast = useToast();
const confirm = useConfirm();
const isConfirming = ref(false);
const isLoading = ref(false);
const departments = ref<any[]>([]);

// FILTERING
const serachQuery = ref("");
const priorityFilter = ref("");
const statusFilter = ref("");
const departmentFilter = ref("");

// PAGINATION
const currentPage = ref(0);
const itemsPerPage = ref(5);

const priorityOptions = ref([
    {name: "الاهمية (الكل)", value: ""},
    {name: "عالي", value: "high"},
    {name: "متوسط", value: "medium"},
    {name: "طبيعي", value: "low"},
]);

const statusOptions = ref([
    {name: "الحالة (الكل)", value: ""},
    {name: "معلقة", value: "pending"},
    {name: "موافقة", value: "approved"},
    {name: "مرفوضة", value: "rejected"},
    {name: "مكتملة", value: "completed"},
])

const filteredPurchases = computed(()=>{
    let data = allPurchase.value;

    if (serachQuery.value) {
        const q = serachQuery.value.toLocaleLowerCase();
        data = data.filter(p=>
            p.title?.toLocaleLowerCase().includes(q) ||
            p.description?.toLocaleLowerCase().includes(q) ||
            p.request_number?.toLocaleLowerCase().includes(q) ||
            p.creator?.name?.toLocaleLowerCase().includes(q)
        );
    }

    if (priorityFilter.value) {
        data = data.filter(p => p.priority === priorityFilter.value);
    }

    if (statusFilter.value) {
        data = data.filter(p=>p.status_type === statusFilter.value);
    }

    if (departmentFilter.value) {
        data = data.filter(p=>p.department?.id == departmentFilter.value);
    }
    return data;
});

const paginationPurchases = computed(()=>{
    const start = currentPage.value * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredPurchases.value.slice(start, end);
});

const onPageChange = (event: any) =>{
    currentPage.value = event.page;
};

// تخزين جميع المينيوز حسب رقم الطلب
const menuRefs = ref<{ [key: number]: any }>({});
const popoverRefs = ref<{ [key: number]: any }>({});
const allPurchase = ref<any[]>([]);
const userInfo = AuthServices.getUser();

const showDetailsDialog = ref(false);
const showActionsDialog = ref(false);
const selectedPurchaseId = ref<number|null>(null);

const emit = defineEmits(["edit"]);

const setMenuRef = (el: any, id: number) => {
    if (el) {
        menuRefs.value[id] = el;
    }
};

const setPopoverRef = (el: any, id: number) => {
    if (el) {
        popoverRefs.value[id] = el;
    }
};

const createdByToggle = (event: any, id: number) => {
    const pop = popoverRefs.value[id];
    if (pop) {
        pop.toggle(event);
    }
};


const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
});

const fetchAllPurchase = async()=>{
    try {
        isLoading.value = true;
        if (userInfo?.department?.id) {
            const response = await purchaseRequestsService.getByDepartment(userInfo.department.id);
            allPurchase.value = response;
        } else {
            const response = await purchaseRequestsService.getAll();
            allPurchase.value = response;
            fetchAllDepartments()
        }
    } catch (err: any) {
        console.log(err);
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "فشل في جلب بيانات طلبات الشراء",
            life: 3000,
        });
    } finally {
        isLoading.value = false;
    }
}

const openDetailsDialog = (id: number) => {
    selectedPurchaseId.value = id;
    showDetailsDialog.value = true;
}

const openActionsDialog = (id: number) => {
    selectedPurchaseId.value = id;
    showActionsDialog.value = true;
}

const getStatusData = (status: string) => {
    switch (status) {
        case "pending":
            return {
                label: "معلقة",
                icon: "fas fa-hourglass-half",
                severity: "danger" // اللون السماوي في PrimeVue
            };

        case "approved":
            return {
                label: "تمت الموافقة",
                icon: "fas fa-check-double",
                severity: "success" // اللون الأخضر
            };

        case "rejected":
            return {
                label: "مرفوضة",
                icon: "fas fa-times-circle",
                severity: "warning" // اللون الأحمر
            };

        default:
            return {
                label: "غير معروف",
                icon: "fas fa-question-circle",
                severity: "info"
            };
    }
};

const items = ref<any[]>([]);

const toggle = (event: any, id: number) => {
    // إعادة بناء القائمة حسب الطلب المختار
    items.value = [
        {
            label: 'عرض التفاصيل',
            icon: 'fas fa-eye',
            command: () => openDetailsDialog(id)
        },
        {
            label: 'حذف',
            icon: 'fas fa-trash-alt',
            command: () => cionfirmDeletePurchase(id)
        },
        {
            label: 'تعديل',
            icon: 'fas fa-edit',
            command: () => emit('edit', id)
        },
        {
            label: 'المواد',
            icon: 'fas fa-cubes',
            command: () => console.log("items clicked", id)
        },
        {
            label: 'الاجراءات',
            icon: 'fa-solid fa-arrow-up-right-from-square',
            command: () => openActionsDialog(id)
        }
    ];

    const menu = menuRefs.value[id];
    if (menu) {
        menu.toggle(event);
    }
};

const getPriorityClass = (priority: string) => {
    switch (priority) {
        case 'high':
            return 'priority-high';
        case 'medium':
            return 'priority-medium';
        default:
            return 'priority-normal';
    }
}

const cionfirmDeletePurchase = (purchaseId: number) => {
    if (isConfirming.value) return;
    confirm.require({
        message: `هل أنت متأكد من حذف طلب الشراء ؟`,
        header: "تأكيد الحذف",
        icon: "pi pi-exclamation-triangle text-yellow-500",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass:"p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass:"p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: async()=>{
            try {
                await purchaseRequestsService.delete(purchaseId);
                toast.add({
                    severity: 'success',
                    summary: "تم الحذف",
                    detail: `تم حذف الطلب  بنجاح`,
                    life: 3000
                });
            } catch (err) {
                console.log(err);
                toast.add({
                    severity: 'error',
                    summary: 'رسالة خطاء',
                    detail: `حدث خطاء ما اثناء حذف بيانات طلب الشراء  `,
                    life: 3000
                });
            } finally {
                isConfirming.value = false;
                fetchAllPurchase()
            }
        },
        reject: ()=>isConfirming.value = false
    })
}

const fetchAllDepartments = async()=>{
    try {
        const response = await DepartmentService.getAll();
        departments.value = response;
    } catch (err) {
        console.log(err);
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء اثناء جلب الاقسام"
        });
    }
}

onMounted(()=>{
    fetchAllPurchase()
});
</script>

<style scoped>
:deep(.p-popover-content) {
    padding: 0 !important;
}

.priority-high {
  border-right: 10px solid #ff3b30 !important;
}

.priority-medium {
  border-right: 10px solid #ffa500 !important;
}

.priority-normal {
  border-right: 10px solid #d1d5db !important;
}
</style>