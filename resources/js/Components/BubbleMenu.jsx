import { gsap } from 'gsap';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function BubbleMenu({
    logo,
    homeHref = '#inicio',
    logoAriaLabel = 'Ir al inicio',
    onMenuClick,
    className = '',
    style,
    menuAriaLabel = 'Abrir menú de navegación',
    menuBg = '#48D5FC',
    menuContentColor = '#242726',
    itemBg = '#FFFFFF',
    itemHoverBg = '#48D5FC',
    itemContentColor = '#242726',
    actions = [],
    useFixedPosition = false,
    items = [],
    animationEase = 'back.out(1.35)',
    animationDuration = 0.42,
    staggerDelay = 0.07,
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const overlayRef = useRef(null);
    const backdropRef = useRef(null);
    const logoRef = useRef(null);
    const menuButtonRef = useRef(null);
    const actionRefs = useRef([]);
    const bubblesRef = useRef([]);
    const labelRefs = useRef([]);
    const linkRefs = useRef([]);
    const timelineRef = useRef(null);
    const menuOpenRef = useRef(false);
    const returnFocusRef = useRef(false);

    const finishClosing = useCallback(() => {
        if (menuOpenRef.current) {
            return;
        }

        setShowOverlay(false);

        if (returnFocusRef.current) {
            menuButtonRef.current?.focus();
            returnFocusRef.current = false;
        }
    }, []);

    const openMenu = useCallback(() => {
        menuOpenRef.current = true;
        setShowOverlay(true);
        setIsMenuOpen(true);
        onMenuClick?.(true);
    }, [onMenuClick]);

    const closeMenu = useCallback(
        (returnFocus = false) => {
            menuOpenRef.current = false;
            returnFocusRef.current = returnFocus;
            setIsMenuOpen(false);
            onMenuClick?.(false);
        },
        [onMenuClick],
    );

    const handleToggle = () => {
        if (isMenuOpen) {
            closeMenu();
            return;
        }

        openMenu();
    };

    useEffect(() => {
        if (!showOverlay) {
            return undefined;
        }

        const overlay = overlayRef.current;
        const backdrop = backdropRef.current;
        const bubbles = bubblesRef.current.filter(Boolean);
        const labels = labelRefs.current.filter(Boolean);

        if (!overlay || bubbles.length === 0) {
            return undefined;
        }

        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        timelineRef.current?.kill();
        gsap.killTweensOf([...bubbles, ...labels, backdrop].filter(Boolean));
        gsap.set(overlay, { display: 'flex' });

        let focusTimer = null;

        if (isMenuOpen) {
            if (reduceMotion) {
                gsap.set(backdrop, { autoAlpha: 1 });
                gsap.set(bubbles, { scale: 1, transformOrigin: '50% 50%' });
                gsap.set(labels, { y: 0, autoAlpha: 1 });
            } else {
                gsap.set(backdrop, { autoAlpha: 0 });
                gsap.set(bubbles, {
                    scale: 0,
                    transformOrigin: '50% 50%',
                });
                gsap.set(labels, { y: 20, autoAlpha: 0 });

                const timeline = gsap.timeline();
                timeline.to(
                    backdrop,
                    {
                        autoAlpha: 1,
                        duration: 0.3,
                        ease: 'power2.out',
                    },
                    0,
                );
                timeline.to(
                    bubbles,
                    {
                        scale: 1,
                        duration: animationDuration,
                        ease: animationEase,
                        stagger: staggerDelay,
                    },
                    0,
                );
                timeline.to(
                    labels,
                    {
                        y: 0,
                        autoAlpha: 1,
                        duration: animationDuration,
                        ease: 'power3.out',
                        stagger: staggerDelay,
                    },
                    animationDuration * 0.12,
                );
                timelineRef.current = timeline;
            }

            focusTimer = window.setTimeout(
                () => linkRefs.current[0]?.focus(),
                reduceMotion ? 0 : 120,
            );
        } else if (reduceMotion) {
            gsap.set(backdrop, { autoAlpha: 0 });
            gsap.set(overlay, { display: 'none' });
            finishClosing();
        } else {
            const timeline = gsap.timeline({ onComplete: finishClosing });
            timeline.to(
                backdrop,
                {
                    autoAlpha: 0,
                    duration: 0.2,
                    ease: 'power2.in',
                },
                0,
            );
            timeline.to(labels, {
                y: 20,
                autoAlpha: 0,
                duration: 0.18,
                ease: 'power3.in',
            });
            timeline.to(
                bubbles,
                {
                    scale: 0,
                    duration: 0.2,
                    ease: 'power3.in',
                },
                0.03,
            );
            timelineRef.current = timeline;
        }

        return () => {
            if (focusTimer !== null) {
                window.clearTimeout(focusTimer);
            }

            timelineRef.current?.kill();
            timelineRef.current = null;
        };
    }, [
        animationDuration,
        animationEase,
        finishClosing,
        isMenuOpen,
        showOverlay,
        staggerDelay,
    ]);

    useEffect(() => {
        if (!isMenuOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';

        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu(true);
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusableElements = [
                logoRef.current,
                ...actionRefs.current,
                menuButtonRef.current,
                ...linkRefs.current,
            ].filter(Boolean);
            const firstElement = focusableElements[0];
            const lastElement =
                focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement?.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [closeMenu, isMenuOpen]);

    useEffect(
        () => () => {
            menuOpenRef.current = false;
            timelineRef.current?.kill();
            gsap.killTweensOf([
                ...bubblesRef.current.filter(Boolean),
                ...labelRefs.current.filter(Boolean),
                backdropRef.current,
            ].filter(Boolean));
        },
        [],
    );

    const containerClassName = [
        'bubble-menu',
        useFixedPosition ? 'fixed' : 'absolute',
        'left-0 right-0 top-4 sm:top-5',
        'flex items-center justify-between',
        'gap-2 px-3 sm:gap-4 sm:px-8 xl:px-12',
        'pointer-events-none',
        'z-[1001]',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <nav
                className={containerClassName}
                style={style}
                aria-label="Navegación principal"
            >
                <a
                    ref={logoRef}
                    href={homeHref}
                    aria-label={logoAriaLabel}
                    onClick={() => closeMenu()}
                    className="bubble-menu-logo pointer-events-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-full px-3.5 text-brand-text shadow-brand-floating transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:h-16 sm:px-6"
                    style={{
                        backgroundColor: menuBg,
                        color: menuContentColor,
                    }}
                >
                    {typeof logo === 'string' ? (
                        <img
                            src={logo}
                            alt=""
                            className="block h-7 w-auto object-contain sm:h-9"
                        />
                    ) : (
                        logo
                    )}
                </a>

                <div className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-1 sm:gap-2">
                    {actions.map((action, index) => (
                        <a
                            key={action.href}
                            ref={(element) => {
                                actionRefs.current[index] = element;
                            }}
                            href={action.href}
                            aria-label={action.ariaLabel || action.label}
                            onClick={() => closeMenu()}
                            className={[
                                'inline-flex h-[52px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-xs font-bold shadow-brand-floating transition-all duration-200',
                                'hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none',
                                'sm:h-16 sm:px-5 sm:text-sm',
                                action.primary
                                    ? 'bg-brand-primary text-brand-on-primary hover:bg-brand-primary-hover'
                                    : 'border border-brand-border bg-white text-brand-text hover:border-brand-primary-muted hover:bg-brand-bg',
                            ].join(' ')}
                        >
                            {action.label}
                        </a>
                    ))}
                </div>

                <button
                    ref={menuButtonRef}
                    type="button"
                    className="pointer-events-auto inline-flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full border-0 p-0 shadow-brand-floating transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:h-16 sm:w-16"
                    onClick={handleToggle}
                    aria-label={isMenuOpen ? 'Cerrar menú' : menuAriaLabel}
                    aria-controls="bubble-menu-items"
                    aria-expanded={isMenuOpen}
                    style={{
                        backgroundColor: menuBg,
                        color: menuContentColor,
                    }}
                >
                    <span aria-hidden="true" className="relative h-[10px] w-[27px]">
                        <span
                            className="menu-line absolute left-0 top-0 block h-0.5 w-[27px] rounded-sm bg-current"
                            style={{
                                transform: isMenuOpen
                                    ? 'translateY(4px) rotate(45deg)'
                                    : 'none',
                            }}
                        />
                        <span
                            className="menu-line absolute bottom-0 left-0 block h-0.5 w-[27px] rounded-sm bg-current"
                            style={{
                                transform: isMenuOpen
                                    ? 'translateY(-4px) rotate(-45deg)'
                                    : 'none',
                            }}
                        />
                    </span>
                </button>
            </nav>

            {showOverlay && (
                <div
                    id="bubble-menu-items"
                    ref={overlayRef}
                    className={[
                        'bubble-menu-items fixed inset-0 z-[1000] hidden items-center justify-center overflow-y-auto overscroll-contain',
                        isMenuOpen
                            ? 'pointer-events-auto'
                            : 'pointer-events-none',
                    ].join(' ')}
                    aria-hidden={!isMenuOpen}
                    onPointerDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeMenu(true);
                        }
                    }}
                >
                    <div
                        ref={backdropRef}
                        aria-hidden="true"
                        className="bubble-menu-backdrop absolute inset-0"
                        onPointerDown={() => closeMenu(true)}
                    />
                    <ul
                        className="pill-list relative z-10 m-0 mx-auto flex w-full max-w-[1600px] list-none flex-wrap gap-x-0 gap-y-1 px-6"
                        aria-label="Secciones de la landing"
                        onPointerDown={(event) => event.stopPropagation()}
                    >
                        {items.map((item, index) => (
                            <li
                                key={item.href}
                                className="pill-col box-border flex items-stretch justify-center"
                            >
                                <div
                                    ref={(element) => {
                                        bubblesRef.current[index] = element;
                                    }}
                                    className="bubble-menu-motion w-full will-change-transform"
                                >
                                    <a
                                        ref={(element) => {
                                            linkRefs.current[index] = element;
                                        }}
                                        href={item.href}
                                        aria-label={
                                            item.ariaLabel || item.label
                                        }
                                        tabIndex={isMenuOpen ? undefined : -1}
                                        onClick={() => closeMenu()}
                                        className="pill-link relative flex w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-full no-underline shadow-brand-floating outline-none"
                                        style={{
                                            '--item-rot': `${item.rotation ?? 0}deg`,
                                            '--pill-bg':
                                                item.bgColor || itemBg,
                                            '--pill-color':
                                                item.textColor ||
                                                itemContentColor,
                                            '--hover-bg':
                                                item.hoverStyles?.bgColor ||
                                                itemHoverBg,
                                            '--hover-color':
                                                item.hoverStyles?.textColor ||
                                                itemContentColor,
                                        }}
                                    >
                                        <span
                                            ref={(element) => {
                                                labelRefs.current[index] =
                                                    element;
                                            }}
                                            className="pill-label inline-block font-display font-bold tracking-[-0.04em] will-change-[transform,opacity]"
                                        >
                                            {item.label}
                                        </span>
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}
