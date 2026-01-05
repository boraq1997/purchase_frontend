<template>
    <div class="card" dir="rtl">
        <!-- Breadcrumb Navigation -->
        <div class="card flex justify-center mt-3 mb-3">
            <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
        </div>

        <!-- Global Loading Overlay -->
        <div
            v-if="isLoading"
            class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5"
            style="background-color: #2828289c;"
        >
            <div class="text-primary-500 border-round text-center">
                <i class="fa-solid fa-circle-notch fa-spin fa-2xl" style="font-size: 80px;"></i>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid mb-5">
            <!-- Card: Total Operations -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-total surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">إجمالي العمليات</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ meta.total || 0 }}</div>
                            <span class="text-sm text-500">جميع عمليات السجل</span>
                        </div>
                        <div class="icon-container icon-total border-round-lg flex align-items-center justify-content-center">
                            <i class="fas fa-list-check text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-total border-round relative overflow-hidden" style="height: 18px;">
                        <div
                            class="progress-fill-total h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: '100%' }"
                        >
                            100%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card: Successful -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-approved surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">عمليات ناجحة</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ successCount }}</div>
                            <span class="text-sm text-500">تمت بنجاح</span>
                        </div>
                        <div class="icon-container icon-approved border-round-lg flex align-items-center justify-content-center">
                            <i class="fas fa-check-circle text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-approved border-round relative overflow-hidden" style="height: 18px;">
                        <div
                            class="progress-fill-approved h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: successPercentage + '%' }"
                        >
                            {{ successPercentage }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card: Failed -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-rejected surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">عمليات فاشلة</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ failedCount }}</div>
                            <span class="text-sm text-500">فشلت أو أخطاء</span>
                        </div>
                        <div class="icon-container icon-rejected border-round-lg flex align-items-center justify-content-center">
                            <i class="fas fa-times-circle text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-rejected border-round relative overflow-hidden" style="height: 18px;">
                        <div
                            class="progress-fill-rejected h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: failedPercentage + '%' }"
                        >
                            {{ failedPercentage }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card: Active Users -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-pending surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">مستخدمين نشطين</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ uniqueUsersCount }}</div>
                            <span class="text-sm text-500">مستخدمي النظام</span>
                        </div>
                        <div class="icon-container icon-pending border-round-lg flex align-items-center justify-content-center">
                            <i class="fas fa-users text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-pending border-round relative overflow-hidden" style="height: 18px;">
                        <div
                            class="progress-fill-pending h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: usersPercentage + '%' }"
                        >
                            {{ usersPercentage }}%
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <DataTable
            v-model:filters="globalFilters"
            :value="allLogs"
            dataKey="id"
            paginator
            :rows="50"
            filterDisplay="menu"
            :globalFilterFields="['actor.name','actor.role','action','action_label','subject.identifier','module','route']"
            responsiveLayout="scroll"
            class="text-right"
            stripedRows
        >
            <template #header>
                <div class="flex justify-content-between align-items-center flex-wrap gap-3">
                    <div class="flex-1">
                        <FloatLabel variant="on">
                            <InputText 
                                id="global_filter_field" 
                                v-model="globalFilters.global.value" 
                                style="min-width: 30vw;"
                            />
                            <label for="global_filter_field">
                                <i class="fas fa-search ml-2"/> بحث شامل في السجل...
                            </label>
                        </FloatLabel>
                        <small class="text-gray-500 text-xs block mt-1">
                            يمكنك البحث في: اسم المستخدم، الصلاحية، العملية، الوحدة، المسار
                        </small>
                    </div>
                    <Button 
                        icon="fas fa-sync" 
                        label="تحديث" 
                        @click="fetchAllLogs"
                        severity="secondary"
                        outlined
                    />
                </div>
            </template>

            <template #empty>
                <div class="text-center p-5">
                    <i class="fas fa-inbox text-gray-400 text-6xl mb-3"></i>
                    <Message severity="warn">لم يتم العثور على عمليات مسجلة</Message>
                </div>
            </template>
            
            <template #loading> 
                <div class="text-center p-5">
                    <i class="fas fa-spinner fa-spin text-primary text-4xl"></i>
                    <p class="mt-3">جاري تحميل بيانات سجل النظام...</p>
                </div>
            </template>

            <Column field="id" sortable style="min-width: 80px;">
                <template #header>
                    <i class="fas fa-hashtag text-gray-500 ml-1"/>
                    الرقم
                </template>
                <template #body="{ data }">
                    <Tag :value="data.id" severity="secondary" />
                </template>
            </Column>

            <Column field="actor.name" sortable style="min-width: 180px;">
                <template #header>
                    <i class="fas fa-user-tie text-gray-500 ml-1"/>
                    المستخدم
                </template>
                <template #body="{ data }">
                    <div class="flex align-items-center gap-2">
                        <i class="fas fa-user-circle text-primary text-xl"></i>
                        <span class="font-semibold">{{ data.actor.name }}</span>
                    </div>
                </template>
            </Column>

            <Column field="action_label" sortable style="min-width: 200px;">
                <template #header>
                    <i class="fas fa-sticky-note text-gray-500 ml-1"/>
                    العملية
                </template>
                <template #body="{ data }">
                    <div class="flex align-items-center gap-2">
                        <i :class="getActionIcon(data.action)" class="text-lg"></i>
                        <span>{{ data.action_label }}</span>
                    </div>
                </template>
            </Column>

            <Column field="status" sortable style="min-width: 120px;">
                <template #header>
                    <i class="fas fa-signal text-gray-500 ml-1"/>
                    الحالة
                </template>
                <template #body="{ data }">
                    <Tag 
                        :value="getStatusLabel(data.status)" 
                        :severity="getStatusSeverity(data.status)"
                        :icon="getStatusIcon(data.status)"
                    />
                </template>
            </Column>

            <Column field="severity" sortable style="min-width: 120px;">
                <template #header>
                    <i class="fas fa-exclamation-triangle text-gray-500 ml-1"/>
                    الأهمية
                </template>
                <template #body="{ data }">
                    <Tag 
                        :value="getSeverityLabel(data.severity)" 
                        :severity="getSeveritySeverity(data.severity)"
                        :icon="getSeverityIcon(data.severity)"
                    />
                </template>
            </Column>

            <Column field="metadata.ip_address" sortable style="min-width: 150px;">
                <template #header>
                    <i class="fa-solid fa-network-wired text-gray-500 ml-1"/>
                    IP
                </template>
                <template #body="{ data }">
                    <code class="text-xs p-2 border-round">
                        {{ data.metadata?.ip_address || 'N/A' }}
                    </code>
                </template>
            </Column>

            <Column field="created_at" sortable style="min-width: 180px;">
                <template #header>
                    <i class="fas fa-clock text-gray-500 ml-1"/>
                    التاريخ والوقت
                </template>
                <template #body="{ data }">
                    <div class="text-sm">
                        <div class="font-semibold">{{ formatDate(data.created_at) }}</div>
                        <div class="text-gray-500">{{ formatTime(data.created_at) }}</div>
                    </div>
                </template>
            </Column>

            <Column style="min-width: 100px;">
                <template #header>
                    <i class="fas fa-cog text-gray-500 ml-1"/>
                    إجراءات
                </template>
                <template #body="{ data }">
                    <Button 
                        icon="fas fa-eye" 
                        label="عرض"
                        @click="openDetailsDialog(data)"
                        severity="info"
                        text
                        size="small"
                    />
                </template>
            </Column>
        </DataTable>

        <!-- Details Dialog -->
        <Dialog 
    v-model:visible="showDetailsDialog" 
    modal 
    :header="dialogTitle"
    :style="{ width: '95vw', maxWidth: '1000px' }"
    :closable="true"
    :draggable="false"
    class="audit-details-dialog"
    dir="rtl"
  >
    <div v-if="selectedLog" class="p-1">
      <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3 border-round shadow-1 bg-primary-reverse border-right-3 border-primary">
        <div class="flex align-items-center gap-3">
          <Avatar :label="selectedLog.actor.name?.charAt(0)" size="large" shape="circle" class="bg-primary text-white" />
          <div>
            <div class="text-xl font-bold line-height-2">{{ selectedLog.action_label }}</div>
            <div class="text-600 text-sm">{{ formatFullDate(selectedLog.created_at) }}</div>
          </div>
        </div>
        <div class="flex gap-2">
          <Tag :value="getStatusLabel(selectedLog.status)" :severity="getStatusSeverity(selectedLog.status)" />
          <Tag :value="getSeverityLabel(selectedLog.severity)" :severity="getSeveritySeverity(selectedLog.severity)" />
        </div>
      </div>

      <TabView class="custom-tabs">
        <TabPanel>
          <template #header>
            <i class="fas fa-info-circle ml-2"></i>
            <span>المعلومات الأساسية</span>
          </template>
          
          <div class="grid mt-2">
            <div class="col-12 md:col-6">
              <div class="surface-card p-3 border-1 border-200 border-round h-full">
                <div class="flex align-items-center mb-3 text-primary">
                  <i class="fas fa-user-tie ml-2"></i>
                  <span class="font-bold">منفذ العملية</span>
                </div>
                <div class="flex flex-column gap-3">
                  <div class="flex justify-content-between border-bottom-1 border-100 pb-2">
                    <span class="text-600">الاسم:</span>
                    <span class="font-medium">{{ selectedLog.actor.name }}</span>
                  </div>
                  <div class="flex justify-content-between border-bottom-1 border-100 pb-2">
                    <span class="text-600">المعرف:</span>
                    <Tag :value="selectedLog.actor.id" severity="secondary" />
                  </div>
                  <div class="flex justify-content-between">
                    <span class="text-600">الدور/الصلاحية:</span>
                    <span class="text-primary font-bold">{{ selectedLog.actor.role || '---' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="surface-card p-3 border-1 border-200 border-round h-full">
                <div class="flex align-items-center mb-3 text-purple-600">
                  <i class="fas fa-bullseye ml-2"></i>
                  <span class="font-bold">الهدف (Subject)</span>
                </div>
                <div v-if="selectedLog.subject" class="flex flex-column gap-3">
                  <div class="flex justify-content-between border-bottom-1 border-100 pb-2">
                    <span class="text-600">النوع:</span>
                    <span class="font-medium">{{ selectedLog.subject.type }}</span>
                  </div>
                  <div class="flex justify-content-between border-bottom-1 border-100 pb-2">
                    <span class="text-600">المعرف:</span>
                    <Tag :value="selectedLog.subject.id" severity="info" />
                  </div>
                  <div class="flex flex-column gap-1">
                    <span class="text-600 text-sm">المعرف الفريد:</span>
                    <code class=" p-1 border-round text-xs overflow-hidden text-overflow-ellipsis">{{ selectedLog.subject.identifier }}</code>
                  </div>
                </div>
                <div v-else class="text-center text-500 py-4">لا يوجد بيانات هدف</div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <template #header>
            <i class="fas fa-server ml-2"></i>
            <span>التفاصيل التقنية</span>
          </template>
          
          <div class="grid mt-2">
            <div class="col-12">
              <div class="surface-ground p-3 border-round grid">
                <div class="col-12 md:col-4">
                  <label class="block text-600 text-sm mb-1">المسار (Route)</label>
                  <code class="text-primary font-bold">{{ selectedLog.route }}</code>
                </div>
                <div class="col-12 md:col-4">
                  <label class="block text-600 text-sm mb-1">طريقة الطلب</label>
                  <Tag :value="selectedLog.method" severity="warning" />
                </div>
                <div class="col-12 md:col-4">
                  <label class="block text-600 text-sm mb-1">عنوان IP</label>
                  <span class="font-medium"><i class="fas fa-map-marker-alt text-400 ml-1"></i>{{ selectedLog.metadata?.ip_address }}</span>
                </div>
              </div>
            </div>
            
            <div class="col-12 mt-2">
              <div class="p-3 border-1 border-200 border-round">
                <h4 class="mt-0 mb-3 text-sm font-bold"><i class="fas fa-desktop ml-2 text-400"></i>بيئة المستخدم</h4>
                <div class="text-sm line-height-3 p-2 border-round border-1 border-100">
                  {{ selectedLog.metadata?.user_agent }}
                </div>
                <div class="flex gap-4 mt-3">
                  <span v-if="selectedLog.metadata?.platform" class="text-sm">
                    <i class="fas fa-microchip text-400 ml-1"></i> <b>المنصة:</b> {{ selectedLog.metadata.platform }}
                  </span>
                  <span v-if="selectedLog.duration_ms" class="text-sm">
                    <i class="fas fa-stopwatch text-400 ml-1"></i> <b>زمن الاستجابة:</b> {{ selectedLog.duration_ms }}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel v-if="hasChanges">
          <template #header>
            <i class="fas fa-exchange-alt ml-2"></i>
            <span>مقارنة البيانات</span>
          </template>
          
          <div class="mt-3">
             <div class="flex flex-wrap gap-2 mb-3">
                <span class="text-sm font-bold w-full">الحقول المعدلة:</span>
                <Chip v-for="field in selectedLog.changed_fields" :key="field" :label="field" icon="fas fa-pen" class="text-xs" />
             </div>

             <div class="grid mt-3">
    <div class="col-12 md:col-6">
        <div class="compare-card old-value-card">
            <div class="compare-header">
                <i class="fas fa-minus-circle"></i>
                <span>القيمة السابقة</span>
            </div>
            <div class="json-wrapper">
                <pre class="json-container">{{ selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : '// لا توجد بيانات' }}</pre>
            </div>
        </div>
    </div>

    <div class="col-12 md:col-6">
        <div class="compare-card new-value-card">
            <div class="compare-header">
                <i class="fas fa-plus-circle"></i>
                <span>القيمة الجديدة</span>
            </div>
            <div class="json-wrapper">
                <pre class="json-container">{{ selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : '// لا توجد بيانات' }}</pre>
            </div>
        </div>
    </div>
</div>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <template #footer>
      <div class="flex justify-content-between align-items-center w-full">
        <div class="text-500 text-xs">
            ID: {{ selectedLog?.id }}
        </div>
        <Button label="إغلاق" icon="fas fa-times" @click="showDetailsDialog = false" severity="secondary" outlined />
      </div>
    </template>
  </Dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import activityService, { type ActivityLog, type ActivityLogFilters } from "./activityService";
import { FilterMatchMode } from "@primevue/core/api";

// PrimeVue Components
import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Tag from 'primevue/tag';
import Dialog from "primevue/dialog";
import FloatLabel from 'primevue/floatlabel';
import Chip from 'primevue/chip';
import Avatar from 'primevue/avatar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const toast = useToast();
const isLoading = ref(true);

const allLogs = ref<ActivityLog[]>([]);
const meta = ref<any>({});
const selectedLog = ref<ActivityLog | null>(null);
const showDetailsDialog = ref(false);

const globalFilters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Breadcrumb configuration
const breadcrumbHome = ref({ icon: "fas fa-house", to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/", icon: "fas fa-house" },
    { label: "سجل النظام", to: "/logs", icon: "fa-solid fa-clock-rotate-left" },
]);

// Computed properties for statistics
const successCount = computed(() => 
    allLogs.value.filter(log => log.status === 'success').length
);

const failedCount = computed(() => 
    allLogs.value.filter(log => log.status === 'failed' || log.status === 'error').length
);

const uniqueUsersCount = computed(() => 
    new Set(allLogs.value.map(log => log.actor.id)).size
);

const successPercentage = computed(() => {
    const total = allLogs.value.length;
    return total > 0 ? Math.round((successCount.value / total) * 100) : 0;
});

const failedPercentage = computed(() => {
    const total = allLogs.value.length;
    return total > 0 ? Math.round((failedCount.value / total) * 100) : 0;
});

const usersPercentage = computed(() => {
    const total = allLogs.value.length;
    const users = uniqueUsersCount.value;
    return total > 0 ? Math.min(Math.round((users / total) * 100), 100) : 0;
});

const dialogTitle = computed(() => 
    selectedLog.value ? `تفاصيل العملية #${selectedLog.value.id}` : 'تفاصيل العملية'
);

const hasChanges = computed(() => 
    selectedLog.value && (
        selectedLog.value.changed_fields || 
        selectedLog.value.old_values || 
        selectedLog.value.new_values
    )
);

// Helper functions
const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        success: 'ناجح',
        failed: 'فشل',
        error: 'خطأ',
        pending: 'قيد الانتظار'
    };
    return labels[status] || status;
};

const getStatusSeverity = (status: string) => {
    const severities: Record<string, any> = {
        success: 'success',
        failed: 'danger',
        error: 'danger',
        pending: 'warn'
    };
    return severities[status] || 'secondary';
};

const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
        success: 'fas fa-check',
        failed: 'fas fa-times',
        error: 'fas fa-exclamation-triangle',
        pending: 'fas fa-clock'
    };
    return icons[status] || 'fas fa-question';
};

