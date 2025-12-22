// Import the createApp function from Vue to initialize the application
import { createApp } from 'vue';

// Import the global CSS styles for the application
import './style.css';

// Import the root App component
import App from './App.vue';

// Import PrimeVue configuration for UI components
import PrimeVue from 'primevue/config';

// Import the Aura theme for PrimeVue components
import Aura from '@primeuix/themes/aura';

// Import the Vue router for client-side routing
import router from './router';

// Import PrimeVue ToastService for displaying notifications
import ToastService from 'primevue/toastservice';

// Import the PrimeVue Toast component for rendering toast notifications
import Toast from 'primevue/toast';

// Import PrimeVue ConfirmationService for confirmation dialogs
import ConfirmationService from 'primevue/confirmationservice';

// Import PrimeVue Ripple directive for adding ripple effects to components
import Ripple from 'primevue/ripple';

import Tooltip from 'primevue/tooltip';

// Create the Vue application instance
const app = createApp(App);

// Configure PrimeVue with the Aura theme
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});

// Register the ToastService for displaying toast notifications
app.use(ToastService);
app.directive('tooltip', Tooltip);


// Register the Toast component globally
app.component('Toast', Toast);

// Register the ConfirmationService for confirmation dialogs
app.use(ConfirmationService);

// Register the Ripple directive for adding ripple effects to interactive elements
app.directive('ripple', Ripple);

// Register the Vue router for client-side navigation
app.use(router);

// Mount the application to the DOM element with ID 'app'
app.mount('#app');