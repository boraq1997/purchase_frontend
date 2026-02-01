<template>
  <div class="surface-ground min-h-screen p-4">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header Card -->
      <Card class="mb-4 shadow-3">
        <template #content>
          <div class="flex flex-column md:flex-row align-items-center gap-4 p-3">
            
            <!-- Avatar -->
            <div class="relative">
              <Avatar 
                icon="pi pi-user" 
                size="xlarge" 
                shape="circle"
                class="bg-primary text-white"
                style="width: 120px; height: 120px; font-size: 3rem;"
              />
              <Badge 
                v-if="userInfo?.status === 'active'"
                value=" " 
                severity="success"
                class="absolute"
                style="bottom: 10px; right: 10px; width: 20px; height: 20px; min-width: 20px;"
              />
            </div>

            <!-- User Info -->
            <div class="flex-1 text-center md:text-right">
              <div class="flex align-items-center justify-content-center md:justify-content-start gap-2 mb-2">
                <h1 class="text-4xl font-bold m-0 text-900">{{ userInfo?.name }}</h1>
                <i 
                  v-if="userInfo?.email_verified_at"
                  class="pi pi-verified text-primary text-2xl"
                  v-tooltip.top="'موثق'"
                />
              </div>
              
              <p class="text-xl text-600 m-0 mb-3">@{{ userInfo?.username }}</p>

              <div class="flex flex-wrap align-items-center justify-content-center md:justify-content-start gap-2">
                <Chip 
                  :label="userInfo?.roles?.[0]?.name || 'مستخدم'" 
                  icon="pi pi-shield"
                  class="bg-primary-reverse text-primary font-semibold"
                />
                <Chip 
                  v-if="userInfo?.status === 'active'"
                  label="نشط الآن" 
                  icon="pi pi-circle-fill"
                  class="bg-green-50 text-green-600 font-semibold"
                />
                <Chip 
                  v-if="userInfo?.email_verified_at"
                  label="موثق" 
                  icon="pi pi-check-circle"
                  class="bg-blue-50 text-blue-600 font-semibold"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-column gap-2">
              <Button 
                label="تعديل الملف" 
                icon="pi pi-user-edit"
                @click="editProfile"
                class="white-space-nowrap"
              />
              <Button 
                label="تغيير كلمة المرور" 
                icon="pi pi-lock"
                severity="secondary"
                outlined
                @click="changePassword"
                class="white-space-nowrap"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Stats Cards -->
      <div class="grid mb-4">
        <div class="col-12 md:col-6 lg:col-3">
          <Card class="shadow-2 border-round">
            <template #content>
              <div class="flex align-items-center gap-3 p-2">
                <div class="bg-blue-100 border-round p-3">
                  <i class="pi pi-users text-blue-600 text-3xl"></i>
                </div>
                <div class="flex-1">
                  <div class="text-500 font-medium mb-1">اللجان النشطة</div>
                  <div class="text-900 font-bold text-3xl">{{ userInfo?.committees?.length || 0 }}</div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <Card class="shadow-2 border-round">
            <template #content>
              <div class="flex align-items-center gap-3 p-2">
                <div class="bg-purple-100 border-round p-3">
                  <i class="pi pi-calendar text-purple-600 text-3xl"></i>
                </div>
                <div class="flex-1">
                  <div class="text-500 font-medium mb-1">الجلسات المجدولة</div>
                  <div class="text-900 font-bold text-3xl">{{ userInfo?.sessions?.length || 0 }}</div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <Card class="shadow-2 border-round">
            <template #content>
              <div class="flex align-items-center gap-3 p-2">
                <div class="bg-orange-100 border-round p-3">
                  <i class="pi pi-star text-orange-600 text-3xl"></i>
                </div>
                <div class="flex-1">
                  <div class="text-500 font-medium mb-1">الأدوار المسندة</div>
                  <div class="text-900 font-bold text-3xl">{{ userInfo?.roles?.length || 0 }}</div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <Card class="shadow-2 border-round">
            <template #content>
              <div class="flex align-items-center gap-3 p-2">
                <div class="bg-green-100 border-round p-3">
                  <i class="pi pi-key text-green-600 text-3xl"></i>
                </div>
                <div class="flex-1">
                  <div class="text-500 font-medium mb-1">الصلاحيات</div>
                  <div class="text-900 font-bold text-3xl">{{ calculateTotalPermissions() }}</div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid">
        
        <!-- Contact Information -->
        <div class="col-12 lg:col-6">
          <Card class="shadow-2 h-full">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-address-book text-primary"></i>
                <span>معلومات الاتصال</span>
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-3">
                
                <div class="p-3 surface-50 border-round">
                  <div class="flex align-items-center justify-content-between mb-2">
                    <div class="flex align-items-center gap-3 flex-1">
                      <i class="pi pi-envelope text-blue-500 text-xl"></i>
                      <div class="flex-1">
                        <div class="text-500 text-sm mb-1">البريد الإلكتروني</div>
                        <div class="text-900 font-semibold">{{ userInfo?.email }}</div>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <Tag 
                        v-if="userInfo?.email_verified_at"
                        value="موثق" 
                        severity="success"
                        icon="pi pi-check"
                      />
                      <Button 
                        icon="pi pi-copy" 
                        rounded
                        text
                        @click="copyToClipboard(userInfo?.email)"
                        v-tooltip.top="'نسخ'"
                      />
                    </div>
                  </div>
                </div>

                <Divider />

                <div class="p-3 surface-50 border-round">
                  <div class="flex align-items-center justify-content-between">
                    <div class="flex align-items-center gap-3 flex-1">
                      <i class="pi pi-phone text-purple-500 text-xl"></i>
                      <div class="flex-1">
                        <div class="text-500 text-sm mb-1">رقم الهاتف</div>
                        <div class="text-900 font-semibold">{{ userInfo?.phone || 'غير محدد' }}</div>
                      </div>
                    </div>
                    <Button 
                      v-if="userInfo?.phone"
                      icon="pi pi-copy" 
                      rounded
                      text
                      @click="copyToClipboard(userInfo?.phone)"
                      v-tooltip.top="'نسخ'"
                    />
                  </div>
                </div>

                <Divider />

                <div class="p-3 surface-50 border-round">
                  <div class="flex align-items-center gap-3">
                    <i class="pi pi-building text-orange-500 text-xl"></i>
                    <div class="flex-1">
                      <div class="text-500 text-sm mb-1">القسم</div>
                      <div class="text-900 font-semibold">{{ userInfo?.department?.name || 'غير محدد' }}</div>
                    </div>
                  </div>
                </div>

              </div>
            </template>
          </Card>
        </div>

        <!-- System Information -->
        <div class="col-12 lg:col-6">
          <Card class="shadow-2 h-full">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-cog text-primary"></i>
                <span>معلومات النظام</span>
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-3">
                
                <div class="p-3 surface-50 border-round">
                  <div class="flex align-items-center justify-content-between">
                    <div class="flex align-items-center gap-3 flex-1">
                      <i class="pi pi-id-card text-green-500 text-xl"></i>
                      <div class="flex-1">
                        <div class="text-500 text-sm mb-1">معرف المستخدم</div>
                        <div class="text-900 font-semibold font-mono">#{{ String(userInfo?.id).padStart(8, '0') }}</div>
                      </div>
                    </div>
                    <Button 
                      icon="pi pi-copy" 
                      rounded
                      text
                      @click="copyToClipboard(String(userInfo?.id))"
                      v-tooltip.top="'نسخ'"
                    />
                  </div>
                </div>

                <Divider />

                <div class="p-3 surface-50 border-round">
                  <div class="flex align-items-center gap-3">
                    <i class="pi pi-calendar-plus text-blue-500 text-xl"></i>
                    <div class="flex-1">
                      <div class="text-500 text-sm mb-1">تاريخ الانضمام</div>
                      <div class="text-900 font-semibold">{{ formatDate(userInfo?.created_at) }}</div>
                      <Tag :value="`${getJoinDays()} يوم`" severity="info" class="mt-2" />
                    </div>
                  </div>
                </div>

                <Divider />

                <div class="p-3 surface-50 border-round">
                  <div class="flex align-items-center gap-3">
                    <i class="pi pi-clock text-purple-500 text-xl"></i>
                    <div class="flex-1">
                      <div class="text-500 text-sm mb-1">آخر نشاط</div>
                      <div class="text-900 font-semibold">{{ formatDate(userInfo?.updated_at) }}</div>
                      <Tag :value="getTimeAgo(userInfo?.updated_at)" severity="success" class="mt-2" />
                    </div>
                  </div>
                </div>

              </div>
            </template>
          </Card>
        </div>

        <!-- Roles & Permissions -->
        <div class="col-12">
          <Card class="shadow-2">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-shield text-primary"></i>
                <span>الأدوار والصلاحيات</span>
              </div>
            </template>
            <template #content>
              <TabView>
                
                <!-- Roles Tab -->
                <TabPanel>
                  <template #header>
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-star"></i>
                      <span>الأدوار</span>
                      <Badge :value="userInfo?.roles?.length || 0" severity="info" />
                    </div>
                  </template>

                  <div v-if="userInfo?.roles?.length" class="grid">
                    <div 
                      v-for="role in userInfo.roles" 
                      :key="role.id"
                      class="col-12 md:col-6 lg:col-4"
                    >
                      <Card class="surface-50 shadow-1">
                        <template #content>
                          <div class="flex align-items-center gap-3 p-2">
                            <div class="bg-primary-reverse border-round p-3">
                              <i class="pi pi-shield text-primary text-2xl"></i>
                            </div>
                            <div class="flex-1">
                              <div class="text-900 font-bold text-lg mb-1">{{ role.name }}</div>
                              <div class="text-500 text-sm">{{ role.guard_name }}</div>
                              <div class="flex align-items-center gap-2 mt-2">
                                <i class="pi pi-calendar text-400 text-xs"></i>
                                <span class="text-500 text-xs">{{ formatDate(role.created_at) }}</span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </Card>
                    </div>
                  </div>

                  <div v-else class="text-center p-6">
                    <i class="pi pi-inbox text-400 text-6xl mb-3"></i>
                    <div class="text-900 font-semibold text-xl mb-2">لا توجد أدوار</div>
                    <div class="text-600">لم يتم تعيين أي أدوار لهذا المستخدم</div>
                  </div>
                </TabPanel>

                <!-- Permissions Tab -->
                <TabPanel>
                  <template #header>
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-key"></i>
                      <span>الصلاحيات</span>
                      <Badge :value="calculateTotalPermissions()" severity="success" />
                    </div>
                  </template>

                  <div v-if="userInfo?.permissions?.length || (userInfo?.roles && userInfo.roles.length > 0)">
                    
                    <!-- Direct Permissions -->
                    <div v-if="userInfo?.permissions?.length" class="mb-4">
                      <div class="text-900 font-bold text-lg mb-3 flex align-items-center gap-2">
                        <i class="pi pi-bolt text-orange-500"></i>
                        <span>صلاحيات مباشرة</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <Chip 
                          v-for="permission in userInfo.permissions" 
                          :key="permission.id"
                          :label="permission.name"
                          icon="pi pi-check"
                          class="bg-green-50 text-green-700 font-semibold"
                        />
                      </div>
                    </div>

                    <!-- Role-based Permissions -->
                    <div v-if="userInfo?.roles?.length">
                      <div class="text-900 font-bold text-lg mb-3 flex align-items-center gap-2">
                        <i class="pi pi-shield text-blue-500"></i>
                        <span>صلاحيات الأدوار</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <Chip 
                          label="جميع الصلاحيات الموروثة من الأدوار"
                          icon="pi pi-check-circle"
                          class="bg-blue-50 text-blue-700 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center p-6">
                    <i class="pi pi-lock text-400 text-6xl mb-3"></i>
                    <div class="text-900 font-semibold text-xl mb-2">لا توجد صلاحيات</div>
                    <div class="text-600">لا توجد صلاحيات مباشرة أو موروثة</div>
                  </div>
                </TabPanel>

              </TabView>
            </template>
          </Card>
        </div>

        <!-- Activity -->
        <div class="col-12">
          <Card class="shadow-2">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-chart-line text-primary"></i>
                <span>النشاط والمشاركة</span>
              </div>
            </template>
            <template #content>
              <TabView>
                
                <!-- Committees Tab -->
                <TabPanel>
                  <template #header>
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-users"></i>
                      <span>اللجان</span>
                      <Badge :value="userInfo?.committees?.length || 0" />
                    </div>
                  </template>

                  <div v-if="userInfo?.committees?.length">
                    <Timeline :value="userInfo.committees" align="right">
                      <template #marker>
                        <div class="bg-primary-reverse border-circle p-3">
                          <i class="pi pi-users text-primary"></i>
                        </div>
                      </template>
                      <template #content="slotProps">
                        <Card class="surface-50 shadow-1">
                          <template #content>
                            <div class="flex align-items-start justify-content-between mb-2">
                              <div class="text-900 font-bold text-lg">{{ slotProps.item.name || 'لجنة' }}</div>
                              <Tag value="نشط" severity="success" />
                            </div>
                            <p class="text-600 mb-3">{{ slotProps.item.description || 'لجنة نشطة ومشاركة فعالة' }}</p>
                            <div class="flex align-items-center gap-2 text-500">
                              <i class="pi pi-calendar"></i>
                              <span>{{ formatDate(slotProps.item.created_at) }}</span>
                            </div>
                          </template>
                        </Card>
                      </template>
                    </Timeline>
                  </div>

                  <div v-else class="text-center p-6">
                    <i class="pi pi-users text-400 text-6xl mb-3"></i>
                    <div class="text-900 font-semibold text-xl mb-2">لا توجد لجان</div>
                    <div class="text-600 mb-4">لا يوجد انتماء لأي لجان في الوقت الحالي</div>
                    <Button label="استكشاف اللجان" icon="pi pi-plus" outlined />
                  </div>
                </TabPanel>

                <!-- Sessions Tab -->
                <TabPanel>
                  <template #header>
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-calendar"></i>
                      <span>الجلسات</span>
                      <Badge :value="userInfo?.sessions?.length || 0" severity="info" />
                    </div>
                  </template>

                  <div v-if="userInfo?.sessions?.length">
                    <Timeline :value="userInfo.sessions" align="right">
                      <template #marker>
                        <div class="bg-blue-50 border-circle p-3">
                          <i class="pi pi-calendar text-blue-600"></i>
                        </div>
                      </template>
                      <template #content="slotProps">
                        <Card class="surface-50 shadow-1">
                          <template #content>
                            <div class="flex align-items-start justify-content-between mb-2">
                              <div class="text-900 font-bold text-lg">{{ slotProps.item.name || 'جلسة' }}</div>
                              <Tag value="مجدولة" severity="info" />
                            </div>
                            <p class="text-600 mb-3">{{ slotProps.item.description || 'جلسة مجدولة للمناقشة' }}</p>
                            <div class="flex align-items-center gap-2 text-500">
                              <i class="pi pi-clock"></i>
                              <span>{{ formatDate(slotProps.item.date) }}</span>
                            </div>
                          </template>
                        </Card>
                      </template>
                    </Timeline>
                  </div>

                  <div v-else class="text-center p-6">
                    <i class="pi pi-calendar text-400 text-6xl mb-3"></i>
                    <div class="text-900 font-semibold text-xl mb-2">لا توجد جلسات</div>
                    <div class="text-600 mb-4">لا توجد جلسات مجدولة أو سابقة</div>
                    <Button label="عرض الجلسات المتاحة" icon="pi pi-calendar-plus" outlined />
                  </div>
                </TabPanel>

              </TabView>
            </template>
          </Card>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Timeline from 'primevue/timeline';
