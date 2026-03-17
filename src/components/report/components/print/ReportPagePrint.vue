<template>
  <div class="report-root" dir="rtl">

    <!-- ══════════════════════════════════════
         حالة التحميل
    ══════════════════════════════════════ -->
    <div v-if="loading" class="flex flex-column align-items-center justify-content-center" style="min-height:100vh; gap:1rem">
      <ProgressSpinner style="width:56px;height:56px" stroke-width="4" />
      <span class="text-color-secondary text-lg">جارٍ تحميل التقرير…</span>
    </div>

    <!-- ══════════════════════════════════════
         حالة الخطأ
    ══════════════════════════════════════ -->
    <div v-else-if="error" class="flex flex-column align-items-center justify-content-center gap-3" style="min-height:100vh">
      <i class="pi pi-exclamation-circle text-red-500" style="font-size:3rem" />
      <p class="text-red-500 text-lg font-medium m-0">{{ error }}</p>
      <Button label="إعادة المحاولة" icon="pi pi-refresh" @click="fetchData" />
    </div>

    <!-- ══════════════════════════════════════
         محتوى التقرير
    ══════════════════════════════════════ -->
    <template v-else-if="data && data.purchase_request && data.financial">

      <!-- ── شريط الأدوات ── -->
      <div class="toolbar-bar no-print surface-800 px-5 py-3 flex align-items-center justify-content-between sticky top-0 z-5 shadow-4">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-file-pdf text-yellow-400 text-2xl" />
          <span class="text-white font-bold text-lg">تقرير طلب الشراء</span>
          <Tag :value="data.purchase_request.request_number" severity="warning" class="font-bold" />
        </div>
        <Button
          label="طباعة التقرير"
          icon="pi pi-print"
          class="p-button-warning font-bold"
          @click="printPage"
        />
      </div>

      <!-- ── ورقة التقرير ── -->
      <div class="report-sheet mx-auto my-4 surface-0 border-round-xl shadow-4 overflow-hidden" style="max-width:980px">

        <!-- ═══════════ HEADER ═══════════ -->
        <div class="report-header px-5 py-4 surface-800 relative">
          <div class="header-accent-top" />
          <div class="flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div class="text-white font-black text-3xl mb-1">نظام إدارة المشتريات</div>
              <div class="text-blue-200 text-sm">تقرير طلب شراء شامل — وثيقة رسمية داخلية</div>
            </div>
            <div class="doc-badge px-4 py-2 border-round text-center" style="background:var(--yellow-500); min-width:120px">
              <div class="text-xs text-800 font-medium mb-1">رقم الطلب</div>
              <div class="text-2xl font-black text-800">{{ data.purchase_request.request_number }}</div>
            </div>
          </div>
          <Divider class="border-blue-700 my-3" />
          <div class="flex flex-wrap gap-4">
            <div class="flex align-items-center gap-2 text-blue-200 text-sm">
              <i class="pi pi-calendar" />
              <span>تاريخ الإصدار: <strong class="text-white">{{ formatDate(data.generated_at) }}</strong></span>
            </div>
            <div class="flex align-items-center gap-2 text-blue-200 text-sm">
              <i class="pi pi-user" />
              <span>أصدره: <strong class="text-white">{{ data.generated_by }}</strong></span>
            </div>
            <div class="flex align-items-center gap-2 text-blue-200 text-sm">
              <i class="pi pi-building" />
              <span>القسم: <strong class="text-white">{{ data.purchase_request.department?.name ?? '—' }}</strong></span>
            </div>
            <div class="flex align-items-center gap-2 text-blue-200 text-sm">
              <i class="pi pi-clock" />
              <span>تاريخ الطلب: <strong class="text-white">{{ formatDate(data.purchase_request.created_at) }}</strong></span>
            </div>
          </div>
        </div>

        <!-- ═══════════ TITLE BAND ═══════════ -->
        <div class="surface-100 border-bottom-1 border-300 px-5 py-3 flex align-items-center justify-content-between flex-wrap gap-3">
          <span class="text-xl font-black text-800">{{ data.purchase_request.title }}</span>
          <div class="flex gap-2">
            <Tag :value="data.purchase_request.priority_label" :severity="prioritySeverity(data.purchase_request.priority)" />
            <Tag :value="data.purchase_request.status_label"   :severity="statusSeverity(data.purchase_request.status_type)" />
          </div>
        </div>

        <div class="px-5 py-4 flex flex-column gap-5">

          <!-- ═══════════ ١. معلومات الطلب ═══════════ -->
          <Panel toggleable>
            <template #header>
              <SectionHeader num="١" title="معلومات طلب الشراء" />
            </template>

            <div class="grid row-gap-3 col-gap-3">
              <div class="col-6 md:col-3"><InfoCell label="رقم الطلب"           :value="data.purchase_request.request_number" bold /></div>
              <div class="col-6 md:col-3"><InfoCell label="مقدّم الطلب"         :value="data.purchase_request.creator?.name" /></div>
              <div class="col-6 md:col-3"><InfoCell label="القسم الطالب"        :value="data.purchase_request.department?.name" /></div>
              <div class="col-6 md:col-3"><InfoCell label="لجنة التقييم"        :value="data.purchase_request.committee?.name" /></div>
              <div class="col-6 md:col-3"><InfoCell label="تاريخ الطلب"         :value="formatDate(data.purchase_request.created_at)" /></div>
              <div class="col-6 md:col-3">
                <InfoCell label="الحالة">
                  <Tag :value="data.purchase_request.status_label" :severity="statusSeverity(data.purchase_request.status_type)" />
                </InfoCell>
              </div>
              <div class="col-6 md:col-3">
                <InfoCell label="الأولوية">
                  <Tag :value="data.purchase_request.priority_label" :severity="prioritySeverity(data.purchase_request.priority)" />
                </InfoCell>
              </div>
              <div class="col-6 md:col-3">
                <InfoCell label="التكلفة التقديرية">
                  <span class="font-black text-xl text-yellow-600">{{ fmt(data.purchase_request.total_estimated_cost) }} د.ع</span>
                </InfoCell>
              </div>
            </div>

            <div v-if="data.purchase_request.description" class="mt-3 p-3 surface-100 border-right-4 border-yellow-500 border-round">
              <div class="text-xs text-500 font-bold uppercase mb-1">وصف الطلب</div>
              <div class="text-sm text-700 line-height-3">{{ data.purchase_request.description }}</div>
            </div>

            <Message v-if="data.purchase_request.rejected_reason" severity="error" class="mt-3" :closable="false">
              <strong>سبب الرفض:</strong> {{ data.purchase_request.rejected_reason }}
            </Message>

            <!-- صور الطلب -->
            <div v-if="data.purchase_request.images?.length" class="mt-3">
              <div class="text-xs text-500 font-bold uppercase mb-2">
                <i class="pi pi-images ml-1" />صور الطلب المرفقة
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(img, i) in data.purchase_request.images" :key="i"
                  class="img-thumb border-round overflow-hidden border-1 border-300 cursor-pointer"
                  @click="openGallery(data.purchase_request.images, i)"
                >
                  <img :src="img.file_url" :alt="`صورة ${i+1}`" style="width:90px;height:68px;object-fit:cover;display:block" @error="onImgError" />
                </div>
              </div>
            </div>
          </Panel>

          <!-- ═══════════ ٢. المواد المطلوبة ═══════════ -->
          <Panel toggleable>
            <template #header>
              <SectionHeader num="٢" title="المواد المطلوبة" :count="data.items?.length" count-label="مادة" />
            </template>

            <div v-if="!data.items?.length" class="flex align-items-center justify-content-center gap-3 py-5 text-500">
              <i class="pi pi-inbox text-4xl" /> لا توجد مواد
            </div>

            <div v-else class="flex flex-column gap-4">
              <div v-for="(item, idx) in data.items" :key="item.id" class="item-card surface-50 border-round-lg border-1 border-200 overflow-hidden">

                <!-- رأس المادة -->
                <div class="item-card-head surface-800 px-4 py-3 flex align-items-center gap-3 flex-wrap">
                  <span class="item-idx flex align-items-center justify-content-center border-round font-black text-800" style="width:28px;height:28px;background:var(--yellow-400);font-size:13px;flex-shrink:0">
                    {{ idx + 1 }}
                  </span>
                  <span class="text-white font-bold text-base flex-1">{{ item.item_name }}</span>
                  <span class="text-blue-200 text-sm">
                    الكمية: <strong class="text-white">{{ item.quantity }} {{ item.unit?.name ?? '' }}</strong>
                  </span>
                  <span class="text-blue-200 text-sm">
                    التقدير: <strong class="text-yellow-300">{{ fmt(item.total_estimated_price) }} د.ع</strong>
                  </span>
                </div>

                <div class="p-4 flex flex-column gap-3">

                  <div v-if="item.specifications" class="p-3 surface-100 border-right-3 border-yellow-500 border-round text-sm text-700">
                    <div class="text-xs text-500 font-bold uppercase mb-1">المواصفات</div>
                    {{ item.specifications }}
                  </div>

                  <div class="grid row-gap-3">
                    <!-- فحص المستودع -->
                    <div class="col-12 md:col-6">
                      <div class="h-full surface-card border-round border-1 border-200 p-3">
                        <div class="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 border-200">
                          <i class="pi pi-box text-blue-500" />
                          <span class="font-bold text-sm text-600 uppercase" style="letter-spacing:.04em">فحص المستودع</span>
                        </div>
                        <div v-if="!item.warehouse_check" class="text-500 text-sm flex align-items-center gap-2">
                          <i class="pi pi-minus-circle" /> لم يتم الفحص بعد
                        </div>
                        <div v-else class="flex flex-column gap-2">
                          <CheckRow label="حالة التوفر">
                            <Tag :value="item.warehouse_check.availability_label" :severity="availSeverity(item.warehouse_check.availability)" />
                          </CheckRow>
                          <CheckRow label="الكمية المتوفرة" :value="String(item.warehouse_check.available_quantity)" />
                          <CheckRow v-if="item.warehouse_check.item_condition" label="حالة المادة" :value="item.warehouse_check.item_condition" />
                          <CheckRow label="التوصية" :value="item.warehouse_check.recommendation_label" bold />
                          <div v-if="item.warehouse_check.notes" class="text-xs text-600 surface-100 p-2 border-round">{{ item.warehouse_check.notes }}</div>
                          <div class="text-xs text-400 border-top-1 border-200 pt-2">فحص بواسطة: {{ item.warehouse_check.checked_by }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- تقييم الاحتياج -->
                    <div class="col-12 md:col-6">
                      <div class="h-full surface-card border-round border-1 border-200 p-3">
                        <div class="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 border-200">
                          <i class="pi pi-chart-bar text-purple-500" />
                          <span class="font-bold text-sm text-600 uppercase" style="letter-spacing:.04em">تقييم الاحتياج</span>
                        </div>
                        <div v-if="!item.needs_assessment" class="text-500 text-sm flex align-items-center gap-2">
                          <i class="pi pi-minus-circle" /> لم يُقيَّم بعد
                        </div>
                        <div v-else class="flex flex-column gap-2">
                          <CheckRow label="مستوى الإلحاح">
                            <Tag :value="item.needs_assessment.urgency_label" :severity="urgencySeverity(item.needs_assessment.urgency_level)" />
                          </CheckRow>
                          <CheckRow label="حالة الحاجة" :value="item.needs_assessment.needs_status_label" />
                          <CheckRow label="قرار الإدارة">
                            <Tag :value="item.needs_assessment.admin_decision_label" :severity="decisionSeverity(item.needs_assessment.admin_decision)" />
                          </CheckRow>
                          <CheckRow v-if="item.needs_assessment.quantity_needed_after_assessment" label="الكمية بعد التقييم" :value="String(item.needs_assessment.quantity_needed_after_assessment)" bold />
                          <div v-if="item.needs_assessment.reason" class="text-xs text-600 surface-100 p-2 border-round">
                            <strong>السبب:</strong> {{ item.needs_assessment.reason }}
                          </div>
                          <div v-if="item.needs_assessment.recommended_action" class="text-xs text-600 surface-100 p-2 border-round">
                            <strong>الإجراء المقترح:</strong> {{ item.needs_assessment.recommended_action }}
                          </div>
                          <div v-if="item.needs_assessment.admin_comment" class="text-xs text-600 surface-100 p-2 border-round">
                            <strong>تعليق المدير:</strong> {{ item.needs_assessment.admin_comment }}
                          </div>
                          <div class="text-xs text-400 border-top-1 border-200 pt-2">قيّمه: {{ item.needs_assessment.assessed_by }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- عروض الأسعار للمادة -->
                  <div v-if="item.estimate_items?.length">
                    <div class="text-xs text-500 font-bold uppercase mb-2" style="letter-spacing:.04em">
                      <i class="pi pi-tag text-orange-500 ml-1" />عروض الأسعار لهذه المادة
                    </div>
                    <DataTable :value="item.estimate_items" class="p-datatable-sm" striped-rows :show-gridlines="false" size="small">
                      <Column field="estimate.vendor.name" header="المورد" />
                      <Column field="quantity"             header="الكمية" style="width:6rem" />
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
                      <Column header="التاريخ" style="width:9rem">
                        <template #body="{ data: ei }">{{ ei.estimate?.estimate_date ? formatDate(ei.estimate.estimate_date) : '—' }}</template>
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
              <SectionHeader num="٣" title="عروض الأسعار" :count="data.estimates?.length" count-label="عرض" />
            </template>

            <div v-if="!data.estimates?.length" class="flex align-items-center justify-content-center gap-3 py-5 text-500">
              <i class="pi pi-inbox text-4xl" /> لا توجد عروض أسعار
            </div>

            <div v-else class="flex flex-column gap-4">
              <div
                v-for="(est, idx) in data.estimates" :key="est.id"
                class="border-round-lg border-1 overflow-hidden"
                :class="est.status === 'accepted' ? 'border-green-400' : 'border-200'"
              >
                <!-- رأس العرض -->
                <div class="surface-50 border-bottom-1 border-200 px-4 py-3 flex align-items-center justify-content-between flex-wrap gap-3">
                  <div class="flex align-items-center gap-3">
                    <Tag value="مورد" severity="secondary" class="text-xs font-bold" />
                    <span class="font-black text-lg text-800">{{ est.vendor?.name ?? `عرض #${idx + 1}` }}</span>
                    <Tag :value="est.status_label" :severity="statusSeverity(est.status)" />
                  </div>
                  <span class="font-black text-2xl text-yellow-600">{{ fmt(est.total_amount) }} <span class="text-sm text-500 font-normal">د.ع</span></span>
                </div>

                <!-- بيانات المورد -->
                <div v-if="est.vendor" class="px-4 py-2 border-bottom-1 border-200 surface-ground flex flex-wrap gap-4 text-sm text-500">
                  <span v-if="est.vendor.phone1"><i class="pi pi-phone ml-1" />{{ est.vendor.phone1 }}</span>
                  <span v-if="est.vendor.phone2"><i class="pi pi-phone ml-1" />{{ est.vendor.phone2 }}</span>
                  <span v-if="est.vendor.email"><i class="pi pi-envelope ml-1" />{{ est.vendor.email }}</span>
                  <span v-if="est.vendor.address"><i class="pi pi-map-marker ml-1" />{{ est.vendor.address }}</span>
                  <span v-if="est.estimate_date"><i class="pi pi-calendar ml-1" />{{ formatDate(est.estimate_date) }}</span>
                </div>

                <div v-if="est.notes" class="px-4 py-2 border-bottom-1 border-200 text-sm text-500 flex align-items-center gap-2">
                  <i class="pi pi-comment" />{{ est.notes }}
                </div>

                <div class="p-3">
                  <DataTable v-if="est.items?.length" :value="est.items" class="p-datatable-sm" striped-rows :show-gridlines="false" size="small">
                    <Column field="item_name"  header="المادة" />
                    <Column field="quantity"   header="الكمية"     style="width:6rem" />
                    <Column header="سعر الوحدة" style="width:9rem">
                      <template #body="{ data: ei }">{{ fmt(ei.unit_price) }} د.ع</template>
                    </Column>
                    <Column header="الإجمالي" style="width:9rem">
                      <template #body="{ data: ei }"><strong>{{ fmt(ei.total_price) }} د.ع</strong></template>
                    </Column>
                    <Column field="notes" header="ملاحظات">
                      <template #body="{ data: ei }"><span class="text-500 text-sm">{{ ei.notes ?? '—' }}</span></template>
                    </Column>
                  </DataTable>

                  <!-- الإجمالي -->
                  <div class="flex justify-content-end mt-2">
                    <div class="surface-100 border-round px-4 py-2 text-sm">
                      الإجمالي الكلي: <strong class="text-yellow-600 text-lg mr-2">{{ fmt(est.total_amount) }} د.ع</strong>
                    </div>
                  </div>

                  <!-- صور العرض -->
                  <div v-if="est.images?.length" class="mt-3">
                    <div class="text-xs text-500 font-bold uppercase mb-2"><i class="pi pi-images ml-1" />صور العرض المرفقة</div>
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="(img, i) in est.images" :key="i"
                        class="img-thumb border-round overflow-hidden border-1 border-300 cursor-pointer"
                        @click="openGallery(est.images, i)"
                      >
                        <img :src="img.file_url ?? img.url ?? img" :alt="`صورة ${i+1}`" style="width:90px;height:68px;object-fit:cover;display:block" @error="onImgError" />
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
              <SectionHeader num="٤" title="أوامر الشراء الفعلية" :count="data.procurements.length" count-label="أمر" />
            </template>

            <div class="flex flex-column gap-4">
              <div v-for="(proc, idx) in data.procurements" :key="proc.id" class="surface-50 border-round-lg border-1 border-200 overflow-hidden">
                <div class="surface-100 border-bottom-1 border-200 px-4 py-3 flex align-items-center justify-content-between flex-wrap gap-3">
                  <div class="flex align-items-center gap-3">
                    <span class="font-black font-mono text-800 text-base">{{ proc.reference_no ?? `PO-${idx + 1}` }}</span>
                    <Tag :value="proc.status_label" :severity="statusSeverity(proc.status)" />
                  </div>
                  <div class="flex align-items-center gap-4 text-sm text-500">
                    <span><i class="pi pi-calendar ml-1" />{{ proc.purchase_date ? formatDate(proc.purchase_date) : '—' }}</span>
                    <span><i class="pi pi-user ml-1" />{{ proc.created_by ?? '—' }}</span>
                    <span class="font-black text-xl text-yellow-600">{{ fmt(proc.total_amount) }} <span class="text-sm font-normal text-500">د.ع</span></span>
                  </div>
                </div>

                <div v-if="proc.notes" class="px-4 py-2 border-bottom-1 border-200 text-sm text-500 flex gap-2">
                  <i class="pi pi-comment" />{{ proc.notes }}
                </div>

                <div class="p-3">
                  <DataTable :value="proc.items" class="p-datatable-sm" striped-rows :show-gridlines="false" size="small">
                    <Column field="item_name"     header="المادة" />
                    <Column field="unit"          header="الوحدة"     style="width:6rem" />
                    <Column field="quantity"      header="الكمية"     style="width:6rem" />
                    <Column header="سعر الشراء"  style="width:9rem">
                      <template #body="{ data: pi }">{{ fmt(pi.purchase_price) }} د.ع</template>
                    </Column>
                    <Column header="سعر العرض"   style="width:9rem">
                      <template #body="{ data: pi }">
                        <span v-if="pi.estimate_price > 0">{{ fmt(pi.estimate_price) }} د.ع</span>
                        <span v-else class="text-500">—</span>
                      </template>
                    </Column>
                    <Column header="الفرق"        style="width:7rem">
                      <template #body="{ data: pi }">
                        <span
                          v-if="pi.estimate_price > 0"
                          class="font-bold"
                          :class="pi.difference > 0 ? 'text-red-500' : pi.difference < 0 ? 'text-green-500' : 'text-500'"
                        >{{ fmt(pi.difference) }}</span>
                        <span v-else class="text-500">—</span>
                      </template>
                    </Column>
                    <Column header="الإجمالي"     style="width:9rem">
                      <template #body="{ data: pi }"><strong>{{ fmt(pi.total_price) }} د.ع</strong></template>
                    </Column>
                  </DataTable>

                  <div class="flex justify-content-end mt-2">
                    <div class="surface-100 border-round px-4 py-2 text-sm">
                      المجموع الكلي: <strong class="text-yellow-600 text-lg mr-2">{{ fmt(proc.total_amount) }} د.ع</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <!-- ═══════════ ٥. الملخص المالي ═══════════ -->
          <Panel toggleable>
            <template #header>
              <SectionHeader num="٥" title="الملخص المالي" />
            </template>

            <!-- البطاقات المالية -->
            <div class="grid row-gap-3 mb-4">
              <div class="col-6 md:col-3">
                <div class="fin-card surface-card border-round-lg border-1 border-200 p-4 text-center relative overflow-hidden">
                  <div class="fin-top-bar" style="background:var(--blue-500)" />
                  <i class="pi pi-calculator text-blue-400 text-2xl mb-2 block" />
                  <div class="text-xs text-500 font-bold mb-2">التكلفة التقديرية</div>
                  <div class="text-2xl font-black text-800">{{ fmt(data.financial.total_estimated_cost) }}</div>
                  <div class="text-xs text-400 mt-1">دينار عراقي</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="fin-card surface-card border-round-lg border-1 border-200 p-4 text-center relative overflow-hidden">
                  <div class="fin-top-bar" style="background:var(--green-500)" />
                  <i class="pi pi-check-circle text-green-400 text-2xl mb-2 block" />
                  <div class="text-xs text-500 font-bold mb-2">إجمالي العروض المقبولة</div>
                  <div class="text-2xl font-black text-800">{{ fmt(data.financial.accepted_estimates_total) }}</div>
                  <div class="text-xs text-400 mt-1">دينار عراقي</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="fin-card surface-card border-round-lg border-1 border-200 p-4 text-center relative overflow-hidden">
                  <div class="fin-top-bar" style="background:var(--orange-500)" />
                  <i class="pi pi-shopping-cart text-orange-400 text-2xl mb-2 block" />
                  <div class="text-xs text-500 font-bold mb-2">إجمالي الشراء الفعلي</div>
                  <div class="text-2xl font-black text-800">{{ fmt(data.financial.actual_procurement_total) }}</div>
                  <div class="text-xs text-400 mt-1">دينار عراقي</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div
                  class="fin-card surface-card border-round-lg border-1 border-200 p-4 text-center relative overflow-hidden"
                >
                  <div class="fin-top-bar" :style="`background:var(--${(data.financial.saving ?? 0) >= 0 ? 'green' : 'red'}-500)`" />
                  <i
                    class="text-2xl mb-2 block"
                    :class="(data.financial.saving ?? 0) >= 0 ? 'pi pi-arrow-down text-green-400' : 'pi pi-arrow-up text-red-400'"
                  />
                  <div class="text-xs text-500 font-bold mb-2">
                    {{ (data.financial.saving ?? 0) >= 0 ? 'التوفير المحقق' : 'الزيادة في التكلفة' }}
                  </div>
                  <div
                    class="text-2xl font-black"
                    :class="(data.financial.saving ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'"
                  >{{ fmt(Math.abs(data.financial.saving ?? 0)) }}</div>
                  <div class="text-xs text-400 mt-1">دينار عراقي</div>
                </div>
              </div>
            </div>

            <!-- إحصائيات -->
            <div class="grid row-gap-2 mb-4">
              <div class="col-6 md:col-3">
                <div class="surface-100 border-round p-3 text-center">
                  <div class="text-3xl font-black text-800">{{ data.financial.estimates_count }}</div>
                  <div class="text-xs text-500 mt-1">عروض أسعار</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="surface-100 border-round p-3 text-center">
                  <div class="text-3xl font-black text-green-600">{{ data.financial.accepted_estimates_count }}</div>
                  <div class="text-xs text-500 mt-1">عروض مقبولة</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="surface-100 border-round p-3 text-center">
                  <div class="text-3xl font-black text-orange-600">{{ data.financial.procurements_count }}</div>
                  <div class="text-xs text-500 mt-1">أوامر شراء</div>
                </div>
              </div>
              <div class="col-6 md:col-3">
                <div class="surface-100 border-round p-3 text-center">
                  <div class="text-3xl font-black text-800">{{ data.items?.length ?? 0 }}</div>
                  <div class="text-xs text-500 mt-1">مادة مطلوبة</div>
                </div>
              </div>
            </div>

            <!-- توزيع الموردين -->
            <div v-if="Object.keys(data.financial.estimates_by_vendor || {}).length">
              <Divider align="right">
                <span class="text-xs text-500 font-bold uppercase">توزيع العروض على الموردين</span>
              </Divider>
              <DataTable
                :value="Object.entries(data.financial.estimates_by_vendor).map(([name, total]) => ({ name, total }))"
                class="p-datatable-sm"
                striped-rows
                :show-gridlines="false"
              >
                <Column field="name"  header="المورد" />
                <Column header="إجمالي العرض" style="width:14rem">
                  <template #body="{ data: row }">
                    <strong class="text-yellow-600">{{ fmt(row.total) }} د.ع</strong>
                  </template>
                </Column>
              </DataTable>
            </div>
          </Panel>

          <!-- ═══════════ التوقيعات ═══════════ -->
          <div class="grid row-gap-3">
            <div v-for="sig in signatures" :key="sig.title" class="col-6 md:col-3">
              <div class="surface-50 border-round-lg border-1 border-300 p-4 text-center">
                <div class="text-xs text-500 font-bold uppercase mb-4">{{ sig.title }}</div>
                <div class="font-bold text-sm text-700 mb-3">{{ sig.name }}</div>
                <Divider />
                <div class="text-xs text-400">التوقيع / الختم</div>
              </div>
            </div>
          </div>

        </div><!-- /px-5 py-4 -->

        <!-- ═══════════ Footer ═══════════ -->
        <div class="surface-800 px-5 py-3 flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div class="text-yellow-400 font-bold text-sm">نظام إدارة المشتريات</div>
            <div class="text-blue-300 text-xs">وثيقة رسمية — للاستخدام الداخلي فقط</div>
          </div>
          <div class="text-blue-300 text-xs text-left line-height-3">
            <div>أُصدر بواسطة: {{ data.generated_by }}</div>
            <div>تاريخ الطباعة: {{ printDate }}</div>
          </div>
        </div>

      </div><!-- /report-sheet -->
    </template>

    <!-- ── Galleria Dialog ── -->
    <Dialog v-model:visible="galleryVisible" :modal="true" :style="{ width: '80vw', maxWidth: '900px' }" header="معاينة الصور" dir="rtl">
      <Galleria
        :value="galleryImages"
        v-model:activeIndex="galleryIndex"
        :num-visible="5"
        :circular="true"
        :show-item-navigators="true"
        :show-thumbnails="galleryImages.length > 1"
        :pt="{ root: { style: 'max-width:860px;margin:0 auto' } }"
      >
        <template #item="{ item }">
          <img :src="item.file_url ?? item.url ?? item" :alt="item.file_name ?? ''" style="width:100%;max-height:500px;object-fit:contain" />
        </template>
        <template #thumbnail="{ item }">
          <img :src="item.file_url ?? item.url ?? item" :alt="item.file_name ?? ''" style="width:60px;height:40px;object-fit:cover" />
        </template>
      </Galleria>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import axios from '../../../api/api'
import { useRoute } from 'vue-router'

import ProgressSpinner from 'primevue/progressspinner'
import Button          from 'primevue/button'
import Tag             from 'primevue/tag'
import Panel           from 'primevue/panel'
import DataTable       from 'primevue/datatable'
import Column          from 'primevue/column'
import Divider         from 'primevue/divider'
import Message         from 'primevue/message'
import Dialog          from 'primevue/dialog'
import Galleria        from 'primevue/galleria'

// ── Inline helper components ───────────────────────────────────────────────

/** عنوان القسم داخل Panel header */
const SectionHeader = defineComponent({
  props: { num: String, title: String, count: Number, countLabel: String },
  setup(p) {
    return () => h('div', { class: 'flex align-items-center gap-3' }, [
      h('div', {
        class: 'flex align-items-center justify-content-center border-round font-black text-white',
        style: 'width:28px;height:28px;background:var(--primary-color,#1a3a6e);font-size:13px;flex-shrink:0'
      }, p.num),
      h('span', { class: 'font-black text-base text-800' }, p.title),
      p.count != null
        ? h('span', {
            class: 'mr-auto text-xs font-bold text-white px-2 py-1 border-round',
            style: 'background:var(--yellow-500)'
          }, `${p.count} ${p.countLabel}`)
        : null,
    ])
  }
})

/** صف معلومة (مفتاح / قيمة) */
const InfoCell = defineComponent({
  props: { label: String, value: String, bold: Boolean },
  slots: ['default'],
  setup(p, { slots }) {
    return () => h('div', { class: 'flex flex-column gap-1' }, [
      h('span', { class: 'text-xs text-500 font-bold uppercase', style: 'letter-spacing:.04em' }, p.label),
      slots.default ? slots.default() : h('span', { class: `text-sm ${p.bold ? 'font-bold' : ''}` }, p.value ?? '—'),
    ])
  }
})

/** صف داخل بلوك الفحص */
const CheckRow = defineComponent({
  props: { label: String, value: String, bold: Boolean },
  slots: ['default'],
  setup(p, { slots }) {
    return () => h('div', { class: 'flex justify-content-between align-items-center text-xs' }, [
      h('span', { class: 'text-500' }, p.label),
      slots.default
        ? slots.default()
        : h('span', { class: `text-700 ${p.bold ? 'font-bold' : ''}` }, p.value ?? '—'),
    ])
  }
})

// ── Route ──────────────────────────────────────────────────────────────────
const route = useRoute()

// ── State ──────────────────────────────────────────────────────────────────
const reportId = ref<number | null>(null)
const data     = ref<any>(null)
const loading  = ref(true)
const error    = ref('')

// Galleria
const galleryVisible = ref(false)
const galleryImages  = ref<any[]>([])
const galleryIndex   = ref(0)

function openGallery(images: any[], idx: number) {
  galleryImages.value  = images
  galleryIndex.value   = idx
  galleryVisible.value = true
}

// ── Computed ───────────────────────────────────────────────────────────────
const printDate = computed(() =>
  new Date().toLocaleString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
)

const signatures = computed(() => [
  { title: 'مقدّم الطلب',  name: data.value?.purchase_request?.creator?.name ?? '—' },
  { title: 'مدير القسم',  name: '_______________' },
  { title: 'المدير المالي', name: '_______________' },
  { title: 'المدير العام', name: '_______________' },
])

// ── Severity helpers ───────────────────────────────────────────────────────
const statusSeverity = (s: string) => ({
  pending: 'warn', approved: 'success', accepted: 'success', completed: 'success',
  in_progress: 'info', rejected: 'danger', cancelled: 'secondary', draft: 'secondary',
}[s] ?? 'secondary')

const prioritySeverity = (p: string) => ({
  high: 'danger', critical: 'danger', medium: 'warn', low: 'success',
}[p] ?? 'secondary')

const urgencySeverity  = (u: string) => prioritySeverity(u)
const availSeverity    = (a: string) => ({ available: 'success', partial: 'warn', unavailable: 'danger' }[a] ?? 'secondary')
const decisionSeverity = (d: string) => ({ approved: 'success', rejected: 'danger', pending: 'warn' }[d] ?? 'secondary')

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: any): string => {
  const num = parseFloat(n)
  return isNaN(num) ? '0' : num.toLocaleString('en-US')
}

const formatDate = (d: string | null): string => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="90" height="68"%3E%3Crect width="90" height="68" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="10"%3E—%3C/text%3E%3C/svg%3E'
}

