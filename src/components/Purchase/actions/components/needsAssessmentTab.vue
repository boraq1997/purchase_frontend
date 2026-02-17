<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import committeesOpinionsService from '../../services/committeesOpinions.service';
import { useToast } from "primevue/usetoast";
import FloatLabel from 'primevue/floatlabel';

const toast = useToast();

const props = defineProps<{
    id: number | null;
    items: any[];
    purchaseRequest: any;
    needs_assessments?: any[];
}>();

const emit = defineEmits<{
    (e: 'saved', payload?: any): void;
}>();

const selectedItem = ref<any | null>(null);
const selectedAssessment = ref<any | null>(null);

// فورم التقييم
const form = ref({
    urgency_level: 'medium',
    needs_status: 'needed',
    quantity_needed_after_assessment: null,
    modified_specifications: '',
    reason: '',
    recommended_action: '',
    notes: '',
    assessment_state: 'draft',
    admin_decision: 'pending',
    admin_comment: '',
});

// عند اختيار مادة من الجدول
const selectItem = (item: any) => {
    selectedItem.value = item;

    // البحث عن تقييم سابق لنفس المادة
    const existing = props.needs_assessments?.find(
        (a: any) => a.request_item_id === item.id
    );

    if (existing) {
        selectedAssessment.value = existing;
        form.value = { ...existing }; // تعبئة الفورم
    } else {
        selectedAssessment.value = null;
        form.value = {
            urgency_level: 'medium',
            needs_status: 'needed',
            quantity_needed_after_assessment: null,
            modified_specifications: '',
            reason: '',
            recommended_action: '',
            notes: '',
            assessment_state: 'draft',
            admin_decision: 'pending',
            admin_comment: '',
        };
    }
};

const save = async() => {
    if (!selectedItem.value) return;
    const payload = {
        purchase_request_id: props.id,
        request_item_id: selectedItem.value.id,
        ...form.value,
    };
    try {
        if (selectedAssessment.value) {
            await committeesOpinionsService.updateNeedsAssessment(selectedAssessment.value.id, payload);
        } else {
            await committeesOpinionsService.saveNeedsAssessment(payload);
        }
        toast.add({
            severity: "success",
            summary: "عملية ناجحة",
            detail: "تم حفظ نتيجة تقييم بيان الحاجة بنجاح",
            life: 3000
        });
        emit('saved', payload);
    } catch (err: any) {
        console.log(err)
        toast.add({
            severity: "error",
            summary: "خطأ",
            detail: "حدث خطأ أثناء حفظ نتيجة بيان الحاجة",
            life: 3000
        });
    }
};

onMounted(() => {
    
})
</script>

