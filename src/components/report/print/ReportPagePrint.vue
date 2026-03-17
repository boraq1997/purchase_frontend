<template>
  <div class="report-root" dir="rtl">

    <!-- ══════════════════════════════════════
         حالة التحميل
    ══════════════════════════════════════ -->
    <div v-if="loading" class="loading-screen">
      <div class="loading-spinner"></div>
      <span>جارٍ تحميل التقرير…</span>
    </div>

    <!-- ══════════════════════════════════════
         حالة الخطأ
    ══════════════════════════════════════ -->
    <div v-else-if="error" class="error-screen">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="fetchData">إعادة المحاولة</button>
    </div>

    <!-- ══════════════════════════════════════
         محتوى التقرير
    ══════════════════════════════════════ -->
<template v-else-if="data && data.purchase_request && data.financial">
      <!-- شريط الأدوات (يختفي عند الطباعة) -->
      <div class="toolbar no-print">
        <div class="toolbar-brand">
          <span class="brand-icon">📋</span>
          <span>تقرير طلب الشراء</span>
        </div>
        <div class="toolbar-actions">
          <button class="btn-print" @click="printPage">
            <i class="pi pi-print"></i>
            طباعة التقرير
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           ورقة التقرير
      ══════════════════════════════════════════ -->
      <div class="report-sheet" id="report-sheet">

        <!-- ═══════════ HEADER ═══════════ -->
        <header class="report-header">
          <div class="header-top">
            <div class="org-block">
              <div class="org-name">نظام إدارة المشتريات</div>
              <div class="org-sub">تقرير طلب شراء شامل — وثيقة رسمية داخلية</div>
            </div>
            <div class="doc-number">
              <div class="doc-num-label">رقم الطلب</div>
              <div class="doc-num-value">{{ data.purchase_request.request_number }}</div>
            </div>
          </div>

          <div class="header-meta-bar">
            <div class="meta-item">
              <i class="pi pi-calendar"></i>
              <span>تاريخ الإصدار: <strong>{{ formatDate(data.generated_at) }}</strong></span>
            </div>
            <div class="meta-item">
              <i class="pi pi-user"></i>
              <span>أصدره: <strong>{{ data.generated_by }}</strong></span>
            </div>
            <div class="meta-item">
              <i class="pi pi-building"></i>
              <span>القسم: <strong>{{ data.purchase_request.department?.name ?? '—' }}</strong></span>
            </div>
            <div class="meta-item">
              <i class="pi pi-clock"></i>
              <span>تاريخ الطلب: <strong>{{ formatDate(data.purchase_request.created_at) }}</strong></span>
            </div>
          </div>
        </header>

        <!-- ═══════════ TITLE BAND ═══════════ -->
        <div class="title-band">
          <div class="title-text">{{ data.purchase_request.title }}</div>
          <div class="title-badges">
            <span class="badge" :class="`badge-priority-${data.purchase_request.priority}`">
              {{ data.purchase_request.priority_label }}
            </span>
            <span class="badge" :class="`badge-status-${data.purchase_request.status_type}`">
              {{ data.purchase_request.status_label }}
            </span>
          </div>
        </div>

        <!-- ═══════════ ١. معلومات الطلب ═══════════ -->
        <section class="report-section">
          <div class="section-heading">
            <div class="section-num">١</div>
            <div class="section-title">معلومات طلب الشراء</div>
          </div>

          <div class="info-grid">
            <div class="info-cell">
              <div class="info-label">رقم الطلب</div>
              <div class="info-value bold">{{ data.purchase_request.request_number }}</div>
            </div>
            <div class="info-cell">
              <div class="info-label">مقدّم الطلب</div>
              <div class="info-value">{{ data.purchase_request.creator?.name ?? '—' }}</div>
            </div>
            <div class="info-cell">
              <div class="info-label">القسم الطالب</div>
              <div class="info-value">{{ data.purchase_request.department?.name ?? '—' }}</div>
            </div>
            <div class="info-cell">
              <div class="info-label">لجنة التقييم</div>
              <div class="info-value">{{ data.purchase_request.committee?.name ?? '—' }}</div>
            </div>
            <div class="info-cell">
              <div class="info-label">الحالة</div>
              <div class="info-value">
                <span class="badge" :class="`badge-status-${data.purchase_request.status_type}`">
                  {{ data.purchase_request.status_label }}
                </span>
              </div>
            </div>
            <div class="info-cell">
              <div class="info-label">الأولوية</div>
              <div class="info-value">
                <span class="badge" :class="`badge-priority-${data.purchase_request.priority}`">
                  {{ data.purchase_request.priority_label }}
                </span>
              </div>
            </div>
            <div class="info-cell">
              <div class="info-label">تاريخ الطلب</div>
              <div class="info-value">{{ formatDate(data.purchase_request.created_at) }}</div>
            </div>
            <div class="info-cell">
              <div class="info-label">التكلفة التقديرية الإجمالية</div>
              <div class="info-value bold accent">{{ fmt(data.purchase_request.total_estimated_cost) }} د.ع</div>
            </div>
          </div>

          <div v-if="data.purchase_request.description" class="description-box">
            <div class="description-label">وصف الطلب</div>
            <div class="description-text">{{ data.purchase_request.description }}</div>
          </div>

          <div v-if="data.purchase_request.rejected_reason" class="rejected-box">
            <i class="pi pi-times-circle"></i>
            <div>
              <strong>سبب الرفض:</strong>
              {{ data.purchase_request.rejected_reason }}
            </div>
          </div>

          <!-- صور الطلب -->
          <div v-if="data.purchase_request.images?.length" class="images-block">
            <div class="images-title">صور الطلب المرفقة</div>
            <div class="images-inline-grid">
              <div v-for="(img, i) in data.purchase_request.images" :key="i" class="img-inline">
                <img :src="img.file_url" :alt="`صورة ${i+1}`" />
                {{ console.log(img.file_url) }}
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════ ٢. المواد المطلوبة ═══════════ -->
        <section class="report-section">
          <div class="section-heading">
            <div class="section-num">٢</div>
            <div class="section-title">المواد المطلوبة</div>
            <div class="section-count">{{ data.items?.length ?? 0 }} مادة</div>
          </div>

          <div v-if="!data.items?.length" class="empty-state">
            <i class="pi pi-inbox"></i>
            لا توجد مواد
          </div>

          <div v-else class="items-list">
            <div
              v-for="(item, idx) in data.items"
              :key="item.id"
              class="item-card"
            >
              <!-- رأس المادة -->
              <div class="item-card-header">
                <div class="item-index">{{ idx + 1 }}</div>
                <div class="item-name">{{ item.item_name }}</div>
                <div class="item-meta">
                  <span>الكمية: <strong>{{ item.quantity }} {{ item.unit?.name ?? '' }}</strong></span>
                  <span class="sep">|</span>
                  <span>التكلفة التقديرية: <strong class="accent">{{ fmt(item.total_estimated_price) }} د.ع</strong></span>
                </div>
              </div>

              <div class="item-card-body">

                <!-- المواصفات -->
                <div v-if="item.specifications" class="item-specs">
                  <div class="sub-label">المواصفات</div>
                  <div class="sub-text">{{ item.specifications }}</div>
                </div>

                <div class="item-checks-grid">

                  <!-- فحص المستودع -->
                  <div class="check-block">
                    <div class="check-title">
                      <i class="pi pi-warehouse"></i>
                      فحص المستودع
                    </div>
                    <div v-if="!item.warehouse_check" class="check-empty">لم يتم الفحص بعد</div>
                    <div v-else class="check-rows">
                      <div class="check-row">
                        <span class="check-key">حالة التوفر</span>
                        <span class="badge" :class="`badge-avail-${item.warehouse_check.availability}`">
                          {{ item.warehouse_check.availability_label }}
                        </span>
                      </div>
                      <div class="check-row">
                        <span class="check-key">الكمية المتوفرة</span>
                        <span class="check-val">{{ item.warehouse_check.available_quantity }}</span>
                      </div>
                      <div v-if="item.warehouse_check.item_condition" class="check-row">
                        <span class="check-key">حالة المادة</span>
                        <span class="check-val">{{ item.warehouse_check.item_condition }}</span>
                      </div>
                      <div class="check-row">
                        <span class="check-key">التوصية</span>
                        <span class="check-val bold">{{ item.warehouse_check.recommendation_label }}</span>
                      </div>
                      <div v-if="item.warehouse_check.notes" class="check-note">
                        {{ item.warehouse_check.notes }}
                      </div>
                      <div class="check-by">
                        فحص بواسطة: {{ item.warehouse_check.checked_by }}
                        <span v-if="item.warehouse_check.checked_at"> — {{ formatDate(item.warehouse_check.checked_at) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- تقييم الحاجة -->
                  <div class="check-block">
                    <div class="check-title">
                      <i class="pi pi-chart-bar"></i>
                      تقييم الاحتياج
                    </div>
                    <div v-if="!item.needs_assessment" class="check-empty">لم يُقيَّم بعد</div>
                    <div v-else class="check-rows">
                      <div class="check-row">
                        <span class="check-key">مستوى الإلحاح</span>
                        <span class="badge" :class="`badge-urgency-${item.needs_assessment.urgency_level}`">
                          {{ item.needs_assessment.urgency_label }}
                        </span>
                      </div>
                      <div class="check-row">
                        <span class="check-key">حالة الحاجة</span>
                        <span class="check-val">{{ item.needs_assessment.needs_status_label }}</span>
                      </div>
                      <div class="check-row">
                        <span class="check-key">قرار الإدارة</span>
                        <span class="badge" :class="`badge-decision-${item.needs_assessment.admin_decision}`">
                          {{ item.needs_assessment.admin_decision_label }}
                        </span>
                      </div>
                      <div v-if="item.needs_assessment.quantity_needed_after_assessment" class="check-row">
                        <span class="check-key">الكمية بعد التقييم</span>
                        <span class="check-val bold">{{ item.needs_assessment.quantity_needed_after_assessment }}</span>
                      </div>
                      <div v-if="item.needs_assessment.reason" class="check-note">
                        <strong>السبب:</strong> {{ item.needs_assessment.reason }}
                      </div>
                      <div v-if="item.needs_assessment.recommended_action" class="check-note">
                        <strong>الإجراء المقترح:</strong> {{ item.needs_assessment.recommended_action }}
                      </div>
                      <div v-if="item.needs_assessment.admin_comment" class="check-note">
                        <strong>تعليق المدير:</strong> {{ item.needs_assessment.admin_comment }}
                      </div>
                      <div class="check-by">
                        قيّمه: {{ item.needs_assessment.assessed_by }}
                        <span v-if="item.needs_assessment.assessed_at"> — {{ formatDate(item.needs_assessment.assessed_at) }}</span>
                      </div>
                    </div>
                  </div>

                </div>

                <!-- عروض الأسعار للمادة -->
                <div v-if="item.estimate_items?.length" class="item-estimates">
                  <div class="sub-section-title">عروض الأسعار لهذه المادة</div>
                  <table class="report-table">
                    <thead>
                      <tr>
                        <th>المورد</th>
                        <th>الكمية</th>
                        <th>سعر الوحدة</th>
                        <th>الإجمالي</th>
                        <th>الحالة</th>
                        <th>التاريخ</th>
                        <th>ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="ei in item.estimate_items" :key="ei.id">
                        <td>{{ ei.estimate?.vendor?.name ?? '—' }}</td>
                        <td>{{ ei.quantity }}</td>
                        <td>{{ fmt(ei.unit_price) }} د.ع</td>
                        <td><strong>{{ fmt(ei.total_price) }} د.ع</strong></td>
                        <td>
                          <span v-if="ei.estimate" class="badge" :class="`badge-status-${ei.estimate.status}`">
                            {{ ei.estimate.status_label }}
                          </span>
                        </td>
                        <td>{{ ei.estimate?.estimate_date ? formatDate(ei.estimate.estimate_date) : '—' }}</td>
                        <td class="text-muted">{{ ei.notes ?? '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════ ٣. عروض الأسعار ═══════════ -->
        <section class="report-section">
          <div class="section-heading">
            <div class="section-num">٣</div>
            <div class="section-title">عروض الأسعار</div>
            <div class="section-count">{{ data.estimates?.length ?? 0 }} عرض</div>
          </div>

          <div v-if="!data.estimates?.length" class="empty-state">
            <i class="pi pi-inbox"></i>
            لا توجد عروض أسعار
          </div>

          <div v-else class="estimates-list">
            <div
              v-for="(est, idx) in data.estimates"
              :key="est.id"
              class="estimate-card"
              :class="{ 'estimate-accepted': est.status === 'accepted' }"
            >
              <!-- رأس العرض -->
              <div class="estimate-header">
                <div class="estimate-vendor-block">
                  <div class="estimate-vendor-badge">مورد</div>
                  <div class="estimate-vendor-name">{{ est.vendor?.name ?? `عرض #${idx + 1}` }}</div>
                  <span class="badge" :class="`badge-status-${est.status}`">{{ est.status_label }}</span>
                </div>
                <div class="estimate-total">
                  {{ fmt(est.total_amount) }} <span class="currency">د.ع</span>
                </div>
              </div>

              <!-- بيانات المورد -->
              <div v-if="est.vendor" class="vendor-info">
                <span v-if="est.vendor.phone1"><i class="pi pi-phone"></i> {{ est.vendor.phone1 }}</span>
                <span v-if="est.vendor.phone2"><i class="pi pi-phone"></i> {{ est.vendor.phone2 }}</span>
                <span v-if="est.vendor.email"><i class="pi pi-envelope"></i> {{ est.vendor.email }}</span>
                <span v-if="est.vendor.address"><i class="pi pi-map-marker"></i> {{ est.vendor.address }}</span>
                <span v-if="est.estimate_date"><i class="pi pi-calendar"></i> تاريخ العرض: {{ formatDate(est.estimate_date) }}</span>
              </div>

              <div v-if="est.notes" class="estimate-notes">
                <i class="pi pi-comment"></i> {{ est.notes }}
              </div>

              <!-- جدول مواد العرض -->
              <table v-if="est.items?.length" class="report-table">
                <thead>
                  <tr>
                    <th>المادة</th>
                    <th>الكمية</th>
                    <th>سعر الوحدة</th>
                    <th>الإجمالي</th>
                    <th>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ei in est.items" :key="ei.id ?? ei.item_name">
                    <td>{{ ei.item_name }}</td>
                    <td>{{ ei.quantity }}</td>
                    <td>{{ fmt(ei.unit_price) }} د.ع</td>
                    <td><strong>{{ fmt(ei.total_price) }} د.ع</strong></td>
                    <td class="text-muted">{{ ei.notes ?? '—' }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-left">الإجمالي الكلي</td>
                    <td><strong class="accent">{{ fmt(est.total_amount) }} د.ع</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              <!-- صور عرض الأسعار -->
              <div v-if="est.images?.length" class="images-block">
                <div class="images-title">صور العرض المرفقة</div>
                <div class="images-inline-grid">
                  <div v-for="(img, i) in est.images" :key="i" class="img-inline">
                    <img :src="img.url ?? img" :alt="`صورة ${i+1}`" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ═══════════ ٤. أوامر الشراء ═══════════ -->
        <section v-if="data.procurements?.length" class="report-section">
          <div class="section-heading">
            <div class="section-num">٤</div>
            <div class="section-title">أوامر الشراء الفعلية</div>
            <div class="section-count">{{ data.procurements.length }} أمر</div>
          </div>

          <div class="procurements-list">
            <div
              v-for="(proc, idx) in data.procurements"
              :key="proc.id"
              class="procurement-card"
            >
              <div class="procurement-header">
                <div class="procurement-ref-block">
                  <span class="procurement-ref">{{ proc.reference_no ?? `PO-${idx + 1}` }}</span>
                  <span class="badge" :class="`badge-status-${proc.status}`">{{ proc.status_label }}</span>
                </div>
                <div class="procurement-meta">
                  <span><i class="pi pi-calendar"></i> {{ proc.purchase_date ? formatDate(proc.purchase_date) : '—' }}</span>
                  <span><i class="pi pi-user"></i> {{ proc.created_by ?? '—' }}</span>
                  <span class="procurement-total">{{ fmt(proc.total_amount) }} <span class="currency">د.ع</span></span>
                </div>
              </div>

              <div v-if="proc.notes" class="procurement-notes">
                <i class="pi pi-comment"></i> {{ proc.notes }}
              </div>

              <table class="report-table">
                <thead>
                  <tr>
                    <th>المادة</th>
                    <th>الوحدة</th>
                    <th>الكمية</th>
                    <th>سعر الشراء</th>
                    <th>سعر العرض</th>
                    <th>الفرق</th>
                    <th>الإجمالي</th>
                    <th>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pi in proc.items" :key="pi.item_name">
                    <td>{{ pi.item_name }}</td>
                    <td>{{ pi.unit ?? '—' }}</td>
                    <td>{{ pi.quantity }}</td>
                    <td>{{ fmt(pi.purchase_price) }} د.ع</td>
                    <td>
                      <span v-if="pi.estimate_price > 0">{{ fmt(pi.estimate_price) }} د.ع</span>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td>
                      <span
                        v-if="pi.estimate_price > 0"
                        :class="pi.difference > 0 ? 'text-danger' : pi.difference < 0 ? 'text-success' : 'text-muted'"
                        class="bold"
                      >{{ fmt(pi.difference) }}</span>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td><strong>{{ fmt(pi.total_price) }} د.ع</strong></td>
                    <td class="text-muted">{{ pi.notes ?? '—' }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="6" class="text-left">المجموع الكلي</td>
                    <td><strong class="accent">{{ fmt(proc.total_amount) }} د.ع</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        <!-- ═══════════ ٥. الملخص المالي ═══════════ -->
        <section class="report-section">
          <div class="section-heading">
            <div class="section-num">٥</div>
            <div class="section-title">الملخص المالي</div>
          </div>

          <div class="financial-cards">
            <div class="fin-card fin-primary">
              <div class="fin-icon"><i class="pi pi-calculator"></i></div>
              <div class="fin-label">التكلفة التقديرية</div>
              <div class="fin-value">{{ fmt(data.financial.total_estimated_cost) }}</div>
              <div class="fin-unit">دينار عراقي</div>
            </div>
            <div class="fin-card fin-accepted">
              <div class="fin-icon"><i class="pi pi-check-circle"></i></div>
              <div class="fin-label">إجمالي العروض المقبولة</div>
              <div class="fin-value">{{ fmt(data.financial.accepted_estimates_total) }}</div>
              <div class="fin-unit">دينار عراقي</div>
            </div>
            <div class="fin-card fin-actual">
              <div class="fin-icon"><i class="pi pi-shopping-cart"></i></div>
              <div class="fin-label">إجمالي الشراء الفعلي</div>
              <div class="fin-value">{{ fmt(data.financial.actual_procurement_total) }}</div>
              <div class="fin-unit">دينار عراقي</div>
            </div>
            <div class="fin-card" :class="(data.financial.saving ?? 0) >= 0 ? 'fin-saving' : 'fin-overspend'">
              <div class="fin-icon">
                <i :class="(data.financial.saving ?? 0) >= 0 ? 'pi pi-arrow-down' : 'pi pi-arrow-up'"></i>
              </div>
              <div class="fin-label">{{ (data.financial.saving ?? 0) >= 0 ? 'التوفير المحقق' : 'الزيادة في التكلفة' }}</div>
              <div class="fin-value">{{ fmt(Math.abs(data.financial.saving ?? 0)) }}</div>
              <div class="fin-unit">دينار عراقي</div>
            </div>
          </div>

          <!-- إحصائيات -->
          <div class="fin-stats">
            <div class="fin-stat">
              <span class="stat-num">{{ data.financial.estimates_count }}</span>
              <span class="stat-label">عروض أسعار</span>
            </div>
            <div class="fin-stat">
              <span class="stat-num">{{ data.financial.accepted_estimates_count }}</span>
              <span class="stat-label">عروض مقبولة</span>
            </div>
            <div class="fin-stat">
              <span class="stat-num">{{ data.financial.procurements_count }}</span>
              <span class="stat-label">أوامر شراء</span>
            </div>
            <div class="fin-stat">
              <span class="stat-num">{{ data.items?.length ?? 0 }}</span>
              <span class="stat-label">مادة مطلوبة</span>
            </div>
          </div>

          <!-- توزيع العروض على الموردين -->
          <div v-if="Object.keys(data.financial.estimates_by_vendor || {}).length" class="vendor-breakdown">
            <div class="breakdown-title">توزيع العروض على الموردين</div>
            <table class="report-table">
              <thead>
                <tr>
                  <th>المورد</th>
                  <th style="width:14rem">إجمالي العرض</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(total, vendor) in data.financial.estimates_by_vendor" :key="vendor">
                  <td>{{ vendor }}</td>
                  <td><strong class="accent">{{ fmt(total) }} د.ع</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ═══════════ منطقة التوقيعات ═══════════ -->
        <section class="signatures-section">
          <div class="sig-box">
            <div class="sig-title">مقدّم الطلب</div>
            <div class="sig-name">{{ data.purchase_request.creator?.name ?? '—' }}</div>
            <div class="sig-line"></div>
            <div class="sig-hint">التوقيع / الختم</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">مدير القسم</div>
            <div class="sig-name">_______________</div>
            <div class="sig-line"></div>
            <div class="sig-hint">التوقيع / الختم</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">المدير المالي</div>
            <div class="sig-name">_______________</div>
            <div class="sig-line"></div>
            <div class="sig-hint">التوقيع / الختم</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">المدير العام</div>
            <div class="sig-name">_______________</div>
            <div class="sig-line"></div>
            <div class="sig-hint">التوقيع / الختم</div>
          </div>
        </section>

        <!-- ═══════════ تذييل التقرير ═══════════ -->
        <footer class="report-footer">
          <div class="footer-left">
            <div class="footer-brand">نظام إدارة المشتريات</div>
            <div class="footer-sub">وثيقة رسمية — للاستخدام الداخلي فقط</div>
          </div>
          <div class="footer-right">
            <div>أُصدر بواسطة: {{ data.generated_by }}</div>
            <div>تاريخ الطباعة: {{ printDate }}</div>
          </div>
        </footer>

      </div><!-- /report-sheet -->

    </template>



  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from '../../api/api'
import { useRoute } from 'vue-router'

const route = useRoute();
// ─── Route (يعمل مع أو بدون vue-router) ────────────────────────────────
const getRouteId = (): number | null => {
  // Vue Router
  try {
    const { useRoute } = (window as any).__VUE_ROUTER__
    if (useRoute) {
      const route = useRoute()
      const id = parseInt(route.params.id as string)
      if (!isNaN(id)) return id
    }
  } catch {}
  // URL params fallback
  const params = new URLSearchParams(window.location.search)
  const id = parseInt(params.get('id') ?? '')
  return isNaN(id) ? null : id
}

// ─── State ───────────────────────────────────────────────────────────────
const reportId = ref<number | null>(null)
const data     = ref<any>(null)
const loading  = ref(true)
const error    = ref('')

// ─── Computed ────────────────────────────────────────────────────────────
const printDate = computed(() =>
  new Date().toLocaleString('ar-IQ', {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
)

// ─── Helpers ─────────────────────────────────────────────────────────────
const fmt = (n: any): string => {
  const num = parseFloat(n)
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US')
}

const formatDate = (d: string | null): string => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('ar-IQ', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch { return d }
}

// ─── Fetch ────────────────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  error.value   = ''
  try {
    const res = await axios.get(`/reports/${reportId.value}/data`)
    data.value = res.data?.data ?? res.data
    console.log(data.value)
  } catch (e: any) {
    error.value = e.response?.data?.message ?? e.message ?? 'حدث خطأ أثناء جلب البيانات'
  } finally {
    loading.value = false
  }
}

// ─── Print ────────────────────────────────────────────────────────────────
const printPage = () => window.print()

// ─── Lifecycle ───────────────────────────────────────────────────────────
onMounted(() => {
    const id = parseInt(route.params.id as string);
    if (!id || isNaN(id)) {
        error.value = 'vsdv';
        loading.value = false;
        return
    }
    reportId.value = id
   fetchData()
})
</script>

<style scoped>
/* ════════════════════════════════════════════
   CSS Variables
════════════════════════════════════════════ */
:root, .report-root {
  --primary:     #1a3a6e;
  --primary-lt:  #2a5298;
  --accent:      #c8922a;
  --accent-lt:   #e8b84b;
  --success:     #2e7d52;
  --danger:      #8b1a1a;
  --warning:     #7a5000;
  --info:        #1a4a7a;
  --border:      #c8bfa4;
  --border-lt:   #e8e2d4;
  --surface:     #faf8f4;
  --text:        #1c1c1c;
  --muted:       #6b5e4e;
  --light:       #f4f0e8;
  --shadow:      0 2px 16px rgba(26,58,110,.1);
}

/* ════════════════════════════════════════════
   Base
════════════════════════════════════════════ */
.report-root {
  min-height: 100vh;
  background: #e6e2da;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
  direction: rtl;
}

/* ════════════════════════════════════════════
   Loading / Error
════════════════════════════════════════════ */
.loading-screen, .error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  color: var(--muted);
  font-size: 16px;
}
.loading-spinner {
  width: 48px; height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-screen i { font-size: 48px; color: var(--danger); }
.error-screen button {
  background: var(--primary); color: #fff;
  border: none; padding: 8px 20px; cursor: pointer;
  border-radius: 4px; font-family: inherit;
}

/* ════════════════════════════════════════════
   Toolbar
════════════════════════════════════════════ */
.toolbar {
  position: sticky; top: 0; z-index: 100;
  background: var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,.25);
}
.toolbar-brand {
  display: flex; align-items: center; gap: 10px;
  color: #fff; font-size: 15px; font-weight: 700;
}
.brand-icon { font-size: 20px; }
.btn-print {
  display: flex; align-items: center; gap: 8px;
  background: var(--accent); color: #fff;
  border: none; padding: 9px 20px;
  font-family: inherit; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: background .2s;
  border-radius: 3px;
}
.btn-print:hover { background: var(--accent-lt); }

/* ════════════════════════════════════════════
   Report Sheet
════════════════════════════════════════════ */
.report-sheet {
  max-width: 960px;
  margin: 24px auto;
  background: #fff;
  box-shadow: var(--shadow);
}

/* ════════════════════════════════════════════
   Report Header
════════════════════════════════════════════ */
.report-header {
  background: var(--primary);
  padding: 28px 36px 20px;
  position: relative;
}
.report-header::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, var(--accent), var(--accent-lt), var(--accent));
}
.report-header::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--accent);
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.org-name {
  font-size: 22px; font-weight: 900;
  color: #fff; letter-spacing: .5px; margin-bottom: 4px;
}
.org-sub { color: #9bb8d4; font-size: 11px; font-weight: 300; }
.doc-number {
  background: var(--accent);
  padding: 8px 18px; text-align: center;
  clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
}
.doc-num-label { font-size: 10px; color: rgba(255,255,255,.8); }
.doc-num-value { font-size: 20px; font-weight: 900; color: #fff; letter-spacing: 1px; }

.header-meta-bar {
  display: flex; flex-wrap: wrap; gap: 20px;
}
.meta-item {
  display: flex; align-items: center; gap: 6px;
  color: #9bb8d4; font-size: 11px;
}
.meta-item i { font-size: 11px; }
.meta-item strong { color: #fff; }

/* ════════════════════════════════════════════
   Title Band
════════════════════════════════════════════ */
.title-band {
  background: var(--light);
  border-bottom: 2px solid var(--border);
  padding: 14px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.title-text { font-size: 18px; font-weight: 800; color: var(--primary); }
.title-badges { display: flex; gap: 8px; align-items: center; }

/* ════════════════════════════════════════════
   Sections
════════════════════════════════════════════ */
.report-section {
  padding: 24px 36px;
  border-bottom: 1px solid var(--border-lt);
}
.section-heading {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary);
}
.section-num {
  width: 30px; height: 30px;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 900; flex-shrink: 0;
}
.section-title { font-size: 15px; font-weight: 800; color: var(--primary); }
.section-count {
  margin-right: auto;
  background: var(--accent); color: #fff;
  font-size: 11px; font-weight: 700;
  padding: 2px 10px; border-radius: 2px;
}

/* ════════════════════════════════════════════
   Info Grid
════════════════════════════════════════════ */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1.5px solid var(--border);
  margin-bottom: 16px;
}
.info-cell {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-lt);
  border-left: 1px solid var(--border-lt);
}
.info-cell:nth-child(even) { border-left: none; }
.info-label {
  font-size: 10px; color: var(--muted);
  font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; margin-bottom: 3px;
}
.info-value { font-size: 13px; color: var(--text); }
.info-value.bold { font-weight: 700; }
.info-value.accent { color: var(--accent); font-size: 16px; font-weight: 900; }

/* ════════════════════════════════════════════
   Description / Rejected Box
════════════════════════════════════════════ */
.description-box {
  background: var(--light);
  border-right: 4px solid var(--accent);
  padding: 12px 16px;
  margin-bottom: 16px;
}
.description-label {
  font-size: 10px; color: var(--muted);
  font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; margin-bottom: 4px;
}
.description-text { font-size: 13px; color: var(--text); line-height: 1.7; }

.rejected-box {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff0f0; border: 1.5px solid #e8b8b8;
  border-right: 4px solid var(--danger);
  padding: 10px 14px; margin-bottom: 16px;
  color: var(--danger); font-size: 13px;
}

/* ════════════════════════════════════════════
   Badges
════════════════════════════════════════════ */
.badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; font-size: 11px; font-weight: 700;
  border-radius: 2px; border: 1px solid transparent;
}
/* status */
.badge-status-pending     { background: #fff3cd; color: #7a5000; border-color: #ffc107; }
.badge-status-approved    { background: #d4edda; color: #1e6b3a; border-color: #28a745; }
.badge-status-accepted    { background: #d4edda; color: #1e6b3a; border-color: #28a745; }
.badge-status-completed   { background: #d4edda; color: #1e6b3a; border-color: #28a745; }
.badge-status-in_progress { background: #cce5ff; color: #004085; border-color: #007bff; }
.badge-status-rejected    { background: #f8d7da; color: #721c24; border-color: #dc3545; }
.badge-status-cancelled   { background: #e2e3e5; color: #383d41; border-color: #ced4da; }
.badge-status-draft       { background: #e2e3e5; color: #383d41; border-color: #ced4da; }
/* priority */
.badge-priority-high   { background: #f8d7da; color: #721c24; border-color: #dc3545; }
.badge-priority-medium { background: #fff3cd; color: #7a5000; border-color: #ffc107; }
.badge-priority-low    { background: #d4edda; color: #1e6b3a; border-color: #28a745; }
/* availability */
.badge-avail-available   { background: #d4edda; color: #1e6b3a; border-color: #28a745; }
.badge-avail-partial     { background: #fff3cd; color: #7a5000; border-color: #ffc107; }
.badge-avail-unavailable { background: #f8d7da; color: #721c24; border-color: #dc3545; }
/* urgency */
.badge-urgency-critical { background: #f8d7da; color: #721c24; border-color: #dc3545; }
.badge-urgency-high     { background: #f8d7da; color: #721c24; border-color: #dc3545; }
.badge-urgency-medium   { background: #fff3cd; color: #7a5000; border-color: #ffc107; }
.badge-urgency-low      { background: #d4edda; color: #1e6b3a; border-color: #28a745; }
/* decision */
.badge-decision-approved { background: #d4edda; color: #1e6b3a; border-color: #28a745; }
.badge-decision-rejected { background: #f8d7da; color: #721c24; border-color: #dc3545; }
.badge-decision-pending  { background: #fff3cd; color: #7a5000; border-color: #ffc107; }

/* ════════════════════════════════════════════
   Item Cards
════════════════════════════════════════════ */
.items-list { display: flex; flex-direction: column; gap: 16px; }
.item-card {
  border: 1.5px solid var(--border);
  page-break-inside: avoid;
}
.item-card-header {
  background: var(--primary); color: #fff;
  padding: 10px 16px;
  display: flex; align-items: center; gap: 12px;
  flex-wrap: wrap;
}
.item-index {
  width: 24px; height: 24px;
  background: var(--accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 900; flex-shrink: 0;
  border-radius: 2px;
}
.item-name { font-weight: 800; font-size: 14px; flex: 1; }
.item-meta { font-size: 11px; opacity: .8; display: flex; gap: 8px; align-items: center; }
.item-meta .accent { color: var(--accent-lt); }
.sep { opacity: .4; }

.item-card-body { padding: 14px 16px; }
.item-specs {
  background: var(--light);
  border-right: 3px solid var(--accent);
  padding: 8px 12px; margin-bottom: 14px;
}
.sub-label {
  font-size: 10px; color: var(--muted);
  font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; margin-bottom: 3px;
}
.sub-text { font-size: 12px; color: var(--text); }

.item-checks-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; margin-bottom: 14px;
}
.check-block {
  border: 1.5px solid var(--border-lt);
  border-radius: 4px; padding: 12px;
}
.check-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700;
  color: var(--primary-lt);
  text-transform: uppercase; letter-spacing: .04em;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--border);
}
.check-empty { font-size: 11px; color: var(--muted); }
.check-rows { display: flex; flex-direction: column; gap: 5px; }
.check-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px;
}
.check-key { color: var(--muted); }
.check-val { font-size: 12px; color: var(--text); }
.check-val.bold { font-weight: 700; }
.check-note {
  font-size: 11px; color: var(--text);
  background: var(--light); padding: 5px 8px;
  border-radius: 3px; margin-top: 4px;
}
.check-by {
  font-size: 10px; color: var(--muted);
  border-top: 1px solid var(--border-lt);
  padding-top: 5px; margin-top: 4px;
}

.sub-section-title {
  font-size: 11px; font-weight: 700; color: var(--primary);
  text-transform: uppercase; letter-spacing: .04em;
  margin-bottom: 8px;
}
.item-estimates { margin-top: 12px; }

/* ════════════════════════════════════════════
   Tables
════════════════════════════════════════════ */
.report-table {
  width: 100%; border-collapse: collapse; font-size: 12px;
}
.report-table thead tr { background: var(--primary); color: #fff; }
.report-table thead th {
  padding: 8px 10px; text-align: right;
  font-weight: 600; font-size: 11px;
  letter-spacing: .03em;
}
.report-table tbody tr:nth-child(even) { background: var(--light); }
.report-table tbody td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--border-lt);
  vertical-align: top;
}
.report-table tfoot tr { background: var(--light); }
.report-table tfoot td {
  padding: 8px 10px;
  border-top: 2px solid var(--border);
  font-size: 12px;
}
.text-left { text-align: left; }
.text-muted { color: var(--muted); font-size: 11px; }
.text-danger { color: var(--danger); }
.text-success { color: var(--success); }
.bold { font-weight: 700; }
.accent { color: var(--accent); }

/* ════════════════════════════════════════════
   Estimates
════════════════════════════════════════════ */
.estimates-list { display: flex; flex-direction: column; gap: 16px; }
.estimate-card {
  border: 1.5px solid var(--border);
  page-break-inside: avoid;
}
.estimate-accepted { border-color: #28a745; }
.estimate-header {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
  padding: 10px 16px;
  background: var(--light);
  border-bottom: 1px solid var(--border);
}
.estimate-vendor-block { display: flex; align-items: center; gap: 10px; }
.estimate-vendor-badge {
  background: var(--primary); color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 2px;
  letter-spacing: .04em;
}
.estimate-vendor-name { font-size: 15px; font-weight: 800; color: var(--primary); }
.estimate-total {
  font-size: 20px; font-weight: 900; color: var(--accent);
}
.currency { font-size: 12px; font-weight: 500; color: var(--muted); }

.vendor-info {
  display: flex; flex-wrap: wrap; gap: 16px;
  padding: 10px 16px;
  font-size: 11px; color: var(--muted);
  border-bottom: 1px solid var(--border-lt);
  background: #fafaf8;
}
.vendor-info i { margin-left: 4px; }
.estimate-notes {
  padding: 8px 16px;
  font-size: 12px; color: var(--muted);
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--border-lt);
}

/* ════════════════════════════════════════════
   Procurements
════════════════════════════════════════════ */
.procurements-list { display: flex; flex-direction: column; gap: 16px; }
.procurement-card {
  border: 1.5px solid var(--border);
  page-break-inside: avoid;
}
.procurement-header {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
  padding: 10px 16px;
  background: var(--light);
  border-bottom: 1px solid var(--border);
}
.procurement-ref-block { display: flex; align-items: center; gap: 10px; }
.procurement-ref {
  font-size: 14px; font-weight: 900;
  color: var(--primary); font-family: monospace;
}
.procurement-meta {
  display: flex; align-items: center; gap: 16px;
  font-size: 11px; color: var(--muted);
}
.procurement-meta i { margin-left: 4px; }
.procurement-total { font-size: 18px; font-weight: 900; color: var(--accent); }
.procurement-notes {
  padding: 8px 16px;
  font-size: 12px; color: var(--muted);
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--border-lt);
}

/* ════════════════════════════════════════════
   Financial Summary
════════════════════════════════════════════ */
.financial-cards {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 12px; margin-bottom: 20px;
}
.fin-card {
  border: 1.5px solid var(--border);
  padding: 16px; text-align: center;
  position: relative;
}
.fin-card::before {
  content: ''; position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: var(--primary);
}
.fin-primary::before  { background: var(--primary); }
.fin-accepted::before { background: var(--success); }
.fin-actual::before   { background: var(--accent); }
.fin-saving::before   { background: var(--success); }
.fin-overspend::before{ background: var(--danger); }
.fin-icon { font-size: 22px; margin-bottom: 8px; color: var(--muted); }
.fin-label { font-size: 10px; color: var(--muted); font-weight: 700; margin-bottom: 6px; }
.fin-value { font-size: 20px; font-weight: 900; color: var(--primary); }
.fin-saving .fin-value   { color: var(--success); }
.fin-overspend .fin-value{ color: var(--danger); }
.fin-unit { font-size: 10px; color: var(--muted); margin-top: 2px; }

.fin-stats {
  display: flex; gap: 0;
  border: 1.5px solid var(--border);
  margin-bottom: 20px;
}
.fin-stat {
  flex: 1; text-align: center;
  padding: 12px;
  border-left: 1px solid var(--border-lt);
}
.fin-stat:last-child { border-left: none; }
.stat-num { display: block; font-size: 24px; font-weight: 900; color: var(--primary); }
.stat-label { font-size: 11px; color: var(--muted); }

.vendor-breakdown { margin-top: 16px; }
.breakdown-title {
  font-size: 11px; font-weight: 700; color: var(--primary);
  text-transform: uppercase; letter-spacing: .04em;
  margin-bottom: 8px;
}

/* ════════════════════════════════════════════
   Images
════════════════════════════════════════════ */
.images-block { margin-top: 14px; }
.images-title {
  font-size: 11px; font-weight: 700; color: var(--primary);
  text-transform: uppercase; letter-spacing: .04em;
  margin-bottom: 8px;
}
.images-inline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}
.img-inline {
  border: 1.5px solid var(--border);
  overflow: hidden;
  border-radius: 3px;
}
.img-inline img {
  width: 100%; display: block;
  object-fit: cover; max-height: 220px;
}

/* ════════════════════════════════════════════
   Signatures
════════════════════════════════════════════ */
.signatures-section {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 12px; padding: 24px 36px;
  border-bottom: 1px solid var(--border-lt);
}
.sig-box {
  border: 1.5px solid var(--border);
  padding: 14px; text-align: center;
}
.sig-title {
  font-size: 11px; color: var(--muted);
  font-weight: 700; margin-bottom: 28px;
}
.sig-name {
  font-size: 12px; font-weight: 700; color: var(--text);
  margin-bottom: 6px;
}
.sig-line {
  border-top: 1.5px solid var(--border);
  margin-bottom: 6px;
}
.sig-hint { font-size: 10px; color: var(--muted); }

/* ════════════════════════════════════════════
   Footer
════════════════════════════════════════════ */
.report-footer {
  background: var(--primary);
  padding: 14px 36px;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-brand { color: var(--accent-lt); font-weight: 700; font-size: 13px; }
.footer-sub { color: #9bb8d4; font-size: 10px; }
.footer-right { color: #9bb8d4; font-size: 10px; text-align: left; line-height: 1.8; }

/* ════════════════════════════════════════════
   Empty state
════════════════════════════════════════════ */
.empty-state {
  display: flex; align-items: center; gap: 10px;
  justify-content: center; padding: 32px;
  color: var(--muted); font-size: 14px;
}
.empty-state i { font-size: 28px; }



/* ════════════════════════════════════════════
   Print Styles
════════════════════════════════════════════ */
@media print {
  .no-print { display: none !important; }
  .report-root { background: white; }
  .report-sheet { margin: 0; box-shadow: none; max-width: 100%; }
  .report-section { page-break-inside: avoid; }
  .item-card, .estimate-card, .procurement-card { page-break-inside: avoid; }
  .signatures-section { page-break-inside: avoid; }
  .financial-cards { page-break-inside: avoid; }

  .report-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .title-band { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .report-table thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .item-card-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .estimate-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .report-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .fin-card::before { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  @page {
    size: A4 portrait;
    margin: 12mm 10mm;
  }
}
</style>