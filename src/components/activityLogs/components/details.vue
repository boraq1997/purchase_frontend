<template>
  <Dialog 
            v-model:visible="showDetailsDialog" 
            modal 
            maximizable
            class="audit-details-dialog modern-tailwind-theme"
            dir="rtl"
        >
            <template #header>
                <div class="header-container w-full relative p-4 overflow-hidden border-round-top-2xl">                    
                    <div class="flex align-items-center justify-content-between relative z-1">
                        <div class="flex align-items-center gap-3">
                            <div class="header-icon shadow-lg">
                                <i class="fas fa-file-alt text-white text-xl"></i>
                            </div>
                            <div>
                                <h3 class="m-0 text-xl font-bold text-900">تفاصيل سجل النشاط</h3>
                                <p class="m-0 text-sm text-600 mt-1">معلومات كاملة عن الإجراء المنفذ</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </template>

    <div v-if="selectedLog" class="p-4 custom-scrollbar overflow-y-auto" style="max-height: 70vh;">
        
        <div class="grid mb-4">
            <div class="col-12 md:col-4">
                <div class="info-stat-card border-1 border-200 shadow-sm p-3 border-round-xl flex align-items-center gap-3">
                    <div :class="['stat-icon-box', getStatusStyles(selectedLog.status).bg]">
                        <i :class="['fas fa-check-circle', getStatusStyles(selectedLog.status).text]"></i>
                    </div>
                    <div>
                        <p class="m-0 text-xs text-500">الحالة</p>
                        <p :class="['m-0 font-bold mt-1', getStatusStyles(selectedLog.status).text]">{{ selectedLog.status }}</p>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="info-stat-card border-1 border-200 shadow-sm p-3 border-round-xl flex align-items-center gap-3">
                    <div :class="['stat-icon-box', getSeverityStyles(selectedLog.severity).bg]">
                        <i :class="['fas fa-exclamation-triangle', getSeverityStyles(selectedLog.severity).text]"></i>
                    </div>
                    <div>
                        <p class="m-0 text-xs text-500">الخطورة</p>
                        <p class="m-0 font-bold text-900 mt-1">{{ getSeverityLabel(selectedLog.severity) }}</p>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="info-stat-card border-1 border-200 shadow-sm p-3 border-round-xl flex align-items-center gap-3">
                    <div class="stat-icon-box bg-purple-100">
                        <i class="fas fa-cube text-purple-600"></i>
                    </div>
                    <div>
                        <p class="m-0 text-xs text-500">الموديول</p>
                        <p class="m-0 font-bold text-900 mt-1">{{ selectedLog.module }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-column gap-4">
            <section class="glass-section action-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-primary text-primary-contrast"><i class="fas fa-tasks text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">معلومات الإجراء</h4>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-6 lg:col-4">
                        <div class="data-item">
                            <span class="label text-purple-600">الإجراء</span>
                            <p class="value">{{ selectedLog.action_label }}</p>
                        </div>
                    </div>
                    <div class="col-12 md:col-6 lg:col-4">
                        <div class="data-item">
                            <span class="label text-purple-600">الكود</span>
                            <p class="value font-mono">{{ selectedLog.action }}</p>
                        </div>
                    </div>
                    <div class="col-12 lg:col-4">
                        <div class="data-item">
                            <span class="label text-purple-600">التاريخ</span>
                            <p class="value flex align-items-center gap-2">
                                <i class="far fa-calendar-alt text-purple-400"></i>
                                {{ formatFullDate(selectedLog.created_at) }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="glass-section user-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-blue-600"><i class="fas fa-user text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">المستخدم</h4>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-6 lg:col-3"><div class="data-item"><span class="label text-blue-600">الاسم</span><p class="value">{{ selectedLog.actor_name }}</p></div></div>
                    <div class="col-12 md:col-6 lg:col-3"><div class="data-item"><span class="label text-blue-600">الدور</span><Tag :value="selectedLog.actor_role" class="bg-blue-100 text-blue-800 border-none px-3 font-bold" /></div></div>
                    <div class="col-12 md:col-6 lg:col-3"><div class="data-item"><span class="label text-blue-600">النوع</span><p class="value text-sm">{{ selectedLog.actor_type }}</p></div></div>
                    <div class="col-12 md:col-6 lg:col-3"><div class="data-item"><span class="label text-blue-600">ID</span><p class="value font-mono text-xs">{{ selectedLog.actor_id }}</p></div></div>
                </div>
            </section>

            <section class="glass-section subject-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-green-600"><i class="fas fa-bullseye text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">الهدف</h4>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-4"><div class="data-item"><span class="label text-green-600">النوع</span><p class="value">{{ selectedLog.subject_type }}</p></div></div>
                    <div class="col-12 md:col-4"><div class="data-item"><span class="label text-green-600">ID</span><p class="value font-mono text-xs">{{ selectedLog.subject_id || '—' }}</p></div></div>
                    <div class="col-12 md:col-4"><div class="data-item"><span class="label text-green-600">المعرّف</span><p class="value font-mono text-xs">{{ selectedLog.subject_identifier || '—' }}</p></div></div>
                </div>
            </section>

            <section class="glass-section request-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-orange-600"><i class="fas fa-globe text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">الطلب</h4>
                </div>
                <div class="grid">
                    <div class="col-12 md:col-8"><div class="data-item"><span class="label text-orange-600">Route</span><p class="value font-mono text-xs break-all">{{ selectedLog.route }}</p></div></div>
                    <div class="col-12 md:col-4"><div class="data-item"><span class="label text-orange-600">Method</span><Tag :value="selectedLog.method" class="bg-orange-100 text-orange-800 border-none font-bold" /></div></div>
                </div>
            </section>

            <section v-if="selectedLog.metadata" class="glass-section meta-theme">
                <div class="flex align-items-center gap-2 mb-3">
                    <div class="section-badge bg-indigo-600"><i class="fas fa-box text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">بيانات إضافية</h4>
                </div>
                <div class="json-code-box indigo-box">
                    <pre class="m-0 text-xs">{{ selectedLog.metadata }}</pre>
                </div>
            </section>

            <section v-if="selectedLog.old_values || selectedLog.new_values" class="glass-section changes-theme">
                <div class="flex align-items-center gap-2 mb-4">
                    <div class="section-badge bg-pink-600"><i class="fas fa-exchange-alt text-white text-xs"></i></div>
                    <h4 class="m-0 font-bold section-title">التغييرات</h4>
                </div>

                <div class="grid">
                    <div v-if="selectedLog.old_values" class="col-12 md:col-12">
                        <div class="flex align-items-center gap-2 mb-2">
                            <span class="text-xs font-bold text-red-600 uppercase">القيم القديمة</span>
                            <div class="flex-grow-1 border-bottom-1 border-red-800"></div>
                        </div>
                        <div class="json-code-box red-box">
                            <pre class="m-0 text-xs">{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
                        </div>
                    </div>

                    <div v-if="selectedLog.new_values" class="col-12 md:col-12">
                        <div class="flex align-items-center gap-2 mb-2">
                            <span class="text-xs font-bold text-green-600 uppercase">القيم الجديدة</span>
                            <div class="flex-grow-1 border-bottom-1 border-green-800"></div>
                        </div>
                        <div class="json-code-box green-box">
                            <pre class="m-0 text-xs">{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <template #footer>
        <div class="flex align-items-center justify-content-between w-full p-3 border-round-bottom-2xl border-top-1 border-200">
            <span class="text-xs text-500 font-mono italic">Log ID: {{ selectedLog?.id }}</span>
            <Button @click="showDetailsDialog = false" class="modern-gradient-btn">
                <i class="fas fa-check ml-2"></i>
                إغلاق النافذة
            </Button>
        </div>
    </template>
</Dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const props = defineProps<{
  modelValue: boolean;
  selectedLog: Record<string, any> | null;
}>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const showDetailsDialog = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
});

// Helper functions - مضافة هنا بدلاً من activity.vue
const getStatusStyles = (status: string) => ({
  bg: status === 'success' ? 'bg-green-100' : status === 'failed' ? 'bg-red-100' : 'bg-yellow-100',
  text: status === 'success' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : 'text-yellow-600',
});

const getSeverityStyles = (sev: string) => ({
  bg: sev === 'danger' ? 'bg-red-100' : sev === 'warning' ? 'bg-yellow-100' : 'bg-blue-100',
  text: sev === 'danger' ? 'text-red-600' : sev === 'warning' ? 'text-yellow-600' : 'text-blue-600',
});

const getSeverityLabel = (severity: string): string => {
  const labels: Record<string, string> = {
    info: 'معلومات', warning: 'تحذير', error: 'خطأ', critical: 'حرج', debug: 'تصحيح',
  };
  return labels[severity] ?? severity;
};

const formatFullDate = (d?: string): string => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-IQ', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   DESIGN TOKENS — Dark Dashboard Theme
═══════════════════════════════════════════════ */
:deep(.ald-root) {
  --clr-bg-900:   #0b0e18;
  --clr-bg-800:   #111422;
  --clr-bg-750:   #141829;
  --clr-bg-700:   #181d30;
  --clr-bg-600:   #1e2438;
  --clr-bg-500:   #252c44;
  --clr-surface:  #1a1f35;
  --clr-border:   rgba(99,120,200,.18);
  --clr-border2:  rgba(99,120,200,.10);

  --clr-txt-100:  #f0f4ff;
  --clr-txt-200:  #c8d0ea;
  --clr-txt-300:  #8b96bc;
  --clr-txt-400:  #5c6687;

  --clr-accent:   #6478f0;
  --clr-accent2:  #4a9eff;
  --clr-accent-glow: rgba(100,120,240,.3);

  --clr-success:  #22d3a0;
  --clr-warning:  #f5b942;
  --clr-error:    #f05555;
  --clr-info:     #4a9eff;
  --clr-critical: #e040fb;
  --clr-debug:    #78e8c8;

  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --radius-xl:  22px;

  --font-display: 'Cairo', 'Almarai', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;
  --font-ui:      'IBM Plex Sans Arabic', 'Cairo', system-ui, sans-serif;

  background: var(--clr-bg-800) !important;
  border: 1px solid var(--clr-border) !important;
  border-radius: var(--radius-xl) !important;
  box-shadow:
    0 0 0 1px rgba(100,120,240,.12),
    0 40px 80px rgba(0,0,0,.7),
    0 0 120px rgba(100,120,240,.08) !important;
  overflow: hidden;
  font-family: var(--font-ui);
}

/* ══ PrimeVue slot resets ══ */
:deep(.ald-hslot) { padding: 0 !important; border-bottom: none !important; }
:deep(.ald-cslot) { padding: 0 !important; background: var(--clr-bg-800) !important; }
:deep(.ald-fslot) { padding: 0 !important; border-top: 1px solid var(--clr-border) !important; background: var(--clr-bg-900) !important; }

/* ═══════════════════════════════════════════════
   BANNER / HEADER
═══════════════════════════════════════════════ */
.ald-banner {
  position: relative;
  padding: 32px 36px 28px;
  background: linear-gradient(135deg, #0d1020 0%, #131828 55%, #161c2e 100%);
  overflow: hidden;
  min-height: 160px;
}

/* Status tint overlay */
.ald-banner[data-status="success"] { --banner-accent: var(--clr-success); }
.ald-banner[data-status="failed"]  { --banner-accent: var(--clr-error); }
.ald-banner[data-status="error"]   { --banner-accent: var(--clr-error); }
.ald-banner[data-status="pending"] { --banner-accent: var(--clr-warning); }
.ald-banner { --banner-accent: var(--clr-accent); }

.ald-banner::before {
  content:'';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 600px 300px at 0% 100%, rgba(var(--banner-accent-rgb,100,120,240),.08) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Geometric BG ── */
.ald-geo { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

.geo-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(100,120,240,.12);
}
.geo-c1 {
  width: 320px; height: 320px;
  top: -160px; right: -80px;
  background: radial-gradient(circle, rgba(100,120,240,.06) 0%, transparent 65%);
}
.geo-c2 {
  width: 180px; height: 180px;
  bottom: -90px; left: 120px;
  border-color: rgba(34,211,160,.1);
  background: radial-gradient(circle, rgba(34,211,160,.04) 0%, transparent 65%);
}

.geo-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(100,120,240,.08);
}
.geo-ring1 {
  width: 440px; height: 440px;
  top: -220px; right: -120px;
}

.geo-rect {
  position: absolute;
  border: 1px solid rgba(100,120,240,.08);
  transform: rotate(22deg);
  border-radius: 4px;
}
.geo-r1 { width: 90px; height: 90px; bottom: -30px; left: 340px; }

.geo-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(100,120,240,.18), transparent);
  height: 1px;
}
.geo-l1 { width: 100%; top: 48px; left: 0; }
.geo-l2 { width: 60%; bottom: 36px; right: 0; opacity: .5; }

.geo-dot-grid {
  position: absolute;
  left: 30px; bottom: 0;
  width: 200px; height: 160px;
  background-image: radial-gradient(circle, rgba(100,120,240,.18) 1px, transparent 1px);
  background-size: 18px 18px;
  mask-image: linear-gradient(135deg, transparent 20%, black 60%, transparent 100%);
}

.geo-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,.03) 2px,
    rgba(0,0,0,.03) 4px
  );
  pointer-events: none;
}