import { useToast } from 'primevue/usetoast';
import navbarService from '../../navbarServices';

const emit = defineEmits(['close']);
const toast = useToast();

const userInfo = ref<any>(null);

const getUserInfo = async () => {
  try {
    const response = await navbarService.getUserProfileInfo();
    userInfo.value = response.data || response;
  } catch (err) {
    console.error('Error fetching user info:', err);
    toast.add({
      severity: 'error',
      summary: 'خطأ',
      detail: 'فشل في تحميل معلومات المستخدم',
      life: 3000
    });
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'غير محدد';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getTimeAgo = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
  return `منذ ${Math.floor(diffDays / 365)} سنوات`;
};

const getJoinDays = () => {
  if (!userInfo.value?.created_at) return 0;
  const created = new Date(userInfo.value.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calculateTotalPermissions = () => {
  if (!userInfo.value) return 0;
  const direct = userInfo.value.permissions?.length || 0;
  const fromRoles = (userInfo.value.roles?.length || 0) * 10;
  return direct + fromRoles;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.add({
    severity: 'success',
    summary: 'تم النسخ',
    detail: 'تم نسخ النص بنجاح',
    life: 2000
  });
};

const editProfile = () => {
  console.log('Edit profile');
};

const changePassword = () => {
  console.log('Change password');
};

onMounted(() => {
  getUserInfo();
});
</script>

<style scoped>
/* Minimal custom styles - relying on PrimeVue and PrimeFlex */
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}
</style>