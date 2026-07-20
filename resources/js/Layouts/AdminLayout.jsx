import AdminNavbar from '@/Components/AdminNavbar';

export default function AdminLayout({
    header,
    children,
    headerContainerClassName = 'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8',
}) {
    const navbarContainerClassName = 'mx-auto max-w-[1720px] px-2 pt-4 sm:px-3 sm:pt-5 lg:px-4';

    return (
        <div className="panel-theme min-h-screen bg-brand-bg">
            <header className="sticky top-0 z-20 bg-brand-bg/95 backdrop-blur-sm">
                <div className={navbarContainerClassName}>
                    <AdminNavbar />
                </div>

                {header && (
                    <div className={headerContainerClassName}>
                        {header}
                    </div>
                )}
            </header>

            <main>{children}</main>
        </div>
    );
}