/* ── Banner layout ── */
.ald-banner-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.ald-banner-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
}

.ald-big-id {
  font-family: var(--font-mono);
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  color: transparent;
  background: linear-gradient(145deg, rgba(100,120,240,.5) 0%, rgba(100,120,240,.08) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  letter-spacing: -2px;
  user-select: none;
  flex-shrink: 0;
}

.ald-banner-text { flex: 1; min-width: 0; }

.ald-banner-overline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.ald-overline-pulse {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--clr-accent2);
  box-shadow: 0 0 0 3px rgba(74,158,255,.2);
  animation: pulse 2s ease infinite;
  flex-shrink: 0;
}
.ald-overline-txt {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--clr-txt-400);
}

.ald-banner-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--clr-txt-100);
  margin: 0 0 10px;
  line-height: 1.3;
}

.ald-banner-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.ald-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .03em;
}
.ald-tag-module {
  background: rgba(100,120,240,.15);
  color: #8fa3ff;
  border: 1px solid rgba(100,120,240,.25);
}
.ald-tag-action {
  background: rgba(74,158,255,.12);
  color: var(--clr-accent2);
  border: 1px solid rgba(74,158,255,.2);
  font-family: var(--font-mono);
}
.ald-tag-live {
  background: rgba(34,211,160,.12);
  color: var(--clr-success);
  border: 1px solid rgba(34,211,160,.25);
  animation: fadePulse 2s ease infinite;
}
.live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--clr-success);
  animation: pulse 1.5s ease infinite;
}

