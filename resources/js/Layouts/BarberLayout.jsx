import { Link, usePage } from '@inertiajs/react';
import { IconHome, IconPlus, IconUserCircle } from '@tabler/icons-react';

export default function BarberLayout({ header, children }) {
    const inicioActive = route().current('barber.dashboard');
    const cortesActive = route().current('barber.cortes.*');
    const cuentaActive = route().current('profile.edit');

    return (
        <div className="min-h-screen bg-brand-bg">
            {header && (
                <header className="bg-transparent">
                    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">{header}</div>
                </header>
            )}

            <main className="pb-28">{children}</main>

            <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-brand-nav-bg pb-[env(safe-area-inset-bottom)]">
                <div className="relative mx-auto flex h-16 max-w-3xl items-center justify-between px-10">
                    <Link
                        href={route('barber.dashboard')}
                        aria-current={inicioActive ? 'page' : undefined}
                        className={
                            'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-brand-sm text-xs font-medium transition ' +
                            (inicioActive ? 'text-brand-nav-active' : 'text-brand-nav-text hover:text-brand-nav-active')
                        }
                    >
                        <IconHome size={24} stroke={inicioActive ? 2 : 1.75} />
                        Inicio
                    </Link>

                    <Link
                        href={route('barber.cortes.index')}
                        aria-label="Cargar corte"
                        className={
                            'absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-primary text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover ' +
                            (cortesActive ? 'ring-2 ring-brand-on-primary/50' : '')
                        }
                    >
                        <IconPlus size={28} stroke={2} />
                    </Link>

                    <Link
                        href={route('profile.edit')}
                        aria-current={cuentaActive ? 'page' : undefined}
                        className={
                            'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-brand-sm text-xs font-medium transition ' +
                            (cuentaActive ? 'text-brand-nav-active' : 'text-brand-nav-text hover:text-brand-nav-active')
                        }
                    >
                        <IconUserCircle size={24} stroke={cuentaActive ? 2 : 1.75} />
                        Cuenta
                    </Link>
                </div>
            </nav>
        </div>
    );
}
