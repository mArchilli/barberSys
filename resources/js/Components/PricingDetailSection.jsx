import { Link } from '@inertiajs/react';
import WaveTransition from '@/Components/WaveTransition';
import {
    IconAdjustmentsHorizontal,
    IconArrowRight,
    IconArrowUpRight,
    IconBuildingStore,
    IconCheck,
    IconCurrencyDollar,
    IconDeviceMobile,
    IconHeadset,
    IconMinus,
    IconUsers,
} from '@tabler/icons-react';
import {
    Fragment,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

const PLAN_GUIDANCE = {
    'plan-1': {
        summary:
            '1 barbería, hasta 3 barberos y toda la información para dejar de manejarte a ciegas.',
        decision:
            'Elegilo si trabajás en tu propia barbería o tenés un equipo pequeño y querés mantenerte al día con tus cuentas, gastos y clientes.',
    },
    'plan-2': {
        summary:
            '2 barberías, hasta 6 barberos, toda la información de ambas y una mirada consolidada entre ellas para una operación que empieza a expandirse y necesita orden.',
        decision:
            'Elegilo si ya abriste tu segunda sucursal, creciste en equipo y necesitás tener una visión de ambas barberías al mismo tiempo para poder compararlas entre sí.',
        featured: true,
    },
    'plan-3': {
        summary:
            '5 barberías y barberos sin límite. Todos los detalles financieros y administrativos de tus barberías, en conjunto o por separado, para decidir con una visión completa de tu negocio.',
        decision:
            'Elegilo si administrás varias sucursales y necesitás entender cuánto hacés y cuánto te queda, sin muchas vueltas.',
    },
    'plan-4': {
        summary:
            'Una configuración completamente a medida alrededor de tu forma de trabajar. Estilus Barber debe adaptarse a vos y no al revés.',
        decision:
            'Sabemos que podés tener una barbería que, por alguna razón, no encaje en ninguno de nuestros planes. Elegí esta opción y juntos vamos a adaptar un plan para vos, al mejor precio.',
        custom: true,
    },
};

const formatMoney = (value) =>
    `$${Number(value).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

const formatBarberias = (plan) =>
    plan.max_barberias === null
        ? 'Sin límite definido'
        : `${plan.max_barberias} ${plan.max_barberias === 1 ? 'sucursal' : 'sucursales'}`;

const formatBarberos = (plan) =>
    plan.max_barberos === null
        ? 'Sin límite'
        : `${plan.max_barberos} en total`;

const findIncludedItem = (plan, pattern) =>
    plan.included_items?.find((item) => pattern.test(item)) ?? false;

function WavyUnderline({ children }) {
    return <span className="pricing-wavy-underline">{children}</span>;
}

const comparisonGroups = [
    {
        title: 'Capacidad y contratación',
        rows: [
            {
                label: 'Sucursales activas',
                value: formatBarberias,
                plain: true,
            },
            {
                label: 'Barberos activos',
                value: formatBarberos,
                plain: true,
            },
            {
                label: 'Precio mensual',
                value: (plan) =>
                    plan.is_custom ? 'A medida' : `${formatMoney(plan.price)}/mes`,
                plain: true,
            },
            {
                label: 'Opción anual',
                value: (plan) =>
                    plan.is_custom
                        ? 'A definir'
                        : plan.annual_price !== null
                          ? `${formatMoney(plan.annual_price)}/mes equivalente`
                          : false,
                plain: true,
            },
        ],
    },
    {
        title: 'Operación diaria',
        rows: [
            {
                label: 'Sistema de turno',
                value: (plan) => {
                    const item = findIncludedItem(plan, /sistema de turno/i);

                    if (!item) return false;
                    if (/a medida/i.test(item)) return 'A medida';
                    if (/avanzado/i.test(item)) return 'Incluido avanzado';

                    return 'Incluido';
                },
            },
            {
                label: 'Registro de servicios',
                value: (plan) =>
                    findIncludedItem(plan, /registro de servicios/i),
            },
            {
                label: 'Servicios y medios de pago',
                value: (plan) => findIncludedItem(plan, /catálogo/i),
            },
            {
                label: 'Sueldos y gastos',
                value: (plan) =>
                    findIncludedItem(plan, /módulo financiero/i),
            },
            {
                label: 'Ranking por barbero',
                value: (plan) =>
                    findIncludedItem(plan, /ranking de productividad/i),
            },
        ],
    },
    {
        title: 'Lectura del negocio',
        rows: [
            {
                label: 'Métricas de facturación',
                value: (plan) => findIncludedItem(plan, /^métricas/i),
            },
            {
                label: 'Panel entre sucursales',
                value: (plan) =>
                    findIncludedItem(plan, /panel consolidado/i) ||
                    (plan.max_barberias === 1
                        ? 'No incluido (este plan es una sola sucursal)'
                        : false),
            },
            {
                label: 'Roles por sucursal',
                value: (plan) => findIncludedItem(plan, /roles y permisos/i),
            },
            {
                label: 'Reportes exportables',
                value: (plan) => findIncludedItem(plan, /reportes exportables/i),
            },
        ],
    },
    {
        title: 'Implementación y acompañamiento',
        rows: [
            {
                label: 'Onboarding guiado',
                value: () => 'Incluido',
            },
            {
                label: 'Acceso desde celular o compu',
                value: () => 'Incluido',
            },
            {
                label: 'Forma de trabajo',
                value: (plan) =>
                    plan.is_custom
                        ? 'Configuración adaptada a tu operación'
                        : 'Flujo Estilus listo para usar',
            },
            {
                label: 'Nivel de soporte',
                value: (plan) =>
                    findIncludedItem(plan, /soporte prioritario/i) ||
                    'Acompañamiento estándar',
            },
        ],
    },
];

function PlanAction({
    plan,
    cta,
    whatsappSalesNumber,
    compact = false,
    prominent = false,
}) {
    const isCustom = plan.is_custom;
    const href = isCustom
        ? `https://wa.me/${whatsappSalesNumber ?? ''}?text=${encodeURIComponent(
              `Hola Estilus, quiero conversar sobre un plan a medida para mi barbería.`,
          )}`
        : cta.href;
    const className = [
        'group inline-flex items-center justify-center rounded-brand-pill font-semibold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none',
        prominent
            ? 'min-h-16 w-full px-8 text-base'
            : compact
              ? 'min-h-11 px-4 text-xs'
              : 'min-h-[50px] px-6 text-sm',
        isCustom
            ? 'bg-brand-primary text-brand-on-primary hover:bg-brand-primary-hover focus-visible:ring-offset-brand-nav-bg'
            : 'bg-brand-nav-bg text-brand-text-on-dark hover:bg-brand-text',
    ].join(' ');

    const content = (
        <>
            <span>{isCustom ? 'Armar mi plan' : cta.label}</span>
            <IconArrowUpRight
                aria-hidden="true"
                className={`${prominent ? 'ml-3 h-6 w-6' : 'ml-2 h-4 w-4'} transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none ${isCustom ? 'text-brand-on-primary' : 'text-brand-primary'}`}
                stroke={2.3}
            />
        </>
    );

    if (!isCustom && cta.inertia) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <a
            href={href}
            className={className}
            {...(isCustom ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
            {content}
        </a>
    );
}

function BillingCycleToggle({ cycle, onChange }) {
    const annual = cycle === 'annual';

    return (
        <div className="relative mx-auto grid w-full max-w-[310px] grid-cols-2 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card md:mx-0">
            <span
                aria-hidden="true"
                className="absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-brand-pill bg-brand-primary shadow-brand-cta transition-transform duration-300 motion-reduce:transition-none"
                style={{ transform: annual ? 'translateX(100%)' : 'translateX(0)' }}
            />
            {[
                { value: 'monthly', label: 'Mensual' },
                { value: 'annual', label: 'Anual (ahorrá 2 meses)' },
            ].map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={cycle === option.value}
                    onClick={() => onChange(option.value)}
                    className={`relative z-10 min-h-9 rounded-brand-pill px-2 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${cycle === option.value ? 'text-brand-on-primary' : 'text-brand-text-secondary hover:text-brand-text'}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function Price({ plan, cycle, dark = false }) {
    if (plan.is_custom) {
        return (
            <span className={`text-xl font-bold ${dark ? 'text-brand-surface' : ''}`}>
                A medida
            </span>
        );
    }

    const annual = cycle === 'annual' && plan.annual_price !== null;
    const price = annual ? plan.annual_price : plan.price;

    return (
        <div>
            <div className="flex items-end justify-center gap-1">
                <span className="text-xl font-bold tabular-nums">
                    {formatMoney(price)}
                </span>
                <span className={`pb-0.5 text-[11px] font-medium ${dark ? 'text-brand-text-on-dark' : 'text-brand-text-secondary'}`}>
                    /mes
                </span>
            </div>
            {annual && (
                <p className={`mt-1 text-[10px] font-medium ${dark ? 'text-brand-text-on-dark' : 'text-brand-text-secondary'}`}>
                    {formatMoney(plan.annual_price * 12)} en un pago anual
                </p>
            )}
        </div>
    );
}

