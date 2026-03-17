<template>
  <div>
    <!-- ── زر الطباعة (يُخفى عند الطباعة) ── -->
    <div class="no-print controls-bar">
      <button class="btn-print" @click="printReport">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        طباعة التقرير
      </button>
      <button class="btn-close" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        إغلاق
      </button>
    </div>

    <!-- ── محتوى التقرير ── -->
    <div id="print-area" dir="rtl">

      <!-- HEADER -->
      <div class="rpt-header">
        <div class="rpt-header-org">العتبة العباسية المقدسة &nbsp;·&nbsp; نظام إدارة المشتريات</div>
        <div class="rpt-header-title">تقرير طلب شراء شامل</div>
        <div class="rpt-header-meta">
          <span><b>رقم الطلب:</b> {{ data.purchaseRequest.request_number }}</span>
          <span><b>تاريخ الإصدار:</b> {{ data.generatedAt }}</span>
          <span><b>أصدره:</b> {{ data.generatedBy }}</span>
        </div>
      </div>
      <div class="rpt-accent"></div>

      <!-- ١ - تفاصيل طلب الشراء -->
      <section class="rpt-section">
        <div class="rpt-sec-head">١ — تفاصيل طلب الشراء</div>
        <div class="rpt-sec-body">
          <table class="t-info">
            <tbody>
              <tr>
                <td class="lbl">رقم الطلب</td>
                <td class="bold">{{ data.purchaseRequest.request_number }}</td>
                <td class="lbl">الحالة</td>
                <td><span :class="'badge b-' + data.purchaseRequest.status_type">{{ data.purchaseRequest.status_label }}</span></td>
              </tr>
              <tr>
                <td class="lbl">عنوان الطلب</td>
                <td class="bold" colspan="3">{{ data.purchaseRequest.title }}</td>
              </tr>
              <tr v-if="data.purchaseRequest.description">
                <td class="lbl">الوصف</td>
                <td colspan="3">{{ data.purchaseRequest.description }}</td>
              </tr>
              <tr>
                <td class="lbl">القسم الطالب</td>
                <td>{{ data.purchaseRequest.department?.name ?? '—' }}</td>
                <td class="lbl">اللجنة</td>
                <td>{{ data.purchaseRequest.committee?.name ?? '—' }}</td>
              </tr>
              <tr>
                <td class="lbl">مقدم الطلب</td>
                <td>{{ data.purchaseRequest.creator?.name ?? '—' }}</td>
                <td class="lbl">تاريخ الطلب</td>
                <td>{{ data.purchaseRequest.created_at ?? '—' }}</td>
              </tr>
              <tr>
                <td class="lbl">التكلفة التقديرية</td>
                <td class="bold ltr">{{ fmt(data.purchaseRequest.total_estimated_cost) }} IQD</td>
                <td class="lbl">الأولوية</td>
                <td><span :class="'badge b-' + data.purchaseRequest.priority">{{ data.purchaseRequest.priority_label }}</span></td>
              </tr>
              <tr v-if="data.purchaseRequest.rejected_reason">
                <td class="lbl" style="color:#c62828;font-weight:bold;">سبب الرفض</td>
                <td colspan="3" style="color:#c62828;">{{ data.purchaseRequest.rejected_reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ٢ - المواد -->
      <section class="rpt-section">
        <div class="rpt-sec-head">٢ — المواد المطلوبة مع رأي المخازن وعروض الأسعار</div>
        <div class="rpt-sec-body">
          <div v-if="!data.items?.length" class="no-data">لا توجد مواد</div>
          <div v-for="(item, idx) in data.items" :key="item.id" class="item-box">
            <div class="item-head">
              <div class="item-head-title">{{ idx + 1 }}. {{ item.item_name }}</div>
              <div class="item-head-meta">
                الكمية: {{ item.quantity }}{{ item.unit ? ' ' + item.unit : '' }}
                &nbsp;|&nbsp;
                التكلفة التقديرية: <span class="ltr">{{ fmt(item.total_estimated_price) }} IQD</span>
              </div>
            </div>
            <div class="item-body">
              <div v-if="item.specifications" class="specs">
                <b>المواصفات:</b> {{ item.specifications }}
              </div>

              <!-- رأي المخازن -->
              <div class="sub">
                <div class="sub-title">رأي المخازن</div>
                <div v-if="!item.warehouse_check" class="no-data">لم يتم الفحص بعد</div>
                <table v-else class="t-info" style="margin-top:0">
                  <tbody>
                    <tr>
                      <td class="lbl" style="width:120px">حالة التوفر</td>
                      <td style="width:140px"><span :class="'badge b-' + item.warehouse_check.availability">{{ item.warehouse_check.availability_label }}</span></td>
                      <td class="lbl" style="width:120px">الكمية المتوفرة</td>
                      <td class="bold">{{ item.warehouse_check.available_quantity }}</td>
                    </tr>
                    <tr>
                      <td class="lbl">حالة المادة</td>
                      <td>{{ item.warehouse_check.item_condition || '—' }}</td>
                      <td class="lbl">التوصية</td>
                      <td class="bold">{{ item.warehouse_check.recommendation_label }}</td>
                    </tr>
                    <tr v-if="item.warehouse_check.notes">
                      <td class="lbl">ملاحظات</td>
                      <td colspan="3">{{ item.warehouse_check.notes }}</td>
                    </tr>
                    <tr>
                      <td class="lbl">فُحص بواسطة</td>
                      <td>{{ item.warehouse_check.checked_by }}</td>
                      <td class="lbl">تاريخ الفحص</td>
                      <td>{{ item.warehouse_check.checked_at }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- تقييم الحاجة -->
              <div v-if="item.needs_assessment" class="sub" style="margin-top:10px">
                <div class="sub-title">تقييم الحاجة</div>
                <table class="t-info" style="margin-top:0">
                  <tbody>
                    <tr>
                      <td class="lbl" style="width:120px">مستوى الإلحاح</td>
                      <td style="width:140px"><span :class="'badge b-' + item.needs_assessment.urgency_level">{{ item.needs_assessment.urgency_label }}</span></td>
                      <td class="lbl" style="width:120px">حالة الحاجة</td>
                      <td>{{ item.needs_assessment.needs_status_label }}</td>
                    </tr>
                    <tr>
                      <td class="lbl">الكمية بعد التقييم</td>
                      <td>{{ item.needs_assessment.quantity_needed_after_assessment ?? '—' }}</td>
                      <td class="lbl">قرار الإدارة</td>
                      <td><span :class="'badge b-' + (item.needs_assessment.admin_decision || 'pending')">{{ item.needs_assessment.admin_decision || '—' }}</span></td>
                    </tr>
                    <tr v-if="item.needs_assessment.reason">
                      <td class="lbl">السبب</td>
                      <td colspan="3">{{ item.needs_assessment.reason }}</td>
                    </tr>
                    <tr v-if="item.needs_assessment.recommended_action">
                      <td class="lbl">الإجراء المقترح</td>
                      <td colspan="3">{{ item.needs_assessment.recommended_action }}</td>
                    </tr>
                    <tr>
                      <td class="lbl">قيّم بواسطة</td>
                      <td>{{ item.needs_assessment.assessed_by }}</td>
                      <td class="lbl">تاريخ التقييم</td>
                      <td>{{ item.needs_assessment.assessed_at }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- عروض الأسعار للمادة -->
              <div v-if="item.estimate_items?.length" class="sub" style="margin-top:10px">
                <div class="sub-title">عروض الأسعار لهذه المادة</div>
                <table class="t-data">
                  <thead>
                    <tr>
                      <th class="tc" style="width:5%">#</th>
                      <th>المورد</th>
                      <th class="tc" style="width:10%">الكمية</th>
                      <th class="tr" style="width:18%">سعر الوحدة</th>
                      <th class="tr" style="width:18%">الإجمالي</th>
                      <th class="tc" style="width:14%">الحالة</th>
                      <th class="tc" style="width:13%">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(ei, i) in item.estimate_items" :key="i" :class="i % 2 === 0 ? 'odd' : 'even'">
                      <td class="tc">{{ i + 1 }}</td>
                      <td>{{ ei.estimate?.vendor?.name ?? '—' }}</td>
                      <td class="tc">{{ ei.quantity }}</td>
                      <td class="tr ltr">{{ fmt(ei.unit_price) }}</td>
                      <td class="tr ltr bold">{{ fmt(ei.total_price) }}</td>
                      <td class="tc"><span :class="'badge b-' + (ei.estimate?.status || 'pending')">{{ ei.estimate?.status_label ?? '—' }}</span></td>
                      <td class="tc">{{ ei.estimate?.estimate_date ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ٣ - ملخص عروض الأسعار -->
      <section class="rpt-section page-break">
        <div class="rpt-sec-head">٣ — ملخص عروض الأسعار</div>
        <div class="rpt-sec-body">
          <div v-if="!data.estimates?.length" class="no-data">لا توجد عروض أسعار</div>
          <div v-for="(est, idx) in data.estimates" :key="est.id" class="item-box" style="margin-bottom:12px">
            <div class="item-head">
              <div class="item-head-title">
                عرض رقم {{ idx + 1 }}
                &nbsp;<span :class="'badge b-' + est.status">{{ est.status_label }}</span>
              </div>
              <div class="item-head-meta">
                الإجمالي: <span class="ltr bold">{{ fmt(est.total_amount) }} IQD</span>
                &nbsp;|&nbsp; التاريخ: {{ est.estimate_date ?? '—' }}
              </div>
            </div>
            <div class="item-body">
              <div v-if="est.vendor" class="vendor">
                <span><b>المورد:</b> {{ est.vendor.name }}</span>
                <span style="margin-right:16px"><b>هاتف:</b> {{ est.vendor.phone1 }}</span>
                <span v-if="est.vendor.email" style="margin-right:16px"><b>البريد:</b> {{ est.vendor.email }}</span>
                <span v-if="est.vendor.address" style="margin-right:16px"><b>العنوان:</b> {{ est.vendor.address }}</span>
              </div>
              <div v-if="est.notes" class="specs" style="margin-bottom:6px"><b>ملاحظات:</b> {{ est.notes }}</div>
              <table v-if="est.items?.length" class="t-data">
                <thead>
                  <tr>
                    <th class="tc" style="width:5%">#</th>
                    <th>المادة</th>
                    <th class="tc" style="width:10%">الكمية</th>
                    <th class="tr" style="width:22%">سعر الوحدة (IQD)</th>
                    <th class="tr" style="width:22%">الإجمالي (IQD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ei, i) in est.items" :key="i" :class="i % 2 === 0 ? 'odd' : 'even'">
                    <td class="tc">{{ i + 1 }}</td>
                    <td>{{ ei.item_name }}</td>
                    <td class="tc">{{ ei.quantity }}</td>
                    <td class="tr ltr">{{ fmt(ei.unit_price) }}</td>
                    <td class="tr ltr bold">{{ fmt(ei.total_price) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="tc">المجموع الكلي</td>
                    <td class="tr ltr bold">{{ fmt(est.total_amount) }} IQD</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- ٤ - عمليات الشراء -->
      <section v-if="data.procurements?.length" class="rpt-section">
        <div class="rpt-sec-head">٤ — عمليات الشراء الفعلية</div>
        <div class="rpt-sec-body">
          <div v-for="(proc, idx) in data.procurements" :key="proc.id" class="item-box" style="margin-bottom:12px">
            <div class="item-head">
              <div class="item-head-title">
                <span class="ltr">{{ proc.reference_no ?? ('PO-' + (idx+1)) }}</span>
                &nbsp;<span :class="'badge b-' + proc.status">{{ proc.status_label }}</span>
              </div>
              <div class="item-head-meta">
                الإجمالي: <span class="ltr bold">{{ fmt(proc.total_amount) }} IQD</span>
                &nbsp;|&nbsp; تاريخ الشراء: {{ proc.purchase_date ?? '—' }}
                &nbsp;|&nbsp; بواسطة: {{ proc.created_by ?? '—' }}
              </div>
            </div>
            <div class="item-body">
              <div v-if="proc.notes" class="specs" style="margin-bottom:6px"><b>ملاحظات:</b> {{ proc.notes }}</div>
              <table class="t-data">
                <thead>
                  <tr>
                    <th class="tc" style="width:4%">#</th>
                    <th>المادة</th>
                    <th class="tc" style="width:8%">الوحدة</th>
                    <th class="tc" style="width:8%">الكمية</th>
                    <th class="tr" style="width:13%">سعر الشراء</th>
                    <th class="tr" style="width:13%">سعر العرض</th>
                    <th class="tr" style="width:10%">الفرق</th>
                    <th class="tr" style="width:14%">الإجمالي (IQD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(pi, i) in proc.items" :key="i" :class="i % 2 === 0 ? 'odd' : 'even'">
                    <td class="tc">{{ i + 1 }}</td>
                    <td>{{ pi.item_name }}</td>
                    <td class="tc">{{ pi.unit ?? '—' }}</td>
                    <td class="tc">{{ pi.quantity }}</td>
                    <td class="tr ltr">{{ fmt(pi.purchase_price) }}</td>
                    <td class="tr ltr">{{ pi.estimate_price > 0 ? fmt(pi.estimate_price) : '—' }}</td>
                    <td class="tr ltr" :style="{ color: pi.difference > 0 ? '#c62828' : pi.difference < 0 ? '#2e7d32' : '' }">
                      {{ pi.estimate_price > 0 ? fmt(pi.difference) : '—' }}
                    </td>
                    <td class="tr ltr bold">{{ fmt(pi.total_price) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="7" class="tc">المجموع الكلي</td>
                    <td class="tr ltr bold">{{ fmt(proc.total_amount) }} IQD</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- ٥ - الملخص المالي -->
      <section class="rpt-section">
        <div class="rpt-sec-head">٥ — الملخص المالي</div>
        <div class="rpt-sec-body">
          <div class="fin-grid">
            <div class="fin-card">
              <div class="fin-val ltr">{{ fmt(data.financial.total_estimated_cost) }}</div>
              <div class="fin-lbl">التكلفة التقديرية (IQD)</div>
            </div>
            <div class="fin-card fin-card-dark">
              <div class="fin-val ltr">{{ fmt(data.financial.accepted_estimates_total) }}</div>
              <div class="fin-lbl">العروض المقبولة (IQD)</div>
            </div>
            <div class="fin-card">
              <div class="fin-val ltr">{{ fmt(data.financial.actual_procurement_total) }}</div>
              <div class="fin-lbl">الشراء الفعلي (IQD)</div>
            </div>
            <div v-if="data.financial.saving !== null" class="fin-card fin-card-green">
              <div class="fin-val ltr">{{ fmt(Math.abs(data.financial.saving)) }}</div>
              <div class="fin-lbl">{{ data.financial.saving >= 0 ? 'التوفير المحقق' : 'الزيادة' }} (IQD)</div>
            </div>
          </div>

          <div v-if="Object.keys(data.financial.estimates_by_vendor || {}).length" class="sub" style="margin-top:12px">
            <div class="sub-title">توزيع العروض حسب المورد</div>
            <table class="t-data" style="margin-top:0">
              <thead>
                <tr>
                  <th class="tc" style="width:6%">#</th>
                  <th>المورد</th>
                  <th class="tr" style="width:30%">الإجمالي (IQD)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(total, vendor, i) in data.financial.estimates_by_vendor" :key="vendor" :class="i % 2 === 0 ? 'odd' : 'even'">
                  <td class="tc">{{ i + 1 }}</td>
                  <td>{{ vendor }}</td>
                  <td class="tr ltr bold">{{ fmt(total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr style="border:none;border-top:1px dashed #c8d4e8;margin:12px 0">

          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-val">{{ data.items?.length ?? 0 }}</div>
              <div class="stat-lbl">عدد المواد</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ data.financial.estimates_count }}</div>
              <div class="stat-lbl">عروض الأسعار</div>
            </div>
            <div class="stat-box stat-box-green">
              <div class="stat-val" style="color:#1b5e20">{{ data.financial.accepted_estimates_count }}</div>
              <div class="stat-lbl" style="color:#2e7d32">عروض مقبولة</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ data.financial.procurements_count }}</div>
              <div class="stat-lbl">عمليات شراء</div>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <div class="rpt-footer">
        <p>هذا التقرير مُولَّد آلياً من نظام إدارة المشتريات — العتبة العباسية المقدسة</p>
        <p>تاريخ الإصدار: {{ data.generatedAt }} &nbsp;|&nbsp; أصدره: {{ data.generatedBy }}</p>
      </div>

    </div><!-- /print-area -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import api from '../api/api'
import { ref } from 'vue'

const props = defineProps<{
    purchaseRequestId: number
}>()

const emit = defineEmits(['close'])

const data = ref<any>({
    purchaseRequest: {},
    items: [],
    estimates: [],
    procurements: [],
    financial: {},
    generatedAt: '',
    generatedBy: '',
})

const loading = ref(true)
const error = ref('')

const fmt = (n: any) => {
    const num = parseFloat(n)
    if (isNaN(num)) return '0'
    return num.toLocaleString('en-US')
}

const printReport = () => {
    window.print()
}

onMounted(async () => {
    try {
        const res = await api.get(`/reports/generate/1`)
        console.log(res)
        data.value = res.data.data
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
/* ── Controls Bar ── */
.controls-bar {
  position: fixed;
  top: 0; right: 0; left: 0;
  z-index: 1000;
  background: #1a3a6e;
  padding: 10px 24px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.3);
}

.btn-print, .btn-close {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 20px;
  border: none; border-radius: 6px;
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.btn-print {
  background: #1e88e5; color: #fff;
}
.btn-print:hover { background: #1565c0; }

.btn-close {
  background: rgba(255,255,255,.15); color: #fff;
}
.btn-close:hover { background: rgba(255,255,255,.25); }

/* ── Print Area ── */
#print-area {
  direction: rtl;
  font-family: 'Segoe UI', Tahoma, 'Arial Unicode MS', Arial, sans-serif;
  font-size: 11pt;
  color: #1e2535;
  background: #fff;
  max-width: 900px;
  margin: 70px auto 40px;
  padding: 0 20px;
  line-height: 1.6;
}

/* ── Header ── */
.rpt-header {
  background: #0f2044;
  color: #fff;
  padding: 18px 24px;
  border-radius: 6px 6px 0 0;
}
.rpt-header-org  { font-size: 9pt; color: #a0b8d8; margin-bottom: 6px; }
.rpt-header-title { font-size: 18pt; font-weight: 700; margin-bottom: 8px; }
.rpt-header-meta { font-size: 9pt; color: #c0d4ec; display: flex; gap: 20px; flex-wrap: wrap; }

.rpt-accent { height: 4px; background: #1e88e5; margin-bottom: 20px; }

/* ── Section ── */
.rpt-section {
  margin-bottom: 18px;
  border: 1px solid #d8e0f0;
  border-radius: 6px;
  overflow: hidden;
}
.rpt-sec-head {
  background: #1a3a6e;
  color: #fff;
  padding: 8px 16px;
  font-size: 11pt;
  font-weight: 700;
}
.rpt-sec-body { padding: 14px 16px; }

/* ── Info Table ── */
.t-info { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
.t-info td {
  padding: 5px 8px;
  border: 1px solid #dde4f5;
  font-size: 10pt;
  vertical-align: top;
}
.t-info .lbl {
  background: #f0f4fb;
  font-weight: 700;
  color: #2a3a5e;
  width: 130px;
  white-space: nowrap;
}

/* ── Data Table ── */
.t-data { width: 100%; border-collapse: collapse; margin-top: 6px; }
.t-data th {
  background: #1a3a6e; color: #fff;
  padding: 6px 8px; font-size: 9.5pt;
  text-align: right;
  border: 1px solid #122a52;
}
.t-data td {
  padding: 5px 8px;
  border: 1px solid #dde4f5;
  font-size: 9.5pt;
  vertical-align: middle;
}
.t-data .odd td  { background: #fff; }
.t-data .even td { background: #f5f7fc; }
.t-data tfoot td {
  background: #e4eaf8;
  font-weight: 700;
  padding: 6px 8px;
  border: 1px solid #c5d0e8;
}

/* ── Item Box ── */
.item-box { border: 1px solid #c8d4ec; border-radius: 6px; margin-bottom: 14px; overflow: hidden; }
.item-head { background: #e4eaf8; padding: 8px 14px; border-bottom: 1px solid #c8d4ec; }
.item-head-title { font-size: 11pt; font-weight: 700; color: #1a3a6e; }
.item-head-meta  { font-size: 9pt; color: #5a6a8a; margin-top: 2px; }
.item-body { padding: 12px 14px; }

/* ── Sub Section ── */
.sub { margin-top: 10px; padding-right: 12px; border-right: 3px solid #1e88e5; }
.sub-title { font-size: 9.5pt; font-weight: 700; color: #1565c0; margin-bottom: 6px; }

/* ── Specs ── */
.specs {
  background: #f8fafc;
  border-right: 2px solid #c5d5f0;
  padding: 4px 10px;
  margin-bottom: 8px;
  font-size: 9.5pt;
  color: #4a5a7a;
}

/* ── Vendor ── */
.vendor {
  background: #f0f5ff;
  border: 1px solid #c5d5f0;
  border-radius: 4px;
  padding: 6px 10px;
  margin-bottom: 8px;
  font-size: 9.5pt;
}

/* ── Badges ── */
.badge {
  display: inline-block;
  padding: 1px 9px;
  border-radius: 12px;
  font-size: 8.5pt;
  font-weight: 700;
}
.b-pending     { background: #fff8e1; color: #e65100; }
.b-approved    { background: #e8f5e9; color: #1b5e20; }
.b-rejected    { background: #ffebee; color: #b71c1c; }
.b-completed   { background: #e3f2fd; color: #0d47a1; }
.b-accepted    { background: #e8f5e9; color: #1b5e20; }
.b-in_progress { background: #e3f2fd; color: #0d47a1; }
.b-cancelled   { background: #f5f5f5; color: #424242; }
.b-draft       { background: #f3e5f5; color: #4a148c; }
.b-available   { background: #e8f5e9; color: #1b5e20; }
.b-partial     { background: #fff8e1; color: #e65100; }
.b-unavailable { background: #ffebee; color: #b71c1c; }
.b-high        { background: #ffebee; color: #b71c1c; }
.b-medium      { background: #fff8e1; color: #e65100; }
.b-low         { background: #e8f5e9; color: #1b5e20; }
.b-critical    { background: #fce4ec; color: #880e4f; }

/* ── Financial Grid ── */
.fin-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.fin-card {
  background: #f0f4fb;
  border: 1px solid #d0daf0;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
}
.fin-card-dark  { background: #0f2044; border-color: #0f2044; }
.fin-card-green { background: #e8f5e9; border-color: #81c784; }
.fin-val { font-size: 14pt; font-weight: 700; color: #1a3a6e; }
.fin-card-dark  .fin-val { color: #fff; }
.fin-card-green .fin-val { color: #1b5e20; }
.fin-lbl { font-size: 8pt; color: #5a6a8a; margin-top: 4px; }
.fin-card-dark  .fin-lbl { color: #90aec8; }
.fin-card-green .fin-lbl { color: #2e7d32; }

/* ── Stats Grid ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.stat-box {
  background: #f0f4fb;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
}
.stat-box-green { background: #e8f5e9; }
.stat-val { font-size: 16pt; font-weight: 700; color: #1a3a6e; }
.stat-lbl { font-size: 8pt; color: #5a6a8a; }

/* ── No Data ── */
.no-data {
  text-align: center;
  color: #9aa5be;
  font-style: italic;
  padding: 12px;
  background: #f9fafc;
  border-radius: 4px;
  font-size: 9.5pt;
}

/* ── Footer ── */
.rpt-footer {
  margin-top: 24px;
  padding-top: 10px;
  border-top: 2px dashed #c8d4e8;
  text-align: center;
  color: #8a9ab8;
  font-size: 8.5pt;
  line-height: 1.8;
}

/* ── Utils ── */
.tc   { text-align: center !important; }
.tr   { text-align: left  !important; }
.ltr  { direction: ltr; unicode-bidi: embed; }
.bold { font-weight: 700; }

/* ══════════════════════════════════════
   PRINT STYLES
══════════════════════════════════════ */
@media print {
  .no-print { display: none !important; }

  #print-area {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
    font-size: 9pt;
  }

  .rpt-section  { page-break-inside: avoid; }
  .item-box     { page-break-inside: avoid; }
  .page-break   { page-break-before: always; }

  .rpt-header   { border-radius: 0 !important; }

  /* إخفاء scroll bars */
  body { overflow: visible !important; }

  @page {
    size: A4 portrait;
    margin: 15mm 12mm;
  }
}
</style>