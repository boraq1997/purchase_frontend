<template>
  <div class="report-root" dir="rtl">

    <!-- ══════════════════════════════════════
         حالة التحميل
    ══════════════════════════════════════ -->
    <div v-if="loading" class="flex flex-column align-items-center justify-content-center" style="height:100vh; gap:1rem">
      <ProgressSpinner style="width:56px;height:56px" strokeWidth="4" />
      <span class="text-color-secondary text-lg">جارٍ تحميل التقرير…</span>
    </div>

    <!-- ══════════════════════════════════════
         حالة الخطأ
    ══════════════════════════════════════ -->
    <div v-else-if="error" class="flex flex-column align-items-center justify-content-center gap-3" style="height:100vh">
      <i class="pi pi-exclamation-triangle text-red-500" style="font-size:3rem" />
      <p class="text-color-secondary text-lg">{{ error }}</p>
      <Button label="إعادة المحاولة" icon="pi pi-refresh" @click="fetchData" />
    </div>

    <!-- ══════════════════════════════════════
         محتوى التقرير
    ══════════════════════════════════════ -->
    <template v-else-if="data && data.purchase_request && data.financial">

      <!-- ─── شريط الأدوات (يختفي عند الطباعة) ─── -->
      <div class="no-print surface px-4 py-2 flex align-items-center justify-content-between sticky top-0 z-5 shadow-4">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-file-pdf text-yellow-400 text-xl" />
          <span class="  font-semibold text-base">تقرير طلب الشراء</span>
        </div>
        <Button
          label="طباعة التقرير"
          icon="pi pi-print"
          severity="warning"
          size="small"
          class="font-bold"
          @click="printPage"
        />
      </div>

      <!-- ══════════════════════════════════════════
           ورقة التقرير
      ══════════════════════════════════════════ -->
      <div class="report-sheet mx-auto my-4 surface-0 shadow-4 border-round-xl overflow-hidden" id="report-sheet">

        <!-- ═══════════ HEADER ═══════════ -->
        <div class="surface px-5 pt-4 pb-3 relative">
          <div class="absolute top-0 left-0 right-0" style="height:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)" />
          <div class="flex justify-content-between align-items-start mb-3">
            <div>
              <div class="font-black text-2xl mb-1">نظام إدارة المشتريات</div>
              <div class="text-400 text-xs">تقرير طلب شراء شامل — وثيقة رسمية داخلية</div>
            </div>
            <div class="px-4 py-2 border-round text-center" style="background:#f59e0b;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)">
              <div class="text-xs mb-1" style="opacity:.8">رقم الطلب</div>
              <div class="font-black text-xl" style="letter-spacing:1px">{{ data.purchase_request.request_number }}</div>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 pt-2 border-top-1 border-600">
            <div class="flex align-items-center gap-2 text-400 text-xs">
              <i class="pi pi-calendar text-yellow-400" />
              <span>تاريخ الإصدار: <strong class=" ">{{ formatDate(data.generated_at) }}</strong></span>
            </div>
            <div class="flex align-items-center gap-2 text-400 text-xs">
              <i class="pi pi-user text-yellow-400" />
              <span>أصدره: <strong class=" ">{{ data.generated_by }}</strong></span>
            </div>
            <div class="flex align-items-center gap-2 text-400 text-xs">
              <i class="pi pi-building text-yellow-400" />
              <span>القسم: <strong class=" ">{{ data.purchase_request.department?.name ?? '—' }}</strong></span>
            </div>
            <div class="flex align-items-center gap-2 text-400 text-xs">
              <i class="pi pi-clock text-yellow-400" />
              <span>تاريخ الطلب: <strong class=" ">{{ formatDate(data.purchase_request.created_at) }}</strong></span>
            </div>
          </div>
        </div>

        <!-- ═══════════ TITLE BAND ═══════════ -->
        <div class="surface-100 px-5 py-3 flex justify-content-between align-items-center border-bottom-1 border-200">
          <span class="font-black text-xl text-800">{{ data.purchase_request.title }}</span>
          <div class="flex gap-2">
            <Tag :value="data.purchase_request.priority_label" :severity="prioritySeverity(data.purchase_request.priority)" class="font-bold" />
            <Tag :value="data.purchase_request.status_label"   :severity="statusSeverity(data.purchase_request.status_type)"   class="font-bold" />
          </div>
        </div>

        <div class="p-4 flex flex-column gap-4">

          <!-- ═══════════ ١. معلومات الطلب ═══════════ -->
          <Panel toggleable>
            <template #header>
              <div class="flex align-items-center gap-2">
                <div class="section-num-badge">١</div>
                <span class="font-bold text-base text-800">معلومات طلب الشراء</span>
              </div>
            </template>

            <div class="grid row-gap-0 border-1 border-200 border-round overflow-hidden mb-3">
              <div class="col-6 md:col-3 p-3 border-bottom-1 border-left-1 border-200">
                <div class="info-label">رقم الطلب</div>
                <div class="font-bold text-sm text-800">{{ data.purchase_request.request_number }}</div>
              </div>
              <div class="col-6 md:col-3 p-3 border-bottom-1 border-left-1 border-200">
                <div class="info-label">مقدّم الطلب</div>
                <div class="text-sm text-700">{{ data.purchase_request.creator?.name ?? '—' }}</div>
              </div>
              <div class="col-6 md:col-3 p-3 border-bottom-1 border-left-1 border-200">
                <div class="info-label">القسم الطالب</div>
                <div class="text-sm text-700">{{ data.purchase_request.department?.name ?? '—' }}</div>
              </div>
              <div class="col-6 md:col-3 p-3 border-bottom-1 border-200">
                <div class="info-label">لجنة التقييم</div>
                <div class="text-sm text-700">{{ data.purchase_request.committee?.name ?? '—' }}</div>
              </div>
              <div class="col-6 md:col-3 p-3 border-bottom-1 border-left-1 border-200">
                <div class="info-label">الحالة</div>
                <Tag :value="data.purchase_request.status_label" :severity="statusSeverity(data.purchase_request.status_type)" />
              </div>
              <div class="col-6 md:col-3 p-3 border-bottom-1 border-left-1 border-200">
                <div class="info-label">الأولوية</div>
                <Tag :value="data.purchase_request.priority_label" :severity="prioritySeverity(data.purchase_request.priority)" />
              </div>
              <div class="col-6 md:col-3 p-3 border-bottom-1 border-left-1 border-200">
                <div class="info-label">تاريخ الطلب</div>
                <div class="text-sm text-700">{{ formatDate(data.purchase_request.created_at) }}</div>
              </div>
              <div class="col-6 md:col-3 p-3 border-bottom-1 border-200">
                <div class="info-label">التكلفة التقديرية</div>
                <span class="font-black text-lg text-yellow-600">{{ fmt(data.purchase_request.total_estimated_cost) }} د.ع</span>
              </div>
            </div>

            <div v-if="data.purchase_request.description" class="surface-50 border-right-3 border-yellow-400 px-3 py-2 mb-3 border-round-right">
              <div class="info-label mb-1">وصف الطلب</div>
              <p class="text-sm text-800 m-0 line-height-3">{{ data.purchase_request.description }}</p>
            </div>

            <Message v-if="data.purchase_request.rejected_reason" severity="error" :closable="false" class="mb-3">
              <strong>سبب الرفض: </strong>{{ data.purchase_request.rejected_reason }}
            </Message>

            <div v-if="data.purchase_request.images?.length" class="mt-2">
              <div class="info-label mb-2 flex align-items-center gap-1">
                <i class="pi pi-images text-primary" />
                صور الطلب المرفقة ({{ data.purchase_request.images.length }})
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(img, i) in data.purchase_request.images" :key="i"
                  class="border-round overflow-hidden border-1 border-200 cursor-pointer hover:shadow-3 transition-all transition-duration-150"
                  style="width:120px;height:90px"
                  @click="openGallery(data.purchase_request.images, i)"
                >
                  <img :src="img.file_url" :alt="`صورة ${i+1}`" style="width:100%;height:100%;object-fit:cover" @error="onImgError" />
                </div>
              </div>
            </div>
          </Panel>

          <!-- ═══════════ ٢. المواد المطلوبة ═══════════ -->
          <Panel toggleable>
            <template #header>
              <div class="flex align-items-center gap-2 w-full">
                <div class="section-num-badge">٢</div>
                <span class="font-bold text-base text-800">المواد المطلوبة</span>
                <Tag :value="`${data.items?.length ?? 0} مادة`" severity="warning" class="mr-auto font-bold" />
              </div>
            </template>

            <div v-if="!data.items?.length" class="flex align-items-center justify-content-center gap-2 py-5 text-color-secondary">
              <i class="pi pi-inbox text-3xl" /> لا توجد مواد
            </div>

            <div v-else class="flex flex-column gap-3">
              <div
                v-for="(item, idx) in data.items" :key="item.id"
                class="border-1 border-200 border-round-lg overflow-hidden"
              >
                <!-- رأس المادة -->
                <div class="surface-800 px-4 py-2 flex align-items-center gap-3 flex-wrap">
                  <div class="item-index-badge flex-shrink-0">{{ idx + 1 }}</div>
                  <span class="font-bold   text-base flex-1">{{ item.item_name }}</span>
                  <span class="text-400 text-xs">
                    الكمية: <strong class=" ">{{ item.quantity }} {{ item.unit?.name ?? '' }}</strong>
                  </span>
                  <span v-if="item.total_estimated_price" class="text-xs">
                    التقدير: <strong class="text-yellow-300">{{ fmt(item.total_estimated_price) }} د.ع</strong>
                  </span>
                </div>

                <div class="p-3 flex flex-column gap-3">
                  <div v-if="item.specifications" class="surface-50 border-right-3 border-yellow-400 px-3 py-2 border-round-right">
                    <div class="info-label mb-1">المواصفات</div>
                    <p class="text-sm m-0">{{ item.specifications }}</p>
                  </div>

                  <div class="grid row-gap-3">
                    <!-- فحص المستودع -->
                    <div class="col-12 md:col-6">
                      <div class="surface-50 border-1 border-200 border-round p-3 h-full">
                        <div class="flex align-items-center gap-2 mb-2 pb-2 border-bottom-1 border-dashed border-200">
                          <i class="pi pi-box text-blue-500 text-sm" />
                          <span class="info-label">فحص المستودع</span>
                        </div>
                        <div v-if="!item.warehouse_check" class="text-sm text-color-secondary">
                          <i class="pi pi-minus-circle ml-1" />لم يتم الفحص بعد
                        </div>
                        <div v-else class="flex flex-column gap-2">
                          <div class="flex justify-content-between align-items-center">
                            <span class="text-xs text-color-secondary">حالة التوفر</span>
                            <Tag :value="item.warehouse_check.availability_label" :severity="availSeverity(item.warehouse_check.availability)" />
                          </div>
                          <div class="flex justify-content-between align-items-center">
                            <span class="text-xs text-color-secondary">الكمية المتوفرة</span>
                            <strong class="text-sm">{{ item.warehouse_check.available_quantity }}</strong>
                          </div>
                          <div v-if="item.warehouse_check.item_condition" class="flex justify-content-between align-items-center">
                            <span class="text-xs text-color-secondary">حالة المادة</span>
                            <span class="text-sm">{{ item.warehouse_check.item_condition }}</span>
                          </div>
                          <div class="flex justify-content-between align-items-center">
                            <span class="text-xs text-color-secondary">التوصية</span>
                            <span class="text-sm font-bold">{{ item.warehouse_check.recommendation_label }}</span>
                          </div>
                          <p v-if="item.warehouse_check.notes" class="text-xs text-color-secondary surface-100 border-round px-2 py-1 m-0">
                            {{ item.warehouse_check.notes }}
                          </p>
                          <div class="text-xs text-color-secondary border-top-1 border-200 pt-1 mt-1">
                            فحص بواسطة: {{ item.warehouse_check.checked_by }}
                            <span v-if="item.warehouse_check.checked_at"> — {{ formatDate(item.warehouse_check.checked_at) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- تقييم الاحتياج -->
                    <div class="col-12 md:col-6">
                      <div class="surface-50 border-1 border-200 border-round p-3 h-full">
                        <div class="flex align-items-center gap-2 mb-2 pb-2 border-bottom-1 border-dashed border-200">
                          <i class="pi pi-chart-bar text-purple-500 text-sm" />
                          <span class="info-label">تقييم الاحتياج</span>
                        </div>
                        <div v-if="!item.needs_assessment" class="text-sm text-color-secondary">
                          <i class="pi pi-minus-circle ml-1" />لم يُقيَّم بعد
                        </div>
                        <div v-else class="flex flex-column gap-2">
                          <div class="flex justify-content-between align-items-center">
                            <span class="text-xs text-color-secondary">مستوى الإلحاح</span>
                            <Tag :value="item.needs_assessment.urgency_label" :severity="urgencySeverity(item.needs_assessment.urgency_level)" />
                          </div>
                          <div class="flex justify-content-between align-items-center">
                            <span class="text-xs text-color-secondary">حالة الحاجة</span>
                            <span class="text-sm">{{ item.needs_assessment.needs_status_label }}</span>
                          </div>
                          <div class="flex justify-content-between align-items-center">
                            <span class="text-xs text-color-secondary">قرار الإدارة</span>
                            <Tag :value="item.needs_assessment.admin_decision_label" :severity="decisionSeverity(item.needs_assessment.admin_decision)" />
                          </div>
                          <div v-if="item.needs_assessment.quantity_needed_after_assessment" class="flex justify-content-between align-items-center">
                            <span class="text-xs text-color-secondary">الكمية بعد التقييم</span>
                            <strong class="text-sm">{{ item.needs_assessment.quantity_needed_after_assessment }}</strong>
                          </div>
                          <div v-if="item.needs_assessment.reason" class="text-xs surface-100 border-round px-2 py-1">
                            <strong>السبب: </strong>{{ item.needs_assessment.reason }}
                          </div>
                          <div v-if="item.needs_assessment.recommended_action" class="text-xs surface-100 border-round px-2 py-1">
                            <strong>الإجراء المقترح: </strong>{{ item.needs_assessment.recommended_action }}
                          </div>
                          <div v-if="item.needs_assessment.admin_comment" class="text-xs surface-100 border-round px-2 py-1">
                            <strong>تعليق المدير: </strong>{{ item.needs_assessment.admin_comment }}
                          </div>
                          <div class="text-xs text-color-secondary border-top-1 border-200 pt-1 mt-1">
                            قيّمه: {{ item.needs_assessment.assessed_by }}
                            <span v-if="item.needs_assessment.assessed_at"> — {{ formatDate(item.needs_assessment.assessed_at) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- عروض الأسعار للمادة -->
                  <div v-if="item.estimate_items?.length">
                    <div class="info-label mb-2 flex align-items-center gap-1">
                      <i class="pi pi-tag text-orange-500" />
                      عروض الأسعار لهذه المادة ({{ item.estimate_items.length }})
                    </div>
                    <DataTable :value="item.estimate_items" class="p-datatable-sm" striped-rows :show-gridlines="false" size="small">
                      <Column field="estimate.vendor.name" header="المورد" />
                      <Column field="quantity" header="الكمية" style="width:6rem" />
                      <Column header="سعر الوحدة" style="width:9rem">
                        <template #body="{ data: ei }">{{ fmt(ei.unit_price) }} د.ع</template>
                      </Column>
                      <Column header="الإجمالي" style="width:9rem">
                        <template #body="{ data: ei }"><strong>{{ fmt(ei.total_price) }} د.ع</strong></template>
                      </Column>
                      <Column header="الحالة" style="width:8rem">
                        <template #body="{ data: ei }">
                          <Tag v-if="ei.estimate" :value="ei.estimate.status_label" :severity="statusSeverity(ei.estimate.status)" />
                        </template>
                      </Column>
                      <Column header="التاريخ" style="width:8rem">
                        <template #body="{ data: ei }">{{ ei.estimate?.estimate_date ? formatDate(ei.estimate.estimate_date) : '—' }}</template>
                      </Column>
                      <Column field="notes" header="ملاحظات">
                        <template #body="{ data: ei }"><span class="text-color-secondary text-xs">{{ ei.notes ?? '—' }}</span></template>
                      </Column>
                    </DataTable>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <!-- ═══════════ ٣. عروض الأسعار ═══════════ -->
          <Panel toggleable>
            <template #header>
              <div class="flex align-items-center gap-2 w-full">
                <div class="section-num-badge">٣</div>
                <span class="font-bold text-base text-800">عروض الأسعار</span>
                <Tag :value="`${data.estimates?.length ?? 0} عرض`" severity="warning" class="mr-auto font-bold" />
              </div>
            </template>

            <div v-if="!data.estimates?.length" class="flex align-items-center justify-content-center gap-2 py-5 text-color-secondary">
              <i class="pi pi-inbox text-3xl" /> لا توجد عروض أسعار
            </div>

            <div v-else class="flex flex-column gap-3">
              <div
                v-for="(est, idx) in data.estimates" :key="est.id"
                class="border-1 border-round-lg overflow-hidden"
                :class="est.status === 'accepted' ? 'border-green-400' : 'border-200'"
              >
                <div class="surface-50 px-4 py-3 flex justify-content-between align-items-center flex-wrap gap-3 border-bottom-1 border-200">
                  <div class="flex align-items-center gap-3">
                    <div class="surface-800   text-xs font-bold px-2 py-1 border-round">مورد</div>
                    <span class="font-bold text-lg text-800">{{ est.vendor?.name ?? `عرض #${idx + 1}` }}</span>
                    <Tag :value="est.status_label" :severity="statusSeverity(est.status)" />
                  </div>
                  <span class="font-black text-2xl text-yellow-600">
                    {{ fmt(est.total_amount) }} <span class="text-color-secondary text-base font-normal">د.ع</span>
                  </span>
                </div>

                <div class="p-3 flex flex-column gap-3">
                  <div v-if="est.vendor" class="flex flex-wrap gap-4 text-xs text-color-secondary surface-50 border-round px-3 py-2">
                    <span v-if="est.vendor.phone1"><i class="pi pi-phone ml-1" />{{ est.vendor.phone1 }}</span>
                    <span v-if="est.vendor.phone2"><i class="pi pi-phone ml-1" />{{ est.vendor.phone2 }}</span>
                    <span v-if="est.vendor.email"><i class="pi pi-envelope ml-1" />{{ est.vendor.email }}</span>
                    <span v-if="est.vendor.address"><i class="pi pi-map-marker ml-1" />{{ est.vendor.address }}</span>
                    <span v-if="est.estimate_date"><i class="pi pi-calendar ml-1" />تاريخ العرض: {{ formatDate(est.estimate_date) }}</span>
                  </div>

                  <Message v-if="est.notes" severity="secondary" :closable="false" class="text-sm">
                    <i class="pi pi-comment ml-1" />{{ est.notes }}
                  </Message>

                  <DataTable v-if="est.items?.length" :value="est.items" class="p-datatable-sm" striped-rows :show-gridlines="false" size="small">
                    <Column field="item_name" header="المادة" />
                    <Column field="quantity" header="الكمية" style="width:6rem" />
                    <Column header="سعر الوحدة" style="width:9rem">
                      <template #body="{ data: ei }">{{ fmt(ei.unit_price) }} د.ع</template>
                    </Column>
                    <Column header="الإجمالي" style="width:9rem">
                      <template #body="{ data: ei }"><strong>{{ fmt(ei.total_price) }} د.ع</strong></template>
                    </Column>
                    <Column field="notes" header="ملاحظات">
                      <template #body="{ data: ei }"><span class="text-color-secondary text-xs">{{ ei.notes ?? '—' }}</span></template>
                    </Column>
                    <template #footer>
                      <div class="flex justify-content-end gap-2 text-sm font-bold px-2">
                        <span class="text-color-secondary">الإجمالي الكلي:</span>
                        <span class="text-yellow-600">{{ fmt(est.total_amount) }} د.ع</span>
                      </div>
                    </template>
                  </DataTable>

                  <div v-if="est.images?.length">
                    <div class="info-label mb-2 flex align-items-center gap-1">
                      <i class="pi pi-images text-primary" />
                      صور العرض المرفقة ({{ est.images.length }})
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="(img, i) in est.images" :key="i"
                        class="border-round overflow-hidden border-1 border-200 cursor-pointer hover:shadow-3 transition-all"
                        style="width:100px;height:75px"
                        @click="openGallery(est.images, i)"
                      >
                        <img :src="img.file_url ?? img.url ?? img" :alt="`صورة ${i+1}`" style="width:100%;height:100%;object-fit:cover" @error="onImgError" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <!-- ═══════════ ٤. أوامر الشراء ═══════════ -->
          <Panel v-if="data.procurements?.length" toggleable>
            <template #header>
              <div class="flex align-items-center gap-2 w-full">
                <div class="section-num-badge">٤</div>
                <span class="font-bold text-base text-800">أوامر الشراء الفعلية</span>
                <Tag :value="`${data.procurements.length} أمر`" severity="warning" class="mr-auto font-bold" />
              </div>
            </template>

            <div class="flex flex-column gap-3">
              <div
                v-for="(proc, idx) in data.procurements" :key="proc.id"
                class="border-1 border-200 border-round-lg overflow-hidden"
              >
                <div class="surface-50 px-4 py-3 flex justify-content-between align-items-center flex-wrap gap-3 border-bottom-1 border-200">
                  <div class="flex align-items-center gap-3">
                    <Tag :value="proc.reference_no ?? `PO-${idx + 1}`" severity="secondary" class="font-bold" style="font-family:monospace" />
                    <Tag :value="proc.status_label" :severity="statusSeverity(proc.status)" />
                  </div>
                  <div class="flex align-items-center gap-4 text-xs text-color-secondary">
                    <span><i class="pi pi-calendar ml-1" />{{ proc.purchase_date ? formatDate(proc.purchase_date) : '—' }}</span>
                    <span><i class="pi pi-user ml-1" />{{ proc.created_by ?? '—' }}</span>
                    <span class="font-black text-xl text-yellow-600">{{ fmt(proc.total_amount) }} <span class="text-color-secondary text-sm font-normal">د.ع</span></span>
                  </div>
                </div>

                <div class="p-3">
                  <Message v-if="proc.notes" severity="secondary" :closable="false" class="text-sm mb-3">
                    <i class="pi pi-comment ml-1" />{{ proc.notes }}
                  </Message>
                  <DataTable :value="proc.items" class="p-datatable-sm" striped-rows :show-gridlines="false" size="small">
                    <Column field="item_name" header="المادة" />
                    <Column field="unit" header="الوحدة" style="width:6rem" />
                    <Column field="quantity" header="الكمية" style="width:6rem" />
                    <Column header="سعر الشراء" style="width:9rem">
                      <template #body="{ data: pi }">{{ fmt(pi.purchase_price) }} د.ع</template>
                    </Column>
                    <Column header="سعر العرض" style="width:9rem">
                      <template #body="{ data: pi }">
                        <span v-if="pi.estimate_price > 0">{{ fmt(pi.estimate_price) }} د.ع</span>
                        <span v-else class="text-color-secondary">—</span>
                      </template>
                    </Column>
                    <Column header="الفرق" style="width:8rem">
                      <template #body="{ data: pi }">
                        <span v-if="pi.estimate_price > 0" class="font-bold" :class="pi.difference > 0 ? 'text-red-500' : pi.difference < 0 ? 'text-green-500' : 'text-color-secondary'">
                          {{ fmt(pi.difference) }}
                        </span>
                        <span v-else class="text-color-secondary">—</span>
                      </template>
                    </Column>
                    <Column header="الإجمالي" style="width:9rem">
                      <template #body="{ data: pi }"><strong>{{ fmt(pi.total_price) }} د.ع</strong></template>
                    </Column>
                    <Column field="notes" header="ملاحظات">
                      <template #body="{ data: pi }"><span class="text-color-secondary text-xs">{{ pi.notes ?? '—' }}</span></template>
                    </Column>
                    <template #footer>
                      <div class="flex justify-content-end gap-2 text-sm font-bold px-2">
                        <span class="text-color-secondary">المجموع الكلي:</span>
                        <span class="text-yellow-600">{{ fmt(proc.total_amount) }} د.ع</span>
                      </div>
                    </template>
                  </DataTable>
                </div>
              </div>
            </div>
          </Panel>

          <!-- ═══════════ ٥. الملخص المالي ═══════════ -->
          <Panel toggleable>
            <template #header>
              <div class="flex align-items-center gap-2">
                <div class="section-num-badge">٥</div>
                <span class="font-bold text-base text-800">الملخص المالي</span>
              </div>
            </template>

            <!-- البطاقات المالية -->
            <div class="grid row-gap-3 mb-4">
              <div class="col-6 md:col-3">
                <div class="surface-50 border-1 border-200 border-round-lg p-3 text-center border-top-3 border-blue-400">
                  <i class="pi pi-calculator text-blue-500 text-2xl mb-2 block" />
                  <div class="info-label mb-1">التكلفة التقديرية</div>
                  <div class="font-black text-xl text-800">{{ fmt(data.financial.total_estimated_cost) }}</div>
                  <div class="text-xs text-color-secondary mt-1">دينار عراقي</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="surface-50 border-1 border-200 border-round-lg p-3 text-center border-top-3 border-green-400">
                  <i class="pi pi-check-circle text-green-500 text-2xl mb-2 block" />
                  <div class="info-label mb-1">إجمالي العروض المقبولة</div>
                  <div class="font-black text-xl text-800">{{ fmt(data.financial.accepted_estimates_total) }}</div>
                  <div class="text-xs text-color-secondary mt-1">دينار عراقي</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="surface-50 border-1 border-200 border-round-lg p-3 text-center border-top-3 border-orange-400">
                  <i class="pi pi-shopping-cart text-orange-500 text-2xl mb-2 block" />
                  <div class="info-label mb-1">إجمالي الشراء الفعلي</div>
                  <div class="font-black text-xl text-800">{{ fmt(data.financial.actual_procurement_total) }}</div>
                  <div class="text-xs text-color-secondary mt-1">دينار عراقي</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div
                  class="surface-50 border-1 border-200 border-round-lg p-3 text-center border-top-3"
                  :class="(data.financial.saving ?? 0) >= 0 ? 'border-green-500' : 'border-red-400'"
                >
                  <i class="text-2xl mb-2 block" :class="(data.financial.saving ?? 0) >= 0 ? 'pi pi-arrow-down text-green-500' : 'pi pi-arrow-up text-red-500'" />
                  <div class="info-label mb-1">{{ (data.financial.saving ?? 0) >= 0 ? 'التوفير المحقق' : 'الزيادة في التكلفة' }}</div>
                  <div class="font-black text-xl" :class="(data.financial.saving ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'">
                    {{ fmt(Math.abs(data.financial.saving ?? 0)) }}
                  </div>
                  <div class="text-xs text-color-secondary mt-1">دينار عراقي</div>
                </div>
              </div>
            </div>

            <!-- الإحصائيات -->
            <div class="grid border-1 border-200 border-round overflow-hidden mb-4">
              <div class="col-3 text-center p-3 border-left-1 border-200">
                <div class="font-black text-3xl text-800">{{ data.financial.estimates_count }}</div>
                <div class="text-xs text-color-secondary">عروض أسعار</div>
              </div>
              <div class="col-3 text-center p-3 border-left-1 border-200">
                <div class="font-black text-3xl text-green-600">{{ data.financial.accepted_estimates_count }}</div>
                <div class="text-xs text-color-secondary">عروض مقبولة</div>
              </div>
              <div class="col-3 text-center p-3 border-left-1 border-200">
                <div class="font-black text-3xl text-orange-500">{{ data.financial.procurements_count }}</div>
                <div class="text-xs text-color-secondary">أوامر شراء</div>
              </div>
              <div class="col-3 text-center p-3">
                <div class="font-black text-3xl text-blue-500">{{ data.items?.length ?? 0 }}</div>
                <div class="text-xs text-color-secondary">مادة مطلوبة</div>
              </div>
            </div>

            <!-- توزيع العروض على الموردين -->
            <div v-if="Object.keys(data.financial.estimates_by_vendor || {}).length">
              <Divider align="right">
                <span class="info-label">توزيع العروض على الموردين</span>
              </Divider>
              <DataTable :value="vendorBreakdown" class="p-datatable-sm" striped-rows :show-gridlines="false" size="small">
                <Column field="vendor" header="المورد" />
                <Column field="total" header="إجمالي العرض" style="width:14rem">
                  <template #body="{ data: v }">
                    <strong class="text-yellow-600">{{ fmt(v.total) }} د.ع</strong>
                  </template>
                </Column>
              </DataTable>
            </div>
          </Panel>

          <!-- ═══════════ منطقة التوقيعات ═══════════ -->
          <div class="grid row-gap-3">
            <div v-for="sig in signatures" :key="sig.title" class="col-6 md:col-3">
              <div class="border-1 border-200 border-round p-4 text-center">
                <div class="info-label uppercase mb-4">{{ sig.title }}</div>
                <div class="font-bold text-sm mb-2">{{ sig.name }}</div>
                <Divider />
                <div class="text-xs text-color-secondary">التوقيع / الختم</div>
              </div>
            </div>
          </div>

        </div>

        <!-- ═══════════ تذييل التقرير ═══════════ -->
        <div class="surface-800 px-5 py-3 flex justify-content-between align-items-center">
          <div>
            <div class="text-yellow-300 font-bold text-sm">نظام إدارة المشتريات</div>
            <div class="text-400 text-xs mt-1">وثيقة رسمية — للاستخدام الداخلي فقط</div>
          </div>
          <div class="text-400 text-xs text-left line-height-3">
            <div>أُصدر بواسطة: {{ data.generated_by }}</div>
            <div>تاريخ الطباعة: {{ printDate }}</div>
          </div>
        </div>

      </div><!-- /report-sheet -->
    </template>

    <!-- ─── Galleria Dialog ─── -->
    <Dialog v-model:visible="showGallery" :modal="true" :style="{ width: '80vw', maxWidth: '900px' }" header="معاينة الصور" dir="rtl">
      <Galleria
        :value="galleryImages"
        v-model:activeIndex="galleryIndex"
        :num-visible="5"
        :circular="true"
        :show-thumbnails="true"
        :show-item-navigators="true"
      >
        <template #item="{ item }">
          <img :src="item.file_url ?? item.url ?? item" style="width:100%;max-height:500px;object-fit:contain" />
        </template>
        <template #thumbnail="{ item }">
          <img :src="item.file_url ?? item.url ?? item" style="width:60px;height:40px;object-fit:cover" />
        </template>
      </Galleria>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from '../../../api/api'
import { useRoute } from 'vue-router'

import Panel           from 'primevue/panel'
import DataTable       from 'primevue/datatable'
import Column          from 'primevue/column'
import Tag             from 'primevue/tag'
import Button          from 'primevue/button'
import Dialog          from 'primevue/dialog'
import Galleria        from 'primevue/galleria'
import Divider         from 'primevue/divider'
import Message         from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()

// ─── State ───────────────────────────────────────────────────────────────
const reportId      = ref<number | null>(null)
const data          = ref<any>(null)
const loading       = ref(true)
const error         = ref('')
const showGallery   = ref(false)
const galleryImages = ref<any[]>([])
const galleryIndex  = ref(0)

// ─── Computed ────────────────────────────────────────────────────────────
const printDate = computed(() =>
  new Date().toLocaleString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
)

const signatures = computed(() => [
  { title: 'مقدّم الطلب',   name: data.value?.purchase_request?.creator?.name ?? '—' },
  { title: 'مدير القسم',    name: '_______________' },
  { title: 'المدير المالي', name: '_______________' },
  { title: 'المدير العام',  name: '_______________' },
])

const vendorBreakdown = computed(() =>
  Object.entries(data.value?.financial?.estimates_by_vendor ?? {}).map(([vendor, total]) => ({ vendor, total }))
)

// ─── Severity Helpers ─────────────────────────────────────────────────────
const statusSeverity   = (s: string) => ({ pending: 'warning', approved: 'success', accepted: 'success', completed: 'success', in_progress: 'info', rejected: 'danger', cancelled: 'danger', draft: 'secondary' }[s] ?? 'secondary')
const prioritySeverity = (p: string) => ({ high: 'danger', critical: 'danger', medium: 'warning', low: 'success' }[p] ?? 'secondary')
const availSeverity    = (a: string) => ({ available: 'success', partial: 'warning', unavailable: 'danger' }[a] ?? 'secondary')
const urgencySeverity  = (u: string) => ({ critical: 'danger', high: 'danger', medium: 'warning', low: 'success' }[u] ?? 'secondary')
const decisionSeverity = (d: string) => ({ approved: 'success', rejected: 'danger', pending: 'warning' }[d] ?? 'secondary')

// ─── Helpers ─────────────────────────────────────────────────────────────
const fmt = (n: any): string => {
  const num = parseFloat(n)
  return isNaN(num) ? '0' : num.toLocaleString('en-US')
}

const formatDate = (d: string | null): string => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}

const onImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="90"%3E%3Crect width="120" height="90" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="12"%3E404%3C/text%3E%3C/svg%3E'
}

const openGallery = (images: any[], idx: number) => {
  galleryImages.value = images
  galleryIndex.value  = idx
  showGallery.value   = true
}

// ─── Fetch ────────────────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  error.value   = ''
  try {
    const res  = await axios.get(`/reports/${reportId.value}/data`)
    data.value = res.data?.data ?? res.data
  } catch (e: any) {
    error.value = e.response?.data?.message ?? e.message ?? 'حدث خطأ أثناء جلب البيانات'
  } finally {
    loading.value = false
  }
}

const printPage = () => window.print()

// ─── Lifecycle ───────────────────────────────────────────────────────────
onMounted(() => {
  const id = parseInt(route.params.id as string)
  if (!id || isNaN(id)) {
    error.value   = 'معرّف التقرير غير صالح'
    loading.value = false
    return
  }
  reportId.value = id
  fetchData()
})
</script>

<style scoped>
.report-root {
  min-height: 100vh;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  direction: rtl;
}

.report-sheet { max-width: 980px; }

/* رقم القسم */
.section-num-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  background: var(--primary-color, #3B82F6);
  color: #fff;
  font-weight: 900;
  font-size: 13px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* رقم المادة */
.item-index-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  background: #f59e0b;
  color: #fff;
  font-weight: 900;
  font-size: 12px;
  border-radius: 3px;
}

/* تسمية الحقل */
.info-label {
  font-size: 10px;
  color: var(--text-color-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
}

/* ── PrimeVue Overrides ── */
:deep(.p-panel .p-panel-header) {
  background: var(--surface-50);
  border-bottom: 2px solid var(--surface-200);
  padding: 0.75rem 1rem;
}
:deep(.p-panel .p-panel-content) { padding: 1rem; }
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #1e293b;
  color: #fff;
  font-size: 11px;
  padding: 8px 10px;
  text-align: right;
}
:deep(.p-datatable-footer) {
  background: var(--surface-50);
  padding: 0.5rem 1rem;
  border-top: 2px solid var(--surface-200);
}

/* ── Print ── */
@media print {
  .no-print { display: none !important; }
  .report-root { background: white !important; }
  .report-sheet { margin: 0 !important; box-shadow: none !important; max-width: 100% !important; }

  .surface-800 { background: #1e293b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .surface-100, .surface-50 { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  :deep(.p-panel) { page-break-inside: avoid; }
  :deep(.p-tag)   { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  @page { size: A4 portrait; margin: 12mm 10mm; }
}
</style>