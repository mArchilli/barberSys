import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-brand-primary text-brand-nav-active focus:border-brand-primary'
                    : 'border-transparent text-brand-nav-text hover:border-brand-nav-text/40 hover:text-brand-nav-active focus:border-brand-nav-text/40 focus:text-brand-nav-active') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
