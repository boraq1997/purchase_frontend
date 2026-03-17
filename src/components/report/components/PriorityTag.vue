<template>
    <Tag :value="label" :severity="severity" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
const props = defineProps<{ priority: string; label: string }>()
const severity = computed(() => ({
    high:     'danger',
    critical: 'danger',
    medium:   'warning',
    low:      'success',
}[props.priority] ?? 'secondary'))
</script>