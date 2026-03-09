<template>
  <header class="shadow-md" dir="rtl">
    <Menubar v-if="!hideMenu" :model="topItems" class="!rounded-none" style="padding: 5px 50px;">
      <template #start>
        <span class="ml-2 font-bold">
          مشتريات العتبة العباسية
        </span>
      </template>

      <template #item="{ item, props }">
        <div
          v-ripple
          v-bind="props.action"
          class="flex align-items-center p-menuitem-link cursor-pointer"
          :class="{
            'active-nav-item': item.active,
            'p-button-danger p-button-text': item.isDanger && !item.disabled,
            'p-disabled': item.disabled,
          }"
        >
          <span :class="[item.icon, 'p-menuitem-icon']" />
          <span class="p-menuitem-text">{{ item.label }}</span>
          <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
          <span v-if="item.hasSubmenu" class="pi pi-angle-down ml-auto" />
        </div>
      </template>

      <template #end>
        <div class="flex items-center gap-2">
          <Avatar
            icon="pi pi-user"
            style="background-color: #dee9fc; color: #1a2551"
            shape="circle"
            @click="toggleUserMenu"
            aria-haspopup="true"
            aria-controls="overlay_menu"
          />
          <Menu ref="menu" id="overlay_menu" :model="userOptions" :popup="true" />
        </div>
      </template>
    </Menubar>
  </header>

  <Drawer
    v-model:visible="isSettingsDrawerVisible"
    header="الإعدادات"
    position="left"
    style="width: 30%;"
  >
    <p>هنا يمكنك وضع مكونات الإعدادات الخاصة بالتطبيق.</p>
  </Drawer>

  <Dialog
    v-model:visible="isChangePasswordVisible"
    modal
    header="تغيير كلمة المرور"
    :style="{ width: '450px' }"
    :closable="true"
    dir="rtl"
  >
    <changPasswordForm
      @success="isChangePasswordVisible = false"
      @cancel="isChangePasswordVisible = false"
    />
  </Dialog>

  <Dialog
    v-model:visible="userProfileVisible"
    modal
    header="الملف الشخصي"
    :style="{ width: '75%' }"
    :closable="true"
    dir="rtl"
    maximizable
  >
    <userProfile @close="userProfileVisible = false" />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Menubar from 'primevue/menubar';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Drawer from 'primevue/drawer';
import Dialog from 'primevue/dialog';
import AuthServices from '../auth/auth-service';
import changPasswordForm from './components/changPasswordForm.vue';
import userProfile from './components/userProfile/userProfile.vue';
import { resolveMessages } from '../services/messageResolver';
import { useToast } from 'primevue/usetoast';
import { hasPermission } from '../services/permission';

// ── State ────────────────────────────────────────────────
const menu                    = ref();
const isChangePasswordVisible = ref(false);
const userProfileVisible      = ref(false);
const isSettingsDrawerVisible = ref(false);
const deleteUsers             = ref(0);

const toast       = useToast();
const router      = useRouter();
const route       = useRoute();
const currentPath = ref(route.path);

watch(() => route.path, (newPath) => {
  currentPath.value = newPath;
});

// ── Helpers ──────────────────────────────────────────────
const hideMenu = computed(() =>
  route.path === '/' || route.path === '/login'
);

const isActive = (path: string) => currentPath.value === path;

const toggleUserMenu = (event: Event) => menu.value.toggle(event);

// ── Logout ───────────────────────────────────────────────
const handleLogout = async () => {
  try {
    await AuthServices.logout();
    toast.add({ severity: 'success', summary: 'رسالة نجاح', detail: 'تم تسجيل الخروج بنجاح', life: 3000 });
    router.push('/');
  } catch (err) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as any;
      const message = resolveMessages(axiosError.response?.message);
      toast.add({ severity: 'error', summary: 'رسالة خطأ', detail: message, life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ ما، راجع الـ console', life: 3000 });
      console.error(err);
    }
  }
};

