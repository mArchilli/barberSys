import DashNavbar from '@/Components/DashNavbar';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({
    header,
    children,
    headerContainerClassName = 'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8',
    headerClassName,
}) {
    const { auth } = usePage().props;
    const showDashNavbar = auth.user.role === 'owner';
    const shouldRenderHeader = Boolean(header) || showDashNavbar;
    const ownerNavbarContainerClassName = 'mx-auto max-w-[1720px] px-2 pt-4 sm:px-3 sm:pt-5 lg:px-4';

    return (
        <div className="panel-theme min-h-screen bg-brand-bg">
            {shouldRenderHeader && (
                <header className={headerClassName ?? 'sticky top-0 z-20 bg-brand-bg/95 backdrop-blur-sm'}>
                    {showDashNavbar && (
                        <div className={ownerNavbarContainerClassName}>
                            <DashNavbar />
                        </div>
                    )}

                    {header && (
                        <div className={headerContainerClassName}>
                            {header}
                        </div>
                    )}
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
