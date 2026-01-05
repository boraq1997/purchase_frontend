<template>
    <div class="p-4 lg:p-6" dir="rtl">
        <!-- Animated Header Section -->
        <div class="mb-5">
            <div class="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center gap-4 mb-4">
                <div>
                    <!-- <h1 class="text-4xl font-bold text-900 m-0 mb-2 animate-fade-in">
                        <i class="pi pi-file-edit ml-3 text-primary"></i>
                        عروض الأسعار
                    </h1> -->
                    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="" />
                </div>
                <Button 
                    icon="fas fa-plus" 
                    label="إضافة عرض جديد" 
                    class=""
                    @click="openAddEditDialog()"
                />
            </div>
        </div>

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="fixed top-0 left-0 w-screen h-screen flex align-items-center justify-content-center z-5" 
             style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);">
            <div class="text-center">
                <div class="mb-4">
                    <i class="pi pi-spin pi-spinner text-6xl" style="color: #667eea;"></i>
                </div>
                <p class="text-white text-xl font-semibold">جاري التحميل...</p>
            </div>
        </div>

        <!-- Enhanced Stats Cards with Progress Bars -->
        <div class="grid mb-5">
            <!-- Card: Total Estimates -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-total surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">إجمالي العروض</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ allEstimate.length }}</div>
                            <span class="text-sm text-500">جميع عروض الأسعار</span>
                        </div>
                        <div class="icon-container icon-total border-round-lg flex align-items-center justify-content-center">
                            <i class="pi pi-file text-2xl"></i>
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

            <!-- Card: Pending -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-pending surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">قيد الانتظار</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ statusCounts.pending }}</div>
                            <span class="text-sm text-500">في انتظار المراجعة</span>
                        </div>
                        <div class="icon-container icon-pending border-round-lg flex align-items-center justify-content-center">
                            <i class="pi pi-clock text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-pending border-round relative overflow-hidden" style="height: 18px;">
                        <div
                            class="progress-fill-pending h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: statusPercentages.pending + '%' }"
                        >
                            {{ statusPercentages.pending }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card: Approved -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-approved surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">الطلبات المقبولة</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ statusCounts.approved }}</div>
                            <span class="text-sm text-500">تمت الموافقة عليها</span>
                        </div>
                        <div class="icon-container icon-approved border-round-lg flex align-items-center justify-content-center">
                            <i class="pi pi-check-circle text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-approved border-round relative overflow-hidden" style="height: 18px;">
                        <div
                            class="progress-fill-approved h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: statusPercentages.approved + '%' }"
                        >
                            {{ statusPercentages.approved }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card: Rejected -->
            <div class="col-12 sm:col-6 lg:col-3">
                <div class="stat-card stat-card-rejected surface-card border-round-lg p-4 shadow-3 transition-all transition-duration-300 hover:shadow-5">
                    <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                            <span class="block text-600 font-medium mb-2 text-sm">الطلبات المرفوضة</span>
                            <div class="text-900 font-bold text-3xl mb-1">{{ statusCounts.rejected }}</div>
                            <span class="text-sm text-500">تم رفضها</span>
                        </div>
                        <div class="icon-container icon-rejected border-round-lg flex align-items-center justify-content-center">
                            <i class="pi pi-times-circle text-2xl"></i>
                        </div>
                    </div>
                    <div class="progress-bar progress-rejected border-round relative overflow-hidden" style="height: 18px;">
                        <div
                            class="progress-fill-rejected h-full transition-all transition-duration-500 flex align-items-center justify-content-center text-white text-xs font-medium"
                            :style="{ width: statusPercentages.rejected + '%' }"
                        >
                            {{ statusPercentages.rejected }}%
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modern Filter Section -->
        <div class="p-4 mb-5">
            
            <div class="flex justify-content-end mb-2">
                <Button 
                    label="إعادة تعيين الفلترة" 
                    icon="pi pi-filter-slash" 
                    severity="secondary"
                    text
                    size="small"
                    @click="resetFilters"
                    class="reset-button"
                    v-tooltip="{ value: 'قم بالضغط لحذف جميع قيم الفلترة واعادة جلب جميع الطلبات', showDelay: 300, hideDelay: 300 }"
                />
            </div>
            <div class="grid">
                <div class="col-12 md:col-4">
                    <div class="filter-input-wrapper">
                        <FloatLabel variant="on" class="w-full">
                            <InputText 
                                id="filter_vendor_name"
                                v-model="filters.vendor_name" 
                                class="w-full" 
                            />
                            <label for="filter_vendor_name"><i class="fas fa-search"/> البحث عن اسم المعرض</label>
                        </FloatLabel>
                    <small class="text-gray-500 text-xs">البحث عن  عروض الاسعار بواسطة اسم المعرض</small>
                    </div>
                </div>

                <div class="col-12 md:col-4">
                    <FloatLabel variant="on">
                        <Select
                            id="filter_department"
                            v-model="filters.department_id"
                            class="w-full"
                            :options="allDepartments"
                            optionLabel="name"
                            optionValue="id"
                            filter
                        />
                        <label for="filter_department"><i class="fa-solid fa-object-group"/> اختر القسم</label>
                    </FloatLabel>
                    <small class="text-gray-500 text-xs">العروض الخاصه بقسم معين</small>
                </div>

                <div class="col-12 md:col-4">
                    <FloatLabel variant="on">
                        <Select 
                            id="filter_status"
                            v-model="filters.status" 
                            :options="statusOptions" 
                            filter 
                            optionLabel="label" 
                            optionValue="value" 
                            fluid
                        />
                        <label for="filter_status"><i class="pi pi-info-circle ml-2"/> حالة العرض</label>
                    </FloatLabel>
                    <small class="text-gray-500 text-xs">بحث وفلترة حسب حالة العرض</small>
                </div>

                <div class="col-12 md:col-4">
                    <div class="filter-input-wrapper">
                        <FloatLabel variant="on" class="w-full">
                            <InputText 
                                v-model="filters.request_title" 
                                class="w-full" 
                            />
                            <label for="filter_request_title"><i class="fas fa-search"/> البحث عن عنوان الطلب</label>
                        </FloatLabel>
                    </div>
                </div>

                <div class="col-12 md:col-4">
                    <FloatLabel variant="on">
                        <DatePicker 
                            id="filter_date_from"
                            v-model="filters.date_from" 
                            showIcon 
                            fluid 
                            iconDisplay="input" 
                            dateFormat="yy/mm/dd"
                        />
                        <label for="filter_date_from"><i class="pi pi-calendar ml-2"/> من تاريخ</label>
                    </FloatLabel>
                    <small class="text-gray-500 text-xs">العروض ما بعد التاريخ أعلاه</small>
                </div>

                <!-- إلى تاريخ -->
                <div class="col-12 md:col-4">
                    <FloatLabel variant="on">
                        <DatePicker 
                            id="filter_date_to"
                            v-model="filters.date_to" 
                            showIcon 
                            fluid 
                            iconDisplay="input" 
                            dateFormat="yy/mm/dd"
                        />
                        <label for="filter_date_to"><i class="pi pi-calendar ml-2"/> إلى تاريخ</label>
                    </FloatLabel>
                    <small class="text-gray-500 text-xs">العروض ما قبل التاريخ أعلاه</small>
                </div>

            </div>
        </div>

        <!-- Enhanced Estimates Cards Grid -->
        <div class="grid">
            <div v-for="estimate in allEstimate" :key="estimate.id" class="col-12 lg:col-6 xl:col-4">
                <div class="estimate-card surface-card border-round-2xl shadow-2 overflow-hidden h-full transition-all transition-duration-300 hover:shadow-6">
                    <!-- Card Header with Gradient -->
                    <div class="card-header p-4">
                        <div class="flex justify-content-between align-items-start">
                            <div class="flex-1">
                                <div class="flex align-items-center gap-2 mb-3">
                                    <Chip 
                                        :label="`#${estimate.id}`" 
                                        class="text-sm font-bold bg-white-alpha-30 text-white px-3"
                                        style="backdrop-filter: blur(10px);"
                                    />
                                    <Tag 
                                        :value="getStatusLabel(estimate.status)" 
                                        :severity="getStatusSeverity(estimate.status)"
                                        class="text-sm font-bold px-3"
                                    />
                                </div>
                                <h3 class="text-2xl font-bold text-white m-0 mb-2 line-height-3">
                                    {{ estimate.vendor.name }}
                                </h3>
                                <div class="flex align-items-center gap-2 text-sm text-white-alpha-90">
                                    <i class="pi pi-calendar"></i>
                                    <span>{{ formatDate(estimate.estimate_date) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card Content -->
                    <div class="p-4">
                        <!-- Purchase Request Badge -->
                        <div class="request-badge p-3 border-round-xl mb-4 border-1 border-primary-100"
                             style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);">
                            <div class="flex align-items-center gap-2 mb-2">
                                <i class="pi pi-shopping-cart text-primary"></i>
                                <span class="text-xs text-500 font-semibold">طلب الشراء</span>
                            </div>
                            <div class="text-base font-bold text-900 mb-1">
                                {{ estimate.purchase_request.title }}
                            </div>
                            <div class="text-sm text-600 font-medium">
                                {{ estimate.purchase_request.request_number }}
                            </div>
                        </div>

                        <!-- Vendor Details -->
                        <div class="vendor-details mb-4">
                            <div class="detail-row flex align-items-center gap-3 p-2 border-round-lg mb-2 transition-colors transition-duration-200">
                                <div class="icon-wrapper border-circle flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                    <i class="pi pi-phone text-blue-600"></i>
                                </div>
                                <span class="text-sm text-900 font-medium">{{ estimate.vendor.phone1 || 'غير متوفر' }}</span>
                            </div>
                            
                            <div class="detail-row flex align-items-center gap-3 p-2 border-round-lg mb-2 transition-colors transition-duration-200">
                                <div class="icon-wrapper border-circle flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                    <i class="pi pi-envelope text-purple-600"></i>
                                </div>
                                <span class="text-sm text-900 font-medium">{{ estimate.vendor.email || 'غير متوفر' }}</span>
                            </div>
                            
                            <div class="detail-row flex align-items-start gap-3 p-2 border-round-lg transition-colors transition-duration-200">
                                <div class="icon-wrapper border-circle flex align-items-center justify-content-center" style="width: 36px; height: 36px; min-width: 36px;">
                                    <i class="pi pi-map-marker text-pink-600"></i>
                                </div>
                                <span class="text-sm text-900 font-medium line-height-3">{{ estimate.vendor.address || 'غير متوفر' }}</span>
                            </div>
                        </div>

                        <!-- Financial Info with Animation -->
                        <div class="price-section p-3 border-round-xl mb-3" 
                             style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                            <div class="flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-sm text-white-alpha-90 mb-1 font-medium">المبلغ الإجمالي</div>
                                    <div class="text-3xl font-bold text-white">
                                        {{ formatCurrency(estimate.total_amount) }}
                                        <span class="text-base">د.ع</span>
                                    </div>
                                </div>
                                <div class="border-circle bg-white-alpha-30 flex align-items-center justify-content-center" 
                                     style="width: 50px; height: 50px; backdrop-filter: blur(10px);">
                                    <i class="pi pi-dollar text-white text-xl"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Notes Section -->
                        <div v-if="estimate.notes" class="notes-section p-3 border-round-xl border-1 border-orange-200"
                             style="background: linear-gradient(135deg, rgba(255, 183, 77, 0.1) 0%, rgba(255, 138, 101, 0.1) 100%);">
                            <div class="flex align-items-center gap-2 mb-2">
                                <i class="pi pi-info-circle text-orange-500"></i>
                                <span class="text-xs font-semibold text-600">ملاحظات</span>
                            </div>
                            <p class="text-sm text-700 m-0 line-height-3">{{ estimate.notes }}</p>
                        </div>
                    </div>

                    <!-- Card Footer -->
                    <div class="p-4 surface-50 border-top-1 surface-border">
                        <div class="flex gap-2">
                            <Button 
                                label="عرض" 
                                icon="pi pi-eye" 
                                size="small" 
                                outlined 
                                class="flex-1 border-round-lg font-semibold hover:bg-primary hover:text-white transition-colors transition-duration-300"
                                @click="showEstimatDetails(estimate)"
                            />
                            <Button 
                                label="تعديل" 
                                icon="pi pi-pencil" 
                                size="small" 
                                severity="success" 
                                class="flex-1 border-round-lg font-semibold"
                                @click="openAddEditDialog(estimate)"
                            />
                            <Button 
                                icon="pi pi-trash" 
                                size="small" 
                                severity="danger" 
                                outlined 
                                class="border-round-lg hover:bg-red-500 hover:text-white transition-colors transition-duration-300"
                                @click="confirmDeleteEstimate(estimate)" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="allEstimate && allEstimate.length > 0" class="mt-5">
            <Paginator
                :rows="pagination.per_page"
                :totalRecords="pagination.total"
                :first="(pagination.page - 1) * pagination.per_page"
                @page="onPageChange"
                class="border-round-xl shadow-2"
            />
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && (!allEstimate || allEstimate.length === 0)" class="text-center py-8">
            <div class="empty-state-wrapper inline-block p-6 border-round-2xl" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);">
                <div class="mb-4">
                    <i class="pi pi-inbox text-6xl" style="color: #667eea;"></i>
                </div>
                <h3 class="text-2xl font-bold text-900 mb-2">لا توجد عروض أسعار</h3>
                <p class="text-600 m-0">ابدأ بإضافة عرض سعر جديد</p>
            </div>
        </div>

        <Dialog
            v-model:visible="addEditEstimateDialogVisible"
            :header="isEditMode ? 'تعديل بيانات عرض السعر' : 'اضافة عرض سعر جديد'"
            :style="{width: '50vw'}"
            modal
            @hide="resetForm"
            dir="rtl"
        >
            <div class="flex flex-column gap-4 mt-3">
                <div class="grid">
                    <div class="col-10">
                        <FloatLabel variant="on">
                            <Select v-model="estimateForm.vendor_id" id="vendor_id" :options="allVendors" optionLabel="name" optionValue="id" fluid/>
                            <label for="vendor_id"><i class="fas fa-store"/> اختر البائع</label>
                        </FloatLabel>
                    </div>
                    
                    <div class="col">
                        <Button
                            icon="fas fa-plus"
                            v-tooltip="'اضافة بيانات بائع جديد'"
                            @click="showAddVendorForm = !showAddVendorForm"
                        />
                    </div>
                </div>

                <div v-if="showAddVendorForm" class="surface-100 p-3 border-round-lg">
                    <h4 class="mb-3 text-primary">
                        <i class="fas fa-store ml-2"/>
                        اضافة بائع جديد
                    </h4>

                    <div class="grid">
                        <div class="col-12">
                            <FloatLabel variant="on">
                                <InputText id="vendor_name" v-model="vendorForm.name" fluid />
                                <label for="vendor_name"><i class="fas fa-store"/> اسم البائع</label>
                            </FloatLabel>
                        </div>

                        <div class="col-12 md:col-6">
                            <FloatLabel variant="on">
                                <InputText id="vendoe_phone1" v-model="vendorForm.phone1" fluid />
                                <label for="vendoe_phone1"><i class="fas fa-phone-flip"/> رقم الهاتف</label>
                            </FloatLabel>
                        </div>

                        <div class="col-12 md:col-6">
                            <FloatLabel variant="on">
                                <InputText id="vendor_phone2" v-model="vendorForm.phone2" fluid />
                                <label for="vendoe_phone2"><i class="fas fa-phone-flip"/> رقم هاتف إضافي</label>
                            </FloatLabel>
                        </div>

                        <div class="col-12 md:col-12">
                            <FloatLabel variant="on">
                                <InputText id="vendor_email" v-model="vendorForm.email" fluid />
                                <label for="vendor_email"><i class="fas fa-envelope"/> البريد الإلكتروني</label>
                            </FloatLabel>
                        </div>

                        <div class="col-12">
                            <FloatLabel variant="on">
                                <Textarea id="vendor_address" v-model="vendorForm.address" rows="2" fluid />
                                <label for="vendor_address"><i class="fas fa-map-location-dot"/> العنوان</label>
                            </FloatLabel>
                        </div>
                    </div>

                    <div class="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="الغاء"
                            severity="secondary"
                            size="small"
                            @click="showAddVendorForm = false"
                        />
                        <Button
                            label="حفظ البائع"
                            icon="fas fa-floppy-disk"
                            size="small"
                            :loading="isSavingVendor"
                            @click="saveVendor"
                        />
                    </div>
                </div>

                <div class="grid">
                    <div class="col">
                        <FloatLabel variant="on">
                            <DatePicker v-model="estimateForm.estimate_date" id="estimate_date" showIcon iconDisplay="input" fluid />
                            <label for="estimate_date"><i class="fas fa-calendar-alt"/> تاريخ عرض السعر</label>
                        </FloatLabel>
                    </div>
                    <div class="col">
                        <FloatLabel variant="on">
                            <Select 
                                v-model="estimateForm.status"
                                id="status" 
                                :options="[
                                    {label: 'معلق', value: 'pending'},
                                    {label: 'مقبول', value: 'accepted'},
                                    {label: 'مرفوض', value: 'rejected'}
                                ]" 
                                optionLabel="label" 
                                optionValue="value" 
                                fluid
                            />
                            <label for="status"><i class="fas fa-info-circle"/> حالة عرض السعر</label>
                        </FloatLabel>
                    </div>
                </div>

                <FloatLabel variant="on">
                    <Textarea v-model="estimateForm.notes" id="notes" rows="5" cols="30" style="resize: none" fluid />
                    <label for="notes"><i class="fa-solid fa-note-sticky"/> الملاحظات</label>
                </FloatLabel>

                <FloatLabel variant="on">
                    <Select 
                        id="purchase_id"
                        v-model="selectedPurchaseId"
                        :options="allPurchase" 
                        optionLabel="title" 
                        optionValue="id" 
                        filter
                        show-clear
                        fluid
                    >
                        <template #option="{option}">
                            <div class="flex flex-column gap-1">
                                <strong>{{ option.title }}</strong>
                                <small class="text-gray-600">
                                    {{ option.department?.name }} - رقم الطلب: {{ option.request_number }}
                                </small>
                                <small class="text-gray-500">
                                    {{ option.description }}
                                </small>
                            </div>
                        </template>
                    </Select>
                    <label for="purchase_id"><i class="fa-solid fa-cart-shopping"/> اختر طلب الشراء</label>
                </FloatLabel>

                <div v-if="estimateForm.items.length" class="mt-2">
                    <h3><i class="fa-solid fa-boxes-stacked text-primary-500 ml-2"/>مواد الطلب</h3>
                    <DataTable :value="estimateForm.items">
                        <!-- اسم المادة -->
                        <Column>
                            <template #header>
                                <i class="fas fa-box text-gray-500"/>
                                المادة
                            </template>
                            <template #body="{ data }">
                                <span class="font-medium text-900">
                                    {{ data.item_name }}
                                </span>
                            </template>
                        </Column>

                        <!-- الكمية -->
                        <Column style="width: 120px">
                            <template #header>
                                <i class="fas fa-hashtag text-gray-500"/>
                                الكمية
                            </template>
                            <template #body="{ data }">
                                <Tag 
                                    :value="data.quantity" 
                                    severity="secondary"
                                />
                            </template>
                        </Column>

                        <!-- سعر الوحدة -->
                        <Column style="width: 160px">
                            <template #header>
                                <i class="fas fa-dollar-sign text-gray-500"/>
                                سعر الوحدة
                            </template>
                            <template #body="{ data }">
                                <InputNumber
                                    v-model="data.unit_price"
                                    :min="0"
                                    mode="decimal"
                                    :useGrouping="true"
                                    local="ar-IQ"
                                    :minFractionDigits="0"
                                    :maxFractionDigits="0"
                                />
                            </template>
                        </Column>

                        <!-- المجموع -->
                        <Column style="width: 160px">
                            <template #header>
                                <i class="fa-solid fa-money-bill-1-wave text-gray-500"/>
                                المجموع
                            </template>
                            <template #body="{ data }">
                                <span class="font-semibold text-900">
                                    {{
                                        (data.unit_price && data.quantity)
                                            ? (data.unit_price * data.quantity).toLocaleString()
                                            : '—'
                                    }}
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                    <div class="flex justify-end mt-4">
                        <div class="w-4 md:w-3 lg:w-2">
                            <FloatLabel variant="on">
                                <InputNumber
                                    :modelValue="totalEstimateAmount"
                                    readonly
                                    mode="decimal"
                                    class="font-bold"
                                    :useGrouping="true"
                                    local="ar-IQ"
                                    :minFractionDigits="0"
                                    :maxFractionDigits="0"
                                />
                                <label>
                                    <i class="fa-solid fa-sack-dollar" />
                                    المبلغ الكلي لعرض السعر
                                </label>
                            </FloatLabel>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button
                    label="الغاء"
                    icon="fas fa-times"
                    @click="addEditEstimateDialogVisible = false"
                    severity="secondary"
                />
                <Button
                    label="حفظ"
                    icon="fas fa-floppy-disk"
                    @click="submitEstimate"
                />
            </template>
        </Dialog>

        <Dialog
            v-model:visible="estimateAllDetailsDialogVisible"
            modal
            header="تفاصيل عرض السعر"
            :style="{ width: '90vw',}"
            :breakpoints="{ '960px': '95vw' }"
            class="estimate-details-dialog"
            dir="rtl"
        >
            <!-- Header Section with Gradient -->
            <div class="dialog-header-content mb-4 p-2 border-round-xl" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="flex justify-content-between align-items-center flex-wrap gap-3">
                    <div class="flex-1">
                        <div class="flex align-items-center gap-3 mb-2">
                            <Chip 
                            :label="`#${estimateData.id}`" 
                            class="text-lg font-bold bg-white-alpha-20 text-white px-4 py-2"
                            style="backdrop-filter: blur(10px);"
                            />
                            <Tag 
                            :value="getStatusLabel(estimateData.status)" 
                            :severity="getStatusSeverity(estimateData.status)"
                            class="text-base font-bold px-4 py-2"
                            style="font-size: 1rem;"
                            />
                        </div>
                        <h2 class="text-3xl font-bold text-white m-0 mb-2">
                            {{ estimateData.vendor?.name }}
                        </h2>
                        <div class="flex align-items-center gap-2 text-white-alpha-90">
                            <i class="pi pi-calendar"></i>
                            <span class="text-lg">{{ formatDate(estimateData.estimate_date) }}</span>
                        </div>
                    </div>
                        <div class="price-display p-4 border-round-xl text-center" style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); min-width: 250px;">
                        <div class="text-sm text-white-alpha-90 mb-2 font-semibold">المبلغ الإجمالي</div>
                        <div class="text-5xl font-bold text-white mb-1">
                            {{ formatCurrency(estimateData.total_amount) }}
                        </div>
                        <div class="text-lg text-white-alpha-90 font-medium">دينار عراقي</div>
                    </div>
                </div>
            </div>

            <div class="dialog-body">
            <div class="grid">
                <!-- Right Column -->
                <div class="col-12 lg:col-8">
                <!-- Purchase Request Info Card -->
                <div class="info-card mb-4 surface-card border-round-xl p-4 shadow-2">
                    <div class="flex align-items-center gap-3 mb-4">
                        <i class="fas fa-shopping-cart text-3xl text-white"></i>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-900 m-0 mb-1">معلومات طلب الشراء</h3>
                        <span class="text-sm text-500">تفاصيل الطلب المرتبط بهذا العرض</span>
                    </div>
                    </div>
                    
                    <div class="grid">
                    <div class="col-12 md:col-6">
                        <div class="info-item p-3 border-round-lg mb-3"
                            style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);">
                        <span class="text-600 text-sm font-semibold mb-2 block">
                            <i class="pi pi-hashtag ml-1"></i>
                            رقم الطلب
                        </span>
                        <span class="text-900 font-bold text-lg">{{ estimateData.purchase_request?.request_number }}</span>
                        </div>
                    </div>
                    
                    <div class="col-12 md:col-6">
                        <div class="info-item p-3 border-round-lg mb-3"
                            style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);">
                        <span class="text-600 text-sm font-semibold mb-2 block">
                            <i class="pi pi-flag ml-1"></i>
                            الأولوية
                        </span>
                        <Tag 
                            :value="getPriorityLabel(estimateData.purchase_request?.priority)" 
                            :severity="getPrioritySeverity(estimateData.purchase_request?.priority)"
                            class="text-base px-3 py-2"
                        />
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="info-item p-3 border-round-lg"
                            style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);">
                        <span class="text-600 text-sm font-semibold mb-2 block">
                            <i class="pi pi-file-edit ml-1"></i>
                            عنوان الطلب
                        </span>
                        <span class="text-900 font-bold text-lg">{{ estimateData.purchase_request?.title }}</span>
                        </div>
                    </div>
                    </div>
                </div>

                <!-- Items Table Card -->
                <div class="info-card surface-card border-round-xl p-4 shadow-2">
                    <div class="flex align-items-center gap-3 mb-4">
                        <i class="fas fa-list text-3xl text-white"></i>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-900 m-0 mb-1">المواد المطلوبة</h3>
                        <span class="text-sm text-500">قائمة المواد والأسعار التفصيلية</span>
                    </div>
                    </div>

                    <DataTable 
                    :value="estimateData.estimate_items" 
                    responsiveLayout="scroll"
                    stripedRows
                    class="custom-datatable"
                    >
                    <Column field="item_name" style="min-width: 200px">
                        <template #header>
                            <i class="fas fa-box text-gray-500"/>
                            اسم المادة
                        </template>
                        <template #body="slotProps">
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-box text-primary"></i>
                            <span class="font-semibold text-900">{{ slotProps.data.item_name }}</span>
                        </div>
                        </template>
                    </Column>
                    
                    <Column field="quantity" style="min-width: 120px">
                        <template #header>
                            <i class="fas fa-hashtag text-gray-500"/>
                            الكمية
                        </template>
                        <template #body="slotProps">
                        <Chip 
                            :label="`${slotProps.data.quantity} ${slotProps.data.request_item?.unit || ''}`"
                            class="font-semibold"
                            style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); color: #667eea;"
                        />
                        </template>
                    </Column>
                    
                    <Column field="unit_price" style="min-width: 150px">
                        <template #header>
                            <i class="fas fa-dollar-sign text-gray-500"/>
                            سعر الوحدة
                        </template>
                        <template #body="slotProps">
                        <div class="text-right">
                            <span class="font-semibold text-900">{{ formatCurrency(slotProps.data.unit_price) }}</span>
                            <span class="text-500 text-sm mr-1">د.ع</span>
                        </div>
                        </template>
                    </Column>
                    
                    <Column field="total_price" style="min-width: 150px">
                        <template #header>
                            <i class="fa-solid fa-money-bill-1-wave text-gray-500"/>
                            المجموع
                        </template>
                        <template #body="slotProps">
                        <div class="text-right">
                            <span class="font-bold text-primary text-lg">{{ formatCurrency(slotProps.data.total_price) }}</span>
                            <span class="text-500 text-sm mr-1">د.ع</span>
                        </div>
                        </template>
                    </Column>
                    </DataTable>

                    <!-- Total Amount -->
                    <div class="mt-4 p-2 border-round-xl"
                        style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                    <div class="flex justify-content-between align-items-center">
                        <span class="text-2xl font-bold text-white">المجموع الكلي:</span>
                        <div class="text-right">
                        <div class="text-4xl font-bold text-white">
                            {{ formatCurrency(estimateData.total_amount) }}
                        </div>
                        <div class="text-lg text-white-alpha-90">دينار عراقي</div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

                <!-- Left Column -->
                <div class="col-12 lg:col-4">
                <!-- Vendor Info Card -->
                <div class="info-card mb-4 surface-card border-round-xl p-4 shadow-2">
                    <div class="flex align-items-center gap-3 mb-4">
                        <i class="fas fa-user text-primary-500"/>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-900 m-0 mb-1">معلومات المورد</h3>
                        <span class="text-sm text-500">تفاصيل الاتصال بالمورد</span>
                    </div>
                    </div>

                    <div class="vendor-details">
                    <div class="vendor-item p-3 border-round-lg mb-3 transition-all transition-duration-200 hover:surface-100">
                        <div class="flex align-items-center gap-3">
                            <i class="fas fa-user-tie text-primary-500"></i>
                        <div class="flex-1">
                            <span class="text-600 text-xs block mb-1">اسم المورد</span>
                            <span class="text-900 font-bold block">{{ estimateData.vendor?.name }}</span>
                        </div>
                        </div>
                    </div>

                    <div class="vendor-item p-3 border-round-lg mb-3 transition-all transition-duration-200 hover:surface-100">
                        <div class="flex align-items-center gap-3">
                            <i class="fas fa-phone-flip text-primary-500"></i>
                        <div class="flex-1">
                            <span class="text-600 text-xs block mb-1">رقم الهاتف 1</span>
                            <span class="text-900 font-semibold block">{{ estimateData.vendor?.phone1 || 'غير متوفر' }}</span>
                        </div>
                        </div>
                    </div>

                    <div class="vendor-item p-3 border-round-lg mb-3 transition-all transition-duration-200 hover:surface-100">
                        <div class="flex align-items-center gap-3">
                            <i class="fas fa-phone-flip text-primary-500"></i>
                        <div class="flex-1">
                            <span class="text-600 text-xs block mb-1">رقم الهاتف 2</span>
                            <span class="text-900 font-semibold block">{{ estimateData.vendor?.phone2 || 'غير متوفر' }}</span>
                        </div>
                        </div>
                    </div>

                    <div class="vendor-item p-3 border-round-lg mb-3 transition-all transition-duration-200 hover:surface-100">
                        <div class="flex align-items-center gap-3">
                            <i class="fas fa-envelope text-primary-500"></i>
                        <div class="flex-1">
                            <span class="text-600 text-xs block mb-1">البريد الإلكتروني</span>
                            <span class="text-900 font-semibold block text-sm">{{ estimateData.vendor?.email || 'غير متوفر' }}</span>
                        </div>
                        </div>
                    </div>

                    <div class="vendor-item p-3 border-round-lg transition-all transition-duration-200 hover:surface-100">
                        <div class="flex align-items-start gap-3">
                            <i class="fas fa-map-location-dot text-primary-500"></i>
                        <div class="flex-1">
                            <span class="text-600 text-xs block mb-1">العنوان</span>
                            <span class="text-900 font-semibold block line-height-3">{{ estimateData.vendor?.address || 'غير متوفر' }}</span>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>

                <!-- Notes Card -->
                <div v-if="estimateData.notes" class="info-card surface-card border-round-xl p-4 shadow-2">
                    <div class="flex align-items-center gap-3 mb-3">
                        <i class="fas fa-sticky-note text-3xl text-white"></i>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-900 m-0 mb-1">الملاحظات</h3>
                        <span class="text-sm text-500">معلومات إضافية</span>
                    </div>
                    </div>
                    <div class="p-3 border-round-lg" style="background: linear-gradient(135deg, rgba(255, 216, 155, 0.1) 0%, rgba(25, 84, 123, 0.1) 100%);">
                    <p class="text-900 m-0 line-height-3">{{ estimateData.notes }}</p>
                    </div>
                </div>
                </div>
            </div>
            </div>

            <template #footer>
                <Button 
                label="إغلاق" 
                icon="fas fa-times" 
                @click="estimateAllDetailsDialogVisible = false" 
                severity="secondary"
                outlined
                class="px-5"
                />
                <Button 
                    label="طباعة" 
                    icon="pi pi-print" 
                    class="px-5"
                    @click="handlePrint"
                />

            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import estimateService, {EstimatePayload, type Estimate} from './estimateService';
