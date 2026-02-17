import {defineStore} from 'pinia';
import type {User} from '../types/auth.types';


interface AuthState {
    token: string | null;
    user: User | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        token: null,
        user: null,
    }),

    getters: {
        isLoggedIn: (state): boolean => !!state.token,

        permissions: (state): string[]=>
            state.user?.permissions ?? [],

        role: (state): string | null =>
            state.user?.role ?? null,
    },

    actions: {
        setAuth(token: string, user: User) {
            this.token = token
            this.user = user
        },

        login(response: {token: string; user: User}) {
            this.setAuth(response.token, response.user);
        },

        logout() {
            this.$reset()
        },
    },
});