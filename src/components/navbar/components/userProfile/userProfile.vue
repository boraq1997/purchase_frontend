<template>
  <div class="surface-ground min-h-screen p-3 md:p-4" dir="rtl">
    <div class="max-w-7xl mx-auto flex flex-column gap-4">

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- HERO CARD                                                  -->
      <!-- ══════════════════════════════════════════════════════════ -->
      <Card class="shadow-3 border-round-2xl overflow-hidden">
        <template #content>
          <!-- Gradient top bar -->
          <div class="h-1rem w-full"
               style="background:linear-gradient(90deg,var(--primary-color),var(--purple-400));
                      margin:-1.25rem -1.25rem 1.25rem -1.25rem;
                      width:calc(100% + 2.5rem);">
          </div>

          <div class="flex flex-column md:flex-row align-items-center md:align-items-start gap-4">

            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <div class="border-circle p-1"
                   style="background:linear-gradient(135deg,var(--primary-color),var(--purple-400));
                          box-shadow:0 6px 20px -4px color-mix(in srgb,var(--primary-color) 40%,transparent);">
                <Avatar icon="pi pi-user" shape="circle"
                        class="surface-card text-primary"
                        style="width:96px;height:96px;font-size:2.5rem;" />
              </div>
              <span v-if="userInfo?.status === 'active'"
                    class="absolute border-circle bg-green-500 border-2 surface-card"
                    style="width:16px;height:16px;bottom:6px;right:6px;box-shadow:0 0 0 3px color-mix(in srgb,var(--green-500) 25%,transparent);">
              </span>
            </div>

            <!-- Name & chips -->
            <div class="flex-1 text-center md:text-right">
              <div class="flex align-items-center justify-content-center md:justify-content-start gap-2 mb-1">
                <span class="text-3xl font-bold text-900">{{ userInfo?.name }}</span>
                <i v-if="userInfo?.email_verified_at"
                   class="pi pi-verified text-primary text-xl" v-tooltip.top="'حساب موثق'" />
              </div>
              <p class="text-500 text-lg mt-0 mb-3">@{{ userInfo?.username }}</p>
              <div class="flex flex-wrap align-items-center justify-content-center md:justify-content-start gap-2">
                <Chip :label="userInfo?.roles?.[0]?.name || 'مستخدم'" icon="pi pi-shield"
                      class="font-semibold text-sm border-1"
                      style="background:color-mix(in srgb,var(--primary-color) 10%,transparent);
                             color:var(--primary-color);border-color:color-mix(in srgb,var(--primary-color) 25%,transparent);" />
                <Chip v-if="userInfo?.status === 'active'" label="نشط الآن" icon="pi pi-circle-fill"
                      class="font-semibold text-sm border-1"
                      style="background:color-mix(in srgb,var(--green-500) 10%,transparent);
                             color:var(--green-600);border-color:color-mix(in srgb,var(--green-500) 25%,transparent);" />
                <Chip v-if="userInfo?.email_verified_at" label="موثق" icon="pi pi-check-circle"
                      class="font-semibold text-sm border-1"
                      style="background:color-mix(in srgb,var(--blue-500) 10%,transparent);
                             color:var(--blue-600);border-color:color-mix(in srgb,var(--blue-500) 25%,transparent);" />
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex flex-column gap-2 flex-shrink-0">
              <Button label="تعديل الملف" icon="pi pi-user-edit" @click="editProfile"
                      class="white-space-nowrap"
                      style="background:linear-gradient(135deg,var(--primary-color),var(--purple-400));border:none;
                             box-shadow:0 4px 14px -3px color-mix(in srgb,var(--primary-color) 45%,transparent);" />
              <Button label="تغيير كلمة المرور" icon="pi pi-lock"
                      severity="secondary" outlined @click="changePassword"
                      class="white-space-nowrap" />
            </div>
          </div>
        </template>
      </Card>

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- STAT CARDS                                                 -->
      <!-- ══════════════════════════════════════════════════════════ -->
      <div class="grid">
        <div v-for="stat in statItems" :key="stat.key" class="col-12 sm:col-6 lg:col-3">
          <Card class="shadow-2 border-round-xl h-full stat-card-hover">
            <template #content>
              <div class="flex align-items-center gap-3 p-1">
                <div class="border-round-xl p-3 flex align-items-center justify-content-center flex-shrink-0"
                     :style="`background:color-mix(in srgb,var(--${stat.color}-500) 12%,transparent);min-width:3rem;min-height:3rem;`">
                  <i :class="`pi ${stat.icon} text-${stat.color}-500 text-2xl`"></i>
                </div>
                <div>
                  <p class="text-500 font-medium text-sm m-0 mb-1">{{ stat.label }}</p>
                  <span class="text-900 font-bold text-4xl">{{ stat.value }}</span>
                </div>
              </div>
              <div class="mt-3 border-round overflow-hidden surface-100" style="height:4px;">
                <div class="h-full border-round"
                     :style="`background:var(--${stat.color}-500);width:${stat.fill}%;opacity:.75;`"></div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- INFO ROW                                                   -->
      <!-- ══════════════════════════════════════════════════════════ -->
      <div class="grid">

        <!-- Contact -->
        <div class="col-12 lg:col-6">
          <Card class="shadow-2 border-round-xl h-full">
            <template #title>
              <div class="flex align-items-center gap-2 pt-1">
                <div class="border-round-lg p-2"
                     style="background:color-mix(in srgb,var(--primary-color) 12%,transparent);">
                  <i class="pi pi-address-book text-primary"></i>
                </div>
                <span class="text-900 font-bold">معلومات الاتصال</span>
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-2">

                <div class="surface-50 border-round-lg p-3 border-1 surface-border info-hover">
                  <div class="flex align-items-center justify-content-between gap-2">
                    <div class="flex align-items-center gap-3 flex-1 min-w-0">
                      <div class="border-round p-2 flex-shrink-0"
                           style="background:color-mix(in srgb,var(--blue-500) 12%,transparent);">
                        <i class="pi pi-envelope text-blue-500"></i>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-500 text-xs m-0 mb-1">البريد الإلكتروني</p>
                        <p class="text-900 font-semibold m-0 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                          {{ userInfo?.email }}
                        </p>
                      </div>
                    </div>
                    <div class="flex align-items-center gap-2 flex-shrink-0">
                      <Tag v-if="userInfo?.email_verified_at" value="موثق" severity="success" icon="pi pi-check" />
                      <Button icon="pi pi-copy" rounded text size="small"
                              @click="copyToClipboard(userInfo?.email)" v-tooltip.top="'نسخ'" />
                    </div>
                  </div>
                </div>

                <div class="surface-50 border-round-lg p-3 border-1 surface-border info-hover">
                  <div class="flex align-items-center justify-content-between gap-2">
                    <div class="flex align-items-center gap-3 flex-1">
                      <div class="border-round p-2 flex-shrink-0"
                           style="background:color-mix(in srgb,var(--purple-500) 12%,transparent);">
                        <i class="pi pi-phone text-purple-500"></i>
                      </div>
                      <div>
                        <p class="text-500 text-xs m-0 mb-1">رقم الهاتف</p>
                        <p class="text-900 font-semibold m-0">{{ userInfo?.phone || 'غير محدد' }}</p>
                      </div>
                    </div>
                    <Button v-if="userInfo?.phone" icon="pi pi-copy" rounded text size="small"
                            @click="copyToClipboard(userInfo?.phone)" v-tooltip.top="'نسخ'" />
                  </div>
                </div>

                <div class="surface-50 border-round-lg p-3 border-1 surface-border info-hover">
                  <div class="flex align-items-center gap-3">
                    <div class="border-round p-2 flex-shrink-0"
                         style="background:color-mix(in srgb,var(--orange-500) 12%,transparent);">
                      <i class="pi pi-building text-orange-500"></i>
                    </div>
                    <div>
                      <p class="text-500 text-xs m-0 mb-1">القسم</p>
                      <p class="text-900 font-semibold m-0">{{ userInfo?.department?.name || 'غير محدد' }}</p>
                    </div>
                  </div>
                </div>

              </div>
            </template>
          </Card>
        </div>

        <!-- System -->
        <div class="col-12 lg:col-6">
          <Card class="shadow-2 border-round-xl h-full">
            <template #title>
              <div class="flex align-items-center gap-2 pt-1">
                <div class="border-round-lg p-2"
                     style="background:color-mix(in srgb,var(--primary-color) 12%,transparent);">
                  <i class="pi pi-cog text-primary"></i>
                </div>
                <span class="text-900 font-bold">معلومات النظام</span>
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-2">

                <div class="surface-50 border-round-lg p-3 border-1 surface-border info-hover">
                  <div class="flex align-items-center justify-content-between gap-2">
                    <div class="flex align-items-center gap-3 flex-1">
                      <div class="border-round p-2 flex-shrink-0"
                           style="background:color-mix(in srgb,var(--green-500) 12%,transparent);">
                        <i class="pi pi-id-card text-green-500"></i>
                      </div>
                      <div>
                        <p class="text-500 text-xs m-0 mb-1">معرف المستخدم</p>
                        <p class="text-900 font-semibold m-0 font-mono">
                          #{{ String(userInfo?.id || 0).padStart(8,'0') }}
                        </p>
                      </div>
                    </div>
                    <Button icon="pi pi-copy" rounded text size="small"
                            @click="copyToClipboard(String(userInfo?.id))" v-tooltip.top="'نسخ'" />
                  </div>
                </div>

                <div class="surface-50 border-round-lg p-3 border-1 surface-border info-hover">
                  <div class="flex align-items-center gap-3">
                    <div class="border-round p-2 flex-shrink-0"
                         style="background:color-mix(in srgb,var(--blue-500) 12%,transparent);">
                      <i class="pi pi-calendar-plus text-blue-500"></i>
                    </div>
                    <div>
                      <p class="text-500 text-xs m-0 mb-1">تاريخ الانضمام</p>
                      <p class="text-900 font-semibold m-0 mb-2">{{ formatDate(userInfo?.created_at) }}</p>
                      <Tag :value="`${getJoinDays()} يوم`" severity="info" />
                    </div>
                  </div>
                </div>

                <div class="surface-50 border-round-lg p-3 border-1 surface-border info-hover">
                  <div class="flex align-items-center gap-3">
                    <div class="border-round p-2 flex-shrink-0"
                         style="background:color-mix(in srgb,var(--purple-500) 12%,transparent);">
                      <i class="pi pi-clock text-purple-500"></i>
                    </div>
                    <div>
                      <p class="text-500 text-xs m-0 mb-1">آخر نشاط</p>
                      <p class="text-900 font-semibold m-0 mb-2">{{ formatDate(userInfo?.updated_at) }}</p>
                      <Tag :value="getTimeAgo(userInfo?.updated_at)" severity="success" />
                    </div>
                  </div>
                </div>

              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- ROLES & PERMISSIONS                                        -->
      <!-- ══════════════════════════════════════════════════════════ -->
      <Card class="shadow-2 border-round-xl">
        <template #title>
          <div class="flex align-items-center gap-2 pt-1">
            <div class="border-round-lg p-2"
                 style="background:color-mix(in srgb,var(--primary-color) 12%,transparent);">
              <i class="pi pi-shield text-primary"></i>
            </div>
            <span class="text-900 font-bold">الأدوار والصلاحيات</span>
          </div>
        </template>
        <template #content>
          <TabView>
            <TabPanel value="roles">
              <template #header>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-star"></i><span>الأدوار</span>
                  <Badge value="1" severity="info" />
                </div>
              </template>
              <div v-if="userInfo?.roles" class="grid mt-2">
                <div>
                  <p class="text-900 font-bold m-0 mb-1">{{ userInfo?.roles[0].name }}</p>
                  <p class="text-500 text-sm m-0 mb-2">{{ userInfo?.roles[0].guard_name }}</p>
                  <div class="flex align-items-center gap-1 text-500 text-xs">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatDate(userInfo?.roles[0].created_at) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-column align-items-center justify-content-center p-6 gap-3">
                <i class="pi pi-inbox text-400 text-6xl"></i>
                <p class="text-600 font-semibold text-xl m-0">لا توجد أدوار مسندة</p>
              </div>
            </TabPanel>

            <TabPanel value="permissions">
              <template #header>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-key"></i><span>الصلاحيات</span>
                  <Badge :value="calculateTotalPermissions()" severity="success" />
                </div>
              </template>
              <div v-if="userInfo?.permissions?.length || userInfo?.roles?.length" class="flex flex-column gap-4 mt-2">
                <div v-if="userInfo?.permissions?.length">
                  <div class="flex align-items-center gap-2 mb-3">
                    <i class="pi pi-bolt text-orange-500"></i>
                    <span class="text-900 font-bold">صلاحيات مباشرة</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <Chip v-for="p in userInfo.permissions" :key="p.id"
                          :label="p" icon="pi pi-check"
                          class="font-semibold text-sm border-1"
                          style="background:color-mix(in srgb,var(--green-500) 10%,transparent);
                                 color:var(--green-600);border-color:color-mix(in srgb,var(--green-500) 22%,transparent);" />
                  </div>
                </div>
                <Divider v-if="userInfo?.permissions?.length && userInfo?.roles?.length" />
                <div v-if="userInfo?.roles?.length">
                  <div class="flex align-items-center gap-2 mb-3">
                    <i class="pi pi-shield text-blue-500"></i>
                    <span class="text-900 font-bold">صلاحيات الأدوار</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <Chip
                      v-for="perm in userInfo?.permissions"
                      :key="perm.id || perm.name"
                      :icon="'pi pi-check-circle'"
                      :label="perm.name"
                      class="font-semibold text-sm border-1"
                      :style="{
                        background: `color-mix(in srgb, var(--blue-500) 10%, transparent)`,
                        color: 'var(--blue-600)',
                        borderColor: `color-mix(in srgb, var(--blue-500) 22%, transparent)`
                      }"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-column align-items-center justify-content-center p-6 gap-3">
                <i class="pi pi-lock text-400 text-6xl"></i>
                <p class="text-600 font-semibold text-xl m-0">لا توجد صلاحيات</p>
              </div>
            </TabPanel>
          </TabView>
        </template>
      </Card>

      <!-- ══════════════════════════════════════════════════════════ -->
      <!-- ACTIVITY                                                   -->
      <!-- ══════════════════════════════════════════════════════════ -->
      <Card class="shadow-2 border-round-xl">
        <template #title>
          <div class="flex align-items-center gap-2 pt-1">
            <div class="border-round-lg p-2"
                 style="background:color-mix(in srgb,var(--primary-color) 12%,transparent);">
              <i class="pi pi-chart-line text-primary"></i>
            </div>
            <span class="text-900 font-bold">النشاط والمشاركة</span>
          </div>
        </template>
        <template #content>
          <TabView>
            <TabPanel value="committees">
              <template #header>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-users"></i><span>اللجان</span>
                  <Badge :value="userInfo?.committees?.length || 0" />
                </div>
              </template>
              <div v-if="userInfo?.committees?.length">
                <Timeline :value="userInfo.committees" align="right">
                  <template #marker>
                    <div class="border-circle p-2 flex align-items-center justify-content-center"
                         style="background:color-mix(in srgb,var(--primary-color) 12%,transparent);min-width:2.5rem;min-height:2.5rem;">
                      <i class="pi pi-users text-primary"></i>
                    </div>
                  </template>
                  <template #content="{ item }">
                    <Card class="surface-50 shadow-1 border-1 surface-border border-round-xl mb-3">
                      <template #content>
                        <div class="flex align-items-start justify-content-between mb-2">
                          <p class="text-900 font-bold text-lg m-0">{{ item.name || 'لجنة' }}</p>
                          <Tag value="نشط" severity="success" />
                        </div>
                        <p class="text-600 text-sm m-0 mb-3">{{ item.description || 'لجنة نشطة ومشاركة فعالة' }}</p>
                        <div class="flex align-items-center gap-2 text-500 text-sm">
                          <i class="pi pi-calendar"></i>
                          <span>{{ formatDate(item.created_at) }}</span>
                        </div>
                      </template>
                    </Card>
                  </template>
                </Timeline>
              </div>
              <div v-else class="flex flex-column align-items-center justify-content-center p-6 gap-3">
                <i class="pi pi-users text-400 text-6xl"></i>
                <p class="text-600 font-semibold text-xl m-0">لا توجد لجان</p>
                <Button label="استكشاف اللجان" icon="pi pi-plus" outlined />
              </div>
            </TabPanel>

            <TabPanel value="sessions">
              <template #header>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-calendar"></i><span>الجلسات</span>
                  <Badge :value="userInfo?.sessions?.length || 0" severity="info" />
                </div>
              </template>
              <div v-if="userInfo?.sessions?.length">
                <Timeline :value="userInfo.sessions" align="right">
                  <template #marker>
                    <div class="border-circle p-2 flex align-items-center justify-content-center"
                         style="background:color-mix(in srgb,var(--blue-500) 12%,transparent);min-width:2.5rem;min-height:2.5rem;">
                      <i class="pi pi-calendar text-blue-500"></i>
                    </div>
                  </template>
                  <template #content="{ item }">
                    <Card class="surface-50 shadow-1 border-1 surface-border border-round-xl mb-3">
                      <template #content>
                        <div class="flex align-items-start justify-content-between mb-2">
                          <p class="text-900 font-bold text-lg m-0">{{ item.name || 'جلسة' }}</p>
                          <Tag value="مجدولة" severity="info" />
                        </div>
                        <p class="text-600 text-sm m-0 mb-3">{{ item.description || 'جلسة مجدولة للمناقشة' }}</p>
                        <div class="flex align-items-center gap-2 text-500 text-sm">
                          <i class="pi pi-clock"></i>
                          <span>{{ formatDate(item.date) }}</span>
                        </div>
                      </template>
                    </Card>
                  </template>
                </Timeline>
              </div>
              <div v-else class="flex flex-column align-items-center justify-content-center p-6 gap-3">
                <i class="pi pi-calendar text-400 text-6xl"></i>
                <p class="text-600 font-semibold text-xl m-0">لا توجد جلسات</p>
                <Button label="عرض الجلسات المتاحة" icon="pi pi-calendar-plus" outlined />
              </div>
            </TabPanel>
          </TabView>
        </template>
      </Card>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Card     from 'primevue/card';
