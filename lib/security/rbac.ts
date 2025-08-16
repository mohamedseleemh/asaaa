export interface Permission {
  resource: string
  action: "create" | "read" | "update" | "delete" | "manage"
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  inherits?: string[] // Role inheritance
}

export const PERMISSIONS = {
  // User management
  USERS_READ: { resource: "users", action: "read" as const },
  USERS_CREATE: { resource: "users", action: "create" as const },
  USERS_UPDATE: { resource: "users", action: "update" as const },
  USERS_DELETE: { resource: "users", action: "delete" as const },
  USERS_MANAGE: { resource: "users", action: "manage" as const },

  // Content management
  CONTENT_READ: { resource: "content", action: "read" as const },
  CONTENT_CREATE: { resource: "content", action: "create" as const },
  CONTENT_UPDATE: { resource: "content", action: "update" as const },
  CONTENT_DELETE: { resource: "content", action: "delete" as const },
  CONTENT_PUBLISH: { resource: "content", action: "manage" as const },

  // Analytics
  ANALYTICS_READ: { resource: "analytics", action: "read" as const },
  ANALYTICS_EXPORT: { resource: "analytics", action: "manage" as const },

  // Security
  SECURITY_READ: { resource: "security", action: "read" as const },
  SECURITY_MANAGE: { resource: "security", action: "manage" as const },

  // System
  SYSTEM_SETTINGS: { resource: "system", action: "manage" as const },
  SYSTEM_LOGS: { resource: "system", action: "read" as const },
} as const

export const ROLES: Record<string, Role> = {
  admin: {
    id: "admin",
    name: "مدير النظام",
    description: "صلاحيات كاملة لجميع أجزاء النظام",
    permissions: Object.values(PERMISSIONS),
  },
  editor: {
    id: "editor",
    name: "محرر المحتوى",
    description: "إدارة المحتوى والتحليلات الأساسية",
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.USERS_READ,
    ],
  },
  viewer: {
    id: "viewer",
    name: "مشاهد",
    description: "عرض المحتوى والتحليلات فقط",
    permissions: [PERMISSIONS.CONTENT_READ, PERMISSIONS.ANALYTICS_READ, PERMISSIONS.USERS_READ],
  },
}

export function hasPermission(userRole: string, permission: Permission): boolean {
  const role = ROLES[userRole]
  if (!role) return false

  return role.permissions.some(
    (p) => p.resource === permission.resource && (p.action === permission.action || p.action === "manage"),
  )
}

export function checkPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission))
}

export function getAvailableActions(userRole: string, resource: string): string[] {
  const role = ROLES[userRole]
  if (!role) return []

  return role.permissions.filter((p) => p.resource === resource).map((p) => p.action)
}

export function canAccessRoute(userRole: string, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard": [PERMISSIONS.CONTENT_READ],
    "/dashboard/users": [PERMISSIONS.USERS_READ],
    "/dashboard/content": [PERMISSIONS.CONTENT_READ],
    "/dashboard/analytics": [PERMISSIONS.ANALYTICS_READ],
    "/dashboard/security": [PERMISSIONS.SECURITY_READ],
    "/dashboard/settings": [PERMISSIONS.SYSTEM_SETTINGS],
  }

  const requiredPermissions = routePermissions[route]
  if (!requiredPermissions) return true // Public route

  return checkPermissions(userRole, requiredPermissions)
}
