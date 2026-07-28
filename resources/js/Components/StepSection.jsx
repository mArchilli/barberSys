import { Link } from '@inertiajs/react';
import { IconArrowRight, IconAsterisk } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const TIMELINE_STEPS = [
    {
        id: 'al-abrir',
        moment: 'AL ABRIR',
        title: 'Todo está listo para empezar',
        description:
            'Tu equipo, tus servicios y la forma de trabajar quedan configurados para que la jornada arranque sin perder tiempo.',
        benefits: ['Equipo organizado', 'Servicios listos'],
        desktopImage: '/images/features/barberos.png',
        mobileImage: '/images/steps/barberos-mobile.png',
        imageAlt:
            'Vista real de Estilus con el equipo de barberos organizado y listo para comenzar la jornada.',
        desktopWidth: 1440,
        desktopHeight: 900,
        mobileWidth: 390,
        mobileHeight: 844,
    },
    {
        id: 'durante-el-dia',
        moment: 'DURANTE EL DÍA',
        title: 'Cada corte queda registrado en segundos',
        description:
            'Seleccionás el cliente, el servicio y el medio de pago. Estilus registra el cobro y actualiza tus números automáticamente.',
        benefits: ['Cobro registrado', 'Números actualizados'],
        desktopImage: '/images/features/cortes.png',
        mobileImage: '/images/steps/cortes-mobile.png',
        imageAlt:
            'Vista real de Estilus para seleccionar el cliente y el servicio al registrar un corte.',
        desktopWidth: 1440,
        desktopHeight: 900,
        mobileWidth: 390,
        mobileHeight: 844,
    },
    {
        id: 'al-cerrar',
        moment: 'AL CERRAR',
        title: 'Terminás el día sabiendo cuánto te quedó',
        description:
            'Revisás la facturación, los gastos, las comisiones y el rendimiento del equipo sin hacer cuentas manualmente.',
        benefits: ['Ganancia real', 'Resultados del equipo'],
        desktopImage: '/images/estilus-dashboard-desktop.jpg',
        mobileImage: '/images/estilus-dashboard-mobile.jpg',
        imageAlt:
            'Dashboard real de Estilus con la evolución de la facturación y la distribución de los cobros.',
        desktopWidth: 1895,
        desktopHeight: 899,
        mobileWidth: 376,
        mobileHeight: 834,
    },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

        updatePreference();
        mediaQuery.addEventListener('change', updatePreference);

        return () => mediaQuery.removeEventListener('change', updatePreference);
    }, []);

    return prefersReducedMotion;
}

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

