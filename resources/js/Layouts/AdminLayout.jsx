import ApplicationLogo from '@/Components/ApplicationLogo';
import MobileMenuLink from '@/Components/MobileMenuLink';
import MobileNavOverlay from '@/Components/MobileNavOverlay';
import SidebarLink from '@/Components/SidebarLink';
import useSidebarCollapsed from '@/Hooks/useSidebarCollapsed';
import { Link, usePage } from '@inertiajs/react';
import {
    IconLayoutDashboard,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
    IconLicense,
    IconLogout,
    IconMenu2,
    IconUserCog,
    IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';

export default function AdminLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const closeMobileMenu = () => setMobileMenuOpen(false);
    const [collapsed, setCollapsed] = useSidebarCollapsed();

    const dashboardActive = route().current('admin.dashboard');
    const ownersActive = route().current('admin.owners.*');
    const plansActive = route().current('admin.plans.*');

    return (
        <div className="panel-theme min-h-screen bg-brand-bg md:flex">
            {/* Sidebar (desktop) */}
            <aside
                className={
                    'hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:flex-col md:bg-brand-nav-bg md:transition-[width] md:duration-150 ' +
                    (collapsed ? 'md:w-20' : 'md:w-64')
                }
            >
                <div className={`flex h-16 shrink-0 items-center gap-3 ${collapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
                    <Link href={route('admin.dashboard')} className="flex items-center gap-3">
                        <ApplicationLogo className="block h-8 w-auto shrink-0 fill-current text-brand-nav-active" />
                        {!collapsed && (
                            <span className="rounded-brand-pill bg-brand-primary/10 px-2.5 py-1 text-xs font-medium text-brand-nav-active">
                                Admin
                            </span>
                        )}
                    </Link>
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={() => setCollapsed(true)}
                            aria-label="Contraer menú"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand-sm text-brand-nav-text transition hover:bg-brand-surface/10 hover:text-brand-nav-active"
                        >
                            <IconLayoutSidebarLeftCollapse size={20} stroke={1.75} />
                        </button>
                    )}
                </div>

                {collapsed && (
                    <div className="flex justify-center pb-2">
                        <button
                            type="button"
                            onClick={() => setCollapsed(false)}
                            aria-label="Expandir menú"
                            className="flex h-9 w-9 items-center justify-center rounded-brand-sm text-brand-nav-text transition hover:bg-brand-surface/10 hover:text-brand-nav-active"
                        >
                            <IconLayoutSidebarLeftExpand size={20} stroke={1.75} />
                        </button>
                    </div>
                )}

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
                    <SidebarLink href={route('admin.dashboard')} active={dashboardActive} icon={IconLayoutDashboard} collapsed={collapsed}>
                        Dashboard
                    </SidebarLink>
                    <SidebarLink href={route('admin.owners.index')} active={ownersActive} icon={IconUsers} collapsed={collapsed}>
                        Owners
                    </SidebarLink>
                    <SidebarLink href={route('admin.plans.index')} active={plansActive} icon={IconLicense} collapsed={collapsed}>
                        Planes
                    </SidebarLink>
                </nav>

                <div className="border-t border-brand-nav-text/10 px-3 py-4">
                    {!collapsed && (
                        <div className="px-3 py-2">
                            <p className="truncate text-sm font-semibold text-brand-nav-active">{user.name}</p>
                            <p className="truncate text-xs text-brand-nav-text">{user.email}</p>
                        </div>
                    )}

                    <div className="mt-1 space-y-1">
                        <SidebarLink href={route('profile.edit')} icon={IconUserCog} collapsed={collapsed}>
                            Perfil
                        </SidebarLink>
                        <SidebarLink
                            href={route('logout')}
                            method="post"
                            as="button"
                            icon={IconLogout}
                            collapsed={collapsed}
                            className="w-full text-left"
                        >
                            Cerrar sesión
                        </SidebarLink>
                    </div>
                </div>
            </aside>

            {/* Botón flotante de menú (mobile) */}
            <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                className="fixed right-4 top-4 z-40 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-brand-pill bg-brand-nav-bg text-brand-nav-text shadow-brand-floating transition hover:text-brand-nav-active md:hidden"
            >
                <IconMenu2 size={20} stroke={2} />
            </button>

            {/* Menú de pantalla completa (mobile) */}
            <MobileNavOverlay open={mobileMenuOpen} onClose={closeMobileMenu}>
                <MobileMenuLink href={route('admin.dashboard')} active={dashboardActive} onClick={closeMobileMenu}>
                    Dashboard
                </MobileMenuLink>
                <MobileMenuLink href={route('admin.owners.index')} active={ownersActive} onClick={closeMobileMenu}>
                    Owners
                </MobileMenuLink>
                <MobileMenuLink href={route('admin.plans.index')} active={plansActive} onClick={closeMobileMenu}>
                    Planes
                </MobileMenuLink>

                <div className="mt-6 w-full max-w-xs border-t border-brand-nav-text/20 pt-6 text-center">
                    <p className="text-sm font-semibold text-brand-nav-active">{user.name}</p>
                    <p className="text-xs text-brand-nav-text">{user.email}</p>
                </div>

                <MobileMenuLink href={route('profile.edit')} onClick={closeMobileMenu}>
                    Perfil
                </MobileMenuLink>
                <MobileMenuLink href={route('logout')} method="post" as="button" onClick={closeMobileMenu}>
                    Cerrar sesión
                </MobileMenuLink>
            </MobileNavOverlay>

            {/* Columna de contenido */}
            <div className={`flex-1 pt-16 transition-[padding] duration-150 md:pt-0 ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>
                {header && (
                    <header className="bg-transparent shadow-none md:bg-brand-surface md:shadow-sm">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
