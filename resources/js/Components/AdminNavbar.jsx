import { Link, usePage } from '@inertiajs/react';
import {
    IconActivityHeartbeat,
    IconChevronDown,
    IconClipboardList,
    IconHeadset,
    IconLayoutDashboard,
    IconLicense,
    IconLogout,
    IconMenu2,
    IconTicket,
    IconUserCog,
    IconUserPlus,
    IconUsers,
    IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

const topActionClassName =
    'inline-flex min-h-[52px] shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition';
const flyoutPanelClassName =
    'rounded-[24px] border border-brand-border bg-brand-surface-alt/70 p-2 shadow-brand-card backdrop-blur-sm';

export default function AdminNavbar() {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    if (auth.user.role !== 'admin') {
        return null;
    }

    const adminActions = [
        {
            href: route('admin.dashboard'),
            label: 'Dashboard',
            icon: IconLayoutDashboard,
            active: route().current('admin.dashboard'),
        },
        {
            href: route('admin.owners.index'),
            label: 'Owners',
            icon: IconUsers,
            active: route().current('admin.owners.*'),
        },
        {
            href: route('admin.onboarding.index'),
            label: 'Onboarding',
            icon: IconUserPlus,
            active: route().current('admin.onboarding.*'),
        },
        {
            href: route('admin.plans.index'),
            label: 'Planes',
            icon: IconLicense,
            active: route().current('admin.plans.*'),
        },
        {
            href: route('admin.coupons.index'),
            label: 'Cupones',
            icon: IconTicket,
            active: route().current('admin.coupons.*'),
        },
        {
            href: route('admin.surveys.index'),
            label: 'Encuestas',
            icon: IconClipboardList,
            active: route().current('admin.surveys.*'),
        },
        {
            href: route('admin.salud.index'),
            label: 'Salud técnica',
            icon: IconActivityHeartbeat,
            active: route().current('admin.salud.*'),
        },
        {
            href: route('admin.soporte.index'),
            label: 'Soporte',
            icon: IconHeadset,
            active: route().current('admin.soporte.*'),
        },
    ];

    const profileMenuActions = [
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
        <div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 md:hidden">
                    <button
                        type="button"
                        onClick={() => {
                            setMobileMenuOpen((value) => !value);
                            setProfileMenuOpen(false);
                        }}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="admin-mobile-navigation"
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
                            <IconUserCog size={19} stroke={1.9} />
                            <span>Mi perfil</span>
                            <IconChevronDown
                                size={17}
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
                    id="admin-mobile-navigation"
                    aria-hidden={! mobileMenuOpen}
                    className={`overflow-hidden transition-all duration-200 ease-out md:hidden ${
                        mobileMenuOpen
                            ? 'visible pointer-events-auto max-h-[520px] translate-y-0 opacity-100'
                            : 'invisible pointer-events-none max-h-0 -translate-y-2 opacity-0'
                    }`}
                >
                    <div className={`${flyoutPanelClassName} grid gap-2`}>
                        {adminActions.map(({ href, label, icon: Icon, active }) => (
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
                        {adminActions.map(({ href, label, icon: Icon, active }) => (
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
                                <Icon size={19} stroke={1.9} />
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
                            <IconUserCog size={19} stroke={1.9} />
                            <span>Mi perfil</span>
                            <IconChevronDown
                                size={17}
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
