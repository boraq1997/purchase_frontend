<template>
    <div class="upload-wrapper" dir="rtl">
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
                <div class="upload-header">
                    <div class="header-actions">
                        
                        <Button 
                            label="اضافة صور" 
                            icon="fas fa-folder-plus" 
                            severity="warn" 
                            variant="outlined" 
                            size="small" 
                            @click="chooseCallback()" 
                        />
                        <Button 
                            icon="fas fa-trash-alt" 
                            severity="danger" 
                            rounded 
                            size="small"
                            @click="clearCallback()" 
                            :disabled="!files || files.length === 0"
                        />
                    </div>

                    <Transition name="fade">
                        <div class="size-tracker" v-if="totalSizePercent > 0">
                            <div class="progress-track" :title="`${totalSize} / 5MB`">
                                <div
                                    class="progress-fill"
                                    :style="{ width: totalSizePercent + '%' }"
                                    :class="{
                                        'progress-safe': totalSizePercent < 70,
                                        'progress-warn': totalSizePercent >= 70 && totalSizePercent < 90,
                                        'progress-danger': totalSizePercent >= 90
                                    }"
                                />
                            </div>
                            <span class="size-text">{{ totalSize }}<span class="size-limit">/5MB</span></span>
                        </div>
                    </Transition>
                </div>
            </template>

            <!-- ===== CONTENT ===== -->
            <template #content="{ files, removeFileCallback }">
                <div class="content-area" v-if="deletableFiles.length > 0 || files.length > 0">

                    <!-- Existing files -->
                    <template v-if="deletableFiles.length > 0">
                        <div class="section-header">
                            <span class="section-dot dot-green" />
                            <span class="section-title">محفوظة</span>
                            <span class="section-badge">{{ deletableFiles.length }}</span>
                        </div>
                        <div class="image-grid">
                            <div
                                v-for="(file, idx) in deletableFiles"
                                :key="file.id"
                                class="img-thumb"
                                @click="openLightbox(allImages, idx)"
                            >
                                <img 
                                    :src="file.file_url" 
                                    :alt="file.file_name" 
                                    @error="(e) => (e.target as HTMLImageElement).src = './img-not-found.avif'"

                                />
                                <div class="thumb-overlay"><i class="pi pi-eye" /></div>
                                <!-- <button class="thumb-delete" type="button" @click.stop="handleDeleteExistingFile(file.id)" title="حذف">
                                    <i class="fas fa-home" />
                                </button> -->
                                <Button
                                    class="thumb-delete"
                                    icon="fas fa-times"
                                    severity="danger"
                                    @click.stop="handleDeleteExistingFile(file.id)"
                                    title="حذف"
                                    />
                                
                            </div>
                        </div>
                    </template>

                    <!-- New files -->
                    <template v-if="files.length > 0">
                        <div class="section-header">
                            <span class="section-dot dot-blue" />
                            <span class="section-title">جديدة</span>
                            <span class="section-badge">{{ files.length }}</span>
                        </div>
                        <div class="image-grid">
                            <div
                                v-for="(file, index) of files"
                                :key="file.name + file.size"
                                class="img-thumb img-thumb--new"
                                @click="openLightboxFromFile(index)"
                            >
                                <img v-if="previewUrls[file.name + file.size]" :src="previewUrls[file.name + file.size]" :alt="file.name" />
                                <div class="thumb-placeholder" v-else><i class="pi pi-image" /></div>
                                <div class="thumb-overlay"><i class="pi pi-eye" /></div>
                                <button class="thumb-delete" type="button" @click.stop="onRemoveTemplatingFile(file, removeFileCallback, index)" title="حذف">
                                    <i class="pi pi-times" />
                                </button>
                                <Button 
                                    icon="fas fa-times"
                                    class="thumb-delete"
                                    @click.stop="onRemoveTemplatingFile(file, removeFileCallback, index)"
                                    title="حذف"
                                    severity="danger"
                                    />
                                <span class="thumb-size">{{ formatSize(file.size) }}</span>
                            </div>
                        </div>
                    </template>

                </div>
            </template>

            <!-- ===== EMPTY STATE ===== -->
            <template #empty>
                <div class="drop-zone" v-if="deletableFiles.length === 0">
                    <div class="drop-icon-wrap">
                        <div class="drop-ring" />
                        <i class="pi pi-cloud-upload drop-icon" />
                    </div>
                    <p class="drop-title">اسحب الصور هنا أو اضغط إضافة</p>
                    <div class="drop-types">
                        <span class="type-chip">JPG</span>
                        <span class="type-chip">PNG</span>
                        <span class="type-chip">JPEG</span>
                        <span class="type-chip type-chip--limit">max 5MB</span>
                    </div>
                </div>
            </template>
        </FileUpload>

        <!-- ===== GALLERIA LIGHTBOX ===== -->
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
                    class="galleria-main-img"
                    :style="{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }"
                    @error="(e) => (e.target as HTMLImageElement).src = './img-not-found.avif'"

                />
            </template>

            <template #thumbnail="slotProps">
                {{ console.log(slotProps) }}
                <img
                    :src="slotProps.item.src"
                    :alt="slotProps.item.name"
                    class="galleria-thumb-img"
                />
            </template>

            <template #footer>
                <div class="galleria-footer" dir="rtl">
                    <div class="galleria-footer-info">
                        <span class="lb-counter">{{ lightboxIndex + 1 }} / {{ lightboxItems.length }}</span>
                        <span class="lb-name">{{ lightboxItems[lightboxIndex]?.name }}</span>
                    </div>
                    <div class="lb-controls">
                        <button class="ctrl-btn" @click="zoomOut" :disabled="zoomLevel <= 0.5" title="تصغير"><i class="pi pi-minus" /></button>
                        <span class="ctrl-label">{{ Math.round(zoomLevel * 100) }}%</span>
                        <button class="ctrl-btn" @click="zoomIn" :disabled="zoomLevel >= 3" title="تكبير"><i class="pi pi-plus" /></button>
                        <div class="ctrl-sep" />
                        <button class="ctrl-btn" @click="rotateLeft" title="تدوير يساراً"><i class="pi pi-undo" /></button>
                        <button class="ctrl-btn" @click="rotateRight" title="تدوير يميناً"><i class="pi pi-refresh" /></button>
                        <div class="ctrl-sep" />
                        <button class="ctrl-btn" @click="resetTransform" title="إعادة تعيين"><i class="pi pi-expand" /></button>
                        <div class="ctrl-sep" />
                        <a
                            :href="lightboxItems[lightboxIndex]?.src"
                            :download="lightboxItems[lightboxIndex]?.name"
                            class="ctrl-btn"
                            title="تنزيل"
                            @click.stop
                        ><i class="pi pi-download" /></a>
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
import { usePrimeVue } from 'primevue/config';
import { useToast } from 'primevue/usetoast';
import api from '../../../api/api';
import Button from 'primevue/button';
import { useConfirm } from "primevue/useconfirm";

