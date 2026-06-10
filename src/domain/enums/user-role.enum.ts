export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  LEAD_GENERATOR = 'LEAD_GENERATOR',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SALES]: 'Sales',
  [UserRole.LEAD_GENERATOR]: 'Lead Generator',
};
