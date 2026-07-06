export default function BrandMark({ className = 'h-8 w-8' }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="9" cy="9" r="3.25" className="fill-brand-primary" />
            <circle cx="9" cy="23" r="3.25" className="fill-brand-primary" />
            <circle cx="23" cy="9" r="3.25" className="fill-brand-primary" />
            <circle cx="23" cy="23" r="3.25" className="fill-brand-primary" />
            <path
                d="M12 12L20 20"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                className="text-brand-link"
            />
            <path
                d="M20 12L12 20"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                className="text-brand-link"
            />
        </svg>
    );
}
