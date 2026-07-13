import { Link, usePage } from '@inertiajs/react';
import {
    IconBuildingStore,
    IconChartPie,
    IconChevronDown,
    IconCreditCard,
    IconLayoutDashboard,
    IconList,
    IconLogout,
    IconMenu2,
    IconReceipt2,
    IconReportMoney,
    IconUserCircle,
    IconUserCog,
    IconUsers,
    IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

const topActionClassName =
    'inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium transition';
const flyoutPanelClassName =
    'rounded-[24px] border border-brand-border bg-brand-surface-alt/70 p-2 shadow-brand-card backdrop-blur-sm';

export default function DashNavbar() {
    const { auth, currentBarberia, ownerBarberiaCount } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    if (auth.user.role !== 'owner') {
        return null;
    }

    const dashboardActions = currentBarberia
        ? [
            {
                href: route('owner.barberias.dashboard', { barberia: currentBarberia.id }),
                label: 'Dashboard',
                icon: IconLayoutDashboard,
                active: route().current('owner.barberias.dashboard'),
            },
            {
                href: route('owner.barberias.cortes.index', { barberia: currentBarberia.id }),
                label: 'Cargar corte',
                icon: IconReceipt2,
                active: route().current('owner.barberias.cortes.*'),
            },
            {
                href: route('owner.barberias.barberos.index', { barberia: currentBarberia.id }),
                label: 'Barberos',
                icon: IconUsers,
                active: route().current('owner.barberias.barberos.*'),
            },
            {
                href: route('owner.barberias.servicios.index', { barberia: currentBarberia.id }),
                label: 'Servicios',
                icon: IconList,
                active: route().current('owner.barberias.servicios.*'),
            },
            {
                href: route('owner.barberias.medios-pago.index', { barberia: currentBarberia.id }),
                label: 'Medios de pago',
                icon: IconCreditCard,
                active: route().current('owner.barberias.medios-pago.*'),
            },
            {
                href: route('owner.barberias.clientes.index', { barberia: currentBarberia.id }),
                label: 'Clientes',
                icon: IconUserCircle,
                active: route().current('owner.barberias.clientes.*'),
            },
            {
                href: route('owner.barberias.finanzas', { barberia: currentBarberia.id }),
                label: 'Finanzas',
                icon: IconReportMoney,
                active: route().current('owner.barberias.finanzas') || route().current('owner.barberias.gastos.*') || route().current('owner.barberias.gasto-registros.*'),
            },
        ]
        : [
            {
                href: route('owner.barberias.index'),
                label: 'Dashboard',
                icon: IconLayoutDashboard,
                active: route().current('owner.barberias.index') || route().current('owner.barberias.create'),
            },
            ...(ownerBarberiaCount > 1
                ? [
                    {
                        href: route('owner.consolidado'),
                        label: 'Consolidado',
                        icon: IconChartPie,
                        active: route().current('owner.consolidado'),
                    },
                ]
                : []),
        ];

    const profileMenuActions = [
        {
            href: route('owner.barberias.index'),
            label: currentBarberia ? 'Cambiar barbería' : 'Mis barberías',
            icon: IconBuildingStore,
        },
        ...(ownerBarberiaCount > 1
            ? [
                {
                    href: route('owner.consolidado'),
                    label: 'Ver consolidado',
                    icon: IconChartPie,
                },
            ]
            : []),
        {
            href: route('profile.edit'),
            label: 'Perfil',
            icon: IconUserCog,
        },
        {
            href: route('logout'),
            label: 'Cerrar sesión',
            icon: IconLogout,
            method: 'post',
            as: 'button',
        },
    ];

    const profileFlyout = (
        <div
            className={`${flyoutPanelClassName} origin-top-right transition-all duration-200 ease-out ${
                profileMenuOpen
                    ? 'pointer-events-auto visible translate-y-0 scale-100 opacity-100'
                    : 'pointer-events-none invisible -translate-y-2 scale-95 opacity-0'
            }`}
        >
            {profileMenuActions.map(({ href, label, icon: Icon, method, as }) => (
                <Link
                    key={label}
                    href={href}
                    method={method}
                    as={as}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-[16px] px-3 py-2.5 text-left text-sm font-medium text-brand-text-secondary transition hover:bg-brand-primary/5 hover:text-brand-text"
                >
                    <Icon size={17} stroke={1.9} />
                    <span>{label}</span>
                </Link>
            ))}
        </div>
    );

    return (
        <div className="rounded-[28px] border border-brand-border bg-brand-surface p-4 shadow-brand-card sm:p-5">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 md:hidden">
                    <button
                        type="button"
                        onClick={() => {
                            setMobileMenuOpen((value) => !value);
                            setProfileMenuOpen(false);
                        }}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="owner-mobile-navigation"
                        aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                        className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-brand-border bg-brand-surface-alt px-4 py-2.5 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                    >
                        {mobileMenuOpen ? <IconX size={18} stroke={2} /> : <IconMenu2 size={18} stroke={2} />}
                        <span>Menú</span>
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setProfileMenuOpen((value) => !value);
                                setMobileMenuOpen(false);
                            }}
                            aria-haspopup="menu"
                            aria-expanded={profileMenuOpen}
                            className={`${topActionClassName} border border-brand-border bg-brand-surface-alt text-brand-text-secondary hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-text`}
                        >
                            <IconUserCog size={17} stroke={1.9} />
                            <span>Mi perfil</span>
                            <IconChevronDown
                                size={15}
                                stroke={2}
                                className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <div
                            className={`absolute right-0 top-full z-30 mt-2 min-w-[220px] ${
                                profileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
                            }`}
                        >
                            {profileFlyout}
                        </div>
                    </div>
                </div>

                <div
                    id="owner-mobile-navigation"
                    aria-hidden={! mobileMenuOpen}
                    className={`overflow-hidden transition-all duration-200 ease-out md:hidden ${
                        mobileMenuOpen
                            ? 'visible pointer-events-auto max-h-[520px] translate-y-0 opacity-100'
                            : 'invisible pointer-events-none max-h-0 -translate-y-2 opacity-0'
                    }`}
                >
                    <div className={`${flyoutPanelClassName} grid gap-2`}>
                        {dashboardActions.map(({ href, label, icon: Icon, active }) => (
                            <Link
                                key={label}
                                href={href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex min-h-[50px] items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                                    active
                                        ? 'bg-brand-primary text-brand-on-primary shadow-brand-cta'
                                        : 'text-brand-text-secondary hover:bg-brand-primary/5 hover:text-brand-text'
                                }`}
                            >
                                <Icon size={18} stroke={1.9} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="hidden md:flex md:flex-col md:gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {dashboardActions.map(({ href, label, icon: Icon, active }) => (
                            <Link
                                key={label}
                                href={href}
                                className={
                                    topActionClassName +
                                    ' ' +
                                    (active
                                        ? 'bg-brand-primary text-brand-on-primary shadow-brand-cta'
                                        : 'border border-brand-border bg-brand-surface-alt text-brand-text-secondary hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-text')
                                }
                            >
                                <Icon size={17} stroke={1.9} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="relative xl:ml-4 xl:self-start">
                        <button
                            type="button"
                            onClick={() => setProfileMenuOpen((value) => !value)}
                            aria-haspopup="menu"
                            aria-expanded={profileMenuOpen}
                            className={`${topActionClassName} border border-brand-border bg-brand-surface-alt text-brand-text-secondary hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-text`}
                        >
                            <IconUserCog size={17} stroke={1.9} />
                            <span>Mi perfil</span>
                            <IconChevronDown
                                size={15}
                                stroke={2}
                                className={`transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <div
                            className={`absolute right-0 top-full z-30 mt-2 min-w-[220px] ${
                                profileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
                            }`}
                        >
                            {profileFlyout}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
