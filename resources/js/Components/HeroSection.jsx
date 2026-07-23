import { Link } from '@inertiajs/react';
import {
    IconArrowRight,
    IconPlayerPlayFilled,
} from '@tabler/icons-react';

function HeroAction({ href, inertia = false, className, children }) {
    if (inertia) {
        return (
            <Link href={href} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}

export default function HeroSection({
    primaryCta = {
        label: 'Probar gratis',
        href: '#',
        inertia: false,
    },
    secondaryCta = {
        label: 'Cómo funciona',
        href: '#como-funciona',
        inertia: false,
    },
}) {
    return (
        <section
            id="inicio"
            className="relative -mt-[76px] flex min-h-[100svh] overflow-hidden bg-cover bg-center bg-no-repeat px-5 pb-10 pt-[116px] sm:px-8 sm:pb-12 sm:pt-[124px] lg:px-10 lg:pb-10 lg:pt-[116px] xl:px-12"
            style={{
                backgroundImage: "url('/images/hero-background.png')",
            }}
        >
            <div className="mx-auto flex w-full max-w-[1760px] flex-1 items-center">
                <div className="flex w-full max-w-[760px] flex-col items-start lg:pb-2">
                    <h1 className="max-w-[11ch] text-4xl leading-[0.98] text-brand-text sm:text-5xl lg:max-w-none lg:text-[3.25rem] xl:text-[3.55rem] 2xl:text-[3.75rem]">
                        <span className="block xl:whitespace-nowrap">
                            Vos encargate de cortar.
                        </span>
                        <span className="mt-1 block text-brand-primary xl:whitespace-nowrap">
                            Estilus ordena tu barbería.
                        </span>
                    </h1>

                    <p className="mt-5 max-w-[36rem] text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                        Registrá servicios, medí la productividad de tus
                        barberos y conocé la rentabilidad real de tu negocio
                        mes a mes desde una interfaz clara, rápida y pensada
                        para usarse todos los días.
                    </p>

                    <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <HeroAction
                            href={primaryCta.href}
                            inertia={primaryCta.inertia}
                            className="inline-flex min-h-[48px] items-center justify-center rounded-brand-pill bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                        >
                            <span>{primaryCta.label}</span>
                            <IconArrowRight
                                className="ml-2 h-4 w-4"
                                stroke={2.4}
                            />
                        </HeroAction>

                        <HeroAction
                            href={secondaryCta.href}
                            inertia={secondaryCta.inertia}
                            className="inline-flex min-h-[48px] items-center justify-center rounded-brand-pill border border-brand-border bg-brand-surface px-6 text-sm font-semibold text-brand-text transition-colors duration-200 hover:border-brand-primary-muted hover:bg-brand-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
                        >
                            <IconPlayerPlayFilled className="mr-2 h-4 w-4 fill-current" />
                            <span>{secondaryCta.label}</span>
                        </HeroAction>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-brand-text-secondary">
                        <div className="flex -space-x-2">
                            {['LR', 'MN', 'AG'].map((initials) => (
                                <div
                                    key={initials}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-surface bg-brand-surface-alt text-[11px] font-semibold text-brand-text"
                                >
                                    {initials}
                                </div>
                            ))}
                        </div>
                        <p className="max-w-[24rem] leading-6">
                            Diseñado para barberías que quieren dejar atrás el
                            cuaderno y entender sus números en tiempo real.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
