export type Role = "employee" | "manager";

export type Permission =
  | "expense:submit"
  | "expense:view_own"
  | "expense:view_all"
  | "expense:withdraw_own"
  | "expense:edit_draft"
  | "expense:resubmit_rejected"
  | "expense:approve"
  | "expense:reject"
  | "expense:close";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  employee: [
    "expense:submit",
    "expense:view_own",
    "expense:withdraw_own",
    "expense:edit_draft",
    "expense:resubmit_rejected",
  ],
  manager: [
    "expense:submit",
    "expense:view_own",
    "expense:view_all",
    "expense:withdraw_own",
    "expense:edit_draft",
    "expense:resubmit_rejected",
    "expense:approve",
    "expense:reject",
    "expense:close",
  ],
};

/**
 * Check if a given role has a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Get all permissions granted to a role.
 */
export function getPermissions(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}
