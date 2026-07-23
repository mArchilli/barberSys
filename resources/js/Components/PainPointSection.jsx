import { Link } from '@inertiajs/react';
import {
    IconArrowRight,
    IconReceipt2,
    IconTrendingDown,
    IconWriting,
} from '@tabler/icons-react';

const painPoints = [
    {
        title: 'No sabés cuánto factura cada uno',
        description:
            'A fin de mes calcular comisiones y productividad termina siendo lento, manual y lleno de dudas.',
        icon: IconReceipt2,
    },
    {
        title: 'Cuentas en cuadernos',
        description:
            'Hojas, tachones y anotaciones sueltas esconden información importante justo cuando más la necesitás.',
        icon: IconWriting,
    },
    {
        title: 'No ves ganancia neta',
        description:
            'Facturar mucho no alcanza si no entendés cuánto queda realmente después de sueldos y gastos.',
        icon: IconTrendingDown,
    },
];

function SectionAction({ href, inertia = false, className, children }) {
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

export default function PainPointSection({
    cta = {
        label: 'Digitalizá tu barbería hoy',
        href: '#',
        inertia: false,
    },
}) {
    return (
        <section
            id="pain-points"
            className="px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex rounded-brand-pill border border-brand-accent/25 bg-brand-accent/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">
                        100% en gestión interna
                    </span>
                    <h2 className="mt-6 text-3xl text-brand-text sm:text-4xl lg:text-5xl">
                        ¿Manejás tu barbería a ojo?
                    </h2>
                    <p className="mt-5 text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                        Dejá de adivinar y empezá a decidir con datos reales.
                        Estilus transforma el caos operativo en una estructura
                        más clara, rentable y profesional.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-5">
                    {painPoints.map(({ title, description, icon: Icon }) => (
                        <article
                            key={title}
                            className="group rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-accent/30 hover:shadow-brand-card-hover motion-reduce:transform-none motion-reduce:transition-none"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-brand-md bg-brand-accent/12 text-brand-accent transition-colors duration-200 group-hover:bg-brand-accent group-hover:text-brand-dark motion-reduce:transition-none">
                                <Icon className="h-5 w-5" stroke={2.1} />
                            </div>

                            <h3 className="mt-6 text-2xl text-brand-text">
                                {title}
                            </h3>
                            <p className="mt-4 text-base leading-7 text-brand-text-secondary">
                                {description}
                            </p>
                        </article>
                    ))}
                </div>

                <div className="mt-14 flex flex-col items-center">
                    <SectionAction
                        href={cta.href}
                        inertia={cta.inertia}
                        className="inline-flex min-h-[48px] items-center justify-center rounded-brand-pill bg-brand-nav-bg px-7 text-sm font-semibold text-brand-surface shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-brand-floating focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                    >
                        <span>{cta.label}</span>
                        <IconArrowRight className="ml-2 h-4 w-4" stroke={2.3} />
                    </SectionAction>

                    <p className="mt-5 text-sm font-medium text-brand-accent">
                        Sin tarjeta de crédito requerida
                    </p>
                </div>
            </div>
        </section>
    );
}
