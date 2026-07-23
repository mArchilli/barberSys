import { useEffect, useId, useMemo, useRef, useState } from 'react';

function wrapOffset(value, spacing) {
    if (!spacing) return value;

    let nextValue = value;
    while (nextValue <= -spacing) nextValue += spacing;
    while (nextValue > 0) nextValue -= spacing;

    return nextValue;
}

export default function CurvedLoop({
    marqueeText = '',
    speed = 2,
    className = '',
    curveAmount = 400,
    direction = 'left',
    interactive = true,
}) {
    const text = useMemo(() => {
        const normalizedText = marqueeText.replace(/\s+$/, '');
        return `${normalizedText}\u00A0`;
    }, [marqueeText]);
    const measureRef = useRef(null);
    const textPathRef = useRef(null);
    const dragRef = useRef(false);
    const lastXRef = useRef(0);
    const directionRef = useRef(direction);
    const velocityRef = useRef(0);
    const [spacing, setSpacing] = useState(0);
    const [initialOffset, setInitialOffset] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);
    const pathId = `curve-${useId().replaceAll(':', '')}`;
    const pathD = `M-100,55 Q720,${55 + curveAmount} 1540,55`;
    const ready = spacing > 0;
    const totalText = ready
        ? Array(Math.ceil(2000 / spacing) + 2)
              .fill(text)
              .join('')
        : text;
    const canDrag = interactive && !reduceMotion;

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        const updateMotionPreference = () =>
            setReduceMotion(mediaQuery.matches);

        updateMotionPreference();
        mediaQuery.addEventListener('change', updateMotionPreference);

        return () =>
            mediaQuery.removeEventListener('change', updateMotionPreference);
    }, []);

    useEffect(() => {
        let active = true;

        const measureText = () => {
            if (!active || !measureRef.current) return;
            setSpacing(measureRef.current.getComputedTextLength());
        };

        measureText();
        document.fonts?.ready.then(measureText);

        return () => {
            active = false;
        };
    }, [className, text]);

    useEffect(() => {
        if (!spacing || !textPathRef.current) return;

        const nextOffset = -spacing;
        textPathRef.current.setAttribute('startOffset', `${nextOffset}px`);
        setInitialOffset(nextOffset);
    }, [spacing]);

    useEffect(() => {
        if (!ready || reduceMotion) return undefined;

        let animationFrameId = 0;
        let previousTimestamp = 0;

        const animate = (timestamp) => {
            if (!dragRef.current && textPathRef.current) {
                const elapsedFrames = previousTimestamp
                    ? Math.min((timestamp - previousTimestamp) / 16.67, 3)
                    : 1;
                const delta =
                    (directionRef.current === 'right' ? speed : -speed) *
                    elapsedFrames;
                const currentOffset = Number.parseFloat(
                    textPathRef.current.getAttribute('startOffset') || '0',
                );
                const nextOffset = wrapOffset(
                    currentOffset + delta,
                    spacing,
                );

                textPathRef.current.setAttribute(
                    'startOffset',
                    `${nextOffset}px`,
                );
            }

            previousTimestamp = timestamp;
            animationFrameId = window.requestAnimationFrame(animate);
        };

        animationFrameId = window.requestAnimationFrame(animate);

        return () => window.cancelAnimationFrame(animationFrameId);
    }, [ready, reduceMotion, spacing, speed]);

    const handlePointerDown = (event) => {
        if (!canDrag) return;

        dragRef.current = true;
        lastXRef.current = event.clientX;
        velocityRef.current = 0;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event) => {
        if (!canDrag || !dragRef.current || !textPathRef.current) return;

        const deltaX = event.clientX - lastXRef.current;
        const currentOffset = Number.parseFloat(
            textPathRef.current.getAttribute('startOffset') || '0',
        );
        const nextOffset = wrapOffset(currentOffset + deltaX, spacing);

        lastXRef.current = event.clientX;
        velocityRef.current = deltaX;
        textPathRef.current.setAttribute('startOffset', `${nextOffset}px`);
    };

    const endDrag = (event) => {
        if (!canDrag || !dragRef.current) return;

        dragRef.current = false;
        if (velocityRef.current !== 0) {
            directionRef.current =
                velocityRef.current > 0 ? 'right' : 'left';
        }
        event.currentTarget.style.cursor = 'grab';
    };

    return (
        <div
            aria-hidden="true"
            className="flex w-full items-center justify-center overflow-hidden"
            style={{
                visibility: ready ? 'visible' : 'hidden',
                cursor: canDrag ? 'grab' : 'auto',
                touchAction: canDrag ? 'pan-y' : 'auto',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
        >
            <svg
                className="block aspect-[100/15] w-[180%] max-w-none shrink-0 select-none overflow-visible text-[6rem] font-bold uppercase leading-none sm:w-[140%] lg:w-full"
                viewBox="0 0 1440 220"
                preserveAspectRatio="xMidYMid meet"
            >
                <text
                    ref={measureRef}
                    xmlSpace="preserve"
                    className={className}
                    style={{
                        visibility: 'hidden',
                        opacity: 0,
                        pointerEvents: 'none',
                    }}
                >
                    {text}
                </text>

                <defs>
                    <path
                        id={pathId}
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                    />
                </defs>

                {ready && (
                    <text
                        xmlSpace="preserve"
                        className={`fill-current ${className}`}
                    >
                        <textPath
                            ref={textPathRef}
                            href={`#${pathId}`}
                            startOffset={`${initialOffset}px`}
                            xmlSpace="preserve"
                        >
                            {totalText}
                        </textPath>
                    </text>
                )}
            </svg>
        </div>
    );
}