import Breadcrumb from "primevue/breadcrumb";
import InputText from 'primevue/inputtext';
import DepartmentService from '../departments/DepartmentService';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import Select from "primevue/select";
import Paginator from 'primevue/paginator';
import FloatLabel from 'primevue/floatlabel';
import DatePicker from 'primevue/datepicker';
import Dialog from "primevue/dialog";
import VendorsService from '../vendors/VendorsService';
import Textarea from 'primevue/textarea';
import purchaseRequestsService from '../purchase-requests/purchase-requestsService';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';


const isLoading = ref(true);
const isEditMode = ref(false);
const toast = useToast();
const confirm = useConfirm();
const isConfirming = ref(false);
const isSaving = ref(false); // Loading state for save operation
const showAddVendorForm = ref(false);
const isSavingVendor = ref(false);
const allPurchase = ref<any[]>([]);


const allEstimate = ref<any[]>([]);
const allDepartments = ref<any[]>([]);
const estimateId = ref<number | null>(null);
const allVendors = ref<any[]>([]);
const selectedPurchaseId = ref<number | null>(null);

const addEditEstimateDialogVisible = ref(false);
const estimateAllDetailsDialogVisible = ref(false);
const estimateData = ref([]);

const totalEstimateAmount = computed(() => {
    return estimateForm.items.reduce((total, item) => {
        const price = Number(item.unit_price) || 0;
        return total + (price * item.quantity);
    }, 0);
});