function TimelineNode({ state, registerNode }) {
    const outerClass =
        state === 'active'
            ? 'border-brand-primary bg-brand-bg shadow-[0_0_0_6px_rgba(72,213,252,0.12)]'
            : state === 'complete'
              ? 'border-brand-primary/70 bg-brand-primary-soft'
              : 'border-brand-border bg-brand-bg';
    const innerClass =
        state === 'active'
            ? 'scale-100 bg-brand-primary'
            : state === 'complete'
              ? 'scale-90 bg-brand-primary/70'
              : 'scale-75 bg-brand-border';

    return (
        <span
            ref={registerNode}
            aria-hidden="true"
            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-[border-color,background-color,box-shadow] duration-300 motion-reduce:transition-none ${outerClass}`}
        >
            <span
                className={`h-3 w-3 rounded-full transition-[background-color,transform] duration-300 motion-reduce:transition-none ${innerClass}`}
            />
        </span>
    );
}

function StepCopy({ step, textOnLeft, isHidden }) {
    return (
        <div
            className={[
                'col-start-2 row-start-1 w-full max-w-[480px] transition-[opacity,transform] duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none',
                textOnLeft
                    ? 'xl:col-start-1 xl:justify-self-end xl:pr-9 xl:text-right'
                    : 'xl:col-start-3 xl:justify-self-start xl:pl-9',
                isHidden ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100',
            ].join(' ')}
        >
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-brand-primary sm:text-xs">
                {step.moment}
            </p>
            <h3 className="mt-4 text-[1.8rem] leading-[1.08] text-brand-text sm:text-4xl sm:leading-[1.05]">
                {step.title}
            </h3>
            <p className="mt-4 text-[0.98rem] leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                {step.description}
            </p>

            <ul
                className={`mt-6 space-y-3 ${textOnLeft ? 'xl:ml-auto xl:w-fit' : ''}`}
                aria-label={`Beneficios de ${step.moment.toLocaleLowerCase('es-AR')}`}
            >
                {step.benefits.map((benefit) => (
                    <li
                        key={benefit}
                        className="flex items-start gap-2.5 text-sm font-medium leading-5 text-brand-text"
                    >
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-brand-primary">
                            <IconAsterisk
                                aria-hidden="true"
                                className="h-4 w-4"
                                stroke={2.4}
                            />
                        </span>
                        <span>{benefit}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ProductScreenshot({ step, index, imageOnRight, isHidden }) {
    const desktopEntrance = imageOnRight
        ? 'xl:translate-x-5'
        : 'xl:-translate-x-5';
    const emphasisClass =
        index === 1
            ? 'border-brand-primary/70 shadow-[0_28px_70px_rgba(29,34,33,0.17)] ring-1 ring-brand-primary/15'
            : 'border-brand-border shadow-[0_24px_60px_rgba(29,34,33,0.13)]';

    return (
        <figure
            className={[
                'col-start-2 row-start-2 w-full max-w-[760px] justify-self-start transition-[opacity,transform] delay-75 duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none xl:row-start-1 xl:max-w-[580px]',
                imageOnRight
                    ? 'xl:col-start-3 xl:justify-self-start xl:pl-9'
                    : 'xl:col-start-1 xl:justify-self-end xl:pr-9',
                isHidden
                    ? `translate-y-3 opacity-0 xl:translate-y-0 ${desktopEntrance}`
                    : 'translate-x-0 translate-y-0 opacity-100',
            ].join(' ')}
        >
            <div
                className={`overflow-hidden rounded-[22px] border bg-brand-dark p-1.5 sm:rounded-[28px] sm:p-2 ${emphasisClass}`}
            >
                <picture>
                    <source
                        media="(max-width: 767px)"
                        srcSet={step.mobileImage}
                        width={step.mobileWidth}
                        height={step.mobileHeight}
                    />
                    <img
                        src={step.desktopImage}
                        alt={step.imageAlt}
                        width={step.desktopWidth}
                        height={step.desktopHeight}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1280px) 580px, (min-width: 768px) 760px, calc(100vw - 88px)"
                        className="block h-auto w-full rounded-[17px] sm:rounded-[21px]"
                    />
                </picture>
            </div>
        </figure>
    );
}

function TimelineStep({
    step,
    index,
    activeIndex,
    isMotionReady,
    isRevealed,
    registerStage,
    registerNode,
}) {
    const state = getStepState(index, activeIndex);
    const textOnLeft = index % 2 === 0;
    const imageOnRight = textOnLeft;
    const isHidden = isMotionReady && !isRevealed;

    return (
        <li
            ref={registerStage}
            aria-current={state === 'active' ? 'step' : undefined}
            data-step-id={step.id}
            data-step-state={state}
            data-revealed={isRevealed ? 'true' : 'false'}
            className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-x-4 gap-y-6 py-5 sm:grid-cols-[52px_minmax(0,1fr)] sm:gap-x-5 sm:py-7 xl:min-h-[390px] xl:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] xl:items-center xl:gap-x-0 xl:py-3"
        >
            <div className="col-start-1 row-start-1 flex justify-center pt-1 xl:col-start-2 xl:self-center xl:pt-0">
                <TimelineNode state={state} registerNode={registerNode} />
            </div>

            <StepCopy step={step} textOnLeft={textOnLeft} isHidden={isHidden} />
            <ProductScreenshot
                step={step}
                index={index}
                imageOnRight={imageOnRight}
                isHidden={isHidden}
            />
        </li>
    );
}

function StepOrganicBackgrounds() {
    return (
        <>
            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 420 620"
                className="pointer-events-none absolute left-[-12rem] top-[28%] z-0 h-auto w-[19rem] text-brand-primary opacity-[0.16] sm:left-[-11rem] sm:w-[23rem] xl:left-[-9rem] xl:w-[26rem]"
            >
                <path
                    fill="currentColor"
                    d="M17 53C105-11 238-14 327 48C407 103 438 215 382 292C337 354 250 348 228 420C203 500 290 550 235 599C170 657 47 585 16 493C-21 382-50 102 17 53Z"
                />
            </svg>

            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 560 360"
                className="pointer-events-none absolute bottom-[9%] right-[-13rem] z-0 h-auto w-[24rem] text-brand-primary opacity-[0.12] sm:right-[-10rem] sm:w-[28rem] xl:right-[-8rem] xl:w-[32rem]"
            >
                <path
                    fill="currentColor"
                    d="M22 122C86 37 203 7 310 35C405 59 443 128 526 139C614 151 619 250 548 300C474 351 387 309 307 325C203 347 75 371 22 295C-21 234-23 181 22 122Z"
                />
            </svg>
        </>
    );
}

export default function StepSection({
    cta = {
        label: 'Empezar ahora',
        href: '#',
        inertia: false,
    },
}) {
    const timelineRef = useRef(null);
    const lineRef = useRef(null);
    const progressRef = useRef(null);
    const stageRefs = useRef([]);
    const nodeRefs = useRef([]);
    const activeIndexRef = useRef(-1);
    const prefersReducedMotion = usePrefersReducedMotion();
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isMotionReady, setIsMotionReady] = useState(false);
    const [revealedSteps, setRevealedSteps] = useState(() =>
        TIMELINE_STEPS.map(() => false),
    );

    useEffect(() => {
        setIsMotionReady(true);

        if (
            prefersReducedMotion ||
            typeof window.IntersectionObserver === 'undefined'
        ) {
            setRevealedSteps(TIMELINE_STEPS.map(() => true));
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const index = stageRefs.current.indexOf(entry.target);

                    if (index !== -1) {
                        setRevealedSteps((current) => {
                            if (current[index]) {
                                return current;
                            }

                            const next = [...current];
                            next[index] = true;
                            return next;
                        });
                    }

                    observer.unobserve(entry.target);
                });
            },
            {
                rootMargin: '0px 0px -12% 0px',
                threshold: 0.08,
            },
        );

        stageRefs.current.forEach((stage) => {
            if (stage) {
                observer.observe(stage);
            }
        });

        return () => observer.disconnect();
    }, [prefersReducedMotion]);

    useEffect(() => {
        const timeline = timelineRef.current;
        const line = lineRef.current;
        const progress = progressRef.current;

        if (!timeline || !line || !progress) {
            return undefined;
        }

        let frameId = null;
        let isAlive = true;
        let isNearViewport = false;
        let needsMeasurement = true;
        let nodeOffsets = [];

        const updateActiveIndex = (nextIndex) => {
            if (activeIndexRef.current === nextIndex) {
                return;
            }

            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);
        };

        const measureGeometry = () => {
            const timelineRect = timeline.getBoundingClientRect();

            nodeOffsets = nodeRefs.current
                .map((node) => {
                    if (!node) {
                        return null;
                    }

                    const nodeRect = node.getBoundingClientRect();
                    return nodeRect.top + nodeRect.height / 2 - timelineRect.top;
                })
                .filter((offset) => offset !== null);

            if (nodeOffsets.length !== TIMELINE_STEPS.length) {
                return;
            }

            const start = nodeOffsets[0];
            const end = nodeOffsets[nodeOffsets.length - 1];

            line.style.top = `${start}px`;
            line.style.height = `${Math.max(end - start, 1)}px`;
        };

        const updateScrollProgress = () => {
            if (nodeOffsets.length !== TIMELINE_STEPS.length) {
                return;
            }

            if (prefersReducedMotion) {
                progress.style.transform = 'scaleY(1)';
                updateActiveIndex(TIMELINE_STEPS.length - 1);
                return;
            }

            if (!isNearViewport) {
                return;
            }

            const timelineRect = timeline.getBoundingClientRect();
            const cursor = window.innerHeight * 0.6 - timelineRect.top;
            const start = nodeOffsets[0];
            const end = nodeOffsets[nodeOffsets.length - 1];
            const nextProgress = clamp((cursor - start) / Math.max(end - start, 1), 0, 1);

            progress.style.transform = `scaleY(${nextProgress})`;

            let nextActiveIndex = -1;
            nodeOffsets.forEach((offset, index) => {
                if (cursor >= offset - 1) {
                    nextActiveIndex = index;
                }
            });
            updateActiveIndex(nextActiveIndex);
        };

        const runFrame = () => {
            frameId = null;

            if (needsMeasurement) {
                measureGeometry();
                needsMeasurement = false;
            }

            updateScrollProgress();
        };

        const scheduleFrame = (measure = false) => {
            if (measure) {
                needsMeasurement = true;
            }

            if (frameId === null) {
                frameId = window.requestAnimationFrame(runFrame);
            }
        };

        const onScroll = () => {
            if (isNearViewport) {
                scheduleFrame();
            }
        };
        const onResize = () => scheduleFrame(true);

        let visibilityObserver = null;

        if (
            !prefersReducedMotion &&
            typeof window.IntersectionObserver !== 'undefined'
        ) {
            visibilityObserver = new IntersectionObserver(
                ([entry]) => {
                    isNearViewport = entry.isIntersecting;

                    if (isNearViewport) {
                        scheduleFrame();
                    }
                },
                { rootMargin: '100% 0px 100% 0px', threshold: 0 },
            );
            visibilityObserver.observe(timeline);
        } else {
            isNearViewport = true;
        }

        const resizeObserver =
            typeof window.ResizeObserver !== 'undefined'
                ? new ResizeObserver(() => scheduleFrame(true))
                : null;
        resizeObserver?.observe(timeline);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        scheduleFrame(true);

        if (document.fonts?.ready) {
            document.fonts.ready.then(() => {
                if (isAlive) {
                    scheduleFrame(true);
                }
            });
        }

        return () => {
            isAlive = false;
            visibilityObserver?.disconnect();
            resizeObserver?.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);

            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, [prefersReducedMotion]);

    return (
        <section
            id="como-funciona"
            aria-labelledby="step-section-title"
            className="relative isolate overflow-clip px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12 xl:py-32"
        >
            <StepOrganicBackgrounds />

            <div className="relative z-10 mx-auto w-full max-w-[1320px]">
                <header className="max-w-3xl text-left xl:mx-auto xl:text-center">
                    <h2
                        id="step-section-title"
                        className="mt-4 text-[2.5rem] leading-[0.98] text-brand-text sm:text-5xl sm:leading-[0.98] lg:text-6xl"
                    >
                        Así es un día con{' '}
                        <span className="text-brand-primary">Estilus</span> en tu barbería
                    </h2>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8 xl:mx-auto">
                        Desde que abrís hasta que termina la jornada, Estilus registra lo
                        importante y convierte cada movimiento en información clara.
                    </p>
                </header>

                <div
                    ref={timelineRef}
                    data-motion-ready={isMotionReady ? 'true' : 'false'}
                    className="relative mt-14 sm:mt-16 xl:mt-20"
                >
                    <div
                        ref={lineRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-[24px] z-0 w-[2px] -translate-x-1/2 overflow-hidden rounded-full bg-brand-border-subtle sm:left-[26px] xl:left-1/2"
                        style={{ top: '20px', height: 'calc(100% - 40px)' }}
                    >
                        <span
                            ref={progressRef}
                            className="absolute inset-0 block origin-top scale-y-0 rounded-full bg-brand-primary will-change-transform"
                        />
                    </div>

                    <ol className="space-y-10 sm:space-y-14 xl:space-y-16">
                        {TIMELINE_STEPS.map((step, index) => (
                            <TimelineStep
                                key={step.id}
                                step={step}
                                index={index}
                                activeIndex={activeIndex}
                                isMotionReady={isMotionReady}
                                isRevealed={revealedSteps[index]}
                                registerStage={(element) => {
                                    stageRefs.current[index] = element;
                                }}
                                registerNode={(element) => {
                                    nodeRefs.current[index] = element;
                                }}
                            />
                        ))}
                    </ol>
                </div>

                <div className="mt-12 flex justify-center pl-16 sm:mt-16 sm:pl-0 xl:mt-20">
                    <StepAction
                        href={cta.href}
                        inertia={cta.inertia}
                        className="inline-flex min-h-[52px] w-full max-w-md items-center justify-center rounded-brand-pill bg-brand-primary px-8 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto"
                    >
                        <span>{cta.label}</span>
                        <IconArrowRight className="ml-2 h-4 w-4" stroke={2.3} />
                    </StepAction>
                </div>
            </div>
        </section>
    );
}
