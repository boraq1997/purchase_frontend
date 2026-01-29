// Import Vue Router functions to create and manage routing
import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../components/auth/auth.vue';
import Departments from '../components/departments/Departments.vue';
import Committees from '../components/committees/committees.vue';
import Users from '../components/users/users.vue';
import Roles from '../components/roles/roles.vue';
import PurchaseRequests from '../components/purchase-requests/purchase-requests.vue';
import Home from '../components/home/home.vue';
import warehouse from '../components/warehouse/warehouse.vue';
import Estimate from '../components/estimate/estimate.vue';
import Index from '../components/Purchase/main/index.vue';
import Vendors from '../components/vendors/Vendors.vue';
import Activity from '../components/activityLogs/activity.vue';
import notFoundPage from '../components/errors/notFountPage.vue';
import internlaServerError from '../components/errors/internlaServerError.vue';
import forbiddenError from '../components/errors/forbiddenError.vue';
// Import components for each route

const routes = [
    {path: '/', name: 'login', component: Auth},
    // {path: '/home', name: 'home', component: Home},
    {path: '/home', name: 'home', component: Home},
    {path: '/users', name: "users", component: Users},
    {path: '/departments', name: 'departments', component: Departments},
    {path: '/committees', name: 'committees', component: Committees},
    {path: '/roles', name: 'roles', component: Roles},
    {path: '/purchase-request', name: 'purchase-request', component: Index},
    {path: '/warehouse', name: 'warehouse', component: warehouse},
    {path: '/estimate', name: 'estimate', component: Estimate},
    {path: '/vendors', name: 'vendors', component: Vendors},
    {path: '/logs', name: 'logs', component: Activity},
    // Server error page (500)
    {
        path: '/500',
        name: 'ServerError',
        component: internlaServerError,
        meta: {
          title: '500 - خطاء في الخادم'
        }
    },
    // Forbidden error page (403)
    {
        path: '/403',
        name: 'Forbidden',
        component: forbiddenError,

    },
    // Catch-all route for 404 Not Found errors
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: notFoundPage,
        meta: {
          title: '404 - الصفحة غير موجودة'
        }
    },
];

// Create the Vue Router instance
const router = createRouter({
  // Use HTML5 history mode for client-side routing
  history: createWebHistory(),
  // Register the defined routes
  routes,
});

// Navigation guard to handle authentication
router.beforeEach((to, _from, next) => {
  // Retrieve the authentication token from localStorage
  const token = localStorage.getItem('auth_token');

  // Check if the route requires authentication and no token is present
  if (to.meta.requiresAuth && !token) {
    // Redirect to the login page
    next('/');
  }
  // Check if the user is authenticated and trying to access the login page
  else if ((to.path === '/' || to.path === '/login') && token) {
    // Redirect to the home page
    next('/home');
  }
  // Allow navigation to proceed for all other cases
  else {
    next();
  }
});

// Export the router instance for use in the application
export default router;