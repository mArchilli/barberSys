import { Link } from '@inertiajs/react';
import {
    IconArrowRight,
    IconChartBar,
    IconPlayerPlayFilled,
    IconSparkles,
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

function MetricCard({ label, value, detail, tone = 'default' }) {
    const detailClassName =
        tone === 'success'
            ? 'text-brand-success'
            : 'text-brand-text-secondary';

    return (
        <div className="rounded-brand-lg border border-brand-border bg-brand-surface-alt p-4 shadow-brand-card">
            <p className="text-sm font-semibold text-brand-text-secondary">
                {label}
            </p>
            <p className="mt-3 font-display text-2xl font-extrabold tracking-[-0.04em] text-brand-text">
                {value}
            </p>
            <p className={`mt-2 text-sm font-medium ${detailClassName}`}>
                {detail}
            </p>
        </div>
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
            className="relative overflow-hidden px-6 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:px-10 xl:px-12"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full overflow-hidden">
                <div className="absolute left-1/2 top-[-120px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-brand-primary/14 blur-3xl sm:h-[420px] sm:w-[420px]" />
                <div className="absolute right-[-80px] top-[120px] h-[240px] w-[240px] rounded-full bg-brand-primary-soft blur-3xl" />
                <div className="absolute bottom-[40px] left-[-90px] h-[220px] w-[220px] rounded-full bg-brand-primary/10 blur-3xl" />
            </div>

            <div className="mx-auto grid w-full max-w-[1440px] gap-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:items-center lg:gap-10 xl:gap-14">
                <div className="flex flex-col items-start lg:pb-2">
                    <div className="inline-flex min-h-[40px] items-center gap-2 rounded-brand-pill bg-brand-primary-tint px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-primary-soft-text">
                        <IconSparkles className="h-4 w-4" stroke={2.2} />
                        <span>Sistema de gestión para barberías</span>
                    </div>

                    <h1 className="mt-6 max-w-[11ch] font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.06em] text-brand-text sm:text-5xl lg:max-w-none lg:text-[3.55rem] xl:text-[4rem]">
                        <span className="block lg:whitespace-nowrap">
                            Vos encargate de cortar.
                        </span>
                        <span className="mt-1 block text-brand-primary lg:whitespace-nowrap">
                            Pelito ordena tu barbería.
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
                            className="inline-flex min-h-[48px] items-center justify-center rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-surface shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                        >
                            <span>{primaryCta.label}</span>
                            <IconArrowRight className="ml-2 h-4 w-4" stroke={2.4} />
                        </HeroAction>

                        <HeroAction
                            href={secondaryCta.href}
                            inertia={secondaryCta.inertia}
                            className="inline-flex min-h-[48px] items-center justify-center rounded-brand-pill border border-brand-border bg-brand-surface px-6 text-sm font-bold text-brand-text transition-colors duration-200 hover:border-brand-primary-muted hover:bg-brand-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
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
                                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-surface bg-brand-surface-alt text-[11px] font-bold text-brand-text"
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

                <div className="relative w-full lg:max-w-[760px] lg:justify-self-end xl:max-w-[800px]">
                    <div className="rounded-brand-xl border border-brand-border bg-brand-surface p-4 shadow-brand-floating sm:p-5 xl:p-6">
                        <div className="flex items-center justify-between border-b border-brand-border-subtle pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-brand-lg bg-brand-primary-soft text-brand-primary-soft-text">
                                    <IconChartBar className="h-5 w-5" stroke={2.2} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">
                                        Panel de rendimiento
                                    </p>
                                    <p className="text-sm text-brand-text-secondary">
                                        Resumen operativo del mes
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-brand-pill bg-brand-success-soft px-3 py-1 text-xs font-bold text-brand-success">
                                +12%
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <MetricCard
                                label="Facturación"
                                value="$1.240.000"
                                detail="386 servicios registrados"
                            />
                            <MetricCard
                                label="Ganancia neta"
                                value="$480.000"
                                detail="+8,5% vs mes anterior"
                                tone="success"
                            />
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-5 shadow-brand-card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-brand-text-secondary">
                                            Ranking de barberos
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-brand-text">
                                            Lucas R. lidera el mes
                                        </p>
                                    </div>
                                    <span className="rounded-brand-pill bg-brand-primary-soft px-3 py-1 text-xs font-bold text-brand-primary-soft-text">
                                        Top 1
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3">
                                    {[
                                        ['Lucas R.', '118 servicios', '100%'],
                                        ['Mati N.', '94 servicios', '79%'],
                                        ['Agus G.', '82 servicios', '69%'],
                                    ].map(([name, services, width]) => (
                                        <div key={name}>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold text-brand-text">
                                                    {name}
                                                </span>
                                                <span className="text-brand-text-secondary">
                                                    {services}
                                                </span>
                                            </div>
                                            <div className="mt-2 h-2 rounded-full bg-brand-border-subtle">
                                                <div
                                                    className="h-2 rounded-full bg-brand-primary"
                                                    style={{ width }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-brand-lg border border-brand-border bg-brand-nav-bg p-5 shadow-brand-card">
                                <p className="text-sm font-semibold text-brand-text-on-dark">
                                    Medio principal
                                </p>
                                <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-surface">
                                    Transferencia
                                </p>
                                <p className="mt-2 text-sm leading-6 text-brand-text-on-dark">
                                    El 62% de la facturación del mes entró por
                                    transferencia. También podés ver efectivo,
                                    tarjeta y neto por sucursal.
                                </p>

                                <div className="mt-6 space-y-3">
                                    {[
                                        ['Transferencia', '62%'],
                                        ['Efectivo', '24%'],
                                        ['Tarjeta', '14%'],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="flex items-center justify-between rounded-brand-md bg-brand-surface/10 px-4 py-3"
                                        >
                                            <span className="text-sm font-semibold text-brand-surface">
                                                {label}
                                            </span>
                                            <span className="text-sm font-bold text-brand-surface">
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-3 top-5 hidden rounded-brand-lg border border-brand-border bg-brand-surface px-4 py-3 shadow-brand-card xl:block">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-text-secondary">
                            Reporte enviado
                        </p>
                        <p className="mt-1 text-sm font-semibold text-brand-text">
                            Resumen listo para revisar
                        </p>
                    </div>

                    <div className="absolute bottom-[-22px] left-4 hidden rounded-brand-lg border border-brand-border bg-brand-surface px-4 py-3 shadow-brand-card xl:block">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-success">
                            Ganancia neta
                        </p>
                        <p className="mt-1 text-sm font-semibold text-brand-text">
                            +8,5% este mes
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
