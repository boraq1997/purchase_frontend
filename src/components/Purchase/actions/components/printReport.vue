<template>
  <div dir="rtl">

    <!-- ── شريط التحكم (يُخفى عند الطباعة) ── -->
    <div class="no-print flex align-items-center gap-2 mb-4">
      <Button
        label="طباعة التقرير"
        icon="pi pi-print"
        @click="printReport"
        :loading="loading"
      />
    </div>

    <!-- ── حالة التحميل ── -->
    <div v-if="loading" class="flex align-items-center justify-content-center py-8">
      <ProgressSpinner style="width:50px;height:50px" />
    </div>

    <!-- ── رسالة خطأ ── -->
    <Message v-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <!-- ── محتوى التقرير ── -->
    <div v-if="!loading && data" id="print-area">

      <!-- ══════════════════════════════════════
           HEADER
      ══════════════════════════════════════ -->
      <Card class="mb-4 print-header-card">
        <template #content>
          <div class="flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <div class="text-color-secondary text-sm mb-1">نظام إدارة المشتريات</div>
              <div class="text-2xl font-bold text-900 mb-2">تقرير طلب شراء شامل</div>
              <div class="flex flex-wrap gap-4 text-sm text-color-secondary">
                <span>
                  <i class="pi pi-hashtag ml-1" />
                  رقم الطلب: <strong class="text-900">{{ data.purchase_request.request_number }}</strong>
                </span>
                <span>
                  <i class="pi pi-calendar ml-1" />
                  تاريخ الإصدار: <strong class="text-900">{{ data.generated_at }}</strong>
                </span>
                <span>
                  <i class="pi pi-user ml-1" />
                  أصدره: <strong class="text-900">{{ data.generated_by }}</strong>
                </span>
              </div>
            </div>
            <div class="flex flex-column align-items-end gap-2">
              <Tag
                :value="data.purchase_request.status_label"
                :severity="statusSeverity(data.purchase_request.status_type)"
                class="text-sm px-3 py-2"
              />
              <Tag
                :value="data.purchase_request.priority_label"
                :severity="prioritySeverity(data.purchase_request.priority)"
                class="text-sm px-3 py-2"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- ══════════════════════════════════════
           ١. تفاصيل طلب الشراء
      ══════════════════════════════════════ -->
      <Panel class="mb-4" :toggleable="false">
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-file-edit text-primary" />
            <span class="font-bold">١ — تفاصيل طلب الشراء</span>
          </div>
        </template>

        <div class="grid row-gap-3">
          <div class="col-12 md:col-6">
            <div class="flex flex-column gap-3">

              <div class="flex flex-column gap-1">
                <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">رقم الطلب</span>
                <span class="font-bold text-900">{{ data.purchase_request.request_number }}</span>
              </div>

              <div class="flex flex-column gap-1">
                <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">عنوان الطلب</span>
                <span class="font-bold text-900">{{ data.purchase_request.title }}</span>
              </div>

              <div v-if="data.purchase_request.description" class="flex flex-column gap-1">
                <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">الوصف</span>
                <span class="text-700">{{ data.purchase_request.description }}</span>
              </div>

              <div class="grid">
                <div class="col-6 flex flex-column gap-1">
                  <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">القسم الطالب</span>
                  <span class="text-700">{{ data.purchase_request.department?.name ?? '—' }}</span>
                </div>
                <div class="col-6 flex flex-column gap-1">
                  <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">اللجنة</span>
                  <span class="text-700">{{ data.purchase_request.committee?.name ?? '—' }}</span>
                </div>
                <div class="col-6 flex flex-column gap-1 mt-2">
                  <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">مقدم الطلب</span>
                  <span class="text-700">{{ data.purchase_request.creator?.name ?? '—' }}</span>
                </div>
                <div class="col-6 flex flex-column gap-1 mt-2">
                  <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">تاريخ الطلب</span>
                  <span class="text-700">{{ data.purchase_request.created_at ?? '—' }}</span>
                </div>
              </div>

            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="flex flex-column gap-3">

              <div class="flex flex-column gap-1">
                <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">الحالة</span>
                <Tag :value="data.purchase_request.status_label" :severity="statusSeverity(data.purchase_request.status_type)" />
              </div>

              <div class="flex flex-column gap-1">
                <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">الأولوية</span>
                <Tag :value="data.purchase_request.priority_label" :severity="prioritySeverity(data.purchase_request.priority)" />
              </div>

              <div class="flex flex-column gap-1">
                <span class="text-xs text-color-secondary font-semibold uppercase" style="letter-spacing:.04em">التكلفة التقديرية</span>
                <span class="font-bold text-primary text-xl">{{ fmt(data.purchase_request.total_estimated_cost) }} د.ع</span>
              </div>

              <div v-if="data.purchase_request.rejected_reason" class="flex flex-column gap-1">
                <span class="text-xs text-red-500 font-semibold uppercase" style="letter-spacing:.04em">سبب الرفض</span>
                <span class="text-red-600">{{ data.purchase_request.rejected_reason }}</span>
              </div>

            </div>
          </div>
        </div>
      </Panel>

      <!-- ══════════════════════════════════════
           ٢. المواد المطلوبة
      ══════════════════════════════════════ -->
      <Panel class="mb-4" :toggleable="false">
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-box text-primary" />
            <span class="font-bold">٢ — المواد المطلوبة مع رأي المخازن وعروض الأسعار</span>
          </div>
        </template>

        <div v-if="!data.items?.length" class="text-center text-color-secondary py-4">
          <i class="pi pi-inbox text-4xl mb-2 block" />
          لا توجد مواد
        </div>

        <div v-else class="flex flex-column gap-4">
          <div
            v-for="(item, idx) in data.items"
            :key="item.id"
            class="surface-50 border-round-xl border-1 border-200 overflow-hidden"
          >
            <!-- رأس المادة -->
            <div class="flex align-items-center justify-content-between flex-wrap gap-2 px-4 py-3 surface-100 border-bottom-1 border-200">
              <div class="flex align-items-center gap-2">
                <Badge :value="String(idx + 1)" severity="info" />
                <span class="font-bold text-900">{{ item.item_name }}</span>
              </div>
              <div class="flex align-items-center gap-3 text-sm text-color-secondary">
                <span>
                  الكمية: <strong class="text-900">{{ item.quantity }}</strong>
                  <span v-if="item.unit"> {{ item.unit.name }}</span>
                </span>
                <Divider layout="vertical" style="height:1rem" />
                <span>
                  التكلفة التقديرية:
                  <strong class="text-primary">{{ fmt(item.total_estimated_price) }} د.ع</strong>
                </span>
              </div>
            </div>

            <div class="p-4">

              <!-- المواصفات -->
              <div v-if="item.specifications"
                class="flex align-items-start gap-2 p-3 border-round border-1 border-200 surface-card mb-4">
                <i class="pi pi-list-check text-primary mt-1 flex-shrink-0" />
                <div>
                  <div class="text-xs text-color-secondary font-semibold mb-1">المواصفات</div>
                  <span class="text-700 text-sm">{{ item.specifications }}</span>
                </div>
              </div>

              <div class="grid row-gap-3">

                <!-- رأي المخازن -->
                <div class="col-12 md:col-6">
                  <div class="surface-card border-round-lg border-1 border-200 p-3 h-full">
                    <div class="flex align-items-center gap-2 mb-3">
                      <i class="pi pi-warehouse text-blue-500" />
                      <span class="font-semibold text-sm">رأي المخازن</span>
                    </div>

                    <div v-if="!item.warehouse_check" class="text-color-secondary text-sm">
                      <i class="pi pi-minus-circle ml-1" />لم يتم الفحص بعد
                    </div>

                    <div v-else class="flex flex-column gap-2">
                      <div class="flex align-items-center justify-content-between">
                        <span class="text-sm text-color-secondary">حالة التوفر</span>
                        <Tag :value="item.warehouse_check.availability_label" :severity="availabilitySeverity(item.warehouse_check.availability)" />
                      </div>
                      <div class="flex align-items-center justify-content-between">
                        <span class="text-sm text-color-secondary">الكمية المتوفرة</span>
                        <strong>{{ item.warehouse_check.available_quantity }}</strong>
                      </div>
                      <div v-if="item.warehouse_check.item_condition" class="flex align-items-center justify-content-between">
                        <span class="text-sm text-color-secondary">حالة المادة</span>
                        <span class="text-sm">{{ item.warehouse_check.item_condition }}</span>
                      </div>
                      <div class="flex align-items-center justify-content-between">
                        <span class="text-sm text-color-secondary">التوصية</span>
                        <span class="text-sm font-semibold">{{ item.warehouse_check.recommendation_label }}</span>
                      </div>
                      <div v-if="item.warehouse_check.notes"
                        class="text-sm text-color-secondary border-top-1 border-200 pt-2 mt-1">
                        {{ item.warehouse_check.notes }}
                      </div>
                      <div class="text-xs text-color-secondary mt-1">
                        فحص بواسطة: {{ item.warehouse_check.checked_by }}
                        <span v-if="item.warehouse_check.checked_at"> — {{ item.warehouse_check.checked_at }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- تقييم الحاجة -->
                <div class="col-12 md:col-6">
                  <div class="surface-card border-round-lg border-1 border-200 p-3 h-full">
                    <div class="flex align-items-center gap-2 mb-3">
                      <i class="pi pi-chart-bar text-purple-500" />
                      <span class="font-semibold text-sm">تقييم الحاجة</span>
                    </div>

                    <div v-if="!item.needs_assessment" class="text-color-secondary text-sm">
                      <i class="pi pi-minus-circle ml-1" />لم يُقيَّم بعد
                    </div>

                    <div v-else class="flex flex-column gap-2">
                      <div class="flex align-items-center justify-content-between">
                        <span class="text-sm text-color-secondary">مستوى الإلحاح</span>
                        <Tag :value="item.needs_assessment.urgency_label" :severity="urgencySeverity(item.needs_assessment.urgency_level)" />
                      </div>
                      <div class="flex align-items-center justify-content-between">
                        <span class="text-sm text-color-secondary">حالة الحاجة</span>
                        <span class="text-sm font-semibold">{{ item.needs_assessment.needs_status_label }}</span>
                      </div>
                      <div class="flex align-items-center justify-content-between">
                        <span class="text-sm text-color-secondary">الكمية بعد التقييم</span>
                        <strong>{{ item.needs_assessment.quantity_needed_after_assessment ?? '—' }}</strong>
                      </div>
                      <div class="flex align-items-center justify-content-between">
                        <span class="text-sm text-color-secondary">قرار الإدارة</span>
                        <Tag
                          :value="item.needs_assessment.admin_decision_label"
                          :severity="adminDecisionSeverity(item.needs_assessment.admin_decision)"
                        />
                      </div>
                      <div v-if="item.needs_assessment.reason" class="text-sm border-top-1 border-200 pt-2 mt-1">
                        <span class="text-color-secondary">السبب: </span>{{ item.needs_assessment.reason }}
                      </div>
                      <div v-if="item.needs_assessment.recommended_action" class="text-sm">
                        <span class="text-color-secondary">الإجراء المقترح: </span>{{ item.needs_assessment.recommended_action }}
                      </div>
                      <div class="text-xs text-color-secondary mt-1">
                        قيّمه: {{ item.needs_assessment.assessed_by }}
                        <span v-if="item.needs_assessment.assessed_at"> — {{ item.needs_assessment.assessed_at }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- عروض الأسعار للمادة -->
                <div v-if="item.estimate_items?.length" class="col-12">
                  <div class="surface-card border-round-lg border-1 border-200 p-3">
                    <div class="flex align-items-center gap-2 mb-3">
                      <i class="pi pi-tag text-orange-500" />
                      <span class="font-semibold text-sm">عروض الأسعار ({{ item.estimate_items.length }})</span>
                    </div>
                    <DataTable
                      :value="item.estimate_items"
                      size="small"
                      striped-rows
                      class="p-datatable-sm"
                    >
                      <Column header="المورد">
                        <template #body="{ data: ei }">{{ ei.estimate?.vendor?.name ?? '—' }}</template>
                      </Column>
                      <Column field="quantity" header="الكمية" style="width:7rem" />
                      <Column header="سعر الوحدة" style="width:10rem">
                        <template #body="{ data: ei }">{{ fmt(ei.unit_price) }} د.ع</template>
                      </Column>
                      <Column header="الإجمالي" style="width:10rem">
                        <template #body="{ data: ei }">
                          <strong>{{ fmt(ei.total_price) }} د.ع</strong>
                        </template>
                      </Column>
                      <Column header="الحالة" style="width:8rem">
                        <template #body="{ data: ei }">
                          <Tag
                            v-if="ei.estimate"
                            :value="ei.estimate.status_label"
                            :severity="statusSeverity(ei.estimate.status)"
                          />
                        </template>
                      </Column>
                      <Column header="التاريخ" style="width:9rem">
                        <template #body="{ data: ei }">
                          <span class="text-sm text-color-secondary">{{ ei.estimate?.estimate_date ?? '—' }}</span>
                        </template>
                      </Column>
                    </DataTable>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Panel>

      <!-- ══════════════════════════════════════
           ٣. ملخص عروض الأسعار
      ══════════════════════════════════════ -->
      <Panel class="mb-4" :toggleable="false">
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-file-invoice text-primary" />
            <span class="font-bold">٣ — ملخص عروض الأسعار</span>
          </div>
        </template>

        <div v-if="!data.estimates?.length" class="text-center text-color-secondary py-4">
          <i class="pi pi-inbox text-4xl mb-2 block" />
          لا توجد عروض أسعار
        </div>

        <div v-else class="flex flex-column gap-4">
          <div
            v-for="(est, idx) in data.estimates"
            :key="est.id"
            class="surface-50 border-round-xl border-1 border-200 overflow-hidden"
            :class="est.status === 'accepted' ? 'border-green-300' : ''"
          >
            <!-- رأس عرض السعر -->
            <div class="flex align-items-center justify-content-between flex-wrap gap-2 px-4 py-3 surface-100 border-bottom-1 border-200">
              <div class="flex align-items-center gap-2">
                <Badge :value="String(idx + 1)" severity="secondary" />
                <span class="font-bold text-900">{{ est.vendor?.name ?? `عرض #${est.id}` }}</span>
                <Tag :value="est.status_label" :severity="statusSeverity(est.status)" />
              </div>
              <div class="flex align-items-center gap-3 text-sm">
                <span class="text-color-secondary">
                  <i class="pi pi-calendar ml-1" />{{ est.estimate_date ?? '—' }}
                </span>
                <span class="font-bold text-xl text-primary">{{ fmt(est.total_amount) }} د.ع</span>
              </div>
            </div>

            <div class="p-4">

              <!-- بيانات المورد -->
              <div v-if="est.vendor" class="flex flex-wrap gap-4 text-sm text-color-secondary mb-3 p-3 surface-card border-round border-1 border-200">
                <span><i class="pi pi-phone ml-1" />{{ est.vendor.phone1 }}</span>
                <span v-if="est.vendor.email"><i class="pi pi-envelope ml-1" />{{ est.vendor.email }}</span>
                <span v-if="est.vendor.address"><i class="pi pi-map-marker ml-1" />{{ est.vendor.address }}</span>
              </div>

              <!-- ملاحظات -->
              <div v-if="est.notes" class="flex align-items-start gap-2 text-sm text-color-secondary mb-3">
                <i class="pi pi-comment mt-1 flex-shrink-0" />
                <span>{{ est.notes }}</span>
              </div>

              <!-- جدول المواد -->
              <DataTable
                v-if="est.items?.length"
                :value="est.items"
                size="small"
                striped-rows
                class="p-datatable-sm"
              >
                <Column field="item_name" header="المادة" />
                <Column field="quantity" header="الكمية" style="width:7rem" />
                <Column header="سعر الوحدة" style="width:10rem">
                  <template #body="{ data: ei }">{{ fmt(ei.unit_price) }} د.ع</template>
                </Column>
                <Column header="الإجمالي" style="width:10rem">
                  <template #body="{ data: ei }">
                    <strong class="text-primary">{{ fmt(ei.total_price) }} د.ع</strong>
                  </template>
                </Column>
              </DataTable>

              <!-- مجموع عرض السعر -->
              <div class="flex align-items-center justify-content-between mt-3 p-3 surface-100 border-round border-1 border-200">
                <span class="font-semibold text-700">المجموع الكلي</span>
                <span class="font-bold text-xl text-primary">{{ fmt(est.total_amount) }} د.ع</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <!-- ══════════════════════════════════════
           ٤. عمليات الشراء الفعلية
      ══════════════════════════════════════ -->
      <Panel v-if="data.procurements?.length" class="mb-4" :toggleable="false">
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-shopping-bag text-primary" />
            <span class="font-bold">٤ — عمليات الشراء الفعلية</span>
          </div>
        </template>

        <div class="flex flex-column gap-4">
          <div
            v-for="(proc, idx) in data.procurements"
            :key="proc.id"
            class="surface-50 border-round-xl border-1 border-200 overflow-hidden"
          >
            <!-- رأس عملية الشراء -->
            <div class="flex align-items-center justify-content-between flex-wrap gap-2 px-4 py-3 surface-100 border-bottom-1 border-200">
              <div class="flex align-items-center gap-2">
                <Badge :value="String(idx + 1)" severity="secondary" />
                <Tag :value="proc.reference_no ?? `PO-${idx + 1}`" severity="secondary" class="font-mono" />
                <Tag :value="proc.status_label" :severity="statusSeverity(proc.status)" />
              </div>
              <div class="flex flex-wrap gap-3 text-sm text-color-secondary">
                <span><i class="pi pi-calendar ml-1" />{{ proc.purchase_date ?? '—' }}</span>
                <span><i class="pi pi-user ml-1" />{{ proc.created_by ?? '—' }}</span>
                <span class="font-bold text-xl text-primary">{{ fmt(proc.total_amount) }} د.ع</span>
              </div>
            </div>

            <div class="p-4">

              <div v-if="proc.notes" class="flex align-items-start gap-2 text-sm text-color-secondary mb-3">
                <i class="pi pi-comment mt-1 flex-shrink-0" />
                <span>{{ proc.notes }}</span>
              </div>

              <DataTable :value="proc.items" size="small" striped-rows class="p-datatable-sm">
                <Column field="item_name" header="المادة" />
                <Column field="unit" header="الوحدة" style="width:7rem" />
                <Column field="quantity" header="الكمية" style="width:7rem" />
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
                    <span
                      v-if="pi.estimate_price > 0"
                      :class="pi.difference > 0 ? 'text-red-500' : pi.difference < 0 ? 'text-green-500' : 'text-color-secondary'"
                      class="font-semibold"
                    >{{ fmt(pi.difference) }}</span>
                    <span v-else class="text-color-secondary">—</span>
                  </template>
                </Column>
                <Column header="الإجمالي" style="width:9rem">
                  <template #body="{ data: pi }">
                    <strong class="text-primary">{{ fmt(pi.total_price) }} د.ع</strong>
                  </template>
                </Column>
              </DataTable>

              <div class="flex align-items-center justify-content-between mt-3 p-3 surface-100 border-round border-1 border-200">
                <span class="font-semibold text-700">المجموع الكلي</span>
                <span class="font-bold text-xl text-primary">{{ fmt(proc.total_amount) }} د.ع</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <!-- ══════════════════════════════════════
           ٥. الملخص المالي
      ══════════════════════════════════════ -->
      <Panel class="mb-4" :toggleable="false">
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-wallet text-primary" />
            <span class="font-bold">٥ — الملخص المالي</span>
          </div>
        </template>

        <!-- بطاقات الأرقام الرئيسية -->
        <div class="grid mb-4">
          <div class="col-12 sm:col-6 lg:col-3">
            <div class="surface-card border-round-xl border-1 border-200 p-4 text-center">
              <i class="pi pi-calculator text-blue-500 text-2xl mb-2 block" />
              <div class="text-color-secondary text-xs mb-1">التكلفة التقديرية</div>
              <div class="font-bold text-xl text-900">{{ fmt(data.financial.total_estimated_cost) }}</div>
              <div class="text-xs text-color-secondary">د.ع</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 lg:col-3">
            <div class="surface-card border-round-xl border-1 border-200 p-4 text-center">
              <i class="pi pi-check-circle text-green-500 text-2xl mb-2 block" />
              <div class="text-color-secondary text-xs mb-1">العروض المقبولة</div>
              <div class="font-bold text-xl text-900">{{ fmt(data.financial.accepted_estimates_total) }}</div>
              <div class="text-xs text-color-secondary">د.ع</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 lg:col-3">
            <div class="surface-card border-round-xl border-1 border-200 p-4 text-center">
              <i class="pi pi-shopping-cart text-orange-500 text-2xl mb-2 block" />
              <div class="text-color-secondary text-xs mb-1">الشراء الفعلي</div>
              <div class="font-bold text-xl text-900">{{ fmt(data.financial.actual_procurement_total) }}</div>
              <div class="text-xs text-color-secondary">د.ع</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 lg:col-3">
            <div class="surface-card border-round-xl border-1 border-200 p-4 text-center"
              :class="(data.financial.saving ?? 0) >= 0 ? 'border-green-300' : 'border-red-300'">
              <i class="pi pi-dollar text-2xl mb-2 block"
                :class="(data.financial.saving ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'" />
              <div class="text-color-secondary text-xs mb-1">
                {{ (data.financial.saving ?? 0) >= 0 ? 'التوفير المحقق' : 'الزيادة' }}
              </div>
              <div class="font-bold text-xl"
                :class="(data.financial.saving ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ fmt(Math.abs(data.financial.saving ?? 0)) }}
              </div>
              <div class="text-xs text-color-secondary">د.ع</div>
            </div>
          </div>
        </div>

        <Divider />

        <!-- إحصائيات العد -->
        <div class="flex flex-wrap gap-4 mb-4">
          <div class="flex align-items-center gap-2 text-sm">
            <i class="pi pi-file text-blue-400" />
            <span>عروض الأسعار: <strong>{{ data.financial.estimates_count }}</strong></span>
          </div>
          <div class="flex align-items-center gap-2 text-sm">
            <i class="pi pi-check text-green-400" />
            <span>المقبولة: <strong>{{ data.financial.accepted_estimates_count }}</strong></span>
          </div>
          <div class="flex align-items-center gap-2 text-sm">
            <i class="pi pi-shopping-bag text-orange-400" />
            <span>عمليات الشراء: <strong>{{ data.financial.procurements_count }}</strong></span>
          </div>
          <div class="flex align-items-center gap-2 text-sm">
            <i class="pi pi-box text-purple-400" />
            <span>عدد المواد: <strong>{{ data.items?.length ?? 0 }}</strong></span>
          </div>
        </div>

        <!-- توزيع العروض على الموردين -->
        <div v-if="Object.keys(data.financial.estimates_by_vendor || {}).length">
          <Divider align="right">
            <span class="text-sm text-color-secondary">توزيع عروض الأسعار على الموردين</span>
          </Divider>
          <DataTable
            :value="vendorEstimatesRows"
            size="small"
            striped-rows
            class="p-datatable-sm"
          >
            <Column field="vendor" header="المورد" />
            <Column header="الإجمالي" style="width:12rem">
              <template #body="{ data: row }">
                <strong class="text-primary">{{ fmt(row.total) }} د.ع</strong>
              </template>
            </Column>
          </DataTable>
        </div>

      </Panel>

      <!-- ── تذييل التقرير ── -->
      <div class="flex align-items-center justify-content-between flex-wrap gap-2 pt-3 border-top-1 border-200 text-xs text-color-secondary">
        <span><i class="pi pi-clock ml-1" />تاريخ الإصدار: {{ data.generated_at }}</span>
        <span><i class="pi pi-user ml-1" />أصدره: {{ data.generated_by }}</span>
      </div>

    </div><!-- /print-area -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

import Button          from 'primevue/button'
import Card            from 'primevue/card'
import Panel           from 'primevue/panel'
import Tag             from 'primevue/tag'
import Badge           from 'primevue/badge'
import Divider         from 'primevue/divider'
import DataTable       from 'primevue/datatable'
import Column          from 'primevue/column'
import Message         from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

// ─── Props ────────────────────────────────────────────────────────────────
const props = defineProps<{
  id: number
  purchaseRequest?: any
}>()

// ─── State ────────────────────────────────────────────────────────────────
const data    = ref<any>(null)
const loading = ref(true)
const error   = ref('')

// ─── Computed ─────────────────────────────────────────────────────────────
const vendorEstimatesRows = computed(() =>
  Object.entries(data.value?.financial?.estimates_by_vendor ?? {}).map(([vendor, total]) => ({
    vendor,
    total,
  }))
)

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = (n: any): string => {
  const num = parseFloat(n)
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US')
}

const statusSeverity = (status: string): any => ({
  pending:     'warning',
  approved:    'success',
  accepted:    'success',
  completed:   'success',
  in_progress: 'info',
  rejected:    'danger',
  cancelled:   'danger',
  draft:       'secondary',
}[status] ?? 'secondary')

const prioritySeverity = (priority: string): any => ({
  high:   'danger',
  medium: 'warning',
  low:    'success',
}[priority] ?? 'secondary')

const availabilitySeverity = (availability: string): any => ({
  available:   'success',
  partial:     'warning',
  unavailable: 'danger',
}[availability] ?? 'secondary')

const urgencySeverity = (level: string): any => ({
  critical: 'danger',
  high:     'danger',
  medium:   'warning',
  low:      'success',
}[level] ?? 'secondary')

const adminDecisionSeverity = (decision: string): any => ({
  approved: 'success',
  rejected: 'danger',
  pending:  'warning',
}[decision] ?? 'secondary')

// ─── Print ────────────────────────────────────────────────────────────────
const printReport = () => window.print()

// ─── Fetch ────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await axios.get(`/api/reports/${props.id}/data`)
    data.value = res.data.data ?? res.data
  } catch (e: any) {
    error.value = e.message ?? 'حدث خطأ أثناء جلب البيانات'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ── Print Styles ── */
@media print {
  .no-print { display: none !important; }

  :deep(.p-panel-header)  { background: #1a3a6e !important; color: #fff !important; }
  :deep(.p-panel-content) { padding: 1rem !important; }
  :deep(.p-card)          { box-shadow: none !important; border: 1px solid #ddd !important; }

  :deep(.p-datatable-thead > tr > th) { background: #1a3a6e !important; color: #fff !important; }

  @page {
    size: A4 portrait;
    margin: 15mm 12mm;
  }
}
</style>