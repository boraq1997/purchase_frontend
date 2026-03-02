<template>
  <!-- Main header section with navigation bar -->
  <header class="shadow-md" dir="rtl" >
    <!-- PrimeVue Menubar for top navigation -->
    <Menubar v-if="!hideMenu" :model="topItems" class="!rounded-none" style="padding: 5px 50px;">
      <!-- Start slot: Application branding/logo -->
      <template #start>
        <span class="ml-2 font-bold">
          مشتريات العتبة العباسية
        </span>
      </template>

      <!-- Item slot: Custom rendering for menu items -->
      <template #item="{ item, props }">
        <a
          v-ripple
          v-bind="props.action"
          class="flex align-items-center p-menuitem-link hover:text-primary"
          :class="{
            'p-button-danger p-button-text': item.isDanger && !item.disabled,
            'p-disabled': item.disabled,
          }"
        >
          <span :class="[item.icon, 'p-menuitem-icon']" />
          <span class="p-menuitem-text">{{ item.label }}</span>
          <!-- Display badge for items with a count (e.g., deleted users) -->
          <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
          <!-- Indicator for submenus -->
          <span v-if="item.hasSubmenu" class="pi pi-angle-down ml-auto" />
        </a>
      </template>

      <!-- End slot: Search input and user avatar with dropdown menu -->
      <template #end>
        <div class="flex items-center gap-2">
          <!-- User avatar with clickable menu -->
          <Avatar
            icon="pi pi-user"
            style="background-color: #dee9fc; color: #1a2551"
            shape="circle"
            @click="toggleUserMenu"
            aria-haspopup="true"
            aria-controls="overlay_menu"
          />
          <!-- User options popup menu -->
          <Menu ref="menu" id="overlay_menu" :model="userOptions" :popup="true" />
        </div>
      </template>
    </Menubar>
  </header>

  <!-- Settings drawer for application settings -->
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
    :style="{width: '450px'}"
    :closable=true
    dir="rtl"
  >
    <changPasswordForm
      @success="isChangePasswordVisible=false"
      @cancel="isChangePasswordVisible=false"
    />
  </Dialog>

  <Dialog
    v-model:visible="userProfileVisible"
    modal
    header="الملف الشخصي"
    :style="{width: '75%'}"
    :closable="true"
    dir="rtl"
    maximizable
  >
    <userProfile
      @close="userProfileVisible = false"
      />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Drawer from 'primevue/drawer';
import AuthServices from '../auth/auth-service';
import { useRoute } from 'vue-router';
import Dialog from 'primevue/dialog';
import changPasswordForm from './components/changPasswordForm.vue';
import { resolveMessages } from "../services/messageResolver";
import { useToast } from "primevue/usetoast";
import userProfile from './components/userProfile/userProfile.vue';
import { hasPermission } from '../services/permission';
// call services


// === State & Services ===
// Reference to the user menu component
const menu = ref();
const isChangePasswordVisible = ref(false);
const userProfileVisible = ref(false);
const toast = useToast();

// Vue Router instance for navigation
const router = useRouter();
const route = useRoute();

// Count of archived (deleted) users
const deleteUsers = ref(0);

const isSettingsDrawerVisible = ref(false);
// Interval ID for polling archived users count
// let pollingInterval: number;

// === Functions ===
const hideMenu = computed(() => {
  return route.path === '/' || route.path === '/login';
});

/**
 * @description Fetches the count of archived users and updates the state
 * @returns Promise resolving to the count of archived users
 */
// const getDeleteUsersCount = async () => {
//   try {
//     const response = await UsersServices.getArchivedUsers();
//     deleteUsers.value = response.data.data.data.length || 0;
//   } catch (err) {
//     console.error('Failed to fetch archived users count:', err);
//   }
// };


/**
 * @description Toggles the user profile dropdown menu
 * @param event - The click event triggering the menu toggle
 */
const toggleUserMenu = (event: Event) => {
  menu.value.toggle(event);
};

/**
 * @description Logs the user out and redirects to the login page
 */
