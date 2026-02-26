<script setup lang="ts">
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import { computed } from 'vue';
import type { RequestItem } from '../../../interfaces/item.interfaces';

const props = defineProps<{ item: RequestItem | null }>();

const estimates = computed(() => props.item?.estimate ?? []);

const lowestPrice = computed(() => {
    if (!estimates.value.length) return null;
    return Math.min(...estimates.value.map(e => parseFloat(e.estimate.total_amount) || Infinity));
});

const highestPrice = computed(() => {
    if (!estimates.value.length) return null;
    return Math.max(...estimates.value.map(e => parseFloat(e.estimate.total_amount) || 0));
});

const averagePrice = computed(() => {
    if (!estimates.value.length) return 0;
    const sum = estimates.value.reduce((acc, e) => acc + parseFloat(e.estimate.total_amount || '0'), 0);
    return Math.round(sum / estimates.value.length);
});

const priceDifference = computed(() => {
    if (!lowestPrice.value || !highestPrice.value) return 0;
    return highestPrice.value - lowestPrice.value;
});

const isBest = (est: any) => parseFloat(est.estimate.total_amount) === lowestPrice.value;
</script>

<template>
    <div class="p-2">

        <!-- ── Empty State ── -->
        <div v-if="!estimates.length"
            class="flex flex-column align-items-center justify-content-center text-center py-8 gap-3 border-round-2xl">
            <div class="flex align-items-center justify-content-center bg-primary-50 border-round-2xl p-4">
                <i class="pi pi-inbox text-primary text-5xl" />
            </div>
            <div>
                <p class="text-xl font-bold text-900 m-0 mb-2">لا توجد عروض أسعار</p>
                <p class="text-color-secondary text-sm m-0">لم يتم إضافة أي عروض أسعار لهذه المادة بعد.</p>
            </div>
        </div>

        <div v-else class="flex flex-column gap-4">

            <!-- ══════════════════════════════
                 بطاقة الإحصائيات
            ══════════════════════════════ -->
            <Card class="border-1 surface-border shadow-2 overflow-hidden">

                <template #header>
                    <div class="flex align-items-center gap-3 px-4 py-3 border-bottom-1 surface-border">
                        <div class="flex align-items-center justify-content-center bg-primary border-round-xl p-3 shadow-2">
                            <i class="pi pi-wallet text-white text-xl" />
                        </div>
                        <div>
                            <p class="font-bold text-900 text-lg m-0">عروض الأسعار</p>
                            <p class="text-color-secondary text-xs m-0 mt-1">ملخص وإحصائيات شاملة للعروض المقدمة</p>
                        </div>
                        <Tag
                            :value="`${estimates.length} عرض`"
                            severity="primary"
                            rounded
                            class="mr-auto font-bold"
                        />
                    </div>
                </template>

                <template #content>
                    <div class="grid m-0 gap-0">

                        <!-- أفضل سعر -->
                        <div class="col-12 sm:col-6 xl:col-3 p-2">
                            <div class="flex flex-column gap-3 bg-green-50 border-1 border-green-200 border-round-xl p-4 h-full">
                                <div class="flex align-items-center justify-content-between">
                                    <span class="text-xs text-green-700 font-bold">أفضل سعر</span>
                                    <div class="flex align-items-center justify-content-center bg-green-100 border-round-lg p-2">
                                        <i class="pi pi-star-fill text-green-600 text-sm" />
                                    </div>
                                </div>
                                <div class="flex align-items-end gap-1">
                                    <span class="text-4xl font-bold text-green-700 line-height-1">
                                        {{ lowestPrice?.toLocaleString() ?? '—' }}
                                    </span>
                                    <span class="text-green-600 text-xs font-semibold mb-1">IQD</span>
                                </div>
                            </div>
                        </div>

                        <!-- متوسط السعر -->
                        <div class="col-12 sm:col-6 xl:col-3 p-2">
                            <div class="flex flex-column gap-3 bg-blue-50 border-1 border-blue-200 border-round-xl p-4 h-full">
                                <div class="flex align-items-center justify-content-between">
                                    <span class="text-xs text-blue-700 font-bold">متوسط الأسعار</span>
                                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round-lg p-2">
                                        <i class="pi pi-chart-bar text-blue-600 text-sm" />
                                    </div>
                                </div>
                                <div class="flex align-items-end gap-1">
                                    <span class="text-4xl font-bold text-blue-700 line-height-1">
                                        {{ averagePrice.toLocaleString() }}
                                    </span>
                                    <span class="text-blue-600 text-xs font-semibold mb-1">IQD</span>
                                </div>
                            </div>
                        </div>

                        <!-- أعلى سعر -->
                        <div class="col-12 sm:col-6 xl:col-3 p-2">
                            <div class="flex flex-column gap-3 bg-orange-50 border-1 border-orange-200 border-round-xl p-4 h-full">
                                <div class="flex align-items-center justify-content-between">
                                    <span class="text-xs text-orange-700 font-bold">أعلى سعر</span>
                                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round-lg p-2">
                                        <i class="pi pi-arrow-up text-orange-600 text-sm" />
                                    </div>
                                </div>
                                <div class="flex align-items-end gap-1">
                                    <span class="text-4xl font-bold text-orange-700 line-height-1">
                                        {{ highestPrice?.toLocaleString() ?? '—' }}
                                    </span>
                                    <span class="text-orange-600 text-xs font-semibold mb-1">IQD</span>
                                </div>
                            </div>
                        </div>

                        <!-- فرق السعر -->
                        <div class="col-12 sm:col-6 xl:col-3 p-2">
                            <div class="flex flex-column gap-3 bg-purple-50 border-1 border-purple-200 border-round-xl p-4 h-full">
                                <div class="flex align-items-center justify-content-between">
                                    <span class="text-xs text-purple-700 font-bold">فرق السعر</span>
                                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round-lg p-2">
                                        <i class="pi pi-arrows-h text-purple-600 text-sm" />
                                    </div>
                                </div>
                                <div class="flex align-items-end gap-1">
                                    <span class="text-4xl font-bold text-purple-700 line-height-1">
                                        {{ priceDifference.toLocaleString() }}
                                    </span>
                                    <span class="text-purple-600 text-xs font-semibold mb-1">IQD</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </template>
            </Card>

            <!-- ══════════════════════════════
                 قائمة العروض
            ══════════════════════════════ -->
            <div class="flex flex-column gap-3">
                <Card
                    v-for="(est, index) in estimates"
                    :key="est.id"
                    class="overflow-hidden"
                    :class="isBest(est)
                        ? 'border-2 border-green-400 shadow-4'
                        : 'border-1 surface-border shadow-1'"
                >

                    <!-- ── Card Header ── -->
                    <template #header>
                        <div
                            class="flex align-items-center justify-content-between flex-wrap gap-3 px-4 py-3 border-bottom-1 surface-border"
                            :class="isBest(est) ? 'bg-green-600' : 'surface-100'"
                        >
                            <!-- الرقم + المعرّف -->
                            <div class="flex align-items-center gap-3">
                                <div
                                    class="flex align-items-center justify-content-center border-round-xl text-white text-xl font-bold flex-shrink-0"
                                    :class="isBest(est) ? 'bg-green-500' : 'bg-primary'"
                                    style="width:46px; height:46px;"
                                >
                                    {{ index + 1 }}
                                </div>
                                <div class="flex flex-column gap-1">
                                    <span class="text-xs text-color-secondary font-medium">رقم العرض</span>
                                    <span class="text-lg font-bold text-900">#{{ est.id }}</span>
                                </div>
                            </div>

                            <!-- السعر + شارة أفضل عرض -->
                            <div class="flex align-items-center gap-2 flex-wrap">
                                <Tag
                                    v-if="isBest(est)"
                                    value="✦ أفضل عرض"
                                    severity="success"
                                    rounded
                                    class="font-bold text-sm px-3 py-2"
                                />
                                <div
                                    class="flex align-items-center gap-2 border-round-xl px-4 py-2 shadow-1"
                                    :class="isBest(est)
                                        ? 'bg-green-500'
                                        : 'bg-primary'"
                                >
                                    <i class="pi pi-dollar text-white text-lg" />
                                    <span class="text-white text-xl font-bold">
                                        {{ parseFloat(est.estimate.total_amount)?.toLocaleString() ?? '—' }}
                                    </span>
                                    <span class="text-white-alpha-70 text-xs font-medium">IQD</span>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- ── Card Content ── -->
                    <template #content>
                        <div class="flex flex-column gap-4 pt-1">

                            <!-- معلومات المورد -->
                            <div>
                                <div class="flex align-items-center gap-2 mb-3">
                                    <div class="flex align-items-center justify-content-center bg-primary-50 border-round-lg p-2">
                                        <i class="pi pi-building text-primary text-sm" />
                                    </div>
                                    <span class="font-bold text-900 text-base">معلومات المورد</span>
                                </div>

                                <div class="grid m-0">

                                    <!-- اسم المحل -->
                                    <div class="col-12 sm:col-6 p-2">
                                        <div class="flex align-items-center gap-3 surface-50 border-1 surface-border border-round-xl p-3">
                                            <div class="flex align-items-center justify-content-center bg-blue-500 border-round-lg p-2 flex-shrink-0">
                                                <i class="pi pi-store text-white text-sm" />
                                            </div>
                                            <div class="flex flex-column gap-1 min-w-0 flex-1">
                                                <span class="text-xs text-color-secondary font-semibold">اسم المحل</span>
                                                <span class="text-sm font-bold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                                    {{ est.estimate.vendor?.name ?? '—' }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- رقم الهاتف -->
                                    <div class="col-12 sm:col-6 p-2">
                                        <div class="flex align-items-center gap-3 surface-50 border-1 surface-border border-round-xl p-3">
                                            <div class="flex align-items-center justify-content-center bg-green-500 border-round-lg p-2 flex-shrink-0">
                                                <i class="pi pi-phone text-white text-sm" />
                                            </div>
                                            <div class="flex flex-column gap-1 min-w-0 flex-1">
                                                <span class="text-xs text-color-secondary font-semibold">رقم الهاتف</span>
                                                <div class="flex gap-1 flex-wrap">
                                                    <a :href="`tel:${est.estimate.vendor?.phone1}`"
                                                       class="text-sm font-bold text-green-600 no-underline">
                                                        {{ est.estimate.vendor?.phone1 ?? '—' }}
                                                    </a>
                                                    <span v-if="est.estimate.vendor?.phone2" class="text-color-secondary">·</span>
                                                    <a v-if="est.estimate.vendor?.phone2"
                                                       :href="`tel:${est.estimate.vendor?.phone2}`"
                                                       class="text-sm font-bold text-green-600 no-underline">
                                                        {{ est.estimate.vendor?.phone2 }}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- البريد الإلكتروني -->
                                    <div class="col-12 sm:col-6 p-2">
                                        <div class="flex align-items-center gap-3 surface-50 border-1 surface-border border-round-xl p-3">
                                            <div class="flex align-items-center justify-content-center bg-purple-500 border-round-lg p-2 flex-shrink-0">
                                                <i class="pi pi-envelope text-white text-sm" />
                                            </div>
                                            <div class="flex flex-column gap-1 min-w-0 flex-1">
                                                <span class="text-xs text-color-secondary font-semibold">البريد الإلكتروني</span>
                                                <a :href="`mailto:${est.estimate.vendor?.email}`"
                                                   class="text-sm font-bold text-purple-600 no-underline white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                                    {{ est.estimate.vendor?.email ?? '—' }}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- العنوان -->
                                    <div class="col-12 sm:col-6 p-2">
                                        <div class="flex align-items-center gap-3 surface-50 border-1 surface-border border-round-xl p-3">
                                            <div class="flex align-items-center justify-content-center bg-red-500 border-round-lg p-2 flex-shrink-0">
                                                <i class="pi pi-map-marker text-white text-sm" />
                                            </div>
                                            <div class="flex flex-column gap-1 min-w-0 flex-1">
                                                <span class="text-xs text-color-secondary font-semibold">العنوان</span>
                                                <span class="text-sm font-bold text-900">
                                                    {{ est.estimate.vendor?.address ?? '—' }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <Divider class="my-0" />

                            <!-- تفاصيل الأسعار -->
                            <div>
                                <div class="flex align-items-center gap-2 mb-3">
                                    <div class="flex align-items-center justify-content-center bg-primary-50 border-round-lg p-2">
                                        <i class="pi pi-money-bill text-primary text-sm" />
                                    </div>
                                    <span class="font-bold text-900 text-base">تفاصيل الأسعار</span>
                                </div>

                                <div class="grid m-0">

                                    <!-- السعر المفرد -->
                                    <div class="col-12 sm:col-6 p-2">
                                        <div class="flex align-items-center gap-4 bg-cyan-50 border-1 border-cyan-200 border-round-xl p-4">
                                            <div class="flex align-items-center justify-content-center bg-cyan-500 border-round-xl p-3 flex-shrink-0 shadow-1">
                                                <i class="pi pi-tag text-white text-lg" />
                                            </div>
                                            <div class="flex flex-column gap-1">
                                                <span class="text-xs text-cyan-700 font-bold">السعر المفرد</span>
                                                <div class="flex align-items-baseline gap-1">
                                                    <span class="text-3xl font-bold text-cyan-700 line-height-1">
                                                        {{ parseFloat(est.estimated_unit_price ?? est.unit_price)?.toLocaleString() ?? '—' }}
                                                    </span>
                                                    <span class="text-cyan-600 text-xs font-semibold">IQD</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- السعر الكلي -->
                                    <div class="col-12 sm:col-6 p-2">
                                        <div class="flex align-items-center gap-4 bg-indigo-50 border-1 border-indigo-200 border-round-xl p-4">
                                            <div class="flex align-items-center justify-content-center bg-indigo-500 border-round-xl p-3 flex-shrink-0 shadow-1">
                                                <i class="pi pi-calculator text-white text-lg" />
                                            </div>
                                            <div class="flex flex-column gap-1">
                                                <span class="text-xs text-indigo-700 font-bold">السعر الكلي</span>
                                                <div class="flex align-items-baseline gap-1">
                                                    <span class="text-3xl font-bold text-indigo-700 line-height-1">
                                                        {{ parseFloat(est.estimate.total_amount)?.toLocaleString() ?? '—' }}
                                                    </span>
                                                    <span class="text-indigo-600 text-xs font-semibold">IQD</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </template>

                </Card>
            </div>

        </div>
    </div>
</template>