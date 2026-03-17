<template>
    <div class="financial-card surface-card border-round-lg border-1 border-200 p-3 text-center">
        <div class="flex align-items-center justify-content-center gap-2 mb-2">
            <i :class="`pi ${icon} text-${color}-500 text-lg`" />
            <span class="text-xs text-color-secondary font-medium">{{ label }}</span>
        </div>
        <div
            class="text-xl font-bold"
            :class="amountClass"
        >
            {{ formatted }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    label:    string
    amount:   number | null | undefined
    icon:     string
    color:    string
    showSign?: boolean
}>()

const formatted = computed(() => {
    if (props.amount === null || props.amount === undefined) return '—'
    const sign = props.showSign && props.amount > 0 ? '+' : ''
    return sign + new Intl.NumberFormat('ar-IQ', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(props.amount) + ' د.ع'
})

const amountClass = computed(() => {
    if (!props.showSign || props.amount === null || props.amount === undefined) return `text-${props.color}-600`
    return props.amount >= 0 ? 'text-green-600' : 'text-red-600'
})
</script>

<style scoped>
.financial-card { min-height: 80px; }
</style>