const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
        info: 'معلومات',
        warning: 'تحذير',
        error: 'خطأ',
        critical: 'حرج',
        debug: 'تصحيح'
    };
    return labels[severity] || severity;
};

const getSeveritySeverity = (severity: string) => {
    const severities: Record<string, any> = {
        info: 'info',
        warning: 'warn',
        error: 'danger',
        critical: 'danger',
        debug: 'secondary'
    };
    return severities[severity] || 'secondary';
};

const getSeverityIcon = (severity: string) => {
    const icons: Record<string, string> = {
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        critical: 'fas fa-skull-crossbones',
        debug: 'fas fa-bug'
    };
    return icons[severity] || 'fas fa-question';
};

const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
        login: 'fas fa-sign-in-alt text-green-600',
        logout: 'fas fa-sign-out-alt text-orange-600',
        create: 'fas fa-plus-circle text-blue-600',
        update: 'fas fa-edit text-purple-600',
        delete: 'fas fa-trash text-red-600',
        view: 'fas fa-eye text-cyan-600',
        export: 'fas fa-download text-indigo-600',
        import: 'fas fa-upload text-pink-600'
    };
    return icons[action] || 'fas fa-bolt text-gray-600';
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ');
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-IQ');
};

const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const openDetailsDialog = (log: ActivityLog) => {
    selectedLog.value = log;
    showDetailsDialog.value = true;
};

