<template>
  <div class="dashboard-wrapper">
    <!-- Header Section -->
    <div class="mb-5">
      <div class="flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-3" />
          <h1 class="text-5xl font-bold m-0 mb-3 text-white">لوحة التحكم الرئيسية</h1>
          <p class="text-400 m-0 text-xl">نظرة شاملة على أداء نظام إدارة المشتريات</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <Button icon="pi pi-download" label="تصدير" severity="success" outlined />
          <Button icon="pi pi-chart-line" label="تحليلات" severity="info" outlined />
          <Button icon="pi pi-refresh" @click="refreshData" :loading="loading" rounded />
          <Dropdown 
            v-model="selectedPeriod" 
            :options="periods" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="اختر الفترة" 
            class="w-12rem"
          >
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

    <!-- Alert Banner -->
    <div class="mb-5" v-if="importantAlerts.length > 0">
      <Message 
        v-for="alert in importantAlerts" 
        :key="alert.id" 
        :severity="alert.severity" 
        :closable="true"
      >
        <div class="flex align-items-center gap-3">
          <i :class="alert.icon" class="text-2xl"></i>
          <div class="flex-1">
            <strong class="block mb-2">{{ alert.title }}</strong>
            <p class="m-0">{{ alert.message }}</p>
          </div>
          <Button :label="alert.actionLabel" text @click="alert.action" />
        </div>
      </Message>
    </div>

    <!-- Main Statistics Cards -->
    <div class="grid mb-5">
      <!-- Total Requests -->
      <div class="col-12 sm:col-6 lg:col-3">
        <div class="stat-card stat-card-total surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex-1">
              <span class="block text-600 font-medium mb-2 text-sm">إجمالي طلبات الشراء</span>
              <div class="text-900 font-bold text-4xl mb-1">{{ animatedStats.totalRequests }}</div>
              <span class="text-sm text-500">جميع الطلبات في النظام</span>
            </div>
            <div class="icon-container icon-total border-round-lg flex align-items-center justify-content-center">
              <i class="pi pi-shopping-cart text-2xl"></i>
            </div>
          </div>
          <div class="progress-bar progress-total border-round relative overflow-hidden" style="height: 18px;">
            <div
              class="progress-fill-total h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
              :style="{ width: Math.round((stats.totalRequests / 200) * 100) + '%' }"
            >
              {{ Math.round((stats.totalRequests / 200) * 100) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div class="col-12 sm:col-6 lg:col-3">
        <div class="stat-card stat-card-pending surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex-1">
              <span class="block text-600 font-medium mb-2 text-sm">قيد الانتظار</span>
              <div class="text-900 font-bold text-4xl mb-1">{{ animatedStats.pendingRequests }}</div>
              <span class="text-sm text-500">في انتظار المراجعة</span>
            </div>
            <div class="icon-container icon-pending border-round-lg flex align-items-center justify-content-center">
              <i class="pi pi-clock text-2xl"></i>
            </div>
          </div>
          <div class="progress-bar progress-pending border-round relative overflow-hidden" style="height: 18px;">
            <div
              class="progress-fill-pending h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
              :style="{ width: stats.pendingPercentage + '%' }"
            >
              {{ stats.pendingPercentage }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Total Spending -->
      <div class="col-12 sm:col-6 lg:col-3">
        <div class="stat-card stat-card-approved surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex-1">
              <span class="block text-600 font-medium mb-2 text-sm">إجمالي المصروفات</span>
              <div class="text-900 font-bold text-3xl mb-1">{{ formatCurrency(animatedStats.totalSpending) }}</div>
              <span class="text-sm text-500">المصروفات الإجمالية</span>
            </div>
            <div class="icon-container icon-approved border-round-lg flex align-items-center justify-content-center">
              <i class="pi pi-dollar text-2xl"></i>
            </div>
          </div>
          <div class="progress-bar progress-approved border-round relative overflow-hidden" style="height: 18px;">
            <div
              class="progress-fill-approved h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
              :style="{ width: stats.budgetUsedPercentage + '%' }"
            >
              {{ stats.budgetUsedPercentage }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Active Vendors -->
      <div class="col-12 sm:col-6 lg:col-3">
        <div class="stat-card stat-card-rejected surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
          <div class="flex justify-content-between align-items-start mb-3">
            <div class="flex-1">
              <span class="block text-600 font-medium mb-2 text-sm">الموردين النشطين</span>
              <div class="text-900 font-bold text-4xl mb-1">{{ animatedStats.activeVendors }}</div>
              <span class="text-sm text-500">موردين معتمدين</span>
            </div>
            <div class="icon-container icon-rejected border-round-lg flex align-items-center justify-content-center">
              <i class="pi pi-users text-2xl"></i>
            </div>
          </div>
          <div class="progress-bar progress-rejected border-round relative overflow-hidden" style="height: 18px;">
            <div
              class="progress-fill-rejected h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
              :style="{ width: Math.round((stats.activeVendors / stats.totalVendors) * 100) + '%' }"
            >
              {{ Math.round((stats.activeVendors / stats.totalVendors) * 100) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Statistics -->
    <div class="grid mb-5">
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="secondary-card">
          <template #content>
            <div class="p-3">
              <div class="flex align-items-center gap-3 mb-3">
                <div class="icon-wrapper bg-cyan-500">
                  <i class="pi pi-box text-white text-2xl"></i>
                </div>
                <div class="flex-1">
                  <span class="block text-400 text-sm mb-1">فحوصات المخزن</span>
                  <div class="text-white font-bold text-3xl">{{ stats.warehouseChecks }}</div>
                </div>
              </div>
              <div class="grid text-sm mb-3">
                <div class="col-6">
                  <div class="text-500">متوفر</div>
                  <div class="text-green-400 font-semibold">{{ stats.availableItems }}</div>
                </div>
                <div class="col-6">
                  <div class="text-500">غير متوفر</div>
                  <div class="text-red-400 font-semibold">{{ stats.unavailableItems }}</div>
                </div>
              </div>
              <ProgressBar 
                :value="(stats.availableItems / stats.warehouseChecks) * 100" 
                :showValue="false" 
                style="height: 4px"
                class="progress-cyan"
              />
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="secondary-card">
          <template #content>
            <div class="p-3">
              <div class="flex align-items-center gap-3 mb-3">
                <div class="icon-wrapper bg-indigo-500">
                  <i class="pi pi-file-edit text-white text-2xl"></i>
                </div>
                <div class="flex-1">
                  <span class="block text-400 text-sm mb-1">عروض الأسعار</span>
                  <div class="text-white font-bold text-3xl">{{ stats.estimates }}</div>
                </div>
                <Knob 
                  :modelValue="(stats.acceptedEstimates / stats.estimates) * 100" 
                  :size="60" 
                  :strokeWidth="8" 
                  readonly 
                  valueColor="#6366f1" 
                  rangeColor="#312e81"
                  textColor="#fff"
                />
              </div>
              <div class="grid text-sm">
                <div class="col-4 text-center">
                  <div class="text-500 text-xs">معلقة</div>
                  <div class="text-orange-400 font-semibold">{{ stats.pendingEstimates }}</div>
                </div>
                <div class="col-4 text-center">
                  <div class="text-500 text-xs">مقبولة</div>
                  <div class="text-green-400 font-semibold">{{ stats.acceptedEstimates }}</div>
                </div>
                <div class="col-4 text-center">
                  <div class="text-500 text-xs">مرفوضة</div>
                  <div class="text-red-400 font-semibold">{{ stats.rejectedEstimates }}</div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="secondary-card">
          <template #content>
            <div class="p-3">
              <div class="flex align-items-center gap-3 mb-3">
                <div class="icon-wrapper bg-pink-500">
                  <i class="pi pi-shopping-bag text-white text-2xl"></i>
                </div>
                <div class="flex-1">
                  <span class="block text-400 text-sm mb-1">عمليات الشراء</span>
                  <div class="text-white font-bold text-3xl">{{ stats.procurements }}</div>
                </div>
                <div class="text-right">
                  <div class="text-green-400 font-bold text-xl">{{ stats.completionRate }}%</div>
                  <div class="text-500 text-xs">إنجاز</div>
                </div>
              </div>
              <div class="flex justify-content-between text-sm mb-2">
                <span class="text-500">قيد التنفيذ: {{ stats.inProgressProcurements }}</span>
                <span class="text-green-400 font-semibold">مكتملة: {{ stats.completedProcurements }}</span>
              </div>
              <ProgressBar 
                :value="stats.completionRate" 
                :showValue="false" 
                style="height: 4px"
                class="progress-green"
              />
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <Card class="secondary-card">
          <template #content>
            <div class="p-3">
              <div class="flex align-items-center gap-3 mb-3">
                <div class="icon-wrapper bg-teal-500">
                  <i class="pi pi-sitemap text-white text-2xl"></i>
                </div>
                <div class="flex-1">
                  <span class="block text-400 text-sm mb-1">اللجان النشطة</span>
                  <div class="text-white font-bold text-3xl">{{ stats.activeCommittees }}</div>
                </div>
              </div>
              <div class="flex justify-content-between text-sm">
                <div>
                  <div class="text-500 text-xs">إجمالي</div>
                  <div class="text-blue-400 font-semibold">{{ stats.totalCommittees }}</div>
                </div>
                <div class="text-right">
                  <div class="text-500 text-xs">أعضاء</div>
                  <div class="text-white font-semibold">{{ stats.totalCommitteeMembers }}</div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid mb-5">
      <!-- Requests Chart -->
      <div class="col-12 lg:col-8">
        <Card class="chart-card">
          <template #header>
            <div class="p-4">
              <div class="flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h3 class="text-2xl font-bold m-0 mb-2 text-white">تحليل طلبات الشراء</h3>
                  <p class="text-400 m-0">توزيع الطلبات خلال الأشهر الستة الأخيرة</p>
                </div>
                <div class="flex gap-2">
                  <SelectButton 
                    v-model="chartViewType" 
                    :options="chartViewOptions" 
                    optionLabel="label" 
                    optionValue="value"
                  />
                </div>
              </div>
            </div>
          </template>
          <template #content>
            <Chart 
              :type="chartViewType" 
              :data="requestsChartData" 
              :options="requestsChartOptions" 
              :height="350" 
            />
          </template>
          <template #footer>
            <div class="p-4">
              <div class="grid">
                <div class="col-6 md:col-3" v-for="(dataset, index) in requestsChartData.datasets" :key="index">
                  <div class="flex align-items-center gap-2">
                    <div class="legend-dot" :style="{ backgroundColor: dataset.backgroundColor }"></div>
                    <div>
                      <div class="text-400 text-sm">{{ dataset.label }}</div>
                      <div class="text-white font-bold">{{ dataset.data.reduce((a, b) => a + b, 0) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Priority Chart -->
      <div class="col-12 lg:col-4">
        <Card class="chart-card h-full">
          <template #header>
            <div class="p-4">
              <div class="flex justify-content-between align-items-center mb-2">
                <h3 class="text-2xl font-bold m-0 text-white">توزيع الأولويات</h3>
                <Button icon="pi pi-refresh" rounded text @click="refreshPriorityData" />
              </div>
              <p class="text-400 m-0">نسب الطلبات حسب الأولوية</p>
            </div>
          </template>
          <template #content>
            <Chart 
              type="doughnut" 
              :data="priorityChartData" 
              :options="priorityChartOptions" 
              :height="280" 
            />
          </template>
          <template #footer>
            <div class="p-4">
              <div class="flex flex-column gap-3">
                <div 
                  v-for="(priority, index) in priorityBreakdown" 
                  :key="index" 
                  class="flex justify-content-between align-items-center"
                >
                  <div class="flex align-items-center gap-2">
                    <div class="priority-dot" :style="{ backgroundColor: priority.color }"></div>
                    <span class="text-white font-medium">{{ priority.label }}</span>
                  </div>
                  <div class="flex align-items-center gap-3">
                    <span class="text-400">{{ priority.count }}</span>
                    <Chip :label="priority.percentage + '%'" class="priority-chip" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Department Performance & Activities -->
    <div class="grid mb-5">
      <!-- Department Performance -->
      <div class="col-12 lg:col-7">
        <Card class="table-card">
          <template #header>
            <div class="p-4">
              <div class="flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h3 class="text-2xl font-bold m-0 mb-2 text-white">أداء الأقسام</h3>
                  <p class="text-400 m-0">مقارنة شاملة لأداء الأقسام</p>
                </div>
                <InputText 
                  v-model="departmentSearch" 
                  placeholder="بحث..." 
                  class="w-full md:w-auto"
                >
                  <template #prefix>
                    <i class="pi pi-search"></i>
                  </template>
                </InputText>
              </div>
            </div>
          </template>
          <template #content>
            <DataTable 
              :value="filteredDepartmentPerformance" 
              :rows="5" 
              :paginator="true" 
              responsiveLayout="scroll"
              class="dark-table"
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
                      <div class="font-bold text-white">{{ slotProps.data.name }}</div>
                      <div class="text-sm text-500">{{ slotProps.data.code }}</div>
                    </div>
                  </div>
                </template>
              </Column>
              <Column field="requests" header="الطلبات" sortable>
                <template #body="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Tag :value="slotProps.data.requests" severity="info" rounded />
                    <i 
                      v-if="slotProps.data.requestsTrend === 'up'" 
                      class="pi pi-arrow-up text-green-400 text-xs"
                    ></i>
                    <i 
                      v-else 
                      class="pi pi-arrow-down text-red-400 text-xs"
                    ></i>
                  </div>
                </template>
              </Column>
              <Column field="completed" header="المكتملة" sortable>
                <template #body="slotProps">
                  <div class="text-center">
                    <div class="text-white font-bold">{{ slotProps.data.completed }}</div>
                    <div class="text-xs text-500">من {{ slotProps.data.requests }}</div>
                  </div>
                </template>
              </Column>
              <Column field="spending" header="المصروفات" sortable>
                <template #body="slotProps">
                  <div>
                    <div class="font-bold text-white">{{ formatCurrency(slotProps.data.spending) }}</div>
                    <div class="text-xs text-green-400">{{ formatCurrency(slotProps.data.savings) }} توفير</div>
                  </div>
                </template>
              </Column>
              <Column field="performance" header="الأداء" sortable>
                <template #body="slotProps">
                  <div>
                    <div class="flex align-items-center gap-2 mb-2">
                      <ProgressBar 
                        :value="slotProps.data.performance" 
                        :showValue="false" 
                        :class="getPerformanceClass(slotProps.data.performance)"
                        style="height: 8px; flex: 1" 
                      />
                      <span class="text-sm font-bold" :class="getPerformanceTextClass(slotProps.data.performance)">
                        {{ slotProps.data.performance }}%
                      </span>
                    </div>
                    <Rating 
                      :modelValue="Math.round(slotProps.data.performance / 20)" 
                      :readonly="true" 
                      :cancel="false" 
                      :stars="5"
                    />
                  </div>
                </template>
              </Column>
              <Column header="إجراءات" style="width: 100px">
                <template #body>
                  <Button 
                    icon="pi pi-eye" 
                    rounded 
                    text 
                    severity="info" 
                    v-tooltip.top="'عرض'"
                  />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <!-- Recent Activities -->
      <div class="col-12 lg:col-5">
        <Card class="activity-card h-full">
          <template #header>
            <div class="p-4">
              <div class="flex justify-content-between align-items-center mb-2">
                <h3 class="text-2xl font-bold m-0 text-white">الأنشطة الأخيرة</h3>
                <div class="flex gap-2">
                  <Button 
                    label="الكل" 
                    text 
                    size="small" 
                    :severity="activityFilter === 'all' ? 'primary' : 'secondary'"
                    @click="activityFilter = 'all'" 
                  />
                  <Button 
                    label="هام" 
                    text 
                    size="small" 
                    :severity="activityFilter === 'important' ? 'danger' : 'secondary'"
                    @click="activityFilter = 'important'" 
                  />
                </div>
              </div>
              <p class="text-400 m-0">آخر التحديثات في النظام</p>
            </div>
          </template>
          <template #content>
            <ScrollPanel style="width: 100%; height: 500px">
              <div class="p-4">
                <Timeline :value="filteredActivities" align="right">
                  <template #marker="slotProps">
                    <div class="timeline-marker" :style="{ backgroundColor: slotProps.item.color }">
                      <i :class="slotProps.item.icon"></i>
                    </div>
                  </template>
                  <template #content="slotProps">
                    <div class="activity-item mb-4 p-3 border-round border-1 border-100">
                      <div class="flex justify-content-between align-items-start mb-2">
                        <div class="flex-1">
                          <div class="flex align-items-center gap-2 mb-1">
                            <span class="font-bold text-white">{{ slotProps.item.title }}</span>
                            <Badge 
                              v-if="slotProps.item.priority" 
                              :value="slotProps.item.priority" 
                              :severity="slotProps.item.prioritySeverity" 
                            />
                          </div>
                          <p class="text-400 text-sm m-0 mb-2">{{ slotProps.item.description }}</p>
                          <div class="flex align-items-center gap-3 text-xs text-500">
                            <span><i class="pi pi-user"></i> {{ slotProps.item.user }}</span>
                            <span><i class="pi pi-clock"></i> {{ slotProps.item.time }}</span>
                          </div>
                        </div>
                      </div>
                      <div v-if="slotProps.item.tags" class="flex gap-1 flex-wrap mt-2">
                        <Chip 
                          v-for="tag in slotProps.item.tags" 
                          :key="tag" 
                          :label="tag" 
                          class="tag-chip"
                        />
                      </div>
                    </div>
                  </template>
                </Timeline>
              </div>
            </ScrollPanel>
          </template>
        </Card>
      </div>
    </div>

    <!-- Spending Trend Chart -->
    <div class="grid mb-5">
      <div class="col-12">
        <Card class="chart-card">
          <template #header>
            <div class="p-4">
              <div class="flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h3 class="text-2xl font-bold m-0 mb-2 text-white">تحليل المصروفات</h3>
                  <p class="text-400 m-0">مقارنة المصروفات الفعلية مع المخططة</p>
                </div>
                <div class="flex gap-2 align-items-center">
                  <span class="text-400 text-sm">عرض:</span>
                  <SelectButton 
                    v-model="spendingPeriod" 
                    :options="spendingPeriodOptions" 
                    optionLabel="label" 
                    optionValue="value"
                  />
                </div>
              </div>
            </div>
          </template>
          <template #content>
            <Chart 
              type="line" 
              :data="spendingChartData" 
              :options="spendingChartOptions" 
              :height="300" 
            />
          </template>
          <template #footer>
            <div class="p-4">
              <div class="grid">
                <div class="col-12 md:col-3">
                  <div class="text-center p-3 border-round bg-blue-900">
                    <i class="pi pi-chart-line text-blue-400 text-2xl mb-2"></i>
                    <div class="text-400 text-sm mb-1">إجمالي المصروفات</div>
                    <div class="text-white font-bold text-xl">{{ formatCurrency(stats.totalSpending) }}</div>
                  </div>
                </div>
                <div class="col-12 md:col-3">
                  <div class="text-center p-3 border-round bg-green-900">
                    <i class="pi pi-dollar text-green-400 text-2xl mb-2"></i>
                    <div class="text-400 text-sm mb-1">الميزانية المتبقية</div>
                    <div class="text-white font-bold text-xl">{{ formatCurrency(stats.remainingBudget) }}</div>
                  </div>
                </div>
                <div class="col-12 md:col-3">
                  <div class="text-center p-3 border-round bg-orange-900">
                    <i class="pi pi-calendar text-orange-400 text-2xl mb-2"></i>
                    <div class="text-400 text-sm mb-1">متوسط شهري</div>
                    <div class="text-white font-bold text-xl">{{ formatCurrency(stats.monthlyAverage) }}</div>
                  </div>
                </div>
                <div class="col-12 md:col-3">
                  <div class="text-center p-3 border-round bg-purple-900">
                    <i class="pi pi-percentage text-purple-400 text-2xl mb-2"></i>
                    <div class="text-400 text-sm mb-1">نسبة التوفير</div>
                    <div class="text-white font-bold text-xl">{{ stats.savingsPercentage }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Top Performers -->
    <div class="grid mb-5">
      <!-- Top Departments -->
      <div class="col-12 md:col-6">
        <Card class="rank-card h-full">
          <template #header>
            <div class="p-4">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <h3 class="text-2xl font-bold m-0 mb-1 text-white">أكثر الأقسام نشاطاً</h3>
                  <p class="text-400 m-0">ترتيب الأقسام حسب عدد الطلبات</p>
                </div>
                <Button icon="pi pi-chart-bar" rounded outlined />
              </div>
            </div>
          </template>
          <template #content>
            <div class="p-4">
              <div 
                v-for="(dept, index) in topDepartments" 
                :key="index" 
                class="department-item p-3 mb-3 border-round border-1 border-100"
              >
                <div class="flex align-items-center gap-3">
                  <div class="rank-badge" :class="'rank-' + (index + 1)">
                    <span class="font-bold">{{ index + 1 }}</span>
                  </div>
                  <Avatar 
                    :label="dept.name.charAt(0)" 
                    size="xlarge" 
                    shape="circle" 
                    :style="{ backgroundColor: dept.color, color: 'white' }" 
                  />
                  <div class="flex-1">
                    <div class="flex justify-content-between align-items-center mb-2">
                      <span class="font-bold text-white text-lg">{{ dept.name }}</span>
                      <div class="text-right">
                        <div class="text-white font-bold">{{ dept.requests }}</div>
                        <div class="text-xs text-500">طلب</div>
                      </div>
                    </div>
                    <div class="flex align-items-center gap-2 mb-2">
                      <ProgressBar 
                        :value="dept.percentage" 
                        :showValue="false" 
                        style="height: 6px; flex: 1"
                        class="progress-primary"
                      />
                      <span class="text-sm font-semibold text-primary">{{ dept.percentage }}%</span>
                    </div>
                    <div class="flex gap-2">
                      <Chip :label="'مكتمل: ' + dept.completed" size="small" class="chip-small" />
                      <Chip :label="'تنفيذ: ' + dept.inProgress" severity="warning" size="small" class="chip-small" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Top Vendors -->
      <div class="col-12 md:col-6">
        <Card class="rank-card h-full">
          <template #header>
            <div class="p-4">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <h3 class="text-2xl font-bold m-0 mb-1 text-white">أفضل الموردين</h3>
                  <p class="text-400 m-0">ترتيب الموردين حسب الأداء</p>
                </div>
                <Button icon="pi pi-star" rounded outlined severity="warning" />
              </div>
            </div>
          </template>
          <template #content>
            <div class="p-4">
              <div 
                v-for="(vendor, index) in topVendors" 
                :key="index" 
                class="vendor-item p-3 mb-3 border-round border-1 border-100"
              >
                <div class="flex align-items-center gap-3">
                  <div class="vendor-badge" :style="{ backgroundColor: vendor.color }">
                    <i class="pi pi-star-fill text-white"></i>
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-content-between align-items-center mb-2">
                      <div>
                        <div class="font-bold text-white">{{ vendor.name }}</div>
                        <div class="text-xs text-500">{{ vendor.category }}</div>
                      </div>
                      <div class="text-right">
                        <div class="font-bold text-white">{{ formatCurrency(vendor.value) }}</div>
                        <div class="text-xs text-green-400">+{{ vendor.growth }}%</div>
                      </div>
                    </div>
                    <div class="flex align-items-center justify-content-between mb-2">
                      <Rating 
                        :modelValue="vendor.rating" 
                        :readonly="true" 
                        :cancel="false" 
                        :stars="5"
                      />
                      <span class="text-sm text-400">({{ vendor.reviews }})</span>
                    </div>
                    <div class="flex gap-2 text-xs flex-wrap">
                      <Tag :value="'عروض: ' + vendor.totalOffers" severity="info" rounded />
                      <Tag :value="'مقبول: ' + vendor.acceptedOffers" severity="success" rounded />
                      <Tag :value="vendor.deliveryTime + ' يوم'" rounded />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Additional Analytics -->
    <div class="grid mb-5">
      <!-- Efficiency Metrics -->
      <div class="col-12 lg:col-4">
        <Card class="metrics-card h-full">
          <template #header>
            <div class="p-4">
              <h3 class="text-2xl font-bold m-0 mb-1 text-white">مؤشرات الكفاءة</h3>
              <p class="text-400 m-0">قياس أداء العمليات</p>
            </div>
          </template>
          <template #content>
            <div class="p-4">
              <div 
                v-for="metric in efficiencyMetrics" 
                :key="metric.label" 
                class="metric-item mb-4 p-4 border-round"
                :class="metric.bgClass"
              >
                <div class="flex justify-content-between align-items-center mb-3">
                  <span class="font-semibold text-white">{{ metric.label }}</span>
                  <i :class="metric.icon" class="text-3xl" :style="{ color: metric.color }"></i>
                </div>
                <div class="flex align-items-end gap-2 mb-3">
                  <span class="text-5xl font-bold text-white">{{ metric.value }}</span>
                  <span class="text-400 text-lg mb-1">{{ metric.unit }}</span>
                </div>
                <div class="flex align-items-center justify-content-between">
                  <ProgressBar 
                    :value="metric.progress" 
                    :showValue="false" 
                    style="height: 6px; flex: 1" 
                    class="mr-2"
                  />
                  <Tag :value="metric.status" :severity="metric.severity" />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Budget Overview -->
      <div class="col-12 lg:col-4">
        <Card class="budget-card h-full">
          <template #header>
            <div class="p-4">
              <h3 class="text-2xl font-bold m-0 mb-1 text-white">نظرة على الميزانية</h3>
              <p class="text-400 m-0">توزيع الميزانية المخصصة</p>
            </div>
          </template>
          <template #content>
            <div class="p-4">
              <div class="text-center mb-4">
                <Knob 
                  v-model="budgetUsed" 
                  :size="180" 
                  :strokeWidth="12" 
                  valueColor="#10b981" 
                  rangeColor="#1f2937" 
                  textColor="#fff" 
                  :max="100" 
                  :readonly="true" 
                />
                <div class="mt-4">
                  <div class="text-400 mb-2">الميزانية المستخدمة</div>
                  <div class="text-4xl font-bold text-white mb-1">{{ formatCurrency(stats.totalSpending) }}</div>
                  <div class="text-500">من {{ formatCurrency(stats.budget) }}</div>
                </div>
              </div>
              <Divider class="border-700" />
              <div class="mt-4">
                <div v-for="item in budgetBreakdown" :key="item.category" class="mb-3">
                  <div class="flex justify-content-between align-items-center mb-2">
                    <span class="text-white font-medium">{{ item.category }}</span>
                    <span class="text-400">{{ formatCurrency(item.amount) }}</span>
                  </div>
                  <ProgressBar 
                    :value="item.percentage" 
                    :showValue="false" 
                    style="height: 6px"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 lg:col-4">
        <Card class="actions-card h-full">
          <template #header>
            <div class="p-4">
              <h3 class="text-2xl font-bold m-0 mb-1 text-white">إجراءات سريعة</h3>
              <p class="text-400 m-0">الوصول للعمليات الشائعة</p>
            </div>
          </template>
          <template #content>
            <div class="p-4">
              <div 
                v-for="action in quickActions" 
                :key="action.label" 
                class="action-item p-3 mb-3 border-round border-1 border-100"
                @click="action.action"
              >
                <div class="flex align-items-center gap-3">
                  <div class="action-icon-wrapper" :style="{ backgroundColor: action.color }">
                    <i :class="action.icon" class="text-white text-xl"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-white mb-1">{{ action.label }}</div>
                    <div class="text-sm text-400">{{ action.description }}</div>
                  </div>
                  <i class="pi pi-angle-left text-400"></i>
                </div>
              </div>
              <Divider class="border-700 my-4" />
              <div>
                <h4 class="text-lg font-semibold mb-3 text-white">حالة النظام</h4>
                <div class="flex flex-column gap-3">
                  <div class="flex justify-content-between align-items-center">
                    <span class="text-400">حالة الخادم</span>
                    <Tag value="نشط" severity="success" icon="pi pi-check-circle" />
                  </div>
                  <div class="flex justify-content-between align-items-center">
                    <span class="text-400">آخر تحديث</span>
                    <span class="text-white font-medium">{{ lastUpdate }}</span>
                  </div>
                  <div class="flex justify-content-between align-items-center">
                    <span class="text-400">مستخدمين نشطين</span>
                    <AvatarGroup>
                      <Avatar 
                        v-for="i in 4" 
                        :key="i" 
                        :label="String.fromCharCode(65 + i)" 
                        size="small" 
                        shape="circle"
                        class="avatar-small"
                      />
                      <Avatar 
                        label="+12" 
                        size="small" 
                        shape="circle" 
                        style="background-color: #6366f1"
                      />
                    </AvatarGroup>
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

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
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
const breadcrumbItems = ref([{ label: 'لوحة التحكم' }]);

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

// Statistics Data
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

// Animate numbers
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
  }
]);

// Recent Activities
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
    tags: ['طلب جديد', 'معدات']
  },
  {
    title: 'موافقة على عرض سعر',
    description: 'تمت الموافقة على عرض السعر من شركة التقنية',
    time: 'منذ 15 دقيقة',
    user: 'فاطمة علي',
    icon: 'pi pi-check-circle',
    color: '#3b82f6',
    tags: ['موافقة', 'عرض']
  },
  {
    title: 'فحص مخزون مكتمل',
    description: 'تم إكمال فحص المخزون لقسم تقنية المعلومات',
    time: 'منذ 30 دقيقة',
    user: 'محمود حسن',
    icon: 'pi pi-box',
    color: '#06b6d4',
    tags: ['مخزون']
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
    tags: ['رفض']
  }
]);

// Top Departments
const topDepartments = ref([
  { name: 'قسم تقنية المعلومات', requests: 45, completed: 38, inProgress: 7, percentage: 29, color: '#3b82f6' },
  { name: 'قسم المشتريات', requests: 38, completed: 35, inProgress: 3, percentage: 24, color: '#10b981' },
  { name: 'قسم المالية', requests: 32, completed: 28, inProgress: 4, percentage: 21, color: '#f59e0b' },
  { name: 'قسم الموارد البشرية', requests: 28, completed: 22, inProgress: 6, percentage: 18, color: '#ef4444' },
  { name: 'قسم المخازن', requests: 24, completed: 21, inProgress: 3, percentage: 15, color: '#8b5cf6' }
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
    bgClass: 'bg-green-900'
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
    bgClass: 'bg-blue-900'
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
    bgClass: 'bg-pink-900'
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
    bgClass: 'bg-purple-900'
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
    description: 'إنشاء طلب جديد',
    icon: 'pi pi-plus-circle',
    color: '#10b981',
    action: () => toast.add({ severity: 'info', summary: 'طلب جديد', life: 3000 })
  },
  {
    label: 'مراجعة الطلبات المعلقة',
    description: '28 طلب بانتظار المراجعة',
    icon: 'pi pi-clock',
    color: '#f59e0b',
    action: () => toast.add({ severity: 'warn', summary: 'طلبات معلقة', life: 3000 })
  },
  {
    label: 'إضافة مورد جديد',
    description: 'تسجيل مورد جديد',
    icon: 'pi pi-user-plus',
    color: '#3b82f6',
    action: () => toast.add({ severity: 'info', summary: 'مورد جديد', life: 3000 })
  },
  {
    label: 'تقارير شاملة',
    description: 'عرض وتصدير التقارير',
    icon: 'pi pi-file-pdf',
    color: '#ef4444',
    action: () => toast.add({ severity: 'success', summary: 'تقارير', life: 3000 })
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
      backgroundColor: '#64748b',
      data: [12, 15, 10, 18, 14, 16]
    },
    {
      label: 'معلق',
      backgroundColor: '#f97316',
      data: [18, 22, 20, 25, 23, 28]
    },
    {
      label: 'موافق',
      backgroundColor: '#22c55e',
      data: [32, 38, 35, 42, 40, 45]
    },
    {
      label: 'مرفوض',
      backgroundColor: '#ef4444',
      data: [5, 8, 6, 7, 9, 8]
    },
    {
      label: 'مكتمل',
      backgroundColor: '#3b82f6',
      data: [28, 32, 30, 35, 38, 42]
    }
  ]
});

const requestsChartOptions = ref({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      rtl: true,
      labels: {
        color: '#94a3b8',
        font: { family: 'Cairo, sans-serif', size: 12 },
        usePointStyle: true,
        padding: 15
      }
    }
  },
  scales: {
    x: {
      stacked: true,
      ticks: { color: '#64748b', font: { family: 'Cairo, sans-serif' } },
      grid: { display: false }
    },
    y: {
      stacked: true,
      ticks: { color: '#64748b', font: { family: 'Cairo, sans-serif' } },
      grid: { color: '#1e293b' }
    }
  }
});

