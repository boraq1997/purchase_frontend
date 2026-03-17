<template>
    <div class="image-gallery flex flex-wrap gap-2">
        <div
            v-for="(img, idx) in images"
            :key="img.id"
            class="image-thumb cursor-pointer border-round overflow-hidden border-1 border-200"
            style="width:72px; height:56px"
            @click="openAt(idx)"
        >
            <img
                :src="img.file_url ?? ''"
                :alt="img.file_name"
                style="width:100%; height:100%; object-fit:cover"
                @error="onImgError"
            />
        </div>

        <!-- فتح الـ Galleria -->
        <Galleria
            v-model:visible="visible"
            v-model:activeIndex="activeIdx"
            :value="images"
            :num-visible="5"
            :circular="true"
            :full-screen="true"
            :show-item-navigators="true"
            :show-thumbnails="images.length > 1"
        >
            <template #item="{ item }">
                <img
                    :src="item.file_url"
                    :alt="item.file_name"
                    style="max-width:100%; max-height:80vh; object-fit:contain"
                />
            </template>
            <template #thumbnail="{ item }">
                <img
                    :src="item.file_url"
                    :alt="item.file_name"
                    style="width:64px; height:44px; object-fit:cover"
                />
            </template>
            <template #caption="{ item }">
                <div class="text-center text-sm text-white p-2">{{ item.file_name }}</div>
            </template>
        </Galleria>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Galleria from 'primevue/galleria'
import type { ReportImage } from '../reportService'

defineProps<{ images: ReportImage[] }>()

const visible   = ref(false)
const activeIdx = ref(0)

function openAt(idx: number) {
    activeIdx.value = idx
    visible.value   = true
}

function onImgError(e: Event) {
    const img = e.target as HTMLImageElement
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="72" height="56"%3E%3Crect width="72" height="56" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="10"%3E404%3C/text%3E%3C/svg%3E'
}
</script>

<style scoped>
.image-thumb { transition: transform .15s, box-shadow .15s; }
.image-thumb:hover { transform: scale(1.06); box-shadow: 0 2px 10px rgba(0,0,0,.15); }
</style>