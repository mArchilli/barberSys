import { useEffect, useState } from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';

export default function WhatsAppButton({
    href = 'https://wa.me/',
    label = 'Hablar por WhatsApp',
    suppressHintWithin = null,
    hideWithin = null,
}) {
    const [hasScrolled, setHasScrolled] = useState(false);
    const [isHintVisible, setIsHintVisible] = useState(false);
    const [isHintSuppressed, setIsHintSuppressed] = useState(false);
    const [isHiddenWithin, setIsHiddenWithin] = useState(false);

    useEffect(() => {
        const updateScrollState = () => {
            setHasScrolled(window.scrollY > 8);
        };

        updateScrollState();
        window.addEventListener('scroll', updateScrollState, {
            passive: true,
        });

        return () => window.removeEventListener('scroll', updateScrollState);
    }, []);

    useEffect(() => {
        if (!hasScrolled) {
            setIsHintVisible(false);
            return undefined;
        }

        setIsHintVisible(true);

        const hideTimeoutId = window.setTimeout(() => {
            setIsHintVisible(false);
        }, 3000);

        return () => {
            window.clearTimeout(hideTimeoutId);
        };
    }, [hasScrolled]);

    useEffect(() => {
        if (!suppressHintWithin) return undefined;

        const clearZone = document.querySelector(suppressHintWithin);
        if (!clearZone || typeof IntersectionObserver === 'undefined') {
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => setIsHintSuppressed(entry.isIntersecting),
            {
                rootMargin: '-76px 0px 0px 0px',
                threshold: 0,
            },
        );

        observer.observe(clearZone);

        return () => observer.disconnect();
    }, [suppressHintWithin]);

    useEffect(() => {
        if (!hideWithin || typeof IntersectionObserver === 'undefined') {
            return undefined;
        }

        const hiddenZones = Array.from(document.querySelectorAll(hideWithin));

        if (hiddenZones.length === 0) {
            return undefined;
        }

        const visibleZones = new Set();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        visibleZones.add(entry.target);
                    } else {
                        visibleZones.delete(entry.target);
                    }
                });

                setIsHiddenWithin(visibleZones.size > 0);
            },
            {
                rootMargin: '-76px 0px 0px 0px',
                threshold: 0,
            },
        );

        hiddenZones.forEach((zone) => observer.observe(zone));

        return () => observer.disconnect();
    }, [hideWithin]);

    return (
        <div
            aria-hidden={isHiddenWithin ? 'true' : undefined}
            className={[
                'fixed bottom-4 right-4 z-50 flex max-w-[260px] flex-col items-end gap-2 transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none md:bottom-6 md:right-6 md:max-w-[320px] md:gap-3',
                isHiddenWithin
                    ? 'pointer-events-none invisible translate-y-2 opacity-0'
                    : 'visible translate-y-0 opacity-100',
            ].join(' ')}
        >
            <div
                className={[
                    'pointer-events-none relative rounded-[22px] border border-brand-border bg-brand-surface px-4 py-3 text-sm leading-6 text-brand-text shadow-brand-card transition-all duration-300',
                    isHintVisible && !isHintSuppressed
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2 opacity-0',
                ].join(' ')}
            >
                Tenes alguna duda? Mandanos mensaje y te respondemos a la
                brevedad.
                <div className="absolute -bottom-2 right-5 h-4 w-4 rotate-45 border-b border-r border-brand-border bg-brand-surface" />
            </div>

            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                tabIndex={isHiddenWithin ? -1 : undefined}
                className={[
                    'inline-flex h-14 w-14 items-center justify-center rounded-full border text-brand-on-primary shadow-brand-floating transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg motion-reduce:transform-none motion-reduce:transition-none md:h-16 md:w-16',
                    hasScrolled
                        ? 'border-brand-primary/20 bg-brand-primary hover:bg-brand-primary-hover'
                        : 'border-white/80 bg-brand-surface hover:bg-brand-surface-alt',
                ].join(' ')}
            >
                <IconBrandWhatsapp className="h-7 w-7" stroke={2.2} />
            </a>
        </div>
    );
}
