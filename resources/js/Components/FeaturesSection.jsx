import { Link } from '@inertiajs/react';
import {
    IconArrowUpRight,
    IconAsterisk,
    IconChartBar,
    IconChevronRight,
    IconScissors,
    IconUsers,
    IconWallet,
} from '@tabler/icons-react';
import { useRef, useState } from 'react';

export const PRODUCT_TOUR_FEATURES = [
    {
        id: 'control',
        category: 'Control',
        title: 'Toda tu barbería en una sola vista',
        description:
            'Revisá tu facturación, productividad, ganancias y más métricas clave desde un panel pensado para decidir rápido y con información clara.',
        benefits: [
            'Número en tiempo real',
            'Vista general del negocio',
        ],
        image: '/images/estilus-dashboard-desktop.jpg',
        imageAlt:
            'Dashboard general de Estilus con facturación, ganancia neta, cortes, ticket promedio y evolución del negocio',
        imageWidth: 1895,
        imageHeight: 899,
        icon: IconChartBar,
    },
    {
        id: 'finanzas',
        category: 'Finanzas',
        title: 'Sabé cuánto te queda realmente',
        description:
            'Ingresos, sueldos, comisiones y gastos reunidos para mostrarte realmente cuánto estás ganando en tu barbería.',
        benefits: ['Ganancia neta real', 'Arqueo de caja'],
        image: '/images/features/finanzas.png',
        imageAlt:
            'Panel de Finanzas de Estilus con resultado neto, facturación, sueldos, gastos y evolución del período',
        imageWidth: 1440,
        imageHeight: 900,
        icon: IconWallet,
    },
    {
        id: 'equipo',
        category: 'Equipo de trabajo',
        title: 'Medí el rendimiento de cada barbero',
        description:
            'Creá los perfiles de tus barberos, definí sus sueldos fijos o comisiones y compará el rendimiento de tu equipo desde un solo lugar.',
        benefits: ['Sueldos y comisiones', 'Productividad individual'],
        image: '/images/features/barberos.png',
        imageAlt:
            'Panel de Barberos de Estilus con capacidad del equipo, modalidades de pago y perfiles individuales',
        imageWidth: 1440,
        imageHeight: 900,
        icon: IconUsers,
    },
    {
        id: 'operacion',
        category: 'Cortes y servicios',
        title: 'Registrá cada corte en segundos',
        description:
            'Elegí el cliente y el servicio, confirmá el medio de pago y Estilus registra el movimiento automáticamente.',
        benefits: [
            'Precio completado automáticamente',
            'Cobro y movimiento en un paso',
        ],
        image: '/images/features/cortes.png',
        imageAlt:
            'Pantalla Cargar corte de Estilus con selección de cliente, servicio, precio y medio de pago',
        imageWidth: 1440,
        imageHeight: 900,
        icon: IconScissors,
    },
];

const tabId = (scope, featureId) =>
    `product-tour-${scope}-trigger-${featureId}`;
const panelId = (scope, featureId) =>
    `product-tour-${scope}-panel-${featureId}`;
const mobilePanelId = 'product-tour-mobile-panel';

function FeatureAction({ href, inertia = false, className, children }) {
    const Component = inertia ? Link : 'a';

    return (
        <Component href={href} className={className}>
            {children}
        </Component>
    );
}

function FeatureIcon({ feature, className = '' }) {
    const Icon = feature.icon;

    return <Icon aria-hidden="true" className={className} stroke={1.9} />;
}

