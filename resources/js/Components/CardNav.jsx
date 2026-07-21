import { Link } from '@inertiajs/react';
import { IconArrowUpRight } from '@tabler/icons-react';
import { gsap } from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

function NavAction({ href, inertia = false, children, ...props }) {
    const Component = inertia ? Link : 'a';
    return (
        <Component href={href} {...props}>
            {children}
        </Component>
    );
}

export default function CardNav({
    logo,
    logoAlt = 'Logo',
    homeHref = '#inicio',
    items = [],
    cta,
    className = '',
    ease = 'power3.out',
    baseColor = '#F8FAFA',
    menuColor = '#242726',
    buttonBgColor = '#48D5FC',
    buttonTextColor = '#242726',
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isContentVisible, setIsContentVisible] = useState(false);
    const containerRef = useRef(null);
    const isOpenRef = useRef(false);
    const menuButtonRef = useRef(null);
    const navRef = useRef(null);
    const cardsRef = useRef([]);
    const reduceMotionRef = useRef(false);
    const timelineRef = useRef(null);

    const calculateHeight = useCallback(() => {
        const navElement = navRef.current;
        if (!navElement) return 260;
        if (!window.matchMedia('(max-width: 767px)').matches) return 260;

        const contentElement = navElement.querySelector('.card-nav-content');
        if (!contentElement) return 260;

        const previousStyles = {
            height: contentElement.style.height,
            pointerEvents: contentElement.style.pointerEvents,
            position: contentElement.style.position,
            visibility: contentElement.style.visibility,
        };

        Object.assign(contentElement.style, {
            visibility: 'visible',
            pointerEvents: 'auto',
            position: 'static',
            height: 'auto',
        });
        const contentHeight = contentElement.scrollHeight;
        Object.assign(contentElement.style, previousStyles);

        return 60 + contentHeight + 8;
    }, []);

    const createTimeline = useCallback(() => {
        const navElement = navRef.current;
        if (!navElement) return null;

        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        reduceMotionRef.current = reduceMotion;
        const duration = reduceMotion ? 0 : 0.4;

        gsap.set(navElement, { height: 60, overflow: 'hidden' });
        gsap.set(cardsRef.current, { y: reduceMotion ? 0 : 50, opacity: 0 });

        return gsap
            .timeline({ paused: true })
            .to(navElement, { height: calculateHeight, duration, ease })
            .to(
                cardsRef.current,
                {
                    y: 0,
                    opacity: 1,
                    duration,
                    ease,
                    stagger: reduceMotion ? 0 : 0.08,
                },
                reduceMotion ? 0 : '-=0.1',
            );
    }, [calculateHeight, ease]);

    const applyExpandedState = useCallback(
        (timeline) => {
            if (!timeline) return;
            if (reduceMotionRef.current) {
                timeline.pause(0);
                gsap.set(navRef.current, { height: calculateHeight() });
                gsap.set(cardsRef.current, { y: 0, opacity: 1 });
                return;
            }
            timeline.progress(1);
        },
        [calculateHeight],
    );

    const finishClosing = useCallback((returnFocus = false) => {
        setIsContentVisible(false);
        if (returnFocus) menuButtonRef.current?.focus();
    }, []);

    const closeMenu = useCallback(
        (returnFocus = false) => {
            const timeline = timelineRef.current;
            if (!timeline || !isOpenRef.current) return;

            isOpenRef.current = false;
            setIsExpanded(false);

            if (reduceMotionRef.current || timeline.progress() === 0) {
                timeline.pause(0);
                gsap.set(navRef.current, { height: 60 });
                gsap.set(cardsRef.current, { y: 0, opacity: 0 });
                finishClosing(returnFocus);
                return;
            }

            timeline.eventCallback('onReverseComplete', () =>
                finishClosing(returnFocus),
            );
            timeline.reverse();
        },
        [finishClosing],
    );

    const toggleMenu = () => {
        const timeline = timelineRef.current;
        if (!timeline) return;
        if (isOpenRef.current) {
            closeMenu();
            return;
        }

        isOpenRef.current = true;
        setIsExpanded(true);
        setIsContentVisible(true);
        timeline.eventCallback('onReverseComplete', null);
        if (reduceMotionRef.current) applyExpandedState(timeline);
        else timeline.play();
    };

    useLayoutEffect(() => {
        cardsRef.current = cardsRef.current.slice(0, items.length);
        const timeline = createTimeline();
        if (isOpenRef.current) applyExpandedState(timeline);
        else setIsContentVisible(false);
        timelineRef.current = timeline;

        return () => {
            timeline?.kill();
            timelineRef.current = null;
        };
    }, [applyExpandedState, createTimeline, items]);

    useLayoutEffect(() => {
        const handleResize = () => {
            timelineRef.current?.kill();
            const timeline = createTimeline();
            if (isOpenRef.current) applyExpandedState(timeline);
            else setIsContentVisible(false);
            timelineRef.current = timeline;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [applyExpandedState, createTimeline]);

    useEffect(() => {
        if (!isContentVisible) return undefined;

        const handlePointerDown = (event) => {
            if (!containerRef.current?.contains(event.target)) closeMenu();
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') closeMenu(true);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [closeMenu, isContentVisible]);

    const renderLogo = () =>
        typeof logo === 'string' ? (
            <img src={logo} alt={logoAlt} className="h-8 w-auto" />
        ) : (
            logo
        );

    return (
        <header
            ref={containerRef}
            className={`card-nav-container sticky top-0 z-50 h-[76px] px-4 pt-4 sm:px-5 ${className}`}
        >
            <nav
                ref={navRef}
                aria-label="Navegación principal"
                className={`card-nav relative mx-auto block h-[60px] max-h-[calc(100svh-32px)] max-w-[920px] overflow-hidden rounded-brand-lg border border-brand-border/80 shadow-brand-floating backdrop-blur-md will-change-[height] ${isExpanded ? 'open' : ''}`}
                style={{ backgroundColor: baseColor }}
            >
                <div className="absolute inset-x-0 top-0 z-[2] flex h-[60px] items-center justify-between p-2 pl-3 sm:pl-[1.1rem]">
                    <button
                        ref={menuButtonRef}
                        type="button"
                        className="order-2 inline-flex h-11 w-11 flex-col items-center justify-center gap-[6px] rounded-brand-pill transition-colors hover:bg-brand-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 md:order-none"
                        onClick={toggleMenu}
                        aria-label={isExpanded ? 'Cerrar menú' : 'Abrir menú'}
                        aria-controls="card-nav-content"
                        aria-expanded={isExpanded}
                        style={{ color: menuColor }}
                    >
                        <span
                            aria-hidden="true"
                            className={`h-0.5 w-[27px] bg-current transition-transform duration-300 motion-reduce:transition-none ${isExpanded ? 'translate-y-1 rotate-45' : ''}`}
                        />
                        <span
                            aria-hidden="true"
                            className={`h-0.5 w-[27px] bg-current transition-transform duration-300 motion-reduce:transition-none ${isExpanded ? '-translate-y-1 -rotate-45' : ''}`}
                        />
                    </button>

                    <NavAction
                        href={homeHref}
                        aria-label={logoAlt}
                        className="order-1 inline-flex min-h-11 items-center rounded-brand-pill px-1 text-brand-text transition-colors hover:text-brand-link focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 md:absolute md:left-1/2 md:top-1/2 md:order-none md:-translate-x-1/2 md:-translate-y-1/2"
                        onClick={() => closeMenu()}
                    >
                        {renderLogo()}
                    </NavAction>

                    {cta && (
                        <NavAction
                            href={cta.href}
                            inertia={cta.inertia}
                            className="hidden h-11 items-center justify-center rounded-brand-pill px-5 text-sm font-bold shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none md:inline-flex"
                            onClick={() => closeMenu()}
                            style={{
                                backgroundColor: buttonBgColor,
                                color: buttonTextColor,
                            }}
                        >
                            {cta.label}
                        </NavAction>
                    )}
                </div>

                <div
                    id="card-nav-content"
                    className={`card-nav-content absolute inset-x-0 bottom-0 top-[60px] z-[1] flex flex-col items-stretch justify-start gap-2 overflow-y-auto p-2 md:flex-row md:items-end md:gap-3 md:overflow-hidden ${isContentVisible ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
                    aria-hidden={!isContentVisible}
                >
                    {items.slice(0, 3).map((item, index) => (
                        <div
                            key={item.label}
                            ref={(element) => {
                                cardsRef.current[index] = element;
                            }}
                            className="relative flex h-auto min-h-[104px] min-w-0 flex-[1_1_auto] select-none flex-col gap-2 rounded-brand-md p-4 md:h-full md:min-h-0 md:flex-[1_1_0%]"
                            style={{
                                backgroundColor: item.bgColor,
                                color: item.textColor,
                            }}
                        >
                            <p className="font-display text-lg font-bold tracking-[-0.025em] md:text-[1.35rem]">
                                {item.label}
                            </p>
                            <div className="mt-auto flex flex-col gap-0.5">
                                {item.links?.map((link) => (
                                    <NavAction
                                        key={`${link.label}-${link.href}`}
                                        href={link.href}
                                        inertia={link.inertia}
                                        aria-label={link.ariaLabel}
                                        className="group inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium no-underline hover:underline hover:underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:text-[15px]"
                                        onClick={() => closeMenu()}
                                    >
                                        <IconArrowUpRight
                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                                            stroke={2}
                                            aria-hidden="true"
                                        />
                                        <span>{link.label}</span>
                                    </NavAction>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>
        </header>
    );
}