/* ── Right blocks ── */
.ald-banner-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.ald-status-block,
.ald-sev-block {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  min-width: 140px;
  border: 1px solid;
  backdrop-filter: blur(8px);
  transition: all .2s;
}
.ald-status-block:hover, .ald-sev-block:hover { transform: translateX(-2px); }

.sb-success { background: rgba(34,211,160,.1); border-color: rgba(34,211,160,.25); color: var(--clr-success); }
.sb-failed, .sb-error { background: rgba(240,85,85,.1); border-color: rgba(240,85,85,.25); color: var(--clr-error); }
.sb-pending { background: rgba(245,185,66,.1); border-color: rgba(245,185,66,.25); color: var(--clr-warning); }

.sev-info { background: rgba(74,158,255,.1); border-color: rgba(74,158,255,.25); color: var(--clr-info); }
.sev-warning { background: rgba(245,185,66,.1); border-color: rgba(245,185,66,.25); color: var(--clr-warning); }
.sev-error { background: rgba(240,85,85,.1); border-color: rgba(240,85,85,.25); color: var(--clr-error); }
.sev-critical { background: rgba(224,64,251,.1); border-color: rgba(224,64,251,.25); color: var(--clr-critical); }
.sev-debug { background: rgba(120,232,200,.1); border-color: rgba(120,232,200,.2); color: var(--clr-debug); }

