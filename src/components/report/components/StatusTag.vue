<!-- StatusTag.vue -->
<template>
    <Tag :value="label" :severity="severity" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
const props = defineProps<{ status: string; label: string }>()
const severity = computed(() => ({
    pending:     'warning',
    approved:    'success',
    accepted:    'success',
    completed:   'success',
    in_progress: 'info',
    rejected:    'danger',
    cancelled:   'danger',
    draft:       'secondary',
}[props.status] ?? 'secondary'))
</script>