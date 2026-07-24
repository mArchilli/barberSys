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

function ProductPreview() {
    return (
        <figure
            aria-label="Dashboard de Estilus en sus vistas de escritorio y mobile"
            className="relative mx-auto h-[390px] w-full max-w-[900px] sm:h-[500px] md:h-[540px] lg:h-[700px] xl:h-[640px]"
        >
            <div className="absolute left-[1%] top-[12%] w-[96%] -rotate-[0.7deg] sm:left-0 sm:top-[11%] sm:w-[94%] lg:left-[-1%] lg:top-[16%] lg:w-[96%] lg:-rotate-[1.5deg]">
                <div className="hero-product-reveal hero-product-reveal--dashboard overflow-hidden rounded-[20px] border border-white/55 bg-brand-nav-bg shadow-[0_32px_80px_rgba(29,34,33,0.22)] sm:rounded-[26px] xl:rounded-[30px]">
                    <img
                        src="/images/estilus-dashboard-desktop.jpg"
                        alt="Dashboard de escritorio de Estilus con facturación, cortes y medios de pago"
                        width="1895"
                        height="899"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="block h-auto w-full"
                    />
                </div>
            </div>

            <div className="absolute right-[3%] top-[39%] z-10 w-[27%] rotate-[1.25deg] sm:right-[3%] sm:top-[36%] sm:w-[24%] lg:right-0 lg:top-[39%] lg:w-[22%] lg:rotate-[2.5deg] xl:w-[21%]">
                <div className="hero-product-reveal hero-product-reveal--mobile overflow-hidden rounded-[22px] border border-white/70 bg-brand-nav-bg shadow-[0_22px_46px_rgba(29,34,33,0.2)] sm:rounded-[28px]">
                    <img
                        src="/images/estilus-dashboard-mobile.jpg"
                        alt="Vista mobile de Estilus con evolución de facturación y medios de pago"
                        width="376"
                        height="834"
                        loading="eager"
                        decoding="async"
                        className="block h-auto w-full"
                    />
                </div>
            </div>
        </figure>
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
            className="relative z-10 flex min-h-[100svh] px-5 pb-10 pt-[116px] sm:px-8 sm:pb-12 sm:pt-[124px] lg:px-10 lg:pb-10 lg:pt-[116px] xl:px-12"
        >
            <div className="mx-auto grid w-full max-w-[1760px] flex-1 items-center gap-6 sm:gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] xl:gap-6 2xl:gap-10">
                <div className="flex w-full max-w-[760px] flex-col items-start lg:pb-2">
                    <h1 className="max-w-[11ch] text-4xl leading-[0.98] text-brand-text sm:text-5xl md:max-w-none lg:text-[3.25rem] xl:text-[clamp(2.875rem,3.4vw,3.25rem)] 2xl:text-[3.75rem]">
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

                <div className="min-w-0 self-center">
                    <ProductPreview />
                </div>
            </div>
        </section>
    );
}