function ComparisonValue({ value, plain = false }) {
    if (!value) {
        return (
            <span className="inline-flex items-center gap-2 text-sm text-brand-text-secondary/70">
                <IconMinus aria-hidden="true" className="h-4 w-4" stroke={2} />
                No incluido
            </span>
        );
    }

    if (plain) {
        return <span className="text-sm font-semibold leading-6 text-brand-text">{value}</span>;
    }

    return (
        <span className="inline-flex items-start gap-2 text-sm font-medium leading-6 text-brand-text">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-secondary">
                <IconCheck aria-hidden="true" className="h-3.5 w-3.5" stroke={2.6} />
            </span>
            {value}
        </span>
    );
}

function ComparisonTable({ plans, cycle, cta, whatsappSalesNumber }) {
    return (
        <div className="-mx-5 mt-8 overflow-hidden rounded-brand-xl border border-brand-border bg-brand-surface shadow-brand-card md:mx-0 md:mt-10">
            <div className="border-b border-brand-nav-bg bg-brand-nav-bg px-5 py-3 md:hidden">
                <p className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
                    Deslizá hacia el costado para comparar todos los planes
                    <IconArrowRight aria-hidden="true" className="h-4 w-4" />
                </p>
            </div>
            <div className="overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0 text-left">
                    <caption className="sr-only">
                        Comparación detallada de los planes de Estilus
                    </caption>
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 w-[160px] border-b border-r border-brand-border bg-brand-surface p-3 align-bottom sm:w-[180px] md:w-[220px] md:p-5">
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-text-secondary">
                                    Compará punto por punto
                                </span>
                            </th>
                            {plans.map((plan) => {
                                const guidance = PLAN_GUIDANCE[plan.slug] ?? {};
                                const featured = guidance.featured;

                                return (
                                    <th
                                        key={plan.id}
                                        scope="col"
                                        className={`border-b border-brand-border p-5 text-center align-top ${featured ? 'bg-brand-primary' : plan.is_custom ? 'bg-brand-nav-bg text-brand-surface' : 'bg-brand-surface'}`}
                                    >
                                        <div className="flex min-h-[210px] flex-col items-center">
                                            <div className="flex min-h-6 items-center justify-center">
                                                {featured && (
                                                    <span className="rounded-brand-pill bg-brand-nav-bg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-primary">
                                                        Más elegido
                                                    </span>
                                                )}
                                                {plan.is_custom && (
                                                    <span className="rounded-brand-pill bg-brand-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-on-primary">
                                                        Personalizado
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`mt-3 text-2xl ${plan.is_custom ? 'text-brand-surface' : 'text-brand-text'}`}>
                                                {plan.name}
                                            </h3>
                                            <div className="mt-2 min-h-[48px]">
                                                <Price
                                                    plan={plan}
                                                    cycle={cycle}
                                                    dark={plan.is_custom}
                                                />
                                            </div>
                                            <div className="mt-auto pt-4">
                                                <PlanAction
                                                    plan={plan}
                                                    cta={cta}
                                                    whatsappSalesNumber={whatsappSalesNumber}
                                                    compact
                                                />
                                            </div>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonGroups.map((group) => (
                            <Fragment key={group.title}>
                                <tr>
                                    <th
                                        colSpan={plans.length + 1}
                                        className="border-b border-brand-border bg-brand-nav-bg py-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary"
                                    >
                                        <span className="sticky left-3 inline-block md:left-5">
                                            {group.title}
                                        </span>
                                    </th>
                                </tr>
                                {group.rows.map((row, rowIndex) => (
                                    <tr key={row.label}>
                                        <th
                                            scope="row"
                                            className={`sticky left-0 z-10 border-r border-brand-border bg-brand-surface px-3 py-4 text-sm font-semibold leading-6 text-brand-text md:px-5 ${rowIndex < group.rows.length - 1 ? 'border-b border-brand-border-subtle' : 'border-b border-brand-border'}`}
                                        >
                                            {row.label}
                                        </th>
                                        {plans.map((plan) => (
                                            <td
                                                key={plan.id}
                                                className={`px-5 py-4 align-top ${PLAN_GUIDANCE[plan.slug]?.featured ? 'bg-brand-primary/[0.08]' : plan.is_custom ? 'bg-brand-nav-bg/[0.025]' : ''} ${rowIndex < group.rows.length - 1 ? 'border-b border-brand-border-subtle' : 'border-b border-brand-border'}`}
                                            >
                                                <ComparisonValue
                                                    value={row.value(plan)}
                                                    plain={row.plain}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DecisionPlanCard({
    plan,
    cta,
    whatsappSalesNumber,
    hoveredPlanId = null,
    onMouseEnter,
    onMouseLeave,
}) {
    const guidance = PLAN_GUIDANCE[plan.slug] ?? {};

    return (
        <article
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-brand-xl border p-6 shadow-none transition-all duration-300 ease-out hover:-translate-y-1 md:shadow-brand-card motion-reduce:transform-none motion-reduce:transition-none ${hoveredPlanId !== null && hoveredPlanId !== plan.id ? 'opacity-45 blur-[1px]' : 'opacity-100 blur-0'} ${plan.is_custom ? 'border-brand-nav-bg bg-brand-nav-bg text-brand-text-on-dark' : guidance.featured ? 'border-brand-primary bg-brand-primary md:shadow-brand-floating' : 'border-brand-border bg-brand-surface'}`}
        >
            <h3 className={`relative text-3xl ${plan.is_custom ? 'text-brand-surface' : 'text-brand-text'}`}>
                {plan.name}
            </h3>
            <p className={`relative mt-4 text-sm leading-6 ${plan.is_custom ? 'text-brand-text-on-dark' : guidance.featured ? 'text-brand-text/80' : 'text-brand-text-secondary'}`}>
                {guidance.summary}
            </p>
            <div className="relative mt-8">
                <p className={`text-sm font-semibold leading-6 ${plan.is_custom ? 'text-brand-surface' : 'text-brand-text'}`}>
                    {guidance.decision}
                </p>
            </div>
            <div className="relative mt-auto pt-6">
                <PlanAction
                    plan={plan}
                    cta={cta}
                    whatsappSalesNumber={whatsappSalesNumber}
                    compact
                    prominent
                />
            </div>
        </article>
    );
}

function DecisionCards({ plans, cta, whatsappSalesNumber }) {
    const featuredPlanIndex = Math.max(
        0,
        plans.findIndex((plan) => PLAN_GUIDANCE[plan.slug]?.featured),
    );
    const [hoveredPlanId, setHoveredPlanId] = useState(null);
    const [activePlanIndex, setActivePlanIndex] = useState(featuredPlanIndex);
    const carouselRef = useRef(null);
    const scrollFrameRef = useRef(null);
    const programmaticTargetIndexRef = useRef(null);
    const scrollSettleTimeoutRef = useRef(null);

    const scrollToPlan = (index) => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        programmaticTargetIndexRef.current = index;
        setActivePlanIndex(index);
        carousel.scrollTo({
            left: index * carousel.clientWidth,
            behavior: reduceMotion ? 'auto' : 'smooth',
        });
    };

    const beginManualCarouselScroll = () => {
        programmaticTargetIndexRef.current = null;

        if (scrollSettleTimeoutRef.current !== null) {
            window.clearTimeout(scrollSettleTimeoutRef.current);
            scrollSettleTimeoutRef.current = null;
        }
    };

    const handleCarouselScroll = () => {
        if (scrollFrameRef.current !== null) {
            window.cancelAnimationFrame(scrollFrameRef.current);
        }

        scrollFrameRef.current = window.requestAnimationFrame(() => {
            const carousel = carouselRef.current;
            if (!carousel || carousel.clientWidth === 0) {
                scrollFrameRef.current = null;
                return;
            }

            if (programmaticTargetIndexRef.current !== null) {
                if (scrollSettleTimeoutRef.current !== null) {
                    window.clearTimeout(scrollSettleTimeoutRef.current);
                }

                scrollSettleTimeoutRef.current = window.setTimeout(() => {
                    programmaticTargetIndexRef.current = null;
                    scrollSettleTimeoutRef.current = null;
                }, 160);
                scrollFrameRef.current = null;
                return;
            }

            const nextIndex = Math.min(
                plans.length - 1,
                Math.max(0, Math.round(carousel.scrollLeft / carousel.clientWidth)),
            );

            setActivePlanIndex(nextIndex);
            scrollFrameRef.current = null;
        });
    };

    useLayoutEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return undefined;

        setActivePlanIndex(featuredPlanIndex);
        const frame = window.requestAnimationFrame(() => {
            carousel.scrollLeft = featuredPlanIndex * carousel.clientWidth;
        });

        return () => window.cancelAnimationFrame(frame);
    }, [featuredPlanIndex, plans.length]);

    useEffect(() => {
        const handleResize = () => {
            const carousel = carouselRef.current;
            if (!carousel) return;

            carousel.scrollLeft = activePlanIndex * carousel.clientWidth;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (scrollFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollFrameRef.current);
            }
            if (scrollSettleTimeoutRef.current !== null) {
                window.clearTimeout(scrollSettleTimeoutRef.current);
            }
        };
    }, [activePlanIndex]);

    return (
        <section
            id="como-elegir"
            aria-labelledby="como-elegir-title"
            className="px-5 py-16 md:px-8 md:py-24 lg:px-10 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="max-w-3xl">
                    <h2
                        id="como-elegir-title"
                        className="text-[2.5rem] leading-[0.98] text-brand-text sm:text-5xl md:text-6xl lg:text-[4rem]"
                    >
                        ¿Cuál se parece más a tu{' '}
                        <span className="text-brand-primary">barbería</span> hoy?
                    </h2>
                    <p className="mt-4 text-[15px] leading-7 text-brand-text-secondary md:text-lg">
                        Elegí por la estructura que necesitás ahora. Cuando tu
                        operación crezca, podés pasar a un plan con más capacidad.
                    </p>
                </div>

                {plans.length > 0 && (
                    <div className="mt-9 md:hidden">
                        <div
                            role="tablist"
                            aria-label="Elegir plan"
                            className="relative grid grid-cols-4 gap-1 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute bottom-1 left-1 top-1 w-[calc((100%-1.25rem)/4)] rounded-brand-pill bg-brand-primary shadow-brand-cta transition-transform duration-300 ease-out motion-reduce:transition-none"
                                style={{
                                    transform: `translateX(calc(${activePlanIndex * 100}% + ${activePlanIndex * 0.25}rem))`,
                                }}
                            />

                            {plans.map((plan, index) => (
                                <button
                                    key={plan.id}
                                    id={`decision-mobile-tab-${plan.slug}`}
                                    type="button"
                                    role="tab"
                                    aria-selected={index === activePlanIndex}
                                    aria-controls={`decision-mobile-panel-${plan.slug}`}
                                    onClick={() => scrollToPlan(index)}
                                    className={`relative z-10 min-h-10 min-w-0 rounded-brand-pill px-1 text-[0.66rem] font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 min-[360px]:text-[0.72rem] ${index === activePlanIndex ? 'text-brand-on-primary' : 'text-brand-text-secondary hover:text-brand-text'}`}
                                >
                                    <span className="block truncate">
                                        {plan.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div
                            ref={carouselRef}
                            role="region"
                            aria-roledescription="carrusel"
                            aria-label="Planes según tu barbería"
                            onScroll={handleCarouselScroll}
                            onPointerDown={beginManualCarouselScroll}
                            onWheel={beginManualCarouselScroll}
                            className="mt-4 flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {plans.map((plan, index) => (
                                <div
                                    key={plan.id}
                                    id={`decision-mobile-panel-${plan.slug}`}
                                    role="tabpanel"
                                    aria-labelledby={`decision-mobile-tab-${plan.slug}`}
                                    aria-hidden={index !== activePlanIndex}
                                    inert={index === activePlanIndex ? undefined : ''}
                                    className="flex w-full shrink-0 snap-center snap-always px-0.5 py-1"
                                >
                                    <DecisionPlanCard
                                        plan={plan}
                                        cta={cta}
                                        whatsappSalesNumber={whatsappSalesNumber}
                                    />
                                </div>
                            ))}
                        </div>

                        <div
                            className="mt-2 flex items-center justify-center gap-3"
                            aria-live="polite"
                        >
                            <div
                                aria-hidden="true"
                                className="flex items-center gap-1.5"
                            >
                                {plans.map((plan, index) => (
                                    <span
                                        key={plan.id}
                                        className={`block h-2 rounded-full transition-[width,background-color] duration-150 ${index === activePlanIndex ? 'w-5 bg-brand-primary' : 'w-2 bg-brand-border'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium text-brand-text-secondary">
                                {activePlanIndex + 1} de {plans.length}
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-9 hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
                    {plans.map((plan) => (
                        <DecisionPlanCard
                            key={plan.id}
                            plan={plan}
                            cta={cta}
                            whatsappSalesNumber={whatsappSalesNumber}
                            hoveredPlanId={hoveredPlanId}
                            onMouseEnter={() => setHoveredPlanId(plan.id)}
                            onMouseLeave={() => setHoveredPlanId(null)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CustomPlanCallout({ plan, whatsappSalesNumber }) {
    if (!plan) return null;

    const whatsappHref = `https://wa.me/${whatsappSalesNumber ?? ''}?text=${encodeURIComponent(
        'Hola Estilus, mi barbería tiene una forma de trabajo particular y quiero conversar sobre un plan a medida.',
    )}`;

    const points = [
        {
            Icon: IconAdjustmentsHorizontal,
            title: 'Tu circuito de trabajo',
            text: 'Relevamos cómo se mueve hoy la información y definimos la configuración alrededor de ese proceso.',
            shape: '44% 56% 63% 37% / 47% 39% 61% 53%',
            position:
                'mr-auto w-[94%] lg:absolute lg:left-[2%] lg:top-0 lg:w-[82%]',
            blobClassName: '-rotate-6',
        },
        {
            Icon: IconBuildingStore,
            title: 'Tu estructura real',
            text: 'Contemplamos la cantidad de sucursales, equipos y responsables que participan en la operación.',
            shape: '57% 43% 38% 62% / 42% 55% 45% 58%',
            position:
                'ml-auto w-[92%] flex-row-reverse text-right lg:absolute lg:right-[1%] lg:top-[35%] lg:w-[78%]',
            blobClassName: 'rotate-6',
        },
        {
            Icon: IconHeadset,
            title: 'Acompañamiento cercano',
            text: 'Acordamos reportes, permisos y soporte según lo que tu cadena necesita para trabajar con claridad.',
            shape: '38% 62% 54% 46% / 60% 40% 58% 42%',
            position:
                'ml-[6%] w-[92%] lg:absolute lg:bottom-0 lg:left-[10%] lg:ml-0 lg:w-[82%]',
            blobClassName: '-rotate-3',
        },
    ];

    return (
        <>
            <WaveTransition
                fromClassName="text-brand-bg"
                toClassName="bg-brand-nav-bg"
            />
            <section
                id="cadena"
                aria-labelledby="cadena-title"
                className="bg-brand-nav-bg px-5 pb-16 pt-8 text-brand-text-on-dark md:px-8 md:pb-24 md:pt-12 lg:px-10 lg:pb-28 lg:pt-16 xl:px-12"
            >
                <div className="relative mx-auto w-full max-w-[1440px]">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end lg:gap-16">
                        <div>
                            <h2
                                id="cadena-title"
                                className="max-w-3xl text-[3rem] leading-[0.94] text-brand-surface sm:text-6xl md:text-6xl lg:text-[4rem]"
                            >
                                Tu forma de trabajar no tiene que{' '}
                                <span className="text-brand-primary">
                                    entrar a la fuerza
                                </span>{' '}
                                en un plan estándar.
                            </h2>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-brand-text-on-dark md:text-lg">
                                Si tu barbería tiene una manera particular de trabajar,
                                te armamos una configuración a medida para esa forma
                                de trabajo. Primero entendemos tu operación y después
                                definimos juntos el alcance, la capacidad y el
                                acompañamiento que realmente necesitás.
                            </p>
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noreferrer"
                                className="group mt-7 hidden min-h-[52px] items-center justify-center rounded-brand-pill bg-brand-primary px-7 text-sm font-semibold text-brand-on-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-nav-bg motion-reduce:transform-none motion-reduce:transition-none lg:inline-flex"
                            >
                                Contanos cómo trabajás
                                <IconArrowUpRight
                                    aria-hidden="true"
                                    className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                                    stroke={2.3}
                                />
                            </a>
                        </div>

                        <div className="relative flex min-h-[440px] flex-col justify-between gap-9 sm:min-h-[470px] lg:block lg:min-h-[520px]">
                            {points.map(
                                ({
                                    Icon,
                                    title,
                                    text,
                                    shape,
                                    position,
                                    blobClassName,
                                }) => (
                                    <article
                                        key={title}
                                        className={`flex items-center gap-5 lg:gap-7 ${position}`}
                                    >
                                        <span
                                            className={`flex h-16 w-16 shrink-0 items-center justify-center bg-brand-primary text-brand-on-primary sm:h-20 sm:w-20 lg:h-24 lg:w-24 ${blobClassName}`}
                                            style={{ borderRadius: shape }}
                                        >
                                            <Icon
                                                aria-hidden="true"
                                                className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9"
                                                stroke={1.8}
                                            />
                                        </span>
                                        <div>
                                            <h3 className="text-xl text-brand-surface lg:text-2xl">
                                                {title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-brand-text-on-dark lg:text-[15px]">
                                                {text}
                                            </p>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </div>
                    <div className="mt-10 flex justify-center lg:hidden">
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex min-h-[52px] items-center justify-center rounded-brand-pill bg-brand-primary px-7 text-sm font-semibold text-brand-on-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-nav-bg motion-reduce:transform-none motion-reduce:transition-none"
                        >
                            Contanos cómo trabajás
                            <IconArrowUpRight
                                aria-hidden="true"
                                className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                                stroke={2.3}
                            />
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}

export default function PricingDetailSection({
    plans = [],
    cta = { label: 'Probar gratis', href: '#', inertia: false },
    whatsappSalesNumber,
}) {
    const [cycle, setCycle] = useState('monthly');
    const orderedPlans = useMemo(
        () =>
            [...plans].sort((a, b) => {
                if (a.is_custom !== b.is_custom) return a.is_custom ? 1 : -1;
                return a.id - b.id;
            }),
        [plans],
    );
    const customPlan = orderedPlans.find((plan) => plan.is_custom);

    return (
        <main>
            <section className="relative overflow-x-clip px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24 lg:px-10 lg:pb-28 lg:pt-28 xl:px-12">
                <div
                    aria-hidden="true"
                    className="absolute -right-72 -top-16 h-[28rem] w-[28rem] md:-right-10 md:-top-10 md:h-[36rem] md:w-[36rem]"
                >
                    <div className="h-full w-full rounded-[42%_58%_36%_64%/50%_35%_65%_50%] bg-brand-primary/90 md:scale-[0.84]" />
                </div>
                <div className="relative mx-auto w-full max-w-[1440px]">
                    <div className="max-w-4xl">
                        <h1 className="text-balance text-[3.5rem] leading-[0.94] text-brand-text sm:text-6xl sm:leading-[0.98] lg:text-[5rem]">
                            Elegí con{' '}
                            <span className="text-brand-primary">claridad</span> el
                            plan que acompaña tu barbería.
                        </h1>
                        <p className="mt-6 max-w-3xl text-[15px] leading-7 text-brand-text-secondary md:text-xl md:leading-9">
                            Comparativa completa. Mirá capacidad, herramientas y
                            nivel de acompañamiento lado a lado. Así podés elegir
                            por cómo trabajás hoy y por el próximo paso que querés
                            dar.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-2.5">
                            {[
                                {
                                    Icon: IconCurrencyDollar,
                                    label: '14 días gratis',
                                },
                                { Icon: IconUsers, label: 'Onboarding guiado' },
                                { Icon: IconDeviceMobile, label: 'Celular o compu' },
                            ].map(({ Icon, label }) => (
                                <span
                                    key={label}
                                    className="inline-flex items-center gap-2 rounded-brand-pill bg-brand-nav-bg px-4 py-2 text-xs font-semibold text-brand-text-on-dark"
                                >
                                    <Icon aria-hidden="true" className="h-4 w-4 text-brand-primary" stroke={2} />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="comparativa"
                aria-labelledby="comparativa-title"
                className="scroll-mt-24 px-5 pb-10 md:px-8 md:pb-16 lg:px-10 xl:px-12"
            >
                <div className="mx-auto w-full max-w-[1440px]">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-3xl">
                            <h2
                                id="comparativa-title"
                                className="text-[2.65rem] leading-[0.98] text-brand-text sm:text-5xl md:text-6xl lg:text-[4rem]"
                            >
                                Compará cada{' '}
                                <span className="text-brand-primary">
                                    diferencia
                                </span>
                            </h2>
                            <p className="mt-4 text-[15px] leading-7 text-brand-text-secondary md:text-lg">
                                Los valores anuales muestran el equivalente mensual
                                y se cobran en un único pago por año.
                            </p>
                        </div>
                        <BillingCycleToggle cycle={cycle} onChange={setCycle} />
                    </div>

                    {orderedPlans.length > 0 ? (
                        <ComparisonTable
                            plans={orderedPlans}
                            cycle={cycle}
                            cta={cta}
                            whatsappSalesNumber={whatsappSalesNumber}
                        />
                    ) : (
                        <div className="mt-8 rounded-brand-xl border border-brand-border bg-brand-surface p-8 text-center shadow-brand-card">
                            <p className="text-brand-text-secondary">
                                Los planes no están disponibles en este momento.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <DecisionCards
                plans={orderedPlans}
                cta={cta}
                whatsappSalesNumber={whatsappSalesNumber}
            />
            <CustomPlanCallout
                plan={customPlan}
                whatsappSalesNumber={whatsappSalesNumber}
            />

            <WaveTransition
                fromClassName={customPlan ? 'text-brand-nav-bg' : 'text-brand-bg'}
                toClassName="bg-brand-primary"
                flip
            />
            <section className="bg-brand-primary px-5 pb-16 pt-8 md:px-8 md:pb-24 md:pt-12 lg:px-10 lg:pb-28 lg:pt-16 xl:px-12">
                <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl text-brand-nav-bg md:text-4xl">
                            Empezá sin riesgo,{' '}
                            <WavyUnderline>probá Estilus Barber gratis</WavyUnderline>{' '}
                            durante 14 días y después decidís.
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-brand-text/75 md:text-base">
                            De esta manera vos conocés el flujo completo antes de
                            gastar y elegir el plan definitivo.
                        </p>
                    </div>
                    <Link
                        href={cta.href}
                        className="group inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-brand-pill bg-brand-nav-bg px-7 py-3 text-center text-sm font-semibold text-brand-text-on-dark shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-nav-bg focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary motion-reduce:transform-none motion-reduce:transition-none md:h-36 md:w-36 md:flex-col md:rounded-brand-lg md:p-5 md:text-lg"
                    >
                        {cta.label}
                        <IconArrowUpRight
                            aria-hidden="true"
                            className="ml-2 h-4 w-4 text-brand-primary transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none md:ml-0 md:mt-3 md:h-8 md:w-8"
                            stroke={2.3}
                        />
                    </Link>
                </div>
            </section>
        </main>
    );
}
