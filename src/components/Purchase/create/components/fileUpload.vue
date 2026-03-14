<template>
    <div dir="rtl">
        <FileUpload
            name="attachments[]"
            :multiple="true"
            accept="image/*"
            :maxFileSize="5000000"
            :auto="false"
            @select="onSelectedFiles"
            @remove="onRemoveFile"
            @clear="onClearFiles"
        >
            <!-- ===== HEADER ===== -->
            <template #header="{ chooseCallback, clearCallback, files }">
                <div class="flex align-items-center gap-2 w-full">

                    <Button
                        label="إضافة صور"
                        icon="fas fa-folder-plus"
                        severity="warn"
                        variant="outlined"
                        size="small"
                        @click="chooseCallback()"
                    />
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        variant="outlined"
                        rounded
                        size="small"
                        @click="clearCallback()"
                        :disabled="!files || files.length === 0"
                    />

                    <!-- شريط الحجم -->
                    <div v-if="totalSizePercent > 0" class="flex align-items-center gap-2 mr-auto" style="min-width: 160px;">
                        <ProgressBar
                            :value="totalSizePercent"
                            :show-value="false"
                            :pt="{
                                root: { style: 'height: 5px; flex: 1; min-width: 80px;' },
                                value: { style: progressBarColor }
                            }"
                            style="flex: 1;"
                        />
                        <span style="font-size: 11px; white-space: nowrap; color: var(--text-color-secondary);">
                            {{ totalSize }} <span style="opacity: 0.5;">/ 5MB</span>
                        </span>
                    </div>

                </div>
            </template>

            <!-- ===== CONTENT ===== -->
            <template #content="{ files, removeFileCallback }">
                <div v-if="deletableFiles.length > 0 || files.length > 0" class="flex flex-column gap-3 p-2">

                    <!-- الصور المحفوظة -->
                    <template v-if="deletableFiles.length > 0">
                        <div class="flex align-items-center gap-2">
                            <Tag value="محفوظة" severity="success" icon="pi pi-check-circle" />
                            <Badge :value="deletableFiles.length" severity="success" />
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <div
                                v-for="(file, idx) in deletableFiles"
                                :key="file.id"
                                style="position: relative; width: 80px; height: 80px; border-radius: 10px; overflow: hidden; cursor: pointer;"
                                @click="openLightbox(allImages, idx)"
                            >
                                <img
                                    :src="file.file_url"
                                    :alt="file.file_name"
                                    style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                    @error="(e) => (e.target as HTMLImageElement).src = './img-not-found.avif'"
                                />
                                <!-- overlay -->
                                <div class="thumb-overlay"><i class="pi pi-eye" /></div>
                                <!-- زر الحذف -->
                                <Button
                                    icon="pi pi-times"
                                    severity="danger"
                                    rounded
                                    size="small"
                                    style="position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; font-size: 0.55rem;"
                                    class="thumb-delete-btn"
                                    @click.stop="handleDeleteExistingFile(file.id)"
                                />
                            </div>
                        </div>
                    </template>

                    <Divider v-if="deletableFiles.length > 0 && files.length > 0" />

                    <!-- الصور الجديدة -->
                    <template v-if="files.length > 0">
                        <div class="flex align-items-center gap-2">
                            <Tag value="جديدة" severity="info" icon="pi pi-plus-circle" />
                            <Badge :value="files.length" severity="info" />
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <div
                                v-for="(file, index) of files"
                                :key="file.name + file.size"
                                style="position: relative; width: 80px; height: 80px; border-radius: 10px; overflow: hidden; cursor: pointer; background: var(--surface-hover);"
                                @click="openLightboxFromFile(index)"
                            >
                                <img
                                    v-if="previewUrls[file.name + file.size]"
                                    :src="previewUrls[file.name + file.size]"
                                    :alt="file.name"
                                    style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                />
                                <div v-else class="flex align-items-center justify-content-center w-full h-full">
                                    <i class="pi pi-image" style="font-size: 1.4rem; color: var(--text-color-secondary);" />
                                </div>
                                <div class="thumb-overlay"><i class="pi pi-eye" /></div>
                                <Button
                                    icon="pi pi-times"
                                    severity="danger"
                                    rounded
                                    size="small"
                                    style="position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; font-size: 0.55rem;"
                                    class="thumb-delete-btn"
                                    @click.stop="onRemoveTemplatingFile(file, removeFileCallback, index)"
                                />
                                <Tag
                                    :value="formatSize(file.size)"
                                    style="position: absolute; bottom: 3px; right: 3px; font-size: 0.5rem; padding: 1px 4px;"
                                    severity="secondary"
                                />
                            </div>
                        </div>
                    </template>

                </div>
            </template>

            <!-- ===== EMPTY STATE ===== -->
            <template #empty>
                <div v-if="deletableFiles.length === 0" class="flex flex-column align-items-center gap-2 py-5">
                    <i class="pi pi-cloud-upload" style="font-size: 2.5rem; color: var(--text-color-secondary);" />
                    <span style="font-size: 0.85rem; color: var(--text-color-secondary); font-weight: 600;">
                        اسحب الصور هنا أو اضغط إضافة
                    </span>
                    <div class="flex gap-2">
                        <Tag value="JPG" severity="secondary" />
                        <Tag value="PNG" severity="secondary" />
                        <Tag value="JPEG" severity="secondary" />
                        <Tag value="max 5MB" severity="warning" />
                    </div>
                </div>
            </template>
        </FileUpload>

        <!-- ===== GALLERIA ===== -->
        <Galleria
            v-model:visible="lightboxOpen"
            v-model:activeIndex="lightboxIndex"
            :value="lightboxItems"
            :numVisible="Math.min(lightboxItems.length, 7)"
            :circular="true"
            :fullScreen="true"
            :showItemNavigators="lightboxItems.length > 1"
            :showThumbnails="lightboxItems.length > 1"
            :showItemNavigatorsOnHover="true"
            :responsiveOptions="galleriaResponsiveOptions"
        >
            <template #item="slotProps">
                <img
                    :src="slotProps.item.src"
                    :alt="slotProps.item.name"
                    :style="{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        display: 'block',
                        borderRadius: '8px',
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: 'transform 0.3s ease',
                    }"
                    @error="(e) => (e.target as HTMLImageElement).src = './img-not-found.avif'"
                />
            </template>

            <template #thumbnail="slotProps">
                <img
                    :src="slotProps.item.src"
                    :alt="slotProps.item.name"
                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; display: block;"
                />
            </template>

            <template #footer>
                <div class="flex align-items-center justify-content-between gap-3 px-3 py-2" dir="rtl"
                    style="background: rgba(10,15,26,0.95); border-top: 1px solid var(--surface-border);">

                    <!-- معلومات -->
                    <div class="flex align-items-center gap-2">
                        <Badge :value="`${lightboxIndex + 1} / ${lightboxItems.length}`" severity="secondary" />
                        <span style="font-size: 0.75rem; color: var(--text-color-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            {{ lightboxItems[lightboxIndex]?.name }}
                        </span>
                    </div>

                    <!-- أدوات التحكم -->
                    <div class="flex align-items-center gap-1" style="direction: ltr;">
                        <Button icon="pi pi-minus" text rounded size="small" :disabled="zoomLevel <= 0.5" @click="zoomOut" v-tooltip="'تصغير'" />
                        <Tag :value="`${Math.round(zoomLevel * 100)}%`" severity="secondary" style="min-width: 44px; text-align: center;" />
                        <Button icon="pi pi-plus"  text rounded size="small" :disabled="zoomLevel >= 3"   @click="zoomIn"  v-tooltip="'تكبير'" />
                        <Divider layout="vertical" style="height: 20px;" />
                        <Button icon="pi pi-undo"    text rounded size="small" @click="rotateLeft"     v-tooltip="'تدوير يساراً'" />
                        <Button icon="pi pi-refresh" text rounded size="small" @click="rotateRight"    v-tooltip="'تدوير يميناً'" />
                        <Divider layout="vertical" style="height: 20px;" />
                        <Button icon="pi pi-expand"  text rounded size="small" @click="resetTransform" v-tooltip="'إعادة تعيين'" />
                        <Divider layout="vertical" style="height: 20px;" />
                        <a
                            :href="lightboxItems[lightboxIndex]?.src"
                            :download="lightboxItems[lightboxIndex]?.name"
                            @click.stop
                        >
                            <Button icon="pi pi-download" text rounded size="small" v-tooltip="'تنزيل'" />
                        </a>
                    </div>

                </div>
            </template>
        </Galleria>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, toRefs, watch, onUnmounted } from 'vue';
