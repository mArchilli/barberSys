import BrandMark from '@/Components/BrandMark';
import { IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react';

const socialBaseClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/[0.04] text-brand-bg shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/60 hover:bg-brand-primary/10 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-nav-bg motion-reduce:transform-none motion-reduce:transition-none';

const navLinkClassName =
    'inline-flex min-h-[42px] items-center rounded-brand-pill px-3 text-sm font-semibold text-brand-text-on-dark transition-colors duration-200 hover:bg-white/[0.04] hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-nav-bg motion-reduce:transition-none';

const defaultLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
    { label: 'FAQ', href: '#faq' },
];

export default function FooterSection({
    brandName = 'Pelito',
    links = defaultLinks,
    whatsappHref = 'https://wa.me/',
    instagramHref = '#',
}) {
    return (
        <footer className="bg-brand-nav-bg px-6 pb-0 sm:px-8 lg:px-10 xl:px-12">
            <div className="mx-auto w-full max-w-[1440px] pb-8 pt-8 sm:pb-10 sm:pt-10 lg:pb-12">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] lg:items-start lg:gap-14">
                    <div className="max-w-3xl">
                        <a
                            href="#inicio"
                            className="inline-flex items-center gap-3 rounded-brand-pill text-brand-bg transition-colors duration-200 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-nav-bg motion-reduce:transition-none"
                        >
                            <BrandMark className="h-10 w-10 text-brand-bg" />
                            <span className="font-display text-[1.6rem] font-extrabold tracking-[-0.03em] text-brand-bg">
                                {brandName}
                            </span>
                        </a>

                        <p className="mt-5 max-w-2xl font-display text-3xl font-extrabold leading-[1.04] tracking-[-0.03em] text-brand-bg sm:text-[2.4rem] lg:text-[2.8rem]">
                            Gestion para tu barberia, con una salida mas prolija que la entrada.
                        </p>

                        <p className="mt-5 max-w-xl text-base leading-8 text-brand-text-on-dark">
                            Menos caos operativo, mas tiempo para hacer crecer el negocio.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
                                Navegacion
                            </p>
                            <nav
                                aria-label="Navegacion del footer"
                                className="mt-4 flex flex-col items-start gap-1"
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
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
                                Contacto
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="WhatsApp de Pelito"
                                    className={socialBaseClass}
                                >
                                    <IconBrandWhatsapp className="h-5 w-5" stroke={2.1} />
                                </a>
                                <a
                                    href={instagramHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Instagram de Pelito"
                                    className={socialBaseClass}
                                >
                                    <IconBrandInstagram className="h-5 w-5" stroke={2.1} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-brand-text-on-dark">
                        Powered by{' '}
                        <span className="font-bold tracking-[0.12em] text-brand-primary">
                            PAMPA LABS
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