const fetchAllLogs = async () => {
    isLoading.value = true;
    const filters: ActivityLogFilters = {
        actor_type: '',
        action: '',
        status: '',
        severity: '',
        from_date: '',
        to_date: '',
        per_page: 20,
        page: 1,
        q: '',
    };
    
    try {
        const response = await activityService.getAll(filters);
        allLogs.value = response.data;
        meta.value = response.meta;
        toast.add({
            severity: "success",
            summary: "تم التحديث",
            detail: "تم تحميل بيانات السجل بنجاح",
            life: 2000
        });
    } catch (err: any) {
        console.error(err);
        toast.add({
            severity: "error",
            summary: "رسالة خطأ",
            detail: "حدث خطأ ما أثناء جلب بيانات سجل النظام",
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchAllLogs();
});
</script>

<style scoped>

/* Statistics Cards Styles */
.stat-card {
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--card-color-start), var(--card-color-end));
}

.stat-card-total {
    --card-color-start: #3B82F6;
    --card-color-end: #1D4ED8;
}

.stat-card-approved {
    --card-color-start: #10B981;
    --card-color-end: #059669;
}

.stat-card-rejected {
    --card-color-start: #EF4444;
    --card-color-end: #DC2626;
}

.stat-card-pending {
    --card-color-start: #F59E0B;
    --card-color-end: #D97706;
}