const breadcrumbHome = ref({ icon: "fas fa-house", to: "/" });
const breadcrumbItems = ref([
    { label: "الرئيسية", to: "/", icon: "fas fa-house"},
    { label: "عروض الاسعار", to: "/estimate", icon: "fas fa-receipt" },
]);

const statusOptions = ref([
    { label: 'جميع الحالات', value: null },
    { label: 'قيد الانتظار', value: 'pending' },
    { label: 'موافق عليه', value: 'approved' },
    { label: 'مرفوض', value: 'rejected' },
    { label: 'مكتملة', value: 'completed' }
]);

const filters = ref({
    vendor_name: "",
    department_id: null,
    request_title: "",
    status: null,
    date_from: null,
    date_to: null
});

const pagination = ref({
    page: 1,
    per_page: 12,
    total: 0,
});

const estimateForm = reactive<EstimatePayload>({
    vendor_id: null,
    estimate_date: null,
    status: "pending",
    notes: null,
    items: [],
});

const vendorForm = reactive({
    name: '',
});

const fetchAllEstimates = async () => {
    isLoading.value = true;
    try {
        const params = {
            page: pagination.value.page,
            per_page: pagination.value.per_page,
            vendor_name: filters.value.vendor_name || undefined,
            department_id: filters.value.department_id || undefined,
            request_title: filters.value.request_title || undefined,
        }
        const response = await estimateService.getAll(params);
        allEstimate.value = response.data;
        
        pagination.value.total = response.total;
        pagination.value.page = response.current_page;
        pagination.value.per_page = response.per_page;

    } catch (err) {
        console.log(err)
        toast.add({
            severity: "error",
            summary: "رسالة خطأ",
            detail: "حدث خطأ أثناء جلب بيانات عروض الأسعار",
            life: 3000
        })
    } finally {
        isLoading.value = false
    }
}

