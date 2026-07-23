import {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { gsap } from 'gsap';

export const Card = forwardRef(function Card(
    { className = '', customClass = '', ...props },
    ref,
) {
    return (
        <article
            ref={ref}
            {...props}
            className={`absolute left-1/2 top-1/2 overflow-hidden rounded-[28px] border border-white/20 bg-brand-nav-bg shadow-brand-floating [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform ${customClass} ${className}`.trim()}
        />
    );
});

Card.displayName = 'Card';

const makeSlot = (position, distanceX, distanceY, total) => ({
    x: position * distanceX,
    y: -position * distanceY,
    z: -position * distanceX * 1.4,
    zIndex: total - position,
});

const placeCard = (element, slot, skewAmount) => {
    if (!element) return;

    gsap.set(element, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skewAmount,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true,
    });
};

const animationConfig = (easing) =>
    easing === 'elastic'
        ? {
              ease: 'elastic.out(0.72, 0.78)',
              moveDuration: 0.9,
              returnDuration: 0.82,
          }
        : {
              ease: 'power2.inOut',
              moveDuration: 0.66,
              returnDuration: 0.62,
          };

function ArrowIcon({ direction }) {
    const points =
        direction === 'previous' ? '14.5 5 8 12 14.5 19' : '9.5 5 16 12 9.5 19';

    return (
        <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
        >
            <polyline
                points={points}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            />
        </svg>
    );
}

function PlaybackIcon({ paused }) {
    if (paused) {
        return (
            <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    d="M8.5 6.75v10.5L17 12 8.5 6.75Z"
                    fill="currentColor"
                />
            </svg>
        );
    }

    return (
        <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <rect height="11" rx="1" width="3" x="7" y="6.5" />
            <rect height="11" rx="1" width="3" x="14" y="6.5" />
        </svg>
    );
}

