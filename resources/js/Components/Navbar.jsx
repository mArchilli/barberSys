import BrandMark from '@/Components/BrandMark';
import { Link } from '@inertiajs/react';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useState } from 'react';

const defaultLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
    { label: 'FAQ', href: '#faq' },
];

function NavAction({ href, inertia = false, className, children, onClick }) {
    if (inertia) {
        return (
            <Link href={href} className={className} onClick={onClick}>
                {children}
            </Link>
        );
    }

    return (
        <a href={href} className={className} onClick={onClick}>
            {children}
        </a>
    );
}

export default function Navbar({
    brandName = 'Pelito',
    homeHref = '#inicio',
    links = defaultLinks,
    cta = {
        label: 'Probar gratis',
        href: '#precios',
        inertia: false,
    },
    loginCta = null,
}) {
    const [isOpen, setIsOpen] = useState(false);

    const navLinkClassName =
        'inline-flex min-h-[44px] items-center rounded-brand-pill px-4 text-[15px] font-semibold text-brand-text-secondary transition-colors duration-200 hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none';

    return (
        <div className="sticky top-0 z-50 px-4 pt-4 sm:px-5">
            <div className="mx-auto max-w-[1180px]">
                <div className="rounded-[30px] border border-brand-border/80 bg-brand-surface/90 px-3 py-2 shadow-brand-card backdrop-blur-md">
                    <div className="flex items-center justify-between gap-3">
                        <a
                            href={homeHref}
                            className="inline-flex min-h-[44px] items-center gap-3 rounded-brand-pill px-3 text-brand-text transition-colors duration-200 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
                        >
                            <BrandMark />
                            <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
                                {brandName}
                            </span>
                        </a>

                        <nav
                            aria-label="Navegación principal"
                            className="hidden items-center justify-center gap-1 md:flex"
                        >
                            {links.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={navLinkClassName}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        <div className="hidden items-center gap-2 md:flex">
                            {loginCta && (
                                <NavAction
                                    href={loginCta.href}
                                    inertia={loginCta.inertia}
                                    className={navLinkClassName}
                                >
                                    {loginCta.label}
                                </NavAction>
                            )}
                            <NavAction
                                href={cta.href}
                                inertia={cta.inertia}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-surface shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                            >
                                {cta.label}
                            </NavAction>
                        </div>

                        <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls="mobile-nav"
                            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-brand-pill border border-brand-border bg-brand-surface text-brand-text transition-colors duration-200 hover:border-brand-primary-muted hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none md:hidden"
                            onClick={() => setIsOpen((open) => !open)}
                        >
                            {isOpen ? (
                                <IconX className="h-5 w-5" stroke={2} />
                            ) : (
                                <IconMenu2 className="h-5 w-5" stroke={2} />
                            )}
                        </button>
                    </div>

                    {isOpen && (
                        <div
                            id="mobile-nav"
                            className="mt-3 border-t border-brand-border-subtle pt-3 md:hidden"
                        >
                            <nav
                                aria-label="Navegación móvil"
                                className="flex flex-col gap-1"
                            >
                                {links.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="inline-flex min-h-[44px] items-center rounded-brand-lg px-4 text-sm font-semibold text-brand-text-secondary transition-colors duration-200 hover:bg-brand-primary-soft hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                                {loginCta && (
                                    <NavAction
                                        href={loginCta.href}
                                        inertia={loginCta.inertia}
                                        className="inline-flex min-h-[44px] items-center rounded-brand-lg px-4 text-sm font-semibold text-brand-text-secondary transition-colors duration-200 hover:bg-brand-primary-soft hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {loginCta.label}
                                    </NavAction>
                                )}
                                <NavAction
                                    href={cta.href}
                                    inertia={cta.inertia}
                                    className="mt-2 inline-flex min-h-[48px] items-center justify-center rounded-brand-pill bg-brand-primary px-5 text-sm font-bold text-brand-surface shadow-brand-cta transition-colors duration-200 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {cta.label}
                                </NavAction>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