import Button   from 'primevue/button';
import Avatar   from 'primevue/avatar';
import Badge    from 'primevue/badge';
import Chip     from 'primevue/chip';
import Tag      from 'primevue/tag';
import Divider  from 'primevue/divider';
import TabView  from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Timeline from 'primevue/timeline';
import { useToast } from 'primevue/usetoast';
import navbarService from '../../navbarServices';

const emit = defineEmits(['close']);
const toast = useToast();
const userInfo = ref<any>(null);

const getUserInfo = async () => {
  try {
    const res = await navbarService.getUserProfileInfo();
    userInfo.value = res.data.data || res;
    console.log(userInfo.value.roles.name)
  } catch {
    toast.add({ severity:'error', summary:'خطأ', detail:'فشل في تحميل معلومات المستخدم', life:3000 });
  }
};

const formatDate = (d: string) => {
  if (!d) return 'غير محدد';
  return new Date(d).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' });
};

const getTimeAgo = (d: string) => {
  if (!d) return '';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60)       return 'الآن';
  if (s < 3600)     return `منذ ${Math.floor(s/60)} دقيقة`;
  if (s < 86400)    return `منذ ${Math.floor(s/3600)} ساعة`;
  if (s < 172800)   return 'أمس';
  if (s < 604800)   return `منذ ${Math.floor(s/86400)} أيام`;
  if (s < 2592000)  return `منذ ${Math.floor(s/604800)} أسابيع`;
  if (s < 31536000) return `منذ ${Math.floor(s/2592000)} أشهر`;
  return `منذ ${Math.floor(s/31536000)} سنوات`;
};

