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
        

        <DataTable
            v-model:filters="globalFilters"
            :value="allLogs"
            dataKey="id"
            paginator
            :rows="50"
            :totalRecords="meta.total"
            :lazy="true"
            @page="onPage"
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
            maximizable
            class="audit-details-dialog modern-tailwind-theme"
            dir="rtl"
        >
            <template #header>
                <div class="header-container w-full relative p-4 overflow-hidden border-round-top-2xl">                    
                    <div class="flex align-items-center justify-content-between relative z-1">
                        <div class="flex align-items-center gap-3">
                            <div class="header-icon shadow-lg">
                                <i class="fas fa-file-alt text-white text-xl"></i>
                            </div>
                            <div>
                                <h3 class="m-0 text-xl font-bold text-900">تفاصيل سجل النشاط</h3>
                                <p class="m-0 text-sm text-600 mt-1">معلومات كاملة عن الإجراء المنفذ</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </template>

    <div v-if="selectedLog" class="p-4 custom-scrollbar overflow-y-auto" style="max-height: 70vh;">
        
        <div class="grid mb-4">
            <div class="col-12 md:col-4">
                <div class="info-stat-card border-1 border-200 shadow-sm p-3 border-round-xl flex align-items-center gap-3">
                    <div :class="['stat-icon-box', getStatusStyles(selectedLog.status).bg]">
                        <i :class="['fas fa-check-circle', getStatusStyles(selectedLog.status).text]"></i>
                    </div>
                    <div>
                        <p class="m-0 text-xs text-500">الحالة</p>
                        <p :class="['m-0 font-bold mt-1', getStatusStyles(selectedLog.status).text]">{{ selectedLog.status }}</p>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="info-stat-card border-1 border-200 shadow-sm p-3 border-round-xl flex align-items-center gap-3">
                    <div :class="['stat-icon-box', getSeverityStyles(selectedLog.severity).bg]">
                        <i :class="['fas fa-exclamation-triangle', getSeverityStyles(selectedLog.severity).text]"></i>
                    </div>
                    <div>
                        <p class="m-0 text-xs text-500">الخطورة</p>
                        <p class="m-0 font-bold text-900 mt-1">{{ getSeverityLabel(selectedLog.severity) }}</p>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="info-stat-card border-1 border-200 shadow-sm p-3 border-round-xl flex align-items-center gap-3">
                    <div class="stat-icon-box bg-purple-100">
                        <i class="fas fa-cube text-purple-600"></i>
                    </div>
                    <div>
                        <p class="m-0 text-xs text-500">الموديول</p>
                        <p class="m-0 font-bold text-900 mt-1">{{ selectedLog.module }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-column gap-4">
            <section class="glass-section action-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-primary text-primary-contrast"><i class="fas fa-tasks text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">معلومات الإجراء</h4>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-6 lg:col-4">
                        <div class="data-item">
                            <span class="label text-purple-600">الإجراء</span>
                            <p class="value">{{ selectedLog.action_label }}</p>
                        </div>
                    </div>
                    <div class="col-12 md:col-6 lg:col-4">
                        <div class="data-item">
                            <span class="label text-purple-600">الكود</span>
                            <p class="value font-mono">{{ selectedLog.action }}</p>
                        </div>
                    </div>
                    <div class="col-12 lg:col-4">
                        <div class="data-item">
                            <span class="label text-purple-600">التاريخ</span>
                            <p class="value flex align-items-center gap-2">
                                <i class="far fa-calendar-alt text-purple-400"></i>
                                {{ formatFullDate(selectedLog.created_at) }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="glass-section user-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-blue-600"><i class="fas fa-user text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">المستخدم</h4>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-6 lg:col-3"><div class="data-item"><span class="label text-blue-600">الاسم</span><p class="value">{{ selectedLog.actor_name }}</p></div></div>
                    <div class="col-12 md:col-6 lg:col-3"><div class="data-item"><span class="label text-blue-600">الدور</span><Tag :value="selectedLog.actor_role" class="bg-blue-100 text-blue-800 border-none px-3 font-bold" /></div></div>
                    <div class="col-12 md:col-6 lg:col-3"><div class="data-item"><span class="label text-blue-600">النوع</span><p class="value text-sm">{{ selectedLog.actor_type }}</p></div></div>
                    <div class="col-12 md:col-6 lg:col-3"><div class="data-item"><span class="label text-blue-600">ID</span><p class="value font-mono text-xs">{{ selectedLog.actor_id }}</p></div></div>
                </div>
            </section>

            <section class="glass-section subject-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-green-600"><i class="fas fa-bullseye text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">الهدف</h4>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-4"><div class="data-item"><span class="label text-green-600">النوع</span><p class="value">{{ selectedLog.subject_type }}</p></div></div>
                    <div class="col-12 md:col-4"><div class="data-item"><span class="label text-green-600">ID</span><p class="value font-mono text-xs">{{ selectedLog.subject_id || '—' }}</p></div></div>
                    <div class="col-12 md:col-4"><div class="data-item"><span class="label text-green-600">المعرّف</span><p class="value font-mono text-xs">{{ selectedLog.subject_identifier || '—' }}</p></div></div>
                </div>
            </section>

            <section class="glass-section request-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-orange-600"><i class="fas fa-globe text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">الطلب</h4>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-8"><div class="data-item"><span class="label text-orange-600">Route</span><p class="value font-mono text-xs break-all">{{ selectedLog.route }}</p></div></div>
                    <div class="col-12 md:col-4"><div class="data-item"><span class="label text-orange-600">Method</span><Tag :value="selectedLog.method" class="bg-orange-100 text-orange-800 border-none font-bold" /></div></div>
                </div>
            </section>

            <section v-if="selectedLog.metadata" class="glass-section meta-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-indigo-600"><i class="fas fa-box text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">بيانات إضافية</h4>
                </div>
                <div class="json-code-box indigo-box">
                    <pre class="m-0 text-xs">{{ selectedLog.metadata }}</pre>
                </div>
            </section>

            <section v-if="selectedLog.old_values || selectedLog.new_values" class="glass-section changes-theme">
                <div class="flex align-items-center gap-2 mb-4">
                    <div class="section-badge bg-pink-600"><i class="fas fa-exchange-alt text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">التغييرات</h4>
                </div>

                <div class="grid">
                    <div v-if="selectedLog.old_values" class="col-12 md:col-12">
                        <div class="flex align-items-center gap-2 mb-2">
                            <span class="text-xs font-bold text-red-600 uppercase">القيم القديمة</span>
                            <div class="flex-grow-1 border-bottom-1 border-red-800"></div>
                        </div>
                        <div class="json-code-box red-box">
                            <pre class="m-0 text-xs">{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
                        </div>
                    </div>

                    <div v-if="selectedLog.new_values" class="col-12 md:col-12">
                        <div class="flex align-items-center gap-2 mb-2">
                            <span class="text-xs font-bold text-green-600 uppercase">القيم الجديدة</span>
                            <div class="flex-grow-1 border-bottom-1 border-green-800"></div>
                        </div>
                        <div class="json-code-box green-box">
                            <pre class="m-0 text-xs">{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <template #footer>
        <div class="flex align-items-center justify-content-between w-full p-3 border-round-bottom-2xl border-top-1 border-200">
            <span class="text-xs text-500 font-mono italic">Log ID: {{ selectedLog?.id }}</span>
            <Button @click="showDetailsDialog = false" class="modern-gradient-btn">
                <i class="fas fa-check ml-2"></i>
                إغلاق النافذة
            </Button>
        </div>
    </template>
</Dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
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
import Card from 'primevue/card';

const toast = useToast();
const isLoading = ref(true);

const allLogs = ref<ActivityLog[]>([]);
const meta = ref<any>({ total: 0, current_page: 1, per_page: 50 });
const selectedLog = ref<ActivityLog | null>(null);
const showDetailsDialog = ref(false);
const currentPage = ref(1);

const globalFilters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Breadcrumb configuration
const breadcrumbHome = ref({ icon: "fas fa-house", to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/", icon: "fas fa-house" },
    { label: "سجل النظام", to: "/logs", icon: "fa-solid fa-clock-rotate-left" },
]);

const getStatusStyles = (status: string) => ({
    bg: status === 'success' ? 'bg-green-100' : status === 'failed' ? 'bg-red-100' : 'bg-yellow-100',
    text: status === 'success' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : 'text-yellow-600'
});

const getSeverityStyles = (sev: string) => ({
    bg: sev === 'danger' ? 'bg-red-100' : sev === 'warning' ? 'bg-yellow-100' : 'bg-blue-100',
    text: sev === 'danger' ? 'text-red-600' : sev === 'warning' ? 'text-yellow-600' : 'text-blue-600'
});

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

const formatFullDate = (dateString?: string) => {
    if (!dateString) return;
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

const onPage = (event: any) => {
    currentPage.value = event.page + 1; // PrimeVue uses 0-based index
    fetchAllLogs();
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
        per_page: 50,
        page: currentPage.value,
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
    background-color: #f8fafc;
    padding: 1rem;
    flex-grow: 1;
}

.json-container {
    margin: 0;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    max-height: 350px;
    overflow-y: auto;
    direction: ltr;
    white-space: pre-wrap;
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

/* الألوان الأساسية والتأثيرات */
.custom-modern-dialog :deep(.p-dialog-content) {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    padding: 1.5rem;
}

/* بطاقات الأقسام */
.section-card {
    padding: 1.25rem;
    border-radius: 1rem;
    border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.action-section { background: linear-gradient(to bottom right, rgba(147, 51, 234, 0.05), rgba(59, 130, 246, 0.05)); border-color: rgba(147, 51, 234, 0.1); }
.user-section { background: linear-gradient(to bottom right, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05)); border-color: rgba(59, 130, 246, 0.1); }
.changes-section { background: linear-gradient(to bottom right, rgba(249, 115, 22, 0.05), rgba(245, 158, 11, 0.05)); border-color: rgba(249, 115, 22, 0.1); }

/* الأيقونات */
.icon-box {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.9rem;
}

/* بطاقات المعلومات الداخلية */
.inner-info-card {
    background: rgba(255, 255, 255, 0.8);
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(0,0,0,0.03);
}

.inner-info-card .label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    color: #6366f1;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
}

.inner-info-card .value {
    margin: 0;
    font-weight: 600;
    color: #1e293b;
}

/* صناديق الـ JSON */
.json-box {
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid;
    overflow-x: auto;
    font-size: 0.8rem;
    font-family: monospace;
}
.json-box.old-values { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.json-box.new-values { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }

/* زر الإغلاق المودرن */
.modern-close-btn {
    background: linear-gradient(to right, #2563eb, #9333ea) !important;
    border: none !important;
    padding: 0.6rem 2rem !important;
    border-radius: 0.5rem !important;
    transition: transform 0.2s;
}
.modern-close-btn:hover { transform: scale(1.05); }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }

/* تنسيق الـ Dialog العام */
.modern-tailwind-theme.p-dialog {
    border-radius: 1.5rem;
    overflow: hidden;
    border: none;
}

/* Header */
.header-wrapper {
    background: white;
}
.header-overlay {
    background: linear-gradient(135deg, #9333ea 0%, #2563eb 50%, #4f46e5 100%);
}
.header-icon-container {
    background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
}

/* Buttons */
.close-btn-circle {
    width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; border: none;
    background: #f3f4f6; color: #6b7280; cursor: pointer; transition: all 0.2s;
}
.close-btn-circle:hover { background: #fee2e2; color: #dc2626; transform: rotate(90deg); }

.tailwind-btn {
    background: linear-gradient(to right, #2563eb, #9333ea) !important;
    border: none !important; color: white !important; border-radius: 0.75rem !important;
    padding: 0.75rem 2rem !important; font-weight: 600 !important; transition: 0.3s !important;
}
.tailwind-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.4) !important; }

/* Sections & Cards */
.gradient-section { border-color: rgba(0,0,0,0.05); }
.action-gradient { background: linear-gradient(to bottom right, #faf5ff, #eff6ff); }
.changes-gradient { background: linear-gradient(to bottom right, #fdf2f8, #f5f3ff); }

.glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.5); }
.glass-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

.section-icon { width: 2.25rem; height: 2.25rem; border-radius: 0.6rem; display: flex; align-items: center; justify-content: center; }

/* JSON Viewers */
.json-viewer { font-family: 'Courier New', monospace; border: 1px solid rgba(0,0,0,0.05); }
.json-viewer.old-values { background: rgba(254, 242, 242, 0.8); color: #991b1b; border-color: #fecaca; }
.json-viewer.new-values { background: rgba(240, 253, 244, 0.8); color: #166534; border-color: #bbf7d0; }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #6366f1, #8b5cf6);
    border-radius: 10px;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
    background: linear-gradient(to bottom, #6366f1, #a855f7); 
    border-radius: 10px; 
}

/* Header & Icon */
.bg-gradient-header { background: linear-gradient(135deg, #9333ea 0%, #2563eb 50%, #4f46e5 100%); }
.header-icon { 
    width: 3.5rem; height: 3.5rem; border-radius: 1rem; 
    background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
    display: flex; align-items: center; justify-content: center;
}

/* Close Button */
.close-modal-btn {
    width: 2.5rem; height: 2.5rem; border-radius: 0.8rem; border: none;
    background: rgba(255, 255, 255, 0.2); 
    color: white; 
    cursor: pointer; 
    transition: 0.3s;
    backdrop-filter: blur(10px);
}
.close-modal-btn:hover { 
    background: rgba(255, 255, 255, 0.3); 
    transform: rotate(90deg); 
}

/* Light Mode - Dialog Sections */
html:not(.dark-mode) .glass-section {
    padding: 1.5rem; 
    border-radius: 1.25rem; 
    border: 1px solid;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

html:not(.dark-mode) .action-theme { 
    background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%); 
    border-color: #d8b4fe;
}

html:not(.dark-mode) .user-theme { 
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); 
    border-color: #93c5fd;
}

html:not(.dark-mode) .subject-theme { 
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
    border-color: #86efac;
}

html:not(.dark-mode) .request-theme { 
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-color: #fdba74;
}

html:not(.dark-mode) .meta-theme { 
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); 
    border-color: #a5b4fc;
}

html:not(.dark-mode) .changes-theme { 
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); 
    border-color: #f9a8d4;
}

/* Light Mode - Section Titles */
html:not(.dark-mode) .section-title {
    color: #1f2937;
}

/* Light Mode - Data Items */
html:not(.dark-mode) .data-item {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    padding: 0.85rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

html:not(.dark-mode) .data-item .label { 
    display: block; 
    font-size: 0.65rem; 
    font-weight: 800; 
    text-transform: uppercase; 
    margin-bottom: 0.25rem; 
}

html:not(.dark-mode) .data-item .value { 
    font-weight: 700; 
    color: #111827;
    font-size: 0.95rem; 
}

/* Light Mode - JSON Code Boxes */
html:not(.dark-mode) .json-code-box { 
    padding: 1rem; 
    border-radius: 0.8rem; 
    border: 1px solid; 
    overflow-x: auto; 
    line-height: 1.5; 
}

html:not(.dark-mode) .indigo-box { 
    background: #eef2ff;
    border-color: #c7d2fe;
    color: #3730a3;
}

html:not(.dark-mode) .red-box { 
    background: #fef2f2;
    border-color: #fecaca;
    color: #991b1b; 
}

html:not(.dark-mode) .green-box { 
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
}

/* Dark Mode - Keep existing styles */
html.dark-mode .glass-section {
    padding: 1.5rem; 
    border-radius: 1.25rem; 
    border: 1px solid;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

html.dark-mode .action-theme { 
    background: linear-gradient(276deg, #a05be514, #0034633b); 
    border-color: rgba(147 51 234); 
}

html.dark-mode .user-theme { 
    background: linear-gradient(276deg, #a05be514, #0034633b); 
    border-color: rgba(147 51 234);
}

html.dark-mode .subject-theme { 
    background: linear-gradient(276deg, #a05be514, #0034633b); 
    border-color: rgba(147 51 234);
}

html.dark-mode .request-theme { 
    background: linear-gradient(276deg, #ff8d0014, #d570003b);
    border-color: rgb(234 147 51 / 62%);
}

html.dark-mode .meta-theme { 
    background: linear-gradient(276deg, #a05be514, #0034633b); 
    border-color: rgba(147 51 234);
}

html.dark-mode .changes-theme { 
    background: linear-gradient(276deg, #a05be514, #0034633b); 
    border-color: rgba(147 51 234);
}

html.dark-mode .section-title {
    color: #f9fafb;
}

html.dark-mode .data-item {
    background: rgb(7 10 26 / 80%);
    backdrop-filter: blur(4px);
    padding: 0.85rem;
    border-radius: 0.75rem;
    border: 1px solid rgb(99 99 99 / 50%);
}

html.dark-mode .data-item .label { 
    display: block; 
    font-size: 0.65rem; 
    font-weight: 800; 
    text-transform: uppercase; 
    margin-bottom: 0.25rem; 
}

html.dark-mode .data-item .value { 
    font-weight: 700; 
    color: #FFFFFF;
    font-size: 0.95rem; 
}

html.dark-mode .json-code-box { 
    padding: 1rem; 
    border-radius: 0.8rem; 
    border: 1px solid; 
    overflow-x: auto; 
    line-height: 1.5; 
}

html.dark-mode .indigo-box { 
    background: rgb(43 45 32 / 24%);
    border-color: #c7d2fe;
    color: #00ff6e;
}

html.dark-mode .red-box { 
    background: rgb(98 0 0 / 9%);
    border-color: #ab000075;
    color: #ffffff; 
}

html.dark-mode .green-box { 
    background: rgb(0 87 49 / 21%);
    border-color: #006323a1;
    color: #ffffff;
}

/* Footer Button */
.modern-gradient-btn {
    background: linear-gradient(to right, #2563eb, #9333ea) !important;
    border: none !important; color: white !important; font-weight: 600 !important;
    padding: 0.75rem 2.5rem !important; border-radius: 0.8rem !important; transition: 0.3s !important;
}
.modern-gradient-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(147, 51, 234, 0.5) !important; }

/* Icon Badges */
.section-badge { width: 1.75rem; height: 1.75rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
.stat-icon-box { width: 3rem; height: 3rem; border-radius: 0.8rem; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
</style>