.icon-container {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, var(--icon-bg-start), var(--icon-bg-end));
}

.icon-total {
    --icon-bg-start: #DBEAFE;
    --icon-bg-end: #BFDBFE;
    color: #1D4ED8;
}

.icon-approved {
    --icon-bg-start: #D1FAE5;
    --icon-bg-end: #A7F3D0;
    color: #059669;
}

.icon-rejected {
    --icon-bg-start: #FEE2E2;
    --icon-bg-end: #FECACA;
    color: #DC2626;
}

.icon-pending {
    --icon-bg-start: #FEF3C7;
    --icon-bg-end: #FDE68A;
    color: #D97706;
}

.progress-bar {
    background: #E5E7EB;
}

.progress-fill-total {
    background: linear-gradient(90deg, #3B82F6, #1D4ED8);
}

.progress-fill-approved {
    background: linear-gradient(90deg, #10B981, #059669);
}

.progress-fill-rejected {
    background: linear-gradient(90deg, #EF4444, #DC2626);
}

.progress-fill-pending {
    background: linear-gradient(90deg, #F59E0B, #D97706);
}

:deep(.p-datatable) {
    font-size: 0.95rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    transition: all 0.2s;
}

:deep(.p-dialog .p-dialog-header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px 8px 0 0;
}

:deep(.p-dialog .p-dialog-content) {
    border-radius: 0 0 8px 8px;
}

code {
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
}

pre {
    max-height: 200px;
    font-size: 0.8rem;
}

.fa-spin {
    animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.audit-details-dialog :deep(.p-tabview-panels) {
  padding: 1.25rem 0.5rem;
}

.json-container {
  padding: 1rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(0,0,0,0.05);
  direction: ltr; /* JSON data is always LTR */
}

/* تحسين شكل التبويبات */
.custom-tabs :deep(.p-tabview-nav) {
  border-bottom: 2px solid #f4f4f4;
}

.custom-tabs :deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* الحاوية الرئيسية للمقارنة */
.compare-card {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* الهيدر الخاص بكل جانب */
.compare-header {
    padding: 0.75rem 1rem;
    font-weight: bold;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* ألوان الحالة القديمة (أحمر هادئ) */
.old-value-card { border-right: 4px solid #ef4444; }
.old-value-card .compare-header {
    background-color: #fef2f2;
    color: #991b1b;
}

/* ألوان الحالة الجديدة (أخضر هادئ) */
.new-value-card { border-right: 4px solid #22c55e; }
.new-value-card .compare-header {
    background-color: #f0fdf4;
    color: #166534;
}

/* حاوية الـ JSON */
.json-wrapper {
    background-color: #525252; /* خلفية رمادية فاتحة جداً مريحة للعين */
    padding: 1rem;
    flex-grow: 1;
}

.json-container {
    margin: 0;
    font-family: 'Fira Code', 'Courier New', monospace; /* خطوط برمجية واضحة */
    font-size: 13px;
    line-height: 1.6;
    max-height: 350px;
    overflow-y: auto;
    direction: ltr; /* مهم جداً لعرض الـ JSON بشكل صحيح */
    color: #FFF;
    white-space: pre-wrap; /* لضمان عدم خروج النص عن الحاوية */
    word-break: break-all;
}

/* تحسين شريط التمرير (Scrollbar) */
.json-container::-webkit-scrollbar {
    width: 6px;
}
.json-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}
</style>