import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, currentBarberia, ownerBarberiaCount } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-brand-bg">
            <nav className="border-b border-brand-border/20 bg-brand-nav-bg">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-brand-nav-active" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard') || route().current('owner.barberias.dashboard')}
                                >
                                    Dashboard
                                </NavLink>

                                {user.role === 'owner' && currentBarberia && (
                                    <>
                                        <NavLink
                                            href={route('owner.barberias.cortes.index', { barberia: currentBarberia.id })}
                                            active={route().current('owner.barberias.cortes.*')}
                                        >
                                            Cargar corte
                                        </NavLink>

                                        <NavLink
                                            href={route('owner.barberias.barberos.index', { barberia: currentBarberia.id })}
                                            active={route().current('owner.barberias.barberos.*')}
                                        >
                                            Barberos
                                        </NavLink>

                                        <NavLink
                                            href={route('owner.barberias.servicios.index', { barberia: currentBarberia.id })}
                                            active={route().current('owner.barberias.servicios.*')}
                                        >
                                            Servicios
                                        </NavLink>

                                        <NavLink
                                            href={route('owner.barberias.medios-pago.index', { barberia: currentBarberia.id })}
                                            active={route().current('owner.barberias.medios-pago.*')}
                                        >
                                            Medios de pago
                                        </NavLink>

                                        <NavLink
                                            href={route('owner.barberias.clientes.index', { barberia: currentBarberia.id })}
                                            active={route().current('owner.barberias.clientes.*')}
                                        >
                                            Clientes
                                        </NavLink>

                                        <NavLink
                                            href={route('owner.barberias.finanzas', { barberia: currentBarberia.id })}
                                            active={route().current('owner.barberias.finanzas') || route().current('owner.barberias.gastos.*') || route().current('owner.barberias.gasto-registros.*')}
                                        >
                                            Finanzas
                                        </NavLink>
                                    </>
                                )}

                                {user.role === 'barber' && (
                                    <NavLink
                                        href={route('barber.cortes.index')}
                                        active={route().current('barber.cortes.*')}
                                    >
                                        Cargar corte
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center sm:gap-4">
                            {/* Indicador de barbería activa */}
                            {user.role === 'owner' && currentBarberia && (
                                <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-brand-accent-soft px-3 py-1 text-xs font-medium text-brand-accent-soft-text">
                                        {currentBarberia.name}
                                    </span>
                                    {ownerBarberiaCount > 1 && (
                                        <>
                                            <Link
                                                href={route('owner.barberias.index')}
                                                className="text-xs text-brand-nav-text transition hover:text-brand-nav-active"
                                            >
                                                Cambiar
                                            </Link>
                                            <Link
                                                href={route('owner.consolidado')}
                                                className="text-xs text-brand-nav-text transition hover:text-brand-nav-active"
                                            >
                                                Ver consolidado
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-transparent px-3 py-2 text-sm font-medium leading-4 text-brand-nav-text transition duration-150 ease-in-out hover:text-brand-nav-active focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Cerrar sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2.5 text-brand-nav-text transition duration-150 ease-in-out hover:bg-brand-surface/10 hover:text-brand-nav-active focus:bg-brand-surface/10 focus:text-brand-nav-active focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile nav */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard') || route().current('owner.barberias.dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>

                        {user.role === 'owner' && currentBarberia && (
                            <>
                                <ResponsiveNavLink
                                    href={route('owner.barberias.cortes.index', { barberia: currentBarberia.id })}
                                    active={route().current('owner.barberias.cortes.*')}
                                >
                                    Cargar corte
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('owner.barberias.barberos.index', { barberia: currentBarberia.id })}
                                    active={route().current('owner.barberias.barberos.*')}
                                >
                                    Barberos
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('owner.barberias.servicios.index', { barberia: currentBarberia.id })}
                                    active={route().current('owner.barberias.servicios.*')}
                                >
                                    Servicios
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('owner.barberias.medios-pago.index', { barberia: currentBarberia.id })}
                                    active={route().current('owner.barberias.medios-pago.*')}
                                >
                                    Medios de pago
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('owner.barberias.clientes.index', { barberia: currentBarberia.id })}
                                    active={route().current('owner.barberias.clientes.*')}
                                >
                                    Clientes
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('owner.barberias.finanzas', { barberia: currentBarberia.id })}
                                    active={route().current('owner.barberias.finanzas') || route().current('owner.barberias.gastos.*') || route().current('owner.barberias.gasto-registros.*')}
                                >
                                    Finanzas
                                </ResponsiveNavLink>
                            </>
                        )}

                        {user.role === 'barber' && (
                            <ResponsiveNavLink
                                href={route('barber.cortes.index')}
                                active={route().current('barber.cortes.*')}
                            >
                                Cargar corte
                            </ResponsiveNavLink>
                        )}

                        {user.role === 'owner' && currentBarberia && ownerBarberiaCount > 1 && (
                            <>
                                <ResponsiveNavLink href={route('owner.barberias.index')}>
                                    Cambiar barbería
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('owner.consolidado')}
                                    active={route().current('owner.consolidado')}
                                >
                                    Ver consolidado
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-brand-border/20 pb-1 pt-4">
                        {user.role === 'owner' && currentBarberia && (
                            <div className="px-4 pb-2">
                                <span className="text-xs font-medium text-brand-nav-text/60">Barbería activa: </span>
                                <span className="text-xs font-semibold text-brand-nav-active">{currentBarberia.name}</span>
                            </div>
                        )}

                        <div className="px-4">
                            <div className="text-base font-medium text-brand-nav-active">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-brand-nav-text">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-brand-surface shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
