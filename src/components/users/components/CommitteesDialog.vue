<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        header="اللجان التي ينتمي إليها"
        :style="{ width: '75vw' }"
        modal
        dir="rtl"
    >
        <DataTable
            v-model:filters="filters"
            :value="committees"
            dataKey="id"
            paginator
            :rows="10"
            filterDisplay="menu"
            :globalFilterFields="['name', 'description']"
            responsiveLayout="scroll"
            class="text-right"
        >
            <template #header>
                <FloatLabel variant="on">
                    <InputText v-model="filters.global.value" style="width: 20vw;" />
                    <label><i class="fas fa-search" /> بحث...</label>
                </FloatLabel>
            </template>

            <template #empty>
                <Message severity="warn">لم يتم العثور على لجان</Message>
            </template>

            <Column field="id" sortable>
                <template #header><i class="fas fa-hashtag text-gray-500" /></template>
            </Column>

            <Column field="name" sortable>
                <template #header><i class="fa-solid fa-object-group text-gray-500" />اسم اللجنة</template>
            </Column>

            <Column sortable>
                <template #header><i class="fas fa-user-tie text-gray-500" />المدير</template>
                <template #body="{ data }">
                    <Tag
                        icon="fas fa-user-tie"
                        severity="contrast"
                        :value="data.manager?.name || '-'"
                        @click="managerPopover.toggle($event)"
                        class="cursor-pointer"
                    />
                    <Popover ref="managerPopover" dir="rtl">
                        <div class="p-3 flex flex-col gap-2" style="min-width: 220px">
                            <div class="grid">
                                <div class="col-5"><i class="fas fa-user" /> الاسم:</div>
                                <div class="col-7">{{ data.manager?.name }}</div>
                            </div>
                            <div class="grid">
                                <div class="col-5"><i class="fas fa-envelope" /> البريد:</div>
                                <div class="col-7">{{ data.manager?.email }}</div>
                            </div>
                            <div class="grid">
                                <div class="col-5"><i class="fa-solid fa-phone-flip" /> الهاتف:</div>
                                <div class="col-7">{{ data.manager?.phone }}</div>
                            </div>
                        </div>
                    </Popover>
                </template>
            </Column>

            <Column field="description" sortable>
                <template #header><i class="fa-solid fa-text-width text-gray-500" />الوصف</template>
            </Column>
        </DataTable>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";

import Dialog     from "primevue/dialog";
import DataTable  from "primevue/datatable";
import Column     from "primevue/column";
import InputText  from "primevue/inputtext";
import Message    from "primevue/message";
import Tag        from "primevue/tag";
import Popover    from "primevue/popover";
import FloatLabel from "primevue/floatlabel";

defineProps<{ visible: boolean; committees: any[] }>();
defineEmits<{ 'update:visible': [value: boolean] }>();

const managerPopover = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>