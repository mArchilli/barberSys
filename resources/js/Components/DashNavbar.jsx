import { Link, usePage } from '@inertiajs/react';
import {
    IconBuildingStore,
    IconChartPie,
    IconChevronDown,
    IconCreditCard,
    IconLayoutDashboard,
    IconList,
    IconLogout,
    IconReceipt2,
    IconReportMoney,
    IconUserCircle,
    IconUserCog,
    IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';

const topActionClassName =
    'inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium transition';

export default function DashNavbar() {
    const { auth, currentBarberia, ownerBarberiaCount } = usePage().props;
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

    return (
        <div className="rounded-[28px] border border-brand-border bg-brand-surface p-4 shadow-brand-card sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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

                    {profileMenuOpen && (
                        <div className="absolute right-0 top-full z-30 mt-2 min-w-[220px] rounded-[22px] border border-brand-border bg-brand-surface p-2 shadow-brand-card">
                            {profileMenuActions.map(({ href, label, icon: Icon, method, as }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    method={method}
                                    as={as}
                                    onClick={() => setProfileMenuOpen(false)}
                                    className="flex w-full items-center gap-2 rounded-[16px] px-3 py-2.5 text-left text-sm font-medium text-brand-text-secondary transition hover:bg-brand-surface-alt hover:text-brand-text"
                                >
                                    <Icon size={17} stroke={1.9} />
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
