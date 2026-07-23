import BrandMark from '@/Components/BrandMark';
import { Link } from '@inertiajs/react';
import {
    IconArrowRight,
    IconChartBar,
    IconCreditCard,
    IconMapPin,
    IconScissors,
    IconUsers,
    IconWallet,
} from '@tabler/icons-react';
import { useLayoutEffect, useRef, useState } from 'react';

const areas = [
    {
        label: 'Medios de pago',
        Icon: IconCreditCard,
        desktopPosition: 'left-[3%] top-[3%]',
        mobilePosition: 'left-[1%] top-[1%]',
        mobileSize:
            'h-24 w-[41%] max-w-36 sm:h-28 sm:w-[35%] sm:max-w-none',
        rotation: '-rotate-2',
        shape: '43% 57% 48% 52% / 56% 44% 56% 44%',
        iconShape: '38% 62% 45% 55% / 58% 42% 58% 42%',
    },
    {
        label: 'Gestión de equipos',
        Icon: IconUsers,
        desktopPosition: 'right-[3%] top-[4%]',
        mobilePosition: 'right-0 top-[5%]',
        mobileSize:
            'h-[6.5rem] w-[42%] max-w-[9.25rem] sm:h-28 sm:w-[36%] sm:max-w-none',
        rotation: 'rotate-2',
        shape: '58% 42% 55% 45% / 44% 57% 43% 56%',
        iconShape: '55% 45% 61% 39% / 42% 55% 45% 58%',
    },
    {
        label: 'Cargar cortes y servicios',
        Icon: IconScissors,
        desktopPosition: 'left-0 top-[37%]',
        mobilePosition: 'left-0 top-[27%]',
        mobileSize:
            'h-[6.75rem] w-[39%] max-w-[8.75rem] sm:h-28 sm:w-[34%] sm:max-w-none',
        rotation: 'rotate-1',
        shape: '48% 52% 39% 61% / 57% 43% 58% 42%',
        iconShape: '44% 56% 38% 62% / 58% 43% 57% 42%',
    },
    {
        label: 'Finanzas y rentabilidad',
        Icon: IconChartBar,
        desktopPosition: 'right-0 top-[38%]',
        mobilePosition: 'right-0 top-[27%]',
        mobileSize:
            'h-28 w-[43%] max-w-[9.5rem] sm:h-[7.25rem] sm:w-[36%] sm:max-w-none',
        rotation: '-rotate-2',
        shape: '55% 45% 62% 38% / 42% 59% 41% 58%',
        iconShape: '61% 39% 48% 52% / 43% 57% 44% 56%',
    },
    {
        label: 'Control de caja',
        Icon: IconWallet,
        desktopPosition: 'bottom-[1%] left-[12%]',
        mobilePosition: 'bottom-[1%] left-[6%]',
        mobileSize:
            'h-[6.5rem] w-[42%] max-w-[9.25rem] sm:h-28 sm:w-[35%] sm:max-w-none',
        rotation: 'rotate-2',
        shape: '40% 60% 53% 47% / 59% 42% 58% 41%',
        iconShape: '39% 61% 55% 45% / 60% 40% 58% 42%',
    },
    {
        label: 'Varias sucursales',
        Icon: IconMapPin,
        desktopPosition: 'bottom-[2%] right-[11%]',
        mobilePosition: 'bottom-[5%] right-[1%]',
        mobileSize:
            'h-[6.25rem] w-[40%] max-w-36 sm:h-[6.75rem] sm:w-[33%] sm:max-w-none',
        rotation: '-rotate-1',
        shape: '61% 39% 46% 54% / 43% 56% 44% 57%',
        iconShape: '57% 43% 38% 62% / 46% 59% 41% 54%',
    },
];

const desktopArrowPaths = [
    'M230 105 C320 72 300 195 370 170 C420 152 420 230 485 250',
    'M970 110 C890 70 900 190 830 165 C780 148 780 230 715 250',
    'M210 330 C290 290 300 385 355 345 C395 315 410 350 452 340',
    'M990 335 C910 295 900 390 845 348 C805 318 790 355 748 340',
    'M300 565 C390 600 380 500 440 525 C480 540 475 490 520 470',
    'M900 565 C820 600 820 500 765 525 C725 542 725 490 680 470',
];