const handleLogout = async() => {
  try {
    await AuthServices.logout();
    toast.add({
      severity: "success",
      summary: "رسالة نجاح",
      detail: "تم تسجيل الخروج بنجاح",
      life: 3000
    });
    router.push('/'); // Redirect to login page after logout
  } catch (err) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as any;
      const messageKey = axiosError.response?.message;
      const message = resolveMessages(messageKey);

      toast.add({
        severity: "error",
        summary: "رسالة خطاء",
        detail: message,
        life: 3000
      })
    } else {
      toast.add({
          severity: 'error', 
          summary: 'خطاء', 
          detail: 'حدث خطاء ما راجع الconsole الخاص بالمتصفح', 
          life: 3000
      })
      console.log(err);
    } 
  } finally {
  }
};

// === Computed Properties for Menus ===

// Top navigation menu items
const topItems = computed(() => {
  
  const items = [];

  items.push({
    label: 'الرئيسية',
    icon: 'fas fa-home',
    command: () => router.push('/home')
  })

  if (hasPermission('view-User')) {
    items.push({
      label: 'المستخدمين',
      icon: 'fas fa-users',
      hasSubmenu: true, // Indicate submenu presence
      items: [
          {
              label: "عرض الكل",
              icon: "fas fa-users",
              command: ()=> router.push('/users')
          },
          {
              label: `المحذوفات (${deleteUsers.value})`,
              icon: 'fas fa-trash-can',
              isDanger: true,
              // disabled: deleteUsers.value === 0,
              command: () => {
                // if (deleteUsers.value > 0) {
                //     router.push('/users/deleted');
                // }
              },
          },
      ],
    });
  }

  if (hasPermission('view-PurchaseRequest')) {
    items.push({
      label: "طلبات الشراء",
      icon: 'fa-solid fa-cart-shopping',
      command: ()=>router.push('/purchase-request')
    });
  }

  if (hasPermission('view-Estimate')) {
    items.push({
      label: "عروض الاسعار",
      icon: "fas fa-receipt",
      command: ()=>router.push('/estimate')
    });
  }

  

    

  if (hasPermission('view-Vendors')) {
    items.push({
      label: "الباعة",
      icon: "fas fa-store",
      command: ()=>router.push('./vendors')
    });
  }

  items.push({
    label: "المجموعات",
    icon: "fas fa-users-viewfinder",
    hasSubmenu: true,
    items: [
      ...(hasPermission('view-Department') ? [{
        label: 'الاقسام',
        icon: 'fa-solid fa-layer-group',
        command: () => router.push('/departments')
      }]: []),
      ...(hasPermission('view-Committees') ? [{
        label: "اللجان",
        icon: "fa-solid fa-users-viewfinder",
        command: ()=>router.push('/committees')
      }]: [])
    ]
  })

  items.push({
    label: "النظام",
    icon: 'fas fa-cogs',
    hasSubmenu: true,
    items: [
        {
            label: "الوحدات",
            icon: 'fa-solid fa-scale-unbalanced-flip',
            command: () => router.push('/units')
        },
        ...(hasPermission('view-Role') ? [{
            label: 'الصلاحيات',
            icon: 'fas fa-user-shield',
            command: () => router.push('/roles'),
        }] : []),
        {
            label: "سجل النظام",
            icon: "fa-solid fa-clock-rotate-left",
            command: () => router.push('/logs')
        },
    ]
})

  return items;
});

// User profile dropdown menu items
const userOptions = computed(() => [
  { label: 'الملف الشخصي', icon: 'pi pi-user',command: ()=>{userProfileVisible.value = true}},
  { label: 'كلمة المرور', icon: 'pi pi-lock-open',command: ()=>{isChangePasswordVisible.value = true;}},
  {label: 'الإعدادات',icon: 'pi pi-cog', command: () => {isSettingsDrawerVisible.value = true;},},
  { separator: true },
  {label: 'تسجيل الخروج', icon: 'pi pi-sign-out',command: handleLogout,},
]);

// === Lifecycle Hooks ===

// On component mount: Fetch initial data and start polling
onMounted(() => {
  // Poll for archived users count every 30 seconds
//   pollingInterval = window.setInterval(getDeleteUsersCount, 30000);
});

// On component unmount: Clear polling interval to prevent memory leaks
onUnmounted(() => {
//   clearInterval(pollingInterval);
});
</script>

<style scoped>
/* Scoped styles for the Navbar component */
</style>