.ald-status-block .fas, .ald-sev-block .fas { font-size: 15px; }
.ald-status-block-text { display: flex; flex-direction: column; gap: 1px; }
.sb-label { font-size: 9px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
.sb-value { font-size: 12px; font-weight: 700; }

.ald-time-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-md);
}
.ald-time-rel {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--clr-accent);
  min-width: 32px;
  text-align: center;
}
.ald-time-abs {
  font-size: 11px;
  color: var(--clr-txt-300);
}

/* ═══════════════════════════════════════════════
   BODY
═══════════════════════════════════════════════ */
.ald-body {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--clr-bg-800);
}

.ald-scrollbar {
  max-height: calc(100vh - 340px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(100,120,240,.3) transparent;
}
.ald-scrollbar::-webkit-scrollbar { width: 5px; }
.ald-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100,120,240,.3);
  border-radius: 10px;
}

/* ══ ROW HERO ══ */
.ald-row-hero {
  display: grid;
  grid-template-columns: 1fr 64px 1fr;
  gap: 0;
  align-items: stretch;
}

/* ── Actor section ── */
.ald-actor-section,
.ald-request-section {
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  transition: border-color .2s;
}
.ald-actor-section:hover,
.ald-request-section:hover {
  border-color: rgba(100,120,240,.3);
}

