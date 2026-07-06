export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-brand-primary px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-on-primary transition duration-150 ease-in-out hover:bg-brand-primary-hover focus:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 active:bg-brand-primary-hover ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