// ── Top Navigation Items ─────────────────────────────────
const topItems = computed(() => {
  const path = currentPath.value;
  const items: any[] = [];

  items.push({
    label: 'الرئيسية',
    icon: 'fas fa-home',
    active: path === '/home',
    command: () => router.push('/home'),
  });

  if (hasPermission('view-User')) {
    items.push({
      label: 'المستخدمين',
      icon: 'fas fa-users',
      active: path === '/users',
      hasSubmenu: true,
      items: [
        {
          label: 'عرض الكل',
          icon: 'fas fa-users',
          active: path === '/users',
          command: () => router.push('/users'),
        },
        {
          label: `المحذوفات (${deleteUsers.value})`,
          icon: 'fas fa-trash-can',
          isDanger: true,
          command: () => {},
        },
      ],
    });
  }

  if (hasPermission('view-PurchaseRequest')) {
    items.push({
      label: 'طلبات الشراء',
      icon: 'fa-solid fa-cart-shopping',
      active: path === '/purchase-request',
      command: () => router.push('/purchase-request'),
    });
  }

  items.push({
    label: 'المشتريات',
    icon: 'fas fa-boxes-stacked',
    active: path === '/procuement',
    command: () => router.push('/procuement'),
  });

  if (hasPermission('view-Estimate')) {
    items.push({
      label: 'عروض الأسعار',
      icon: 'fas fa-receipt',
      active: path === '/estimate',
      command: () => router.push('/estimate'),
    });
  }

  if (hasPermission('view-Vendors')) {
    items.push({
      label: 'الباعة',
      icon: 'fas fa-store',
      active: path === '/vendors',
      command: () => router.push('/vendors'),
    });
  }

  items.push({
    label: 'المجموعات',
    icon: 'fas fa-users-viewfinder',
    active: path === '/departments' || path === '/committees',
    hasSubmenu: true,
    items: [
      ...(hasPermission('view-Department') ? [{
        label: 'الأقسام',
        icon: 'fa-solid fa-layer-group',
        active: path === '/departments',
        command: () => router.push('/departments'),
      }] : []),
      ...(hasPermission('view-Committees') ? [{
        label: 'اللجان',
        icon: 'fa-solid fa-users-viewfinder',
        active: path === '/committees',
        command: () => router.push('/committees'),
      }] : []),
    ],
  });

  items.push({
    label: 'النظام',
    icon: 'fas fa-cogs',
    active: path === '/units' || path === '/roles' || path === '/logs',
    hasSubmenu: true,
    items: [
      {
        label: 'الوحدات',
        icon: 'fa-solid fa-scale-unbalanced-flip',
        active: path === '/units',
        command: () => router.push('/units'),
      },
      ...(hasPermission('view-Role') ? [{
        label: 'الصلاحيات',
        icon: 'fas fa-user-shield',
        active: path === '/roles',
        command: () => router.push('/roles'),
      }] : []),
      {
        label: 'سجل النظام',
        icon: 'fa-solid fa-clock-rotate-left',
        active: path === '/logs',
        command: () => router.push('/logs'),
      },
    ],
  });

  return items;
});

// ── User Menu Items ──────────────────────────────────────
const userOptions = computed(() => [
  {
    label: 'الملف الشخصي',
    icon: 'pi pi-user',
    command: () => { userProfileVisible.value = true; },
  },
  {
    label: 'كلمة المرور',
    icon: 'pi pi-lock-open',
    command: () => { isChangePasswordVisible.value = true; },
  },
  {
    label: 'الإعدادات',
    icon: 'pi pi-cog',
    command: () => { isSettingsDrawerVisible.value = true; },
  },
  { separator: true },
  {
    label: 'تسجيل الخروج',
    icon: 'pi pi-sign-out',
    class: 'logout-item',
    command: handleLogout,
  },
]);

// ── Lifecycle ────────────────────────────────────────────
onUnmounted(() => {});
</script>

<style scoped>
/* ── Active nav item ── */
:deep(.p-menuitem-content:has(.active-nav-item)) {
  border-bottom: 2px solid var(--p-primary-color);
}

:deep(.active-nav-item .p-menuitem-icon),
:deep(.active-nav-item .p-menuitem-text) {
  color: var(--p-primary-color) !important;
  font-weight: 700;
}

/* ── Logout item ── */
:deep(.logout-item .p-menu-item-icon),
:deep(.logout-item .p-menu-item-label) {
  color: #ef4444 !important;
}
</style>