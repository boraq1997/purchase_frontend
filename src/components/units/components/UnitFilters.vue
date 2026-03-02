<template>
    <div class="flex align-items-center gap-3 flex-wrap">
        <IconField class="flex-1" iconPosition="left">
            <InputIcon class="pi pi-search" />
            <InputText
                v-model="localSearch"
                placeholder="بحث بالاسم أو الكود..."
                class="w-full"
                @input="onSearchInput"
            />
        </IconField>

        <Button
            icon="pi pi-filter-slash"
            label="مسح"
            severity="secondary"
            outlined
            :disabled="!localSearch"
            @click="clearFilters"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

interface Props {
    modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: string]
    'filter': []
}>()

const localSearch = ref(props.modelValue)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.modelValue, (val) => {
    localSearch.value = val
})

function onSearchInput() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        emit('update:modelValue', localSearch.value)
        emit('filter')
    }, 400)
}

function clearFilters() {
    if (debounceTimer) clearTimeout(debounceTimer)
    localSearch.value = ''
    emit('update:modelValue', '')
    emit('filter')
}

onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
})
</script>