const fetchAllDepartments = async () => {
    try {
        const response = await DepartmentService.getAll()
        allDepartments.value = response;
    } catch (err: any) {
        console.log(err)
        toast.add({
            severity: "error",
            summary: "رسالة خطأ",
            detail: "حدث خطأ أثناء جلب الأقسام",
            life: 3000
        })
    }
}

const fetchAllVendors = async()=>{
    try {
        const response = await VendorsService.getAll();
        allVendors.value = response;
    } catch (err: any) {
        console.log(err);
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء ما اثناء جلب بيانات الباعه",
            life: 3000,
        });
    }
}

const confirmDeleteEstimate = async (estimate: any) => {
    if (isConfirming.value) return;
    isConfirming.value = true;

    confirm.require({
        header: "تأكيد الحذف",
        message: `هل أنت متأكد من حذف عرض السعر؟`,
        icon: "pi pi-exclamation-triangle text-yellow-500",
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass: "p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass: "p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: async () => {
            try {
                await estimateService.delete(estimate.id);
                fetchAllEstimates();
                toast.add({
                    severity: "success",
                    summary: "تم الحذف",
                    detail: "تم حذف عرض السعر بنجاح",
                    life: 3000
                });
            } catch (err: any) {
                console.log(err)
                toast.add({
                    severity: "error",
                    summary: "رسالة خطأ",
                    detail: "حدث خطأ أثناء حذف عرض السعر",
                    life: 3000
                });
            } finally {
                isConfirming.value = false;
            }
        },
        reject: () => isConfirming.value = false
    })
}