const priorityChartData = ref({
  labels: ['منخفض', 'متوسط', 'عالي'],
  datasets: [{
    data: [42, 78, 36],
    backgroundColor: ['#22c55e', '#fb923c', '#ef4444'],
    borderWidth: 0
  }]
});

const priorityChartOptions = ref({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { display: false }
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
      borderWidth: 3
    },
    {
      label: 'المصروفات المخططة',
      data: [7000000, 7500000, 7200000, 8000000, 8500000, 8000000],
      fill: false,
      borderColor: '#10b981',
      tension: 0.4,
      borderWidth: 2,
      borderDash: [5, 5]
    }
  ]
});

const spendingChartOptions = ref({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      rtl: true,
      labels: {
        color: '#94a3b8',
        font: { family: 'Cairo, sans-serif', size: 12 },
        usePointStyle: true
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { family: 'Cairo, sans-serif' } },
      grid: { display: false }
    },
    y: {
      ticks: { 
        color: '#64748b',
        font: { family: 'Cairo, sans-serif' },
        callback: (value) => (value / 1000000).toFixed(1) + 'M'
      },
      grid: { color: '#1e293b' }
    }
  }
});

// Computed Properties
const filteredDepartmentPerformance = computed(() => {
  if (!departmentSearch.value) return departmentPerformance.value;
  return departmentPerformance.value.filter(dept => 
    dept.name.includes(departmentSearch.value) || dept.code.includes(departmentSearch.value)
  );
});

