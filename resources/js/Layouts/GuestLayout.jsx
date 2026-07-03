import PelitoLogo from '@/Components/PelitoLogo';
import { Link } from '@inertiajs/react';
import { IconArrowLeft } from '@tabler/icons-react';

export default function GuestLayout({ children, maxWidth = 'sm:max-w-md' }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-brand-bg px-4 py-10 sm:justify-center sm:py-14">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full overflow-hidden">
                <div className="absolute left-1/2 top-[-140px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-brand-primary/14 blur-3xl" />
                <div className="absolute right-[-100px] top-[160px] h-[260px] w-[260px] rounded-full bg-brand-primary-soft blur-3xl" />
                <div className="absolute bottom-[20px] left-[-100px] h-[240px] w-[240px] rounded-full bg-brand-primary/10 blur-3xl" />
            </div>

            <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                <Link
                    href="/"
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-brand-pill border border-brand-border bg-brand-surface px-4 text-sm font-semibold text-brand-text-secondary shadow-brand-card transition-colors duration-200 hover:border-brand-primary-muted hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                >
                    <IconArrowLeft className="h-4 w-4" stroke={2.2} />
                    <span>Volver al sitio</span>
                </Link>
            </div>

            <div className="mb-8">
                <PelitoLogo markClassName="h-10 w-10" textClassName="text-[1.7rem]" />
            </div>

            <div
                className={`w-full ${maxWidth} overflow-hidden rounded-brand-xl border border-brand-border bg-brand-surface p-7 shadow-brand-floating sm:p-9`}
            >
                {children}
            </div>
        </div>
    );
}