import FileUpload from 'primevue/fileupload';
import Galleria from 'primevue/galleria';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import { usePrimeVue } from 'primevue/config';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import api from '../../../api/api';

interface LightboxItem { src: string; name: string; }

const props = defineProps<{ existingFiles?: any[] }>();
const emit  = defineEmits<{ (e: 'update:files', files: File[]): void }>();

const toast   = useToast();
const confirm = useConfirm();
const $primevue = usePrimeVue();
const { existingFiles } = toRefs(props);

/* ── State ── */
const deletableFiles     = ref<any[]>([]);
const totalSize          = ref('0 B');
const totalSizePercent   = ref(0);
const MAX_SIZE_BYTES     = 5 * 1024 * 1024;
const previewUrls        = ref<Record<string, string>>({});
const newFiles           = ref<File[]>([]);

/* ── Lightbox ── */
const lightboxOpen  = ref(false);
const lightboxItems = ref<LightboxItem[]>([]);
const lightboxIndex = ref(0);
const zoomLevel     = ref(1);
const rotation      = ref(0);

const galleriaResponsiveOptions = ref([
    { breakpoint: '1500px', numVisible: 7 },
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px',  numVisible: 3 },
    { breakpoint: '560px',  numVisible: 2 },
]);

/* ── Computed ── */
const allImages = computed<LightboxItem[]>(() =>
    deletableFiles.value.map(f => ({ src: f.file_url, name: f.file_name }))
);

