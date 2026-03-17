<template>
    <Tag :value="label" :severity="severity" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
const props = defineProps<{ decision: string; label: string }>()
const severity = computed(() => ({
    approved: 'success',
    rejected: 'danger',
    pending:  'warning',
}[props.decision] ?? 'secondary'))
</script>