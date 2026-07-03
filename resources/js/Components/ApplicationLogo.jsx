export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            aria-hidden="true"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="9" cy="9" r="3.25" fill="currentColor" />
            <circle cx="9" cy="23" r="3.25" fill="currentColor" />
            <circle cx="23" cy="9" r="3.25" fill="currentColor" />
            <circle cx="23" cy="23" r="3.25" fill="currentColor" />
            <path d="M12 12L20 20" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" fill="none" />
            <path d="M20 12L12 20" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" fill="none" />
        </svg>
    );
}
