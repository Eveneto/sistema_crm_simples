import {
  hasPermission,
  canAccess,
  getAllRoles,
  ROLE_PERMISSIONS,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
} from '../roles';
import type { UserRole } from '../roles';

describe('roles', () => {
  describe('hasPermission', () => {
    it('admin deve ter todas as permissões', () => {
      expect(hasPermission('admin', 'canManageUsers')).toBe(true);
      expect(hasPermission('admin', 'canManageChannels')).toBe(true);
      expect(hasPermission('admin', 'canViewReports')).toBe(true);
      expect(hasPermission('admin', 'canManageStages')).toBe(true);
      expect(hasPermission('admin', 'canDeleteContacts')).toBe(true);
      expect(hasPermission('admin', 'canDeleteDeals')).toBe(true);
      expect(hasPermission('admin', 'canViewAllConversations')).toBe(true);
      expect(hasPermission('admin', 'canAssignConversations')).toBe(true);
      expect(hasPermission('admin', 'canExportData')).toBe(true);
    });

    it('manager deve ter permissões específicas', () => {
      expect(hasPermission('manager', 'canManageUsers')).toBe(false);
      expect(hasPermission('manager', 'canManageChannels')).toBe(false);
      expect(hasPermission('manager', 'canViewReports')).toBe(true);
      expect(hasPermission('manager', 'canManageStages')).toBe(true);
      expect(hasPermission('manager', 'canDeleteContacts')).toBe(true);
      expect(hasPermission('manager', 'canDeleteDeals')).toBe(true);
      expect(hasPermission('manager', 'canViewAllConversations')).toBe(true);
      expect(hasPermission('manager', 'canAssignConversations')).toBe(true);
      expect(hasPermission('manager', 'canExportData')).toBe(true);
    });

    it('agent deve ter permissões limitadas', () => {
      expect(hasPermission('agent', 'canManageUsers')).toBe(false);
      expect(hasPermission('agent', 'canManageChannels')).toBe(false);
      expect(hasPermission('agent', 'canViewReports')).toBe(false);
      expect(hasPermission('agent', 'canManageStages')).toBe(false);
      expect(hasPermission('agent', 'canDeleteContacts')).toBe(false);
      expect(hasPermission('agent', 'canDeleteDeals')).toBe(false);
      expect(hasPermission('agent', 'canViewAllConversations')).toBe(false);
      expect(hasPermission('agent', 'canAssignConversations')).toBe(false);
      expect(hasPermission('agent', 'canExportData')).toBe(false);
    });
  });

  describe('canAccess', () => {
    it('admin deve acessar todas as features', () => {
      expect(canAccess('admin', 'users')).toBe(true);
      expect(canAccess('admin', 'channels')).toBe(true);
      expect(canAccess('admin', 'stages')).toBe(true);
      expect(canAccess('admin', 'reports')).toBe(true);
      expect(canAccess('admin', 'export')).toBe(true);
    });

    it('manager não deve acessar users e channels', () => {
      expect(canAccess('manager', 'users')).toBe(false);
      expect(canAccess('manager', 'channels')).toBe(false);
      expect(canAccess('manager', 'stages')).toBe(true);
      expect(canAccess('manager', 'reports')).toBe(true);
      expect(canAccess('manager', 'export')).toBe(true);
    });

    it('agent não deve acessar features administrativas', () => {
      expect(canAccess('agent', 'users')).toBe(false);
      expect(canAccess('agent', 'channels')).toBe(false);
      expect(canAccess('agent', 'stages')).toBe(false);
      expect(canAccess('agent', 'reports')).toBe(false);
      expect(canAccess('agent', 'export')).toBe(false);
    });

    it('deve retornar false para feature desconhecida', () => {
      expect(canAccess('admin', 'unknown-feature')).toBe(false);
    });
  });

  describe('getAllRoles', () => {
    it('deve retornar todas as roles disponíveis', () => {
      const roles = getAllRoles();

      expect(roles).toHaveLength(3);
      expect(roles).toContain('admin');
      expect(roles).toContain('manager');
      expect(roles).toContain('agent');
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('deve ter estrutura correta para cada role', () => {
      const roleValues: UserRole[] = ['admin', 'manager', 'agent'];

      roleValues.forEach((role) => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
        expect(typeof ROLE_PERMISSIONS[role]).toBe('object');
      });
    });

    it('admin deve ter mais permissões true que manager', () => {
      const adminPerms = Object.values(ROLE_PERMISSIONS.admin).filter(Boolean).length;
      const managerPerms = Object.values(ROLE_PERMISSIONS.manager).filter(Boolean).length;

      expect(adminPerms).toBeGreaterThan(managerPerms);
    });

    it('manager deve ter mais permissões true que agent', () => {
      const managerPerms = Object.values(ROLE_PERMISSIONS.manager).filter(Boolean).length;
      const agentPerms = Object.values(ROLE_PERMISSIONS.agent).filter(Boolean).length;

      expect(managerPerms).toBeGreaterThan(agentPerms);
    });
  });

  describe('ROLE_LABELS', () => {
    it('deve ter labels para todas as roles', () => {
      expect(ROLE_LABELS.admin).toBe('Administrador');
      expect(ROLE_LABELS.manager).toBe('Gerente');
      expect(ROLE_LABELS.agent).toBe('Agente');
    });
  });

  describe('ROLE_DESCRIPTIONS', () => {
    it('deve ter descrições para todas as roles', () => {
      expect(ROLE_DESCRIPTIONS.admin).toBeDefined();
      expect(ROLE_DESCRIPTIONS.manager).toBeDefined();
      expect(ROLE_DESCRIPTIONS.agent).toBeDefined();

      expect(ROLE_DESCRIPTIONS.admin.length).toBeGreaterThan(0);
      expect(ROLE_DESCRIPTIONS.manager.length).toBeGreaterThan(0);
      expect(ROLE_DESCRIPTIONS.agent.length).toBeGreaterThan(0);
    });
  });
});
