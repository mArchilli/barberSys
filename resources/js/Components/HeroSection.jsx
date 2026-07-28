import { Link } from '@inertiajs/react';
import {
    IconArrowUpRight,
    IconPlayerPlayFilled,
} from '@tabler/icons-react';

function HeroOrganicBackground() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-full"
        >
            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 768 1200"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-0 hidden h-[1216px] w-full md:block lg:hidden"
            >
                <path
                    fill="#48D5FC"
                    d="M900-200C820 40 780 300 750 520C720 650 390 650 240 800C160 900 190 1010 330 1080C480 1160 700 1170 850 1060C930 900 950 400 900-200Z"
                />
            </svg>

            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 1024 1500"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-0 hidden h-[1520px] w-full lg:block xl:hidden"
            >
                <path
                    fill="#48D5FC"
                    d="M1180-200C1060 40 1010 300 980 520C940 650 520 650 340 820C170 980 240 1190 430 1320C650 1460 990 1340 1160 1120C1250 940 1260 400 1180-200Z"
                />
            </svg>

            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 1600 1200"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-0 hidden h-[1151px] w-full xl:block 2xl:h-[1194px]"
            >
                <path
                    fill="#48D5FC"
                    d="M1900-250C1580-120 1260 80 1050 330C860 560 850 790 1010 960C1160 1120 1420 1150 1640 1020C1850 900 1970 600 1980 280C1990 60 1960-120 1900-250Z"
                />
            </svg>
        </div>
    );
}

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
            className="relative isolate mx-auto h-[clamp(220px,calc(30vw_+_114px),254px)] w-full max-w-[420px] sm:h-[500px] sm:max-w-[900px] md:h-[540px] md:isolation-auto lg:h-[700px] xl:h-[640px]"
        >
            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 480 280"
                preserveAspectRatio="none"
                className="pointer-events-none absolute left-1/2 top-[-22px] -z-10 h-[calc(100%+30px)] w-[120vw] max-w-none -translate-x-1/2 sm:top-[2%] sm:h-[calc(53.5vw_+_159px)] md:hidden"
            >
                <path
                    className="fill-brand-primary"
                    d="M-18 80C28 22 116 8 196 18C276-2 392 20 474 67C520 94 510 166 466 207C416 254 322 270 238 257C150 278 52 252-4 208C-44 176-50 116-18 80Z"
                />
            </svg>

            <div className="absolute left-0 top-[4%] w-[98%] -rotate-[0.7deg] sm:left-0 sm:top-[11%] sm:w-[94%] lg:left-[-1%] lg:top-[16%] lg:w-[96%] lg:-rotate-[1.5deg]">
                <div className="hero-product-reveal hero-product-reveal--dashboard overflow-hidden rounded-[20px] border border-white/55 bg-brand-nav-bg shadow-[0_32px_80px_rgba(29,34,33,0.22)] sm:rounded-[26px] xl:rounded-[30px]">
                    <img
                        src="/images/estilus-dashboard-desktop.jpg"
                        alt="Dashboard de escritorio de Estilus con facturación, cortes y medios de pago"
                        width="1895"
                        height="899"
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                        className="block h-auto w-full"
                    />
                </div>
            </div>

            <div className="absolute right-0 top-[clamp(60px,calc(120px-12.5vw),80px)] z-10 w-[clamp(64px,21%,88px)] rotate-[1.25deg] sm:right-[3%] sm:top-[36%] sm:w-[24%] lg:right-0 lg:top-[39%] lg:w-[22%] lg:rotate-[2.5deg] xl:w-[21%]">
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
            className="relative isolate -mt-[76px] flex min-h-[100svh] overflow-x-clip bg-brand-bg px-5 pb-10 pt-[110px] sm:px-8 sm:pb-12 sm:pt-[124px] md:overflow-x-visible lg:px-10 lg:pb-10 lg:pt-[116px] xl:px-12"
        >
            <HeroOrganicBackground />

            <div className="relative z-10 mx-auto grid w-full max-w-[1760px] flex-1 content-start items-start gap-0 sm:content-normal sm:items-center sm:gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] xl:gap-6 2xl:gap-10">
                <div className="contents sm:flex sm:w-full sm:max-w-[820px] sm:flex-col sm:items-start lg:pb-2">
                    <h1 className="order-1 w-full text-[clamp(2.5rem,11.25vw,3rem)] font-extrabold leading-[0.92] text-brand-text sm:order-none sm:text-[clamp(2.75rem,10vw,4.5rem)] sm:leading-[0.9] lg:text-[clamp(4.5rem,5.2vw,5.25rem)]">
                        <span className="sm:hidden">
                            <span className="block">
                                Vos encargate de cortar.
                            </span>
                            <span className="mt-2 block text-[clamp(2.35rem,10.9vw,2.9rem)] leading-[0.94] tracking-[-0.035em] text-brand-primary">
                                Estilus barber ordena tu barbería.
                            </span>
                        </span>
                        <span className="hidden sm:inline">
                            <span className="block">Vos encargate</span>
                            <span className="block">de cortar.</span>
                            <span className="mt-2 block text-brand-primary">
                                Estilus barber
                            </span>
                            <span className="block text-brand-primary">
                                Ordena tu barbería.
                            </span>
                        </span>
                    </h1>

                    <p className="order-3 mt-5 max-w-[36rem] text-[15px] leading-6 text-brand-text-secondary sm:order-none sm:text-lg sm:leading-8">
                        Registrá servicios, medí la productividad de tus
                        barberos y conocé la rentabilidad real de tu negocio
                        mes a mes desde una interfaz clara, rápida y pensada
                        para usarse todos los días.
                    </p>

                    <div className="order-4 mt-6 flex w-full flex-col items-stretch gap-2 min-[360px]:grid min-[360px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:order-none sm:mt-8 sm:flex sm:w-auto sm:grid-cols-none sm:flex-row sm:gap-3">
                        <HeroAction
                            href={primaryCta.href}
                            inertia={primaryCta.inertia}
                            className="group inline-flex min-h-[48px] w-full items-center justify-center whitespace-nowrap rounded-brand-pill bg-brand-primary px-4 text-[13px] font-semibold text-brand-on-primary shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 min-[430px]:text-sm sm:w-auto sm:px-6 sm:text-sm motion-reduce:transform-none motion-reduce:transition-none"
                        >
                            <span>{primaryCta.label}</span>
                            <IconArrowUpRight
                                aria-hidden="true"
                                className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                                stroke={2}
                            />
                        </HeroAction>

                        <HeroAction
                            href={secondaryCta.href}
                            inertia={secondaryCta.inertia}
                            className="inline-flex min-h-[40px] items-center justify-start whitespace-nowrap rounded-none border border-transparent bg-transparent px-1 text-[13px] font-semibold text-brand-text transition-colors duration-200 hover:text-brand-link focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 min-[360px]:min-h-[48px] min-[360px]:justify-center min-[360px]:rounded-brand-pill min-[360px]:border-brand-border min-[360px]:bg-brand-surface min-[360px]:px-[10px] min-[360px]:hover:border-brand-primary-muted min-[360px]:hover:bg-brand-surface-alt min-[430px]:text-sm sm:px-6 sm:text-sm sm:hover:text-brand-text motion-reduce:transition-none"
                        >
                            <IconPlayerPlayFilled className="mr-2 h-4 w-4 fill-current" />
                            <span>{secondaryCta.label}</span>
                        </HeroAction>
                    </div>

                </div>

                <div className="order-2 mt-6 min-w-0 self-start sm:order-none sm:mt-0 sm:self-center">
                    <ProductPreview />
                </div>
            </div>
        </section>
    );
}