const filteredActivities = computed(() => {
  if (activityFilter.value === 'all') return recentActivities.value;
  return recentActivities.value.filter(activity => activity.priority);
});

// Methods
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    toast.add({ severity: 'success', summary: 'تم التحديث', life: 3000 });
  }, 1500);
};

const refreshPriorityData = () => {
  toast.add({ severity: 'success', summary: 'تم التحديث', life: 2000 });
};

const formatCurrency = (value) => {
  if (!value) return '0 IQD';
  return new Intl.NumberFormat('ar-IQ').format(value) + ' IQD';
};

const getPerformanceClass = (value) => {
  if (value >= 85) return 'progress-excellent';
  if (value >= 70) return 'progress-good';
  return 'progress-average';
};

const getPerformanceTextClass = (value) => {
  if (value >= 85) return 'text-green-400';
  if (value >= 70) return 'text-blue-400';
  return 'text-orange-400';
};

// Lifecycle
onMounted(() => {
  animateValue('totalRequests', 0, stats.value.totalRequests, 1000);
  animateValue('pendingRequests', 0, stats.value.pendingRequests, 1200);
  animateValue('totalSpending', 0, stats.value.totalSpending, 1500);
  animateValue('activeVendors', 0, stats.value.activeVendors, 1300);
  
  toast.add({ severity: 'success', summary: 'مرحباً بك', life: 3000 });
});

