import api from '../api/api';

/**
 * @interface LoginCredentials
 * @description Defines the structure for the login payload, ensuring type safety.
 */
interface LoginCredentials {
    username: string;
    password: string;
}

interface AuthUser {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    status: string;
    department: {id: number; name: string};
    parent?: any;
    roles: string[];
    permissions: string[];
}

/**
 * @interface AuthResponse
 * @description Defines the expected structure of a successful login response from the API.
 */
interface AuthResponse {
    token: string;
    user: AuthUser;
    // You can add other properties you expect from the login response, e.g.:
    // user: { id: number; name: string; username: string; };
}

const TOKEN_KEY = 'auth_token'; // Use a constant for the localStorage key to avoid typos.
const USER_KEY = 'auth_user';
const PERMISSIONS_KEY = 'auth_permissions';
const ROLES_KEY = 'auth_roles';
const DEPARTMENT_INFO = 'auth_department';

const AuthServices = {
    /**
     * @description Sends user credentials to the login endpoint.
     * @param {LoginCredentials} credentials - The user's username and password.
     * @returns {Promise<AuthResponse>} A promise that resolves with the authentication token and user data.
     */
    async login(credentials: LoginCredentials ): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/login', credentials);

        const { token, user } = response.data;

        // حفظ التوكن
        localStorage.setItem(TOKEN_KEY, token);

        // حفظ بيانات المستخدم
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // حفظ الصلاحيات والادوار
        if (user.permissions) {
            localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(user.permissions));
        }

        if (user.roles) {
            localStorage.setItem(ROLES_KEY, JSON.stringify(user.roles));
        }

        if (user.department) {
            localStorage.setItem(DEPARTMENT_INFO, JSON.stringify(user.department));
        }
        return response.data;
    },

    /**
     * @description Logs the user out by removing the token and redirecting to the home page.
     * This function handles all logout-related side effects.
     */
    async logout(): Promise<any>{
        const response = await api.post('/logout');
        if (response.data.success) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(PERMISSIONS_KEY);
            localStorage.removeItem(ROLES_KEY);
        }
        return response;
    },

    /**
     * @description Fetches the profile of the currently authenticated user.
     * The request interceptor in 'http.ts' should automatically add the auth token.
     * @returns {Promise} A promise that resolves with the user's profile data.
     */
    getProfile( ) {
        return api.get('/auth/me' );
    },

    /**
     * @description Retrieves the authentication token from local storage.
     * @returns {string | null} The token, or null if it doesn't exist.
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * @description Checks if a user is currently authenticated (i.e., a token exists).
     * @returns {boolean} True if a token exists, false otherwise.
     */
    isAuthenticated(): boolean {
        // The double negation (!!) converts a truthy/falsy value to a strict boolean.
        return !!this.getToken();
    },

    getUser(): AuthUser | null {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    getPermissions(): string[] {
        const p = localStorage.getItem(PERMISSIONS_KEY);
        return p ? JSON.parse(p) : [];
    },

    getRoles(): string[] {
        const r = localStorage.getItem(ROLES_KEY);
        return r ? JSON.parse(r) : [];
    },
};

export default AuthServices;
