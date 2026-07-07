const options = [
    { value: 'month', label: 'Mes' },
    { value: 'day', label: 'Día' },
];

export default function PeriodModeToggle({ mode, onChange }) {
    return (
        <div
            role="tablist"
            aria-label="Ver por mes o por día"
            className="flex w-full items-center gap-1 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card sm:w-auto"
        >
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={mode === option.value}
                    onClick={() => onChange(option.value)}
                    className={`h-11 flex-1 rounded-brand-pill px-4 text-sm font-semibold transition sm:flex-none ${
                        mode === option.value
                            ? 'bg-brand-primary text-brand-on-primary'
                            : 'text-brand-text-secondary hover:bg-brand-primary-soft hover:text-brand-link'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
