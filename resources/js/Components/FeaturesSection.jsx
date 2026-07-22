import CardSwap, { Card } from '@/Components/CardSwap';
import { Link } from '@inertiajs/react';
import {
    IconArrowRight,
    IconCreditCard,
    IconScissors,
    IconUsers,
    IconWallet,
} from '@tabler/icons-react';
import { forwardRef } from 'react';

export const SOFTWARE_FEATURES = [
    {
        id: 'servicios',
        eyebrow: 'Servicios y cortes',
        title: 'Registrar cortes nunca fue tan sencillo',
        description:
            'Elegí el cliente, seleccioná el servicio y Pelito completa el precio. Confirmás el cobro y el movimiento queda registrado al instante.',
        image: '/images/features/cortes.png',
        imageAlt: 'Vista del módulo para cargar cortes en Pelito',
        icon: IconScissors,
        tone: 'primary',
    },
    {
        id: 'barberos',
        eyebrow: 'Equipo',
        title: 'Manejá todo tu equipo de barberos',
        description:
            'Creá perfiles, definí sueldo fijo o comisión y seguí el rendimiento de cada barbero desde un mismo lugar.',
        image: '/images/features/barberos.png',
        imageAlt: 'Vista de la gestión del equipo de barberos en Pelito',
        icon: IconUsers,
        tone: 'secondary',
    },
    {
        id: 'finanzas',
        eyebrow: 'Gestión y finanzas',
        title: 'Pelito te muestra cuánto ingresa, cuánto egresa y cuánto te queda',
        description:
            'Facturación, sueldos y gastos se ordenan en una sola vista para que conozcas la rentabilidad real de tu barbería.',
        image: '/images/features/finanzas.png',
        imageAlt: 'Vista del panel financiero de Pelito',
        icon: IconWallet,
        tone: 'dark',
    },
    {
        id: 'medios-de-pago',
        eyebrow: 'Medios de pago',
        title: 'Pelito se adapta a vos',
        description:
            'Sea cual sea el medio con el que cobrás, cargalo en el sistema. Pelito registra cada movimiento y te ordena la caja automáticamente.',
        image: '/images/features/medios-pago.png',
        imageAlt: 'Vista de los medios de pago configurados en Pelito',
        icon: IconCreditCard,
        tone: 'surface',
    },
];

const FEATURE_TONES = {
    primary: {
        card: 'border-brand-primary-hover/35 bg-brand-primary text-brand-on-primary',
        icon: 'bg-brand-nav-bg text-brand-primary',
        eyebrow: 'text-brand-on-primary/70',
        description: 'text-brand-on-primary/80',
        count: 'border-brand-on-primary/15 bg-brand-on-primary/10 text-brand-on-primary',
        visual: 'bg-brand-on-primary/10',
        frame: 'border-brand-on-primary/20 bg-brand-nav-bg',
    },
    secondary: {
        card: 'border-white/15 bg-brand-secondary text-white',
        icon: 'bg-brand-primary text-brand-on-primary',
        eyebrow: 'text-white/70',
        description: 'text-white/80',
        count: 'border-white/15 bg-white/10 text-white',
        visual: 'bg-white/[0.07]',
        frame: 'border-white/20 bg-brand-nav-bg',
    },
    dark: {
        card: 'border-white/15 bg-brand-nav-bg text-brand-text-on-dark',
        icon: 'bg-brand-primary text-brand-on-primary',
        eyebrow: 'text-brand-primary',
        description: 'text-brand-text-on-dark/72',
        count: 'border-white/15 bg-white/[0.06] text-brand-text-on-dark',
        visual: 'bg-white/[0.04]',
        frame: 'border-white/15 bg-black',
    },
    surface: {
        card: 'border-brand-border bg-brand-surface text-brand-text',
        icon: 'bg-brand-secondary text-white',
        eyebrow: 'text-brand-secondary',
        description: 'text-brand-text-secondary',
        count: 'border-brand-border bg-brand-bg text-brand-text-secondary',
        visual: 'bg-brand-bg',
        frame: 'border-brand-border bg-brand-nav-bg',
    },
};

function FeatureAction({ href, inertia = false, className, children }) {
    const Component = inertia ? Link : 'a';

    return (
        <Component href={href} className={className}>
            {children}
        </Component>
    );
}

