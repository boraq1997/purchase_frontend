<script setup lang="ts">
import { ref, watch } from 'vue';
import { useToast } from "primevue/usetoast";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import committeesOpinionsService from '../../services/committeesOpinions.service';
import Tag from 'primevue/tag';
import FloatLabel from 'primevue/floatlabel';

const toast = useToast();

const props = defineProps<{
    id: number | null;
    items: any[];
    warehouse_checks?: any[];
    currentUserId?: number;
}>();

const emit = defineEmits<{
    (e: 'saved', payload?: any): void;
}>();

// STATE
const selectedItem = ref<any | null>(null);
const selectedWareHouseCheck = ref<any | null>(null);

const form = ref({
    availability: '',
    item_condition: '',
    available_quantity: null,
    recommendation: '',
    notes: ''
});

// دالة اختيار المادة
const selectItem = (item: any) => {
    selectedItem.value = item;

    const existing = props.warehouse_checks?.find(w => w.request_item_id === item.id);

    if (existing) {
        selectedWareHouseCheck.value = existing;
        form.value = {
            availability: existing.availability,
            item_condition: existing.item_condition,
            available_quantity: existing.available_quantity,
            recommendation: existing.recommendation,
            notes: existing.notes
        };
    } else {
        selectedWareHouseCheck.value = null;
        form.value = {
            availability: '',
            item_condition: '',
            available_quantity: null,
            recommendation: '',
            notes: ''
        };
    }
};

watch(() => form.value.availability, (newVal) => {
    if (newVal === 'unavailable') {
        // تعطيل بقية الحقول عند اختيار غير متوفر
        form.value.item_condition = '';
        form.value.available_quantity = null;
        form.value.recommendation = '';
        form.value.notes = '';
    }
});

// حفظ البيانات
const save = async () => {
    if (!selectedItem.value) return;

    const payload = {
        purchase_request_id: props.id,
        request_item_id: selectedItem.value.id,
        availability: form.value.availability,
        item_condition: form.value.item_condition,
        available_quantity: form.value.available_quantity,
        recommendation: form.value.recommendation,
        notes: form.value.notes,
        checked_by: props.currentUserId
    };

    try {
        await committeesOpinionsService.saveWarehouseCheck(payload);

        toast.add({
            severity: "success",
            summary: "عملية ناجحة",
            detail: "تم حفظ تقييم المخازن بنجاح",
            life: 3000
        });

        emit("saved", payload);
    } catch (err) {
        console.log(err);

        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "حدث خطأ أثناء حفظ تقييم المخازن",
            life: 3000
        });
    }
};
</script>

