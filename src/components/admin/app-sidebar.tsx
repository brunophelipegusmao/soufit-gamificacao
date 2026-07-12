"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  Building2Icon,
  ClipboardCheckIcon,
  DownloadIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogOutIcon,
  PlusCircleIcon,
  QrCodeIcon,
  TrophyIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { logout } from "@/actions/logout";

const campaignNavPlaceholders = [
  { label: "Visão geral", icon: GaugeIcon },
  { label: "Missões", icon: ListChecksIcon },
  { label: "Academias / Locais", icon: Building2Icon },
  { label: "QR Codes", icon: QrCodeIcon },
  { label: "Aprovações pendentes", icon: ClipboardCheckIcon },
  { label: "Ranking", icon: TrophyIcon },
  { label: "Administradores", icon: UsersIcon },
];

const reportsNavPlaceholders = [
  { label: "Engajamento", icon: BarChart3Icon },
  { label: "Exportar dados", icon: DownloadIcon },
];

export function AppSidebar({
  superadmin,
  userEmail,
}: {
  superadmin: boolean;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ZapIcon size={16} />
          </span>
          <span className="font-display font-extrabold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
            EVENTS<span className="text-primary">FITNESS</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/admin" />}
                isActive={pathname === "/admin"}
                tooltip="Dashboard"
              >
                <LayoutDashboardIcon />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            {superadmin && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin/new-campaign" />}
                  isActive={pathname === "/admin/new-campaign"}
                  tooltip="Nova campanha"
                >
                  <PlusCircleIcon />
                  Nova campanha
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestão de campanha</SidebarGroupLabel>
          <SidebarMenu>
            {campaignNavPlaceholders.map(({ label, icon: Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  disabled
                  tooltip={label}
                  className="opacity-50"
                >
                  <Icon />
                  <span>{label}</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-[10px] group-data-[collapsible=icon]:hidden"
                  >
                    em breve
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Relatórios</SidebarGroupLabel>
          <SidebarMenu>
            {reportsNavPlaceholders.map(({ label, icon: Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  disabled
                  tooltip={label}
                  className="opacity-50"
                >
                  <Icon />
                  <span>{label}</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-[10px] group-data-[collapsible=icon]:hidden"
                  >
                    em breve
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
          {userEmail}
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout} className="w-full">
              <SidebarMenuButton type="submit" tooltip="Sair" className="w-full">
                <LogOutIcon />
                Sair
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
