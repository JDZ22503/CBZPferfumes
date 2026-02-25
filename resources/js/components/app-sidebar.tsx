import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Package, ShoppingCart, Box, Warehouse, Settings, Droplet } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Parties',
        href: route('parties.index'),
        icon: Users,
    },
    {
        title: 'Products',
        href: route('products.index'),
        icon: Package,
    },
    {
        title: 'Product Sets(Gift Sets)',
        href: route('product-sets.index'),
        icon: Box,
    },
    {
        title: 'Attars',
        href: route('attars.index'),
        icon: Droplet,
    },
    {
        title: 'Orders',
        href: route('orders.index'),
        icon: ShoppingCart,
    },
    {
        title: 'Inventory',
        href: route('stocks.index'),
        icon: Warehouse,
    },
    {
        title: 'Settings',
        href: route('settings.index'),
        icon: Settings,
    },
];


export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
