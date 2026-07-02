import { IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react';

const socialBaseClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-text-secondary shadow-brand-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary-muted hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none';

export default function FooterSection({
    whatsappHref = 'https://wa.me/',
    instagramHref = '#',
}) {
    return (
        <footer className="px-6 pb-10 pt-6 sm:px-8 sm:pb-12 lg:px-10 xl:px-12">
            <div className="mx-auto w-full max-w-[1440px] border-t border-brand-border-subtle pt-8 sm:pt-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-display text-2xl font-bold tracking-[-0.04em] text-brand-text sm:text-[2rem]">
                        Pelito. Gestion para tu barberia.
                    </p>

                    <div className="flex items-center gap-3">
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="WhatsApp de Pelito"
                            className={socialBaseClass}
                        >
                            <IconBrandWhatsapp className="h-5 w-5" stroke={2.1} />
                        </a>
                        <a
                            href={instagramHref}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Instagram de Pelito"
                            className={socialBaseClass}
                        >
                            <IconBrandInstagram className="h-5 w-5" stroke={2.1} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