.als-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.als-num {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--clr-accent);
  letter-spacing: .05em;
  opacity: .7;
}
.als-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--clr-txt-300);
}
.als-header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--clr-border), transparent);
}

.als-body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.als-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.als-avatar {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2a3060, #1e2545);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 800;
  color: var(--clr-accent);
  position: relative;
  z-index: 1;
}
.als-avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 17px;
  border: 1.5px solid rgba(100,120,240,.35);
  animation: spin 8s linear infinite;
}
.als-avatar-glow {
  position: absolute;
  inset: -8px;
  border-radius: 22px;
  background: radial-gradient(circle, rgba(100,120,240,.15) 0%, transparent 70%);
}

.als-info { flex: 1; min-width: 0; }
.als-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--clr-txt-100);
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.als-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.als-role-chip {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .04em;
}
.role-admin   { background: rgba(224,64,251,.15); color: var(--clr-critical); border: 1px solid rgba(224,64,251,.25); }
.role-manager { background: rgba(245,185,66,.12); color: var(--clr-warning); border: 1px solid rgba(245,185,66,.2); }
.role-user    { background: rgba(74,158,255,.12); color: var(--clr-info); border: 1px solid rgba(74,158,255,.2); }
.role-system  { background: rgba(34,211,160,.1); color: var(--clr-success); border: 1px solid rgba(34,211,160,.2); }
.role-default { background: rgba(140,150,188,.1); color: var(--clr-txt-300); border: 1px solid rgba(140,150,188,.15); }

.als-type {
  font-size: 10px;
  color: var(--clr-txt-400);
  font-family: var(--font-mono);
}

.als-id-badge {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--clr-txt-300);
  background: var(--clr-bg-600);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  flex-shrink: 0;
}
.id-hash { color: var(--clr-accent); }

/* ── Arrow connector ── */
.ald-arrow-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
}
.aac-glow {
  position: absolute;
  width: 40px; height: 40px;
  background: radial-gradient(circle, rgba(100,120,240,.2), transparent 70%);
  border-radius: 50%;
}
.aac-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, transparent, rgba(100,120,240,.4), transparent);
  position: relative;
  overflow: hidden;
}
.aac-dots {
  position: absolute;
  width: 100%;
  height: 10px;
  background: linear-gradient(180deg, transparent 0%, var(--clr-accent) 50%, transparent 100%);
  animation: flow 2s ease infinite;
}
.aac-arrowhead {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--clr-bg-600);
  border: 1px solid rgba(100,120,240,.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--clr-accent);
  font-size: 9px;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(100,120,240,.25);
}
.aac-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--clr-txt-400);
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* ── Request section ── */
.ald-req-body { display: flex; flex-direction: column; gap: 12px; }