const allNewImages = computed<LightboxItem[]>(() =>
    newFiles.value
        .filter(f => !!previewUrls.value[f.name + f.size])
        .map(f => ({ src: previewUrls.value[f.name + f.size], name: f.name }))
);

const progressBarColor = computed(() => {
    if (totalSizePercent.value >= 90) return 'background: #ef4444;';
    if (totalSizePercent.value >= 70) return 'background: #f59e0b;';
    return 'background: #22c55e;';
});

/* ── Watchers ── */
watch(existingFiles, val => { deletableFiles.value = val ? [...val] : []; }, { immediate: true });
watch(lightboxIndex, () => resetTransform());

/* ── Lightbox methods ── */
const openLightbox = (items: LightboxItem[], index: number) => {
    lightboxItems.value = items;
    lightboxIndex.value = index;
    resetTransform();
    lightboxOpen.value = true;
};
const openLightboxFromFile = (index: number) => openLightbox(allNewImages.value, index);
const zoomIn        = () => { zoomLevel.value = Math.min(3,   +(zoomLevel.value + 0.25).toFixed(2)); };
const zoomOut       = () => { zoomLevel.value = Math.max(0.5, +(zoomLevel.value - 0.25).toFixed(2)); };
const rotateLeft    = () => { rotation.value -= 90; };
const rotateRight   = () => { rotation.value += 90; };
const resetTransform = () => { zoomLevel.value = 1; rotation.value = 0; };

/* ── Keyboard ── */
const onKeydown = (e: KeyboardEvent) => {
    if (!lightboxOpen.value) return;
    if (e.key === 'Escape') lightboxOpen.value = false;
};
window.addEventListener('keydown', onKeydown);
onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
    Object.values(previewUrls.value).forEach(url => URL.revokeObjectURL(url));
});

/* ── Delete existing ── */
const handleDeleteExistingFile = (imageId: number) => {
    confirm.require({
        header: 'تأكيد الحذف',
        message: 'هل أنت متأكد من حذف هذه الصورة؟',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'حذف',
        acceptIcon: 'pi pi-trash',
        acceptClass: 'p-button-sm p-button-danger',
        rejectLabel: 'إلغاء',
        rejectClass: 'p-button-sm p-button-secondary p-button-outlined',
        accept: async () => {
            const backup = [...deletableFiles.value];
            deletableFiles.value = deletableFiles.value.filter(f => f.id !== imageId);
            try {
                await api.delete(`/purchase-request-images/${imageId}`);
                toast.add({ severity: 'success', summary: 'تم الحذف', detail: 'حُذفت الصورة بنجاح', life: 2500 });
            } catch {
                deletableFiles.value = backup;
                toast.add({ severity: 'error', summary: 'خطأ', detail: 'فشل الحذف، أُعيدت الصورة', life: 3000 });
            }
        },
    });
};

/* ── Remove new file ── */
const onRemoveTemplatingFile = (_file: File, removeFileCallback: Function, index: number) => {
    confirm.require({
        header: 'تأكيد الحذف',
        message: 'هل أنت متأكد من إزالة هذه الصورة؟',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'إزالة',
        acceptClass: 'p-button-sm p-button-danger',
        rejectLabel: 'إلغاء',
        rejectClass: 'p-button-sm p-button-secondary p-button-outlined',
        accept: () => removeFileCallback(index),
    });
};

/* ── File events ── */
const generatePreviews = (files: File[]) => {
    Object.values(previewUrls.value).forEach(url => URL.revokeObjectURL(url));
    const map: Record<string, string> = {};
    files.forEach(f => { if (f.type.startsWith('image/')) map[f.name + f.size] = URL.createObjectURL(f); });
    previewUrls.value = map;
};

const updateSize = (files: File[]) => {
    const total = files.reduce((s, f) => s + f.size, 0);
    totalSize.value = formatSize(total);
    totalSizePercent.value = Math.min((total / MAX_SIZE_BYTES) * 100, 100);
};

const onSelectedFiles = (event: any) => {
    const selected: File[] = event.files;
    newFiles.value = selected;
    updateSize(selected);
    generatePreviews(selected);
    emit('update:files', selected);
};

const onRemoveFile = (event: any) => {
    const remaining: File[] = event.files;
    newFiles.value = remaining;
    updateSize(remaining);
    generatePreviews(remaining);
    emit('update:files', remaining);
};

const onClearFiles = () => {
    Object.values(previewUrls.value).forEach(url => URL.revokeObjectURL(url));
    previewUrls.value = {};
    newFiles.value = [];
    totalSize.value = '0 B';
    totalSizePercent.value = 0;
    emit('update:files', []);
};

const formatSize = (bytes: number): string => {
    const k = 1024;
    const sizes = $primevue.config.locale?.fileSizeTypes ?? ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return `0 ${sizes[0]}`;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
</script>

<style scoped>
.thumb-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.18s;
    color: #fff;
    font-size: 1rem;
}

div:hover > .thumb-overlay {
    opacity: 1;
}

.thumb-delete-btn {
    opacity: 0;
    transform: scale(0.7);
    transition: opacity 0.18s, transform 0.18s;
}

div:hover > .thumb-delete-btn {
    opacity: 1;
    transform: scale(1);
}
</style>