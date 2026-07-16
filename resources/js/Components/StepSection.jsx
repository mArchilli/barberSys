import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { IconArrowRight } from '@tabler/icons-react';

const steps = [
    {
        number: '1',
        eyebrow: 'PASO 1',
        title: 'Cargás tu estructura',
        description:
            'Configurás barberías, servicios, barberos y comisiones en pocos minutos.',
        textSide: 'left',
    },
    {
        number: '2',
        eyebrow: 'PASO 2',
        title: 'Registrás cada servicio',
        description:
            'Cada corte queda cargado al instante, sin depender del cuaderno ni de planillas sueltas.',
        textSide: 'right',
    },
    {
        number: '3',
        eyebrow: 'PASO 3',
        title: 'Ves el negocio claro',
        description:
            'Facturación, productividad, medios de pago y ganancia neta en tiempo real.',
        textSide: 'left',
    },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

function getStepState(index, activeIndex) {
    if (index === activeIndex) {
        return 'active';
    }

    if (index < activeIndex) {
        return 'complete';
    }

    return 'inactive';
}

function TextBlock({ step, state, side = 'left' }) {
    const stateClass =
        state === 'active'
            ? 'opacity-100 translate-y-0'
            : state === 'complete'
              ? 'opacity-80 translate-y-0'
              : 'opacity-60 translate-y-2';

    return (
        <div
            className={`relative w-full max-w-[420px] transition-all duration-500 ${stateClass} ${
                side === 'left'
                    ? 'md:justify-self-end md:pr-10 md:text-right'
                    : 'md:justify-self-start md:pl-10'
            }`}
        >
            <div
                className={`absolute top-1/2 hidden h-px w-14 -translate-y-1/2 bg-brand-border-subtle md:block ${
                    side === 'left' ? '-right-14' : '-left-14'
                }`}
            />

            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-brand-primary-soft-text">
                {step.eyebrow}
            </p>
            <h3 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.05em] text-brand-text sm:text-[2.1rem]">
                {step.title}
            </h3>
            <p className="mt-4 text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                {step.description}
            </p>
        </div>
    );
}

function MockupShell({ title, badge, state, side = 'right', children }) {
    const stateClass =
        state === 'active'
            ? 'border-brand-primary/70 shadow-[0_24px_60px_rgba(29,34,33,0.14)]'
            : state === 'complete'
              ? 'border-brand-border shadow-[0_18px_40px_rgba(29,34,33,0.1)]'
              : 'border-brand-border shadow-[0_12px_30px_rgba(29,34,33,0.07)]';

    return (
        <div
            className={`relative w-full max-w-[420px] rounded-[28px] border bg-brand-surface p-5 transition-all duration-500 ${stateClass} ${
                side === 'left'
                    ? 'md:justify-self-end md:mr-10'
                    : 'md:justify-self-start md:ml-10'
            }`}
        >
            <div
                className={`absolute top-1/2 hidden h-px w-14 -translate-y-1/2 bg-brand-border-subtle md:block ${
                    side === 'left' ? '-right-14' : '-left-14'
                }`}
            />

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-text-secondary">
                        Vista del sistema
                    </p>
                    <h4 className="mt-2 text-sm font-semibold text-brand-text-strong sm:text-base">
                        {title}
                    </h4>
                </div>
                <span className="rounded-full border border-brand-border bg-brand-bg px-3 py-1 text-[0.68rem] font-semibold text-brand-text-secondary">
                    {badge}
                </span>
            </div>

            <div className="mt-5">{children}</div>
        </div>
    );
}