interface LightboxItem { src: string; name: string; }

const props = defineProps<{ existingFiles?: any[] }>();
const emit = defineEmits<{ (e: 'update:files', files: File[]): void }>();

const toast = useToast();
const confirm = useConfirm(); // Confirm dialog
const $primevue = usePrimeVue();
const { existingFiles } = toRefs(props);

// State
const deletableFiles = ref<any[]>([]);
const totalSize = ref('0 B');
const totalSizePercent = ref(0);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const previewUrls = ref<Record<string, string>>({});
const newFiles = ref<File[]>([]);

// Lightbox
const lightboxOpen = ref(false);
const lightboxItems = ref<LightboxItem[]>([]);
const lightboxIndex = ref(0);
const zoomLevel = ref(1);
const rotation = ref(0);

// Galleria responsive options
const galleriaResponsiveOptions = ref([
    { breakpoint: '1500px', numVisible: 7 },
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px',  numVisible: 3 },
    { breakpoint: '560px',  numVisible: 2 },
]);

// Computed
const allImages = computed<LightboxItem[]>(() =>
    deletableFiles.value.map(f => ({
        src: f.file_url,
        name: f.file_name
    }))
);

const allNewImages = computed<LightboxItem[]>(() =>
    newFiles.value
        .filter(f => previewUrls.value[f.name + f.size])
        .map(f => ({ src: previewUrls.value[f.name + f.size], name: f.name }))
);

watch(existingFiles, val => {
    deletableFiles.value = val ? [...val] : [];
}, { immediate: true });

// Reset zoom/rotation when index changes
watch(lightboxIndex, () => resetTransform());

// Lightbox methods
const openLightbox = (items: LightboxItem[], index: number) => {
    lightboxItems.value = items;
    lightboxIndex.value = index;
    zoomLevel.value = 1;
    rotation.value = 0;
    lightboxOpen.value = true;
};

const openLightboxFromFile = (index: number) => openLightbox(allNewImages.value, index);

