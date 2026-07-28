import { useEffect, useState } from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';

export default function WhatsAppButton({
    href = 'https://wa.me/',
    label = 'Hablar por WhatsApp',
}) {
    const [hasScrolled, setHasScrolled] = useState(false);
    const [isHintVisible, setIsHintVisible] = useState(false);

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

    return (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-[260px] flex-col items-end gap-2 md:bottom-6 md:right-6 md:max-w-[320px] md:gap-3">
            <div
                className={[
                    'pointer-events-none relative rounded-[22px] border border-brand-border bg-brand-surface px-4 py-3 text-sm leading-6 text-brand-text shadow-brand-card transition-all duration-300',
                    isHintVisible
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
