<template>
  <div class="dashboard-container">
    <!-- Enhanced Header Section with Breadcrumb and Actions -->
    <div class="dashboard-header mb-4">
      <div class="flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-3" />
          <h1 class="text-4xl font-bold m-0 mb-2 gradient-text">لوحة التحكم الرئيسية</h1>
          <p class="text-600 m-0 text-lg">نظرة شاملة على أداء نظام إدارة المشتريات</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <Button icon="pi pi-download" label="تصدير التقرير" severity="success" outlined />
          <Button icon="pi pi-chart-line" label="تحليلات متقدمة" severity="info" outlined />
          <Button icon="pi pi-refresh" @click="refreshData" :loading="loading" rounded severity="secondary" />
          <Dropdown v-model="selectedPeriod" :options="periods" optionLabel="label" optionValue="value" 
                    placeholder="اختر الفترة" class="w-12rem" @change="onPeriodChange">
            <template #value="slotProps">
              <div class="flex align-items-center gap-2" v-if="slotProps.value">
                <i class="pi pi-calendar"></i>
                <span>{{ periods.find(p => p.value === slotProps.value)?.label }}</span>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>
    </div>

    <!-- Alert Banner for Important Notifications -->
    <div class="mb-4" v-if="importantAlerts.length > 0">
      <Message v-for="alert in importantAlerts" :key="alert.id" :severity="alert.severity" :closable="true">
        <div class="flex align-items-center gap-3">
          <i :class="alert.icon" class="text-2xl"></i>
          <div class="flex-1">
            <strong>{{ alert.title }}</strong>
            <p class="m-0 mt-1">{{ alert.message }}</p>
          </div>
          <Button :label="alert.actionLabel" text @click="alert.action" />
        </div>
      </Message>
    </div>

    <!-- Advanced Statistics Cards with Comparison -->
    <div class="grid">
      <!-- Total Purchase Requests Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card gradient-card-blue border-round p-4 shadow-3">
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex-1">
              <div class="flex align-items-center gap-2 mb-2">
                <span class="text-white-alpha-80 font-medium">إجمالي طلبات الشراء</span>
                <i class="pi pi-info-circle text-white-alpha-60 cursor-pointer" v-tooltip.top="'إجمالي عدد طلبات الشراء في الفترة المحددة'"></i>
              </div>
              <div class="text-white font-bold text-4xl mb-2">{{ animatedStats.totalRequests }}</div>
              <div class="flex align-items-center gap-2">
                <Tag :value="stats.requestsGrowth >= 0 ? '+' + stats.requestsGrowth + '%' : stats.requestsGrowth + '%'" 
                     :severity="stats.requestsGrowth >= 0 ? 'success' : 'danger'" 
                     icon="pi pi-arrow-up" rounded />
                <span class="text-white-alpha-80 text-sm">مقارنة بالفترة السابقة</span>
              </div>
            </div>
            <div class="stat-icon-wrapper bg-white-alpha-20">
              <i class="pi pi-shopping-cart text-white text-3xl"></i>
            </div>
          </div>
          <Divider class="border-white-alpha-30 my-3" />
          <div class="flex justify-content-between align-items-center">
            <span class="text-white-alpha-80 text-sm">الهدف الشهري: 200</span>
            <div class="flex align-items-center gap-2">
              <ProgressBar :value="(stats.totalRequests / 200) * 100" :showValue="false" 
                         style="height: 6px; width: 80px" />
              <span class="text-white text-sm font-bold">{{ Math.round((stats.totalRequests / 200) * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Requests Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card gradient-card-orange border-round p-4 shadow-3">
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex-1">
              <div class="flex align-items-center gap-2 mb-2">
                <span class="text-white-alpha-80 font-medium">الطلبات المعلقة</span>
                <Badge :value="stats.urgentPending" severity="danger" />
              </div>
              <div class="text-white font-bold text-4xl mb-2">{{ animatedStats.pendingRequests }}</div>
              <div class="flex align-items-center gap-2">
                <Chip :label="stats.pendingPercentage + '% من الإجمالي'" class="bg-white-alpha-20 text-white" />
              </div>
            </div>
            <div class="stat-icon-wrapper bg-white-alpha-20">
              <i class="pi pi-clock text-white text-3xl"></i>
            </div>
          </div>
          <Divider class="border-white-alpha-30 my-3" />
          <div class="flex justify-content-between text-white-alpha-80 text-sm">
            <span>عاجل: {{ stats.urgentPending }}</span>
            <span>متوسط: {{ stats.mediumPending }}</span>
            <span>عادي: {{ stats.normalPending }}</span>
          </div>
        </div>
      </div>

      <!-- Total Spending Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card gradient-card-green border-round p-4 shadow-3">
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex-1">
              <div class="flex align-items-center gap-2 mb-2">
                <span class="text-white-alpha-80 font-medium">إجمالي المصروفات</span>
                <i class="pi pi-chart-line text-white-alpha-60"></i>
              </div>
              <div class="text-white font-bold text-3xl mb-2">{{ formatCurrency(animatedStats.totalSpending) }}</div>
              <div class="flex align-items-center gap-2">
                <Tag :value="stats.spendingGrowth >= 0 ? '+' + stats.spendingGrowth + '%' : stats.spendingGrowth + '%'" 
                     :severity="stats.spendingGrowth >= 0 ? 'success' : 'warning'" 
                     :icon="stats.spendingGrowth >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" rounded />
                <span class="text-white-alpha-80 text-sm">{{ formatCurrency(stats.avgTransactionValue) }} متوسط القيمة</span>
              </div>
            </div>
            <div class="stat-icon-wrapper bg-white-alpha-20">
              <i class="pi pi-dollar text-white text-3xl"></i>
            </div>
          </div>
          <Divider class="border-white-alpha-30 my-3" />
          <div class="flex justify-content-between align-items-center">
            <span class="text-white-alpha-80 text-sm">الميزانية: {{ formatCurrency(stats.budget) }}</span>
            <Chip :label="stats.budgetUsedPercentage + '% مستخدم'" class="bg-white-alpha-20 text-white" />
          </div>
        </div>
      </div>

      <!-- Active Vendors Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card gradient-card-purple border-round p-4 shadow-3">
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex-1">
              <div class="flex align-items-center gap-2 mb-2">
                <span class="text-white-alpha-80 font-medium">الموردين النشطين</span>
                <Badge :value="'+' + stats.newVendorsThisMonth" severity="success" />
              </div>
              <div class="text-white font-bold text-4xl mb-2">{{ animatedStats.activeVendors }}</div>
              <div class="flex align-items-center gap-2">
                <AvatarGroup>
                  <Avatar v-for="i in 3" :key="i" :label="String.fromCharCode(65 + i)" shape="circle" 
                          size="small" style="background-color: rgba(255,255,255,0.3)" />
                  <Avatar :label="'+' + (stats.activeVendors - 3)" shape="circle" size="small" 
                          style="background-color: rgba(255,255,255,0.3)" />
                </AvatarGroup>
              </div>
            </div>
            <div class="stat-icon-wrapper bg-white-alpha-20">
              <i class="pi pi-users text-white text-3xl"></i>
            </div>
          </div>
          <Divider class="border-white-alpha-30 my-3" />
          <div class="flex justify-content-between text-white-alpha-80 text-sm">
            <span>إجمالي: {{ stats.totalVendors }}</span>
            <span>تقييم متوسط: ⭐ {{ stats.avgVendorRating }}/5</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Statistics Cards -->
    <div class="grid mt-4">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card border-round p-4 shadow-2 stat-card-hover">
          <div class="flex align-items-center gap-3 mb-3">
            <div class="stat-mini-icon bg-cyan-100">
              <i class="pi pi-box text-cyan-600 text-2xl"></i>
            </div>
            <div class="flex-1">
              <span class="block text-600 text-sm mb-1">فحوصات المخزن</span>
              <div class="text-900 font-bold text-2xl">{{ stats.warehouseChecks }}</div>
            </div>
            <Button icon="pi pi-arrow-left" rounded text size="small" />
          </div>
          <div class="grid text-sm">
            <div class="col-6">
              <div class="text-500">متوفر</div>
              <div class="text-green-600 font-semibold">{{ stats.availableItems }}</div>
            </div>
            <div class="col-6">
              <div class="text-500">غير متوفر</div>
              <div class="text-red-600 font-semibold">{{ stats.unavailableItems }}</div>
            </div>
          </div>
          <ProgressBar :value="(stats.availableItems / stats.warehouseChecks) * 100" 
                     :showValue="false" style="height: 4px" class="mt-3" />
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card border-round p-4 shadow-2 stat-card-hover">
          <div class="flex align-items-center gap-3 mb-3">
            <div class="stat-mini-icon bg-indigo-100">
              <i class="pi pi-file-edit text-indigo-600 text-2xl"></i>
            </div>
            <div class="flex-1">
              <span class="block text-600 text-sm mb-1">عروض الأسعار</span>
              <div class="text-900 font-bold text-2xl">{{ stats.estimates }}</div>
            </div>
            <Knob :modelValue="(stats.acceptedEstimates / stats.estimates) * 100" :size="50" 
                  :strokeWidth="8" readonly valueColor="#6366f1" rangeColor="#e0e7ff" />
          </div>
          <div class="grid text-sm">
            <div class="col-4">
              <div class="text-500">معلقة</div>
              <div class="text-orange-600 font-semibold">{{ stats.pendingEstimates }}</div>
            </div>
            <div class="col-4">
              <div class="text-500">مقبولة</div>
              <div class="text-green-600 font-semibold">{{ stats.acceptedEstimates }}</div>
            </div>
            <div class="col-4">
              <div class="text-500">مرفوضة</div>
              <div class="text-red-600 font-semibold">{{ stats.rejectedEstimates }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card border-round p-4 shadow-2 stat-card-hover">
          <div class="flex align-items-center gap-3 mb-3">
            <div class="stat-mini-icon bg-pink-100">
              <i class="pi pi-shopping-bag text-pink-600 text-2xl"></i>
            </div>
            <div class="flex-1">
              <span class="block text-600 text-sm mb-1">عمليات الشراء</span>
              <div class="text-900 font-bold text-2xl">{{ stats.procurements }}</div>
            </div>
            <div class="text-right">
              <div class="text-green-600 font-bold text-lg">{{ stats.completionRate }}%</div>
              <div class="text-500 text-xs">نسبة الإنجاز</div>
            </div>
          </div>
          <div class="flex justify-content-between text-sm mb-2">
            <span class="text-500">قيد التنفيذ: {{ stats.inProgressProcurements }}</span>
            <span class="text-green-600 font-semibold">مكتملة: {{ stats.completedProcurements }}</span>
          </div>
          <ProgressBar :value="stats.completionRate" :showValue="false" style="height: 4px" />
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card border-round p-4 shadow-2 stat-card-hover">
          <div class="flex align-items-center gap-3 mb-3">
            <div class="stat-mini-icon bg-teal-100">
              <i class="pi pi-sitemap text-teal-600 text-2xl"></i>
            </div>
            <div class="flex-1">
              <span class="block text-600 text-sm mb-1">اللجان النشطة</span>
              <div class="text-900 font-bold text-2xl">{{ stats.activeCommittees }}</div>
            </div>
            <Chart type="line" :data="miniCommitteeChart" :options="miniChartOptions" 
                   style="width: 60px; height: 40px" />
          </div>
          <div class="flex justify-content-between text-sm">
            <div>
              <div class="text-500">إجمالي</div>
              <div class="text-blue-600 font-semibold">{{ stats.totalCommittees }}</div>
            </div>
            <div class="text-right">
              <div class="text-500">أعضاء</div>
              <div class="text-900 font-semibold">{{ stats.totalCommitteeMembers }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Charts Section -->
    <div class="grid mt-4">
      <!-- Enhanced Requests Status Chart -->
      <div class="col-12 lg:col-8">
        <div class="surface-card border-round shadow-3 chart-container">
          <div class="chart-header p-4 border-bottom-1 surface-border">
            <div class="flex justify-content-between align-items-center">
              <div>
                <h3 class="text-xl font-bold m-0 mb-2">تحليل حالة طلبات الشراء</h3>
                <p class="text-600 m-0 text-sm">توزيع الطلبات حسب الحالة خلال الأشهر الستة الأخيرة</p>
              </div>
              <div class="flex gap-2">
                <SelectButton v-model="chartViewType" :options="chartViewOptions" optionLabel="label" 
                            optionValue="value" size="small" />
                <Button icon="pi pi-ellipsis-v" rounded text size="small" @click="toggleChartMenu" />
              </div>
            </div>
          </div>
          <div class="p-4">
            <Chart :type="chartViewType" :data="requestsChartData" :options="requestsChartOptions" 
                   :height="350" />
          </div>
          <div class="chart-footer p-4 border-top-1 surface-border">
            <div class="grid">
              <div class="col-6 md:col-3" v-for="(dataset, index) in requestsChartData.datasets" :key="index">
                <div class="flex align-items-center gap-2">
                  <div class="chart-legend-color" :style="{ backgroundColor: dataset.backgroundColor }"></div>
                  <div>
                    <div class="text-600 text-sm">{{ dataset.label }}</div>
                    <div class="text-900 font-bold">{{ dataset.data.reduce((a, b) => a + b, 0) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Priority Distribution -->
      <div class="col-12 lg:col-4">
        <div class="surface-card border-round shadow-3 chart-container h-full">
          <div class="chart-header p-4 border-bottom-1 surface-border">
            <div class="flex justify-content-between align-items-center mb-2">
              <h3 class="text-xl font-bold m-0">توزيع الأولويات</h3>
              <Button icon="pi pi-refresh" rounded text size="small" @click="refreshPriorityData" />
            </div>
            <p class="text-600 m-0 text-sm">نسب توزيع الطلبات حسب درجة الأولوية</p>
          </div>
          <div class="p-4">
            <Chart type="doughnut" :data="priorityChartData" :options="priorityChartOptions" 
                   :height="280" />
          </div>
          <div class="chart-footer p-4 border-top-1 surface-border">
            <div class="flex flex-column gap-3">
              <div v-for="(priority, index) in priorityBreakdown" :key="index" 
                   class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-2">
                  <div class="priority-indicator" :class="'priority-' + priority.level"></div>
                  <span class="text-900 font-medium">{{ priority.label }}</span>
                </div>
                <div class="flex align-items-center gap-3">
                  <span class="text-600">{{ priority.count }}</span>
                  <Chip :label="priority.percentage + '%'" :class="'priority-chip-' + priority.level" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Department Performance & Activities Section -->
    <div class="grid mt-4">
      <!-- Enhanced Department Performance -->
      <div class="col-12 lg:col-7">
        <div class="surface-card border-round shadow-3">
          <div class="p-4 border-bottom-1 surface-border">
            <div class="flex justify-content-between align-items-center">
              <div>
                <h3 class="text-xl font-bold m-0 mb-2">تحليل أداء الأقسام</h3>
                <p class="text-600 m-0 text-sm">مقارنة شاملة لأداء جميع الأقسام</p>
              </div>
              <div class="flex gap-2">
                <Button label="تصدير" icon="pi pi-download" text size="small" />
                <InputText v-model="departmentSearch" placeholder="بحث..." size="small" 
                         class="w-10rem">
                  <template #prefix>
                    <i class="pi pi-search"></i>
                  </template>
                </InputText>
              </div>
            </div>
          </div>
          <DataTable 
            :value="filteredDepartmentPerformance" 
            :rows="5" 
            :paginator="true" 
            responsiveLayout="scroll" 
            :rowHover="true" 
            stripedRows
        >
            <Column field="name" header="القسم" sortable style="min-width: 200px">
                <template #body="slotProps">
                    <div class="flex align-items-center gap-3">
                        <Avatar 
                            :label="slotProps.data.name.charAt(0)" 
                            size="large" 
                            shape="circle" 
                            :style="{ backgroundColor: slotProps.data.color, color: 'white' }" 
                        />
                        <div>
                            <div class="font-bold text-900">{{ slotProps.data.name }}</div>
                            <div class="text-sm text-500">{{ slotProps.data.code }}</div>
                        </div>
                    </div>
                </template>
            </Column>
            <Column field="requests" header="الطلبات" sortable>
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <Tag :value="slotProps.data.requests" severity="info" rounded />
                  <i v-if="slotProps.data.requestsTrend === 'up'" 
                     class="pi pi-arrow-up text-green-500 text-xs"></i>
                  <i v-else class="pi pi-arrow-down text-red-500 text-xs"></i>
                </div>
              </template>
            </Column>
            <Column field="completed" header="المكتملة" sortable>
              <template #body="slotProps">
                <div class="text-center">
                  <div class="text-900 font-bold">{{ slotProps.data.completed }}</div>
                  <div class="text-xs text-500">من {{ slotProps.data.requests }}</div>
                </div>
              </template>
            </Column>
            <Column field="spending" header="المصروفات" sortable>
              <template #body="slotProps">
                <div>
                  <div class="font-bold text-900">{{ formatCurrency(slotProps.data.spending) }}</div>
                  <div class="text-xs text-green-600">{{ formatCurrency(slotProps.data.savings) }} توفير</div>
                </div>
              </template>
            </Column>
            <Column field="performance" header="الأداء" sortable>
              <template #body="slotProps">
                <div class="performance-cell">
                  <div class="flex align-items-center gap-2 mb-1">
                    <ProgressBar :value="slotProps.data.performance" :showValue="false" 
                               :class="getPerformanceClass(slotProps.data.performance)"
                               style="height: 8px; flex: 1" />
                    <span class="text-sm font-bold" :class="getPerformanceTextClass(slotProps.data.performance)">
                      {{ slotProps.data.performance }}%
                    </span>
                  </div>
                  <Rating :modelValue="Math.round(slotProps.data.performance / 20)" 
                          :readonly="true" :cancel="false" :stars="5" class="text-xs" />
                </div>
              </template>
            </Column>
            <Column header="الإجراءات" style="width: 100px">
              <template #body>
                <Button icon="pi pi-eye" rounded text size="small" severity="info" 
                        v-tooltip.top="'عرض التفاصيل'" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Enhanced Recent Activities -->
      <div class="col-12 lg:col-5">
        <div class="surface-card border-round shadow-3 h-full">
          <div class="p-4 border-bottom-1 surface-border">
            <div class="flex justify-content-between align-items-center mb-2">
              <h3 class="text-xl font-bold m-0">الأنشطة الأخيرة</h3>
              <div class="flex gap-2">
                <Button label="الكل" text size="small" :severity="activityFilter === 'all' ? 'primary' : 'secondary'"
                        @click="activityFilter = 'all'" />
                <Button label="هام" text size="small" :severity="activityFilter === 'important' ? 'danger' : 'secondary'"
                        @click="activityFilter = 'important'" />
              </div>
            </div>
            <p class="text-600 m-0 text-sm">آخر التحديثات والأحداث في النظام</p>
          </div>
          <ScrollPanel style="width: 100%; height: 520px" class="custom-scrollpanel">
            <div class="p-4">
              <Timeline :value="filteredActivities" align="left" class="custom-timeline">
                <template #marker="slotProps">
                  <div class="timeline-marker-wrapper">
                    <span class="timeline-marker" :style="{ backgroundColor: slotProps.item.color }">
                      <i :class="slotProps.item.icon"></i>
                    </span>
                    <div v-if="slotProps.index !== filteredActivities.length - 1" 
                         class="timeline-connector"></div>
                  </div>
                </template>
                <template #content="slotProps">
                  <div class="activity-card mb-4 p-3 border-round surface-border border-1">
                    <div class="flex justify-content-between align-items-start mb-2">
                      <div class="flex-1">
                        <div class="flex align-items-center gap-2 mb-1">
                          <span class="font-bold text-900">{{ slotProps.item.title }}</span>
                          <Badge v-if="slotProps.item.priority" :value="slotProps.item.priority" 
                                 :severity="slotProps.item.prioritySeverity" />
                        </div>
                        <p class="text-600 text-sm m-0 mb-2">{{ slotProps.item.description }}</p>
                        <div class="flex align-items-center gap-3 text-xs text-500">
                          <span><i class="pi pi-user"></i> {{ slotProps.item.user }}</span>
                          <span><i class="pi pi-clock"></i> {{ slotProps.item.time }}</span>
                        </div>
                      </div>
                      <Button icon="pi pi-ellipsis-v" rounded text size="small" />
                    </div>
                    <div v-if="slotProps.item.tags" class="flex gap-1 flex-wrap mt-2">
                      <Chip v-for="tag in slotProps.item.tags" :key="tag" :label="tag" 
                            class="text-xs" style="padding: 0.25rem 0.5rem" />
                    </div>
                  </div>
                </template>
              </Timeline>
            </div>
          </ScrollPanel>
        </div>
      </div>
    </div>

    <!-- Spending Trend Chart -->
    <div class="grid mt-4">
      <div class="col-12">
        <div class="surface-card border-round shadow-3">
          <div class="p-4 border-bottom-1 surface-border">
            <div class="flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h3 class="text-xl font-bold m-0 mb-2">تحليل اتجاهات المصروفات</h3>
                <p class="text-600 m-0 text-sm">مقارنة المصروفات الفعلية مع المخططة والميزانية المتاحة</p>
              </div>
              <div class="flex gap-2 align-items-center">
                <span class="text-600 text-sm">عرض:</span>
                <SelectButton v-model="spendingPeriod" :options="spendingPeriodOptions" 
                            optionLabel="label" optionValue="value" />
                <Divider layout="vertical" />
                <Button label="تقرير مفصل" icon="pi pi-file-pdf" severity="danger" outlined size="small" />
              </div>
            </div>
          </div>
          <div class="p-4">
            <Chart type="line" :data="spendingChartData" :options="spendingChartOptions" :height="300" />
          </div>
          <div class="p-4 border-top-1 surface-border">
            <div class="grid">
              <div class="col-12 md:col-3">
                <div class="text-center p-3 border-round bg-blue-800">
                  <i class="pi pi-chart-line text-blue-500 text-2xl mb-2"></i>
                  <div class="text-600 text-sm mb-1">إجمالي المصروفات</div>
                  <div class="text-900 font-bold text-xl">{{ formatCurrency(stats.totalSpending) }}</div>
                </div>
              </div>
              <div class="col-12 md:col-3">
                <div class="text-center p-3 border-round bg-green-700">
                  <i class="pi pi-dollar text-green-500 text-2xl mb-2"></i>
                  <div class="text-600 text-sm mb-1">الميزانية المتبقية</div>
                  <div class="text-900 font-bold text-xl">{{ formatCurrency(stats.remainingBudget) }}</div>
                </div>
              </div>
              <div class="col-12 md:col-3">
                <div class="text-center p-3 border-round bg-orange-700">
                  <i class="pi pi-calendar text-orange-500 text-2xl mb-2"></i>
                  <div class="text-600 text-sm mb-1">متوسط شهري</div>
                  <div class="text-900 font-bold text-xl">{{ formatCurrency(stats.monthlyAverage) }}</div>
                </div>
              </div>
              <div class="col-12 md:col-3">
                <div class="text-center p-3 border-round bg-purple-800">
                  <i class="pi pi-percentage text-purple-500 text-2xl mb-2"></i>
                  <div class="text-600 text-sm mb-1">نسبة التوفير</div>
                  <div class="text-900 font-bold text-xl">{{ stats.savingsPercentage }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Performers Section -->
    <div class="grid mt-4">
      <!-- Top Departments -->
      <div class="col-12 md:col-6">
        <div class="surface-card border-round shadow-3 h-full">
          <div class="p-4 border-bottom-1 surface-border">
            <div class="flex justify-content-between align-items-center">
              <div>
                <h3 class="text-xl font-bold m-0 mb-1">أكثر الأقسام نشاطاً</h3>
                <p class="text-600 m-0 text-sm">ترتيب الأقسام حسب عدد الطلبات</p>
              </div>
              <Button icon="pi pi-chart-bar" rounded outlined size="small" />
            </div>
          </div>
          <div class="p-4">
            <div v-for="(dept, index) in topDepartments" :key="index" 
                 class="department-item p-3 mb-3 border-round surface-border transition-all transition-duration-200 cursor-pointer">
              <div class="flex align-items-center gap-3">
                <div class="rank-badge" :class="'rank-' + (index + 1)">
                  <span class="font-bold">{{ index + 1 }}</span>
                </div>
                <Avatar :label="dept.name.charAt(0)" size="xlarge" shape="circle" 
                        :style="{ backgroundColor: dept.color, color: 'white' }" />
                <div class="flex-1">
                  <div class="flex justify-content-between align-items-center mb-2">
                    <span class="font-bold text-900 text-lg">{{ dept.name }}</span>
                    <div class="text-right">
                      <div class="text-900 font-bold">{{ dept.requests }}</div>
                      <div class="text-xs text-500">طلب</div>
                    </div>
                  </div>
                  <div class="flex align-items-center gap-2 mb-2">
                    <ProgressBar :value="dept.percentage" :showValue="false" 
                               style="height: 6px; flex: 1" class="dept-progress" />
                    <span class="text-sm font-semibold text-primary">{{ dept.percentage }}%</span>
                  </div>
                  <div class="flex gap-2">
                    <Chip :label="'مكتمل: ' + dept.completed" size="small" class="text-xs" />
                    <Chip :label="'قيد التنفيذ: ' + dept.inProgress" severity="warning" size="small" class="text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Vendors -->
      <div class="col-12 md:col-6">
        <div class="surface-card border-round shadow-3 h-full">
          <div class="p-4 border-bottom-1 surface-border">
            <div class="flex justify-content-between align-items-center">
              <div>
                <h3 class="text-xl font-bold m-0 mb-1">أفضل الموردين أداءً</h3>
                <p class="text-600 m-0 text-sm">ترتيب الموردين حسب القيمة والتقييم</p>
              </div>
              <Button icon="pi pi-star" rounded outlined size="small" severity="warning" />
            </div>
          </div>
          <div class="p-4">
            <div v-for="(vendor, index) in topVendors" :key="index" 
                 class="vendor-item p-3 mb-3 border-round surface-border transition-all transition-duration-200 cursor-pointer">
              <div class="flex align-items-center gap-3">
                <div class="vendor-badge" :style="{ backgroundColor: vendor.color }">
                  <i class="pi pi-star-fill text-white"></i>
                </div>
                <div class="flex-1">
                  <div class="flex justify-content-between align-items-center mb-2">
                    <div>
                      <div class="font-bold text-900">{{ vendor.name }}</div>
                      <div class="text-xs text-500">{{ vendor.category }}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-900">{{ formatCurrency(vendor.value) }}</div>
                      <div class="text-xs text-green-600">+{{ vendor.growth }}%</div>
                    </div>
                  </div>
                  <div class="flex align-items-center justify-content-between mb-2">
                    <div class="flex align-items-center gap-2">
                      <Rating :modelValue="vendor.rating" :readonly="true" :cancel="false" 
                              class="text-sm" :stars="5" />
                      <span class="text-sm text-600">({{ vendor.reviews }})</span>
                    </div>
                    <ProgressBar :value="vendor.percentage" :showValue="false" 
                               style="height: 4px; width: 100px" />
                  </div>
                  <div class="flex gap-2 text-xs">
                    <Tag :value="'عروض: ' + vendor.totalOffers" severity="info" rounded />
                    <Tag :value="'مقبول: ' + vendor.acceptedOffers" severity="success" rounded />
                    <Tag :value="'وقت التسليم: ' + vendor.deliveryTime + ' يوم'" rounded />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Analytics Section -->
    <div class="grid mt-4">
      <!-- Efficiency Metrics -->
      <div class="col-12 lg:col-4">
        <div class="surface-card border-round shadow-3 h-full">
          <div class="p-4 border-bottom-1 surface-border">
            <h3 class="text-xl font-bold m-0 mb-1">مؤشرات الكفاءة</h3>
            <p class="text-600 m-0 text-sm">قياس أداء العمليات الرئيسية</p>
          </div>
          <div class="p-4">
            <div v-for="metric in efficiencyMetrics" :key="metric.label" 
                 class="efficiency-metric mb-4 p-3 border-round" :class="metric.bgClass">
              <div class="flex justify-content-between align-items-center mb-2">
                <span class="font-semibold text-900">{{ metric.label }}</span>
                <i :class="metric.icon" class="text-2xl" :style="{ color: metric.color }"></i>
              </div>
              <div class="flex align-items-end gap-2 mb-2">
                <span class="text-4xl font-bold text-900">{{ metric.value }}</span>
                <span class="text-600">{{ metric.unit }}</span>
              </div>
              <div class="flex align-items-center justify-content-between">
                <ProgressBar :value="metric.progress" :showValue="false" 
                           style="height: 6px; flex: 1" class="mr-2" />
                <Tag :value="metric.status" :severity="metric.severity" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Overview -->
      <div class="col-12 lg:col-4">
        <div class="surface-card border-round shadow-3 h-full">
          <div class="p-4 border-bottom-1 surface-border">
            <h3 class="text-xl font-bold m-0 mb-1">نظرة عامة على الميزانية</h3>
            <p class="text-600 m-0 text-sm">توزيع وحالة الميزانية المخصصة</p>
          </div>
          <div class="p-4 text-center">
            <Knob v-model="budgetUsed" :size="180" :strokeWidth="12" 
                  valueColor="#10b981" rangeColor="#e5e7eb" textColor="#1e293b" 
                  :max="100" :readonly="true" />
            <div class="mt-4">
              <div class="text-600 mb-2">الميزانية المستخدمة</div>
              <div class="text-3xl font-bold text-900 mb-1">{{ formatCurrency(stats.totalSpending) }}</div>
              <div class="text-500">من {{ formatCurrency(stats.budget) }}</div>
            </div>
          </div>
          <Divider />
          <div class="p-4">
            <div v-for="item in budgetBreakdown" :key="item.category" class="mb-3">
              <div class="flex justify-content-between align-items-center mb-1">
                <span class="text-900 font-medium">{{ item.category }}</span>
                <span class="text-600">{{ formatCurrency(item.amount) }}</span>
              </div>
              <ProgressBar :value="item.percentage" :showValue="false" 
                         :style="{ height: '6px' }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Status -->
      <div class="col-12 lg:col-4">
        <div class="surface-card border-round shadow-3 h-full">
          <div class="p-4 border-bottom-1 surface-border">
            <h3 class="text-xl font-bold m-0 mb-1">إجراءات سريعة</h3>
            <p class="text-600 m-0 text-sm">الوصول السريع للعمليات الشائعة</p>
          </div>
          <div class="p-4">
            <div v-for="action in quickActions" :key="action.label" 
                 class="quick-action-item p-3 mb-3 border-round cursor-pointer"
                 :class="action.bgClass"
                 @click="action.action">
              <div class="flex align-items-center gap-3">
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <i :class="action.icon" class="text-white text-xl"></i>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-900 mb-1">{{ action.label }}</div>
                  <div class="text-sm text-600">{{ action.description }}</div>
                </div>
                <i class="pi pi-angle-left text-600"></i>
              </div>
            </div>
          </div>
          <Divider />
          <div class="p-4">
            <h4 class="text-lg font-semibold mb-3">حالة النظام</h4>
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between align-items-center">
                <span class="text-600">حالة الخادم</span>
                <Tag value="نشط" severity="success" icon="pi pi-check-circle" />
              </div>
              <div class="flex justify-content-between align-items-center">
                <span class="text-600">آخر تحديث</span>
                <span class="text-900 font-medium">{{ lastUpdate }}</span>
              </div>
              <div class="flex justify-content-between align-items-center">
                <span class="text-600">مستخدمين نشطين</span>
                <AvatarGroup>
                  <Avatar v-for="i in 4" :key="i" :label="String.fromCharCode(65 + i)" 
                          size="small" shape="circle" />
                  <Avatar label="+12" size="small" shape="circle" 
                          style="background-color: #6366f1" />
                </AvatarGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import ProgressBar from 'primevue/progressbar';
import Timeline from 'primevue/timeline';
import Divider from 'primevue/divider';
import Rating from 'primevue/rating';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';
import Badge from 'primevue/badge';
import Message from 'primevue/message';
import Breadcrumb from 'primevue/breadcrumb';
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';
import ScrollPanel from 'primevue/scrollpanel';
import Knob from 'primevue/knob';

const toast = useToast();
const loading = ref(false);
const selectedPeriod = ref('month');
const spendingPeriod = ref('month');
const chartViewType = ref('bar');
const activityFilter = ref('all');
const departmentSearch = ref('');

// Breadcrumb
const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });
const breadcrumbItems = ref([
  { label: 'لوحة التحكم', to: '/dashboard' }
]);

// Period Options
const periods = ref([
  { label: 'هذا الشهر', value: 'month' },
  { label: 'هذا الربع', value: 'quarter' },
  { label: 'هذه السنة', value: 'year' },
  { label: 'آخر 6 أشهر', value: 'half-year' }
]);

const chartViewOptions = ref([
  { label: 'أعمدة', value: 'bar' },
  { label: 'خطوط', value: 'line' }
]);

const spendingPeriodOptions = ref([
  { label: 'شهري', value: 'month' },
  { label: 'ربع سنوي', value: 'quarter' },
  { label: 'سنوي', value: 'year' }
]);

// Important Alerts
const importantAlerts = ref([
  {
    id: 1,
    severity: 'warn',
    icon: 'pi pi-exclamation-triangle',
    title: 'تنبيه هام',
    message: 'هناك 5 طلبات شراء عاجلة تحتاج إلى موافقة فورية',
    actionLabel: 'عرض الطلبات',
    action: () => console.log('View requests')
  }
]);

// Mock Statistics Data with Animation Support
const stats = ref({
  totalRequests: 156,
  requestsGrowth: 12.5,
  pendingRequests: 28,
  urgentPending: 5,
  mediumPending: 12,
  normalPending: 11,
  pendingPercentage: 18,
  totalSpending: 45750000,
  spendingGrowth: 8.3,
  activeVendors: 24,
  totalVendors: 45,
  newVendorsThisMonth: 3,
  avgVendorRating: 4.2,
  avgTransactionValue: 293500,
  budget: 120000000,
  budgetUsedPercentage: 38,
  remainingBudget: 74250000,
  monthlyAverage: 7625000,
  savingsPercentage: 15,
  warehouseChecks: 89,
  availableItems: 67,
  unavailableItems: 22,
  estimates: 142,
  pendingEstimates: 23,
  acceptedEstimates: 98,
  rejectedEstimates: 21,
  procurements: 134,
  completedProcurements: 112,
  inProgressProcurements: 22,
  completionRate: 84,
  activeCommittees: 8,
  totalCommittees: 12,
  totalCommitteeMembers: 56
});

// Animated Stats
const animatedStats = ref({
  totalRequests: 0,
  pendingRequests: 0,
  totalSpending: 0,
  activeVendors: 0
});

// Animate numbers on mount
const animateValue = (key, start, end, duration) => {
  const startTime = performance.now();
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    animatedStats.value[key] = Math.floor(start + (end - start) * easeOutQuart);
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
};

// Department Performance Data
const departmentPerformance = ref([
  {
    name: 'قسم تقنية المعلومات',
    code: 'IT-001',
    requests: 45,
    completed: 38,
    inProgress: 7,
    spending: 12500000,
    savings: 1250000,
    performance: 84,
    color: '#3b82f6',
    requestsTrend: 'up'
  },
  {
    name: 'قسم المشتريات',
    code: 'PUR-002',
    requests: 38,
    completed: 35,
    inProgress: 3,
    spending: 9800000,
    savings: 980000,
    performance: 92,
    color: '#10b981',
    requestsTrend: 'up'
  },
  {
    name: 'قسم المالية',
    code: 'FIN-003',
    requests: 32,
    completed: 28,
    inProgress: 4,
    spending: 8200000,
    savings: 820000,
    performance: 88,
    color: '#f59e0b',
    requestsTrend: 'down'
  },
  {
    name: 'قسم الموارد البشرية',
    code: 'HR-004',
    requests: 28,
    completed: 22,
    inProgress: 6,
    spending: 7100000,
    savings: 710000,
    performance: 79,
    color: '#ef4444',
    requestsTrend: 'up'
  },
  {
    name: 'قسم المخازن',
    code: 'WH-005',
    requests: 24,
    completed: 21,
    inProgress: 3,
    spending: 6300000,
    savings: 630000,
    performance: 88,
    color: '#8b5cf6',
    requestsTrend: 'up'
  },
  {
    name: 'قسم الصيانة',
    code: 'MN-006',
    requests: 19,
    completed: 15,
    inProgress: 4,
    spending: 4850000,
    savings: 485000,
    performance: 79,
    color: '#ec4899',
    requestsTrend: 'down'
  }
]);

// Recent Activities Data
const recentActivities = ref([
  {
    title: 'طلب شراء جديد - PR-00156',
    description: 'تم إنشاء طلب شراء جديد لمعدات مكتبية',
    time: 'منذ 5 دقائق',
    user: 'أحمد محمد',
    icon: 'pi pi-plus-circle',
    color: '#10b981',
    priority: 'عاجل',
    prioritySeverity: 'danger',
    tags: ['طلب جديد', 'معدات مكتبية']
  },
  {
    title: 'موافقة على عرض سعر',
    description: 'تمت الموافقة على عرض السعر من شركة التقنية الحديثة',
    time: 'منذ 15 دقيقة',
    user: 'فاطمة علي',
    icon: 'pi pi-check-circle',
    color: '#3b82f6',
    tags: ['موافقة', 'عرض سعر']
  },
  {
    title: 'فحص مخزون مكتمل',
    description: 'تم إكمال فحص المخزون لقسم تقنية المعلومات',
    time: 'منذ 30 دقيقة',
    user: 'محمود حسن',
    icon: 'pi pi-box',
    color: '#06b6d4',
    tags: ['مخزون', 'تقنية معلومات']
  },
  {
    title: 'رفض طلب شراء',
    description: 'تم رفض طلب الشراء PR-00143 بسبب تجاوز الميزانية',
    time: 'منذ ساعة',
    user: 'سارة خالد',
    icon: 'pi pi-times-circle',
    color: '#ef4444',
    priority: 'هام',
    prioritySeverity: 'warning',
    tags: ['رفض', 'ميزانية']
  },
  {
    title: 'إضافة مورد جديد',
    description: 'تم إضافة مورد جديد: شركة الأمل للتوريدات',
    time: 'منذ ساعتين',
    user: 'عمر يوسف',
    icon: 'pi pi-user-plus',
    color: '#8b5cf6',
    tags: ['مورد جديد']
  },
  {
    title: 'تحديث تقييم مورد',
    description: 'تم تحديث تقييم شركة النجاح إلى 4.5 نجوم',
    time: 'منذ 3 ساعات',
    user: 'ليلى أحمد',
    icon: 'pi pi-star',
    color: '#f59e0b',
    tags: ['تقييم', 'مورد']
  },
  {
    title: 'اكتمال عملية شراء',
    description: 'تم اكتمال عملية الشراء PROC-00125 بنجاح',
    time: 'منذ 4 ساعات',
    user: 'كريم سعيد',
    icon: 'pi pi-shopping-bag',
    color: '#ec4899',
    tags: ['اكتمال', 'عملية شراء']
  }
]);

// Top Departments
const topDepartments = ref([
  {
    name: 'قسم تقنية المعلومات',
    requests: 45,
    completed: 38,
    inProgress: 7,
    percentage: 29,
    color: '#3b82f6'
  },
  {
    name: 'قسم المشتريات',
    requests: 38,
    completed: 35,
    inProgress: 3,
    percentage: 24,
    color: '#10b981'
  },
  {
    name: 'قسم المالية',
    requests: 32,
    completed: 28,
    inProgress: 4,
    percentage: 21,
    color: '#f59e0b'
  },
  {
    name: 'قسم الموارد البشرية',
    requests: 28,
    completed: 22,
    inProgress: 6,
    percentage: 18,
    color: '#ef4444'
  },
  {
    name: 'قسم المخازن',
    requests: 24,
    completed: 21,
    inProgress: 3,
    percentage: 15,
    color: '#8b5cf6'
  }
]);

// Top Vendors
const topVendors = ref([
  {
    name: 'شركة التقنية الحديثة',
    category: 'معدات تقنية',
    value: 8500000,
    percentage: 28,
    rating: 4.8,
    reviews: 156,
    totalOffers: 45,
    acceptedOffers: 38,
    deliveryTime: 7,
    growth: 15,
    color: '#f59e0b'
  },
  {
    name: 'مؤسسة النجاح التجارية',
    category: 'مستلزمات مكتبية',
    value: 6800000,
    percentage: 22,
    rating: 4.5,
    reviews: 134,
    totalOffers: 52,
    acceptedOffers: 41,
    deliveryTime: 5,
    growth: 12,
    color: '#3b82f6'
  },
  {
    name: 'شركة الأمل للتجارة',
    category: 'أثاث ومفروشات',
    value: 5200000,
    percentage: 17,
    rating: 4.3,
    reviews: 98,
    totalOffers: 38,
    acceptedOffers: 29,
    deliveryTime: 10,
    growth: 8,
    color: '#10b981'
  },
  {
    name: 'مكتب الرائد للتوريدات',
    category: 'خدمات عامة',
    value: 4100000,
    percentage: 13,
    rating: 4.6,
    reviews: 112,
    totalOffers: 41,
    acceptedOffers: 35,
    deliveryTime: 6,
    growth: 10,
    color: '#ef4444'
  },
  {
    name: 'شركة الإبداع الرقمي',
    category: 'برمجيات وتطبيقات',
    value: 3600000,
    percentage: 12,
    rating: 4.7,
    reviews: 87,
    totalOffers: 28,
    acceptedOffers: 24,
    deliveryTime: 14,
    growth: 18,
    color: '#8b5cf6'
  }
]);

// Priority Breakdown
const priorityBreakdown = ref([
  { label: 'منخفض', level: 'low', count: 42, percentage: 27, color: '#22c55e' },
  { label: 'متوسط', level: 'medium', count: 78, percentage: 50, color: '#fb923c' },
  { label: 'عالي', level: 'high', count: 36, percentage: 23, color: '#ef4444' }
]);

// Efficiency Metrics
const efficiencyMetrics = ref([
  {
    label: 'متوسط وقت المعالجة',
    value: '3.5',
    unit: 'أيام',
    progress: 75,
    status: 'ممتاز',
    severity: 'success',
    icon: 'pi pi-clock',
    color: '#10b981',
    bgClass: 'bg-green-700'
  },
  {
    label: 'معدل قبول العروض',
    value: '69',
    unit: '%',
    progress: 69,
    status: 'جيد',
    severity: 'info',
    icon: 'pi pi-check-circle',
    color: '#3b82f6',
    bgClass: 'bg-blue-700'
  },
  {
    label: 'رضا الموردين',
    value: '4.4',
    unit: '/5',
    progress: 88,
    status: 'ممتاز',
    severity: 'success',
    icon: 'pi pi-heart',
    color: '#ec4899',
    bgClass: 'bg-pink-700'
  },
  {
    label: 'الالتزام بالمواعيد',
    value: '91',
    unit: '%',
    progress: 91,
    status: 'ممتاز',
    severity: 'success',
    icon: 'pi pi-calendar-check',
    color: '#8b5cf6',
    bgClass: 'bg-purple-700'
  }
]);

// Budget Breakdown
const budgetBreakdown = ref([
  { category: 'معدات تقنية', amount: 15000000, percentage: 33 },
  { category: 'مستلزمات مكتبية', amount: 12000000, percentage: 26 },
  { category: 'أثاث ومفروشات', amount: 10500000, percentage: 23 },
  { category: 'خدمات وصيانة', amount: 8250000, percentage: 18 }
]);

// Quick Actions
const quickActions = ref([
  {
    label: 'طلب شراء جديد',
    description: 'إنشاء طلب شراء جديد',
    icon: 'pi pi-plus-circle',
    color: '#10b981',
    bgClass: 'bg-green-800',
    action: () => toast.add({ severity: 'info', summary: 'طلب جديد', detail: 'فتح نموذج طلب شراء جديد', life: 3000 })
  },
  {
    label: 'مراجعة الطلبات المعلقة',
    description: '28 طلب بانتظار المراجعة',
    icon: 'pi pi-clock',
    color: '#f59e0b',
    bgClass: 'bg-orange-800',
    action: () => toast.add({ severity: 'warn', summary: 'طلبات معلقة', detail: 'عرض الطلبات المعلقة', life: 3000 })
  },
  {
    label: 'إضافة مورد جديد',
    description: 'تسجيل مورد في النظام',
    icon: 'pi pi-user-plus',
    color: '#3b82f6',
    bgClass: 'bg-blue-800',
    action: () => toast.add({ severity: 'info', summary: 'مورد جديد', detail: 'فتح نموذج إضافة مورد', life: 3000 })
  },
  {
    label: 'تقارير شاملة',
    description: 'عرض وتصدير التقارير',
    icon: 'pi pi-file-pdf',
    color: '#ef4444',
    bgClass: 'bg-red-800',
    action: () => toast.add({ severity: 'success', summary: 'تقارير', detail: 'فتح صفحة التقارير', life: 3000 })
  }
]);

const budgetUsed = ref(38);
const lastUpdate = ref('منذ 5 دقائق');

// Chart Data
const requestsChartData = ref({
  labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
  datasets: [
    {
      label: 'مسودة',
      backgroundColor: '#94a3b8',
      borderColor: '#94a3b8',
      data: [12, 15, 10, 18, 14, 16]
    },
    {
      label: 'معلق',
      backgroundColor: '#fb923c',
      borderColor: '#fb923c',
      data: [18, 22, 20, 25, 23, 28]
    },
    {
      label: 'موافق عليه',
      backgroundColor: '#22c55e',
      borderColor: '#22c55e',
      data: [32, 38, 35, 42, 40, 45]
    },
    {
      label: 'مرفوض',
      backgroundColor: '#ef4444',
      borderColor: '#ef4444',
      data: [5, 8, 6, 7, 9, 8]
    },
    {
      label: 'مكتمل',
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      data: [28, 32, 30, 35, 38, 42]
    }
  ]
});

const requestsChartOptions = ref({
  maintainAspectRatio: false,
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'bottom',
      rtl: true,
      labels: {
        font: { family: 'Cairo, sans-serif', size: 12 },
        usePointStyle: true,
        padding: 15,
        boxWidth: 8,
        boxHeight: 8
      }
    },
    tooltip: {
      rtl: true,
      titleFont: { family: 'Cairo, sans-serif' },
      bodyFont: { family: 'Cairo, sans-serif' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      stacked: true,
      ticks: { font: { family: 'Cairo, sans-serif' } },
      grid: { display: false }
    },
    y: {
      stacked: true,
      ticks: { font: { family: 'Cairo, sans-serif' } },
      grid: { color: '#f1f5f9' }
    }
  }
});

const priorityChartData = ref({
  labels: ['منخفض', 'متوسط', 'عالي'],
  datasets: [{
    data: [42, 78, 36],
    backgroundColor: ['#22c55e', '#fb923c', '#ef4444'],
    borderWidth: 0,
    hoverOffset: 10
  }]
});

const priorityChartOptions = ref({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      rtl: true,
      titleFont: { family: 'Cairo, sans-serif' },
      bodyFont: { family: 'Cairo, sans-serif' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8
    }
  }
});

const spendingChartData = ref({
  labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
  datasets: [
    {
      label: 'المصروفات الفعلية',
      data: [6500000, 7200000, 6800000, 7500000, 8100000, 7625000],
      fill: true,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 5,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    },
    {
      label: 'المصروفات المخططة',
      data: [7000000, 7500000, 7200000, 8000000, 8500000, 8000000],
      fill: false,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 4,
      pointBackgroundColor: '#10b981'
    },
    {
      label: 'الميزانية المتاحة',
      data: [10000000, 10000000, 10000000, 10000000, 10000000, 10000000],
      fill: false,
      borderColor: '#f59e0b',
      tension: 0,
      borderWidth: 2,
      borderDash: [10, 5],
      pointRadius: 0
    }
  ]
});

const spendingChartOptions = ref({
  maintainAspectRatio: false,
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      rtl: true,
      labels: {
        font: { family: 'Cairo, sans-serif', size: 12 },
        usePointStyle: true,
        padding: 15
      }
    },
    tooltip: {
      rtl: true,
      titleFont: { family: 'Cairo, sans-serif' },
      bodyFont: { family: 'Cairo, sans-serif' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          label += new Intl.NumberFormat('ar-IQ').format(context.parsed.y) + ' IQD';
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      ticks: { font: { family: 'Cairo, sans-serif' } },
      grid: { display: false }
    },
    y: {
      ticks: { 
        font: { family: 'Cairo, sans-serif' },
        callback: function(value) {
          return (value / 1000000).toFixed(1) + 'M';
        }
      },
      grid: { color: '#f1f5f9' }
    }
  }
});

// Mini Committee Chart
const miniCommitteeChart = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    data: [6, 7, 8, 7, 8, 8],
    borderColor: '#14b8a6',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    fill: true,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 0
  }]
});

