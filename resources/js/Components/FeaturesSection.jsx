import { Link } from '@inertiajs/react';
import {
    IconArrowRight,
    IconBuildingStore,
    IconChartHistogram,
    IconCreditCard,
    IconTrendingUp,
} from '@tabler/icons-react';

const barberRanking = [
    { name: 'Mateo G.', score: '98%', width: '98%' },
    { name: 'Luciano S.', score: '85%', width: '85%' },
];

function FeatureAction({ href, inertia = false, className, children }) {
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

function FeatureCard({ icon: Icon, title, description, actionLabel }) {
    return (
        <article className="group flex h-full flex-col justify-between rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-brand-card-hover motion-reduce:transform-none motion-reduce:transition-none">
            <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-brand-md bg-brand-primary-soft text-brand-primary-soft-text">
                    <Icon className="h-5 w-5" stroke={2.1} />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.03em] text-brand-text">
                    {title}
                </h3>
                <p className="mt-4 text-base leading-7 text-brand-text-secondary">
                    {description}
                </p>
            </div>

            <div className="mt-6 flex items-center text-sm font-bold text-brand-primary">
                <span>{actionLabel}</span>
                <IconArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </div>
        </article>
    );
}

export default function FeaturesSection({
    cta = {
        label: 'Configurar cadena',
        href: '#',
        inertia: false,
    },
}) {
    return (
        <section
            id="funcionalidades"
            className="px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="max-w-2xl">
                    <h2 className="font-display text-3xl font-extrabold tracking-[-0.05em] text-brand-text sm:text-4xl">
                        Herramientas profesionales para ordenar tu barbería
                    </h2>
                    <p className="mt-4 text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                        Gestión pensada para dueños que necesitan registrar
                        servicios, medir productividad y tomar decisiones con
                        números reales, no con intuición.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-12 lg:gap-5">
                    <div className="md:col-span-4">
                        <FeatureCard
                            icon={IconChartHistogram}
                            title="Rentabilidad y costos"
                            description="Control total sobre ingresos, sueldos y gastos con lectura clara de la ganancia neta del negocio."
                            actionLabel="Ver reportes"
                        />
                    </div>

                    <article className="relative overflow-hidden rounded-brand-xl bg-brand-primary p-7 text-brand-surface shadow-brand-floating md:col-span-8 lg:p-8">
                        <div className="pointer-events-none absolute right-[-48px] top-[-42px] h-40 w-40 rounded-full border border-brand-surface/15" />
                        <div className="pointer-events-none absolute bottom-[-60px] right-[18%] h-36 w-36 rounded-full bg-brand-surface/10 blur-2xl" />

                        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                            <div>
                                <div className="inline-flex rounded-brand-pill bg-brand-surface/18 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-surface">
                                    Multi-sucursal
                                </div>
                                <h3 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-surface">
                                    Módulo para crecer sin perder control
                                </h3>
                                <p className="mt-4 max-w-xl text-base leading-7 text-brand-surface/90">
                                    Consolidá varias barberías en un solo panel,
                                    compará sucursales, seguí equipos y detectá
                                    dónde está la rentabilidad real del negocio.
                                </p>

                                <FeatureAction
                                    href={cta.href}
                                    inertia={cta.inertia}
                                    className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-brand-pill bg-brand-surface px-6 text-sm font-bold text-brand-text transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-surface focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary motion-reduce:transform-none motion-reduce:transition-none"
                                >
                                    <span>{cta.label}</span>
                                    <IconArrowRight className="ml-2 h-4 w-4" stroke={2.3} />
                                </FeatureAction>
                            </div>

                            <div className="rounded-brand-lg border border-brand-surface/20 bg-brand-surface/12 p-4 backdrop-blur-sm">
                                <div className="rounded-brand-lg bg-brand-surface p-4 text-brand-text shadow-brand-card">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-brand-md bg-brand-primary-soft text-brand-primary-soft-text">
                                                <IconBuildingStore className="h-5 w-5" stroke={2.1} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-brand-text">
                                                    Panel consolidado
                                                </p>
                                                <p className="text-sm text-brand-text-secondary">
                                                    3 sucursales activas
                                                </p>
                                            </div>
                                        </div>
                                        <span className="rounded-brand-pill bg-brand-success-soft px-3 py-1 text-xs font-bold text-brand-success">
                                            Online
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-brand-md bg-brand-bg p-4">
                                            <p className="text-sm font-semibold text-brand-text-secondary">
                                                Neto total
                                            </p>
                                            <p className="mt-2 font-display text-2xl font-extrabold text-brand-text">
                                                $480.000
                                            </p>
                                        </div>
                                        <div className="rounded-brand-md bg-brand-bg p-4">
                                            <p className="text-sm font-semibold text-brand-text-secondary">
                                                Mejor sucursal
                                            </p>
                                            <p className="mt-2 font-display text-2xl font-extrabold text-brand-text">
                                                Centro
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-brand-card-hover motion-reduce:transform-none motion-reduce:transition-none md:col-span-7">
                        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                            <div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-brand-md bg-brand-primary-soft text-brand-primary-soft-text">
                                    <IconTrendingUp className="h-5 w-5" stroke={2.1} />
                                </div>
                                <h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.03em] text-brand-text">
                                    Productividad por barbero
                                </h3>
                                <p className="mt-4 text-base leading-7 text-brand-text-secondary">
                                    Medí rendimiento individual, ritmo de
                                    trabajo y evolución del equipo para pagar
                                    mejor y decidir con más claridad.
                                </p>
                            </div>

                            <div className="rounded-brand-lg bg-brand-surface-alt p-4">
                                <div className="space-y-4">
                                    {barberRanking.map((barber) => (
                                        <div key={barber.name}>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-brand-border" />
                                                    <span className="font-semibold text-brand-text">
                                                        {barber.name}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-brand-primary">
                                                    {barber.score}
                                                </span>
                                            </div>
                                            <div className="mt-2 h-2 rounded-full bg-brand-border-subtle">
                                                <div
                                                    className="h-2 rounded-full bg-brand-primary"
                                                    style={{
                                                        width: barber.width,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-brand-card-hover motion-reduce:transform-none motion-reduce:transition-none md:col-span-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-brand-md bg-brand-primary-soft text-brand-primary-soft-text">
                            <IconCreditCard className="h-5 w-5" stroke={2.1} />
                        </div>
                        <h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.03em] text-brand-text">
                            Medios de pago
                        </h3>
                        <p className="mt-4 text-base leading-7 text-brand-text-secondary">
                            Registrá efectivo, transferencia y tarjeta sin
                            mezclas manuales para entender rápido qué medio está
                            moviendo la caja de tu barbería.
                        </p>

                        <div className="mt-6 flex gap-3">
                            {[
                                'Efectivo',
                                'Transferencia',
                                'Tarjeta',
                            ].map((method) => (
                                <div
                                    key={method}
                                    className="rounded-brand-md border border-brand-border bg-brand-surface-alt px-3 py-2 text-xs font-bold text-brand-text-secondary"
                                >
                                    {method}
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
