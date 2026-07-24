const closingRows = [
    {
        label: 'Facturación total',
        value: '$2.480.000',
        tone: 'clear',
    },
    {
        label: 'Comisiones',
        value: 'Por calcular',
        tone: 'warning',
    },
    {
        label: 'Gastos',
        value: 'Faltan cargar',
        tone: 'warning',
    },
];

function ClosingRow({ label, value, tone }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-brand-border-subtle px-1 py-4 last:border-b-0 sm:gap-6 sm:px-2 sm:py-5">
            <dt className="text-[0.8rem] font-medium leading-5 text-brand-text-secondary sm:text-sm">
                {label}
            </dt>
            <dd
                className={
                    tone === 'warning'
                        ? 'rounded-[9px] border border-brand-warning/30 bg-brand-warning-soft px-2.5 py-1 text-right text-xs font-semibold leading-5 text-brand-text'
                        : 'flex items-center justify-end gap-2 text-right text-sm font-bold text-brand-text sm:text-base'
                }
            >
                {tone === 'clear' && (
                    <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full bg-brand-primary"
                    />
                )}
                {value}
            </dd>
        </div>
    );
}

function NotebookSheet() {
    return (
        <div
            aria-hidden="true"
            className="absolute bottom-24 left-[4%] top-10 z-0 w-[84%] rotate-[-1.5deg] overflow-hidden rounded-[24px_30px_22px_28px] border border-brand-border/80 bg-brand-surface-alt shadow-brand-card sm:bottom-28 sm:left-[6%] sm:top-12 sm:rotate-[-3deg] lg:bottom-24 lg:rotate-[-4deg]"
            style={{
                backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(78, 117, 165, 0.12) 32px)',
            }}
        >
            <span className="absolute bottom-0 left-8 top-0 w-px bg-brand-primary/20 sm:left-11" />
            <div className="ml-11 mt-16 max-w-[68%] rotate-[-1deg] text-[0.68rem] font-medium leading-7 text-brand-secondary/65 sm:ml-16 sm:mt-20 sm:text-xs">
                <p>48.000 + 32.000 + 27.500</p>
                <p className="line-through decoration-brand-primary decoration-2">
                    Comisión Martín 40%
                </p>
                <p>productos + alquiler + ...</p>
            </div>
        </div>
    );
}

function PaperNote({ children, className = '', tone = 'light' }) {
    const toneClass =
        tone === 'cyan'
            ? 'border-brand-primary/40 bg-brand-primary-soft text-brand-text'
            : 'border-brand-border bg-brand-surface text-brand-text';

    return (
        <p
            className={`absolute z-30 rounded-[16px_11px_18px_12px] border px-3 py-3 text-[0.68rem] font-semibold italic leading-[1.45] shadow-brand-card sm:px-4 sm:py-3.5 sm:text-xs ${toneClass} ${className}`}
        >
            {children}
        </p>
    );
}

function TransferTicket() {
    return (
        <aside
            aria-label="Duda sobre una transferencia recibida"
            className="absolute bottom-1 left-0 z-30 w-[54%] max-w-[235px] rotate-[-1.5deg] bg-brand-surface px-4 pb-7 pt-4 text-brand-text drop-shadow-[0_16px_22px_rgba(29,34,33,0.12)] sm:left-[2%] sm:rotate-[-3deg] sm:px-5 sm:pt-5"
            style={{
                clipPath:
                    'polygon(0 0, 100% 0, 100% 92%, 94% 100%, 88% 92%, 82% 100%, 76% 92%, 70% 100%, 64% 92%, 58% 100%, 52% 92%, 46% 100%, 40% 92%, 34% 100%, 28% 92%, 22% 100%, 16% 92%, 10% 100%, 4% 92%, 0 100%)',
            }}
        >
            <p className="border-b border-dashed border-brand-border pb-2 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand-secondary sm:text-[0.65rem]">
                Transferencia recibida
            </p>
            <p className="mt-3 text-[0.68rem] font-semibold leading-5 sm:text-sm">
                ¿De qué servicio era?
            </p>
        </aside>
    );
}

