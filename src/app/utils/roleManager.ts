export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export const ROLES = {
  MANAGER: 'MANAGER',
  WORKER: 'CAREWORKER',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.MANAGER]: [
    'view_all_workers',
    'manage_locations',
    'view_reports',
    'manage_settings',
  ],
  [ROLES.WORKER]: [
    'view_own_tasks',
    'clock_in_out',
    'view_own_reports',
  ],
} as const;

export function getUserRole(email: string): string {
  // Define manager emails (you can expand this list)
  const managerEmails = [
    '07amansaini.work@gmail.com',
    // Add more manager emails here
  ];
  
  return managerEmails.includes(email) ? ROLES.MANAGER : ROLES.WORKER;
}

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  return (permissions as readonly string[]).includes(permission);
}

export function createUserWithRole(user: Record<string, unknown>) {
  if (!user) return null;
  
  const role = getUserRole(user.email as string);
  
  return {
    ...user,
    role,
    permissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [],
    isManager: role === ROLES.MANAGER,
  };
} 