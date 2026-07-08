import ApplicationLogo from '@/Components/ApplicationLogo';
import MobileMenuLink from '@/Components/MobileMenuLink';
import MobileNavOverlay from '@/Components/MobileNavOverlay';
import SidebarLink from '@/Components/SidebarLink';
import useSidebarCollapsed from '@/Hooks/useSidebarCollapsed';
import { Link, usePage } from '@inertiajs/react';
import {
    IconBuildingStore,
    IconChartPie,
    IconCreditCard,
    IconLayoutDashboard,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
    IconList,
    IconLogout,
    IconMenu2,
    IconReceipt2,
    IconReportMoney,
    IconUserCircle,
    IconUserCog,
    IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';

export default function AuthenticatedLayout({
    header,
    children,
    hideOwnerBarberiaNav = false,
    hideSidebar = false,
    headerContainerClassName = 'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8',
    headerClassName,
}) {
    const { auth, currentBarberia, ownerBarberiaCount } = usePage().props;
    const user = auth.user;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const closeMobileMenu = () => setMobileMenuOpen(false);
    const [collapsed, setCollapsed] = useSidebarCollapsed();

    // `header` normalmente es un nodo fijo. Una pantalla puede pasar una
    // función `({ onOpenMobileMenu }) => node` cuando necesita renderizar su
    // propio disparador del menú mobile alineado dentro de su propio layout
    // (en vez del botón flotante de acá abajo, que se oculta en ese caso).
    const rendersOwnMobileTrigger = typeof header === 'function';
    const headerContent = rendersOwnMobileTrigger
        ? header({ onOpenMobileMenu: () => setMobileMenuOpen(true) })
        : header;

    const dashboardHref = user.role === 'owner' && currentBarberia
        ? route('owner.barberias.dashboard', { barberia: currentBarberia.id })
        : route('dashboard');
    const dashboardActive = route().current('dashboard') || route().current('owner.barberias.dashboard');
    const cortesActive = user.role === 'owner' ? route().current('owner.barberias.cortes.*') : route().current('barber.cortes.*');
    const barberosActive = route().current('owner.barberias.barberos.*');
    const serviciosActive = route().current('owner.barberias.servicios.*');
    const mediosPagoActive = route().current('owner.barberias.medios-pago.*');
    const clientesActive = route().current('owner.barberias.clientes.*');
    const finanzasActive = route().current('owner.barberias.finanzas') || route().current('owner.barberias.gastos.*') || route().current('owner.barberias.gasto-registros.*');
    const consolidadoActive = route().current('owner.consolidado');
    const showOwnerBarberiaNav = user.role === 'owner' && currentBarberia && !hideOwnerBarberiaNav;
    const showDashboardNavLink = !(hideOwnerBarberiaNav && user.role === 'owner' && currentBarberia);
    const contentOffsetClass = hideSidebar ? '' : `${rendersOwnMobileTrigger ? '' : 'pt-16 md:pt-0'} ${collapsed ? 'md:pl-20' : 'md:pl-64'}`;

    return (
        <div className="panel-theme min-h-screen bg-brand-bg md:flex">
            {/* Sidebar (desktop) */}
            {!hideSidebar && (
            <aside
                className={
                    'hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:flex-col md:bg-brand-nav-bg md:transition-[width] md:duration-150 ' +
                    (collapsed ? 'md:w-20' : 'md:w-64')
                }
            >
                <div className={`flex h-16 shrink-0 items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
                    <Link href="/">
                        <ApplicationLogo className="block h-8 w-auto fill-current text-brand-nav-active" />
                    </Link>
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={() => setCollapsed(true)}
                            aria-label="Contraer menú"
                            className="flex h-9 w-9 items-center justify-center rounded-brand-sm text-brand-nav-text transition hover:bg-brand-surface/10 hover:text-brand-nav-active"
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

                {!collapsed && user.role === 'owner' && currentBarberia && (
                    <div className="px-4 pb-4">
                        <span className="block truncate rounded-brand-sm bg-brand-primary/10 px-3 py-2 text-xs font-medium text-brand-nav-active">
                            {currentBarberia.name}
                        </span>
                    </div>
                )}

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
                    {showDashboardNavLink && (
                        <SidebarLink href={dashboardHref} active={dashboardActive} icon={IconLayoutDashboard} collapsed={collapsed}>
                            Dashboard
                        </SidebarLink>
                    )}

                    {showOwnerBarberiaNav && (
                        <>
                            <SidebarLink
                                href={route('owner.barberias.cortes.index', { barberia: currentBarberia.id })}
                                active={cortesActive}
                                icon={IconReceipt2}
                                collapsed={collapsed}
                            >
                                Cargar corte
                            </SidebarLink>
                            <SidebarLink
                                href={route('owner.barberias.barberos.index', { barberia: currentBarberia.id })}
                                active={barberosActive}
                                icon={IconUsers}
                                collapsed={collapsed}
                            >
                                Barberos
                            </SidebarLink>
                            <SidebarLink
                                href={route('owner.barberias.servicios.index', { barberia: currentBarberia.id })}
                                active={serviciosActive}
                                icon={IconList}
                                collapsed={collapsed}
                            >
                                Servicios
                            </SidebarLink>
                            <SidebarLink
                                href={route('owner.barberias.medios-pago.index', { barberia: currentBarberia.id })}
                                active={mediosPagoActive}
                                icon={IconCreditCard}
                                collapsed={collapsed}
                            >
                                Medios de pago
                            </SidebarLink>
                            <SidebarLink
                                href={route('owner.barberias.clientes.index', { barberia: currentBarberia.id })}
                                active={clientesActive}
                                icon={IconUserCircle}
                                collapsed={collapsed}
                            >
                                Clientes
                            </SidebarLink>
                            <SidebarLink
                                href={route('owner.barberias.finanzas', { barberia: currentBarberia.id })}
                                active={finanzasActive}
                                icon={IconReportMoney}
                                collapsed={collapsed}
                            >
                                Finanzas
                            </SidebarLink>
                        </>
                    )}

                    {user.role === 'barber' && (
                        <SidebarLink href={route('barber.cortes.index')} active={cortesActive} icon={IconReceipt2} collapsed={collapsed}>
                            Cargar corte
                        </SidebarLink>
                    )}
                </nav>

                <div className="border-t border-brand-nav-text/10 px-3 py-4">
                    {user.role === 'owner' && currentBarberia && ownerBarberiaCount > 1 && (
                        <div className="mb-2 space-y-1">
                            <SidebarLink href={route('owner.barberias.index')} icon={IconBuildingStore} collapsed={collapsed}>
                                Cambiar barbería
                            </SidebarLink>
                            <SidebarLink href={route('owner.consolidado')} active={consolidadoActive} icon={IconChartPie} collapsed={collapsed}>
                                Ver consolidado
                            </SidebarLink>
                        </div>
                    )}

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
            )}

            {/* Botón flotante de menú (mobile) — se oculta cuando la pantalla
                renderiza su propio disparador dentro del header. */}
            {!hideSidebar && !rendersOwnMobileTrigger && (
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Abrir menú"
                    className="fixed right-4 top-4 z-40 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-brand-pill bg-brand-nav-bg text-brand-nav-text shadow-brand-floating transition hover:text-brand-nav-active md:hidden"
                >
                    <IconMenu2 size={20} stroke={2} />
                </button>
            )}

            {/* Menú de pantalla completa (mobile) */}
            {!hideSidebar && (
            <MobileNavOverlay open={mobileMenuOpen} onClose={closeMobileMenu}>
                {showDashboardNavLink && (
                    <MobileMenuLink href={dashboardHref} active={dashboardActive} onClick={closeMobileMenu}>
                        Dashboard
                    </MobileMenuLink>
                )}

                {showOwnerBarberiaNav && (
                    <>
                        <MobileMenuLink
                            href={route('owner.barberias.cortes.index', { barberia: currentBarberia.id })}
                            active={cortesActive}
                            onClick={closeMobileMenu}
                        >
                            Cargar corte
                        </MobileMenuLink>
                        <MobileMenuLink
                            href={route('owner.barberias.barberos.index', { barberia: currentBarberia.id })}
                            active={barberosActive}
                            onClick={closeMobileMenu}
                        >
                            Barberos
                        </MobileMenuLink>
                        <MobileMenuLink
                            href={route('owner.barberias.servicios.index', { barberia: currentBarberia.id })}
                            active={serviciosActive}
                            onClick={closeMobileMenu}
                        >
                            Servicios
                        </MobileMenuLink>
                        <MobileMenuLink
                            href={route('owner.barberias.medios-pago.index', { barberia: currentBarberia.id })}
                            active={mediosPagoActive}
                            onClick={closeMobileMenu}
                        >
                            Medios de pago
                        </MobileMenuLink>
                        <MobileMenuLink
                            href={route('owner.barberias.clientes.index', { barberia: currentBarberia.id })}
                            active={clientesActive}
                            onClick={closeMobileMenu}
                        >
                            Clientes
                        </MobileMenuLink>
                        <MobileMenuLink
                            href={route('owner.barberias.finanzas', { barberia: currentBarberia.id })}
                            active={finanzasActive}
                            onClick={closeMobileMenu}
                        >
                            Finanzas
                        </MobileMenuLink>
                    </>
                )}

                {user.role === 'barber' && (
                    <MobileMenuLink href={route('barber.cortes.index')} active={cortesActive} onClick={closeMobileMenu}>
                        Cargar corte
                    </MobileMenuLink>
                )}

                {user.role === 'owner' && currentBarberia && ownerBarberiaCount > 1 && (
                    <>
                        <MobileMenuLink href={route('owner.barberias.index')} onClick={closeMobileMenu}>
                            Cambiar barbería
                        </MobileMenuLink>
                        <MobileMenuLink href={route('owner.consolidado')} active={consolidadoActive} onClick={closeMobileMenu}>
                            Ver consolidado
                        </MobileMenuLink>
                    </>
                )}

                <div className="mt-6 w-full max-w-xs border-t border-brand-nav-text/20 pt-6 text-center">
                    {user.role === 'owner' && currentBarberia && (
                        <p className="mb-3 text-xs text-brand-nav-text">
                            Barbería activa: <span className="font-semibold text-brand-nav-active">{currentBarberia.name}</span>
                        </p>
                    )}
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
            )}

            {/* Columna de contenido */}
            <div
                className={`flex-1 transition-[padding] duration-150 ${contentOffsetClass}`}
            >
                {headerContent && (
                    <header
                        className={
                            headerClassName ?? (
                            rendersOwnMobileTrigger
                                ? 'sticky top-0 z-20 bg-brand-bg/95 backdrop-blur-sm md:static md:bg-brand-surface md:shadow-sm'
                                : 'bg-transparent shadow-none md:bg-brand-surface md:shadow-sm'
                            )
                        }
                    >
                        <div className={headerContainerClassName}>
                            {headerContent}
                        </div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