function AreaNode({ area, compact = false, elementRef }) {
    const { Icon } = area;

    return (
        <div
            ref={elementRef}
            className={[
                `absolute z-20 flex border-2 border-brand-nav-bg bg-brand-surface text-brand-nav-bg shadow-brand-card ${area.rotation}`,
                compact
                    ? `flex-col items-center justify-center gap-2 px-3 text-center ${area.mobilePosition} ${area.mobileSize}`
                    : `h-[8.25rem] w-[13.5rem] items-center gap-4 px-5 ${area.desktopPosition}`,
            ].join(' ')}
            style={{ borderRadius: area.shape }}
        >
            <span
                className={[
                    'flex shrink-0 items-center justify-center bg-brand-nav-bg text-brand-primary',
                    compact ? 'h-10 w-10' : 'h-12 w-12',
                ].join(' ')}
                style={{ borderRadius: area.iconShape }}
            >
                <Icon
                    className={compact ? 'h-5 w-5' : 'h-6 w-6'}
                    stroke={2}
                />
            </span>
            <span
                className={[
                    'font-semibold leading-tight',
                    compact ? 'text-[0.72rem]' : 'text-sm',
                ].join(' ')}
            >
                {area.label}
            </span>
        </div>
    );
}

function ArrowField({ paths, markerId, viewBox }) {
    return (
        <svg
            aria-hidden="true"
            viewBox={viewBox}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
        >
            <defs>
                <marker
                    id={markerId}
                    markerWidth="9"
                    markerHeight="9"
                    refX="7"
                    refY="4.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path d="M0 0L8 4.5L0 9Z" className="fill-brand-nav-bg" />
                </marker>
            </defs>

            {paths.map((path) => (
                <path
                    key={path}
                    d={path}
                    fill="none"
                    className="stroke-brand-nav-bg"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd={`url(#${markerId})`}
                />
            ))}
        </svg>
    );
}

function EstilusCore({ compact = false, elementRef }) {
    return (
        <div
            ref={elementRef}
            className={[
                'absolute left-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border-2 border-brand-bg/80 bg-brand-nav-bg text-center shadow-brand-floating',
                compact
                    ? 'top-[55%] h-36 w-[11.5rem] sm:h-44 sm:w-56'
                    : 'top-[52%] h-[13rem] w-[18rem]',
            ].join(' ')}
            style={{
                borderRadius:
                    '46% 54% 58% 42% / 57% 43% 57% 43%',
            }}
        >
            <BrandMark
                className={
                    compact
                        ? 'h-12 w-12 text-brand-primary'
                        : 'h-16 w-16 text-brand-primary'
                }
            />
            <span
                className={[
                    'mt-2 font-display font-extrabold tracking-[-0.04em] text-brand-bg',
                    compact ? 'text-4xl' : 'text-5xl',
                ].join(' ')}
            >
                Estilus
            </span>
        </div>
    );
}

function relativeRect(element, containerRect) {
    const rect = element.getBoundingClientRect();

    return {
        left: rect.left - containerRect.left,
        right: rect.right - containerRect.left,
        top: rect.top - containerRect.top,
        bottom: rect.bottom - containerRect.top,
        width: rect.width,
        height: rect.height,
        centerX: rect.left - containerRect.left + rect.width / 2,
        centerY: rect.top - containerRect.top + rect.height / 2,
    };
}

