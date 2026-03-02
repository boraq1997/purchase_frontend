<template>
    <Drawer
        v-model:visible="visible"
        :header="isEdit ? 'تعديل وحدة' : 'إضافة وحدة جديدة'"
        position="right"
        class="!w-full sm:!w-36rem"
        @hide="onHide"
    >
        <template #header>
            <div class="flex align-items-center gap-2">
                <i :class="isEdit ? 'pi pi-pencil' : 'pi pi-plus-circle'" class="text-primary text-xl" />
                <span class="font-semibold text-lg">{{ isEdit ? 'تعديل وحدة' : 'إضافة وحدة جديدة' }}</span>
            </div>
        </template>

        <div class="flex flex-column gap-4 p-1">

            <!-- الاسم -->
            <div class="flex flex-column gap-2">
                <label for="unit-name" class="font-medium text-sm">
                    اسم الوحدة <span class="text-red-500">*</span>
                </label>
                <InputText
                    id="unit-name"
                    v-model="form.name"
                    placeholder="مثال: كيلوجرام"
                    :invalid="!!errors.name"
                    class="w-full"
                    autofocus
                />
                <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
            </div>

            <!-- الكود -->
            <div class="flex flex-column gap-2">
                <label for="unit-code" class="font-medium text-sm">الكود</label>
                <InputText
                    id="unit-code"
                    v-model="form.code"
                    placeholder="مثال: KG"
                    :invalid="!!errors.code"
                    class="w-full"
                />
                <small v-if="errors.code" class="text-red-500">{{ errors.code }}</small>
                <small class="text-color-secondary">سيتم تحويله إلى أحرف كبيرة تلقائياً</small>
            </div>

            <!-- الوصف -->
            <div class="flex flex-column gap-2">
                <label for="unit-description" class="font-medium text-sm">الوصف</label>
                <Textarea
                    id="unit-description"
                    v-model="form.description"
                    placeholder="وصف اختياري للوحدة..."
                    rows="3"
                    class="w-full"
                    autoResize
                />
            </div>

        </div>

        <template #footer>
            <div class="flex gap-2 justify-content-end w-full">
                <Button
                    label="إلغاء"
                    severity="secondary"
                    outlined
                    :disabled="loading"
                    @click="visible = false"
                />
                <Button
                    :label="isEdit ? 'حفظ التعديلات' : 'إضافة'"
                    :icon="loading ? 'pi pi-spinner pi-spin' : (isEdit ? 'pi pi-check' : 'pi pi-plus')"
                    :loading="loading"
                    @click="onSubmit"
                />
            </div>
        </template>
    </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Drawer from 'primevue/drawer'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import type { Unit, CreateUnitPayload, UpdateUnitPayload } from '../unitsType'

interface Props {
    modelValue: boolean
    unit?: Unit | null
}

const props = withDefaults(defineProps<Props>(), {
    unit: null,
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'submit': [data: CreateUnitPayload | UpdateUnitPayload]
}>()

const loading = ref(false)
const isEdit = computed(() => !!props.unit)

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const defaultForm = (): CreateUnitPayload => ({
    name: '',
    code: '',
    description: '',
})

const form = ref<CreateUnitPayload>(defaultForm())
const errors = ref<Partial<Record<keyof CreateUnitPayload, string>>>({})

// تعبئة الفورم عند التعديل
watch(() => props.unit, (unit) => {
    if (unit) {
        form.value = {
            name: unit.name,
            code: unit.code ?? '',
            description: unit.description ?? '',
        }
    } else {
        form.value = defaultForm()
    }
    errors.value = {}
}, { immediate: true })

function validate(): boolean {
    errors.value = {}
    if (!form.value.name?.trim()) {
        errors.value.name = 'اسم الوحدة مطلوب'
        return false
    }
    if (form.value.name.length > 255) {
        errors.value.name = 'الاسم طويل جداً'
        return false
    }
    if (form.value.code && form.value.code.length > 50) {
        errors.value.code = 'الكود طويل جداً'
        return false
    }
    return true
}

async function onSubmit() {
    if (!validate()) return
    loading.value = true
    try {
        const payload: CreateUnitPayload | UpdateUnitPayload = {
            name: form.value.name.trim(),
            code: form.value.code?.trim() || null,
            description: form.value.description?.trim() || null,
        }
        emit('submit', payload)
    } finally {
        loading.value = false
    }
}

function onHide() {
    form.value = defaultForm()
    errors.value = {}
}

// للاستخدام من الخارج لإيقاف الـ loading
function setLoading(val: boolean) {
    loading.value = val
}

defineExpose({ setLoading })
</script>