const miniChartOptions = ref({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  },
  scales: {
    x: { display: false },
    y: { display: false }
  }
});

// Computed Properties
const filteredDepartmentPerformance = computed(() => {
  if (!departmentSearch.value) return departmentPerformance.value;
  return departmentPerformance.value.filter(dept => 
    dept.name.includes(departmentSearch.value) || 
    dept.code.includes(departmentSearch.value)
  );
});

const filteredActivities = computed(() => {
  if (activityFilter.value === 'all') return recentActivities.value;
  return recentActivities.value.filter(activity => activity.priority);
});

// Methods
const refreshData = () => {
  loading.value = true;
  toast.add({
    severity: 'info',
    summary: 'جاري التحديث',
    detail: 'يتم تحديث بيانات لوحة التحكم...',
    life: 2000
  });
  
  setTimeout(() => {
    loading.value = false;
    toast.add({
      severity: 'success',
      summary: 'تم التحديث',
      detail: 'تم تحديث البيانات بنجاح',
      life: 3000
    });
  }, 1500);
};

const onPeriodChange = () => {
  toast.add({
    severity: 'info',
    summary: 'تغيير الفترة',
    detail: `تم تغيير الفترة إلى: ${periods.value.find(p => p.value === selectedPeriod.value)?.label}`,
    life: 2000
  });
};