function SetupMockup({ state, side }) {
    const chips = [
        'Corte clásico',
        'Corte + barba',
        'Lucas R.',
        'Comisión 40%',
        'Sucursal Centro',
    ];

    return (
        <MockupShell title="Configuración inicial" badge="Base lista" state={state} side={side}>
            <div className="grid grid-cols-2 gap-2">
                {chips.map((chip) => (
                    <div
                        key={chip}
                        className="rounded-2xl border border-brand-border bg-brand-bg px-3 py-2 text-sm font-medium text-brand-text"
                    >
                        {chip}
                    </div>
                ))}
            </div>

            <div className="mt-4 rounded-2xl border border-brand-border bg-brand-bg p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-brand-text">Barbería principal</p>
                    <span className="rounded-full bg-brand-primary-soft px-2.5 py-1 text-[0.68rem] font-semibold text-brand-primary-soft-text">
                        Activa
                    </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                    Todo queda unificado desde el primer día: servicios, comisiones y equipo.
                </p>
            </div>
        </MockupShell>
    );
}

function ActivityMockup({ state, side }) {
    const rows = [
        ['10:30', 'Corte clásico', 'Mati N.'],
        ['12:00', 'Corte + barba', 'Lucas R.'],
        ['15:30', 'Fade', 'Agus G.'],
    ];

    return (
        <MockupShell title="Registro diario" badge="Hoy" state={state} side={side}>
            <div className="space-y-3">
                {rows.map(([time, service, barber]) => (
                    <div
                        key={`${time}-${service}`}
                        className="rounded-2xl border border-brand-border bg-brand-bg p-3"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-brand-primary-soft-text">
                                {time}
                            </span>
                            <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[0.68rem] font-semibold text-brand-text-secondary">
                                Servicio completado
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                            <p className="font-semibold text-brand-text">{service}</p>
                            <p className="text-brand-text-secondary">{barber}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
                <p className="text-sm font-medium text-brand-text-secondary">Estado de caja</p>
                <span className="rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-semibold text-brand-primary-soft-text">
                    Pago registrado
                </span>
            </div>
        </MockupShell>
    );
}

function DashboardMockup({ state, side }) {
    const metrics = [
        ['Facturación', '$1.240.000'],
        ['Ganancia neta', '$480.000'],
    ];

    const channels = [
        ['Transferencia', '62%'],
        ['Efectivo', '24%'],
        ['Tarjeta', '14%'],
    ];

    return (
        <MockupShell title="Resultados en tiempo real" badge="Resumen" state={state} side={side}>
            <div className="grid grid-cols-2 gap-3">
                {metrics.map(([label, value]) => (
                    <div
                        key={label}
                        className="rounded-2xl border border-brand-border bg-brand-bg p-4"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                            {label}
                        </p>
                        <p className="mt-2 text-lg font-extrabold text-brand-text">{value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 rounded-2xl border border-brand-border bg-brand-bg p-4">
                <div className="space-y-2">
                    {channels.map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                            <span className="text-brand-text-secondary">{label}</span>
                            <span className="font-semibold text-brand-text">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-brand-border bg-brand-bg p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                    Ranking de barberos
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {['1. Lucas R.', '2. Mati N.', '3. Agus G.'].map((item) => (
                        <span
                            key={item}
                            className="rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-medium text-brand-text"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </MockupShell>
    );
}

function StepMockup({ step, state, side = 'right' }) {
    if (step.number === '1') {
        return <SetupMockup state={state} side={side} />;
    }

    if (step.number === '2') {
        return <ActivityMockup state={state} side={side} />;
    }

    return <DashboardMockup state={state} side={side} />;
}

function TimelineNode({ number, state }) {
    const nodeClass =
        state === 'active'
            ? 'border-brand-primary bg-brand-primary-soft text-brand-primary-soft-text shadow-[0_0_0_10px_rgba(72,213,252,0.12)]'
            : state === 'complete'
              ? 'border-brand-primary/60 bg-brand-primary/10 text-brand-primary-soft-text'
              : 'border-brand-border bg-brand-surface text-brand-text-secondary';

    return (
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-bg">
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border text-base font-extrabold transition-all duration-500 ${nodeClass}`}
            >
                {number}
            </div>
        </div>
    );
}

function TimelineStage({ step, index, activeIndex, registerStage }) {
    const state = getStepState(index, activeIndex);
    const textFirst = step.textSide === 'left';

    return (
        <article
            ref={(element) => registerStage(index, element)}
            className="relative min-h-[300px] py-5 md:min-h-[360px] md:py-6"
        >
            <div className="md:hidden">
                <div className="absolute left-[0.2rem] top-10 z-10">
                    <TimelineNode number={step.number} state={state} />
                </div>

                <div className="space-y-5 pl-16">
                    <TextBlock step={step} state={state} />
                    <StepMockup step={step} state={state} />
                </div>
            </div>

            <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] md:items-center">
                {textFirst ? (
                    <>
                        <TextBlock step={step} state={state} side="left" />
                        <div className="flex justify-center">
                            <TimelineNode number={step.number} state={state} />
                        </div>
                        <StepMockup step={step} state={state} side="right" />
                    </>
                ) : (
                    <>
                        <StepMockup step={step} state={state} side="left" />
                        <div className="flex justify-center">
                            <TimelineNode number={step.number} state={state} />
                        </div>
                        <TextBlock step={step} state={state} side="right" />
                    </>
                )}
            </div>
        </article>
    );
}

export default function StepSection({
    cta = {
        label: 'Empezar ahora',
        href: '#',
        inertia: false,
    },
}) {
    const sectionRef = useRef(null);
    const timelineRef = useRef(null);
    const stageRefs = useRef([]);
    const [progress, setProgress] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        let frameId = null;

        const measure = () => {
            frameId = null;

            if (!sectionRef.current) {
                return;
            }

            const viewportHeight = window.innerHeight;
            const triggerY = viewportHeight * 0.5;

            if (timelineRef.current) {
                const timelineRect = timelineRef.current.getBoundingClientRect();
                const lineInset = 40;
                const progressTravel = Math.max(timelineRect.height - lineInset * 2, 1);
                const nextProgress = clamp(
                    (triggerY - timelineRect.top - lineInset) / progressTravel,
                    0,
                    1,
                );

                setProgress(nextProgress);
            }

            let closestIndex = 0;
            let closestDistance = Number.POSITIVE_INFINITY;

            stageRefs.current.forEach((stage, index) => {
                if (!stage) {
                    return;
                }

                const rect = stage.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const distance = Math.abs(center - viewportHeight / 2);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            setActiveIndex(closestIndex);
        };

        const onFrame = () => {
            if (frameId !== null) {
                return;
            }

            frameId = window.requestAnimationFrame(measure);
        };

        onFrame();
        window.addEventListener('scroll', onFrame, { passive: true });
        window.addEventListener('resize', onFrame);

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }

            window.removeEventListener('scroll', onFrame);
            window.removeEventListener('resize', onFrame);
        };
    }, []);

    return (
        <section
            id="como-funciona"
            ref={sectionRef}
            className="relative overflow-hidden px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1180px]">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex rounded-brand-pill bg-brand-primary-tint px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-primary-soft-text">
                        PROCESO OPTIMIZADO
                    </span>
                    <h2 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.05em] text-brand-text sm:text-4xl lg:text-5xl">
                        3 pasos para el control total
                    </h2>
                    <p className="mt-5 text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                        Ordená tu barbería desde la carga inicial hasta los números
                        finales, sin cuadernos ni planillas sueltas.
                    </p>
                </div>

                <div
                    ref={timelineRef}
                    className="relative mx-auto mt-16 max-w-6xl md:mt-20"
                >
                    <div className="absolute bottom-10 left-6 top-10 w-px bg-brand-border-subtle md:left-1/2 md:-translate-x-1/2" />
                    <div
                        className="absolute left-6 top-10 w-px bg-brand-primary transition-[height] duration-200 md:left-1/2 md:-translate-x-1/2"
                        style={{ height: `${progress * 100}%` }}
                    />

                    <div className="space-y-6 md:space-y-10">
                        {steps.map((step, index) => (
                            <TimelineStage
                                key={step.number}
                                step={step}
                                index={index}
                                activeIndex={activeIndex}
                                registerStage={(stageIndex, element) => {
                                    stageRefs.current[stageIndex] = element;
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-14 flex justify-center">
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
