import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-3 pe-4 ps-3 ${
                active
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-nav-active focus:border-brand-primary focus:bg-brand-primary/20 focus:text-brand-nav-active'
                    : 'border-transparent text-brand-nav-text hover:border-brand-nav-text/30 hover:bg-brand-surface/10 hover:text-brand-nav-active focus:border-brand-nav-text/30 focus:bg-brand-surface/10 focus:text-brand-nav-active'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
