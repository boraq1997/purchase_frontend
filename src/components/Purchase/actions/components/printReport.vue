<template>
  <div dir="rtl" class="print-report-container">

    <!-- ── رسالة خطأ ── -->
    <Message v-if="error" severity="error" :closable="false" class="mb-4 error-msg">
      {{ error }}
    </Message>

    <!-- ── الحالة: لم يُولَّد بعد ── -->
    <div v-if="state === 'idle'" class="state-card idle-card">
      <div class="card-bg-shape" />
      <div class="state-icon idle-icon">
        <i class="pi pi-file-pdf" />
      </div>
      <div class="state-text">
        <h3 class="state-title">لا يوجد تقرير بعد</h3>
        <p class="state-subtitle">اضغط على الزر لتوليد تقرير شامل لهذا الطلب</p>
      </div>
      <Button
        label="توليد التقرير"
        icon="pi pi-sparkles"
        size="large"
        class="generate-btn"
        :loading="loading"
        @click="generateReport"
      />
    </div>

    <!-- ── الحالة: جاري التوليد ── -->
    <div v-else-if="state === 'loading'" class="state-card loading-card">
      <div class="pulse-ring" />
      <div class="pulse-ring pulse-ring--2" />
      <div class="spinner-wrap">
        <ProgressSpinner style="width:52px;height:52px" stroke-width="3" />
      </div>
      <div class="state-text">
        <h3 class="state-title">جارٍ توليد التقرير…</h3>
        <p class="state-subtitle">يرجى الانتظار، قد يستغرق هذا بضع ثوانٍ</p>
      </div>
      <div class="loading-dots">
        <span /><span /><span />
      </div>
    </div>

    <!-- ── الحالة: تم التوليد ── -->
    <div v-else-if="state === 'done'" class="state-card done-card">
      <div class="done-bg-glow" />
      <div class="state-icon done-icon">
        <i class="pi pi-check-circle" />
      </div>
      <div class="state-text">
        <h3 class="state-title">تم توليد التقرير بنجاح!</h3>
        <p class="state-subtitle">التقرير جاهز للعرض والطباعة</p>
      </div>
      <div class="actions-row">
        <Button
          label="عرض التقرير"
          icon="pi pi-eye"
          size="large"
          class="view-btn"
          @click="openReport"
        />
        <Button
          label="إعادة التوليد"
          icon="pi pi-refresh"
          size="large"
          severity="secondary"
          outlined
          :loading="loading"
          class="regen-btn"
          @click="generateReport"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button          from 'primevue/button'
import Message         from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast }    from 'primevue/usetoast'
import { useRouter }   from 'vue-router'
import reportService   from '../../../report/reportService'

// ─── Props ────────────────────────────────────────────────────────────────
const props = defineProps<{
  id: number
  purchaseRequest?: any
}>()

// ─── State ────────────────────────────────────────────────────────────────
type UIState = 'idle' | 'loading' | 'done'

const state    = ref<UIState>('idle')
const loading  = ref(false)
const error    = ref('')
const reportId = ref<number | null>(null)

const toast  = useToast()
const router = useRouter()

// ─── Generate ─────────────────────────────────────────────────────────────
const generateReport = async () => {
  if (!props.id) return

  error.value   = ''
  loading.value = true
  state.value   = 'loading'

  try {
    const res = await reportService.store({
      purchase_request_id: props.id,
      report_type: 'full_review',
    })

    reportId.value = res.report?.id ?? null
    state.value    = 'done'
    toast.add({ severity: 'success', summary: 'تم', detail: 'تم توليد التقرير بنجاح', life: 3000 })
  } catch (err: any) {
    error.value  = err?.response?.data?.message ?? 'حدث خطأ أثناء توليد التقرير'
    state.value  = 'idle'
    toast.add({ severity: 'error', summary: 'خطأ', detail: error.value, life: 4000 })
  } finally {
    loading.value = false
  }
}

// ─── Open Report ──────────────────────────────────────────────────────────
const openReport = () => {
  if (reportId.value) {
    router.push(`/reportsPrint/${reportId.value}`)
  }
}