function FeatureBenefits({ benefits, compact = false }) {
    return (
        <ul className={compact ? 'mt-4 space-y-2.5' : 'mt-5 space-y-3'}>
            {benefits.map((benefit) => (
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
    );
}

function ProductTourOrganicShape({ compact = false }) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 760 250"
            preserveAspectRatio="none"
            className={
                compact
                    ? 'pointer-events-none absolute -bottom-5 -left-[7%] z-0 h-24 w-[72%]'
                    : 'pointer-events-none absolute -bottom-8 -left-[5%] z-0 h-36 w-[64%]'
            }
        >
            <path
                className="fill-brand-primary"
                d="M-38 128C38 48 158 24 267 54C360 80 423 123 520 103C618 84 697 27 760 55C828 86 817 168 744 207C660 251 558 210 462 224C344 241 224 260 116 225C22 195-92 184-38 128Z"
            />
        </svg>
    );
}

function ProductScreenshot({ activeId, compact = false, flush = false }) {
    return (
        <div
            className={
                flush
                    ? 'relative h-full w-full bg-brand-nav-bg'
                    : 'relative isolate w-full'
            }
        >
            {!flush && <ProductTourOrganicShape compact={compact} />}

            {!flush && compact ? (
                <div
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 top-3 z-[1] translate-y-3 rounded-[22px] bg-brand-secondary/35"
                />
            ) : !flush ? (
                <>
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-7 bottom-1 top-6 z-[1] translate-x-2 translate-y-3 rounded-[26px] bg-brand-secondary/[0.38]"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-4 bottom-3 top-3 z-[2] translate-x-1 translate-y-1.5 rounded-[26px] bg-brand-primary/55"
                    />
                </>
            ) : null}

            <figure
                className={
                    flush
                        ? 'relative h-full w-full overflow-hidden bg-brand-nav-bg'
                        : compact
                        ? 'relative z-10 aspect-[8/5] overflow-hidden rounded-[22px] border border-brand-nav-bg/80 bg-brand-nav-bg p-1.5 shadow-brand-floating'
                        : 'relative z-10 aspect-[8/5] overflow-hidden rounded-[26px] border border-brand-nav-bg/80 bg-brand-nav-bg p-2 shadow-brand-floating'
                }
            >
                <div
                    className={
                        flush
                            ? 'relative h-full w-full overflow-hidden bg-brand-nav-bg'
                            : 'relative h-full w-full overflow-hidden rounded-[17px] bg-brand-nav-bg sm:rounded-[20px]'
                    }
                >
                    {PRODUCT_TOUR_FEATURES.map((feature) => {
                        const isActive = feature.id === activeId;

                        return (
                            <img
                                key={feature.id}
                                src={feature.image}
                                alt={isActive ? feature.imageAlt : ''}
                                width={feature.imageWidth}
                                height={feature.imageHeight}
                                loading="eager"
                                fetchpriority={
                                    feature.id ===
                                    PRODUCT_TOUR_FEATURES[0].id
                                        ? 'high'
                                        : 'auto'
                                }
                                decoding="async"
                                draggable="false"
                                aria-hidden={isActive ? undefined : 'true'}
                                className={`absolute inset-0 h-full w-full select-none object-contain transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none ${
                                    isActive
                                        ? 'z-10 translate-y-0 opacity-100'
                                        : 'pointer-events-none z-0 translate-y-2 opacity-0'
                                }`}
                            />
                        );
                    })}
                </div>
            </figure>
        </div>
    );
}

function MobileFeatureSelector({
    activeId,
    onSelect,
    onKeyDown,
    registerTab,
}) {
    return (
        <div
            role="tablist"
            aria-label="Funcionalidades de Estilus"
            aria-orientation="horizontal"
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3"
        >
            {PRODUCT_TOUR_FEATURES.map((feature, index) => {
                const isActive = feature.id === activeId;

                return (
                    <button
                        key={feature.id}
                        ref={(node) =>
                            registerTab('mobile', feature.id, node)
                        }
                        type="button"
                        role="tab"
                        id={tabId('mobile', feature.id)}
                        aria-controls={mobilePanelId}
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        className={`group relative flex min-h-[58px] min-w-0 items-center gap-1.5 rounded-brand-md border px-2 py-2.5 text-left text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg sm:gap-2.5 sm:px-3 motion-reduce:transition-none ${
                            isActive
                                ? 'border-brand-primary bg-brand-primary-soft text-brand-text shadow-brand-card'
                                : 'border-brand-border bg-brand-surface text-brand-text-secondary hover:border-brand-primary-muted hover:text-brand-text'
                        }`}
                        onClick={() => onSelect(feature.id)}
                        onKeyDown={(event) =>
                            onKeyDown(event, 'mobile', index, true)
                        }
                    >
                        <span
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-brand-sm ${
                                isActive
                                    ? 'bg-brand-nav-bg text-brand-primary'
                                    : 'bg-brand-bg text-brand-primary'
                            }`}
                        >
                            <FeatureIcon
                                feature={feature}
                                className="h-[18px] w-[18px]"
                            />
                        </span>
                        <span className="min-w-0 flex-1 leading-4">
                            {feature.category}
                        </span>
                        {isActive && (
                            <span
                                aria-hidden="true"
                                className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-primary"
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function MobileProductTour({
    activeFeature,
    activeId,
    cta,
    onSelect,
    onKeyDown,
    registerTab,
}) {
    return (
        <div className="mt-10 xl:hidden">
            <MobileFeatureSelector
                activeId={activeId}
                onSelect={onSelect}
                onKeyDown={onKeyDown}
                registerTab={registerTab}
            />

            <div
                role="tabpanel"
                id={mobilePanelId}
                aria-labelledby={tabId('mobile', activeFeature.id)}
                className="mt-7 outline-none sm:mt-9"
            >
                <ProductScreenshot activeId={activeId} compact />

                <div
                    key={activeFeature.id}
                    className="product-tour-copy-enter mt-8 min-h-[274px] sm:mt-10 sm:min-h-[256px]"
                >
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand-secondary">
                        <span>{activeFeature.category}</span>
                    </div>

                    <h3 className="mt-3 max-w-[36rem] text-[clamp(1.75rem,7vw,2.4rem)] leading-[1.02] text-brand-text">
                        {activeFeature.title}
                    </h3>
                    <p className="mt-4 max-w-[42rem] text-[15px] leading-6 text-brand-text-secondary sm:text-base sm:leading-7">
                        {activeFeature.description}
                    </p>

                    <FeatureBenefits benefits={activeFeature.benefits} />
                </div>

                {cta && (
                    <FeatureAction
                        href={cta.href}
                        inertia={cta.inertia}
                        className="group mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-brand-pill bg-brand-primary px-8 text-base font-semibold text-brand-on-primary shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-brand-floating focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg sm:w-auto motion-reduce:transform-none motion-reduce:transition-none"
                    >
                        <span>{cta.label}</span>
                        <IconArrowUpRight
                            aria-hidden="true"
                            className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                            stroke={2.3}
                        />
                    </FeatureAction>
                )}
            </div>
        </div>
    );
}

function DesktopProductTour({
    activeFeature,
    activeId,
    cta,
    onSelect,
    onKeyDown,
    registerTab,
}) {
    return (
        <div className="relative mt-16 hidden xl:block">
            <div className="relative z-10 grid h-[600px] grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] overflow-hidden rounded-[30px] border border-brand-border bg-brand-surface shadow-brand-floating">
                <div className="relative h-full min-w-0 overflow-hidden bg-brand-nav-bg">
                    <ProductScreenshot activeId={activeId} flush />
                </div>

                <aside className="flex min-w-0 flex-col border-l border-brand-border bg-brand-surface">
                    <div
                        role="group"
                        aria-label="Funcionalidades de Estilus"
                        className="flex-1"
                    >
                        {PRODUCT_TOUR_FEATURES.map((feature, index) => {
                            const isActive = feature.id === activeId;

                            return (
                                <div
                                    key={feature.id}
                                    className={`border-b border-brand-border-subtle border-l-2 transition-colors duration-200 last:border-b-0 motion-reduce:transition-none ${
                                        isActive
                                            ? 'border-l-brand-primary bg-brand-primary/5'
                                            : 'border-l-transparent bg-brand-surface'
                                    }`}
                                >
                                    <button
                                        ref={(node) =>
                                            registerTab(
                                                'desktop',
                                                feature.id,
                                                node,
                                            )
                                        }
                                        type="button"
                                        id={tabId('desktop', feature.id)}
                                        aria-controls={panelId(
                                            'desktop',
                                            feature.id,
                                        )}
                                        aria-expanded={isActive}
                                        className="group flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-secondary 2xl:px-5"
                                        onClick={() =>
                                            onSelect(feature.id)
                                        }
                                        onKeyDown={(event) =>
                                            onKeyDown(
                                                event,
                                                'desktop',
                                                index,
                                                false,
                                            )
                                        }
                                    >
                                        <span
                                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-brand-sm ${
                                                isActive
                                                    ? 'bg-brand-nav-bg text-brand-primary'
                                                    : 'bg-brand-bg text-brand-primary'
                                            }`}
                                        >
                                            <FeatureIcon
                                                feature={feature}
                                                className="h-[18px] w-[18px]"
                                            />
                                        </span>
                                        <span
                                            className={`min-w-0 flex-1 text-sm font-bold ${
                                                isActive
                                                    ? 'text-brand-text'
                                                    : 'text-brand-text-secondary group-hover:text-brand-text'
                                            }`}
                                        >
                                            {feature.category}
                                        </span>
                                        <IconChevronRight
                                            aria-hidden="true"
                                            className={`h-4 w-4 shrink-0 text-brand-primary transition-transform duration-200 motion-reduce:transition-none ${
                                                isActive
                                                    ? 'rotate-90'
                                                    : ''
                                            }`}
                                            stroke={2}
                                        />
                                    </button>

                                    <div
                                        role="region"
                                        id={panelId(
                                            'desktop',
                                            feature.id,
                                        )}
                                        aria-labelledby={tabId(
                                            'desktop',
                                            feature.id,
                                        )}
                                        hidden={!isActive}
                                        className={
                                            isActive
                                                ? 'product-tour-copy-enter px-4 pb-5 2xl:px-5 2xl:pb-6'
                                                : 'hidden'
                                        }
                                    >
                                            <h3 className="text-[1.65rem] leading-[1.04] text-brand-text 2xl:text-[1.8rem]">
                                                {feature.title}
                                            </h3>
                                            <p className="mt-3 text-[14px] leading-6 text-brand-text-secondary 2xl:text-[15px]">
                                                {feature.description}
                                            </p>
                                            <FeatureBenefits
                                                benefits={feature.benefits}
                                                compact
                                            />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {cta && (
                        <div className="mt-auto px-4 py-5 2xl:px-5">
                            <FeatureAction
                                href={cta.href}
                                inertia={cta.inertia}
                                className="group inline-flex min-h-[50px] w-full items-center justify-center rounded-brand-pill bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-brand-floating focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface motion-reduce:transform-none motion-reduce:transition-none"
                            >
                                <span>{cta.label}</span>
                                <IconArrowUpRight
                                    aria-hidden="true"
                                    className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                                    stroke={2.3}
                                />
                            </FeatureAction>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

export default function FeaturesSection({
    cta = {
        label: 'Probar Estilus Barber',
        href: '#',
        inertia: false,
    },
}) {
    const [activeId, setActiveId] = useState(
        PRODUCT_TOUR_FEATURES[0].id,
    );
    const tabRefs = useRef({
        mobile: new Map(),
        desktop: new Map(),
    });
    const activeFeature =
        PRODUCT_TOUR_FEATURES.find((feature) => feature.id === activeId) ??
        PRODUCT_TOUR_FEATURES[0];

    const registerTab = (scope, featureId, node) => {
        const scopedRefs = tabRefs.current[scope];
        if (node) scopedRefs.set(featureId, node);
        else scopedRefs.delete(featureId);
    };

    const selectFeature = (featureId) => {
        if (featureId !== activeId) setActiveId(featureId);
    };

    const handleTabKeyDown = (event, scope, index, isMobileTabs) => {
        let nextIndex = null;
        const total = PRODUCT_TOUR_FEATURES.length;

        if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = total - 1;
        else if (
            event.key === 'ArrowRight' ||
            (!isMobileTabs && event.key === 'ArrowDown')
        )
            nextIndex = (index + 1) % total;
        else if (
            event.key === 'ArrowLeft' ||
            (!isMobileTabs && event.key === 'ArrowUp')
        )
            nextIndex = (index - 1 + total) % total;

        if (nextIndex === null) return;

        event.preventDefault();
        const nextFeature = PRODUCT_TOUR_FEATURES[nextIndex];
        setActiveId(nextFeature.id);
        tabRefs.current[scope].get(nextFeature.id)?.focus();
    };

    return (
        <section
            id="funcionalidades"
            aria-labelledby="software-features-heading"
            className="relative isolate scroll-mt-24 overflow-clip px-6 py-20 sm:px-8 sm:py-24 md:pr-24 lg:py-28 lg:pl-10 xl:py-36 xl:pl-12 min-[1664px]:px-12"
        >
            <div className="relative z-10 mx-auto w-full max-w-[1440px]">
                <header className="xl:grid xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-end xl:gap-16 2xl:gap-20">
                    <div className="max-w-[880px]">
                        <h2
                            id="software-features-heading"
                            className="text-[clamp(2.25rem,9vw,2.75rem)] leading-[0.98] text-brand-text sm:text-[clamp(2.75rem,6vw,4rem)] xl:text-[clamp(3.5rem,4.4vw,4.5rem)]"
                        >
                            <span className="text-brand-primary">
                                Estilus barber
                            </span>{' '}
                            te cuenta lo que pasa en tu barbería.
                        </h2>
                    </div>

                    <p className="mt-6 max-w-[38rem] text-[15px] leading-6 text-brand-text-secondary sm:text-base sm:leading-7 xl:mt-0 xl:pb-1 xl:text-lg xl:leading-8">
                        Estilus es tu comodín todo en uno. Reúne turnos,
                        operación, cortes, equipo y finanzas para que tomes
                        decisiones con información real, no con suposiciones.
                    </p>
                </header>

                <MobileProductTour
                    activeFeature={activeFeature}
                    activeId={activeId}
                    cta={cta}
                    onSelect={selectFeature}
                    onKeyDown={handleTabKeyDown}
                    registerTab={registerTab}
                />
                <DesktopProductTour
                    activeFeature={activeFeature}
                    activeId={activeId}
                    cta={cta}
                    onSelect={selectFeature}
                    onKeyDown={handleTabKeyDown}
                    registerTab={registerTab}
                />
            </div>
        </section>
    );
}
