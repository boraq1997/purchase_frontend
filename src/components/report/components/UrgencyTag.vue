<template>
    <Tag :value="label" :severity="severity" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
const props = defineProps<{ level: string; label: string }>()
const severity = computed(() => ({
    critical: 'danger',
    high:     'danger',
    medium:   'warning',
    low:      'success',
}[props.level] ?? 'secondary'))
</script>