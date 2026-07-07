import { IconArrowRight, IconBrandWhatsapp } from '@tabler/icons-react';

export default function CTASection({
    cta = {
        label: 'Hablar por WhatsApp',
        href: 'https://wa.me/',
    },
}) {
    const ctaButtonClasses =
        'inline-flex min-h-[52px] items-center justify-center rounded-brand-pill bg-brand-primary px-7 text-sm font-bold text-brand-on-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-surface focus-visible:ring-offset-2 focus-visible:ring-offset-brand-nav-bg motion-reduce:transform-none motion-reduce:transition-none';

    return (
        <section className="px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12">
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="overflow-hidden rounded-[28px] border border-brand-nav-bg bg-brand-nav-bg shadow-brand-floating">
                    <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-stretch lg:px-12 lg:py-12 xl:px-14">
                        <div className="relative flex min-w-0 flex-col lg:min-h-[420px]">
                            <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-brand-accent/25 blur-3xl" />

                            <div className="relative flex min-w-0 h-full flex-col">
                                <h2 className="w-full max-w-full font-display text-[1.8rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-brand-surface break-words sm:max-w-2xl sm:text-4xl sm:leading-[1.04] sm:tracking-[-0.05em] lg:text-[3.2rem] lg:leading-[1.02]">
                                    Si querés ver cómo{' '}
                                    <span className="text-brand-primary">
                                        Pelito ordena tu barbería.
                                    </span>{' '}
                                    probalo gratis 2 semanas.
                                </h2>

                                <div className="mt-8 hidden lg:mt-auto lg:flex lg:pt-8">
                                    <a
                                        href={cta.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={ctaButtonClasses}
                                    >
                                        <IconBrandWhatsapp
                                            className="mr-2 h-5 w-5"
                                            stroke={2.2}
                                        />
                                        <span>{cta.label}</span>
                                        <IconArrowRight
                                            className="ml-2 h-4 w-4"
                                            stroke={2.3}
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex lg:h-full">
                            <div className="w-full overflow-hidden rounded-brand-xl bg-brand-surface/6 shadow-brand-card lg:h-full">
                                <div className="aspect-[1672/941] min-h-[280px] w-full sm:min-h-[340px] lg:h-full lg:min-h-[420px]">
                                    <img
                                        src="/images/cta-section.png"
                                        alt="Herramientas de barbería"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex lg:hidden">
                            <a
                                href={cta.href}
                                target="_blank"
                                rel="noreferrer"
                                className={ctaButtonClasses}
                            >
                                <IconBrandWhatsapp
                                    className="mr-2 h-5 w-5"
                                    stroke={2.2}
                                />
                                <span>{cta.label}</span>
                                <IconArrowRight
                                    className="ml-2 h-4 w-4"
                                    stroke={2.3}
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
