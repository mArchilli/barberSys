export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-brand-pill border border-brand-border bg-brand-surface px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-text shadow-sm transition duration-150 ease-in-out hover:bg-brand-surface-alt focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