<template>
    <div class="warehouse-check-container" dir="rtl">
        <div class="grid">
            <!-- جدول المواد -->
            <div class="col-12 lg:col-4">
                <Card class="items-card shadow-3">
                    <template #header>
                        <div class="card-header-custom">
                            <div class="flex align-items-center gap-2">
                                <i class="fas fa-boxes-stacked text-primary text-2xl"></i>
                                <h3 class="m-0 text-xl font-bold text-white">قائمة المواد</h3>
                            </div>
                            <div class="items-count">
                                <Tag :value="`${items.length} مادة`" severity="info" />
                            </div>
                        </div>
                    </template>

                    <template #content>
                        <DataTable
                            :value="items"
                            selectionMode="single"
                            @row-click="selectItem($event.data)"
                            :rowClass="row => row.id === selectedItem?.id ? 'selected-row' : ''"
                            stripedRows
                            class="custom-datatable"
                            :paginator="items.length > 10"
                            :rows="10"
                        >
                            <Column field="item_name" class="font-semibold">
                                <template #header>
                                    <div class="flex align-items-center gap-2">
                                        <i class="fas fa-box text-primary"></i>
                                        <span>اسم المادة</span>
                                    </div>
                                </template>
                            </Column>

                            <Column field="quantity" style="width: 100px">
                                <template #header>
                                    <div class="flex align-items-center gap-2">
                                        <i class="fas fa-hashtag text-primary"></i>
                                        <span>الكمية</span>
                                    </div>
                                </template>
                                <template #body="{ data }">
                                    <Tag :value="data.quantity" severity="secondary" />
                                </template>
                            </Column>

                            <Column style="width: 120px">
                                <template #header>
                                    <div class="flex align-items-center gap-2">
                                        <i class="fas fa-check-circle text-primary"></i>
                                        <span>الحالة</span>
                                    </div>
                                </template>

                                <template #body="{ data }">
                                    <Tag
                                        v-if="warehouse_checks?.some(w => w.request_item_id === data.id)"
                                        value="تم الفحص"
                                        severity="success"
                                        icon="pi pi-check"
                                    />
                                    <Tag
                                        v-else
                                        value="قيد الانتظار"
                                        severity="warn"
                                        icon="pi pi-clock"
                                        style="font-size: 12px;"
                                        />
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>
            </div>

            <!-- نموذج التقييم -->
            <div class="col-12 lg:col-8">
                <Card v-if="!selectedItem" class="empty-state-card shadow-2">
                    <template #content>
                        <div class="empty-state">
                            <i class="fas fa-hand-pointer text-6xl text-400 mb-4"></i>
                            <h3 class="text-2xl font-bold text-700 mb-2">اختر مادة للفحص</h3>
                            <p class="text-600 m-0">قم باختيار مادة من القائمة لبدء عملية الفحص والتقييم</p>
                        </div>
                    </template>
                </Card>

                <Card v-else class="evaluation-card shadow-3">
                    <template #header>
                        <div class="evaluation-header">
                            <div class="flex align-items-center gap-3">
                                <div class="icon-wrapper">
                                    <i class="fas fa-clipboard-check"></i>
                                </div>
                                <div>
                                    <h3 class="m-0 text-xl font-bold text-white">تقييم المخازن</h3>
                                    <p class="m-0 text-sm text-gray-300 mt-1">المادة: {{ selectedItem.item_name }}</p>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #content>
                        <div class="form-grid">
                            <!-- حالة التوفر والكمية -->
                            <div class="form-section">
                                <h4 class="section-title">
                                    <i class="fas fa-warehouse text-primary"></i>
                                    حالة المخزون
                                </h4>
                                
                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <FloatLabel variant="on">
                                            <Select
                                                v-model="form.availability"
                                                id="availability_field"
                                                :options="[
                                                    { label: 'متوفر', value: 'available', icon: 'pi-check-circle', severity: 'success' },
                                                    { label: 'متوفر جزئياً', value: 'partial', icon: 'pi-exclamation-circle', severity: 'warning' },
                                                    { label: 'غير متوفر', value: 'unavailable', icon: 'pi-times-circle', severity: 'danger' }
                                                ]"
                                                optionLabel="label"
                                                optionValue="value"
                                                class="w-full"
                                            />
                                            <label for="availability_field" class="form-label">حالة التوفر <span class="required">*</span></label>
                                        </FloatLabel>
                                        
                                    </div>
                                    
                                    <div class="col-12 md:col-6">
                                        <FloatLabel variant="on">
                                            <InputText
                                                type="number"
                                                v-model="form.available_quantity"
                                                id="available_quantity_field"
                                                class="w-full"
                                                :disabled="form.availability === 'unavailable'"
                                            />
                                            <label for="available_quantity_field" class="form-label">الكمية المتوفرة</label>
                                        </FloatLabel>
                                        
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <!-- التوصية والحالة -->
                            <div class="form-section">
                                <h4 class="section-title">
                                    <i class="fas fa-lightbulb text-primary"></i>
                                    التقييم والتوصية
                                </h4>
                                
                                <div class="grid">
                                    <div class="col-12 md:col-6" v-if="form.availability !== 'unavailable'">
                                        <FloatLabel variant="on">
                                            <InputText
                                                v-model="form.item_condition"
                                                id="item_condition_field"
                                                fluid
                                            />
                                            <label for="item_condition_field" class="form-label">حالة المادة</label>
                                        </FloatLabel>
                                        
                                    </div>
                                    
                                    <div class="col-12 md:col-6">
                                        <FloatLabel variant="on">
                                            <Select
                                                v-model="form.recommendation"
                                                id="recommendation_field"
                                                :options="[
                                                    { label: 'توفير من المخزون', value: 'provide_from_stock', icon: 'pi-box' },
                                                    { label: 'شراء جديد', value: 'purchase_new', icon: 'pi-shopping-cart' },
                                                    { label: 'رفض الطلب', value: 'reject', icon: 'pi-times' }
                                                ]"
                                                class="w-full"
                                                optionLabel="label"
                                                optionValue="value"
                                            />
                                            <label for="recommendation_field" class="form-label">التوصية <span class="required">*</span></label>
                                        </FloatLabel>
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <!-- الملاحظات -->
                            <div class="form-section" v-if="form.availability !== 'unavailable'">
                                <h4 class="section-title">
                                    <i class="fas fa-comment-dots text-primary"></i>
                                    ملاحظات إضافية
                                </h4>
                                
                                
                                <FloatLabel variant="on">
                                    <Textarea
                                        rows="4"
                                        v-model="form.notes"
                                        id="notes_field"
                                        class="w-full"
                                    />
                                    <label for="notes_field" class="form-label">الملاحظات</label>
                                </FloatLabel>
                            </div>

                            <!-- زر الحفظ -->
                            <div class="flex justify-content-end gap-2 mt-4">
                                <Button
                                    label="حفظ التقييم"
                                    icon="pi pi-check"
                                    @click="save"
                                    size="large"
                                />
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
.warehouse-check-container {
    padding: 1rem;
}

