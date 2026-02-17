<!-- components/PurchaseRequest/ReportCard.vue -->

<template>
  <div class="report-section" v-if="report">
    <div class="section-header">
      <div class="section-title">
        <i class="pi pi-chart-bar"></i>
        <h2>التقرير النهائي</h2>
      </div>
      <span class="report-date">
        <i class="pi pi-calendar"></i>
        {{ report.generatedAt }}
      </span>
    </div>

    <div class="report-content">
      <div class="report-block summary">
        <div class="block-header">
          <i class="pi pi-file-edit"></i>
          <h3>ملخص التقرير</h3>
        </div>
        <div class="block-body">
          <p>{{ report.parsedData.summary }}</p>
        </div>
      </div>

      <div class="report-block recommendations">
        <div class="block-header">
          <i class="pi pi-lightbulb"></i>
          <h3>التوصيات</h3>
        </div>
        <div class="block-body">
          <p>{{ report.parsedData.recommendations }}</p>
        </div>
      </div>
    </div>

    <div class="report-footer">
      <div class="report-type">
        <i class="pi pi-tag"></i>
        <span>نوع التقرير: {{ formatReportType(report.report_type) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Report, ReportData } from '@/types/purchase-request.types';

interface Props {
  report: Report & { parsedData: ReportData; generatedAt: string };
}

defineProps<Props>();

const formatReportType = (type: string): string => {
  const types: Record<string, string> = {
    'procurement_recommendation': 'توصية الشراء',
    'needs_assessment': 'تقييم الاحتياجات',
    'warehouse_review': 'مراجعة المخزون',
    'financial_analysis': 'تحليل مالي'
  };
  return types[type] || type;
};
</script>

<style scoped lang="scss">
.report-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.section-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  i {
    font-size: 1.5rem;
    color: #a78bfa;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
}

.report-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 10px;

  i {
    font-size: 0.9rem;
  }
}

.report-content {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.report-block {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
  }

  &.summary {
    .block-header i {
      color: #60a5fa;
    }
  }

  &.recommendations {
    .block-header i {
      color: #fbbf24;
    }
  }
}

.block-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  i {
    font-size: 1.25rem;
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
}

.block-body {
  p {
    margin: 0;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
  }
}

.report-footer {
  position: relative;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.report-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.7;

  i {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .report-section {
    padding: 1.25rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .report-content {
    grid-template-columns: 1fr;
  }
}
</style>