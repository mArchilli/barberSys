import { Link } from '@inertiajs/react';

export default function SidebarLink({ active = false, collapsed = false, icon: Icon, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            title={collapsed ? children : undefined}
            className={
                `flex min-h-[44px] items-center gap-3 rounded-brand-sm text-sm font-medium transition duration-150 ease-in-out focus:outline-none ${collapsed ? 'justify-center px-0' : 'px-3'} ` +
                (active
                    ? 'bg-brand-primary/15 text-brand-nav-active'
                    : 'text-brand-nav-text hover:bg-brand-surface/10 hover:text-brand-nav-active') +
                ' ' + className
            }
        >
            {Icon && <Icon size={20} stroke={1.75} className="shrink-0" />}
            <span className={collapsed ? 'sr-only' : 'truncate'}>{children}</span>
        </Link>
    );
}
