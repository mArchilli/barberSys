import { IconBrandWhatsapp } from '@tabler/icons-react';

export default function WhatsAppButton({
    href = 'https://wa.me/',
    label = 'Hablar por WhatsApp',
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-brand-primary/20 bg-brand-primary text-brand-surface shadow-brand-floating transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg motion-reduce:transform-none motion-reduce:transition-none sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        >
            <IconBrandWhatsapp className="h-6 w-6 sm:h-7 sm:w-7" stroke={2.2} />
        </a>
    );
}