function buildMobileConnector(index, node, core) {
    if (index < 2) {
        const direction = index === 0 ? 1 : -1;
        const start = {
            x: node.left + node.width * (index === 0 ? 0.68 : 0.32),
            y: node.bottom + 2,
        };
        const target = {
            x: core.centerX + direction * -24,
            y: core.top - 8,
        };
        const distanceY = target.y - start.y;

        return [
            `M${start.x.toFixed(1)} ${start.y.toFixed(1)}`,
            `C${(start.x + direction * 24).toFixed(1)} ${(start.y + distanceY * 0.15).toFixed(1)}`,
            `${(target.x + direction * 20).toFixed(1)} ${(start.y + distanceY * 0.3).toFixed(1)}`,
            `${(target.x + direction * 16).toFixed(1)} ${(start.y + distanceY * 0.45).toFixed(1)}`,
            `C${(target.x + direction * 8).toFixed(1)} ${(start.y + distanceY * 0.6).toFixed(1)}`,
            `${(target.x + direction * 14).toFixed(1)} ${(start.y + distanceY * 0.75).toFixed(1)}`,
            `${(target.x + direction * 6).toFixed(1)} ${(start.y + distanceY * 0.84).toFixed(1)}`,
            `C${(target.x + direction * 2).toFixed(1)} ${(start.y + distanceY * 0.91).toFixed(1)}`,
            `${(target.x - direction * 10).toFixed(1)} ${(target.y - 14).toFixed(1)}`,
            `${target.x.toFixed(1)} ${target.y.toFixed(1)}`,
        ].join(' ');
    }

    if (index < 4) {
        const direction = index === 2 ? 1 : -1;
        const start = {
            x: node.centerX,
            y: node.bottom + 2,
        };
        const target = {
            x: index === 2 ? core.left - 8 : core.right + 8,
            y: core.top + core.height * 0.38,
        };
        const middleY = start.y + (target.y - start.y) / 2;

        return [
            `M${start.x.toFixed(1)} ${start.y.toFixed(1)}`,
            `C${(start.x + direction * 18).toFixed(1)} ${(start.y + 12).toFixed(1)}`,
            `${(start.x - direction * 16).toFixed(1)} ${(middleY - 10).toFixed(1)}`,
            `${((start.x + target.x) / 2).toFixed(1)} ${middleY.toFixed(1)}`,
            `C${(target.x + direction * 16).toFixed(1)} ${(middleY + 10).toFixed(1)}`,
            `${(target.x - direction * 14).toFixed(1)} ${target.y.toFixed(1)}`,
            `${target.x.toFixed(1)} ${target.y.toFixed(1)}`,
        ].join(' ');
    }

    const direction = index === 4 ? 1 : -1;
    const start = {
        x: node.centerX,
        y: node.top - 2,
    };
    const target = {
        x: core.centerX + direction * -36,
        y: core.bottom + 8,
    };
    const distanceY = start.y - target.y;

    return [
        `M${start.x.toFixed(1)} ${start.y.toFixed(1)}`,
        `C${(start.x + direction * 34).toFixed(1)} ${(start.y - distanceY * 0.18).toFixed(1)}`,
        `${(start.x + direction * 46).toFixed(1)} ${(start.y - distanceY * 0.36).toFixed(1)}`,
        `${(start.x + direction * 30).toFixed(1)} ${(start.y - distanceY * 0.5).toFixed(1)}`,
        `C${(start.x + direction * 14).toFixed(1)} ${(start.y - distanceY * 0.64).toFixed(1)}`,
        `${(target.x - direction * 14).toFixed(1)} ${(target.y + 16).toFixed(1)}`,
        `${target.x.toFixed(1)} ${target.y.toFixed(1)}`,
    ].join(' ');
}

