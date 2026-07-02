import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

const faqs = [
    {
        question: '¿Pelito reemplaza mi sistema de turnos?',
        answer:
            'No. Pelito no es un turnero. Podés seguir usando WhatsApp, agenda o el sistema de turnos que ya tengas. Pelito se enfoca en la gestión interna, productividad, facturación, gastos y rentabilidad.',
    },
    {
        question: '¿Puedo ver los números desde mi casa?',
        answer:
            'Sí. Podés entrar desde el celular o la compu y revisar facturación, productividad, medios de pago y ganancia neta sin estar físicamente en la barbería.',
    },
    {
        question: '¿Cómo se pagan las comisiones?',
        answer:
            'Pelito te ayuda a registrar servicios, montos y productividad para que calcular comisiones deje de depender de cuentas manuales, cuadernos o planillas sueltas.',
    },
    {
        question: '¿Sirve para una sola barbería?',
        answer:
            'Sí. El plan Base está pensado justamente para una barbería que quiere ordenar sus números y empezar a medir mejor el negocio.',
    },
    {
        question: '¿Puedo administrar varias sucursales?',
        answer:
            'Sí. Desde los planes orientados a crecimiento podés consolidar la información entre barberías, comparar rendimiento y mirar el neto por sucursal.',
    },
    {
        question: '¿Puedo registrar efectivo, transferencia y tarjeta?',
        answer:
            'Sí. Pelito contempla los distintos medios de pago para que entiendas cómo se mueve la caja y qué peso tiene cada canal en la facturación.',
    },
    {
        question: '¿Puedo calcular la ganancia neta?',
        answer:
            'Sí. Además de ver cuánto entra, la idea es que puedas registrar sueldos y gastos para entender cuánto queda realmente en el negocio.',
    },
    {
        question: '¿Necesito instalar algo?',
        answer:
            'No hace falta una instalación compleja. La propuesta es que puedas usar Pelito de forma simple, con acceso desde tus dispositivos habituales.',
    },
];

function FAQItem({ question, answer, isOpen, onToggle }) {
    return (
        <article className="overflow-hidden rounded-[18px] border border-brand-border bg-brand-surface shadow-brand-card">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
            >
                <span className="pr-2 text-base font-semibold leading-7 text-brand-text sm:text-lg">
                    {question}
                </span>
                <span
                    className={[
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 motion-reduce:transition-none',
                        isOpen
                            ? 'border-brand-primary bg-brand-primary-soft text-brand-primary'
                            : 'border-brand-border bg-brand-surface-alt text-brand-text-secondary',
                    ].join(' ')}
                >
                    <IconChevronDown
                        className={[
                            'h-5 w-5 transition-transform duration-200 motion-reduce:transition-none',
                            isOpen ? 'rotate-180' : '',
                        ].join(' ')}
                        stroke={2.2}
                    />
                </span>
            </button>

            <div
                className={[
                    'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                ].join(' ')}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-brand-border-subtle px-5 pb-5 pt-4 sm:px-6">
                        <p className="max-w-3xl text-sm leading-7 text-brand-text-secondary sm:text-base">
                            {answer}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function FAQSection({
    cta = {
        label: 'Hablar por WhatsApp',
        href: 'https://wa.me/',
    },
}) {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section
            id="faq"
            className="px-6 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28 xl:px-12"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex rounded-brand-pill bg-brand-primary-tint px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-primary-soft-text">
                        Preguntas frecuentes
                    </span>
                    <h2 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.05em] text-brand-text sm:text-4xl lg:text-5xl">
                        Lo que más preguntan antes de empezar
                    </h2>
                    <p className="mt-5 text-base leading-7 text-brand-text-secondary sm:text-lg sm:leading-8">
                        Si todavía estás evaluando si Pelito encaja con tu forma de
                        trabajar, acá tenés respuestas claras a las dudas más comunes.
                    </p>
                </div>

                <div className="mx-auto mt-14 max-w-[860px] space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={faq.question}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onToggle={() =>
                                setOpenIndex((current) =>
                                    current === index ? -1 : index,
                                )
                            }
                        />
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <div className="max-w-2xl rounded-brand-xl border border-brand-border bg-brand-surface px-6 py-6 text-center shadow-brand-card sm:px-8">
                        <p className="text-sm leading-7 text-brand-text-secondary sm:text-base">
                            Si querés resolver tu caso puntual, te lo mostramos por
                            WhatsApp y vemos juntos qué plan te conviene.
                        </p>
                        <div className="mt-5">
                            <a
                                href={cta.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-[48px] items-center justify-center rounded-brand-pill bg-brand-primary px-7 text-sm font-bold text-brand-surface shadow-brand-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                            >
                                {cta.label}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