const onPageChange = (e: any) => {
    pagination.value.page = e.page + 1;
    fetchAllEstimates();
}

watch(
    filters,
    () => {
        pagination.value.page = 1;
        fetchAllEstimates();
    },
    { deep: true }
);

const openAddEditDialog = async(estimate?: any | null)=> {
    resetForm();

    if (estimate && estimate.id) {
        isEditMode.value = true;
        estimateId.value = estimate.id;

        estimateForm.vendor_id = estimate.vendor?.id ?? null;
        estimateForm.estimate_date = estimate.estimate_date ? new Date(estimate.estimate_date) : null;
        estimateForm.status = estimate.status;
        estimateForm.notes = estimate.notes;

        estimateForm.items = (estimate.estimate_items ?? []).map(item => ({
            request_item_id: item.request_item_id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes,
        }));
    } else {
        resetForm();
        isEditMode.value = false;
        estimateId.value = null;
    }
    fetchAllVendors()
    fetchAllPurchase()
    addEditEstimateDialogVisible.value = true;
}

const submitEstimate = async()=>{
    try {
        isSaving.value = true;
        if (isEditMode.value && estimateId.value) {
            await estimateService.update(estimateId.value, estimateForm);
            toast.add({
                severity: "success",
                summary: "رسالة نجاح",
                detail: "تم حفظ بيانات عرض السعر",
                life: 3000
            })
        } else {
            await estimateService.createWithItems(selectedPurchaseId.value, estimateForm);
            toast.add({
                severity: "success",
                summary: "رسالة نجاح",
                detail: "تم اضافة عرض سعر جديد بنجاح",
                life: 3000
            });
        }
        addEditEstimateDialogVisible.value = false;
        fetchAllEstimates();
    } catch (err: any) {
        console.log(err);
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء ما اثناء حفظ بيانات عرض السعر",
            life: 3000
        })
    } finally {
        isSaving.value = false;
    }
}

