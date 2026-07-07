import { Link } from '@inertiajs/react';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';

const plans = [
    {
        tier: 'Esencial',
        name: 'Base',
        price: '$15k',
        cadence: '/mes',
        description:
            'Para una barbería chica que quiere ordenar sus números sin sumar complejidad al día a día.',
        details: ['1 barbería', 'Hasta 3 barberos', 'Incluye al dueño si corta'],
        features: [
            'Registro de servicios',
            'Catálogo de servicios',
            'Medios de pago',
            'Sueldos y gastos',
            'Métricas básicas de facturación',
        ],
    },
    {
        tier: 'Más elegido',
        name: 'Crecimiento',
        price: '$35k',
        cadence: '/mes',
        description:
            'Pensado para barberías en expansión que necesitan ver el negocio completo y comparar rendimiento.',
        details: ['Hasta 2 barberías', 'Hasta 6 barberos', 'Panel consolidado incluido'],
        features: [
            'Todo lo del plan Base',
            'Ranking de productividad por barbero',
            'Comparación entre sucursales',
            'Métricas más completas',
            'Visión consolidada por local',
        ],
        featured: true,
    },
    {
        tier: 'Escalable',
        name: 'Expansión',
        price: '$65k',
        cadence: '/mes',
        description:
            'Hecho para operaciones que ya manejan varias sucursales y necesitan control financiero más fino.',
        details: ['Hasta 5 barberías', 'Barberos ilimitados', 'Control ampliado por sucursal'],
        features: [
            'Todo lo del plan Crecimiento',
            'Neto por sucursal',
            'Neto total del negocio',
            'Sin límite de barberos por sucursal',
            'Seguimiento financiero ampliado',
        ],
    },
    {
        tier: 'Operación grande',
        name: 'Cadena',
        price: 'A medida',
        description:
            'Para redes con alto volumen que necesitan una configuración adaptada a su operación y soporte cercano.',
        details: ['Más de 5 barberías', 'Mayor volumen de barberos', 'Configuración personalizada'],
        features: [
            'Todo lo del plan Expansión',
            'Roles y permisos por sucursal',
            'Reportes exportables',
            'Soporte prioritario',
            'Implementación adaptada a la operación',
        ],
        dark: true,
    },
];

