import { IconArrowRight, IconBrandWhatsapp, IconCheck } from '@tabler/icons-react';

const highlights = [
    'Te mostramos cómo se registra un día real de trabajo.',
    'Revisamos comisiones, medios de pago y ganancia neta.',
    'Te recomendamos el plan según tu operación actual.',
];

export default function CTASection({
    cta = {
        label: 'Hablar por WhatsApp',
        href: 'https://wa.me/',
    },
}) {
    return (
        <section className="px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12">
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="overflow-hidden rounded-[28px] border border-brand-nav-bg bg-brand-nav-bg shadow-brand-floating">
                    <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:px-12 lg:py-12 xl:px-14">
                        <div className="relative">
                            <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-brand-primary/15 blur-3xl" />
                            <div className="relative">
                                <span className="inline-flex rounded-brand-pill bg-brand-surface/10 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-surface">
                                    Hablemos por WhatsApp
                                </span>
                                <h2 className="mt-5 max-w-2xl font-display text-3xl font-extrabold tracking-[-0.05em] text-brand-surface sm:text-4xl lg:text-[3.2rem] lg:leading-[1.02]">
                                    Si querés ver cómo Pelito ordena tu barbería,
                                    lo vemos juntos en una charla corta.
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-7 text-brand-text-on-dark sm:text-lg sm:leading-8">
                                    Escribinos y te mostramos el flujo real del
                                    sistema para que evalúes rápido si encaja con
                                    tu operación, sin vueltas ni formularios largos.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <a
                                        href={cta.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-[52px] items-center justify-center rounded-brand-pill bg-brand-primary px-7 text-sm font-bold text-brand-surface shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-surface focus-visible:ring-offset-2 focus-visible:ring-offset-brand-nav-bg motion-reduce:transform-none motion-reduce:transition-none"
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
                                    <div className="inline-flex min-h-[52px] items-center justify-center rounded-brand-pill border border-brand-surface/12 bg-brand-surface/6 px-6 text-sm font-semibold text-brand-text-on-dark">
                                        Respuesta directa, sin compromiso
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="w-full rounded-brand-xl border border-brand-surface/10 bg-brand-surface/6 p-6 backdrop-blur-sm sm:p-7">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                                        <IconBrandWhatsapp
                                            className="h-5 w-5"
                                            stroke={2.2}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-on-dark">
                                            Qué resolvemos
                                        </p>
                                        <p className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-brand-surface">
                                            Una charla útil desde el primer mensaje
                                        </p>
                                    </div>
                                </div>

                                <ul className="mt-7 space-y-4">
                                    {highlights.map((highlight) => (
                                        <li
                                            key={highlight}
                                            className="flex items-start gap-3 rounded-brand-lg border border-brand-surface/10 bg-brand-surface/6 px-4 py-3"
                                        >
                                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                                                <IconCheck
                                                    className="h-3.5 w-3.5"
                                                    stroke={2.6}
                                                />
                                            </span>
                                            <span className="text-sm leading-6 text-brand-surface sm:text-[0.95rem]">
                                                {highlight}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-7 rounded-brand-lg border border-brand-primary/25 bg-brand-primary/10 px-4 py-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
                                        Ideal si hoy
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-brand-surface">
                                        Seguís resolviendo números por WhatsApp,
                                        cuadernos o planillas y querés pasar a un
                                        sistema simple sin frenar la operación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