function MonthlyClosingScene() {
    return (
        <figure
            aria-labelledby="monthly-closing-title"
            aria-describedby="monthly-closing-caption"
            className="relative mx-auto w-full min-w-0 max-w-[760px] pb-32 pt-20 sm:px-5 sm:pb-36 sm:pt-24 lg:px-2 lg:pb-32 lg:pt-24 xl:px-8"
        >
            <NotebookSheet />

            <PaperNote
                tone="cyan"
                className="right-0 top-1 w-[47%] max-w-[215px] rotate-[1deg] sm:right-[1%] sm:top-3 sm:rotate-[2deg]"
            >
                ¿Cuánto hizo cada barbero?
            </PaperNote>

            <article
                aria-labelledby="monthly-closing-title"
                className="relative z-20 mx-auto w-[96%] max-w-[580px] rotate-[0.35deg] overflow-visible rounded-[28px_24px_32px_26px] border border-brand-nav-bg bg-brand-surface shadow-brand-floating sm:w-[88%] sm:rotate-[0.7deg] lg:w-[84%] lg:rotate-[1deg]"
            >
                <span
                    aria-hidden="true"
                    className="absolute -top-3 left-9 h-6 w-24 rotate-[-2deg] rounded-[4px] bg-brand-primary/35 backdrop-blur-[1px] sm:left-12 sm:w-28"
                />

                <header className="flex min-h-16 items-center justify-between rounded-t-[26px] bg-brand-nav-bg px-5 py-4 text-brand-surface sm:min-h-[72px] sm:px-7">
                    <p
                        id="monthly-closing-title"
                        className="text-sm font-bold uppercase tracking-[0.14em] text-brand-surface sm:text-base"
                    >
                        CIERRE DEL MES
                    </p>
                    <span
                        aria-hidden="true"
                        className="flex items-center gap-1.5"
                    >
                        <span className="h-2 w-2 rounded-full bg-brand-primary" />
                        <span className="h-2 w-2 rounded-full bg-brand-surface/35" />
                        <span className="h-2 w-2 rounded-full bg-brand-surface/20" />
                    </span>
                </header>

                <dl className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
                    {closingRows.map((row) => (
                        <ClosingRow key={row.label} {...row} />
                    ))}

                    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 rounded-[18px_14px_20px_16px] bg-brand-nav-bg px-4 py-4 text-brand-surface sm:mt-4 sm:px-5 sm:py-5">
                        <dt className="text-sm font-semibold leading-5 sm:text-base">
                            Ganancia real
                        </dt>
                        <dd className="font-display text-3xl font-extrabold leading-none text-brand-primary sm:text-4xl">
                            <span aria-hidden="true">¿?</span>
                            <span className="sr-only">Desconocida</span>
                        </dd>
                    </div>
                </dl>
            </article>

            <TransferTicket />

            <PaperNote className="bottom-5 right-0 w-[42%] max-w-[200px] rotate-[1deg] sm:bottom-8 sm:right-[1%] sm:rotate-[2deg]">
                Falta cargar el gasto de productos
            </PaperNote>

            <figcaption id="monthly-closing-caption" className="sr-only">
                Un cierre mensual incompleto entre anotaciones manuales,
                transferencias sin identificar y gastos pendientes.
            </figcaption>
        </figure>
    );
}

export default function PainPointSection() {
    return (
        <section
            id="pain-points"
            aria-labelledby="pain-points-heading"
            className="relative isolate overflow-hidden bg-brand-bg px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-32 xl:px-12 xl:py-36"
        >
            <div className="relative z-10 mx-auto w-full max-w-[1440px]">
                <div className="grid min-w-0 items-center gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:gap-20">
                    <div className="min-w-0 max-w-[38rem] lg:max-w-[31rem]">
                        <h2
                            id="pain-points-heading"
                            className="text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.98] text-brand-text lg:text-[clamp(3.75rem,5vw,4.75rem)]"
                        >
                            <span className="block text-brand-primary">
                                Facturaste todo el mes.
                            </span>
                            <span className="mt-1 block text-brand-text">
                                ¿Pero cuánto te quedo en el bolsillo?
                            </span>
                        </h2>

                        <p className="mt-7 max-w-[35rem] text-base leading-7 text-brand-text/70 sm:text-lg sm:leading-8">
                            Cuando los servicios, los pagos y las comisiones
                            están repartidos entre cuadernos, excel, notas y
                            memoria, cerrar los números se vuelve una
                            adivinanza.
                        </p>

                    </div>

                    <div className="min-w-0">
                        <MonthlyClosingScene />
                    </div>
                </div>
            </div>
        </section>
    );
}