// ── Fetch ──────────────────────────────────────────────────────────────────
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

// ── Print ──────────────────────────────────────────────────────────────────
const printPage = () => window.print()

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  const id = parseInt(route.params.id as string)
  if (!id || isNaN(id)) { error.value = 'معرّف التقرير غير صالح'; loading.value = false; return }
  reportId.value = id
  fetchData()
})
</script>

<style scoped>
/* ─── Base ─────────────────────────────────────── */
.report-root {
  min-height: 100vh;
  background: var(--surface-ground, #f4f4f4);
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  direction: rtl;
}

/* ─── Header accent bar ────────────────────────── */
.report-header { position: relative; }
.header-accent-top {
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, var(--yellow-500), var(--yellow-300), var(--yellow-500));
}

/* ─── Financial cards ──────────────────────────── */
.fin-card { min-height: 110px; }
.fin-top-bar {
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
}

/* ─── Item card hover ──────────────────────────── */
.item-card { transition: box-shadow .2s; }
.item-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }

/* ─── Image thumbnail hover ────────────────────── */
.img-thumb { transition: transform .15s, box-shadow .15s; }
.img-thumb:hover { transform: scale(1.05); box-shadow: 0 2px 10px rgba(0,0,0,.15); }

/* ─── Print ────────────────────────────────────── */
@media print {
  .no-print { display: none !important; }
  .report-root  { background: white; }
  .report-sheet { margin: 0 !important; box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; }
  .item-card, .estimate-card, .procurement-card { page-break-inside: avoid; }

  .report-header,
  .surface-800     { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .fin-top-bar     { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  @page { size: A4 portrait; margin: 12mm 10mm; }
}
</style>