const getJoinDays = () => {
  if (!userInfo.value?.created_at) return 0;
  return Math.ceil(Math.abs(Date.now() - new Date(userInfo.value.created_at).getTime()) / 86400000);
};

const calculateTotalPermissions = () =>
  (userInfo.value?.permissions?.length || 0) + (userInfo.value?.roles?.length || 0) * 10;

// Stat cards config
const statItems = computed(() => [
  { key:'committees', label:'اللجان النشطة',    icon:'pi-users',    color:'blue',   value: userInfo.value?.committees?.length || 0, fill:65 },
  { key:'sessions',   label:'الجلسات المجدولة', icon:'pi-calendar', color:'purple', value: userInfo.value?.sessions?.length   || 0, fill:45 },
  { key:'roles',      label:'الأدوار المسندة',  icon:'pi-star',     color:'orange', value: userInfo.value?.roles?.length      || 0, fill:30 },
  { key:'perms',      label:'الصلاحيات',        icon:'pi-key',      color:'green',  value: calculateTotalPermissions(),            fill:80 },
]);

const copyToClipboard = (t: string) => {
  navigator.clipboard.writeText(t);
  toast.add({ severity:'success', summary:'تم النسخ', detail:'تم نسخ النص بنجاح', life:2000 });
};

const editProfile    = () => console.log('Edit profile');
const changePassword = () => console.log('Change password');

onMounted(getUserInfo);
</script>

<style scoped>
.font-mono { font-family: 'Monaco','Menlo','Courier New', monospace; }

.stat-card-hover {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: default;
}
.stat-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px -6px rgba(0,0,0,.14) !important;
}

.info-hover {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.info-hover:hover {
  border-color: var(--primary-color) !important;
  box-shadow: 0 2px 10px color-mix(in srgb,var(--primary-color) 12%,transparent);
}
</style>