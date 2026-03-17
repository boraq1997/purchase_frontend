<!-- AvailabilityTag.vue -->
<template>
    <Tag :value="label" :severity="severity" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
const props = defineProps<{ availability: string; label: string }>()
const severity = computed(() => ({
    available:   'success',
    partial:     'warning',
    unavailable: 'danger',
}[props.availability] ?? 'secondary'))
</script>