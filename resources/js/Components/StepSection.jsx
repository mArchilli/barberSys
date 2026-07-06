import { Link } from '@inertiajs/react';
import {
    IconArrowRight,
    IconChartHistogram,
    IconDatabaseImport,
    IconScissors,
} from '@tabler/icons-react';

const steps = [
    {
        number: '1',
        title: 'Cargás datos',
        description:
            'Configurás tus barberías, servicios, barberos y comisiones en un flujo simple, claro y rápido de completar.',
        icon: IconDatabaseImport,
    },
    {
        number: '2',
        title: 'Registrás día a día',
        description:
            'Tus barberos o encargados cargan cada servicio apenas termina, sin depender de cuadernos ni planillas sueltas.',
        icon: IconScissors,
    },
    {
        number: '3',
        title: 'Mirás el panel',
        description:
            'Entrás desde el celular o la compu y ves facturación, productividad, medios de pago y ganancia neta en tiempo real.',
        icon: IconChartHistogram,
    },
];

function StepAction({ href, inertia = false, className, children }) {
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

export default function StepSection({
    cta = {
        label: 'Empezar ahora',
        href: '#',
        inertia: false,
    },
}) {
    return (
        <section
            id="como-funciona"
            className="px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">
                        Proceso optimizado
                    </span>
                    <h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.05em] text-brand-text sm:text-4xl lg:text-5xl">
                        3 pasos para el control total
                    </h2>
                    <p className="mt-5 text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                        Diseñamos un flujo simple para que ordenes la gestión de
                        tu barbería sin complicaciones técnicas y con una curva
                        de uso natural desde el primer día.
                    </p>
                </div>

                <div className="relative mt-14">
                    <div className="absolute left-1/2 top-12 hidden h-0.5 w-[72%] -translate-x-1/2 bg-brand-border-subtle lg:block" />
                    <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
                        {steps.map(({ number, title, description, icon: Icon }, index) => (
                            <article
                                key={title}
                                className="group relative flex flex-col items-center text-center"
                            >
                                <div className="relative z-10 mb-7 flex h-24 w-24 items-center justify-center rounded-full border-4 border-brand-accent bg-brand-surface shadow-brand-card transition-transform duration-200 group-hover:scale-[1.04] motion-reduce:transition-none">
                                    <span className="font-display text-3xl font-extrabold text-brand-accent">
                                        {number}
                                    </span>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="absolute left-1/2 top-24 h-14 w-0.5 -translate-x-1/2 bg-brand-border-subtle lg:hidden" />
                                )}

                                <div className="w-full rounded-brand-lg border border-brand-border bg-brand-surface p-7 shadow-brand-card transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-brand-card-hover motion-reduce:transform-none motion-reduce:transition-none">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-brand-md bg-brand-primary-soft text-brand-primary-soft-text">
                                        <Icon className="h-5 w-5" stroke={2.1} />
                                    </div>
                                    <h3 className="mt-5 font-display text-2xl font-bold tracking-[-0.03em] text-brand-text">
                                        {title}
                                    </h3>
                                    <p className="mt-4 text-base leading-7 text-brand-text-secondary">
                                        {description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <div className="mt-16 flex justify-center">
                    <StepAction
                        href={cta.href}
                        inertia={cta.inertia}
                        className="inline-flex min-h-[48px] items-center justify-center rounded-brand-pill bg-brand-primary px-8 text-sm font-bold text-brand-on-primary shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                    >
                        <span>{cta.label}</span>
                        <IconArrowRight className="ml-2 h-4 w-4" stroke={2.3} />
                    </StepAction>
                </div>
            </div>
        </section>
    );
}
