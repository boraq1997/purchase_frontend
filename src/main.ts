// Import the createApp function from Vue to initialize the application
import { createApp } from 'vue';
import {createPinia} from 'pinia';
import { definePreset } from '@primeuix/themes';

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
app.use(createPinia());


const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{amber.50}',
            100: '{amber.100}',
            200: '{amber.200}',
            300: '{amber.300}',
            400: '{amber.400}',
            500: '{amber.500}',
            600: '{amber.600}',
            700: '{amber.700}',
            800: '{amber.800}',
            900: '{amber.900}',
            950: '{amber.950}'
        }
    }
});


// Configure PrimeVue with the Aura theme
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
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

// main.ts — أضف هذا قبل app.mount

const arabicDigits: Record<string, string> = {
    '٠':'0','١':'1','٢':'2','٣':'3','٤':'4',
    '٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'
};

window.addEventListener('keydown', (e: KeyboardEvent) => {
    const target = e.target as HTMLInputElement;
    if (target.tagName !== 'INPUT') return;
    if (!arabicDigits[e.key]) return;

    e.preventDefault();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    const newVal = target.value.slice(0, start) + arabicDigits[e.key] + target.value.slice(end);
    setter?.call(target, newVal);
    target.dispatchEvent(new Event('input', { bubbles: true }));
}, true);

// Mount the application to the DOM element with ID 'app'
app.mount('#app');