export default function CardSwap({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    pauseOnHover = false,
    onCardClick,
    onActiveChange,
    skewAmount = 6,
    easing = 'elastic',
    labelledBy,
    controlsLabel = 'Seleccionar funcionalidad',
    className = '',
    children,
}) {
    const childArray = useMemo(
        () => Children.toArray(children).filter(isValidElement),
        [children],
    );
    const cardEntries = useMemo(
        () =>
            childArray.map((child, index) => ({
                child,
                key: String(child.key ?? `card-${index}`),
                label:
                    child.props['data-swap-label'] ??
                    `Funcionalidad ${index + 1}`,
            })),
        [childArray],
    );
    const cardKeys = useMemo(
        () => cardEntries.map((entry) => entry.key),
        [cardEntries],
    );
    const cardSignature = JSON.stringify(cardKeys);
    const [activeKey, setActiveKey] = useState(cardKeys[0] ?? null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

    const containerRef = useRef(null);
    const nodeMapRef = useRef(new Map());
    const refCallbacksRef = useRef(new Map());
    const orderRef = useRef([]);
    const activeKeyRef = useRef(cardKeys[0] ?? null);
    const timelineRef = useRef(null);
    const transitionVersionRef = useRef(0);
    const delayedCallRef = useRef(null);
    const pointerInsideRef = useRef(false);
    const focusInsideRef = useRef(false);
    const isInViewportRef = useRef(true);
    const autoplayPausedRef = useRef(false);
    const selectCardRef = useRef(() => {});
    const syncPlaybackRef = useRef(() => {});
    const onActiveChangeRef = useRef(onActiveChange);

    useEffect(() => {
        onActiveChangeRef.current = onActiveChange;
    }, [onActiveChange]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        const updatePreference = () =>
            setPrefersReducedMotion(mediaQuery.matches);

        updatePreference();
        mediaQuery.addEventListener?.('change', updatePreference);

        return () =>
            mediaQuery.removeEventListener?.('change', updatePreference);
    }, []);

    const getRefCallback = (key) => {
        if (!refCallbacksRef.current.has(key)) {
            refCallbacksRef.current.set(key, (node) => {
                if (node) nodeMapRef.current.set(key, node);
                else nodeMapRef.current.delete(key);
            });
        }

        return refCallbacksRef.current.get(key);
    };

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || cardKeys.length === 0) {
            orderRef.current = [];
            activeKeyRef.current = null;
            setActiveKey(null);
            return undefined;
        }

        const nodes = cardKeys
            .map((key) => nodeMapRef.current.get(key))
            .filter(Boolean);
        refCallbacksRef.current.forEach((_, key) => {
            if (!cardKeys.includes(key)) refCallbacksRef.current.delete(key);
        });
        const previousFront = orderRef.current[0];
        const previousFrontIndex = cardKeys.indexOf(previousFront);
        const initialOrder =
            previousFrontIndex >= 0
                ? [
                      ...cardKeys.slice(previousFrontIndex),
                      ...cardKeys.slice(0, previousFrontIndex),
                  ]
                : [...cardKeys];
        const config = animationConfig(easing);

        orderRef.current = initialOrder;
        activeKeyRef.current = initialOrder[0];
        setActiveKey(initialOrder[0]);

        const context = gsap.context(() => {
            initialOrder.forEach((key, position) => {
                placeCard(
                    nodeMapRef.current.get(key),
                    makeSlot(
                        position,
                        cardDistance,
                        verticalDistance,
                        initialOrder.length,
                    ),
                    skewAmount,
                );
            });
        }, container);

        const isPaused = () =>
            prefersReducedMotion ||
            autoplayPausedRef.current ||
            document.hidden ||
            !isInViewportRef.current ||
            focusInsideRef.current ||
            (pauseOnHover && pointerInsideRef.current);

        const clearScheduledSwap = () => {
            delayedCallRef.current?.kill();
            delayedCallRef.current = null;
        };

        const publishActiveCard = (key) => {
            const didChange = activeKeyRef.current !== key;
            activeKeyRef.current = key;
            setActiveKey(key);
            const index = cardKeys.indexOf(key);
            if (didChange && index >= 0) {
                onActiveChangeRef.current?.(index);
            }
        };

        let scheduleNextSwap = () => {};

        const beginTransition = (nextOrder) => {
            const transitionVersion = transitionVersionRef.current + 1;
            transitionVersionRef.current = transitionVersion;

            clearScheduledSwap();
            const previousTimeline = timelineRef.current;
            timelineRef.current = null;
            previousTimeline?.kill();

            orderRef.current = nextOrder;
            publishActiveCard(nextOrder[0]);

            return transitionVersion;
        };

        const finishAnimation = (transitionVersion) => {
            if (transitionVersion !== transitionVersionRef.current) return;

            timelineRef.current = null;
            scheduleNextSwap();
        };

        const animateToOrder = (nextOrder) => {
            const transitionVersion = beginTransition(nextOrder);

            if (prefersReducedMotion) {
                nextOrder.forEach((key, position) => {
                    placeCard(
                        nodeMapRef.current.get(key),
                        makeSlot(
                            position,
                            cardDistance,
                            verticalDistance,
                            nextOrder.length,
                        ),
                        skewAmount,
                    );
                });
                finishAnimation(transitionVersion);
                return;
            }

            const timeline = gsap.timeline({
                onComplete: () => finishAnimation(transitionVersion),
            });
            timelineRef.current = timeline;

            nextOrder.forEach((key, position) => {
                const node = nodeMapRef.current.get(key);
                const slot = makeSlot(
                    position,
                    cardDistance,
                    verticalDistance,
                    nextOrder.length,
                );

                timeline.set(node, { zIndex: slot.zIndex }, 0);
                timeline.to(
                    node,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: config.moveDuration,
                        ease: config.ease,
                        force3D: true,
                        overwrite: 'auto',
                    },
                    position * 0.035,
                );
            });
        };

        const swap = () => {
            const currentOrder = orderRef.current.filter((key) =>
                cardKeys.includes(key),
            );
            if (currentOrder.length < 2 || timelineRef.current) return;

            clearScheduledSwap();
            const [frontKey, ...rest] = currentOrder;
            const frontNode = nodeMapRef.current.get(frontKey);
            if (!frontNode) return;

            const nextOrder = [...rest, frontKey];
            const dropDistance =
                frontNode.getBoundingClientRect().height * 0.82 +
                verticalDistance * currentOrder.length;
            const backSlot = makeSlot(
                currentOrder.length - 1,
                cardDistance,
                verticalDistance,
                currentOrder.length,
            );
            const dropDuration = easing === 'elastic' ? 0.58 : 0.48;
            const returnStart = dropDuration + 0.04;
            const transitionVersion = beginTransition(nextOrder);
            const timeline = gsap.timeline({
                onComplete: () => finishAnimation(transitionVersion),
            });
            timelineRef.current = timeline;

            timeline.to(
                frontNode,
                {
                    y: dropDistance,
                    duration: dropDuration,
                    ease: 'power2.in',
                    force3D: true,
                    overwrite: 'auto',
                },
                0,
            );

            rest.forEach((key, position) => {
                const node = nodeMapRef.current.get(key);
                const slot = makeSlot(
                    position,
                    cardDistance,
                    verticalDistance,
                    currentOrder.length,
                );

                timeline.set(node, { zIndex: slot.zIndex }, 0.16);
                timeline.to(
                    node,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: config.moveDuration,
                        ease: config.ease,
                        force3D: true,
                        overwrite: 'auto',
                    },
                    0.16 + position * 0.04,
                );
            });

            timeline.set(
                frontNode,
                {
                    x: backSlot.x,
                    y: backSlot.y + dropDistance,
                    z: backSlot.z,
                    zIndex: backSlot.zIndex,
                },
                returnStart,
            );
            timeline.to(
                frontNode,
                {
                    y: backSlot.y,
                    duration: config.returnDuration,
                    ease: config.ease,
                    force3D: true,
                    overwrite: 'auto',
                },
                returnStart,
            );
        };

        scheduleNextSwap = () => {
            clearScheduledSwap();
            if (cardKeys.length < 2 || timelineRef.current || isPaused()) {
                return;
            }

            delayedCallRef.current = gsap.delayedCall(
                Math.max(delay, 1200) / 1000,
                swap,
            );
        };

        selectCardRef.current = (targetKey) => {
            const currentOrder = orderRef.current.filter((key) =>
                cardKeys.includes(key),
            );
            if (!currentOrder.includes(targetKey)) return;

            if (currentOrder[0] === targetKey) {
                clearScheduledSwap();
                if (!timelineRef.current) scheduleNextSwap();
                return;
            }

            const targetIndex = cardKeys.indexOf(targetKey);
            animateToOrder([
                ...cardKeys.slice(targetIndex),
                ...cardKeys.slice(0, targetIndex),
            ]);
        };

        syncPlaybackRef.current = () => {
            if (isPaused()) {
                clearScheduledSwap();
                timelineRef.current?.pause();
                return;
            }

            if (timelineRef.current) timelineRef.current.play();
            else scheduleNextSwap();
        };

        const handleVisibilityChange = () => syncPlaybackRef.current();
        let viewportObserver = null;
        if ('IntersectionObserver' in window) {
            isInViewportRef.current = false;
            viewportObserver = new IntersectionObserver(
                ([entry]) => {
                    isInViewportRef.current = entry.isIntersecting;
                    syncPlaybackRef.current();
                },
                { rootMargin: '120px 0px' },
            );
            viewportObserver.observe(container);
        } else {
            isInViewportRef.current = true;
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        scheduleNextSwap();

        return () => {
            transitionVersionRef.current += 1;
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            viewportObserver?.disconnect();
            isInViewportRef.current = true;
            clearScheduledSwap();
            timelineRef.current?.kill();
            timelineRef.current = null;
            gsap.killTweensOf(nodes);
            context.revert();
            selectCardRef.current = () => {};
            syncPlaybackRef.current = () => {};
        };
    }, [
        cardSignature,
        cardDistance,
        delay,
        easing,
        pauseOnHover,
        prefersReducedMotion,
        skewAmount,
        verticalDistance,
    ]);

    const chooseCard = (key) => {
        const index = cardKeys.indexOf(key);
        if (index < 0) return;

        onCardClick?.(index);
        selectCardRef.current(key);
    };
    const chooseRelativeCard = (offset) => {
        if (cardKeys.length < 2) return;
        const currentIndex = Math.max(
            0,
            cardKeys.indexOf(activeKeyRef.current),
        );
        const index =
            (currentIndex + offset + cardKeys.length) % cardKeys.length;
        chooseCard(cardKeys[index]);
    };
    const toggleAutoplay = () => {
        const nextPausedState = !autoplayPausedRef.current;
        autoplayPausedRef.current = nextPausedState;
        setIsAutoplayPaused(nextPausedState);
        syncPlaybackRef.current();
    };

    const handlePointerEnter = () => {
        pointerInsideRef.current = true;
        syncPlaybackRef.current();
    };
    const handlePointerLeave = () => {
        pointerInsideRef.current = false;
        syncPlaybackRef.current();
    };
    const handleFocus = () => {
        focusInsideRef.current = true;
        syncPlaybackRef.current();
    };
    const handleBlur = (event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        focusInsideRef.current = false;
        syncPlaybackRef.current();
    };

    const renderedCards = cardEntries.map(({ child, key }) =>
        cloneElement(child, {
            key,
            ref: getRefCallback(key),
            'aria-hidden': key !== activeKey,
            style: {
                width,
                height,
                ...(child.props.style ?? {}),
            },
        }),
    );

    return (
        <div
            ref={containerRef}
            role="region"
            aria-label={labelledBy ? undefined : 'Funcionalidades de Estilus'}
            aria-labelledby={labelledBy}
            aria-roledescription="carrusel"
            className={`relative isolate overflow-visible [perspective:1200px] ${className}`.trim()}
            style={{ width, height }}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onFocusCapture={handleFocus}
            onBlurCapture={handleBlur}
        >
            {renderedCards}

            {cardEntries.length > 1 && (
                <nav
                    aria-label={controlsLabel}
                    className="absolute -bottom-[68px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-brand-pill border border-brand-border/80 bg-brand-surface/95 p-1.5 text-brand-text shadow-brand-card backdrop-blur-md"
                >
                    <button
                        type="button"
                        aria-label="Funcionalidad anterior"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary motion-reduce:transition-none"
                        onClick={() => chooseRelativeCard(-1)}
                    >
                        <ArrowIcon direction="previous" />
                    </button>

                    {cardEntries.map(({ key, label }) => {
                        const isActive = key === activeKey;

                        return (
                            <button
                                key={key}
                                type="button"
                                aria-label={`Mostrar ${label}`}
                                aria-current={isActive ? 'true' : undefined}
                                className="group inline-flex h-9 w-8 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                onClick={() => chooseCard(key)}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`h-2 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none ${
                                        isActive
                                            ? 'w-5 bg-brand-primary'
                                            : 'w-2 bg-brand-border group-hover:bg-brand-secondary'
                                    }`}
                                />
                            </button>
                        );
                    })}

                    {!prefersReducedMotion && (
                        <button
                            type="button"
                            aria-label={
                                isAutoplayPaused
                                    ? 'Reanudar rotación automática'
                                    : 'Pausar rotación automática'
                            }
                            aria-pressed={isAutoplayPaused}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary motion-reduce:transition-none"
                            onClick={toggleAutoplay}
                        >
                            <PlaybackIcon paused={isAutoplayPaused} />
                        </button>
                    )}

                    <button
                        type="button"
                        aria-label="Funcionalidad siguiente"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary motion-reduce:transition-none"
                        onClick={() => chooseRelativeCard(1)}
                    >
                        <ArrowIcon direction="next" />
                    </button>
                </nav>
            )}
        </div>
    );
}