const SoftwareFeatureCard = forwardRef(function SoftwareFeatureCard(
    { feature, index, total, className = '', ...cardProps },
    ref,
) {
    const Icon = feature.icon;
    const tone = FEATURE_TONES[feature.tone] ?? FEATURE_TONES.surface;
    const titleId = `software-feature-${feature.id}`;

    return (
        <Card
            ref={ref}
            {...cardProps}
            data-swap-label={feature.eyebrow}
            aria-labelledby={titleId}
            className={`${tone.card} ${className}`.trim()}
        >
            <div className="grid h-full grid-rows-[minmax(238px,auto)_minmax(0,1fr)] sm:grid-cols-[minmax(230px,0.37fr)_minmax(0,0.63fr)] sm:grid-rows-1">
                <div className="relative z-10 flex min-w-0 flex-col p-5 sm:p-7 lg:p-8">
                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-brand-md sm:h-12 sm:w-12 ${tone.icon}`}
                    >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" stroke={1.9} />
                    </div>

                    <p
                        className={`mt-5 text-[11px] font-bold uppercase tracking-[0.18em] ${tone.eyebrow}`}
                    >
                        {feature.eyebrow}
                    </p>
                    <h3
                        id={titleId}
                        className="mt-2 font-display text-[1.35rem] font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-[1.8rem] lg:text-[2rem]"
                    >
                        {feature.title}
                    </h3>
                    <p
                        className={`mt-4 text-sm leading-6 sm:text-[15px] sm:leading-6 ${tone.description}`}
                    >
                        {feature.description}
                    </p>

                    <span
                        className={`mt-auto hidden w-fit rounded-brand-pill border px-3 py-1.5 text-xs font-bold tabular-nums sm:inline-flex ${tone.count}`}
                    >
                        {String(index + 1).padStart(2, '0')} /{' '}
                        {String(total).padStart(2, '0')}
                    </span>
                </div>

                <figure
                    className={`relative flex min-h-0 items-center overflow-hidden p-3 sm:p-5 lg:p-6 ${tone.visual}`}
                >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(72,213,252,0.18),transparent_48%)]" />
                    <div
                        className={`relative w-full overflow-hidden rounded-brand-md border shadow-brand-floating ${tone.frame}`}
                    >
                        <img
                            src={feature.image}
                            alt={feature.imageAlt}
                            width="1440"
                            height="900"
                            loading="lazy"
                            decoding="async"
                            className="aspect-[8/5] h-auto w-full object-cover object-left-top"
                        />
                    </div>
                </figure>
            </div>
        </Card>
    );
});

SoftwareFeatureCard.displayName = 'SoftwareFeatureCard';

export default function FeaturesSection({
    cta = {
        label: 'Probar Pelito',
        href: '#',
        inertia: false,
    },
}) {
    return (
        <section
            id="funcionalidades"
            aria-labelledby="software-features-heading"
            className="relative overflow-hidden px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12"
        >
            <div className="pointer-events-none absolute left-[-180px] top-[18%] h-[360px] w-[360px] rounded-full bg-brand-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[12%] right-[-160px] h-[320px] w-[320px] rounded-full bg-brand-secondary/10 blur-3xl" />

            <div className="relative mx-auto w-full max-w-[1440px]">
                <div className="grid gap-y-10 xl:grid-cols-[minmax(360px,500px)_minmax(0,860px)] xl:items-center xl:justify-center xl:gap-x-12 2xl:gap-x-14">
                    <div className="w-full max-w-xl xl:max-w-[500px]">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary">
                            Todo en un solo lugar
                        </p>
                        <h2
                            id="software-features-heading"
                            className="mt-4 max-w-[500px] font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.05em] text-brand-text sm:text-4xl lg:text-5xl xl:text-[3.25rem]"
                        >
                            Herramientas profesionales para ordenar tu barbería
                        </h2>
                        <p className="mt-7 max-w-[460px] text-lg font-medium leading-8 text-brand-text-secondary xl:text-[1.1875rem]">
                            Desde el primer corte hasta el cierre del mes: Pelito
                            reúne la operación de tu barbería para que trabajes
                            con más orden y decidas con números claros.
                        </p>

                        {cta && (
                            <FeatureAction
                                href={cta.href}
                                inertia={cta.inertia}
                                className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-brand-pill bg-brand-primary px-8 text-base font-bold text-brand-on-primary shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-brand-floating focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                            >
                                <span>{cta.label}</span>
                                <IconArrowRight
                                    aria-hidden="true"
                                    className="ml-2 h-4 w-4"
                                    stroke={2.3}
                                />
                            </FeatureAction>
                        )}
                    </div>

                    <div className="relative min-w-0 pb-20 pr-5 pt-20 sm:pr-9 sm:pt-24 xl:pr-0 xl:pt-20">
                        <CardSwap
                            width="100%"
                            height="clamp(500px, 56vw, 540px)"
                            cardDistance={12}
                            verticalDistance={18}
                            delay={6000}
                            pauseOnHover
                            skewAmount={1.2}
                            easing="linear"
                            labelledBy="software-features-heading"
                            controlsLabel="Elegir una funcionalidad de Pelito"
                            className="ml-0 mr-auto max-w-[860px]"
                        >
                            {SOFTWARE_FEATURES.map((feature, index) => (
                                <SoftwareFeatureCard
                                    key={feature.id}
                                    data-swap-label={feature.eyebrow}
                                    feature={feature}
                                    index={index}
                                    total={SOFTWARE_FEATURES.length}
                                />
                            ))}
                        </CardSwap>
                    </div>
                </div>
            </div>
        </section>
    );
}
