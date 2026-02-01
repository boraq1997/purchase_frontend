// src/services/permission.ts
const PERMISSIONS_KEY = 'auth_permissions';

export const getPermissions = (): string[] => {
    const perms = localStorage.getItem(PERMISSIONS_KEY);
    return perms ? JSON.parse(perms) : [];
};

export const hasPermission = (permission: string): boolean => {
    const permissions = getPermissions();
    return permissions.includes(permission);
};

// للتحقق من أكثر من صلاحية
export const hasAnyPermission = (permissionList: string[]): boolean => {
    const permissions = getPermissions();
    return permissionList.some(p => permissions.includes(p));
};