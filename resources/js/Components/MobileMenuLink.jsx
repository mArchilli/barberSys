import { Link } from '@inertiajs/react';

export default function MobileMenuLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'block w-full rounded-brand-pill px-6 py-3 text-center text-lg font-semibold transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'text-brand-nav-active'
                    : 'text-brand-nav-text hover:text-brand-nav-active') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