.ald-req-url-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--clr-bg-700);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  overflow: hidden;
}

.ald-method {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: .05em;
  flex-shrink: 0;
}
.method-get    { background: rgba(34,211,160,.15); color: var(--clr-success); }
.method-post   { background: rgba(74,158,255,.15); color: var(--clr-info); }
.method-put    { background: rgba(245,185,66,.15); color: var(--clr-warning); }
.method-patch  { background: rgba(245,185,66,.1); color: var(--clr-warning); }
.method-delete { background: rgba(240,85,85,.15); color: var(--clr-error); }

.ald-req-path {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--clr-txt-200);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: ltr;
}

.rsd-inner {
  width: 8px; height: 8px;
  border-radius: 50%;
}
.rsd-success { background: var(--clr-success); box-shadow: 0 0 6px var(--clr-success); }
.rsd-failed, .rsd-error { background: var(--clr-error); box-shadow: 0 0 6px var(--clr-error); }
.rsd-pending { background: var(--clr-warning); box-shadow: 0 0 6px var(--clr-warning); }

.ald-req-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.armg-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  background: var(--clr-bg-700);
  border: 1px solid var(--clr-border2);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.armg-icon { color: var(--clr-accent); font-size: 10px; flex-shrink: 0; }
.armg-k { font-size: 10px; color: var(--clr-txt-400); flex-shrink: 0; }
.armg-v {
  font-size: 11px;
  font-weight: 600;
  color: var(--clr-txt-200);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: auto;
}
.armg-mono { font-family: var(--font-mono); }

/* ═══════════════════════════════════════════════
   TERMINAL CARD
═══════════════════════════════════════════════ */
.ald-terminal-card {
  background: #090c14;
  border: 1px solid rgba(100,120,240,.2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.04);
}

.atc-titlebar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #0d1020;
  border-bottom: 1px solid rgba(100,120,240,.15);
}
.atc-dots { display: flex; gap: 6px; }
.atd {
  width: 10px; height: 10px;
  border-radius: 50%;
  cursor: default;
}
.atd-r { background: #ff5f57; box-shadow: 0 0 4px rgba(255,95,87,.4); }
.atd-y { background: #febc2e; box-shadow: 0 0 4px rgba(254,188,46,.4); }
.atd-g { background: #28c840; box-shadow: 0 0 4px rgba(40,200,64,.4); }

.atc-title-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--clr-txt-400);
}
.atc-title-center .fas { font-size: 10px; color: var(--clr-accent); }
.atc-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--clr-accent);
  background: rgba(100,120,240,.12);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(100,120,240,.2);
}

.atc-body { padding: 16px 20px; }

.atc-parsed-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
}
.atc-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: background .15s;
  direction: ltr;
}
.atc-row:hover { background: rgba(100,120,240,.06); }
.atc-row-num {
  font-size: 9px;
  color: rgba(140,150,180,.3);
  width: 20px;
  flex-shrink: 0;
  text-align: right;
}
.atc-key { color: #79a6dc; flex-shrink: 0; min-width: 120px; }
.atc-sep { color: rgba(140,150,180,.4); }
.val-str    { color: #a8cc8c; }
.val-num    { color: #e4b763; }
.val-bool   { color: #e06c75; }
.val-null   { color: #888; font-style: italic; }
.val-arr    { color: #c678dd; }

.atc-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
}
.atc-divider::before, .atc-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(100,120,240,.12);
}
.atc-divider-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: .15em;
  color: rgba(140,150,180,.3);
}

.atc-raw {
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(140,160,200,.55);
  background: rgba(0,0,0,.2);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  margin: 0;
  overflow-x: auto;
  line-height: 1.7;
  direction: ltr;
  scrollbar-width: thin;
  scrollbar-color: rgba(100,120,240,.2) transparent;
  border: 1px solid rgba(100,120,240,.08);
}

/* ═══════════════════════════════════════════════
   DIFF VIEWER
═══════════════════════════════════════════════ */
.ald-diff-wrap {
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.adw-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: var(--clr-bg-700);
  border-bottom: 1px solid var(--clr-border);
  flex-wrap: wrap;
}
.adw-header-left { display: flex; align-items: center; gap: 10px; }
.adw-delta {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 900;
  color: var(--clr-warning);
  text-shadow: 0 0 10px rgba(245,185,66,.4);
  line-height: 1;
}
.adw-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--clr-txt-200);
}
.adw-fields { display: flex; flex-wrap: wrap; gap: 6px; margin-right: auto; }
.adw-field {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--clr-warning);
  background: rgba(245,185,66,.1);
  border: 1px solid rgba(245,185,66,.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.adw-panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
.adw-pane { padding: 16px 20px; }
.adw-old { border-left: 1px solid var(--clr-border); background: rgba(240,85,85,.03); }
.adw-new { background: rgba(34,211,160,.03); }

.adw-pane-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--clr-txt-300);
}
.adw-pane-marker {
  width: 20px; height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
}
.adw-marker-old { background: rgba(240,85,85,.15); color: var(--clr-error); border: 1px solid rgba(240,85,85,.3); }
.adw-marker-new { background: rgba(34,211,160,.12); color: var(--clr-success); border: 1px solid rgba(34,211,160,.25); }

