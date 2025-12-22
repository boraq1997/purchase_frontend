<template>
    <div class="flex flex-column gap-4 mt-3">
        <div class="grid">
            <div class="col">
            <Fieldset legend="طلبات الشراء">
                <div class="flex flex-column gap-4 mt-3">
                <IconField>
                    <InputIcon class="fa-solid fa-user" />
                    <InputText v-model="form.title" placeholder="عنوان الطلب" fluid />
                </IconField>

                <IconField>
                    <InputIcon class="fa-solid fa-text-width"/>
                    <Textarea v-model="form.description" rows="5" style="resize: none" fluid />
                </IconField>

                <div class="grid">
                    <div class="col">
                        <IconField>
                            <InputIcon class="fa-solid fa-text-width"/>
                            <Select
                                v-model="form.department_id"
                                :options="departmentOptions"
                                optionLabel="name"
                                optionValue="id"
                                :disabled="!!userHasDepartment"
                                :placeholder="userHasDepartment ? userDepartmentName : 'اختر القسم'"
                                class="w-full md:w-56"
                            />
                        </IconField>
                    </div>

                    <div class="col">
                        <IconField>
                            <InputIcon class="fa-solid fa-text-width"/>
                            <Select v-model="form.priority" :options="priorityOptions" optionLabel="label" optionValue="value" placeholder="اهمية الطلب" class="w-full md:w-56" />
                        </IconField>
                    </div>
                </div>

                </div>
            </Fieldset>
            </div>
            <div class="col">
            <Fieldset legend="المواد">
                
                <div
                    class="mb-4 border p-3 rounded"
                    v-for="(item, index) in form.items"
                    :key="item.id ?? index"
                >
                    <div class="flex mb-2">
                      <h4 class="flex-1 font-bold">المادة {{ index + 1 }}</h4>

                      <Button
                          icon="fas fa-trash-alt"
                          severity="danger"
                          rounded
                          variant="outlined"
                          aria-label="Delete"
                          class="p-button-sm"
                          @click="removeItem(index)"
                          v-if="form.items.length > 1"
                      />
                    </div>

                    <IconField class="mb-3 w-full">
                        <InputIcon class="fa-solid fa-box" />
                        <InputText
                        v-model="item.item_name"
                        placeholder="اسم المادة"
                        class="w-full"
                        />
                    </IconField>

                    <div class="grid">
                        <div class="col">
                        <IconField class="w-full">
                            <InputIcon class="fa-solid fa-hashtag" />
                            <InputNumber
                            v-model="item.quantity"
                            :useGrouping="false"
                            class="w-full"
                            />
                        </IconField>
                        </div>

                        <div class="col">
                        <IconField class="w-full">
                            <InputIcon class="fa-solid fa-scale-balanced" />
                            <InputText
                            v-model="item.unit"
                            placeholder="الوحدة (قطعة، علبة، ...)"
                            class="w-full"
                            />
                        </IconField>
                        </div>
                    </div>

                    <IconField class="mt-3 w-full">
                        <InputIcon class="fa-solid fa-list" />
                        <Chips
                        v-model="item.specs"
                        separator=","
                        placeholder="مواصفات اضافية"
                        class="w-full"
                        />
                    </IconField>
                    </div>

                    <!-- زر إضافة مادة جديدة -->
                    <Button
                    label="إضافة مادة"
                    icon="pi pi-plus"
                    class="p-button-info mt-3"
                    @click="addItem"
                    />

            </Fieldset>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import Fieldset from 'primevue/fieldset';
import InputText from "primevue/inputtext";
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputNumber from 'primevue/inputnumber';
import Chips from 'primevue/chips';
import Button from "primevue/button";

const props = defineProps({
  user: Object,
  isEdit: Boolean,
  editData: {
    type: Object,
    default: null
  },
  departments: {
    type: Array,
    default: ()=>[]
  }
});

const emit = defineEmits(['saved', 'close']);

/* ============================
   MAIN FORM STATE
=============================*/
const form = ref({
  id: null,
  title: "",
  description: "",
  department_id: props.user?.department?.id ?? null,
  user_id: props.user?.id ?? null,
  priority: "medium",
  items: [
    {
      item_name: "",
      quantity: 1,
      unit: "",
      specs: [] as string[],
    }
  ]
});

/* ============================
   RESET FORM
=============================*/

const resetForm = () => {
  form.value = {
    id: null,
    title: "",
    description: "",
    department_id: props.user?.department?.id ?? null,
    user_id: props.user?.id ?? null,
    priority: "medium",
    items: [
      { item_name: "", quantity: 1, unit: "", specs: [] }
    ]
  };
};

const departmentName = computed(() => {
  if (props.isEdit && props.editData) {
    return props.editData.department?.name ?? props.user?.department.name;
  }
  return props.user?.department?.name;
});

const currentItem = ref({
    item_name: "",
    quantity: 1,
    unit: "",
    specs: [] as string[],
});

const priorityOptions = [
  { label: "عالية", value: "high" },
  { label: "متوسطة", value: "medium" },
  { label: "منخفضة", value: "low" },
];

const itemName = ref("");
const quantity = ref(1);
const specs = ref<string[]>([]);

/* ============================
   LOAD FORM FOR EDIT MODE
=============================*/

const loadForm = (data: any) => {
  form.value.id = data.id; // 🟦 الحل الرئيسي

  form.value.title = data.title;
  form.value.description = data.description;
  form.value.department_id = data.department?.id;
  form.value.priority = data.priority ?? "medium";
  
  if (data.items?.length) {
    form.value.items = data.items.map((item: any) => ({
      id: item.id,
      item_name: item.item_name,
      quantity: item.quantity,
      unit: item.unit,
      specs: Array.isArray(item.specs)
        ? item.specs
        : (item.specs ? item.specs.split(",") : []),
    }));
  }
};

// متابعة أي تغيّر في editData حتى نحمّلها
watch(
  () => props.editData,
  (data) => {
    if (props.isEdit && data) {
      loadForm(data);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

/* ============================
   SAVE REQUEST
=============================*/

const saveRequest = () => {
  const payload = { ...form.value };

  emit("saved", payload);
};

/* ============================
   ADD & REMOVE ITEMS
=============================*/

const addItem = () => {
  form.value.items.push({
    id: null,
    item_name: "",
    quantity: 1,
    unit: "",
    specs: [],
  });
};

const removeItem = (index: number) => {
  form.value.items.splice(index, 1);
};

const userHasDepartment = computed(() => !!props.user?.department?.id);
const userDepartmentName = computed(() => props.user?.department?.name ?? '');
const departmentOptions = computed(() => {
  if (userHasDepartment.value) {
    return [
      {
        id: props.user.department.id,
        name: props.user.department.name
      }
    ]
  }
})

defineExpose({
  saveRequest,
});
</script>