const saveVendor = async()=>{
    try {
        isSavingVendor.value = true;
        const response = await VendorsService.create(vendorForm)
        fetchAllVendors()

        Object.assign(vendorForm, {
            name: '',
            phone1: '',
            phone2: '',
            email: '',
            address: ''
        });
        
        showAddVendorForm.value = false;

        toast.add({
            severity: "success",
            summary: "رسالة نجاح",
            detail: "تم اضافة بيانات البائع بنجاح",
            life: 3000,
        });
    } catch (err: any) {
        console.log(err)
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "فشل اضافة بيانات البائع",
            life: 3000
        });
    } finally {
        isSavingVendor.value = false
    }
}

const fetchAllPurchase = async()=>{
    try {
        const response = await purchaseRequestsService.getAll();
        allPurchase.value = response;
    } catch (err: any) {
        console.log(err)
        toast.add({
            severity: "error",
            summary: "رسالة خطاء",
            detail: "حدث خطاء ما اثناء جلب جميع طلبات الشراء",
            life: 3000
        })
    }
}

const showEstimatDetails = (estimate: any)=>{
    if (!estimate) {
        toast.add({
            severity: "warn",
            summary: "رسالة خطاء",
            detail: "حدث خطاء ما اثناء عرض تفاصيل عرض السعر يرجى المحاولة مره اخرى",
            life: 3000
        });
        return;
    }
    console.log(estimate)
    estimateData.value = estimate;
    estimateAllDetailsDialogVisible.value = true;
}

