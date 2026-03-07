<template>
    <div class="surface-card border-round-xl p-4 shadow-1 border-1 border-200 mb-5">
        <div class="flex gap-3 flex-wrap align-items-center">
            <div class="flex-1" style="min-width:200px">
                <IconField>
                    <InputIcon class="fas fa-search"/>
                    <InputText
                        :modelValue="modelValue.search"
                        @update:modelValue="emit('update:modelValue', { ...modelValue, search: $event })"
                        placeholder="بحث برقم المرجع أو العنوان..."
                        class="w-full border-round-lg"
                    />
                </IconField>
            </div>
            <Select
                :modelValue="modelValue.status"
                @update:modelValue="emit('update:modelValue', { ...modelValue, status: $event })"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="كل الحالات"
                showClear
                class="border-round-lg"
                style="min-width:160px"
            >
                <template #option="{ option }">
                    <div class="flex align-items-center gap-2">
                        <i :class="option.icon" :style="{ color: option.color }"/>
                        <span>{{ option.label }}</span>
                    </div>
                </template>
                <template #value="{ value }">
                    <div v-if="value" class="flex align-items-center gap-2">
                        <i :class="statusOptions.find(o => o.value === value)?.icon"
                           :style="{ color: statusOptions.find(o => o.value === value)?.color }"/>
                        <span>{{ statusOptions.find(o => o.value === value)?.label }}</span>
                    </div>
                    <span v-else class="text-400">كل الحالات</span>
                </template>
            </Select>
            <Button
                icon="fas fa-rotate-right"
                severity="secondary"
                variant="outlined"
                v-tooltip.top="'إعادة تعيين'"
                class="border-round-lg"
                @click="emit('reset')"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

defineProps<{
    modelValue: {
        search: string;
        status: string | null;
        date_from: any;
        date_to: any;
    };
}>();

const emit = defineEmits<{
    'update:modelValue': [value: any];
    'reset': [];
}>();

const statusOptions = [
    { label: 'جارية',  value: 'in_progress', icon: 'fas fa-spinner',      color: '#f59e0b' },
    { label: 'مكتملة', value: 'completed',   icon: 'fas fa-circle-check', color: '#22c55e' },
    { label: 'ملغاة',  value: 'cancelled',   icon: 'fas fa-circle-xmark', color: '#ef4444' },
];
</script>