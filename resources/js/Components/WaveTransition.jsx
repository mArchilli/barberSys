export default function WaveTransition({
    fromClassName,
    toClassName,
    flip = false,
}) {
    return (
        <div
            aria-hidden="true"
            className={`relative -mb-px h-20 overflow-hidden sm:h-28 lg:h-32 ${toClassName}`}
        >
            <svg
                viewBox="0 0 1440 160"
                preserveAspectRatio="none"
                focusable="false"
                className={[
                    'block h-full w-full',
                    flip ? '-scale-x-100' : '',
                ].join(' ')}
            >
                <path
                    fill="currentColor"
                    className={fromClassName}
                    d="M0 0H1440V74C1320 30 1210 34 1090 72C970 110 840 118 720 78C600 38 490 24 360 68C230 112 110 114 0 80V0Z"
                />
            </svg>
        </div>
    );
}
