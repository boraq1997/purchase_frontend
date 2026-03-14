<!--
  PurchaseRequestDetail.vue
  إعادة تصميم كاملة باستخدام PrimeVue + Tailwind فقط - بدون CSS مخصص
  Vue 3 + TypeScript + PrimeVue
-->

<template>
  <div class="min-h-screen bg-slate-950 p-6 relative overflow-hidden">

    <!-- Background Radial Glows -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style="background: radial-gradient(circle, #3b82f6, transparent)"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style="background: radial-gradient(circle, #a855f7, transparent)"></div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="relative z-10 flex flex-col items-center justify-center min-h-screen gap-6">
      <ProgressSpinner style="width: 72px; height: 72px" strokeWidth="3" animationDuration="1.2s" />
      <p class="text-slate-400 text-lg font-semibold animate-pulse">جاري تحميل البيانات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="relative z-10 flex items-center justify-center min-h-screen">
      <Card class="w-full max-w-md text-center shadow-2xl border border-red-900/40 bg-slate-900">
        <template #content>
          <div class="flex flex-col items-center gap-4 py-6">
            <i class="pi pi-exclamation-circle text-6xl text-red-400"></i>
            <h3 class="text-2xl font-bold text-slate-100">حدث خطأ</h3>
            <p class="text-slate-400 text-base">{{ error }}</p>
            <Button
              label="إعادة المحاولة"
              icon="pi pi-refresh"
              severity="danger"
              class="mt-2"
              @click="loadData"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Main Content -->
    <div v-else-if="purchaseRequest" class="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">

      <!-- ═══════════════════════════════════════════════════════════
      HEADER SECTION
      ═══════════════════════════════════════════════════════════ -->
      <Card class="shadow-2xl border-0 overflow-hidden"
            style="background: linear-gradient(135deg, #1e40af 0%, #6d28d9 100%)">
        <template #content>
          <div class="p-2 text-white">

            <!-- Title Row -->
            <div class="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div class="flex-1 min-w-64">
                <h1 class="text-3xl font-black mb-2 text-white drop-shadow-lg tracking-tight">
                  {{ purchaseRequest.title }}
                </h1>
                <p class="text-blue-200 font-bold tracking-widest uppercase text-sm">
                  {{ purchaseRequest.request_number }}
                </p>
              </div>
              <div class="flex gap-3 flex-wrap">
                <Tag
                  :value="formatStatus(purchaseRequest.status_type).label"
                  :severity="formatStatus(purchaseRequest.status_type).severity"
                  class="text-base font-bold px-4 py-2"
                />
                <Tag
                  :value="formatPriority(purchaseRequest.priority).label"
                  :severity="formatPriority(purchaseRequest.priority).severity"
                  class="text-base font-bold px-4 py-2"
                />
              </div>
            </div>

            <!-- Description -->
            <div class="flex gap-3 items-start mb-5 p-4 rounded-xl"
                 style="background: rgba(255,255,255,0.12); backdrop-filter: blur(8px)">
              <i class="pi pi-align-right text-xl text-blue-200 mt-1"></i>
              <div>
                <span class="block text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">الوصف</span>
                <p class="text-white font-medium leading-relaxed text-base">
                  {{ purchaseRequest.description }}
                </p>
              </div>
            </div>

            <!-- Meta Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">

              <div class="flex gap-3 items-center p-3 rounded-xl"
                   style="background: rgba(255,255,255,0.1)">
                <i class="pi pi-calendar text-blue-200 text-xl"></i>
                <div>
                  <span class="block text-xs text-blue-200 font-bold uppercase tracking-widest mb-0.5">تاريخ الإنشاء</span>
                  <span class="text-white font-bold">{{ formatDate(purchaseRequest.created_at) }}</span>
                </div>
              </div>

              <div class="flex gap-3 items-center p-3 rounded-xl"
                   style="background: rgba(255,255,255,0.1)">
                <i class="pi pi-user text-blue-200 text-xl"></i>
                <div>
                  <span class="block text-xs text-blue-200 font-bold uppercase tracking-widest mb-0.5">المنشئ</span>
                  <span class="text-white font-bold">{{ purchaseRequest.creator?.name || 'غير محدد' }}</span>
                </div>
              </div>

              <div v-if="purchaseRequest.status_date"
                   class="flex gap-3 items-center p-3 rounded-xl"
                   style="background: rgba(255,255,255,0.1)">
                <i class="pi pi-check-circle text-blue-200 text-xl"></i>
                <div>
                  <span class="block text-xs text-blue-200 font-bold uppercase tracking-widest mb-0.5">تاريخ الحالة</span>
                  <span class="text-white font-bold">{{ formatDate(purchaseRequest.status_date) }}</span>
                </div>
              </div>

            </div>
          </div>
        </template>
      </Card>

      <!-- ═══════════════════════════════════════════════════════════
           STATISTICS CARDS
      ═══════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <Card
          v-for="(stat, i) in statistics"
          :key="i"
          class="shadow-xl border-0 transition-all duration-300 hover:-translate-y-2 cursor-default"
          :style="{ background: stat.bg, borderLeft: `4px solid ${stat.accent}` }"
        >
          <template #content>
            <div class="flex items-center gap-4 p-1">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                   :style="{ background: stat.iconBg }">
                <i :class="[stat.icon, 'text-white text-2xl']"></i>
              </div>
              <div>
                <p class="text-slate-400 text-sm font-semibold mb-1">{{ stat.label }}</p>
                <h3 class="text-2xl font-black text-slate-100">{{ stat.value }}</h3>
              </div>
            </div>
          </template>
        </Card>

      </div>

      <!-- ═══════════════════════════════════════════════════════════
           ITEMS TABLE
      ═══════════════════════════════════════════════════════════ -->
      <Card class="shadow-xl bg-slate-900 border border-slate-800">
        <template #header>
          <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <i class="pi pi-list text-white text-lg"></i>
              </div>
              <h2 class="text-xl font-black text-slate-100">العناصر المطلوبة</h2>
            </div>
            <Badge
              :value="`${purchaseRequest.items.length} عنصر`"
              severity="info"
              class="text-sm font-bold"
            />
          </div>
        </template>
        <template #content>

          <DataTable
            :value="purchaseRequest.items"
            :paginator="purchaseRequest.items.length > 5"
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20]"
            responsiveLayout="scroll"
            stripedRows
            class="p-datatable-sm"
            pt:root:class="bg-transparent"
            pt:thead:class="bg-slate-800"
            pt:tbody:class="text-slate-300"
          >
            <template #empty>
              <div class="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
                <i class="pi pi-inbox text-5xl"></i>
                <p class="text-lg font-semibold">لا توجد عناصر</p>
              </div>
            </template>

            <!-- Item Name -->
            <Column field="item_name" header="اسم العنصر" style="min-width: 200px">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i class="pi pi-box text-blue-400 text-lg"></i>
                  <span class="font-bold text-slate-100">{{ data.item_name }}</span>
                </div>
              </template>
            </Column>

            <!-- Specifications -->
            <Column field="specifications" header="المواصفات" style="min-width: 250px">
              <template #body="{ data }">
                <span class="text-slate-400 text-sm leading-relaxed">{{ data.specifications }}</span>
              </template>
            </Column>

            <!-- Quantity -->
            <Column field="quantity" header="الكمية" style="min-width: 120px">
              <template #body="{ data }">
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-black text-slate-100">{{ data.quantity }}</span>
                  <span class="text-xs text-slate-500 font-semibold">{{ data.unit }}</span>
                </div>
              </template>
            </Column>

            <!-- Unit Price -->
            <Column field="estimated_unit_price" header="سعر الوحدة" style="min-width: 150px">
              <template #body="{ data }">
                <span class="font-bold text-emerald-400 text-sm">
                  {{ formatCurrency(data.estimated_unit_price) }}
                </span>
              </template>
            </Column>

            <!-- Total Price -->
            <Column field="total_estimated_price" header="السعر الإجمالي" style="min-width: 160px">
              <template #body="{ data }">
                <span class="font-black text-emerald-300 text-base">
                  {{ formatCurrency(data.total_estimated_price) }}
                </span>
              </template>
            </Column>

            <!-- Actions -->
            <Column header="الإجراءات" style="min-width: 140px">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-warehouse"
                    rounded
                    text
                    size="small"
                    v-tooltip.top="'فحص المخزن'"
                    :disabled="!data.warehouse_check"
                    @click="showWarehouseDialog(data)"
                    :severity="data.warehouse_check ? 'info' : 'secondary'"
                  />
                  <Button
                    icon="pi pi-check-circle"
                    rounded
                    text
                    size="small"
                    v-tooltip.top="'تقييم الحاجة'"
                    :disabled="!data.needs_assessment"
                    @click="showNeedsDialog(data)"
                    :severity="data.needs_assessment ? 'success' : 'secondary'"
                  />
                </div>
              </template>
            </Column>

          </DataTable>

        </template>
      </Card>

      <!-- ═══════════════════════════════════════════════════════════
           ESTIMATES SECTION
      ═══════════════════════════════════════════════════════════ -->
      <Card
        v-if="purchaseRequest.estimates?.length"
        class="shadow-xl bg-slate-900 border border-slate-800"
      >
        <template #header>
          <div class="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
              <i class="pi pi-file text-white text-lg"></i>
            </div>
            <h2 class="text-xl font-black text-slate-100">العروض المقدمة</h2>
            <Badge :value="purchaseRequest.estimates.length" severity="warning" />
          </div>
        </template>
        <template #content>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
            <Card
              v-for="estimate in purchaseRequest.estimates"
              :key="estimate.id"
              class="border border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-900/30 hover:shadow-lg"
              style="background: #1e293b"
            >
              <template #header>
                <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-700">
                  <div class="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                    <i class="pi pi-briefcase text-amber-400"></i>
                    <span class="text-slate-200 font-bold text-sm">مورد #{{ estimate.vendor_id }}</span>
                  </div>
                  <Tag
                    :value="formatStatus(estimate.status).label"
                    :severity="formatStatus(estimate.status).severity"
                  />
                </div>
              </template>
              <template #content>
                <div class="flex flex-col gap-3">

                  <div class="flex items-center gap-2">
                    <i class="pi pi-calendar text-amber-400 text-sm"></i>
                    <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">تاريخ العرض</span>
                    <span class="text-slate-300 font-semibold text-sm mr-auto">
                      {{ formatDate(estimate.estimate_date) }}
                    </span>
                  </div>

                  <div class="flex flex-col items-center p-4 rounded-xl gap-1"
                       style="background: #0f172a">
                    <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">المبلغ الإجمالي</span>
                    <span class="text-2xl font-black text-amber-400">
                      {{ formatCurrency(estimate.total_amount) }}
                    </span>
                  </div>

                  <div v-if="estimate.notes"
                       class="flex gap-2 p-3 rounded-lg bg-slate-800">
                    <i class="pi pi-comment text-slate-500 mt-0.5 text-sm flex-shrink-0"></i>
                    <p class="text-slate-400 text-sm leading-relaxed m-0">{{ estimate.notes }}</p>
                  </div>

                </div>
              </template>
            </Card>
          </div>

        </template>
      </Card>

      <!-- ═══════════════════════════════════════════════════════════
           PROCUREMENTS SECTION
      ═══════════════════════════════════════════════════════════ -->
      <Card
        v-if="purchaseRequest.procurements?.length"
        class="shadow-xl bg-slate-900 border border-slate-800"
      >
        <template #header>
          <div class="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center">
              <i class="pi pi-shopping-cart text-white text-lg"></i>
            </div>
            <h2 class="text-xl font-black text-slate-100">عمليات الشراء</h2>
            <Badge :value="purchaseRequest.procurements.length" severity="info" />
          </div>
        </template>
        <template #content>

          <div class="flex flex-col gap-4 pt-2">
            <Card
              v-for="proc in purchaseRequest.procurements"
              :key="proc.id"
              class="border border-slate-700 transition-all duration-300 hover:-translate-x-1 hover:shadow-purple-900/30 hover:shadow-lg"
              style="background: #1e293b"
            >
              <template #content>
                <div class="flex flex-col gap-4">

                  <!-- Main Row -->
                  <div class="flex items-center gap-4 flex-wrap">

                    <!-- Icon -->
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        style="background: linear-gradient(135deg, #a855f7, #7c3aed)">
                      <i class="pi pi-shopping-bag text-white text-2xl"></i>
                    </div>

                    <!-- Details -->
                    <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">

                      <div class="flex flex-col gap-1">
                        <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">الرقم المرجعي</span>
                        <code class="text-slate-200 font-mono font-bold bg-slate-800 px-2 py-1 rounded text-sm self-start">
                          {{ proc.reference_no }}
                        </code>
                      </div>

                      <div class="flex flex-col gap-1">
                        <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">تاريخ الشراء</span>
                        <div class="flex items-center gap-2">
                          <i class="pi pi-calendar text-purple-400 text-sm"></i>
                          <span class="text-slate-300 font-semibold">{{ formatDate(proc.purchase_date) }}</span>
                        </div>
                      </div>

                      <div class="flex flex-col gap-1">
                        <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">المبلغ الإجمالي</span>
                        <span class="text-2xl font-black text-purple-400">{{ formatCurrency(proc.total_amount) }}</span>
                      </div>

                    </div>

                    <!-- Status Badge -->
                    <Tag
                      :value="formatStatus(proc.status).label"
                      :severity="formatStatus(proc.status).severity"
                      class="font-bold"
                    />

                  </div>

                  <!-- Notes -->
                  <div v-if="proc.notes"
                       class="flex gap-3 items-start p-3 rounded-xl border border-slate-700 bg-slate-800">
                    <i class="pi pi-info-circle text-purple-400 mt-0.5 flex-shrink-0"></i>
                    <p class="text-slate-400 text-sm leading-relaxed m-0">{{ proc.notes }}</p>
                  </div>

                </div>
              </template>
            </Card>
          </div>

        </template>
      </Card>

      <!-- ═══════════════════════════════════════════════════════════
           REPORT SECTION
      ═══════════════════════════════════════════════════════════ -->
      <Card
        v-if="purchaseRequest.report"
        class="shadow-2xl border border-slate-700 overflow-hidden"
        style="background: linear-gradient(135deg, #1e293b, #0f172a)"
      >
        <template #header>
          <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-700 flex items-center justify-center">
                <i class="pi pi-chart-bar text-white text-lg"></i>
              </div>
              <h2 class="text-xl font-black text-slate-100">التقرير النهائي</h2>
            </div>
            <div class="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
              <i class="pi pi-calendar text-slate-400 text-sm"></i>
              <span class="text-slate-300 text-sm font-semibold">
                {{ formatDate(purchaseRequest.report.generated_at) }}
              </span>
            </div>
          </div>
        </template>
        <template #content>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

            <!-- Summary Block -->
            <div class="flex flex-col gap-3 p-5 rounded-2xl border border-slate-700 transition-all duration-300 hover:-translate-y-1"
                 style="background: rgba(14, 165, 233, 0.07)">
              <div class="flex items-center gap-2 mb-1">
                <i class="pi pi-file-edit text-sky-400 text-xl"></i>
                <h3 class="text-lg font-bold text-slate-100 m-0">ملخص التقرير</h3>
              </div>
              <p class="text-slate-400 leading-relaxed m-0">
                {{ parseReportData(purchaseRequest.report.data).summary }}
              </p>
            </div>

            <!-- Recommendations Block -->
            <div class="flex flex-col gap-3 p-5 rounded-2xl border border-slate-700 transition-all duration-300 hover:-translate-y-1"
                 style="background: rgba(251, 191, 36, 0.07)">
              <div class="flex items-center gap-2 mb-1">
                <i class="pi pi-lightbulb text-amber-400 text-xl"></i>
                <h3 class="text-lg font-bold text-slate-100 m-0">التوصيات</h3>
              </div>
              <p class="text-slate-400 leading-relaxed m-0">
                {{ parseReportData(purchaseRequest.report.data).recommendations }}
              </p>
            </div>

          </div>

          <Divider />

          <div class="flex items-center gap-2 text-slate-500 text-sm font-semibold">
            <i class="pi pi-tag"></i>
            <span>نوع التقرير: {{ formatReportType(purchaseRequest.report.report_type) }}</span>
          </div>

        </template>
      </Card>

    </div><!-- /content-wrapper -->

    <!-- ═══════════════════════════════════════════════════════════
         WAREHOUSE CHECK DIALOG
    ═══════════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="warehouseDialogVisible"
      modal
      :style="{ width: '580px' }"
      :pt="{
        root: { class: 'bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl' },
        header: { class: 'bg-gradient-to-r from-blue-800 to-violet-800 rounded-t-2xl px-6 py-5' },
        title: { class: 'text-white font-black text-xl' },
        closeButton: { class: 'text-white hover:bg-white/20 rounded-lg' },
        content: { class: 'bg-slate-900 px-6 py-6 rounded-b-2xl' }
      }"
      header="فحص المخزن"
    >
      <div v-if="selectedItem?.warehouse_check" class="grid grid-cols-2 gap-4">

        <div class="flex gap-3 items-start p-4 rounded-xl bg-slate-800 border border-slate-700">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background: linear-gradient(135deg, #3b82f6, #2563eb)">
            <i class="pi pi-warehouse text-white text-xl"></i>
          </div>
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">حالة التوفر</span>
            <span class="text-slate-100 font-bold">{{ formatAvailability(selectedItem.warehouse_check.availability) }}</span>
          </div>
        </div>

        <div class="flex gap-3 items-start p-4 rounded-xl bg-slate-800 border border-slate-700">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background: linear-gradient(135deg, #10b981, #059669)">
            <i class="pi pi-box text-white text-xl"></i>
          </div>
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">الكمية المتوفرة</span>
            <span class="text-slate-100 font-bold">{{ selectedItem.warehouse_check.available_quantity }} قطعة</span>
          </div>
        </div>

        <div class="col-span-2 flex gap-3 items-start p-4 rounded-xl bg-slate-800 border border-slate-700">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background: linear-gradient(135deg, #8b5cf6, #7c3aed)">
            <i class="pi pi-check-circle text-white text-xl"></i>
          </div>
          <div class="flex-1">
            <span class="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">التوصية</span>
            <span class="text-slate-100 font-bold">{{ formatRecommendation(selectedItem.warehouse_check.recommendation) }}</span>
          </div>
        </div>

        <div v-if="selectedItem.warehouse_check.notes"
             class="col-span-2 flex gap-3 items-start p-4 rounded-xl bg-slate-800 border border-amber-900/40">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background: linear-gradient(135deg, #f59e0b, #d97706)">
            <i class="pi pi-comment text-white text-xl"></i>
          </div>
          <div class="flex-1">
            <span class="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">ملاحظات</span>
            <p class="text-slate-400 leading-relaxed m-0 text-sm">{{ selectedItem.warehouse_check.notes }}</p>
          </div>
        </div>

      </div>
    </Dialog>

    <!-- ═══════════════════════════════════════════════════════════
         NEEDS ASSESSMENT DIALOG
    ═══════════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="needsDialogVisible"
      modal
      :style="{ width: '580px' }"
      :pt="{
        root: { class: 'bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl' },
        header: { class: 'bg-gradient-to-r from-emerald-800 to-teal-800 rounded-t-2xl px-6 py-5' },
        title: { class: 'text-white font-black text-xl' },
        closeButton: { class: 'text-white hover:bg-white/20 rounded-lg' },
        content: { class: 'bg-slate-900 px-6 py-6 rounded-b-2xl' }
      }"
      header="تقييم الحاجة"
    >
      <div v-if="selectedItem?.needs_assessment" class="grid grid-cols-2 gap-4">

        <div class="flex gap-3 items-start p-4 rounded-xl bg-slate-800 border border-slate-700">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background: linear-gradient(135deg, #ef4444, #dc2626)">
            <i class="pi pi-exclamation-triangle text-white text-xl"></i>
          </div>
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">مستوى الأولوية</span>
            <Tag
              :value="formatUrgency(selectedItem.needs_assessment.urgency_level)"
              :severity="getUrgencySeverity(selectedItem.needs_assessment.urgency_level)"
            />
          </div>
        </div>

        <div class="flex gap-3 items-start p-4 rounded-xl bg-slate-800 border border-slate-700">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background: linear-gradient(135deg, #06b6d4, #0891b2)">
            <i class="pi pi-info-circle text-white text-xl"></i>
          </div>
          <div>
            <span class="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">حالة الحاجة</span>
            <Tag
              :value="formatNeedsStatus(selectedItem.needs_assessment.needs_status)"
              severity="info"
            />
          </div>
        </div>

        <div class="col-span-2 flex gap-3 items-start p-4 rounded-xl bg-slate-800 border border-slate-700">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background: linear-gradient(135deg, #6366f1, #4f46e5)">
            <i class="pi pi-file-edit text-white text-xl"></i>
          </div>
          <div class="flex-1">
            <span class="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">السبب</span>
            <p class="text-slate-300 leading-relaxed m-0">{{ selectedItem.needs_assessment.reason }}</p>
          </div>
        </div>

      </div>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../../api/api';

// PrimeVue Components
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import ProgressSpinner from 'primevue/progressspinner';

// ── Types ────────────────────────────────────────────────────────────
interface PurchaseRequest {
  id: number;
  request_number: string;
  title: string;
  description: string;
  status_type: string;
  priority: string;
  created_at: string;
  status_date: string;
  creator: { name: string } | null;
  items: Array<{
    id: number;
    item_name: string;
    specifications: string;
    quantity: number;
    unit: string;
    estimated_unit_price: string;
    total_estimated_price: string;
    warehouse_check: any;
    needs_assessment: any;
  }>;
  estimates: Array<{
    id: number;
    vendor_id: number;
    estimate_date: string;
    total_amount: string;
    notes: string;
    status: string;
  }>;
  procurements: Array<{
    id: number;
    reference_no: string;
    purchase_date: string;
    total_amount: string;
    notes: string;
    status: string;
  }>;
  report: {
    report_type: string;
    data: string;
    generated_at: string;
  } | null;
}

// ── State ────────────────────────────────────────────────────────────
const route = useRoute();
const purchaseRequest = ref<PurchaseRequest | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedItem = ref<any>(null);
const warehouseDialogVisible = ref(false);
const needsDialogVisible = ref(false);

// ── Computed ─────────────────────────────────────────────────────────
const statistics = computed(() => {
  if (!purchaseRequest.value) return [];

  const items = purchaseRequest.value.items || [];
  const totalCost = items.reduce(
    (sum, item) => sum + parseFloat(item.total_estimated_price || '0'), 0
  );

  return [
    {
      label: 'عدد العناصر',
      value: items.length,
      icon: 'pi pi-box',
      bg: '#1e293b',
      accent: '#3b82f6',
      iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    },
    {
      label: 'التكلفة المقدرة',
      value: formatCurrency(totalCost.toString()),
      icon: 'pi pi-dollar',
      bg: '#1e293b',
      accent: '#10b981',
      iconBg: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      label: 'عدد العروض',
      value: purchaseRequest.value.estimates?.length || 0,
      icon: 'pi pi-file',
      bg: '#1e293b',
      accent: '#f59e0b',
      iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      label: 'عمليات الشراء',
      value: purchaseRequest.value.procurements?.length || 0,
      icon: 'pi pi-shopping-cart',
      bg: '#1e293b',
      accent: '#a855f7',
      iconBg: 'linear-gradient(135deg, #a855f7, #9333ea)'
    }
  ];
});

// ── Methods ──────────────────────────────────────────────────────────
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const id = route.params.id || 1;
    const response = await api.get(`/reportGene/${id}`);

    if (response.data?.a) {
      purchaseRequest.value = response.data.a;
    } else if (response.data) {
      purchaseRequest.value = response.data;
    } else {
      throw new Error('لا توجد بيانات');
    }
  } catch (err: any) {
    error.value = err.message || 'حدث خطأ في تحميل البيانات';
    console.error('Error loading data:', err);
  } finally {
    loading.value = false;
  }
};

const formatStatus = (status: string) => {
  const map: Record<string, any> = {
    pending:   { label: 'قيد الانتظار', severity: 'warning' },
    approved:  { label: 'معتمد',        severity: 'success' },
    rejected:  { label: 'مرفوض',        severity: 'danger'  },
    completed: { label: 'مكتمل',        severity: 'info'    },
    cancelled: { label: 'ملغي',         severity: 'secondary'}
  };
  return map[status] || { label: status, severity: 'info' };
};

const formatPriority = (priority: string) => {
  const map: Record<string, any> = {
    low:    { label: 'منخفضة', severity: 'info'    },
    medium: { label: 'متوسطة', severity: 'warning' },
    high:   { label: 'عالية',  severity: 'danger'  }
  };
  return map[priority] || { label: priority, severity: 'info' };
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ar-IQ', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 د.ع';
  return num.toLocaleString('ar-IQ', {
    minimumFractionDigits: 0, maximumFractionDigits: 2
  }) + ' د.ع';
};

const parseReportData = (data: string) => {
  try { return typeof data === 'string' ? JSON.parse(data) : data; }
  catch { return { summary: '', recommendations: '' }; }
};

const formatReportType = (type: string) => {
  const types: Record<string, string> = {
    procurement_recommendation: 'توصية الشراء',
    needs_assessment:           'تقييم الاحتياجات',
    warehouse_review:           'مراجعة المخزون',
    financial_analysis:         'تحليل مالي'
  };
  return types[type] || type;
};

const formatAvailability = (a: string) => ({
  available: 'متوفر', not_available: 'غير متوفر', partially_available: 'متوفر جزئياً'
}[a] || a);

const formatRecommendation = (r: string) => ({
  provide_from_stock: 'توفير من المخزون',
  purchase_new:       'شراء جديد',
  partial_from_stock: 'توفير جزئي من المخزون'
}[r] || r);

const formatUrgency = (u: string) => ({ low: 'منخفضة', medium: 'متوسطة', high: 'عالية' }[u] || u);

const getUrgencySeverity = (urgency: string) =>
  ({ high: 'danger', medium: 'warning', low: 'info' }[urgency] || 'info');

const formatNeedsStatus = (s: string) => ({
  needed:           'مطلوب',
  not_needed:       'غير مطلوب',
  partially_needed: 'مطلوب جزئياً'
}[s] || s);

const showWarehouseDialog = (item: any) => {
  selectedItem.value = item;
  warehouseDialogVisible.value = true;
};

const showNeedsDialog = (item: any) => {
  selectedItem.value = item;
  needsDialogVisible.value = true;
};

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => { loadData(); });
</script>