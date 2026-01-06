<template>
  <!-- Main application layout -->
  <div>
    <!-- 1. Conditional Navbar -->
    <!-- Displays the Navbar component only if the current route is not the login page -->
    <navbar v-if="$route.name !== '/login'" />

    <!-- 2. Global Services -->
    <!-- PrimeVue Toast component for displaying notifications -->
    <Toast />
    <!-- PrimeVue ConfirmDialog component for confirmation dialogs -->
    <ConfirmDialog dir="rtl"/>


    <!-- 3. Main Content Container -->
    <!-- Container for rendering the current route's component via RouterView -->
    <main class="container">
      <RouterView />
    </main>

    <!-- Back To Top Button -->
    <Transition name="fade-slide">
      <Button
        v-show="showBackToTop"
        icon="pi pi-arrow-up" 
        class="back-to-top-classic"
        rounded
        @click="scrollToTop"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted}from 'vue';
import Button from 'primevue/button';
// Import the Navbar component for the application's navigation bar
import navbar from './components/navbar/navbar.vue';
// Import PrimeVue Toast component for displaying notifications
import Toast from 'primevue/toast';

// Import PrimeVue ConfirmDialog component for confirmation dialogs
import ConfirmDialog from 'primevue/confirmdialog';

// Import RouterView from vue-router to render the current route's component
import { RouterView } from 'vue-router';

const showBackToTop = ref(false);

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
</script>

<style scoped>
/* Scoped styles for the App.vue component */

/* Base styles for the body to ensure consistent appearance */
body {
  margin: 0; /* Remove default margin */
  background-color: var(--surface-ground); /* Use PrimeVue theme variable for background */
  color: var(--text-color); /* Use PrimeVue theme variable for text color */
  font-family: var(--font-family); /* Use PrimeVue theme variable for font */
  -webkit-font-smoothing: antialiased; /* Improve font rendering on WebKit browsers */
  -moz-osx-font-smoothing: grayscale; /* Improve font rendering on Firefox/macOS */
}
.back-to-top-classic {
  position: fixed;
  bottom: 30px;
  left: 30px; /* ليتناسب مع RTL */
  z-index: 1000;

  /* قياسات كلاسيكية متزنة */
  width: 45px;
  height: 45px;
  
  /* لون صلب (Navy أو Primary داكن) */
  background-color: #1e293b !important; /* لون كحلي وقور */
  color: #ffffff !important;
  
  /* حدود واضحة وبسيطة */
  border: 1px solid #0f172a !important;
  border-radius: 6px !important; /* زوايا منحنية بسيطة وليست دائرية بالكامل */
  
  /* ظل كلاسيكي (Elevated) */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  transition: all 0.2s ease-in-out !important;
  cursor: pointer;
}

.back-to-top-classic:hover {
  /* تفاعل كلاسيكي: تغيير اللون فقط */
  background-color: #334155 !important; 
  transform: translateY(-2px); /* حركة بسيطة جداً */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.back-to-top-classic:active {
  transform: translateY(0);
}

/* أيقونة ثابتة وواضحة */
.back-to-top-classic :deep(.p-button-icon) {
  font-size: 1.1rem;
  font-weight: bold;
}

/* تأثير الظهور الكلاسيكي (Fade Simple) */
.classic-fade-enter-active,
.classic-fade-leave-active {
  transition: opacity 0.3s ease;
}

.classic-fade-enter-from,
.classic-fade-leave-to {
  opacity: 0;
}
</style>