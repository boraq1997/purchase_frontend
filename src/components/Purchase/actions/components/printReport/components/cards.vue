<!-- components/PurchaseRequest/StatisticsCards.vue -->

<template>
  <div class="statistics-grid">
    <div 
      v-for="(stat, index) in statisticsData" 
      :key="index"
      class="stat-card"
      :class="`stat-card--${stat.color}`"
      :style="{ '--delay': `${index * 0.1}s` }"
    >
      <div class="stat-card__icon">
        <i :class="stat.icon"></i>
      </div>
      <div class="stat-card__content">
        <p class="stat-card__label">{{ stat.label }}</p>
        <h3 class="stat-card__value">{{ stat.value }}</h3>
      </div>
      <div class="stat-card__decoration"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Statistics } from '../types';

interface Props {
  statistics: Statistics;
}

const props = defineProps<Props>();

const statisticsData = computed(() => [
  {
    label: 'عدد العناصر',
    value: props.statistics.totalItems,
    icon: 'pi pi-box',
    color: 'blue'
  },
  {
    label: 'التكلفة المقدرة',
    value: props.statistics.totalEstimatedCost,
    icon: 'pi pi-dollar',
    color: 'green'
  },
  {
    label: 'عدد العروض',
    value: props.statistics.estimatesCount,
    icon: 'pi pi-file',
    color: 'orange'
  },
  {
    label: 'عمليات الشراء',
    value: props.statistics.procurementsCount,
    icon: 'pi pi-shopping-cart',
    color: 'purple'
  }
]);
</script>

<style scoped lang="scss">
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.6s ease-out backwards;
  animation-delay: var(--delay);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }

  &__decoration {
    position: absolute;
    top: -30px;
    right: -30px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    opacity: 0.05;
    transition: all 0.4s ease;
  }

  &:hover &__decoration {
    transform: scale(1.2);
    opacity: 0.08;
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    flex-shrink: 0;
    transition: all 0.3s ease;

    i {
      transition: transform 0.3s ease;
    }
  }

  &:hover &__icon i {
    transform: scale(1.1) rotate(-5deg);
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #64748b;
    margin: 0 0 0.5rem 0;
    letter-spacing: 0.02em;
  }

  &__value {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    color: #1e293b;
    letter-spacing: -0.02em;
  }

  // Color variants
  &--blue {
    .stat-card__icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .stat-card__decoration {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }

  &--green {
    .stat-card__icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    .stat-card__decoration {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
  }

  &--orange {
    .stat-card__icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }
    .stat-card__decoration {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
  }

  &--purple {
    .stat-card__icon {
      background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
      color: white;
    }
    .stat-card__decoration {
      background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .statistics-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
    flex-direction: column;
    text-align: center;

    &__icon {
      width: 56px;
      height: 56px;
      font-size: 1.5rem;
    }

    &__value {
      font-size: 1.5rem;
    }
  }
}
</style>