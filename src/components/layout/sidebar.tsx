'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Contatos',
    href: '/dashboard/contacts',
    icon: Users,
  },
  {
    title: 'Conversas',
    href: '/dashboard/conversations',
    icon: MessageSquare,
  },
  {
    title: 'Negócios',
    href: '/dashboard/deals/pipeline',
    icon: FolderKanban,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { role, checkPermission } = useUserRole();

  // Filtrar itens baseado em permissões
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return checkPermission('canViewReports');
  });

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header da Sidebar */}
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-lg font-semibold">CRM</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      {/* Navegação */}
      <nav className="flex-1 space-y-1 p-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn('w-full justify-start', isCollapsed && 'justify-center px-2')}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                {!isCollapsed && <span>{item.title}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer da Sidebar */}
      <div className="p-4">
        {!isCollapsed && role && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Perfil</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
