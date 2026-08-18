import PelitoLogo from '@/Components/PelitoLogo';
import { Link } from '@inertiajs/react';
import { IconArrowLeft } from '@tabler/icons-react';

function OrganicLoginBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 1600 900"
                preserveAspectRatio="none"
                className="h-full w-full text-brand-primary"
            >
                <path
                    fill="currentColor"
                    d="M1030 0C900 40 840 130 840 240C842 390 790 500 700 590C620 670 585 775 590 900H1600V0H1030Z"
                />
                <path
                    fill="currentColor"
                    d="M0 430C190 445 320 535 330 690C336 780 292 848 255 900H0V430Z"
                />
                <path
                    fill="currentColor"
                    d="M230 0C255 95 320 155 455 160C575 164 650 105 688 0H230Z"
                />
            </svg>
        </div>
    );
}

function OrganicRegisterBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 1600 900"
                preserveAspectRatio="none"
                className="h-full w-full text-brand-primary"
            >
                <path
                    fill="currentColor"
                    d="M650 0C716 62 762 145 748 240C729 371 774 446 888 514C1017 590 1088 712 1118 900H0V0H650Z"
                />
            </svg>
        </div>
    );
}

export default function GuestLayout({
    children,
    maxWidth = 'sm:max-w-md',
    organicBackground = false,
    registerBackground = false,
}) {
    const layoutClassName = organicBackground
        ? 'landing-theme relative isolate flex min-h-screen flex-col overflow-hidden bg-brand-bg px-5 pb-10 pt-36 sm:justify-center sm:px-8 sm:py-28 lg:px-12 lg:py-24'
        : registerBackground
          ? 'landing-theme relative isolate flex min-h-screen flex-col items-center overflow-hidden bg-brand-primary px-5 pb-10 pt-36 sm:px-8 sm:pb-14 sm:pt-36 lg:justify-center lg:bg-brand-bg lg:px-12 lg:py-16'
          : 'relative isolate flex min-h-screen flex-col items-center overflow-hidden bg-brand-bg px-4 py-10 sm:justify-center sm:py-14';

    return (
        <div className={layoutClassName}>
            {organicBackground ? (
                <OrganicLoginBackground />
            ) : registerBackground ? (
                <OrganicRegisterBackground />
            ) : (
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full overflow-hidden">
                    <div className="absolute left-1/2 top-[-140px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-brand-primary/14 blur-3xl" />
                    <div className="absolute right-[-100px] top-[160px] h-[260px] w-[260px] rounded-full bg-brand-primary-soft blur-3xl" />
                    <div className="absolute bottom-[20px] left-[-100px] h-[240px] w-[240px] rounded-full bg-brand-primary/10 blur-3xl" />
                </div>
            )}

            {organicBackground ? (
                <>
                    <Link
                        href="/"
                        aria-label="Ir al inicio de Estilus Barber"
                        className="absolute left-4 top-4 transition-opacity duration-200 hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-4 motion-reduce:transition-none sm:left-6 sm:top-6 lg:left-[30%] lg:top-[38%] lg:-translate-x-1/2 lg:-translate-y-1/2"
                    >
                        <img
                            src="/images/estilus-barber-logo.png"
                            alt="Estilus Barber"
                            width="752"
                            height="185"
                            className="h-auto w-[260px] sm:w-[360px] lg:w-[520px] xl:w-[600px]"
                        />
                    </Link>

                    <Link
                        href="/"
                        aria-label="Volver al sitio"
                        className="absolute left-4 top-[88px] inline-flex h-12 w-12 items-center justify-center text-brand-text transition-all duration-200 hover:-translate-x-1 hover:text-brand-link focus:outline-none focus-visible:rounded-brand-sm focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-4 motion-reduce:transform-none motion-reduce:transition-none sm:left-[400px] sm:top-8 lg:left-10 lg:top-8"
                    >
                        <IconArrowLeft
                            className="h-10 w-10 lg:h-12 lg:w-12"
                            stroke={2.2}
                        />
                    </Link>
                </>
            ) : registerBackground ? (
                <>
                    <Link
                        href="/"
                        aria-label="Ir al inicio de Estilus Barber"
                        className="absolute right-5 top-5 transition-opacity duration-200 hover:opacity-75 focus:outline-none focus-visible:rounded-brand-sm focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-4 motion-reduce:transition-none sm:right-8 sm:top-7 lg:right-10 lg:top-8"
                    >
                        <img
                            src="/images/estilus-barber-logo.png"
                            alt="Estilus Barber"
                            width="752"
                            height="185"
                            className="h-auto w-[190px] sm:w-[250px] lg:w-[300px]"
                        />
                    </Link>

                    <Link
                        href="/"
                        aria-label="Volver al sitio"
                        className="absolute left-4 top-[88px] inline-flex h-12 w-12 items-center justify-center text-brand-text transition-all duration-200 hover:-translate-x-1 hover:text-brand-link focus:outline-none focus-visible:rounded-brand-sm focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-4 motion-reduce:transform-none motion-reduce:transition-none sm:left-[400px] sm:top-8 lg:left-10 lg:top-8"
                    >
                        <IconArrowLeft
                            className="h-10 w-10 lg:h-12 lg:w-12"
                            stroke={2.2}
                        />
                    </Link>
                </>
            ) : (
                <>
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
                        <PelitoLogo
                            markClassName="h-10 w-10"
                            textClassName="text-[1.7rem]"
                        />
                    </div>
                </>
            )}

            <div
                className={
                    organicBackground
                        ? `relative mx-auto w-full ${maxWidth} lg:ml-auto lg:mr-[7vw] xl:mr-[10vw] 2xl:mr-[12vw]`
                        : registerBackground
                          ? `relative mx-auto w-full ${maxWidth}`
                        : `w-full ${maxWidth} overflow-hidden rounded-brand-xl border border-brand-border bg-brand-surface p-7 shadow-brand-floating sm:p-9`
                }
            >
                {children}
            </div>
        </div>
    );
}