function PricingAction({ href, inertia = false, className, children }) {
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

export default function PricingSection({
    cta = {
        label: 'Probar gratis',
        href: '#',
        inertia: false,
    },
}) {
    return (
        <section
            id="precios"
            className="px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex rounded-brand-pill border border-brand-accent/20 bg-brand-accent/12 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-accent">
                        Pricing claro
                    </span>
                    <h2 className="mt-5 font-display text-4xl font-extrabold tracking-[-0.05em] text-brand-text sm:text-5xl lg:text-6xl">
                        Tenemos el plan perfecto para tu barbería
                    </h2>
                    <p className="mt-5 text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                        Probá gratis y elegí el plan que mejor acompaña el tamaño
                        de tu barbería, con métricas claras y una estructura pensada
                        para crecer sin perder control.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 xl:grid-cols-4">
                    {plans.map(
                        ({
                            name,
                            price,
                            cadence,
                            description,
                            details,
                            features,
                            featured,
                            dark,
                        }) => (
                            <article
                                key={name}
                                className={[
                                    'relative flex h-full min-h-[760px] flex-col overflow-hidden rounded-brand-xl border p-7 shadow-brand-card transition-all duration-200 hover:-translate-y-1 hover:shadow-brand-card-hover motion-reduce:transition-none motion-reduce:hover:transform-none',
                                    dark
                                        ? 'border-brand-nav-bg bg-brand-nav-bg text-brand-surface'
                                        : featured
                                          ? 'border-brand-primary bg-brand-primary shadow-brand-floating'
                                          : 'border-brand-border bg-brand-surface',
                                ].join(' ')}
                            >
                                {featured && (
                                    <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-nav-bg" />
                                )}

                                <div>
                                    <h3
                                        className={[
                                            'font-display text-[2rem] font-extrabold tracking-[-0.05em]',
                                            dark
                                                ? 'text-brand-surface'
                                                : 'text-brand-text',
                                        ].join(' ')}
                                    >
                                        {name}
                                    </h3>
                                </div>

                                <div className="mt-7">
                                    <div className="flex items-end gap-2">
                                        <span className="font-display text-[2.4rem] font-extrabold tracking-[-0.06em]">
                                            {price}
                                        </span>
                                        {cadence && (
                                            <span
                                                className={[
                                                    'pb-2 text-sm font-medium',
                                                    dark
                                                        ? 'text-brand-text-on-dark'
                                                        : featured
                                                          ? 'text-brand-text/70'
                                                          : 'text-brand-text-secondary',
                                                ].join(' ')}
                                            >
                                                {cadence}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className={[
                                            'mt-4 text-sm leading-6',
                                            dark
                                                ? 'text-brand-text-on-dark'
                                                : featured
                                                  ? 'text-brand-text/80'
                                                  : 'text-brand-text-secondary',
                                        ].join(' ')}
                                    >
                                        {description}
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <PricingAction
                                        href={cta.href}
                                        inertia={cta.inertia}
                                        className={[
                                            'inline-flex min-h-[48px] w-full items-center justify-center rounded-brand-pill px-6 text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none',
                                            dark
                                                ? 'bg-brand-primary text-brand-on-primary hover:-translate-y-0.5 hover:bg-brand-primary-hover focus-visible:ring-brand-primary focus-visible:ring-offset-brand-nav-bg'
                                                : featured
                                                  ? 'bg-brand-nav-bg text-brand-text-on-dark hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:ring-brand-nav-bg'
                                                  : 'border border-brand-border bg-brand-surface text-brand-text hover:-translate-y-0.5 hover:border-brand-primary-muted hover:bg-brand-bg focus-visible:ring-brand-primary',
                                        ].join(' ')}
                                    >
                                        <span>{dark ? 'Hablar con ventas' : cta.label}</span>
                                        <IconArrowRight
                                            className="ml-2 h-4 w-4"
                                            stroke={2.3}
                                        />
                                    </PricingAction>
                                </div>

                                <div
                                    className={[
                                        'mt-6 rounded-brand-lg border p-4',
                                        dark
                                            ? 'border-brand-surface/10 bg-brand-surface/5'
                                            : featured
                                              ? 'border-brand-text/10 bg-brand-surface/25'
                                              : 'border-brand-border-subtle bg-brand-surface-alt/70',
                                    ].join(' ')}
                                >
                                    <p
                                        className={[
                                            'text-[0.68rem] font-bold uppercase tracking-[0.18em]',
                                            dark
                                                ? 'text-brand-text-on-dark'
                                                : featured
                                                  ? 'text-brand-text/70'
                                                  : 'text-brand-text-secondary',
                                        ].join(' ')}
                                    >
                                        Ideal para
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {details.map((detail) => (
                                            <span
                                                key={detail}
                                                className={[
                                                    'inline-flex rounded-brand-pill px-3 py-1.5 text-xs font-semibold',
                                                    dark
                                                        ? 'bg-brand-surface/10 text-brand-surface'
                                                        : featured
                                                          ? 'bg-brand-surface/40 text-brand-text'
                                                          : 'bg-brand-surface text-brand-text-secondary',
                                                ].join(' ')}
                                            >
                                                {detail}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <ul className="mt-6 space-y-3 text-sm">
                                    {features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-3"
                                        >
                                            <span
                                                className={[
                                                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                                                    'bg-brand-secondary text-brand-primary-soft',
                                                ].join(' ')}
                                            >
                                                <IconCheck
                                                    className="h-3.5 w-3.5"
                                                    stroke={2.6}
                                                />
                                            </span>
                                            <span
                                                className={
                                                    dark
                                                        ? 'text-brand-surface'
                                                        : featured
                                                          ? 'text-brand-text/85'
                                                          : 'text-brand-text-secondary'
                                                }
                                            >
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ),
                    )}
                </div>

                <div className="mt-10 flex justify-center">
                    <p className="max-w-3xl text-center text-sm leading-6 text-brand-text-secondary sm:text-base">
                        Todos los planes incluyen onboarding guiado y acceso desde
                        celular o compu. Si tu operación necesita algo más grande,
                        armamos una configuración a medida para tu cadena.
                    </p>
                </div>
            </div>
        </section>
    );
}