function MobileDiagram() {
    const containerRef = useRef(null);
    const coreRef = useRef(null);
    const nodeRefs = useRef([]);
    const [geometry, setGeometry] = useState({
        width: 1,
        height: 1,
        paths: [],
    });

    useLayoutEffect(() => {
        let animationFrameId = 0;
        let active = true;

        const measure = () => {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = window.requestAnimationFrame(() => {
                const container = containerRef.current;
                const core = coreRef.current;
                const nodes = nodeRefs.current;

                if (
                    !active ||
                    !container ||
                    !core ||
                    nodes.length !== areas.length ||
                    nodes.some((node) => !node)
                ) {
                    return;
                }

                const containerRect = container.getBoundingClientRect();
                const coreRect = relativeRect(core, containerRect);
                const paths = nodes.map((node, index) =>
                    buildMobileConnector(
                        index,
                        relativeRect(node, containerRect),
                        coreRect,
                    ),
                );

                setGeometry({
                    width: containerRect.width,
                    height: containerRect.height,
                    paths,
                });
            });
        };

        measure();

        const observer = new ResizeObserver(measure);
        [containerRef.current, coreRef.current, ...nodeRefs.current].forEach(
            (element) => {
                if (element) observer.observe(element);
            },
        );
        window.addEventListener('resize', measure);
        document.fonts?.ready.then(measure);

        return () => {
            active = false;
            window.cancelAnimationFrame(animationFrameId);
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="Las áreas desordenadas de la barbería convergen en Estilus"
            className="relative mx-auto mt-4 h-[44rem] w-full max-w-[620px] sm:mt-6 sm:h-[47rem] lg:hidden"
        >
            <svg
                aria-hidden="true"
                viewBox={`0 0 ${geometry.width} ${geometry.height}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
            >
                <defs>
                    <marker
                        id="estilus-arrow-mobile"
                        markerWidth="10"
                        markerHeight="10"
                        refX="8.5"
                        refY="5"
                        orient="auto"
                        markerUnits="userSpaceOnUse"
                    >
                        <path
                            d="M1 1L8.5 5L1 9"
                            fill="none"
                            className="stroke-brand-nav-bg"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </marker>
                </defs>

                {geometry.paths.map((path) => (
                    <path
                        key={path}
                        d={path}
                        fill="none"
                        className="stroke-brand-nav-bg"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        markerEnd="url(#estilus-arrow-mobile)"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
            </svg>

            {areas.map((area, index) => (
                <AreaNode
                    key={`mobile-${area.label}`}
                    area={area}
                    compact
                    elementRef={(element) => {
                        nodeRefs.current[index] = element;
                    }}
                />
            ))}
            <EstilusCore compact elementRef={coreRef} />
        </div>
    );
}

function CTAAction({ cta, className, children }) {
    if (cta.inertia) {
        return (
            <Link href={cta.href} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <a href={cta.href} className={className}>
            {children}
        </a>
    );
}

export default function CTASection({
    cta = {
        label: 'Probar gratis',
        href: '#',
        inertia: false,
    },
}) {
    return (
        <section
            aria-labelledby="estilus-cta-heading"
            className="px-6 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-12 lg:px-10 lg:pb-28 lg:pt-14 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="mx-auto max-w-4xl text-center">
                    <h2
                        id="estilus-cta-heading"
                        className="text-[2.1rem] leading-[1.02] text-brand-nav-bg sm:text-5xl lg:text-[3.65rem]"
                    >
                        Si querés ver cómo Estilus ordena tu barbería. probalo
                        gratis 2 semanas.
                    </h2>

                    <CTAAction
                        cta={cta}
                        className="group mt-7 inline-flex min-h-[52px] items-center justify-center rounded-brand-pill bg-brand-nav-bg px-7 text-sm font-semibold text-brand-bg shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-nav-bg focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary motion-reduce:transform-none motion-reduce:transition-none"
                    >
                        <span>{cta.label}</span>
                        <IconArrowRight
                            aria-hidden="true"
                            className="ml-2 h-4 w-4 text-brand-primary transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                            stroke={2.2}
                        />
                    </CTAAction>
                </div>

                <p className="sr-only">
                    Medios de pago, gestión de equipos, carga de cortes y
                    servicios, finanzas, caja y sucursales se ordenan en
                    Estilus.
                </p>

                <MobileDiagram />

                <div
                    role="img"
                    aria-label="Las áreas desordenadas de la barbería convergen en Estilus"
                    className="relative mx-auto mt-8 hidden h-[42rem] w-full max-w-[1200px] lg:block"
                >
                    <ArrowField
                        paths={desktopArrowPaths}
                        markerId="estilus-arrow-desktop"
                        viewBox="0 0 1200 680"
                    />
                    {areas.map((area) => (
                        <AreaNode
                            key={`desktop-${area.label}`}
                            area={area}
                        />
                    ))}
                    <EstilusCore />
                </div>
            </div>
        </section>
    );
}