watch(selectedPurchaseId, (purchaseId) => {
    if (!purchaseId) {
        estimateForm.items = [];
        return;
    }

    const purchase = allPurchase.value.find(p => p.id === purchaseId);

    if (!purchase || !purchase.items) {
        estimateForm.items = [];
        return;
    }

    estimateForm.items = purchase.items.map((item: any) => ({
        request_item_id: item.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: null,
        note: ''
    }));
})

// Status counts and percentages
const statusCounts = computed(() => ({
    pending: allEstimate.value.filter(e => e.status === 'pending').length,
    approved: allEstimate.value.filter(e => e.status === 'approved').length,
    rejected: allEstimate.value.filter(e => e.status === 'rejected').length,
    completed: allEstimate.value.filter(e => e.status === 'completed').length,
}));

const totalEstimates = computed(() => allEstimate.value.length || 1);

const statusPercentages = computed(() => ({
    pending: totalEstimates.value > 0 ? Math.round((statusCounts.value.pending / totalEstimates.value) * 100) : 0,
    approved: totalEstimates.value > 0 ? Math.round((statusCounts.value.approved / totalEstimates.value) * 100) : 0,
    rejected: totalEstimates.value > 0 ? Math.round((statusCounts.value.rejected / totalEstimates.value) * 100) : 0,
    completed: totalEstimates.value > 0 ? Math.round((statusCounts.value.completed / totalEstimates.value) * 100) : 0,
}));

