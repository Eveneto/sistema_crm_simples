/**
 * Tipos de roles (perfis) de usuário do sistema
 */
export type UserRole = 'admin' | 'manager' | 'agent';

/**
 * Definição de permissões por role
 */
export const ROLE_PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageChannels: true,
    canManageStages: true,
    canDeleteContacts: true,
    canDeleteDeals: true,
    canViewAllConversations: true,
    canAssignConversations: true,
    canViewReports: true,
    canExportData: true,
  },
  manager: {
    canManageUsers: false,
    canManageChannels: false,
    canManageStages: true,
    canDeleteContacts: true,
    canDeleteDeals: true,
    canViewAllConversations: true,
    canAssignConversations: true,
    canViewReports: true,
    canExportData: true,
  },
  agent: {
    canManageUsers: false,
    canManageChannels: false,
    canManageStages: false,
    canDeleteContacts: false,
    canDeleteDeals: false,
    canViewAllConversations: false,
    canAssignConversations: false,
    canViewReports: false,
    canExportData: false,
  },
} as const;

/**
 * Labels amigáveis para os roles
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  agent: 'Agente',
};

/**
 * Descrições dos roles
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acesso total ao sistema. Pode gerenciar usuários, configurações e todos os recursos.',
  manager: 'Pode gerenciar equipe, visualizar relatórios e administrar negócios.',
  agent: 'Atendente com acesso a conversas atribuídas e gerenciamento básico de contatos.',
};

/**
 * Verifica se um role tem uma permissão específica
 */
export function hasPermission(
  role: UserRole,
  permission: keyof typeof ROLE_PERMISSIONS.admin
): boolean {
  return ROLE_PERMISSIONS[role][permission] ?? false;
}

/**
 * Verifica se um role tem acesso a uma feature
 */
export function canAccess(role: UserRole, feature: string): boolean {
  const featurePermissions: Record<string, keyof typeof ROLE_PERMISSIONS.admin> = {
    users: 'canManageUsers',
    channels: 'canManageChannels',
    stages: 'canManageStages',
    reports: 'canViewReports',
    export: 'canExportData',
  };

  const permission = featurePermissions[feature];
  return permission ? hasPermission(role, permission) : false;
}

/**
 * Retorna todos os roles disponíveis
 */
export function getAllRoles(): UserRole[] {
  return ['admin', 'manager', 'agent'];
}