const toggleChartMenu = () => {
  toast.add({
    severity: 'info',
    summary: 'خيارات المخطط',
    detail: 'فتح قائمة خيارات المخطط',
    life: 2000
  });
};

const refreshPriorityData = () => {
  toast.add({
    severity: 'success',
    summary: 'تحديث',
    detail: 'تم تحديث بيانات الأولويات',
    life: 2000
  });
};

const formatCurrency = (value) => {
  if (!value) return '0 IQD';
  return new Intl.NumberFormat('ar-IQ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' IQD';
};

const getPerformanceClass = (value) => {
  if (value >= 85) return 'performance-excellent';
  if (value >= 70) return 'performance-good';
  return 'performance-average';
};

const getPerformanceTextClass = (value) => {
  if (value >= 85) return 'text-green-600';
  if (value >= 70) return 'text-blue-600';
  return 'text-orange-600';
};

// Lifecycle
onMounted(() => {
  // Animate statistics on mount
  animateValue('totalRequests', 0, stats.value.totalRequests, 1000);
  animateValue('pendingRequests', 0, stats.value.pendingRequests, 1200);
  animateValue('totalSpending', 0, stats.value.totalSpending, 1500);
  animateValue('activeVendors', 0, stats.value.activeVendors, 1300);
  
  toast.add({
    severity: 'success',
    summary: 'مرحباً بك',
    detail: 'تم تحميل لوحة التحكم بنجاح',
    life: 3000
  });
});

// Watch for chart type changes
watch(chartViewType, () => {
  requestsChartOptions.value.scales.x.stacked = chartViewType.value === 'bar';
  requestsChartOptions.value.scales.y.stacked = chartViewType.value === 'bar';
});
</script>

<style scoped>
.dashboard-container {
    padding: 2rem;
    direction: rtl;
    min-height: 100vh;
}

/* Gradient Cards */
.gradient-card-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: transform 0.3s, box-shadow 0.3s;
}