<template>
    <div class="needs-assessment-container" dir="rtl">
        <div class="grid">
            
            <!-- جدول المواد -->
            <div class="col-12 lg:col-4">
                <Card class="items-card shadow-3">
                    <template #header>
                        <div class="card-header-custom">
                            <div class="flex align-items-center gap-2">
                                <i class="fas fa-boxes-stacked text-2xl"></i>
                                <h3 class="m-0 text-xl font-bold">قائمة المواد</h3>
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
                                        v-if="needs_assessments?.some(a => a.request_item_id === data.id)"
                                        value="تم التقييم"
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
                            <h3 class="text-2xl font-bold text-700 mb-2">اختر مادة لبدء التقييم</h3>
                            <p class="text-600 m-0">قم باختيار مادة من القائمة لبدء عملية تقييم بيان الحاجة</p>
                        </div>
                    </template>
                </Card>

                <Card v-else class="assessment-card shadow-3">
                    <template #header>
                        <div class="assessment-header">
                            <div class="flex align-items-center gap-3">
                                <div class="icon-wrapper">
                                    <i class="fas fa-clipboard-list"></i>
                                </div>
                                <div>
                                    <h3 class="m-0 text-xl font-bold">تقييم بيان الحاجة</h3>
                                    <p class="m-0 text-sm mt-1">{{ selectedItem.item_name }}</p>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #content>
                        <div class="form-grid">
                            
                            <!-- الأهمية والحالة -->
                            <div class="form-section">
                                <h4 class="section-title">
                                    <i class="fas fa-star text-primary"></i>
                                    الأولوية والحالة
                                </h4>
                                
                                <div class="grid">
                                    <div class="col-12 md:col-4">
                                        <FloatLabel variant="on">
                                            <Select
                                                id="urgency_level"
                                                v-model="form.urgency_level"
                                                :options="[
                                                    { label: 'منخفض', value: 'low', icon: 'pi-arrow-down', color: 'info' },
                                                    { label: 'متوسط', value: 'medium', icon: 'pi-minus', color: 'warning' },
                                                    { label: 'عالٍ', value: 'high', icon: 'pi-arrow-up', color: 'danger' },
                                                    { label: 'حرج', value: 'critical', icon: 'pi-exclamation-triangle', color: 'danger' }
                                                ]"
                                                optionLabel="label"
                                                optionValue="value"
                                                class="w-full"
                                            />
                                            <label for="urgency_level">مستوى الأهمية <span class="required">*</span></label>
                                        </FloatLabel>
                                        
                                    </div>
                                    
                                    <div class="col-12 md:col-4">
                                        <FloatLabel variant="on">
                                            <Select
                                                id="needs_status"
                                                v-model="form.needs_status"
                                                :options="[
                                                    { label: 'مطلوبة', value: 'needed', icon: 'pi-check' },
                                                    { label: 'غير مطلوبة', value: 'not_needed', icon: 'pi-times' },
                                                    { label: 'مواصفات معدلة', value: 'modified', icon: 'pi-pencil' }
                                                ]"
                                                optionLabel="label"
                                                optionValue="value"
                                                class="w-full"
                                            />
                                            <label for="needs_status">حالة الحاجة <span class="required">*</span></label>
                                        </FloatLabel>
                                        
                                    </div>

                                    <div class="col-12 md:col-4" v-if="form.needs_status !== 'not_needed'">
                                        <FloatLabel variant="on">
                                            <InputNumber 
                                                id="quantity_needed_after_assessment"
                                                v-model="form.quantity_needed_after_assessment" 
                                                class="w-full" 
                                                :min="0"
                                            />
                                            <label for="quantity_needed_after_assessment">الكمية المطلوبة</label>
                                        </FloatLabel>
                                        
                                    </div>
                                </div>

                                <!-- المواصفات المعدلة -->
                                <div v-if="form.needs_status === 'modified'" class="mt-3">
                                    <FloatLabel variant="on">
                                        <Textarea 
                                            id="modified_specifications"
                                            v-model="form.modified_specifications" 
                                            rows="4" 
                                            class="w-full" 
                                            :maxlength="500" 
                                        />
                                        <label for="modified_specifications">المواصفات المعدلة <span class="required">*</span></label>
                                    </FloatLabel>
                                    <small class="text-500">{{ form.modified_specifications?.length || 0 }}/500</small>                                    
                                </div>
                            </div>

                            <Divider />

                            <!-- السبب والإجراء المقترح -->
                            <div class="form-section">
                                <h4 class="section-title">
                                    <i class="fas fa-lightbulb text-primary"></i>
                                    التحليل والتوصيات
                                </h4>
                                
                                <FloatLabel variant="on">
                                    <Textarea 
                                        id="reason"
                                        v-model="form.reason" 
                                        rows="4" 
                                        class="w-full" 
                                        :maxlength="500"
                                    />
                                    <label for="reason">السبب</label>
                                </FloatLabel>
                                <small class="text-500">{{ form.reason?.length || 0 }}/500</small>
                            
                                <FloatLabel variant="on">
                                    <Textarea 
                                        id="recommended_action"
                                        v-model="form.recommended_action" 
                                        rows="4" 
                                        class="w-full" 
                                        :maxlength="500"
                                    />
                                    <label for="recommended_action">الإجراء المقترح</label>
                                </FloatLabel>
                                <small class="text-500">{{ form.recommended_action?.length || 0 }}/500</small>
                            </div>

                            <Divider />

                            <!-- ملاحظات وحالة التقييم -->
                            <div class="form-section">
                                <h4 class="section-title">
                                    <i class="fas fa-comment-dots text-primary"></i>
                                    ملاحظات إضافية
                                </h4>

                                <FloatLabel variant="on" class="mb-3">
                                    <Select
                                        id="assessment_state"
                                        v-model="form.assessment_state"
                                        :options="[
                                            { label: 'مسودة', value: 'draft', icon: 'pi-file-edit' },
                                            { label: 'نهائي', value: 'final', icon: 'pi-check-circle' }
                                        ]"
                                        optionLabel="label"
                                        optionValue="value"
                                        class="w-full"
                                    />
                                    <label for="assessment_state">حالة التقييم <span class="required">*</span></label>
                                </FloatLabel>
                                
                                <FloatLabel variant="on">
                                    <Textarea 
                                        id="notes"
                                        v-model="form.notes" 
                                        rows="4" 
                                        class="w-full" 
                                        :maxlength="500"
                                    />
                                    <label for="notes">الملاحظات</label>
                                </FloatLabel>
                                <small class="text-500">{{ form.notes?.length || 0 }}/500</small>
                            </div>

                            <Divider />

                            <!-- قرار الإدارة -->
                            <div class="form-section">
                                <h4 class="section-title">
                                    <i class="fas fa-gavel text-primary"></i>
                                    قرار الإدارة
                                </h4>
                                
                                    <FloatLabel variant="on" class="mb-3">
                                        <Select
                                            id="admin_decision"
                                            v-model="form.admin_decision"
                                            :options="[
                                                { label: 'بانتظار القرار', value: 'pending', icon: 'pi-clock' },
                                                { label: 'موافقة', value: 'approved', icon: 'pi-check' },
                                                { label: 'مرفوض', value: 'rejected', icon: 'pi-times' }
                                            ]"
                                            optionLabel="label"
                                            optionValue="value"
                                            class="w-full"
                                        />
                                        <label for="admin_decision">القرار</label>
                                    </FloatLabel>
                                
                                    <FloatLabel variant="on">
                                        <Textarea 
                                            id="admin_comment"
                                            v-model="form.admin_comment" 
                                            rows="4" 
                                            class="w-full" 
                                            :maxlength="500"
                                        />
                                        <label for="admin_comment">تعليق الإدارة <span class="required">*</span></label>
                                    </FloatLabel>
                                    <small class="text-500">{{ form.admin_comment?.length || 0 }}/500</small>
                                </div>

                            <!-- زر الحفظ -->
                            <div class="flex justify-content-end gap-2 mt-4">
                                <Button
                                    label="حفظ التقييم"
                                    icon="pi pi-check"
                                    @click="save"
                                    class="save-button"
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
.needs-assessment-container {
    padding: 1rem;
}

/* Card Styles */
.items-card :deep(.p-card-header),
.assessment-card :deep(.p-card-header),
.empty-state-card :deep(.p-card-header) {
    padding: 0;
}

.items-card :deep(.p-card-body),
.assessment-card :deep(.p-card-body),
.empty-state-card :deep(.p-card-body) {
    padding: 1.5rem;
}

.items-card :deep(.p-card-content),
.assessment-card :deep(.p-card-content),
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

.assessment-header {
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
    background: linear-gradient(14deg, #1b1645 0%, #38333c 100%);
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
:deep(.p-inputnumber-input),
:deep(.p-select),
:deep(.p-textarea) {
    border-radius: 8px;
    border: 1px solid #dee2e6;
    transition: all 0.2s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-select:focus),
:deep(.p-textarea:focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
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

/* Character Counter */
small.text-500 {
    display: block;
    text-align: left;
    margin-top: 0.25rem;
    font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 992px) {
    .needs-assessment-container {
        padding: 0.5rem;
    }
    
    .card-header-custom,
    .assessment-header {
        padding: 1rem;
    }
    
    .empty-state {
        padding: 2rem 1rem;
    }
    
    .icon-wrapper {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
    }
}
</style>