/* ═══════════════════════════════════════════════
   SUBJECT STRIP
═══════════════════════════════════════════════ */
.ald-subject-strip {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 20px;
  background: linear-gradient(90deg, rgba(100,120,240,.08), rgba(100,120,240,.04));
  border: 1px solid rgba(100,120,240,.2);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}
.ass-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--clr-accent);
  flex-shrink: 0;
}
.ass-fields {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}
.ass-field { display: flex; align-items: center; gap: 7px; }
.ass-k { font-size: 10px; color: var(--clr-txt-400); }
.ass-v {
  font-size: 12px;
  font-weight: 600;
  color: var(--clr-txt-200);
}
.ass-mono { font-family: var(--font-mono); }
.ass-sep {
  width: 1px; height: 20px;
  background: var(--clr-border);
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */
.ald-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.alf-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.alf-reqid,
.alf-ts {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--clr-txt-400);
}
.alf-reqid .fas, .alf-ts .fas { color: var(--clr-accent); font-size: 10px; }

.alf-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alf-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  background: transparent;
  border: 1px solid rgba(100,120,240,.35);
  border-radius: var(--radius-md);
  color: var(--clr-accent);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  font-family: var(--font-ui);
}
.alf-btn-outline:hover {
  background: rgba(100,120,240,.12);
  border-color: var(--clr-accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(100,120,240,.2);
}

.alf-btn-solid {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 22px;
  background: linear-gradient(135deg, #5060d8, #6478f0);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 4px 14px rgba(100,120,240,.3);
  font-family: var(--font-ui);
}
.alf-btn-solid:hover {
  background: linear-gradient(135deg, #6070e8, #7488ff);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(100,120,240,.45);
}
.alf-btn-solid:active { transform: translateY(0); }

/* ═══════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════ */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .6; transform: scale(.85); }
}
@keyframes fadePulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .7; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes flow {
  from { top: -10px; opacity: 0; }
  50%  { opacity: 1; }
  to   { top: 100%; opacity: 0; }
}

/* ═══════════════════════════════════════════════
   PrimeVue Dialog maximize button override
═══════════════════════════════════════════════ */
:deep(.p-dialog-maximize-icon) { color: var(--clr-txt-300) !important; }
:deep(.p-dialog-maximize-icon:hover) { color: var(--clr-accent) !important; }
:deep(.p-dialog-header-close) {
  color: var(--clr-txt-300) !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  border-radius: var(--radius-sm) !important;
  transition: all .2s !important;
}
:deep(.p-dialog-header-close:hover) {
  color: var(--clr-error) !important;
  background: rgba(240,85,85,.1) !important;
  border-color: rgba(240,85,85,.25) !important;
}
:deep(.p-dialog-mask.p-component-overlay) {
  background: rgba(5,8,18,.75) !important;
  backdrop-filter: blur(4px) !important;
}
</style>