watch(chartViewType, () => {
  requestsChartOptions.value.scales.x.stacked = chartViewType.value === 'bar';
  requestsChartOptions.value.scales.y.stacked = chartViewType.value === 'bar';
});
</script>

<style scoped>
.dashboard-wrapper {
  padding: 2rem;
  direction: rtl;
  min-height: 100vh;
}

/* Cards */
.stat-card {
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid transparent;
}

/* Stat Card Variants */
.stat-card-total {
  border-left: 4px solid #3b82f6;
}

.stat-card-total:hover {
  border-left-color: #2563eb;
}

.stat-card-pending {
  border-left: 4px solid #f59e0b;
}

.stat-card-pending:hover {
  border-left-color: #d97706;
}

.stat-card-approved {
  border-left: 4px solid #10b981;
}

.stat-card-approved:hover {
  border-left-color: #059669;
}

.stat-card-rejected {
  border-left: 4px solid #ef4444;
}

.stat-card-rejected:hover {
  border-left-color: #dc2626;
}

/* Icon Containers */
.icon-container {
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
}

.icon-total {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.icon-pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.icon-approved {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.icon-rejected {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

/* Progress Bars */
.progress-bar {
  background: #1e293b;
}

.progress-fill-total {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.progress-fill-pending {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.progress-fill-approved {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.progress-fill-rejected {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.secondary-card,
.chart-card,
.table-card,
.activity-card,
.rank-card,
.metrics-card,
.budget-card,
.actions-card {
  border: 1px solid #334155;
  transition: all 0.3s ease;
}

.secondary-card:hover,
.rank-card:hover,
.actions-card:hover {
  border-color: #475569;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Icons */
.icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* Chips and Tags */
.chip-small {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.priority-chip {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  font-size: 0.75rem;
}

.tag-chip {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Avatar */
.avatar-purple {
  background: rgba(139, 92, 246, 0.3);
  color: #c4b5fd;
}

.avatar-small {
  background: rgba(100, 116, 139, 0.3);
  color: #cbd5e1;
}

/* Progress Bars for other components */
.progress-blue :deep(.p-progressbar-value) {
  background: #3b82f6;
}

.progress-cyan :deep(.p-progressbar-value) {
  background: #06b6d4;
}

.progress-green :deep(.p-progressbar-value) {
  background: #22c55e;
}

.progress-primary :deep(.p-progressbar-value) {
  background: #6366f1;
}

.progress-excellent :deep(.p-progressbar-value) {
  background: #22c55e;
}

.progress-good :deep(.p-progressbar-value) {
  background: #3b82f6;
}

.progress-average :deep(.p-progressbar-value) {
  background: #f59e0b;
}

/* Chart Legend */
.legend-dot,
.priority-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Timeline */
.timeline-marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Activity Item */
.activity-item {
  background: #0f172a;
  transition: all 0.2s;
}

.activity-item:hover {
  background: #1e293b;
  border-color: #475569 !important;
}

/* Department & Vendor Items */
.department-item,
.vendor-item {
  background: #0f172a;
  transition: all 0.2s;
  cursor: pointer;
}

.department-item:hover,
.vendor-item:hover {
  background: #1e293b;
  border-color: #283749 !important;
  transform: translateX(-4px);
}

.rank-badge {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.rank-1 { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #fff; }
.rank-2 { background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); color: #fff; }
.rank-3 { background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: #fff; }
.rank-4,
.rank-5 { background: linear-gradient(135deg, #475569 0%, #334155 100%); color: #fff; }

.vendor-badge {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Metric Item */
.metric-item {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Action Item */
.action-item {
  background: #0f172a;
  transition: all 0.2s;
  cursor: pointer;
}

.action-item:hover {
  background: #1e293b;
  border-color: #475569 !important;
  transform: scale(1.02);
}

.action-icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* DataTable */
:deep(.dark-table .p-datatable-thead > tr > th) {
  background: #0f172a;
  color: #cbd5e1;
  border-color: #334155;
  font-weight: 700;
}

:deep(.dark-table .p-datatable-tbody > tr) {
  background: #1e293b;
  color: #e2e8f0;
}

:deep(.dark-table .p-datatable-tbody > tr:hover) {
  background: #334155 !important;
}

:deep(.dark-table .p-datatable-tbody > tr > td) {
  border-color: #334155;
}

/* Alert Message */
.alert-message {
  background: #1e293b;
  border-color: #f59e0b;
  color: #e2e8f0;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card,
.secondary-card,
.chart-card {
  animation: fadeIn 0.5s ease-out;
}

/* Responsive */
@media (max-width: 992px) {
  .dashboard-wrapper {
    padding: 1rem;
  }
}
</style>