<!-- InfoItem.vue -->
<template>
    <div class="flex flex-column gap-1">
        <span class="text-xs text-color-secondary font-medium uppercase" style="letter-spacing:.04em">{{ label }}</span>
        <slot>
            <span class="text-sm font-medium">{{ value ?? '—' }}</span>
        </slot>
    </div>
</template>
<script setup lang="ts">
defineProps<{ label: string; value?: string | number | null }>()
</script>