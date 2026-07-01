import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-brand-bg pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-brand-text-secondary" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-xl border border-brand-border bg-brand-surface px-6 py-4 shadow-card sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