/* Card Styles */
.items-card :deep(.p-card-header),
.evaluation-card :deep(.p-card-header),
.empty-state-card :deep(.p-card-header) {
    padding: 0;
}

.items-card :deep(.p-card-body),
.evaluation-card :deep(.p-card-body),
.empty-state-card :deep(.p-card-body) {
    padding: 1.5rem;
}

.items-card :deep(.p-card-content),
.evaluation-card :deep(.p-card-content),
.empty-state-card :deep(.p-card-content) {
    padding: 0;
}

/* Card Headers */
.card-header-custom {
    background: linear-gradient(14deg, #1b1645 0%, #38333c 100%);
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    border-radius: 10px 10px 0 0;
}

.evaluation-header {
    background: linear-gradient(14deg, #1b1645 0%, #38333c 100%);
    padding: 0.5rem;
    color: white;
    border-radius: 10px 10px 0 0;
}

.icon-wrapper {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

/* DataTable Styles */
.custom-datatable :deep(.p-datatable-thead > tr > th) {
    border-bottom: 1px solid #e9ecef;
    font-weight: 600;
    padding: 1rem;
}

.custom-datatable :deep(.p-datatable-tbody > tr) {
    cursor: pointer;
    transition: all 0.2s ease;
}



.custom-datatable :deep(.selected-row) {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
    border-right: 4px solid #667eea;
}

/* Empty State */
.empty-state {
    text-align: center; 
    padding: 4rem 2rem; 
    border: 2px dashed #414141; 
    border-radius: 10px; 
}

.empty-state i {
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* Form Styles */
.form-grid {
    padding: 0.5rem 0;
}

.form-section {
    margin-bottom: 1rem;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #495057;
    font-size: 0.95rem;
}

.required {
    color: #e74c3c;
    margin-right: 2px;
}

/* Input Styles */
:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-textarea) {
    border-radius: 8px;
    border: 1px solid #dee2e6;
    transition: all 0.2s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-select:focus),
:deep(.p-textarea:focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

/* Button Styles */
.save-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    padding: 0.75rem 2rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.3s ease;
}

/* Tags */
:deep(.p-tag) {
    font-weight: 500;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
}

/* Divider */
:deep(.p-divider) {
    margin: 1.5rem 0;
}

/* Responsive */
@media (max-width: 992px) {
    .warehouse-check-container {
        padding: 0.5rem;
    }
    
    .card-header-custom,
    .evaluation-header {
        padding: 1rem;
    }
    
    .empty-state {
        padding: 2rem 1rem;
    }
}
</style>