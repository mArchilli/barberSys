import BrandMark from '@/Components/BrandMark';
import { Link } from '@inertiajs/react';

export default function PelitoLogo({
    href = '/',
    markClassName = 'h-9 w-9',
    textClassName = 'text-[1.5rem]',
    className = '',
}) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-2.5 text-brand-text transition-colors duration-200 hover:text-brand-link ${className}`}
        >
            <BrandMark className={markClassName} />
            <span className={`font-display font-extrabold tracking-[-0.03em] ${textClassName}`}>
                Pelito
            </span>
        </Link>
    );
}