const getCardGradient = (status: string): string => {
    const gradientMap: Record<string, string> = {
        'pending': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'approved': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'rejected': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'completed': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    };
    return gradientMap[status] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        'pending': 'قيد الانتظار',
        'approved': 'موافق عليه',
        'rejected': 'مرفوض',
        'completed': 'مكتملة',
    };
    return statusMap[status] || status;
};

const getStatusSeverity = (status: string) => {
    const severityMap: Record<string, "success" | "secondary" | "info" | "warning" | "danger"> = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'completed': 'info'
    };
    return severityMap[status] || 'secondary';
};

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية'
  };
  return labels[priority] || priority;
};

const getPrioritySeverity = (priority: string) => {
  const severities: Record<string, "success" | "secondary" | "info" | "warning" | "danger"> = {
    low: 'info',
    medium: 'warn',
    high: 'danger'
  };
  return severities[priority] || 'info';
};

const handlePrint = () => {
  window.print();
};

const formatDate = (dateString: string): string => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatCurrency = (value: any): string => {
    const num = parseFloat(value || '0');
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const resetFilters = () => {
    filters.value = {
        vendor_name: "",
        department_id: null,
        request_title: "",
        status: null,
        date_from: null,
        date_to: null
    };
};

const resetForm = () => {
    estimateForm.vendor_id = null;
    estimateForm.estimate_date = null;
    estimateForm.status = "pending";
    estimateForm.notes = null;
    estimateForm.items = [];
}

onMounted(() => {
    fetchAllEstimates();
    fetchAllDepartments();
})
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 0.6s ease-out;
}

.stat-card {
    animation: fadeIn 0.6s ease-out both;
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
}

.stat-card:hover::before {
    left: 100%;
}

/* Icon Containers */
.icon-container {
    width: 60px;
    height: 60px;
    transition: all 0.3s ease;
}

.stat-card:hover .icon-container {
    transform: scale(1.1) rotate(5deg);
}

.icon-total {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.icon-pending {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

.icon-approved {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
}

.icon-rejected {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    color: white;
}

.icon-completed {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: white;
}

/* Progress Bars */
.progress-bar {
    background: var(--surface-100);
    position: relative;
    overflow: hidden;
}

.progress-fill-total {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.progress-fill-pending {
    background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 2px 8px rgba(240, 147, 251, 0.4);
}

.progress-fill-approved {
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    box-shadow: 0 2px 8px rgba(79, 172, 254, 0.4);
}

.progress-fill-rejected {
    background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
    box-shadow: 0 2px 8px rgba(250, 112, 154, 0.4);
}

.progress-fill-completed {
    background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
    box-shadow: 0 2px 8px rgba(67, 233, 123, 0.4);
}

@keyframes numberCount {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-number {
    animation: numberCount 0.8s ease-out;
}

.estimate-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}




@keyframes shimmer {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

.price-section {
    position: relative;
    overflow: hidden;
}

.price-section::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: slide 3s infinite;
}

@keyframes slide {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}

.empty-state-wrapper {
    animation: fadeIn 0.8s ease-out;
}
</style>