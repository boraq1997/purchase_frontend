import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'login',
        component: () => import('../components/auth/auth.vue'),
        meta: { title: 'تسجيل الدخول' }
    },
    {
        path: '/repo',
        component: ()=>import('../components/test/print.vue'),
    },
    {
        path: '/home',
        name: 'home',
        component: () => import('../components/home/home.vue'),
        meta: { title: 'الرئيسية' }
    },
    {
        path: '/users',
        name: 'users',
        component: () => import('../components/users/users.vue'),
        meta: { title: 'المستخدمون' }
    },
    {
        path: '/departments',
        name: 'departments',
        component: () => import('../components/departments/Departments.vue'),
        meta: { title: 'الأقسام' }
    },
    {
        path: '/committees',
        name: 'committees',
        component: () => import('../components/committees/committees.vue'),
        meta: { title: 'اللجان' }
    },
    {
        path: '/roles',
        name: 'roles',
        component: () => import('../components/roles/roles.vue'),
        meta: { title: 'الأدوار' }
    },
    {
        path: '/purchase-request',
        children: [
            {
                path: "",
                component: () => import('../components/Purchase/main/index.vue'),
                name: 'purchase-request',
                meta: { title: 'طلبات الشراء' }
            },
            {
                path: 'completed',
                component: ()=>import('../components/Purchase/main/index.vue'),
                name: "purchase-request-completed",
                meta: {title: 'ارشيف الطلبات'}
            },
            {
                path: "pending",
                component: ()=>import('../components/Purchase/main/index.vue'),
                name: "purchase-request-pending",
                meta: {title: "الطلبات المعلقة"}
            },
            {
                path: "approved",
                component: ()=>import('../components/Purchase/main/index.vue'),
                name: "purchase-request-approved",
                meta: {title: "الطلبات الموافق عليها"}
            },
            {
                path: "rejected",
                component: ()=>import('../components/Purchase/main/index.vue'),
                name: "purchase-request-rejected",
                meta: {title: "الطلبات المرفوضة"}
            }
        ],
        
    },
    {
        path: '/warehouse',
        name: 'warehouse',
        component: () => import('../components/warehouse/warehouse.vue'),
        meta: { title: 'المستودع' }
    },
    {
        path: '/estimate',
        name: 'estimate',
        component: () => import('../components/estimate/EstimatesView.vue'),
        meta: { title: 'التقديرات' }
    },
    {
        path: '/procuement',
        name: 'procuement',
        component: () => import('../components/procurement/index.vue'),
        meta: { title: 'المشتريات' }
    },
    {
        path: '/units',
        name: 'units',
        component: () => import('../components/units/index.vue'),
        meta: { title: 'الوحدات' }
    },
    {
        path: '/vendors',
        name: 'vendors',
        component: () => import('../components/vendors/Vendors.vue'),
        meta: { title: 'الموردون' }
    },
    {
        path: '/logs',
        name: 'logs',
        component: () => import('../components/activityLogs/activity.vue'),
        meta: { title: 'سجل النشاطات' }
    },
    {
        path: '/reports',
        name: 'reports',
        component: () => import('../components/report/index.vue'),
        meta: { title: 'التقارير' }
    },
    {
        path: '/reportsPrint/:id',
        name: 'RportPage',
        component: ()=>import('../components/report/components/print/ReportPagePrint.vue'),
        meta: {
            layout: 'blank',
        }
    },
    {
        path: '/500',
        name: 'ServerError',
        component: () => import('../components/errors/internalServerError.vue'),
        meta: { title: '500 - خطأ في الخادم' }
    },
    {
        path: '/403',
        name: 'Forbidden',
        component: () => import('../components/errors/forbiddenError.vue'),
        meta: { title: '403 - غير مصرح' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../components/errors/notFoundPage.vue'),
        meta: { title: '404 - الصفحة غير موجودة' }
    },
    
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// ── Page Title ──────────────────────────────────────────
const APP_NAME = 'نظام المشتريات';

router.afterEach((to) => {
    const title = to.meta?.title as string | undefined;
    document.title = title ? `${APP_NAME} | ${title}` : APP_NAME;
});

// ── Auth Guard ──────────────────────────────────────────
router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('auth_token');
    const isAuthPage = to.path === '/' || to.path === '/login';

    if (to.meta.requiresAuth && !token) return next('/');
    if (isAuthPage && token) return next('/home');
    next();
});

export default router;