.gradient-card-orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  transition: transform 0.3s, box-shadow 0.3s;
}

.gradient-card-green {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  transition: transform 0.3s, box-shadow 0.3s;
}

.gradient-card-purple {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #1e293b;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

.stat-icon-wrapper {
  width: 4rem;
  height: 4rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.stat-card-hover {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.stat-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
  border-color: var(--primary-color);
}

.stat-mini-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Chart Containers */
.chart-container {
  overflow: hidden;
}

.chart-header {
  background: linear-gradient(to bottom, rgba(59, 130, 246, 0.05), transparent);
}

.chart-footer {
  background: linear-gradient(to top, rgba(59, 130, 246, 0.05), transparent);
}

.chart-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

/* Priority Indicators */
.priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-low { background-color: #22c55e; }
.priority-medium { background-color: #fb923c; }
.priority-high { background-color: #ef4444; }

.priority-chip-low { background-color: rgba(34, 197, 94, 0.1); color: #22c55e; }
.priority-chip-medium { background-color: rgba(251, 146, 60, 0.1); color: #fb923c; }
.priority-chip-high { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

/* Timeline Styles */
.timeline-marker-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.timeline-connector {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, #e2e8f0, transparent);
  margin-top: 0.5rem;
}

.activity-card {
  background: var(--surface-card);
  transition: all 0.2s;
}

.activity-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color) !important;
}

/* Department & Vendor Items */
.department-item,
.vendor-item {
  border: 1px solid transparent;
  transition: all 0.2s;
}

.department-item:hover,
.vendor-item:hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateX(-4px);
}

.rank-badge {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1e293b;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #1e293b;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e5a869 100%);
  color: white;
}

.rank-4,
.rank-5 {
  background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
  color: white;
}

.vendor-badge {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Performance Styles */
.performance-excellent :deep(.p-progressbar-value) {
  background: linear-gradient(to right, #10b981, #22c55e);
}

.performance-good :deep(.p-progressbar-value) {
  background: linear-gradient(to right, #3b82f6, #60a5fa);
}

.performance-average :deep(.p-progressbar-value) {
  background: linear-gradient(to right, #f59e0b, #fbbf24);
}

.dept-progress :deep(.p-progressbar-value) {
  background: linear-gradient(to right, #667eea, #764ba2);
}

/* Quick Actions */
.quick-action-item {
  border: 1px solid transparent;
  transition: all 0.2s;
}

.quick-action-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: scale(1.02);
}

.action-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* DataTable Enhancements */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: rgba(59, 130, 246, 0.05) !important;
}

:deep(.p-datatable-striped .p-datatable-tbody > tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}

/* ScrollPanel */
:deep(.custom-scrollpanel .p-scrollpanel-bar) {
  background-color: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 992px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .gradient-text {
    font-size: 2rem;
  }
  
  .stat-icon-wrapper {
    width: 3rem;
    height: 3rem;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    text-align: center;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .chart-footer .grid {
    text-align: center;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card,
.surface-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Loading State */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Print Styles */
@media print {
  .dashboard-container {
    background: white;
    padding: 0;
  }
  
  .gradient-card-blue,
  .gradient-card-orange,
  .gradient-card-green,
  .gradient-card-purple {
    background: white !important;
    color: black !important;
    border: 1px solid #e5e7eb;
  }
  
  button,
  .p-breadcrumb,
  .quick-action-item {
    display: none;
  }
}
</style>