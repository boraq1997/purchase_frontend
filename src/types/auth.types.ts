export interface Committee {
    id: number;
    name?: string;
}

export interface Department {
    id: number;
    name?: string;
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string | null;
    phone: string | null;
    status: string;
    role: string;
    parent?: any;
    department: Department | null;
    committees: Committee[];
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}