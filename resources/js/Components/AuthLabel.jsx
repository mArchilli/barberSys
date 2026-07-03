export default function AuthLabel({ value, className = '', children, ...props }) {
    return (
        <label
            {...props}
            className={`mb-1.5 block text-sm font-semibold text-brand-text ${className}`}
        >
            {value ? value : children}
        </label>
    );
}