// ─── Check existing report on mount ───────────────────────────────────────
onMounted(async () => {
  if (!props.id) return
  try {
    const res  = await reportService.getAll({ purchase_request_id: props.id })
    const list = res.data?.data ?? res.data ?? []
    if (Array.isArray(list) && list.length > 0) {
      reportId.value = list[0].id
      state.value    = 'done'
    }
  } catch {
    // لا يوجد تقرير سابق — يبقى idle
  }
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════
   Container
══════════════════════════════════════════════════ */
.print-report-container {
  padding: 2rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ══════════════════════════════════════════════════
   Base State Card
══════════════════════════════════════════════════ */
.state-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  width: 100%;
  max-width: 460px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.state-card:hover {
  transform: translateY(-2px);
}

/* ── Idle Card ── */
.idle-card {
  background: var(--surface-card, #ffffff);
  border: 1.5px solid var(--surface-border, #e2e8f0);
  box-shadow:
    0 4px 6px -1px rgba(0,0,0,.04),
    0 10px 30px -8px rgba(0,0,0,.08);
}

/* ── Loading Card ── */
.loading-card {
  background: var(--surface-card, #ffffff);
  border: 1.5px solid var(--primary-100, #e0f2fe);
  box-shadow: 0 8px 40px -10px rgba(99,102,241,.15);
}

/* ── Done Card ── */
.done-card {
  background: var(--surface-card, #ffffff);
  border: 1.5px solid var(--green-200, #bbf7d0);
  box-shadow:
    0 4px 6px -1px rgba(0,0,0,.04),
    0 10px 40px -8px rgba(34,197,94,.14);
}

/* ══════════════════════════════════════════════════
   Decorative BG Shapes
══════════════════════════════════════════════════ */
.card-bg-shape {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--primary-400, #f59e0b) 10%, transparent), transparent 70%);
  pointer-events: none;
}

.done-bg-glow {
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--green-400, #4ade80) 18%, transparent), transparent 70%);
  pointer-events: none;
}

/* ══════════════════════════════════════════════════
   Icons
══════════════════════════════════════════════════ */
.state-icon {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.1rem;
  position: relative;
  z-index: 1;
  transition: transform 0.25s ease;
}

.state-card:hover .state-icon {
  transform: scale(1.06);
}

.idle-icon {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--primary-400, #f59e0b) 18%, transparent),
    color-mix(in srgb, var(--primary-600, #d97706) 8%, transparent)
  );
  color: var(--primary-600, #d97706);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--primary-500, #f59e0b) 25%, transparent);
}

.done-icon {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--green-400, #4ade80) 20%, transparent),
    color-mix(in srgb, var(--green-600, #16a34a) 10%, transparent)
  );
  color: var(--green-600, #16a34a);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--green-500, #22c55e) 28%, transparent);
}

/* ══════════════════════════════════════════════════
   Text
══════════════════════════════════════════════════ */
.state-text {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
  z-index: 1;
}

.state-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color, #0f172a);
  letter-spacing: -0.01em;
}

.state-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary, #64748b);
  line-height: 1.6;
}

/* ══════════════════════════════════════════════════
   Loading Animations
══════════════════════════════════════════════════ */
.spinner-wrap {
  position: relative;
  z-index: 1;
}

/* Pulse rings behind spinner */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--primary-400, #6366f1) 30%, transparent);
  animation: pulse-expand 2s ease-out infinite;
  pointer-events: none;
}

.pulse-ring--2 {
  animation-delay: 0.7s;
}

@keyframes pulse-expand {
  0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}

/* Loading dots */
.loading-dots {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.loading-dots span {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary-400, #6366f1);
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%            { transform: scale(1.1); opacity: 1; }
}

/* ══════════════════════════════════════════════════
   Buttons
══════════════════════════════════════════════════ */
.generate-btn {
  margin-top: 0.25rem;
  min-width: 190px;
  position: relative;
  z-index: 1;
}

.actions-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.25rem;
  position: relative;
  z-index: 1;
}

.view-btn  { min-width: 160px; }
.regen-btn { min-width: 155px; }

/* ══════════════════════════════════════════════════
   Error Message
══════════════════════════════════════════════════ */
.error-msg {
  width: 100%;
  max-width: 460px;
  border-radius: 12px;
}

/* ══════════════════════════════════════════════════
   Responsive
══════════════════════════════════════════════════ */
@media (max-width: 480px) {
  .state-card {
    padding: 2.25rem 1.5rem;
  }
  .actions-row {
    flex-direction: column;
    width: 100%;
  }
  .view-btn,
  .regen-btn,
  .generate-btn {
    width: 100%;
    min-width: unset;
  }
}
</style>