import { Link } from '@inertiajs/react';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

/**
 * Copy puramente presentacional (no vive en la tabla `plans`): tier, bajada
 * y flags visuales. name/price/annual_price/included_items SIEMPRE vienen
 * de props (BD) — nunca hardcodear esos cuatro acá. Clave por `slug` porque
 * el slug interno de un plan nunca cambia (ver CLAUDE.md), a diferencia del
 * `name` que sí puede rebrandearse desde Admin → Planes.
 */
const PLAN_PRESENTATION = {
    'plan-1': {
        tier: 'Esencial',
        description:
            'Para una barbería chica que quiere ordenar sus números sin sumar complejidad al día a día.',
        tagline: 'Incluye al dueño si corta',
    },
    'plan-2': {
        tier: 'Más elegido',
        description:
            'Pensado para barberías en expansión que necesitan ver el negocio completo y comparar rendimiento.',
        tagline: 'Panel consolidado incluido',
        featured: true,
    },
    'plan-3': {
        tier: 'Escalable',
        description:
            'Hecho para operaciones que ya manejan varias sucursales y necesitan control financiero más fino.',
        tagline: 'Control ampliado por sucursal',
    },
    'plan-4': {
        tier: 'Operación grande',
        description:
            'Para redes con alto volumen que necesitan una configuración adaptada a su operación y soporte cercano.',
        tagline: 'Configuración personalizada',
    },
};

const formatMoney = (value) => `$${Number(value).toLocaleString('es-AR')}`;

const formatBarberias = (plan) =>
    plan.max_barberias === null
        ? 'Barberías ilimitadas'
        : `${plan.max_barberias} barbería${plan.max_barberias === 1 ? '' : 's'}`;

const formatBarberos = (plan) =>
    plan.max_barberos === null
        ? 'Barberos ilimitados'
        : `Hasta ${plan.max_barberos} barbero${plan.max_barberos === 1 ? '' : 's'}`;

function BillingCycleToggle({ cycle, onChange }) {
    return (
        <div className="inline-flex items-center gap-1 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card">
            {[
                { value: 'monthly', label: 'Mensual' },
                { value: 'annual', label: 'Anual' },
            ].map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={[
                        'rounded-brand-pill px-5 py-2 text-sm font-bold transition-colors duration-150',
                        cycle === option.value
                            ? 'bg-brand-primary text-brand-on-primary shadow-brand-cta'
                            : 'text-brand-text-secondary hover:text-brand-text',
                    ].join(' ')}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

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
    plans = [],
    cta = {
        label: 'Probar gratis',
        href: '#',
        inertia: false,
    },
}) {
    const [cycle, setCycle] = useState('monthly');

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

                <div className="mt-10 flex justify-center">
                    <BillingCycleToggle cycle={cycle} onChange={setCycle} />
                </div>

                <div className="mt-10 grid gap-6 xl:grid-cols-4">
                    {plans.map((plan) => {
                        const presentation = PLAN_PRESENTATION[plan.slug] ?? {};
                        const { featured, dark: darkOverride } = presentation;
                        const dark = darkOverride ?? plan.is_custom;

                        const hasAnnual = plan.annual_price !== null;
                        const showAnnual = cycle === 'annual' && !plan.is_custom && hasAnnual;
                        const displayPrice = showAnnual ? plan.annual_price : plan.price;

                        return (
                            <article
                                key={plan.id}
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

                                <div className="flex items-center justify-between gap-3">
                                    <h3
                                        className={[
                                            'font-display text-[2rem] font-extrabold tracking-[-0.05em]',
                                            dark
                                                ? 'text-brand-surface'
                                                : 'text-brand-text',
                                        ].join(' ')}
                                    >
                                        {plan.name}
                                    </h3>

                                    {featured && (
                                        <span className="inline-flex shrink-0 rounded-full bg-brand-surface px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-brand-text">
                                            Popular
                                        </span>
                                    )}
                                </div>

                                <div className="mt-7">
                                    <div className="flex items-end gap-2">
                                        <span className="font-display text-[2.4rem] font-extrabold tracking-[-0.06em]">
                                            {plan.is_custom ? 'A medida' : formatMoney(displayPrice)}
                                        </span>
                                        {!plan.is_custom && (
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
                                                /mes
                                            </span>
                                        )}
                                    </div>

                                    {showAnnual && (
                                        <p
                                            className={[
                                                'mt-1 text-xs font-medium',
                                                dark
                                                    ? 'text-brand-text-on-dark'
                                                    : featured
                                                      ? 'text-brand-text/70'
                                                      : 'text-brand-text-secondary',
                                            ].join(' ')}
                                        >
                                            {formatMoney(plan.annual_price * 12)} total por año
                                        </p>
                                    )}

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
                                        {presentation.description}
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
                                        <span>{plan.is_custom ? 'Hablar con ventas' : cta.label}</span>
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
                                        {[formatBarberias(plan), formatBarberos(plan), presentation.tagline]
                                            .filter(Boolean)
                                            .map((detail) => (
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

                                {plan.included_items?.length > 0 && (
                                    <ul className="mt-6 space-y-3 text-sm">
                                        {plan.included_items.map((item) => (
                                            <li
                                                key={item}
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
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        );
                    })}
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
