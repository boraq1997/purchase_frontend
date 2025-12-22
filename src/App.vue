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
  </div>
</template>

<script setup lang="ts">
// Import the Navbar component for the application's navigation bar
import navbar from './components/navbar/navbar.vue';
// Import PrimeVue Toast component for displaying notifications
import Toast from 'primevue/toast';

// Import PrimeVue ConfirmDialog component for confirmation dialogs
import ConfirmDialog from 'primevue/confirmdialog';

// Import RouterView from vue-router to render the current route's component
import { RouterView } from 'vue-router';
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

</style>