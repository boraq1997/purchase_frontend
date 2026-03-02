<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        modal
        header="تفاصيل عرض السعر"
        :style="{ width: '90vw' }"
        :breakpoints="{ '960px': '95vw' }"
        dir="rtl"
    >
        <div class="dialog-header-content mb-4 p-2 border-round-xl"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="flex justify-content-between align-items-center flex-wrap gap-3">
                <div class="flex-1">
                    <div class="flex align-items-center gap-3 mb-2">
                        <Chip :label="`#${estimateData?.id}`" class="text-lg font-bold bg-white-alpha-20 text-white px-4 py-2" style="backdrop-filter: blur(10px);" />
                        <Tag :value="getStatusLabel(estimateData?.status ?? '')" :severity="getStatusSeverity(estimateData?.status ?? '')" class="text-base font-bold px-4 py-2" />
                    </div>
                    <h2 class="text-3xl font-bold text-white m-0 mb-2">{{ estimateData?.vendor?.name }}</h2>
                    <div class="flex align-items-center gap-2 text-white-alpha-90">
                        <i class="pi pi-calendar"></i>
                        <span class="text-lg">{{ formatDate(estimateData?.estimate_date) }}</span>
                    </div>
                </div>
                <div class="p-4 border-round-xl text-center" style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); min-width: 250px;">
                    <div class="text-sm text-white-alpha-90 mb-2 font-semibold">المبلغ الإجمالي</div>
                    <div class="text-5xl font-bold text-white mb-1">{{ formatCurrency(estimateData?.total_amount) }}</div>
                    <div class="text-lg text-white-alpha-90 font-medium">دينار عراقي</div>
                </div>
            </div>
        </div>

        <div class="grid">
            <!-- العمود الأيسر -->
            <div class="col-12 lg:col-8">
                <div class="surface-card border-round-xl p-4 shadow-2 mb-4">
                    <h3 class="text-xl font-bold text-900 mb-4">معلومات طلب الشراء</h3>
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="p-3 border-round-lg mb-3" style="background: linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%);">
                                <span class="text-600 text-sm font-semibold mb-2 block"><i class="pi pi-hashtag ml-1"/>رقم الطلب</span>
                                <span class="text-900 font-bold text-lg">{{ estimateData?.purchase_request?.[0]?.request_number }}</span>
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="p-3 border-round-lg mb-3" style="background: linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%);">
                                <span class="text-600 text-sm font-semibold mb-2 block"><i class="pi pi-flag ml-1"/>الأولوية</span>
                                <Tag :value="getPriorityLabel(estimateData?.purchase_request?.[0]?.priority ?? 'low')"
                                    :severity="getPrioritySeverity(estimateData?.purchase_request?.[0]?.priority ?? 'low')" class="text-base px-3 py-2" />
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="p-3 border-round-lg" style="background: linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%);">
                                <span class="text-600 text-sm font-semibold mb-2 block"><i class="pi pi-file-edit ml-1"/>عنوان الطلب</span>
                                <span class="text-900 font-bold text-lg">{{ estimateData?.purchase_request?.[0]?.title }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- جدول المواد -->
                <div class="surface-card border-round-xl p-4 shadow-2">
                    <h3 class="text-xl font-bold text-900 mb-4">المواد المطلوبة</h3>
                    <DataTable :value="estimateData?.estimate_items" responsiveLayout="scroll" stripedRows>
                        <Column field="item_name" style="min-width: 200px">
                            <template #header><i class="fas fa-box text-gray-500"/> اسم المادة</template>
                            <template #body="{ data }">
                                <div class="flex align-items-center gap-2">
                                    <i class="pi pi-box text-primary"></i>
                                    <span class="font-semibold text-900">{{ data.item_name }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column field="quantity" style="min-width: 120px">
                            <template #header><i class="fas fa-hashtag text-gray-500"/> الكمية</template>
                            <template #body="{ data }">
                                <Chip :label="`${data.quantity} ${data.request_item?.unit || ''}`"
                                    style="background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%); color: #667eea;" />
                            </template>
                        </Column>
                        <Column field="unit_price" style="min-width: 150px">
                            <template #header><i class="fas fa-dollar-sign text-gray-500"/> سعر الوحدة</template>
                            <template #body="{ data }">
                                <span class="font-semibold text-900">{{ formatCurrency(data.unit_price) }}</span>
                                <span class="text-500 text-sm mr-1">د.ع</span>
                            </template>
                        </Column>
                        <Column field="total_price" style="min-width: 150px">
                            <template #header><i class="fa-solid fa-money-bill-1-wave text-gray-500"/> المجموع</template>
                            <template #body="{ data }">
                                <span class="font-bold text-primary text-lg">{{ formatCurrency(data.total_price) }}</span>
                                <span class="text-500 text-sm mr-1">د.ع</span>
                            </template>
                        </Column>
                    </DataTable>

                    <div class="mt-4 p-2 border-round-xl" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                        <div class="flex justify-content-between align-items-center">
                            <span class="text-2xl font-bold text-white">المجموع الكلي:</span>
                            <div class="text-right">
                                <div class="text-4xl font-bold text-white">{{ formatCurrency(estimateData?.total_amount) }}</div>
                                <div class="text-lg text-white-alpha-90">دينار عراقي</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- العمود الأيمن -->
            <div class="col-12 lg:col-4">
                <div class="surface-card border-round-xl p-4 shadow-2 mb-4">
                    <h3 class="text-xl font-bold text-900 mb-4">معلومات المورد</h3>
                    <div v-for="(item, i) in vendorDetails" :key="i"
                        class="p-3 border-round-lg mb-3 transition-all transition-duration-200 hover:surface-100">
                        <div class="flex align-items-center gap-3">
                            <i :class="item.icon + ' text-primary-500'"></i>
                            <div class="flex-1">
                                <span class="text-600 text-xs block mb-1">{{ item.label }}</span>
                                <span class="text-900 font-semibold block">{{ item.value }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="estimateData?.notes" class="surface-card border-round-xl p-4 shadow-2">
                    <h3 class="text-xl font-bold text-900 mb-3">الملاحظات</h3>
                    <div class="p-3 border-round-lg" style="background: linear-gradient(135deg, rgba(255,216,155,0.1) 0%, rgba(25,84,123,0.1) 100%);">
                        <p class="text-900 m-0 line-height-3">{{ estimateData.notes }}</p>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="إغلاق" icon="fas fa-times" severity="secondary" outlined class="px-5" @click="emit('update:visible', false)" />
            <Button label="طباعة" icon="pi pi-print" class="px-5" @click="window.print()" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { Estimate } from '../estimateService';

const props = defineProps<{
    visible: boolean;
    estimateData: Estimate | null;
}>();

const emit = defineEmits<{
    'update:visible': [value: boolean];
}>();

const vendorDetails = computed(() => [
    { icon: 'fas fa-user-tie', label: 'اسم المورد', value: props.estimateData?.vendor?.name || 'غير متوفر' },
    { icon: 'fas fa-phone-flip', label: 'رقم الهاتف 1', value: props.estimateData?.vendor?.phone1 || 'غير متوفر' },
    { icon: 'fas fa-phone-flip', label: 'رقم الهاتف 2', value: props.estimateData?.vendor?.phone2 || 'غير متوفر' },
    { icon: 'fas fa-envelope', label: 'البريد الإلكتروني', value: props.estimateData?.vendor?.email || 'غير متوفر' },
    { icon: 'fas fa-map-location-dot', label: 'العنوان', value: props.estimateData?.vendor?.address || 'غير متوفر' },
]);

const getStatusLabel = (s: string) => ({ pending: 'قيد الانتظار', accepted: 'موافق عليه', rejected: 'مرفوض' }[s] || s);
const getStatusSeverity = (s: string): any => ({ pending: 'warning', accepted: 'success', rejected: 'danger' }[s] || 'secondary');
const getPriorityLabel = (p: string) => ({ low: 'منخفضة', medium: 'متوسطة', high: 'عالية' }[p] || p);
const getPrioritySeverity = (p: string): any => ({ low: 'info', medium: 'warning', high: 'danger' }[p] || 'info');
const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد';
const formatCurrency = (v: any) => parseFloat(v || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
</script>