const closeLightbox = () => {
    lightboxOpen.value = false;
};

const zoomIn  = () => { zoomLevel.value = Math.min(3, +(zoomLevel.value + 0.25).toFixed(2)); };
const zoomOut = () => { zoomLevel.value = Math.max(0.5, +(zoomLevel.value - 0.25).toFixed(2)); };
const rotateLeft  = () => { rotation.value -= 90; };
const rotateRight = () => { rotation.value += 90; };
const resetTransform = () => { zoomLevel.value = 1; rotation.value = 0; };

const onKeydown = (e: KeyboardEvent) => {
    if (!lightboxOpen.value) return;
    if (e.key === 'Escape') closeLightbox();
};
window.addEventListener('keydown', onKeydown);
onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
    Object.values(previewUrls.value).forEach(url => URL.revokeObjectURL(url));
});

// Delete (Optimistic)
const handleDeleteExistingFile = async (imageId: number) => {
    confirm.require({
        header: 'تأكيد الحذف',
        message: 'هل انت متاكد من حذف بيانات الصورة؟',
        icon: 'fa-solid fa-triangle-exclamation text-yellow-200',
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass:"p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass:"p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: async()=>{
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
        reject: ()=>{}
    })
    
};

// File events
const generatePreviews = (files: File[]) => {
    Object.values(previewUrls.value).forEach(url => URL.revokeObjectURL(url));
    const map: Record<string, string> = {};
    files.forEach(f => {
        if (f.type.startsWith('image/')) map[f.name + f.size] = URL.createObjectURL(f);
    });
    previewUrls.value = map;
};

const onSelectedFiles = (event: any) => {
    const selected: File[] = event.files;
    newFiles.value = selected;
    const total = selected.reduce((s, f) => s + f.size, 0);
    totalSize.value = formatSize(total);
    totalSizePercent.value = Math.min((total / MAX_SIZE_BYTES) * 100, 100);
    generatePreviews(selected);
    emit('update:files', selected);
};

const onRemoveTemplatingFile = (file: File, removeFileCallback: Function, index: number) => {
    confirm.require({
        header: 'تأكيد الحذف',
        message: 'هل انت متاكد من حذف بيانات الصورة؟',
        icon: 'fa-solid fa-triangle-exclamation text-yellow-200',
        acceptLabel: "تأكيد",
        acceptIcon: "pi pi-check",
        acceptClass:"p-button-sm border border-red-500 bg-red-500 text-white",
        rejectLabel: "إلغاء",
        rejectIcon: "pi pi-times",
        rejectClass:"p-button-sm border border-gray-400 text-gray-600 bg-transparent hover:bg-gray-200",
        accept: async()=>{removeFileCallback(index);},
        reject: ()=>{}
    })
};

const onRemoveFile = (event: any) => {
    const remaining: File[] = event.files;
    newFiles.value = remaining;
    const total = remaining.reduce((s: number, f: File) => s + f.size, 0);
    totalSize.value = formatSize(total);
    totalSizePercent.value = Math.min((total / MAX_SIZE_BYTES) * 100, 100);
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
.upload-wrapper { font-family: 'Tajawal', 'Cairo', sans-serif; }

.upload-wrapper :deep(.p-fileupload) {
    border: 1.5px dashed #3f3f46;
    border-radius: 14px;
    background: rgba(109,109,109,0.13);
    overflow: hidden;
}
.upload-wrapper :deep(.p-fileupload-header) {
    background: transparent;
    border-bottom: 1px solid #3f3f46;
    padding: 0.6rem 0.9rem;
}
.upload-wrapper :deep(.p-fileupload-content) {
    background: transparent;
    padding: 0;
}

/* Header */
.upload-header { display: flex; align-items: center; gap: 0.75rem; }
.header-actions { display: flex; align-items: center; gap: 0.4rem; }

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid transparent;
    transition: all 0.18s ease;
    font-family: inherit;
    padding: 0.35rem 0.75rem;
}

.btn-choose { background: transparent; border-color: #f59e0b; color: #f59e0b; }
.btn-choose:hover { background: #f59e0b; color: #fff; }
.btn-clear { background: transparent; border-color: #ef4444; color: #ef4444; padding: 0.35rem 0.6rem; }
.btn-clear:hover:not(:disabled) { background: #ef4444; color: #fff; }
.btn-clear:disabled { opacity: 0.3; cursor: not-allowed; }

/* Progress */
.size-tracker { display: flex; align-items: center; gap: 0.5rem; margin-right: auto; flex: 1; max-width: 180px; }
.progress-track { flex: 1; height: 4px; background: #3f3f46; border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 99px; transition: width 0.35s ease; }
.progress-safe   { background: #22c55e; }
.progress-warn   { background: #f59e0b; }
.progress-danger { background: #ef4444; }
.size-text { font-size: 0.68rem; font-weight: 700; color: #94a3b8; white-space: nowrap; }
.size-limit { color: #64748b; margin-right: 1px; }

/* Content */
.content-area { padding: 0.75rem 0.9rem 0.9rem; display: flex; flex-direction: column; gap: 0.5rem; }

/* Section header */
.section-header { display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.35rem; }
.section-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.dot-green { background: #22c55e; }
.dot-blue  { background: #3b82f6; }
.section-title { font-size: 0.7rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase; }
.section-badge { font-size: 0.6rem; font-weight: 700; background: #334155; color: #94a3b8; padding: 0.1rem 0.4rem; border-radius: 99px; }

/* Image grid */
.image-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }

/* Thumbnail */
.img-thumb {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
    background: #1e293b;
    flex-shrink: 0;
}
.img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.25s; }
.img-thumb:hover { border-color: #64748b; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.25); }
.img-thumb:hover img { transform: scale(1.07); }
.img-thumb--new { border-color: #1e3a5f; }

.thumb-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.18s;
    color: #fff; font-size: 1rem;
}
.img-thumb:hover .thumb-overlay { opacity: 1; }

.thumb-delete {
    position: absolute; top: 4px; left: 4px;
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.5rem; cursor: pointer;
    opacity: 0; transform: scale(0.6);
    transition: opacity 0.18s, transform 0.18s;
    z-index: 3; box-shadow: 0 2px 6px rgba(239,68,68,0.5);
}
.img-thumb:hover .thumb-delete { 
    opacity: 1; 
    transform: scale(1); 
}

.thumb-size {
    position: absolute; bottom: 4px; right: 4px;
    font-size: 0.5rem; font-weight: 700;
    background: rgba(0,0,0,0.65); color: #e2e8f0;
    padding: 0.1rem 0.3rem; border-radius: 4px; pointer-events: none;
}

.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 1.4rem; }

/* Drop zone */
.drop-zone { display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; gap: 0.45rem; }
.drop-icon-wrap { position: relative; width: 56px; height: 56px; margin-bottom: 0.3rem; }
.drop-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px dashed #3f3f46; animation: spin-slow 12s linear infinite; }
@keyframes spin-slow { to { transform: rotate(360deg); } }
.drop-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #475569; }
.drop-title { font-size: 0.82rem; font-weight: 600; color: #64748b; margin: 0; text-align: center; }
.drop-types { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.3rem; margin-top: 0.25rem; }
.type-chip { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 99px; background: #1e293b; color: #64748b; }
.type-chip--limit { background: #451a03; color: #fb923c; }

/* Galleria main image */
.galleria-main-img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    display: block;
    border-radius: 8px;
    transition: transform 0.3s ease;
    user-select: none;
    -webkit-user-drag: none;
}

/* Galleria thumbnail */
.galleria-thumb-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    display: block;
    border-radius: 6px;
}

/* Galleria footer */
.galleria-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.55rem 1rem;
    background: rgba(10, 15, 26, 0.95);
    border-top: 1px solid #1e293b;
    font-family: 'Tajawal', 'Cairo', sans-serif;
    flex-wrap: wrap;
}

.galleria-footer-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
}

/* Controls (shared between old lightbox and new footer) */
.lb-controls {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    direction: ltr;
}

.lb-counter {
    font-size: 0.68rem;
    font-weight: 700;
    color: #475569;
    background: #1e293b;
    padding: 0.15rem 0.5rem;
    border-radius: 99px;
    white-space: nowrap;
}

.lb-name {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
}

.ctrl-btn {
    width: 28px; height: 28px; border-radius: 7px;
    background: #1e293b; border: 1.5px solid #334155; color: #64748b;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; cursor: pointer; transition: all 0.15s;
    text-decoration: none;
}
.ctrl-btn:hover:not(:disabled) { background: #334155; color: #e2e8f0; }
.ctrl-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.ctrl-label { font-size: 0.65rem; font-weight: 700; color: #475569; min-width: 34px; text-align: center; font-family: monospace; }
.ctrl-sep { width: 1px; height: 18px; background: #1e293b; margin: 0 0.15rem; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>