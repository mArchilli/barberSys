import { Link } from '@inertiajs/react';
import {
    IconArrowRight,
    IconCheck,
} from '@tabler/icons-react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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
    const annual = cycle === 'annual';

    return (
        <div className="relative grid w-full max-w-[300px] grid-cols-2 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card">
            <span
                aria-hidden="true"
                className="absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-brand-pill bg-brand-primary shadow-brand-cta transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{
                    transform: annual ? 'translateX(100%)' : 'translateX(0)',
                }}
            />

            {[
                { value: 'monthly', label: 'Mensual' },
                { value: 'annual', label: 'Anual (Ahorrá 2 meses)' },
            ].map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    aria-pressed={cycle === option.value}
                    className={[
                        'relative z-10 inline-flex min-h-9 min-w-0 items-center justify-center whitespace-nowrap rounded-brand-pill px-1 text-[0.7rem] font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 min-[360px]:text-xs',
                        cycle === option.value
                            ? 'text-brand-on-primary'
                            : 'text-brand-text-secondary hover:text-brand-text',
                    ].join(' ')}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function PricingAction({ href, inertia = false, className, children, ...rest }) {
    if (inertia) {
        return (
            <Link href={href} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <a href={href} className={className} {...rest}>
            {children}
        </a>
    );
}

function buildSalesWhatsappHref(whatsappSalesNumber, planName) {
    const text = encodeURIComponent(
        `Hola Estilus, quiero hablar con ventas sobre el plan ${planName}.`,
    );

    return `https://wa.me/${whatsappSalesNumber ?? ''}?text=${text}`;
}

function PlanFeatureItems({ items, dark, featured, compact = false }) {
    if (!items?.length) return null;

    return (
        <ul
            className={
                compact
                    ? 'space-y-2.5 text-[13px] leading-5'
                    : 'space-y-3 text-sm'
            }
        >
            {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-brand-primary-soft">
                        <IconCheck className="h-3.5 w-3.5" stroke={2.6} />
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
    );
}

function PlanIdealFor({ plan, presentation, dark, featured, compact = false }) {
    return (
        <div
            className={[
                compact
                    ? 'mt-5 rounded-brand-lg border p-3.5'
                    : 'mt-6 rounded-brand-lg border p-4',
                dark
                    ? 'border-brand-surface/10 bg-brand-surface/5'
                    : featured
                      ? 'border-brand-text/10 bg-brand-surface/25'
                      : 'border-brand-border-subtle bg-brand-surface-alt/70',
            ].join(' ')}
        >
            <p
                className={[
                    'text-[0.68rem] font-semibold uppercase tracking-[0.18em]',
                    dark
                        ? 'text-brand-text-on-dark'
                        : featured
                          ? 'text-brand-text/70'
                          : 'text-brand-text-secondary',
                ].join(' ')}
            >
                Ideal para
            </p>
            <div className={`${compact ? 'mt-2.5 gap-1.5' : 'mt-3 gap-2'} flex flex-wrap`}>
                {[
                    formatBarberias(plan),
                    formatBarberos(plan),
                    presentation.tagline,
                ]
                    .filter(Boolean)
                    .map((detail) => (
                        <span
                            key={detail}
                            className={[
                                'inline-flex rounded-brand-pill font-semibold',
                                compact
                                    ? 'px-2.5 py-1 text-[0.7rem]'
                                    : 'px-3 py-1.5 text-xs',
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
    );
}

function PricingPlanCard({
    plan,
    cycle,
    cta,
    whatsappSalesNumber,
    hoveredPlanId,
    onMouseEnter,
    onMouseLeave,
    mobile = false,
}) {
    const presentation = PLAN_PRESENTATION[plan.slug] ?? {};
    const { featured, dark: darkOverride } = presentation;
    const dark = darkOverride ?? plan.is_custom;
    const hasAnnual = plan.annual_price !== null;
    const showAnnual = cycle === 'annual' && !plan.is_custom && hasAnnual;
    const displayPrice = showAnnual ? plan.annual_price : plan.price;

    return (
        <article
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={[
                mobile
                    ? 'relative flex w-full flex-col overflow-hidden rounded-brand-xl border p-5 shadow-brand-card'
                    : 'relative flex h-full min-h-[760px] flex-col overflow-hidden rounded-brand-xl border p-7 shadow-brand-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-brand-card-hover motion-reduce:transition-none motion-reduce:hover:transform-none',
                !mobile && hoveredPlanId !== null && hoveredPlanId !== plan.id
                    ? 'opacity-45 blur-[1px]'
                    : 'opacity-100 blur-0',
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
                        mobile ? 'text-[1.75rem]' : 'text-[2rem]',
                        dark ? 'text-brand-surface' : 'text-brand-text',
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

            <div className={mobile ? 'mt-5' : 'mt-7'}>
                <div className="flex items-end gap-2">
                    <span
                        className={`${mobile ? 'text-[2.2rem]' : 'text-[2.4rem]'} font-bold tabular-nums`}
                    >
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
                        `${mobile ? 'mt-3' : 'mt-4'} text-sm leading-6`,
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

            <div className={mobile ? 'mt-5' : 'mt-8'}>
                <PricingAction
                    href={
                        plan.is_custom
                            ? buildSalesWhatsappHref(
                                  whatsappSalesNumber,
                                  plan.name,
                              )
                            : cta.href
                    }
                    inertia={plan.is_custom ? false : cta.inertia}
                    {...(plan.is_custom
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                    className={[
                        'inline-flex min-h-[48px] w-full items-center justify-center rounded-brand-pill px-6 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none',
                        dark
                            ? 'bg-brand-primary text-brand-on-primary hover:-translate-y-0.5 hover:bg-brand-primary-hover focus-visible:ring-brand-primary focus-visible:ring-offset-brand-nav-bg'
                            : featured
                              ? 'bg-brand-nav-bg text-brand-text-on-dark hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:ring-brand-nav-bg'
                              : 'border border-brand-border bg-brand-surface text-brand-text hover:-translate-y-0.5 hover:border-brand-primary-muted hover:bg-brand-bg focus-visible:ring-brand-primary',
                    ].join(' ')}
                >
                    <span>
                        {plan.is_custom ? 'Hablar con ventas' : cta.label}
                    </span>
                    <IconArrowRight className="ml-2 h-4 w-4" stroke={2.3} />
                </PricingAction>
            </div>

            <PlanIdealFor
                plan={plan}
                presentation={presentation}
                dark={dark}
                featured={featured}
                compact={mobile}
            />

            {mobile ? (
                plan.included_items?.length > 0 && (
                    <div className="mt-5">
                        <PlanFeatureItems
                            items={plan.included_items}
                            dark={dark}
                            featured={featured}
                            compact
                        />
                    </div>
                )
            ) : (
                plan.included_items?.length > 0 && (
                    <div className="mt-6">
                        <PlanFeatureItems
                            items={plan.included_items}
                            dark={dark}
                            featured={featured}
                        />
                    </div>
                )
            )}
        </article>
    );
}

function MobileCustomPlanCard({ plan, whatsappSalesNumber }) {
    const presentation = PLAN_PRESENTATION[plan.slug] ?? {};

    return (
        <article className="overflow-hidden rounded-brand-xl border border-brand-nav-bg bg-brand-nav-bg p-5 text-brand-surface shadow-brand-card">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <h3 className="text-[1.75rem] text-brand-surface">{plan.name}</h3>
                <p className="text-2xl font-bold">A medida</p>
            </div>

            <p className="mt-3 text-sm leading-6 text-brand-text-on-dark">
                {presentation.description}
            </p>

            <div className="mt-5">
                <PricingAction
                    href={buildSalesWhatsappHref(
                        whatsappSalesNumber,
                        plan.name,
                    )}
                    inertia={false}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-brand-pill bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-nav-bg motion-reduce:transform-none motion-reduce:transition-none"
                >
                    <span>Hablar con ventas</span>
                    <IconArrowRight className="ml-2 h-4 w-4" stroke={2.3} />
                </PricingAction>
            </div>

            <PlanIdealFor
                plan={plan}
                presentation={presentation}
                dark
                compact
            />

            <div className="mt-5">
                <PlanFeatureItems items={plan.included_items} dark compact />
            </div>
        </article>
    );
}

export default function PricingSection({
    plans = [],
    cta = {
        label: 'Probar gratis',
        href: '#',
        inertia: false,
    },
    whatsappSalesNumber,
}) {
    const fixedPlans = useMemo(
        () => plans.filter((plan) => !plan.is_custom),
        [plans],
    );
    const customPlan = useMemo(
        () => plans.find((plan) => plan.is_custom),
        [plans],
    );
    const featuredPlanSlug =
        fixedPlans.find(
            (plan) => PLAN_PRESENTATION[plan.slug]?.featured,
        )?.slug ?? fixedPlans[0]?.slug ?? '';

    const [cycle, setCycle] = useState('monthly');
    const [hoveredPlanId, setHoveredPlanId] = useState(null);
    const [activePlanSlug, setActivePlanSlug] = useState(
        () =>
            plans.find((plan) => PLAN_PRESENTATION[plan.slug]?.featured)
                ?.slug ?? plans.find((plan) => !plan.is_custom)?.slug ?? '',
    );
    const [mobileCarouselHeight, setMobileCarouselHeight] = useState(null);
    const [isCarouselScrolling, setIsCarouselScrolling] = useState(false);
    const carouselRef = useRef(null);
    const carouselInitializedRef = useRef(false);
    const scrollFrameRef = useRef(null);
    const programmaticScrollFrameRef = useRef(null);
    const scrollSettleTimeoutRef = useRef(null);
    const carouselScrollInProgressRef = useRef(false);
    const manualScrollStartIndexRef = useRef(null);
    const programmaticTargetSlugRef = useRef(null);
    const programmaticScrollAttemptsRef = useRef(0);
    const activePlanSlugRef = useRef(activePlanSlug);
    const planTabRefs = useRef({});

    const getSlideHeight = useCallback((slide) => {
        const card = slide?.querySelector('article');
        if (!slide || !card) return 0;

        const slideStyles = window.getComputedStyle(slide);
        const verticalPadding =
            Number.parseFloat(slideStyles.paddingTop) +
            Number.parseFloat(slideStyles.paddingBottom);

        return Math.ceil(
            card.getBoundingClientRect().height + verticalPadding,
        );
    }, []);

    const scrollToPlan = useCallback((planSlug, smooth = true) => {
        const carousel = carouselRef.current;
        if (!carousel || !planSlug) return;

        if (programmaticScrollFrameRef.current !== null) {
            window.cancelAnimationFrame(programmaticScrollFrameRef.current);
            programmaticScrollFrameRef.current = null;
        }
        carousel.style.scrollSnapType = 'none';

        const slide = [...carousel.querySelectorAll('[data-pricing-slide]')].find(
            (element) => element.dataset.planSlug === planSlug,
        );
        if (!slide) return;

        const carouselRect = carousel.getBoundingClientRect();
        const slideRect = slide.getBoundingClientRect();
        const targetLeft =
            carousel.scrollLeft + slideRect.left - carouselRect.left;
        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (
            !smooth ||
            reduceMotion ||
            Math.abs(targetLeft - carousel.scrollLeft) <= 1
        ) {
            carousel.scrollLeft = targetLeft;
            carousel.style.removeProperty('scroll-snap-type');
            return;
        }

        const startLeft = carousel.scrollLeft;
        const distance = targetLeft - startLeft;
        const duration = Math.min(420, 280 + Math.abs(distance) * 0.2);
        let startTime = null;

        const animateScroll = (timestamp) => {
            if (startTime === null) startTime = timestamp;

            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - (1 - progress) ** 3;
            carousel.scrollLeft = startLeft + distance * easedProgress;

            if (progress < 1) {
                programmaticScrollFrameRef.current =
                    window.requestAnimationFrame(animateScroll);
                return;
            }

            carousel.scrollLeft = targetLeft;
            programmaticScrollFrameRef.current = null;
            carousel.style.removeProperty('scroll-snap-type');
        };

        programmaticScrollFrameRef.current =
            window.requestAnimationFrame(animateScroll);
    }, []);

    useLayoutEffect(() => {
        if (!featuredPlanSlug || carouselInitializedRef.current) return;

        setActivePlanSlug(featuredPlanSlug);
        activePlanSlugRef.current = featuredPlanSlug;
        scrollToPlan(featuredPlanSlug, false);
        carouselInitializedRef.current = true;
    }, [featuredPlanSlug, scrollToPlan]);

    useEffect(() => {
        activePlanSlugRef.current = activePlanSlug;
    }, [activePlanSlug]);

    useLayoutEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return undefined;

        const activeSlide = [
            ...carousel.querySelectorAll('[data-pricing-slide]'),
        ].find((element) => element.dataset.planSlug === activePlanSlug);
        const activeCard = activeSlide?.querySelector('article');
        if (!activeSlide || !activeCard) return undefined;

        const updateHeight = () => {
            if (carousel.clientWidth === 0) return;

            const nextHeight = getSlideHeight(activeSlide);
            setMobileCarouselHeight((currentHeight) => {
                const stableHeight =
                    carouselScrollInProgressRef.current && currentHeight
                        ? Math.max(currentHeight, nextHeight)
                        : nextHeight;

                return currentHeight === stableHeight
                    ? currentHeight
                    : stableHeight;
            });
        };

        updateHeight();

        if (typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(updateHeight);
        observer.observe(activeCard);

        return () => observer.disconnect();
    }, [activePlanSlug, fixedPlans, getSlideHeight]);

    useEffect(() => {
        if (
            featuredPlanSlug &&
            !fixedPlans.some((plan) => plan.slug === activePlanSlug)
        ) {
            setActivePlanSlug(featuredPlanSlug);
        }
    }, [activePlanSlug, featuredPlanSlug, fixedPlans]);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel || typeof ResizeObserver === 'undefined') return undefined;

        let observedWidth = carousel.clientWidth;
        const observer = new ResizeObserver(() => {
            const nextWidth = carousel.clientWidth;
            if (nextWidth <= 0 || nextWidth === observedWidth) return;

            observedWidth = nextWidth;
            scrollToPlan(activePlanSlugRef.current, false);
        });
        observer.observe(carousel);

        return () => observer.disconnect();
    }, [scrollToPlan]);

    useEffect(
        () => () => {
            if (scrollFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollFrameRef.current);
            }
            if (programmaticScrollFrameRef.current !== null) {
                window.cancelAnimationFrame(
                    programmaticScrollFrameRef.current,
                );
            }
            if (scrollSettleTimeoutRef.current !== null) {
                window.clearTimeout(scrollSettleTimeoutRef.current);
            }
        },
        [],
    );

    const beginManualCarouselScroll = (event) => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        if (scrollSettleTimeoutRef.current !== null) {
            window.clearTimeout(scrollSettleTimeoutRef.current);
            scrollSettleTimeoutRef.current = null;
        }
        if (scrollFrameRef.current !== null) {
            window.cancelAnimationFrame(scrollFrameRef.current);
            scrollFrameRef.current = null;
        }
        if (programmaticScrollFrameRef.current !== null) {
            window.cancelAnimationFrame(programmaticScrollFrameRef.current);
            programmaticScrollFrameRef.current = null;
        }
        carousel.style.removeProperty('scroll-snap-type');

        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;
        const slides = [
            ...carousel.querySelectorAll('[data-pricing-slide]'),
        ];
        const closestSlide = slides.reduce((closest, slide, index) => {
            const slideRect = slide.getBoundingClientRect();
            const distance = Math.abs(
                slideRect.left + slideRect.width / 2 - carouselCenter,
            );

            return !closest || distance < closest.distance
                ? { slide, index, distance }
                : closest;
        }, null);

        if (
            closestSlide &&
            (event.type === 'pointerdown' ||
                manualScrollStartIndexRef.current === null)
        ) {
            const currentPlanSlug = closestSlide.slide.dataset.planSlug;
            programmaticTargetSlugRef.current = null;
            programmaticScrollAttemptsRef.current = 0;
            manualScrollStartIndexRef.current = closestSlide.index;
            setActivePlanSlug(currentPlanSlug);
            activePlanSlugRef.current = currentPlanSlug;
        }
    };

    const selectPlan = (planSlug) => {
        const carousel = carouselRef.current;
        const targetSlide = [
            ...(carousel?.querySelectorAll('[data-pricing-slide]') ?? []),
        ].find((slide) => slide.dataset.planSlug === planSlug);
        if (!carousel || !targetSlide) return;

        const carouselRect = carousel.getBoundingClientRect();
        const targetRect = targetSlide.getBoundingClientRect();
        const targetDistance = Math.abs(
            targetRect.left +
                targetRect.width / 2 -
                (carouselRect.left + carouselRect.width / 2),
        );
        if (
            planSlug === activePlanSlugRef.current &&
            targetDistance <= 2
        ) {
            return;
        }

        if (scrollSettleTimeoutRef.current !== null) {
            window.clearTimeout(scrollSettleTimeoutRef.current);
            scrollSettleTimeoutRef.current = null;
        }
        if (scrollFrameRef.current !== null) {
            window.cancelAnimationFrame(scrollFrameRef.current);
            scrollFrameRef.current = null;
        }

        carouselScrollInProgressRef.current = true;
        manualScrollStartIndexRef.current = null;
        programmaticTargetSlugRef.current = planSlug;
        programmaticScrollAttemptsRef.current = 0;
        setIsCarouselScrolling(true);
        if (targetSlide) {
            const targetHeight = getSlideHeight(targetSlide);
            setMobileCarouselHeight((currentHeight) =>
                currentHeight
                    ? Math.max(currentHeight, targetHeight)
                    : targetHeight,
            );
        }

        setActivePlanSlug(planSlug);
        activePlanSlugRef.current = planSlug;
        scrollToPlan(planSlug);
    };

    const finishCarouselScroll = () => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;
        const slides = [
            ...carousel.querySelectorAll('[data-pricing-slide]'),
        ];
        const closestSlide = slides.reduce((closest, slide, index) => {
            const slideRect = slide.getBoundingClientRect();
            const distance = Math.abs(
                slideRect.left + slideRect.width / 2 - carouselCenter,
            );

            return !closest || distance < closest.distance
                ? { slide, index, distance }
                : closest;
        }, null);

        if (!closestSlide) return;

        const programmaticTargetSlug = programmaticTargetSlugRef.current;
        if (
            programmaticTargetSlug &&
            closestSlide.slide.dataset.planSlug !== programmaticTargetSlug &&
            programmaticScrollAttemptsRef.current < fixedPlans.length
        ) {
            programmaticScrollAttemptsRef.current += 1;
            carouselScrollInProgressRef.current = true;
            setIsCarouselScrolling(true);
            scrollToPlan(programmaticTargetSlug);
            scrollSettleTimeoutRef.current = window.setTimeout(
                finishCarouselScroll,
                320,
            );
            return;
        }

        programmaticTargetSlugRef.current = null;
        programmaticScrollAttemptsRef.current = 0;

        const manualStartIndex = manualScrollStartIndexRef.current;
        const constrainedIndex =
            manualStartIndex !== null &&
            Math.abs(closestSlide.index - manualStartIndex) > 1
                ? manualStartIndex +
                  Math.sign(closestSlide.index - manualStartIndex)
                : closestSlide.index;
        const targetSlide = slides[constrainedIndex];
        const targetPlanSlug = targetSlide.dataset.planSlug;
        const needsCorrection = constrainedIndex !== closestSlide.index;

        manualScrollStartIndexRef.current = null;
        carouselScrollInProgressRef.current = needsCorrection;
        setIsCarouselScrolling(needsCorrection);
        setActivePlanSlug(targetPlanSlug);
        activePlanSlugRef.current = targetPlanSlug;

        const targetHeight = getSlideHeight(targetSlide);
        setMobileCarouselHeight((currentHeight) =>
            needsCorrection && currentHeight
                ? Math.max(currentHeight, targetHeight)
                : targetHeight,
        );

        if (needsCorrection) {
            scrollToPlan(targetPlanSlug);
        }

        scrollSettleTimeoutRef.current = null;
    };

    const handleCarouselScroll = () => {
        if (scrollFrameRef.current !== null) {
            window.cancelAnimationFrame(scrollFrameRef.current);
        }

        scrollFrameRef.current = window.requestAnimationFrame(() => {
            const carousel = carouselRef.current;
            if (!carousel) return;

            carouselScrollInProgressRef.current = true;
            setIsCarouselScrolling(true);
            const carouselRect = carousel.getBoundingClientRect();
            const slides = [
                ...carousel.querySelectorAll('[data-pricing-slide]'),
            ];
            if (
                !programmaticTargetSlugRef.current &&
                manualScrollStartIndexRef.current === null
            ) {
                manualScrollStartIndexRef.current = Math.max(
                    0,
                    fixedPlans.findIndex(
                        (plan) =>
                            plan.slug === activePlanSlugRef.current,
                    ),
                );
            }
            if (
                !programmaticTargetSlugRef.current &&
                manualScrollStartIndexRef.current !== null
            ) {
                const minimumIndex = Math.max(
                    0,
                    manualScrollStartIndexRef.current - 1,
                );
                const maximumIndex = Math.min(
                    slides.length - 1,
                    manualScrollStartIndexRef.current + 1,
                );
                const boundedScrollLeft = Math.min(
                    maximumIndex * carousel.clientWidth,
                    Math.max(
                        minimumIndex * carousel.clientWidth,
                        carousel.scrollLeft,
                    ),
                );

                if (Math.abs(carousel.scrollLeft - boundedScrollLeft) > 1) {
                    carousel.scrollLeft = boundedScrollLeft;
                }
            }
            const visibleSlideHeights = slides.flatMap((slide) => {
                const slideRect = slide.getBoundingClientRect();
                const visible =
                    slideRect.right > carouselRect.left &&
                    slideRect.left < carouselRect.right;

                return visible ? [getSlideHeight(slide)] : [];
            });

            if (visibleSlideHeights.length > 0) {
                const visibleHeight = Math.max(...visibleSlideHeights);
                setMobileCarouselHeight((currentHeight) =>
                    currentHeight
                        ? Math.max(currentHeight, visibleHeight)
                        : visibleHeight,
                );
            }

            if (!programmaticTargetSlugRef.current) {
                const carouselCenter =
                    carouselRect.left + carouselRect.width / 2;
                const closestSlide = slides.reduce((closest, slide) => {
                    const slideRect = slide.getBoundingClientRect();
                    const distance = Math.abs(
                        slideRect.left +
                            slideRect.width / 2 -
                            carouselCenter,
                    );

                    return !closest || distance < closest.distance
                        ? { slide, distance }
                        : closest;
                }, null);
                const nextPlanSlug = closestSlide?.slide.dataset.planSlug;

                if (
                    nextPlanSlug &&
                    nextPlanSlug !== activePlanSlugRef.current
                ) {
                    setActivePlanSlug(nextPlanSlug);
                    activePlanSlugRef.current = nextPlanSlug;
                }
            }

            if (scrollSettleTimeoutRef.current !== null) {
                window.clearTimeout(scrollSettleTimeoutRef.current);
            }
            scrollSettleTimeoutRef.current = window.setTimeout(
                finishCarouselScroll,
                140,
            );

            scrollFrameRef.current = null;
        });
    };

    const handlePlanTabKeyDown = (event, currentIndex) => {
        const lastIndex = fixedPlans.length - 1;
        let nextIndex = null;

        if (event.key === 'ArrowRight') {
            nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        } else if (event.key === 'ArrowLeft') {
            nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = lastIndex;
        }

        if (nextIndex === null) return;

        event.preventDefault();
        const nextPlan = fixedPlans[nextIndex];
        planTabRefs.current[nextPlan.slug]?.focus();
        selectPlan(nextPlan.slug);
    };

    const activePlanIndex = Math.max(
        0,
        fixedPlans.findIndex((plan) => plan.slug === activePlanSlug),
    );

    return (
        <section
            id="precios"
            className="scroll-mt-24 px-5 pb-14 pt-5 md:px-8 md:pb-24 md:pt-8 lg:px-10 lg:pb-28 lg:pt-10 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-balance text-[2rem] leading-[1.02] text-brand-text md:text-5xl md:leading-none lg:text-6xl">
                        Tenemos el plan perfecto para tu barbería
                    </h2>
                    <p className="mt-4 text-[15px] leading-6 text-brand-text-secondary md:mt-5 md:text-lg md:leading-8">
                        Probá gratis y elegí el plan que mejor acompaña el tamaño
                        de tu barbería, con métricas claras y una estructura pensada
                        para crecer sin perder control.
                    </p>
                </div>

                <div className="mt-7 flex justify-center md:mt-10">
                    <BillingCycleToggle cycle={cycle} onChange={setCycle} />
                </div>

                {fixedPlans.length > 0 && (
                    <div className="md:hidden">
                        <div
                            role="tablist"
                            aria-label="Elegir plan"
                            className="relative mt-5 grid grid-cols-3 gap-1 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute bottom-1 left-1 top-1 w-[calc((100%-1rem)/3)] rounded-brand-pill bg-brand-primary shadow-brand-cta transition-transform duration-300 ease-out motion-reduce:transition-none"
                                style={{
                                    transform: `translateX(calc(${activePlanIndex * 100}% + ${activePlanIndex * 0.25}rem))`,
                                }}
                            />

                            {fixedPlans.map((plan, index) => {
                                const selected = plan.slug === activePlanSlug;

                                return (
                                    <button
                                        key={plan.id}
                                        ref={(element) => {
                                            planTabRefs.current[plan.slug] =
                                                element;
                                        }}
                                        id={`pricing-mobile-tab-${plan.slug}`}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        aria-controls={`pricing-mobile-panel-${plan.slug}`}
                                        tabIndex={selected ? 0 : -1}
                                        onClick={() => selectPlan(plan.slug)}
                                        onKeyDown={(event) =>
                                            handlePlanTabKeyDown(event, index)
                                        }
                                        className={[
                                            'relative z-10 min-h-10 min-w-0 rounded-brand-pill px-1 text-[0.72rem] font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 min-[360px]:text-xs',
                                            selected
                                                ? 'text-brand-on-primary'
                                                : 'text-brand-text-secondary hover:text-brand-text',
                                        ].join(' ')}
                                    >
                                        <span className="block truncate">
                                            {plan.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div
                            ref={carouselRef}
                            role="region"
                            aria-roledescription="carrusel"
                            aria-label="Planes de Estilus"
                            onScroll={handleCarouselScroll}
                            onPointerDown={beginManualCarouselScroll}
                            onWheel={beginManualCarouselScroll}
                            style={
                                mobileCarouselHeight
                                    ? { height: mobileCarouselHeight }
                                    : undefined
                            }
                            className={`mt-4 flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isCarouselScrolling ? 'transition-none' : 'transition-[height] duration-300 ease-out motion-reduce:transition-none'}`}
                        >
                            {fixedPlans.map((plan) => {
                                const active = plan.slug === activePlanSlug;

                                return (
                                    <div
                                        key={plan.id}
                                        id={`pricing-mobile-panel-${plan.slug}`}
                                        role="tabpanel"
                                        aria-labelledby={`pricing-mobile-tab-${plan.slug}`}
                                        aria-hidden={!active}
                                        inert={active ? undefined : ''}
                                        data-pricing-slide
                                        data-plan-slug={plan.slug}
                                        className="w-full shrink-0 snap-center snap-always px-0.5 py-1"
                                    >
                                        <PricingPlanCard
                                            plan={plan}
                                            cycle={cycle}
                                            cta={cta}
                                            whatsappSalesNumber={
                                                whatsappSalesNumber
                                            }
                                            mobile
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div
                            className="mt-2 flex items-center justify-center gap-3"
                            aria-live="polite"
                        >
                            <div
                                aria-hidden="true"
                                className="flex items-center gap-1.5"
                            >
                                {fixedPlans.map((plan) => (
                                    <span
                                        key={plan.id}
                                        className={`block h-2 rounded-full transition-[width,background-color] duration-150 ${plan.slug === activePlanSlug ? 'w-5 bg-brand-primary' : 'w-2 bg-brand-border'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium text-brand-text-secondary">
                                {activePlanIndex + 1} de {fixedPlans.length}
                            </span>
                        </div>

                        {customPlan && (
                            <div className="mt-6">
                                <MobileCustomPlanCard
                                    plan={customPlan}
                                    whatsappSalesNumber={whatsappSalesNumber}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-10 hidden gap-6 md:grid xl:grid-cols-4">
                    {plans.map((plan) => (
                        <PricingPlanCard
                            key={plan.id}
                            plan={plan}
                            cycle={cycle}
                            cta={cta}
                            whatsappSalesNumber={whatsappSalesNumber}
                            hoveredPlanId={hoveredPlanId}
                            onMouseEnter={() => setHoveredPlanId(plan.id)}
                            onMouseLeave={() => setHoveredPlanId(null)}
                        />
                    ))}
                </div>

                <div className="mt-8 flex flex-col items-center md:mt-10">
                    <p className="max-w-3xl text-center text-sm leading-6 text-brand-text-secondary md:text-base">
                        Todos los planes incluyen onboarding guiado y acceso desde
                        celular o compu. Si tu operación necesita algo más grande,
                        armamos una configuración a medida para tu cadena.
                    </p>
                    <Link
                        href={route('pricing.details')}
                        className="group mt-5 inline-flex min-h-[48px] items-center justify-center rounded-brand-pill border border-brand-nav-bg bg-brand-nav-bg px-6 text-sm font-semibold text-brand-text-on-dark shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                    >
                        <span>Ver planes en detalle</span>
                        <IconArrowRight
                            aria-hidden="true"
                            className="ml-2 h-4 w-4 text-brand-primary transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                            stroke={2.3}
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}
